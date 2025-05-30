import { PrismaClient } from '@prisma/client';
import { defineEventHandler, getRouterParam, readBody } from 'h3';

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

    // Check if the ID is a UUID or numeric ID
    const isUUID = processId.length === 36 && processId.includes('-');
    
    // Build update data
    const updateData = {};
    
    // Basic fields
    if (body.processName !== undefined) updateData.processName = body.processName;
    if (body.processDescription !== undefined) updateData.processDescription = body.processDescription;
    if (body.processCategory !== undefined) updateData.processCategory = body.processCategory;
    if (body.processPriority !== undefined) updateData.processPriority = body.processPriority;
    if (body.processOwner !== undefined) updateData.processOwner = body.processOwner;
    if (body.isTemplate !== undefined) updateData.isTemplate = body.isTemplate;
    if (body.templateCategory !== undefined) updateData.templateCategory = body.templateCategory;

    // Get current process to check status
    const currentProcess = await prisma.process.findFirst({
      where: isUUID 
        ? { processUUID: processId }
        : { processID: parseInt(processId) },
      select: { 
        processStatus: true, 
        processVersion: true 
      }
    });

    if (!currentProcess) {
      return {
        success: false,
        error: 'Process not found'
      };
    }

    // Handle status changes with validation
    if (body.processStatus !== undefined) {
      const currentStatus = currentProcess.processStatus;
      const newStatus = body.processStatus;
      
      // Validate status transitions
      if (currentStatus === 'published' && newStatus === 'draft') {
        // Allow unpublishing only if explicitly requested
        if (body.allowUnpublish !== true) {
          return {
            success: false,
            error: 'Cannot change published process to draft without explicit confirmation. Use allowUnpublish: true.'
          };
        }
      }
      
      updateData.processStatus = newStatus;
    }
    // If no status provided, preserve current status (don't change it)

    // Process definition (nodes, edges, viewport)
    if (body.nodes !== undefined || body.edges !== undefined || body.viewport !== undefined) {
      updateData.processDefinition = {
        nodes: body.nodes || [],
        edges: body.edges || [],
        viewport: body.viewport || { x: 0, y: 0, zoom: 1 }
      };
    }

    // Process variables
    if (body.variables !== undefined) {
      updateData.processVariables = Object.keys(body.variables).length > 0 ? body.variables : null;
    }

    // Process settings
    if (body.settings !== undefined) {
      updateData.processSettings = Object.keys(body.settings).length > 0 ? body.settings : null;
    }

    // Process permissions
    if (body.permissions !== undefined) {
      updateData.processPermissions = Object.keys(body.permissions).length > 0 ? body.permissions : null;
    }

    // Version increment if major changes
    if (body.incrementVersion === true) {
      updateData.processVersion = currentProcess.processVersion + 1;
    }

    // Update the process
    const updatedProcess = await prisma.process.update({
      where: isUUID 
        ? { processUUID: processId }
        : { processID: parseInt(processId) },
      data: updateData,
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
      process: updatedProcess
    };
  } catch (error) {
    console.error('Error updating process:', error);
    
    // Handle specific Prisma errors
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