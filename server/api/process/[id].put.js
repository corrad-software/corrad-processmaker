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
    
    // Validate required fields
    if (!body.processName) {
      return {
        success: false,
        error: 'Process name is required'
      };
    }

    // Check if the ID is a UUID or numeric ID
    const isUUID = processId.length === 36 && processId.includes('-');
    
    // Find the existing process first to save its current state to history
    const existingProcess = await prisma.process.findFirst({
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

    if (!existingProcess) {
      return {
        success: false,
        error: 'Process not found'
      };
    }

    // Get the next version number for history
    const lastHistory = await prisma.processHistory.findFirst({
      where: { processID: existingProcess.processID },
      orderBy: { versionNumber: 'desc' },
      select: { versionNumber: true }
    });

    const nextVersionNumber = (lastHistory?.versionNumber || 0) + 1;

    // Save current state to history before updating
    await prisma.processHistory.create({
      data: {
        processID: existingProcess.processID,
        processUUID: existingProcess.processUUID,
        processName: existingProcess.processName,
        processDescription: existingProcess.processDescription,
        processDefinition: existingProcess.processDefinition,
        processVersion: existingProcess.processVersion,
        processStatus: existingProcess.processStatus,
        processCategory: existingProcess.processCategory,
        processOwner: existingProcess.processOwner,
        processPermissions: existingProcess.processPermissions,
        processPriority: existingProcess.processPriority,
        processSettings: existingProcess.processSettings,
        processVariables: existingProcess.processVariables,
        templateCategory: existingProcess.templateCategory,
        versionNumber: nextVersionNumber,
        changeDescription: body.changeDescription || null,
        savedBy: body.savedBy || existingProcess.processCreatedBy
      }
    });

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

    // Update the process
    const updatedProcess = await prisma.process.update({
      where: isUUID 
        ? { processUUID: processId }
        : { processID: parseInt(processId) },
      data: {
        processName: body.processName,
        processDescription: body.processDescription || null,
        processCategory: body.processCategory || null,
        processPriority: body.processPriority || 'normal',
        processOwner: body.processOwner || null,
        processDefinition: processDefinition,
        processVariables: Object.keys(processVariables).length > 0 ? processVariables : null,
        processSettings: Object.keys(processSettings).length > 0 ? processSettings : null,
        processPermissions: Object.keys(processPermissions).length > 0 ? processPermissions : null,
        processStatus: body.processStatus || existingProcess.processStatus,
        processVersion: existingProcess.processVersion + 1
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
      process: updatedProcess,
      message: 'Process updated successfully and previous version saved to history'
    };
  } catch (error) {
    console.error('Error updating process:', error);
    
    return {
      success: false,
      error: 'Failed to update process',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    };
  }
});