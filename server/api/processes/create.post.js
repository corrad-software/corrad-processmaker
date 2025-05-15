import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

// Initialize Prisma client
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
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
    
    // Create a new process in the database
    const process = await prisma.process.create({
      data: {
        processUUID: uuidv4(),
        processName: body.processName,
        processDescription: body.processDescription || null,
        processDefinition: body.definition || { nodes: [], edges: [] },
        processVersion: 1,
        processStatus: body.status || 'draft',
        processCreatedBy: body.createdBy || null // In a real app, this would come from the authenticated user
      }
    });
    
    return {
      success: true,
      process
    };
  } catch (error) {
    console.error('Error creating process:', error);
    
    return {
      success: false,
      error: 'Failed to create process',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    };
  }
}); 