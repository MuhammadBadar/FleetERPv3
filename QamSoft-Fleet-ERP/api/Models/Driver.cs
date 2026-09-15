namespace QamSoft.FleetERP.Api.Models;

public sealed class Driver
{
    public long Id { get; set; }
    public required string FirstName { get; set; }
    public string? MiddleName { get; set; }
    public required string LastName { get; set; }
    public required string CnicNumber { get; set; }
    public required string LicenseNumber { get; set; }
    public required string PhoneNumber { get; set; }
    public required string Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
