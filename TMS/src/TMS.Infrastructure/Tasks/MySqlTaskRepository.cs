using MySqlConnector;
using TMS.Application.Common;
using TMS.Application.Tasks;
using TMS.Domain;
namespace TMS.Infrastructure.Tasks;

public sealed class MySqlTaskRepository(string connectionString) : ITaskRepository
{
    private async Task<MySqlConnection> OpenAsync(CancellationToken ct)
    {
        var connection = new MySqlConnection(connectionString);
        try { await connection.OpenAsync(ct); return connection; }
        catch (MySqlException ex)
        {
            await connection.DisposeAsync();
            throw new RepositoryUnavailableException("Cannot connect to the TMS database. Check ConnectionStrings:Tms and MySQL access.", ex);
        }
        catch { await connection.DisposeAsync(); throw; }
    }
    public async Task<IReadOnlyList<TaskItem>> ListAsync(int clientId, CancellationToken ct)
    {
        await using var con = await OpenAsync(ct);
        await using var command = TaskProcedureCommands.Search(con, clientId);
        await using var reader = await command.ExecuteReaderAsync(ct);
        var result = new List<TaskItem>();
        while (await reader.ReadAsync(ct)) result.Add(TaskRowMapper.Read(reader));
        return result;
    }
    public async Task<TaskItem?> GetAsync(int clientId, int id, CancellationToken ct)
    {
        await using var con = await OpenAsync(ct);
        return await GetAsync(con, clientId, id, ct);
    }
    private static async Task<TaskItem?> GetAsync(MySqlConnection con, int clientId, int id, CancellationToken ct)
    {
        await using var command = TaskProcedureCommands.Search(con, clientId, id);
        await using var reader = await command.ExecuteReaderAsync(ct);
        return await reader.ReadAsync(ct) ? TaskRowMapper.Read(reader) : null;
    }
    public async Task<TaskItem> AddAsync(TaskItem task, CancellationToken ct)
    {
        // Validate the exact procedure contract before opening a connection.
        await using var con = new MySqlConnection(connectionString);
        await using var command = TaskProcedureCommands.Manage(con, task, "Insert");
        try
        {
            await con.OpenAsync(ct);
            var result = await command.ExecuteScalarAsync(ct);
            var id = Convert.ToInt32(result);
            if (id <= 0) throw new InvalidOperationException("TMS_Manage_Task must return the generated ID. Apply the matching SQL script.");
            return task with { Id = id };
        }
        catch (MySqlException ex) when (ex.Number == 1062)
        { throw new RepositoryConflictException("The database rejected a duplicate task key.", ex); }
        catch (MySqlException ex) when (con.State != System.Data.ConnectionState.Open)
        { throw new RepositoryUnavailableException("Cannot connect to the TMS database. Check ConnectionStrings:Tms and MySQL access.", ex); }
    }
    public async Task<bool> UpdateAsync(TaskItem task, CancellationToken ct)
    {
        await using var con = await OpenAsync(ct);
        await using var command = TaskProcedureCommands.Manage(con, task, "Update");
        // Do not rely solely on affected-row counts: an unchanged update can report zero.
        if (await GetAsync(con, task.ClientId, task.Id, ct) is null) return false;
        await command.ExecuteScalarAsync(ct);
        return await GetAsync(con, task.ClientId, task.Id, ct) is not null;
    }
    public async Task<bool> DeleteAsync(int clientId, int id, CancellationToken ct)
    {
        await using var con = await OpenAsync(ct);
        var existing = await GetAsync(con, clientId, id, ct);
        if (existing is null) return false;
        await using var command = TaskProcedureCommands.Manage(con, existing, "Delete");
        return Convert.ToInt32(await command.ExecuteScalarAsync(ct)) > 0;
    }
}

