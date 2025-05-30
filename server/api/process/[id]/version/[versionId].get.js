import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    // Get the process ID and version ID from the route parameters
    const processId = getRouterParam(event, 'id');
    const versionId = getRouterParam(event, 'versionId');
    
    if (!processId || !versionId) {
      return {
        success: false,
        error: 'Process ID and version ID are required'
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

    // Find the specific version
    const versionRecord = await prisma.processHistory.findFirst({
      where: {
        processID: currentProcess.processID,
        historyID: parseInt(versionId)
      },
      include: {
        savedByUser: {
          select: {
            userID: true,
            userFullName: true,
            userUsername: true
          }
        }
      }
    });

    if (!versionRecord) {
      return {
        success: false,
        error: 'Version not found'
      };
    }

    // Format the version data for preview
    const versionData = {
      processName: versionRecord.processName,
      processDescription: versionRecord.processDescription,
      processDefinition: versionRecord.processDefinition,
      processStatus: versionRecord.processStatus,
      processCategory: versionRecord.processCategory,
      processOwner: versionRecord.processOwner,
      processPermissions: versionRecord.processPermissions,
      processPriority: versionRecord.processPriority,
      processSettings: versionRecord.processSettings,
      processVariables: versionRecord.processVariables,
      templateCategory: versionRecord.templateCategory,
      versionInfo: {
        versionNumber: versionRecord.versionNumber,
        savedDate: versionRecord.savedDate,
        savedBy: versionRecord.savedByUser,
        changeDescription: versionRecord.changeDescription
      }
    };
    
    return {
      success: true,
      data: versionData
    };
  } catch (error) {
    console.error('Error getting process version:', error);
    
    return {
      success: false,
      error: 'Failed to get process version',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    };
  }
}); 