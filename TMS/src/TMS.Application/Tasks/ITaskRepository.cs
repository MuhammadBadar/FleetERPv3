using TMS.Domain;
namespace TMS.Application.Tasks;
public interface ITaskRepository
{
    Task<IReadOnlyList<TaskItem>> ListAsync(int clientId, CancellationToken ct);
    Task<TaskItem?> GetAsync(int clientId, int id, CancellationToken ct);
    Task<TaskItem> AddAsync(TaskItem task, CancellationToken ct);
    Task<bool> UpdateAsync(TaskItem task, CancellationToken ct);
    Task<bool> DeleteAsync(int clientId, int id, CancellationToken ct);
}

