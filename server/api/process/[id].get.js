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
    
    // Find the process by UUID or ID
    const process = await prisma.process.findFirst({
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

    if (!process) {
      return {
        success: false,
        error: 'Process not found'
      };
    }

    return {
      success: true,
      process
    };
  } catch (error) {
    console.error('Error fetching process:', error);
    
    return {
      success: false,
      error: 'Failed to fetch process',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    };
  }
}); 