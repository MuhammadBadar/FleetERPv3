using TMS.Api.Common;
using TMS.Api.Modules.Tasks;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<ApiExceptionHandler>();
builder.Services.AddTasksModule(builder.Configuration);

var app = builder.Build();
app.UseExceptionHandler();
app.MapControllers();
app.MapGet("/health", () => Results.Ok(new
    { status = "ok", storage = builder.Configuration["Storage:Provider"] ?? "MySql" }));
app.Run();
