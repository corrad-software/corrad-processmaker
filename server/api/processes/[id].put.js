import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  // Get the process ID from the route params
  const id = event.context.params.id;
  
  try {
    // Parse the request body
    const body = await readBody(event);
    
    // Validate required fields
    if (!body.processName) {
      return {
        success: false,
        error: 'Process name is required'
      };
    }
    
    // Prepare update data
    const updateData = {
      processName: body.processName,
      processModifiedDate: new Date()
    };
    
    // Add optional fields if provided
    if (body.processDescription !== undefined) {
      updateData.processDescription = body.processDescription;
    }
    
    if (body.definition !== undefined) {
      updateData.processDefinition = body.definition;
    }
    
    if (body.processStatus !== undefined) {
      updateData.processStatus = body.processStatus;
    }
    
    if (body.processVersion !== undefined) {
      updateData.processVersion = body.processVersion;
    }
    
    // Try to update by UUID first
    let process;
    try {
      process = await prisma.process.update({
        where: { processUUID: id },
        data: updateData
      });
    } catch (e) {
      // If UUID not found, try numeric ID
      if (!isNaN(parseInt(id))) {
        process = await prisma.process.update({
          where: { processID: parseInt(id) },
          data: updateData
        });
      } else {
        throw e;
      }
    }
    
    return {
      success: true,
      process
    };
  } catch (error) {
    console.error(`Error updating process ${id}:`, error);
    
    // Handle specific errors
    if (error.code === 'P2025') {
      return {
        success: false,
        error: 'Process not found'
      };
    }
    
    return {
      success: false,
      error: 'Failed to update process',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    };
  }
}); 