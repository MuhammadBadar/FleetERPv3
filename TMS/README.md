# TMS — modular layered Clean Architecture

The API uses your existing `tms.tasks` table through `TMS_Manage_Task` and
`TMS_Search_Tasks`. The latter reads `TMS_vw_Task`.

## Schema alignment

- Id is AUTO_INCREMENT. Omit it (or send 0) on POST. The 201 response and Location
  header contain the generated ID. PUT uses the existing route ID.
- StartDate and EndDate are nullable and supported for inserts and updates.
- SP is DECIMAL(9,2); the API rejects more than two decimal places.
- CreatedOn and ModifiedOn are application-generated UTC timestamps. Updates
  preserve CreatedOn.
- CreatedById and ModifiedById are absent from the table and API contracts.
- The Angular form offers dates and no longer requires a task ID or audit-user IDs.

The matching view and procedure definitions are in
`database/002_tasks_view_and_procedures.sql`. They have been applied to the
configured local TMS database. This replaces the old procedure signature:
date parameters replace the old audit-user parameters, and inserts return the
generated ID. Existing external callers must adopt this signature too.

## Run

From this solution directory:

```powershell
dotnet run --project src/TMS.Api
```

In another terminal:

```powershell
cd web
npm start
```

Open http://localhost:4201. API: http://localhost:5080.
For a fresh checkout run `npm ci` in web first.
The existing ConnectionStrings:Tms setting is preserved. Set credentials locally
through user secrets or environment variables; do not commit passwords.

## Insert and select

Use `src/TMS.Api/TMS.Api.http` or Postman:

```http
POST http://localhost:5080/api/tasks?clientId=1
Content-Type: application/json

{
  "title": "My task",
  "description": "Stored in tasks",
  "sp": 1.25,
  "startDate": "2026-09-17T10:00:00",
  "endDate": "2026-09-17T11:00:00"
}
```

```http
GET http://localhost:5080/api/tasks?clientId=1
GET http://localhost:5080/api/tasks/1?clientId=1
```

Replace 1 in the second route with the returned task ID.

## Architecture

API Modules/Tasks owns controllers and DI registration. Application/Tasks owns
use cases and repository interfaces. Infrastructure/Tasks binds procedure
parameters and maps view rows. Domain owns entities and validation. Dependencies
point inward; Application contains no MySQL or HTTP code.

The legacy search procedure builds dynamic SQL, so the API only passes a fixed
clause built from validated numeric IDs; it accepts no raw SQL input.

## Validation

```powershell
dotnet test TMS.sln -c Release
dotnet run --project tools/TMS.DatabaseCheck -c Release
dotnet run --project tools/TMS.DatabaseCheck -c Release -- --verify-write
```

The last command creates a temporary task, checks generated IDs, dates, decimals,
updates, and client isolation, then deletes the test task. Live MySQL verification
passed during this update. All 11 automated tests and both builds also passed.

To apply the SQL definitions to another configured database explicitly:

```powershell
dotnet run --project tools/TMS.DatabaseCheck -c Release -- --apply-schema
```

This backs up existing routine/view definitions into .database-backups before
replacing them. It does not alter or recreate the tasks table. MySQL routine DDL
is not transactionally rolled back; keep backups when applying to another system.

Authentication, reference catalogs, and other legacy workflows are still separate
migration work. ClientId filtering is not authorization. Current updates use
last-write-wins behavior.
