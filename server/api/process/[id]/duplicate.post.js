import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

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

    // Parse the request body for optional parameters
    const body = await readBody(event);
    const { newName, asTemplate = false } = body;

    // Check if the ID is a UUID or numeric ID
    const isUUID = processId.length === 36 && processId.includes('-');
    
    // Find the source process
    const sourceProcess = await prisma.process.findFirst({
      where: isUUID 
        ? { processUUID: processId }
        : { processID: parseInt(processId) }
    });

    if (!sourceProcess) {
      return {
        success: false,
        error: 'Source process not found'
      };
    }

    // Generate new IDs for all nodes and edges in the definition
    const newDefinition = JSON.parse(JSON.stringify(sourceProcess.processDefinition));
    const nodeIdMap = new Map();

    // Update node IDs
    if (newDefinition.nodes) {
      newDefinition.nodes.forEach(node => {
        const oldId = node.id;
        const newId = uuidv4();
        nodeIdMap.set(oldId, newId);
        node.id = newId;
      });
    }

    // Update edge IDs and references
    if (newDefinition.edges) {
      newDefinition.edges.forEach(edge => {
        edge.id = uuidv4();
        edge.source = nodeIdMap.get(edge.source) || edge.source;
        edge.target = nodeIdMap.get(edge.target) || edge.target;
      });
    }

    // Create the duplicate process
    const duplicatedProcess = await prisma.process.create({
      data: {
        processUUID: uuidv4(),
        processName: newName || `${sourceProcess.processName} (Copy)`,
        processDescription: sourceProcess.processDescription,
        processCategory: sourceProcess.processCategory,
        processPriority: sourceProcess.processPriority,
        processOwner: sourceProcess.processOwner,
        processDefinition: newDefinition,
        processVariables: sourceProcess.processVariables,
        processSettings: sourceProcess.processSettings,
        processPermissions: sourceProcess.processPermissions,
        processStatus: 'draft', // Always start as draft
        isTemplate: asTemplate,
        templateCategory: asTemplate ? sourceProcess.templateCategory : null,
        processCreatedBy: body.createdBy || sourceProcess.processCreatedBy
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
      message: 'Process duplicated successfully',
      process: duplicatedProcess
    };
  } catch (error) {
    console.error('Error duplicating process:', error);
    
    // Handle specific Prisma errors
    if (error.code === 'P2025') {
      return {
        success: false,
        error: 'Source process not found'
      };
    }
    
    return {
      success: false,
      error: 'Failed to duplicate process',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    };
  }
}); 