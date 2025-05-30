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
    
    // First, check if the process exists
    const existingProcess = await prisma.process.findFirst({
      where: isUUID 
        ? { processUUID: processId }
        : { processID: parseInt(processId) },
      select: {
        processID: true,
        processName: true,
        processStatus: true
      }
    });

    if (!existingProcess) {
      return {
        success: false,
        error: 'Process not found'
      };
    }

    // Optional: Prevent deletion of published processes
    if (existingProcess.processStatus === 'published') {
      return {
        success: false,
        error: 'Cannot delete published processes. Please set status to draft first.'
      };
    }

    // Delete the process
    await prisma.process.delete({
      where: isUUID 
        ? { processUUID: processId }
        : { processID: parseInt(processId) }
    });

    return {
      success: true,
      message: `Process "${existingProcess.processName}" deleted successfully`
    };
  } catch (error) {
    console.error('Error deleting process:', error);
    
    // Handle specific Prisma errors
    if (error.code === 'P2025') {
      return {
        success: false,
        error: 'Process not found'
      };
    }
    
    return {
      success: false,
      error: 'Failed to delete process',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    };
  }
}); 