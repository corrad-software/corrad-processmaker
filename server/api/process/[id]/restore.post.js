import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    // Get the process ID from the route parameter
    const processId = getRouterParam(event, 'id');
    
    if (!processId) {
      return {
        success: false,
        error: 'Process ID is required'
      };
    }

    // Parse the request body
    const body = await readBody(event);
    const { historyId, versionNumber, restoredBy } = body;
    
    if (!historyId && !versionNumber) {
      return {
        success: false,
        error: 'History ID or version number is required'
      };
    }

    // Check if the ID is a UUID or numeric ID
    const isUUID = processId.length === 36 && processId.includes('-');
    
    // Find the current process
    const currentProcess = await prisma.process.findFirst({
      where: isUUID 
        ? { processUUID: processId }
        : { processID: parseInt(processId) }
    });

    if (!currentProcess) {
      return {
        success: false,
        error: 'Process not found'
      };
    }

    // Find the history record to restore
    const historyRecord = await prisma.processHistory.findFirst({
      where: historyId 
        ? { historyID: parseInt(historyId) }
        : { 
            processID: currentProcess.processID,
            versionNumber: parseInt(versionNumber)
          }
    });

    if (!historyRecord) {
      return {
        success: false,
        error: 'History record not found'
      };
    }

    // Save current state to history before restoring
    const lastHistory = await prisma.processHistory.findFirst({
      where: { processID: currentProcess.processID },
      orderBy: { versionNumber: 'desc' },
      select: { versionNumber: true }
    });

    const nextVersionNumber = (lastHistory?.versionNumber || 0) + 1;

    await prisma.processHistory.create({
      data: {
        processID: currentProcess.processID,
        processUUID: currentProcess.processUUID,
        processName: currentProcess.processName,
        processDescription: currentProcess.processDescription,
        processDefinition: currentProcess.processDefinition,
        processVersion: currentProcess.processVersion,
        processStatus: currentProcess.processStatus,
        processCategory: currentProcess.processCategory,
        processOwner: currentProcess.processOwner,
        processPermissions: currentProcess.processPermissions,
        processPriority: currentProcess.processPriority,
        processSettings: currentProcess.processSettings,
        processVariables: currentProcess.processVariables,
        templateCategory: currentProcess.templateCategory,
        versionNumber: nextVersionNumber,
        changeDescription: `Restored to version ${historyRecord.versionNumber}`,
        savedBy: restoredBy || currentProcess.processCreatedBy
      }
    });

    // Restore the process from history
    const restoredProcess = await prisma.process.update({
      where: { processID: currentProcess.processID },
      data: {
        processName: historyRecord.processName,
        processDescription: historyRecord.processDescription,
        processDefinition: historyRecord.processDefinition,
        processStatus: historyRecord.processStatus,
        processCategory: historyRecord.processCategory,
        processOwner: historyRecord.processOwner,
        processPermissions: historyRecord.processPermissions,
        processPriority: historyRecord.processPriority,
        processSettings: historyRecord.processSettings,
        processVariables: historyRecord.processVariables,
        templateCategory: historyRecord.templateCategory,
        processVersion: currentProcess.processVersion + 1
      },
      include: {
        creator: {
          select: {
            userID: true,
            userFullName: true,
            userUsername: true
          }
        }
      }
    });
    
    return {
      success: true,
      process: restoredProcess,
      message: `Process restored to version ${historyRecord.versionNumber} successfully`
    };
  } catch (error) {
    console.error('Error restoring process:', error);
    
    return {
      success: false,
      error: 'Failed to restore process',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    };
  }
}); 