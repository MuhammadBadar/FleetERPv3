using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using TMS.Application.Common;
using TMS.Domain;
namespace TMS.Api.Common;
public sealed class ApiExceptionHandler(ILogger<ApiExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext context, Exception exception, CancellationToken ct)
    {
        var (status, title, detail) = exception switch
        {
            DomainValidationException => (400, "Validation failed", exception.Message),
            RepositoryConflictException => (409, "Task conflict", exception.Message),
            RepositoryUnavailableException => (503, "Database unavailable", exception.Message),
            _ => (500, "An unexpected error occurred", "See the API log for details.")
        };
        if (status >= 500) logger.LogError(exception, "Request failed");
        context.Response.StatusCode = status;
        await context.Response.WriteAsJsonAsync(new ProblemDetails
            { Status = status, Title = title, Detail = detail }, cancellationToken: ct);
        return true;
    }
}

