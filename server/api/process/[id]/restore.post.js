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
    
    // First, check if the process exists and is deleted
    const existingProcess = await prisma.process.findFirst({
      where: {
        ...(isUUID 
          ? { processUUID: processId }
          : { processID: parseInt(processId) }),
        processStatus: 'deleted'
      },
      select: {
        processID: true,
        processName: true,
        processStatus: true
      }
    });

    if (!existingProcess) {
      return {
        success: false,
        error: 'Deleted process not found'
      };
    }

    // Restore the process by setting status back to draft
    const restoredProcess = await prisma.process.update({
      where: isUUID 
        ? { processUUID: processId }
        : { processID: parseInt(processId) },
      data: {
        processStatus: 'draft', // Restore as draft for safety
        processDeletedDate: null, // Clear deletion date
        processModifiedDate: new Date()
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
      message: `Process "${existingProcess.processName}" has been restored`,
      process: restoredProcess
    };
  } catch (error) {
    console.error('Error restoring process:', error);
    
    // Handle specific Prisma errors
    if (error.code === 'P2025') {
      return {
        success: false,
        error: 'Process not found'
      };
    }
    
    return {
      success: false,
      error: 'Failed to restore process',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    };
  }
}); 