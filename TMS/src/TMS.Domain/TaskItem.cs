namespace TMS.Domain;

public enum TaskState { Open = 1107001, InProgress, InTesting, ReOpen, ReSolved, Stalled, Closed }
public enum TaskPriority { P0 = 1108001, P1, P2, P3, P4 }

public sealed class DomainValidationException(string message) : Exception(message);

public sealed record TaskItem
{
    public int Id { get; init; }
    public int ClientId { get; }
    public string Title { get; }
    public string Description { get; }
    public string UserId { get; }
    public int ProjectId { get; }
    public int ModuleId { get; }
    public TaskState StatusId { get; }
    public TaskPriority PriorityId { get; }
    public decimal SP { get; }
    public DateTime? StartDate { get; }
    public DateTime? EndDate { get; }
    public string Reason { get; }
    public bool IsActive { get; }
    public DateTime CreatedOn { get; init; }
    public DateTime ModifiedOn { get; init; }

    public TaskItem(int clientId, string title, string description, string userId,
        int projectId, int moduleId, TaskState statusId, TaskPriority priorityId,
        decimal sp, DateTime? startDate, DateTime? endDate, string reason, bool isActive)
    {
        if (clientId <= 0) throw new DomainValidationException("Client ID must be positive.");
        if (string.IsNullOrWhiteSpace(title) || title.Trim().Length > 1000)
            throw new DomainValidationException("Title is required and must not exceed 1000 characters.");
        if (!Enum.IsDefined(statusId) || !Enum.IsDefined(priorityId))
            throw new DomainValidationException("Select a valid status and priority.");
        if (sp < 0 || sp > 9999999.99m || decimal.Round(sp, 2) != sp) throw new DomainValidationException("Estimated hours must be between 0 and 9999999.99 with at most two decimal places.");
        if (projectId < 0 || moduleId < 0) throw new DomainValidationException("Project and module IDs cannot be negative.");
        if ((userId ?? "").Length > 255) throw new DomainValidationException("Assignee must not exceed 255 characters.");
        if (startDate.HasValue && endDate.HasValue && endDate < startDate)
            throw new DomainValidationException("End date cannot precede start date.");
        ClientId = clientId; Title = title.Trim(); Description = description ?? "";
        UserId = userId ?? ""; ProjectId = projectId; ModuleId = moduleId;
        StatusId = statusId; PriorityId = priorityId; SP = sp;
        StartDate = startDate; EndDate = endDate; Reason = reason ?? ""; IsActive = isActive;
        CreatedOn = ModifiedOn = DateTime.UtcNow;
    }
}


