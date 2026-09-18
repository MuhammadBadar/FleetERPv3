using System.Data.Common;
using System.Globalization;
using TMS.Domain;
namespace TMS.Infrastructure.Tasks;
internal static class TaskRowMapper
{
    internal static TaskItem Read(DbDataReader reader)
    {
        var fields = Enumerable.Range(0, reader.FieldCount)
            .ToDictionary(reader.GetName, i => i, StringComparer.OrdinalIgnoreCase);
        object? Value(string name, bool required = true)
        {
            if (!fields.TryGetValue(name, out var ordinal))
            {
                if (required) throw new InvalidOperationException("TMS_vw_Task must return column " + name + ".");
                return null;
            }
            return reader.IsDBNull(ordinal) ? null : reader.GetValue(ordinal);
        }
        int Number(string name, bool required = true) => Convert.ToInt32(Value(name, required), CultureInfo.InvariantCulture);
        string Text(string name) => Convert.ToString(Value(name), CultureInfo.InvariantCulture) ?? "";
        DateTime? Date(string name, bool required = false)
        {
            var value = Value(name, required);
            return value is null ? null : Convert.ToDateTime(value, CultureInfo.InvariantCulture);
        }
        DateTime Utc(string name) => DateTime.SpecifyKind(
            Date(name, true) ?? throw new InvalidOperationException(name + " cannot be NULL."), DateTimeKind.Utc);
        return new TaskItem(Number("ClientId"), Text("Title"), Text("Description"), Text("UserId"),
            Number("ProjectId"), Number("ModuleId"), (TaskState)Number("StatusId"),
            (TaskPriority)Number("PriorityId"), Convert.ToDecimal(Value("SP"), CultureInfo.InvariantCulture),
            Date("StartDate"), Date("EndDate"), Text("Reason"), Convert.ToBoolean(Value("IsActive"), CultureInfo.InvariantCulture))
        {
            Id = Number("Id"), CreatedOn = Utc("CreatedOn"), ModifiedOn = Date("ModifiedOn", true) is { } modified
                ? DateTime.SpecifyKind(modified, DateTimeKind.Utc) : Utc("CreatedOn")
        };
    }
}

