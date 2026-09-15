using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QamSoft.FleetERP.Api.Data;
using QamSoft.FleetERP.Api.Models;

namespace QamSoft.FleetERP.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class VehiclesController(FleetDbContext dbContext) : ControllerBase
{
    [HttpGet("GetAll")]
    [HttpGet("GetAllVehicles")]
    [ProducesResponseType<IReadOnlyList<Vehicle>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<Vehicle>>> GetAllVehicles(
        CancellationToken cancellationToken)
    {
        var vehicles = await dbContext.Vehicles
            .AsNoTracking()
            .OrderBy(vehicle => vehicle.RegistrationNumber)
            .ToListAsync(cancellationToken);

        return Ok(vehicles);
    }
}
