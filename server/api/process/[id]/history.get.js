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

    // Check if the ID is a UUID or numeric ID
    const isUUID = processId.length === 36 && processId.includes('-');
    
    // Find the current process
    const currentProcess = await prisma.process.findFirst({
      where: isUUID 
        ? { processUUID: processId }
        : { processID: parseInt(processId) },
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

    if (!currentProcess) {
      return {
        success: false,
        error: 'Process not found'
      };
    }

    // Get process history ordered by version number (newest first)
    const history = await prisma.processHistory.findMany({
      where: { processID: currentProcess.processID },
      include: {
        savedByUser: {
          select: {
            userID: true,
            userFullName: true,
            userUsername: true
          }
        }
      },
      orderBy: { versionNumber: 'desc' }
    });

    // Get total count of versions
    const totalVersions = history.length + 1; // +1 for current version

    return {
      success: true,
      data: {
        currentVersion: currentProcess,
        history: history,
        form: {
          processName: currentProcess.processName,
          processDescription: currentProcess.processDescription
        },
        totalVersions: totalVersions
      }
    };
  } catch (error) {
    console.error('Error getting process history:', error);
    
    return {
      success: false,
      error: 'Failed to get process history',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    };
  }
}); 