# Database objects

Use the existing tms.tasks table. Run 002_tasks_view_and_procedures.sql with your
TMS database selected in MySQL Workbench, or use the explicit DatabaseCheck
--apply-schema command from the solution README.

The view includes all 16 actual columns. The management procedure omits Id on
insert, returns LAST_INSERT_ID(), supports both dates, binds SP as DECIMAL(9,2),
and preserves CreatedOn during updates. Audit-user columns are not used.

The SQL definitions were applied to the configured local database and verified.
Existing task records and the table definition were preserved.
