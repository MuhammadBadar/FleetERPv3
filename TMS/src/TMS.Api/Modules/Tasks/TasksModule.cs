using TMS.Application.Tasks;
using TMS.Infrastructure;
using TMS.Infrastructure.Tasks;
namespace TMS.Api.Modules.Tasks;

// Each feature owns its registrations; Program.cs remains the composition entry point.
public static class TasksModule
{
    public static IServiceCollection AddTasksModule(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddScoped<ITaskService, TaskService>();
        var provider = configuration["Storage:Provider"] ?? "MySql";
        if (provider.Equals("MySql", StringComparison.OrdinalIgnoreCase))
        {
            var connection = configuration.GetConnectionString("Tms");
            if (string.IsNullOrWhiteSpace(connection))
                throw new InvalidOperationException("Configure ConnectionStrings:Tms for the existing TMS database.");
            services.AddScoped<ITaskRepository>(_ => new MySqlTaskRepository(connection));
        }
        else if (provider.Equals("InMemory", StringComparison.OrdinalIgnoreCase))
            services.AddSingleton<ITaskRepository, InMemoryTaskRepository>();
        else throw new InvalidOperationException("Storage:Provider must be MySql or InMemory.");
        return services;
    }
}

