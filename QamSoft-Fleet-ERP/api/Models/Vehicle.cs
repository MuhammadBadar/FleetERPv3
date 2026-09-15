namespace QamSoft.FleetERP.Api.Models;

public sealed class Vehicle
{
    public long Id { get; set; }
    public required string RegistrationNumber { get; set; }
    public required string Make { get; set; }
    public required string Model { get; set; }
    public int ManufacturingYear { get; set; }
    public required string VehicleType { get; set; }
    public required string FuelType { get; set; }
    public long Odometer { get; set; }
    public required string Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
