using System.Data;
using MySqlConnector;
using TMS.Application.Tasks;
using TMS.Domain;
using TMS.Infrastructure;
using TMS.Infrastructure.Tasks;
using Xunit;
namespace TMS.Tests;
public sealed class StoredProcedureTests
{
    [Fact]
    public void InsertBindsTasksSchemaWithDecimalDatesAndAutomaticId()
    {
        using var con = new MySqlConnection();
        var start = new DateTime(2026, 9, 17, 10, 15, 30);
        var task = new TaskRequest("Don't concatenate ' SQL --", SP: 1.25m, StartDate: start).ToDomain(1);
        using var command = TaskProcedureCommands.Manage(con, task, "Insert");
        Assert.Equal(CommandType.StoredProcedure, command.CommandType);
        Assert.Equal("TMS_Manage_Task", command.CommandText);
        Assert.Equal(new[] { "prm_id", "prm_clientId", "prm_userId", "prm_moduleId", "prm_projectId",
            "prm_statusId", "prm_priorityId", "prm_title", "prm_sP", "prm_description", "prm_reason",
            "prm_createdOn", "prm_startDate", "prm_modifiedOn", "prm_endDate", "prm_isActive", "prm_filter" },
            command.Parameters.Cast<MySqlParameter>().Select(p => p.ParameterName).ToArray());
        Assert.Equal(task.Title, command.Parameters["prm_title"].Value);
        Assert.Equal(0, command.Parameters["prm_id"].Value);
        Assert.Equal(MySqlDbType.Decimal, command.Parameters["prm_sP"].MySqlDbType);
        Assert.Equal(1.25m, command.Parameters["prm_sP"].Value);
        Assert.Equal(start, command.Parameters["prm_startDate"].Value);
        Assert.Equal(DBNull.Value, command.Parameters["prm_endDate"].Value);
    }
    [Fact]
    public void SearchBuildsOnlyNumericClientScopedFilters()
    {
        using var con = new MySqlConnection();
        using var command = TaskProcedureCommands.Search(con, 12, 1001);
        Assert.Equal("TMS_Search_Tasks", command.CommandText);
        Assert.Equal("WHERE ClientId = 12 AND Id = 1001 ORDER BY PriorityId, Id DESC", command.Parameters["whereClause"].Value);
        Assert.Throws<DomainValidationException>(() => TaskProcedureCommands.Search(con, 0));
        Assert.Throws<DomainValidationException>(() => TaskProcedureCommands.Search(con, 1, -1));
    }
    [Fact]
    public async Task GeneratedIdentityAndDatesSurviveUpdates()
    {
        var service = new TaskService(new InMemoryTaskRepository());
        await Assert.ThrowsAsync<DomainValidationException>(() => service.CreateAsync(1, new TaskRequest("Manual ID", Id: 4), default));
        var start = new DateTime(2026, 9, 17, 10, 15, 30);
        var created = await service.CreateAsync(1, new TaskRequest("First", StartDate: start, SP: 1.25m), default);
        Assert.True(created.Id > 0);
        var updated = await service.UpdateAsync(1, created.Id,
            new TaskRequest("Updated", StartDate: start, EndDate: start.AddHours(1)), default);
        Assert.NotNull(updated);
        Assert.Equal(created.CreatedOn, updated.CreatedOn);
        Assert.Equal(start, updated.StartDate);
        Assert.Equal(start.AddHours(1), updated.EndDate);
    }
    [Fact]
    public void InvalidIdAndExcessDecimalPrecisionAreRejected()
    {
        using var con = new MySqlConnection();
        var task = new TaskRequest("Task").ToDomain(1);
        Assert.Throws<DomainValidationException>(() => TaskProcedureCommands.Manage(con, task with { Id = 3 }, "Insert"));
        Assert.Throws<DomainValidationException>(() => TaskProcedureCommands.Manage(con, task, "Update"));
        Assert.Throws<DomainValidationException>(() => new TaskRequest("Task", SP: 1.234m).ToDomain(1));
    }
    [Fact]
    public void MapsExactTasksColumnsWithoutAuditUserIds()
    {
        using var table = new DataTable();
        foreach (var name in new[] { "Id", "ClientId", "ProjectId", "ModuleId", "StatusId", "PriorityId" })
            table.Columns.Add(name, typeof(int));
        foreach (var name in new[] { "Title", "Description", "UserId", "Reason" })
            table.Columns.Add(name, typeof(string));
        table.Columns.Add("SP", typeof(decimal));
        table.Columns.Add("IsActive", typeof(bool));
        foreach (var name in new[] { "CreatedOn", "ModifiedOn", "StartDate", "EndDate" })
            table.Columns.Add(name, typeof(DateTime));
        var row = table.NewRow();
        row["Id"] = 1001; row["ClientId"] = 1; row["ProjectId"] = 0; row["ModuleId"] = 0;
        row["StatusId"] = 1107001; row["PriorityId"] = 1108003;
        row["Title"] = "Task"; row["SP"] = 1.25m; row["IsActive"] = true;
        row["CreatedOn"] = row["ModifiedOn"] = new DateTime(2026, 9, 17);
        row["StartDate"] = new DateTime(2026, 9, 18, 10, 0, 0);
        table.Rows.Add(row);
        using var reader = table.CreateDataReader();
        Assert.True(reader.Read());
        var mapped = TaskRowMapper.Read(reader);
        Assert.Equal(1001, mapped.Id);
        Assert.Equal(1.25m, mapped.SP);
        Assert.Equal(new DateTime(2026, 9, 18, 10, 0, 0), mapped.StartDate);
        Assert.Null(mapped.EndDate);
    }
}
