using System.Data;
using System.Globalization;
using MySqlConnector;
using TMS.Domain;
namespace TMS.Infrastructure.Tasks;

// Procedure names and parameter names match the existing, manually created database.
internal static class TaskProcedureCommands
{
    internal static string BuildWhereClause(int clientId, int? id = null)
    {
        if (clientId <= 0 || (id.HasValue && id.Value <= 0))
            throw new DomainValidationException("Client and task IDs must be positive.");
        // The legacy procedure executes this text. Never put user-supplied strings here.
        var clause = "WHERE ClientId = " + clientId.ToString(CultureInfo.InvariantCulture);
        if (id.HasValue) clause += " AND Id = " + id.Value.ToString(CultureInfo.InvariantCulture);
        return clause + " ORDER BY PriorityId, Id DESC";
    }

    internal static MySqlCommand Search(MySqlConnection connection, int clientId, int? id = null)
    {
        var command = new MySqlCommand("TMS_Search_Tasks", connection) { CommandType = CommandType.StoredProcedure };
        command.Parameters.Add("whereClause", MySqlDbType.VarChar, 5000).Value = BuildWhereClause(clientId, id);
        return command;
    }

    internal static MySqlCommand Manage(MySqlConnection connection, TaskItem task, string operation)
    {
        if ((operation == "Insert" && task.Id != 0) || (operation != "Insert" && task.Id <= 0))
            throw new DomainValidationException("Insert requires Id=0; other operations require a positive task ID.");
        if (operation is not ("Insert" or "Update" or "Delete"))
            throw new ArgumentOutOfRangeException(nameof(operation));
        var cmd = new MySqlCommand("TMS_Manage_Task", connection) { CommandType = CommandType.StoredProcedure };
        cmd.Parameters.Add("prm_id", MySqlDbType.Int32).Value = task.Id;
        cmd.Parameters.Add("prm_clientId", MySqlDbType.Int32).Value = task.ClientId;
        cmd.Parameters.Add("prm_userId", MySqlDbType.VarChar, 255).Value = task.UserId;
        cmd.Parameters.Add("prm_moduleId", MySqlDbType.Int32).Value = task.ModuleId;
        cmd.Parameters.Add("prm_projectId", MySqlDbType.Int32).Value = task.ProjectId;
        cmd.Parameters.Add("prm_statusId", MySqlDbType.Int32).Value = (int)task.StatusId;
        cmd.Parameters.Add("prm_priorityId", MySqlDbType.Int32).Value = (int)task.PriorityId;
        cmd.Parameters.Add("prm_title", MySqlDbType.VarChar, 1000).Value = task.Title;
        var estimate = cmd.Parameters.Add("prm_sP", MySqlDbType.Decimal);
        estimate.Precision = 9; estimate.Scale = 2; estimate.Value = task.SP;
        cmd.Parameters.Add("prm_description", MySqlDbType.LongText).Value = task.Description;
        cmd.Parameters.Add("prm_reason", MySqlDbType.LongText).Value = task.Reason;
        cmd.Parameters.Add("prm_createdOn", MySqlDbType.DateTime).Value = task.CreatedOn;
        cmd.Parameters.Add("prm_startDate", MySqlDbType.DateTime).Value = (object?)task.StartDate ?? DBNull.Value;
        cmd.Parameters.Add("prm_modifiedOn", MySqlDbType.DateTime).Value = task.ModifiedOn;
        cmd.Parameters.Add("prm_endDate", MySqlDbType.DateTime).Value = (object?)task.EndDate ?? DBNull.Value;
        cmd.Parameters.Add("prm_isActive", MySqlDbType.Byte).Value = task.IsActive;
        cmd.Parameters.Add("prm_filter", MySqlDbType.VarChar, 50).Value = operation;
        return cmd;
    }
}

