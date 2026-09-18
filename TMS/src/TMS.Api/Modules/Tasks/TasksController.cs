using Microsoft.AspNetCore.Mvc;
using TMS.Application.Tasks;
using TMS.Domain;
namespace TMS.Api.Modules.Tasks;

[ApiController]
[Route("api/tasks")]
public sealed class TasksController(ITaskService service) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<TaskItem>>> List([FromQuery] int clientId = 1, CancellationToken ct = default)
        => Ok(await service.ListAsync(clientId, ct));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<TaskItem>> Get(int id, [FromQuery] int clientId = 1, CancellationToken ct = default)
    {
        var task = await service.GetAsync(clientId, id, ct);
        return task is null ? NotFound() : Ok(task);
    }
    [HttpPost]
    public async Task<ActionResult<TaskItem>> Create(TaskRequest request, [FromQuery] int clientId = 1, CancellationToken ct = default)
    {
        var task = await service.CreateAsync(clientId, request, ct);
        return CreatedAtAction(nameof(Get), new { id = task.Id, clientId }, task);
    }
    [HttpPut("{id:int}")]
    public async Task<ActionResult<TaskItem>> Update(int id, TaskRequest request, [FromQuery] int clientId = 1, CancellationToken ct = default)
    {
        var task = await service.UpdateAsync(clientId, id, request, ct);
        return task is null ? NotFound() : Ok(task);
    }
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, [FromQuery] int clientId = 1, CancellationToken ct = default)
        => await service.DeleteAsync(clientId, id, ct) ? NoContent() : NotFound();
}


