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
    
    // First, get the current process to validate it can be published
    const currentProcess = await prisma.process.findFirst({
      where: isUUID 
        ? { processUUID: processId }
        : { processID: parseInt(processId) }
    });

    if (!currentProcess) {
      return {
        success: false,
        error: 'Process not found'
      };
    }

    // Validate the process has required elements for publishing
    const definition = currentProcess.processDefinition;
    
    // Check if process has at least one start node
    const hasStartNode = definition.nodes?.some(node => node.type === 'start');
    if (!hasStartNode) {
      return {
        success: false,
        error: 'Process must have at least one start node to be published'
      };
    }

    // Check if process has at least one end node
    const hasEndNode = definition.nodes?.some(node => node.type === 'end');
    if (!hasEndNode) {
      return {
        success: false,
        error: 'Process must have at least one end node to be published'
      };
    }

    // Check if all nodes are properly connected (basic validation)
    const nodeIds = new Set(definition.nodes?.map(node => node.id) || []);
    const connectedNodes = new Set();
    
    definition.edges?.forEach(edge => {
      connectedNodes.add(edge.source);
      connectedNodes.add(edge.target);
    });

    // Ensure all non-start/end nodes are connected
    const unconnectedNodes = definition.nodes?.filter(node => 
      node.type !== 'start' && 
      node.type !== 'end' && 
      !connectedNodes.has(node.id)
    ) || [];

    if (unconnectedNodes.length > 0) {
      return {
        success: false,
        error: `Process has unconnected nodes: ${unconnectedNodes.map(n => n.label || n.id).join(', ')}`
      };
    }

    // Update the process status to published and increment version
    const publishedProcess = await prisma.process.update({
      where: isUUID 
        ? { processUUID: processId }
        : { processID: parseInt(processId) },
      data: {
        processStatus: 'published',
        processVersion: currentProcess.processVersion + 1
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
      message: 'Process published successfully',
      process: publishedProcess
    };
  } catch (error) {
    console.error('Error publishing process:', error);
    
    // Handle specific Prisma errors
    if (error.code === 'P2025') {
      return {
        success: false,
        error: 'Process not found'
      };
    }
    
    return {
      success: false,
      error: 'Failed to publish process',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    };
  }
}); 