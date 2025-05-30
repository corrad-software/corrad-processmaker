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

    // Prepare process definition
    const processDefinition = {
      nodes: body.nodes || [],
      edges: body.edges || [],
      viewport: body.viewport || { x: 0, y: 0, zoom: 1 }
    };

    // Prepare process variables (if any)
    const processVariables = body.variables || {};

    // Prepare process settings (if any)
    const processSettings = body.settings || {};

    // Prepare process permissions (if any)
    const processPermissions = body.permissions || {};
    
    // Create a new process in the database
    const process = await prisma.process.create({
      data: {
        processUUID: uuidv4(),
        processName: body.processName,
        processDescription: body.processDescription || null,
        processCategory: body.processCategory || null,
        processPriority: body.processPriority || 'normal',
        processOwner: body.processOwner || null,
        processDefinition: processDefinition,
        processVariables: Object.keys(processVariables).length > 0 ? processVariables : null,
        processSettings: Object.keys(processSettings).length > 0 ? processSettings : null,
        processPermissions: Object.keys(processPermissions).length > 0 ? processPermissions : null,
        processStatus: body.processStatus || 'draft',
        isTemplate: body.isTemplate || false,
        templateCategory: body.templateCategory || null,
        processCreatedBy: body.createdBy || null // In a real app, this would come from the authenticated user
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