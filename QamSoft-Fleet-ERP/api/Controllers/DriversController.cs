using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QamSoft.FleetERP.Api.Data;
using QamSoft.FleetERP.Api.Models;

namespace QamSoft.FleetERP.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class DriversController(FleetDbContext dbContext) : ControllerBase
{
    [HttpGet("GetAll")]
    [HttpGet("GetAllDrivers")]
    [ProducesResponseType<IReadOnlyList<Driver>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<Driver>>> GetAllDrivers(
        CancellationToken cancellationToken)
    {
        var drivers = await dbContext.Drivers
            .AsNoTracking()
            .OrderBy(driver => driver.FirstName)
            .ThenBy(driver => driver.LastName)
            .ToListAsync(cancellationToken);

        return Ok(drivers);
    }
}
