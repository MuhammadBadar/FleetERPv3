# QamSoft Fleet ERP API

ASP.NET Core 9 API backed by MySQL 8 and Entity Framework Core.

## Database setup

1. Change the placeholder password in `Database/schema.sql`.
2. Run the script as a MySQL administrator:

   ```powershell
   mysql -u root -p -e "source Database/schema.sql"
   mysql -u root -p -e "source Database/seed.sql"
   ```

3. Put the same password in the `FleetDatabase` connection string in
   `appsettings.json`. For real deployments, provide the connection string
   through configuration or a secret store instead of committing a password.

## Run

```powershell
dotnet restore
dotnet run --launch-profile https
```

## Read endpoints

- `GET https://localhost:5001/api/Drivers/GetAllDrivers`
- `GET https://localhost:5001/api/Drivers/GetAll`
- `GET https://localhost:5001/api/Vehicles/GetAllVehicles`
- `GET https://localhost:5001/api/Vehicles/GetAll`

The Angular development origins on port 4200 are enabled by the API CORS
policy.

The seed script inserts six sample drivers and six sample vehicles. It uses
`INSERT IGNORE`, so it can be run again without duplicating records protected
by the tables' unique constraints.
