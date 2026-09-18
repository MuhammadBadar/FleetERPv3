# Layered task module

Request flow: TasksController -> ITaskService -> ITaskRepository -> MySQL procedures.
Application owns ITaskRepository; Infrastructure implements it. Only API module
composition references concrete adapters. Domain has no database dependencies.

TasksController and TasksModule live in API/Modules/Tasks. Application/Tasks holds
contracts/use cases; Infrastructure/Tasks holds the repository, typed command
factory, and row mapper. This remains one deployable modular API.

POST executes TMS_Manage_Task with Insert and Id=0. SQL omits the identity column
and returns the generated ID as a result set; the repository reads it with
ExecuteScalarAsync. GET calls TMS_Search_Tasks with integer-only client/task
filters. PUT and DELETE call the same management routine with Update/Delete.

The table's nullable dates, decimal SP, and UTC audit timestamps are represented
in Domain and API. There are no audit-user properties. The query mapper directly
matches TMS_vw_Task over tasks. Authentication, catalogs, pagination, and optimistic
concurrency remain future work.

Procedure SQL is versioned in database/002_tasks_view_and_procedures.sql.
Changing from the legacy procedure to this version requires corresponding API
changes: dates replace audit-user parameters and inserts return generated IDs.
Tests verify contracts, mapping, generated identity, decimal precision, and dates;
the DatabaseCheck tool also supports a temporary live database write test.
