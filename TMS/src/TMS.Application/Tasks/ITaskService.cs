using TMS.Domain;
namespace TMS.Application.Tasks;
public interface ITaskService
{
    Task<IReadOnlyList<TaskItem>> ListAsync(int clientId, CancellationToken ct);
    Task<TaskItem?> GetAsync(int clientId, int id, CancellationToken ct);
    Task<TaskItem> CreateAsync(int clientId, TaskRequest request, CancellationToken ct);
    Task<TaskItem?> UpdateAsync(int clientId, int id, TaskRequest request, CancellationToken ct);
    Task<bool> DeleteAsync(int clientId, int id, CancellationToken ct);
}

