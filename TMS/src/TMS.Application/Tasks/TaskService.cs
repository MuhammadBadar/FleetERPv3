using TMS.Domain;
namespace TMS.Application.Tasks;
public sealed class TaskService(ITaskRepository repository) : ITaskService
{
    private static void ValidateClient(int clientId)
    {
        if (clientId <= 0) throw new DomainValidationException("Client ID must be positive.");
    }
    private static void ValidateId(int id)
    {
        if (id <= 0) throw new DomainValidationException("Task ID must be positive.");
    }
    public Task<IReadOnlyList<TaskItem>> ListAsync(int clientId, CancellationToken ct)
    {
        ValidateClient(clientId);
        return repository.ListAsync(clientId, ct);
    }
    public Task<TaskItem?> GetAsync(int clientId, int id, CancellationToken ct)
    {
        ValidateClient(clientId); ValidateId(id);
        return repository.GetAsync(clientId, id, ct);
    }
    public Task<TaskItem> CreateAsync(int clientId, TaskRequest request, CancellationToken ct)
        {
        if (request.Id != 0) throw new DomainValidationException("Omit Id when creating a task; MySQL generates it.");
        return repository.AddAsync(request.ToDomain(clientId), ct);
    }
    public async Task<TaskItem?> UpdateAsync(int clientId, int id, TaskRequest request, CancellationToken ct)
    {
        ValidateId(id);
        if (request.Id != 0 && request.Id != id)
            throw new DomainValidationException("Body task ID must match the route ID.");
        var updated = request.ToDomain(clientId);
        var existing = await repository.GetAsync(clientId, id, ct);
        if (existing is null) return null;
        updated = updated with { Id = id, CreatedOn = existing.CreatedOn,
            ModifiedOn = DateTime.UtcNow };
        return await repository.UpdateAsync(updated, ct) ? updated : null;
    }
    public Task<bool> DeleteAsync(int clientId, int id, CancellationToken ct)
    {
        ValidateClient(clientId); ValidateId(id);
        return repository.DeleteAsync(clientId, id, ct);
    }
}

