-- Add process history table for version tracking
CREATE TABLE `processHistory` (
    `historyID` INTEGER NOT NULL AUTO_INCREMENT,
    `processID` INTEGER NOT NULL,
    `processUUID` VARCHAR(36) NOT NULL,
    `processName` VARCHAR(255) NOT NULL,
    `processDescription` TEXT NULL,
    `processDefinition` JSON NOT NULL,
    `processVersion` INTEGER NOT NULL,
    `processStatus` VARCHAR(50) NOT NULL,
    `processCategory` VARCHAR(100) NULL,
    `processOwner` VARCHAR(255) NULL,
    `processPermissions` JSON NULL,
    `processPriority` VARCHAR(50) NULL,
    `processSettings` JSON NULL,
    `processVariables` JSON NULL,
    `templateCategory` VARCHAR(100) NULL,
    `versionNumber` INTEGER NOT NULL,
    `changeDescription` TEXT NULL,
    `savedBy` INTEGER NULL,
    `savedDate` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `FK_processHistory_process`(`processID`),
    INDEX `FK_processHistory_savedBy`(`savedBy`),
    INDEX `IDX_processHistory_uuid`(`processUUID`),
    INDEX `IDX_processHistory_date`(`savedDate`),
    PRIMARY KEY (`historyID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Add foreign key constraints
ALTER TABLE `processHistory` ADD CONSTRAINT `processHistory_processID_fkey` FOREIGN KEY (`processID`) REFERENCES `process`(`processID`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `processHistory` ADD CONSTRAINT `processHistory_savedBy_fkey` FOREIGN KEY (`savedBy`) REFERENCES `user`(`userID`) ON DELETE SET NULL ON UPDATE CASCADE; 