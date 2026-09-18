using System.Text.Json;
using MySqlConnector;
using TMS.Application.Tasks;
using TMS.Infrastructure.Tasks;

var root = Directory.GetCurrentDirectory();
using var config = JsonDocument.Parse(File.ReadAllText(Path.Combine(root, "src", "TMS.Api", "appsettings.json")));
var connectionString = config.RootElement.GetProperty("ConnectionStrings").GetProperty("Tms").GetString();
var secretsPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
    "Microsoft", "UserSecrets", "tms-clean-local-development", "secrets.json");
if (File.Exists(secretsPath))
{
    using var secrets = JsonDocument.Parse(File.ReadAllText(secretsPath));
    if (secrets.RootElement.TryGetProperty("ConnectionStrings:Tms", out var saved)) connectionString = saved.GetString();
}
connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__Tms") ?? connectionString;
if (string.IsNullOrWhiteSpace(connectionString)) throw new InvalidOperationException("Configure ConnectionStrings__Tms.");
try
{
    var schemaConnection = new MySqlConnectionStringBuilder(connectionString) { AllowUserVariables = true };
    await using var connection = new MySqlConnection(schemaConnection.ConnectionString);
    await connection.OpenAsync();
    Console.WriteLine("Connected to database: " + connection.Database);
    // Verify the actual table exists before applying any routine/view changes.
    await using (var check = new MySqlCommand("SELECT Id, ClientId, Title, Description, UserId, ProjectId, ModuleId, StatusId, PriorityId, SP, StartDate, EndDate, Reason, IsActive, CreatedOn, ModifiedOn FROM tasks LIMIT 0", connection))
    await using (var reader = await check.ExecuteReaderAsync()) { }

    if (args.Contains("--apply-schema"))
    {
        var backup = Path.Combine(root, ".database-backups", DateTime.UtcNow.ToString("yyyyMMdd-HHmmss") + "-" + Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(backup);
        foreach (var item in new[] { ("PROCEDURE", "TMS_Manage_Task"), ("PROCEDURE", "TMS_Search_Tasks"), ("VIEW", "TMS_vw_Task") })
        {
            try
            {
                await using var show = new MySqlCommand("SHOW CREATE " + item.Item1 + " " + item.Item2, connection);
                await using var reader = await show.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    var definition = reader.GetString(item.Item1 == "VIEW" ? 1 : 2);
                    await File.WriteAllTextAsync(Path.Combine(backup, item.Item2 + ".sql"), "DELIMITER $$\n" + definition + "$$\nDELIMITER ;\n");
                }
            }
            catch (MySqlException ex) when (ex.Number is 1146 or 1305) { }
        }
        Console.WriteLine("Saved existing definitions: " + backup);
        var sql = File.ReadAllLines(Path.Combine(root, "database", "002_tasks_view_and_procedures.sql"));
        var script = string.Join("\n", sql.Where(line => !line.StartsWith("DELIMITER", StringComparison.OrdinalIgnoreCase)));
        foreach (var statement in script.Split("$$", StringSplitOptions.RemoveEmptyEntries))
        {
            if (string.IsNullOrWhiteSpace(statement)) continue;
            await using var command = new MySqlCommand(statement, connection);
            await command.ExecuteNonQueryAsync();
        }
        Console.WriteLine("PASS: applied view and stored procedures for existing tasks table.");
    }

    var repository = new MySqlTaskRepository(connectionString);
    var tasks = await repository.ListAsync(1, default);
    Console.WriteLine("PASS: search procedure returned " + tasks.Count + " mapped rows for client 1.");
    if (args.Contains("--verify-write"))
    {
        var service = new TaskService(repository);
        var start = new DateTime(2026, 9, 17, 10, 15, 30);
        var request = new TaskRequest("TMS verification " + Guid.NewGuid().ToString("N"),
            Description: "Temporary integration verification", SP: 1.25m, StartDate: start, EndDate: start.AddHours(1));
        var created = await service.CreateAsync(1, request, default);
        try
        {
            var selected = await service.GetAsync(1, created.Id, default);
            if (created.Id <= 0 || selected?.Title != request.Title || selected.SP != 1.25m ||
                selected.StartDate != start || selected.EndDate != start.AddHours(1))
                throw new InvalidOperationException("Inserted task did not round-trip correctly.");
            if (await service.GetAsync(2, created.Id, default) is not null)
                throw new InvalidOperationException("Cross-client read was not isolated.");
            var updated = await service.UpdateAsync(1, created.Id, request with { Title = request.Title + " updated", SP = 2.75m }, default);
            var reloaded = await service.GetAsync(1, created.Id, default);
            if (updated is null || reloaded?.SP != 2.75m || reloaded.CreatedOn != selected.CreatedOn)
                throw new InvalidOperationException("Update did not preserve fields correctly.");
            Console.WriteLine("PASS: live insert, generated ID, select, dates, decimal, update, and client isolation.");
        }
        finally
        {
            if (!await service.DeleteAsync(1, created.Id, default)) throw new InvalidOperationException("Could not remove verification task " + created.Id);
            Console.WriteLine("PASS: verification task deleted.");
        }
    }
    return 0;
}
catch (Exception ex)
{
    Console.Error.WriteLine("Database check failed: " + ex.Message);
    return 1;
}
