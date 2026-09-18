using TMS.Application.Tasks;
using TMS.Domain;
using TMS.Infrastructure;
using Xunit;
namespace TMS.Tests;

public sealed class TaskServiceTests
{
    private static TaskService Service() => new(new InMemoryTaskRepository());

    [Fact]
    public async Task CreateUpdateDeletePreservesIdentityAndCreationTime()
    {
        var service = Service();
        var created = await service.CreateAsync(1, new TaskRequest("  First task  "), default);
        Assert.True(created.Id > 0);
        Assert.Equal("First task", created.Title);
        var updated = await service.UpdateAsync(1, created.Id,
            new TaskRequest("Updated", StatusId: TaskState.InProgress), default);
        Assert.NotNull(updated);
        Assert.Equal(created.CreatedOn, updated.CreatedOn);
        Assert.Equal(created.Id, updated.Id);
        Assert.Equal(TaskState.InProgress, updated.StatusId);
        Assert.True(await service.DeleteAsync(1, created.Id, default));
        Assert.Null(await service.GetAsync(1, created.Id, default));
    }
    [Fact]
    public async Task ClientScopesPreventCrossClientReadsAndChanges()
    {
        var service = Service();
        var created = await service.CreateAsync(1, new TaskRequest("Private"), default);
        Assert.Empty(await service.ListAsync(2, default));
        Assert.Null(await service.GetAsync(2, created.Id, default));
        Assert.Null(await service.UpdateAsync(2, created.Id, new TaskRequest("Changed"), default));
        Assert.False(await service.DeleteAsync(2, created.Id, default));
        Assert.Equal("Private", (await service.GetAsync(1, created.Id, default))!.Title);
    }
    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public async Task EmptyTitlesAreRejected(string title)
    {
        var service = Service();
        await Assert.ThrowsAsync<DomainValidationException>(() => service.CreateAsync(1, new TaskRequest(title), default));
    }
    [Fact]
    public async Task InvalidDatesEnumsAndEffortAreRejected()
    {
        var service = Service();
        await Assert.ThrowsAsync<DomainValidationException>(() => service.CreateAsync(1,
            new TaskRequest("Task", StartDate: new DateTime(2026, 9, 2), EndDate: new DateTime(2026, 9, 1)), default));
        await Assert.ThrowsAsync<DomainValidationException>(() => service.CreateAsync(1,
            new TaskRequest("Task", StatusId: (TaskState)42), default));
        await Assert.ThrowsAsync<DomainValidationException>(() => service.CreateAsync(1,
            new TaskRequest("Task", SP: -1), default));
    }
    [Fact]
    public async Task MissingTasksAndInvalidClientsAreHandled()
    {
        var service = Service();
        Assert.Null(await service.UpdateAsync(1, 999, new TaskRequest("Task"), default));
        Assert.False(await service.DeleteAsync(1, 999, default));
        await Assert.ThrowsAsync<DomainValidationException>(() => service.ListAsync(0, default));
    }
}


