using System.Collections.Concurrent;
using TMS.Application.Tasks;
using TMS.Application.Common;
using TMS.Domain;
namespace TMS.Infrastructure;

// Local demo only: records disappear when the API process stops.
public sealed class InMemoryTaskRepository : ITaskRepository
{
    private readonly ConcurrentDictionary<(int ClientId, int Id), TaskItem> tasks = new();
    private int nextId;
    public Task<IReadOnlyList<TaskItem>> ListAsync(int clientId, CancellationToken ct)
    {
        ct.ThrowIfCancellationRequested();
        return Task.FromResult<IReadOnlyList<TaskItem>>(tasks.Values.Where(x => x.ClientId == clientId)
            .OrderBy(x => x.PriorityId).ThenByDescending(x => x.Id).ToArray());
    }
    public Task<TaskItem?> GetAsync(int clientId, int id, CancellationToken ct)
    {
        ct.ThrowIfCancellationRequested();
        tasks.TryGetValue((clientId, id), out var task);
        return Task.FromResult(task);
    }
    public Task<TaskItem> AddAsync(TaskItem task, CancellationToken ct)
    {
        ct.ThrowIfCancellationRequested();
        if (task.Id > 0)
        {
            if (!tasks.TryAdd((task.ClientId, task.Id), task))
                throw new RepositoryConflictException("That task ID already exists for this client.");
        }
        else
        {
            do { task = task with { Id = Interlocked.Increment(ref nextId) }; }
            while (!tasks.TryAdd((task.ClientId, task.Id), task));
        }
        return Task.FromResult(task);
    }
    public Task<bool> UpdateAsync(TaskItem task, CancellationToken ct)
    {
        ct.ThrowIfCancellationRequested();
        var key = (task.ClientId, task.Id);
        return Task.FromResult(tasks.TryGetValue(key, out var old) && tasks.TryUpdate(key, task, old));
    }
    public Task<bool> DeleteAsync(int clientId, int id, CancellationToken ct)
    {
        ct.ThrowIfCancellationRequested();
        return Task.FromResult(tasks.TryRemove((clientId, id), out _));
    }
}


