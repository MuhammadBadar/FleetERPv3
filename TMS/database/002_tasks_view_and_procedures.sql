-- Select your existing tms database in MySQL Workbench before running this file.
-- No table or task data is dropped. Existing view/procedures are replaced.
DELIMITER $$

CREATE OR REPLACE VIEW TMS_vw_Task AS
SELECT Id, ClientId, Title, Description, UserId, ProjectId, ModuleId,
       StatusId, PriorityId, SP, StartDate, EndDate, Reason, IsActive,
       CreatedOn, ModifiedOn
FROM tasks$$

DROP PROCEDURE IF EXISTS TMS_Manage_Task$$
CREATE PROCEDURE TMS_Manage_Task(
    IN prm_id INT,
    IN prm_clientId INT,
    IN prm_userId VARCHAR(255),
    IN prm_moduleId INT,
    IN prm_projectId INT,
    IN prm_statusId INT,
    IN prm_priorityId INT,
    IN prm_title VARCHAR(1000),
    IN prm_sP DECIMAL(9,2),
    IN prm_description LONGTEXT,
    IN prm_reason LONGTEXT,
    IN prm_createdOn DATETIME(6),
    IN prm_startDate DATETIME(6),
    IN prm_modifiedOn DATETIME(6),
    IN prm_endDate DATETIME(6),
    IN prm_isActive TINYINT,
    IN prm_filter VARCHAR(50)
)
BEGIN
    IF prm_clientId IS NULL OR prm_clientId <= 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ClientId must be positive';
    END IF;
    IF prm_filter = 'Insert' THEN
        IF prm_id IS NOT NULL AND prm_id <> 0 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Id is generated automatically';
        END IF;
        INSERT INTO tasks
            (ClientId, UserId, ModuleId, ProjectId, StatusId, PriorityId, Title, SP,
             Description, Reason, CreatedOn, StartDate, ModifiedOn, EndDate, IsActive)
        VALUES
            (prm_clientId, prm_userId, prm_moduleId, prm_projectId, prm_statusId,
             prm_priorityId, prm_title, prm_sP, prm_description, prm_reason,
             prm_createdOn, prm_startDate, prm_modifiedOn, prm_endDate, prm_isActive);
        SELECT LAST_INSERT_ID() AS Id;
    ELSEIF prm_filter = 'Update' THEN
        UPDATE tasks SET UserId=prm_userId, ModuleId=prm_moduleId, ProjectId=prm_projectId,
            StatusId=prm_statusId, PriorityId=prm_priorityId, Title=prm_title, SP=prm_sP,
            Description=prm_description, Reason=prm_reason, StartDate=prm_startDate,
            EndDate=prm_endDate, ModifiedOn=prm_modifiedOn, IsActive=prm_isActive
        WHERE Id=prm_id AND ClientId=prm_clientId;
        SELECT ROW_COUNT() AS AffectedRows;
    ELSEIF prm_filter = 'Delete' THEN
        DELETE FROM tasks WHERE Id=prm_id AND ClientId=prm_clientId;
        SELECT ROW_COUNT() AS AffectedRows;
    ELSEIF prm_filter = 'Activate' OR prm_filter = 'DeActivate' THEN
        UPDATE tasks SET IsActive=(prm_filter = 'Activate'), ModifiedOn=prm_modifiedOn
        WHERE Id=prm_id AND ClientId=prm_clientId;
        SELECT ROW_COUNT() AS AffectedRows;
    ELSE
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Unsupported task operation';
    END IF;
END$$

DROP PROCEDURE IF EXISTS TMS_Search_Tasks$$
CREATE PROCEDURE TMS_Search_Tasks(IN whereClause VARCHAR(5000))
BEGIN
    SET @querystr = CONCAT('SELECT * FROM TMS_vw_Task ', IFNULL(whereClause, ''));
    PREPARE stmt1 FROM @querystr;
    EXECUTE stmt1;
    DEALLOCATE PREPARE stmt1;
END$$

DELIMITER ;

