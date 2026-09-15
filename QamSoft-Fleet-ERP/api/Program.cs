using Microsoft.EntityFrameworkCore;
using MySqlConnector;
using QamSoft.FleetERP.Api.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

var connectionString = builder.Configuration.GetConnectionString("FleetDatabase")
    ?? throw new InvalidOperationException(
        "Connection string 'FleetDatabase' was not found.");

if (builder.Environment.IsDevelopment())
{
    connectionString = new MySqlConnectionStringBuilder(connectionString)
    {
        SslMode = MySqlSslMode.None,
        AllowPublicKeyRetrieval = true
    }.ConnectionString;
}

builder.Services.AddDbContext<FleetDbContext>(options =>
    options.UseMySql(
        connectionString,
        new MySqlServerVersion(new Version(8, 0, 0))));

builder.Services.AddControllers();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AngularClient", policy =>
        policy
            .WithOrigins(
                "http://localhost:4200",
                "https://localhost:4200",
                "http://127.0.0.1:4200",
                "https://127.0.0.1:4200")
            .AllowAnyHeader()
            .AllowAnyMethod());
});

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}
app.UseCors("AngularClient");
app.MapControllers();

app.MapGet("/", () => Results.Ok(new
{
    service = "QamSoft Fleet ERP API",
    status = "running"
}));

app.Run();

public partial class Program;
