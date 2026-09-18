using TMS.Domain;
namespace TMS.Application.Tasks;
public sealed record TaskRequest(
    string Title, string Description = "", string UserId = "", int ProjectId = 0,
    int ModuleId = 0, TaskState StatusId = TaskState.Open,
    TaskPriority PriorityId = TaskPriority.P2, decimal SP = 0,
    DateTime? StartDate = null, DateTime? EndDate = null, string Reason = "", bool IsActive = true,
    int Id = 0)
{
    public TaskItem ToDomain(int clientId)
    {
        if (Id < 0)
            throw new DomainValidationException("Task ID cannot be negative.");
        return new TaskItem(clientId, Title, Description, UserId, ProjectId, ModuleId,
            StatusId, PriorityId, SP, StartDate, EndDate, Reason, IsActive)
            { Id = Id };
    }
}

