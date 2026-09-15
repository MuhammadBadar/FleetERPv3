using Microsoft.EntityFrameworkCore;
using QamSoft.FleetERP.Api.Models;

namespace QamSoft.FleetERP.Api.Data;

public sealed class FleetDbContext(DbContextOptions<FleetDbContext> options)
    : DbContext(options)
{
    public DbSet<Driver> Drivers => Set<Driver>();
    public DbSet<Vehicle> Vehicles => Set<Vehicle>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        ConfigureDriver(modelBuilder);
        ConfigureVehicle(modelBuilder);
    }

    private static void ConfigureDriver(ModelBuilder modelBuilder)
    {
        var driver = modelBuilder.Entity<Driver>();

        driver.ToTable("drivers", table =>
        {
            table.HasCheckConstraint(
                "ck_drivers_status",
                "`status` IN ('Active', 'Inactive', 'Suspended')");
        });

        driver.HasKey(item => item.Id);
        driver.HasIndex(item => item.CnicNumber).IsUnique();
        driver.HasIndex(item => item.LicenseNumber).IsUnique();

        driver.Property(item => item.Id).HasColumnName("id");
        driver.Property(item => item.FirstName).HasColumnName("first_name").HasMaxLength(50).IsRequired();
        driver.Property(item => item.MiddleName).HasColumnName("middle_name").HasMaxLength(50);
        driver.Property(item => item.LastName).HasColumnName("last_name").HasMaxLength(50).IsRequired();
        driver.Property(item => item.CnicNumber).HasColumnName("cnic_number").HasMaxLength(15).IsRequired();
        driver.Property(item => item.LicenseNumber).HasColumnName("license_number").HasMaxLength(30).IsRequired();
        driver.Property(item => item.PhoneNumber).HasColumnName("phone_number").HasMaxLength(15).IsRequired();
        driver.Property(item => item.Status).HasColumnName("status").HasMaxLength(20).HasDefaultValue("Active");
        driver.Property(item => item.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
        driver.Property(item => item.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
    }

    private static void ConfigureVehicle(ModelBuilder modelBuilder)
    {
        var vehicle = modelBuilder.Entity<Vehicle>();

        vehicle.ToTable("vehicles", table =>
        {
            table.HasCheckConstraint(
                "ck_vehicles_status",
                "`status` IN ('Available', 'Assigned', 'Maintenance', 'Inactive')");
            table.HasCheckConstraint(
                "ck_vehicles_year",
                "`manufacturing_year` BETWEEN 1980 AND 2100");
            table.HasCheckConstraint(
                "ck_vehicles_odometer",
                "`odometer` >= 0");
        });

        vehicle.HasKey(item => item.Id);
        vehicle.HasIndex(item => item.RegistrationNumber).IsUnique();

        vehicle.Property(item => item.Id).HasColumnName("id");
        vehicle.Property(item => item.RegistrationNumber).HasColumnName("registration_number").HasMaxLength(15).IsRequired();
        vehicle.Property(item => item.Make).HasColumnName("make").HasMaxLength(50).IsRequired();
        vehicle.Property(item => item.Model).HasColumnName("model").HasMaxLength(50).IsRequired();
        vehicle.Property(item => item.ManufacturingYear).HasColumnName("manufacturing_year").IsRequired();
        vehicle.Property(item => item.VehicleType).HasColumnName("vehicle_type").HasMaxLength(30).IsRequired();
        vehicle.Property(item => item.FuelType).HasColumnName("fuel_type").HasMaxLength(20).IsRequired();
        vehicle.Property(item => item.Odometer).HasColumnName("odometer").IsRequired();
        vehicle.Property(item => item.Status).HasColumnName("status").HasMaxLength(20).HasDefaultValue("Available");
        vehicle.Property(item => item.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
        vehicle.Property(item => item.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
    }
}
