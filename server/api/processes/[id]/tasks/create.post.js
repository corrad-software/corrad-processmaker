import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

// Initialize Prisma client
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  // Get the process ID from the route params
  const processId = event.context.params.id;
  
  try {
    // Parse the request body
    const body = await readBody(event);
    
    // Validate required fields
    if (!body.taskName || !body.taskType || !body.taskNodeId) {
      return {
        success: false,
        error: 'Task name, type, and node ID are required'
      };
    }
    
    // Find the process
    let process;
    
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(processId)) {
      // If it looks like a UUID
      process = await prisma.process.findUnique({
        where: { processUUID: processId }
      });
    } else if (!isNaN(parseInt(processId))) {
      // If it's a numeric ID
      process = await prisma.process.findUnique({
        where: { processID: parseInt(processId) }
      });
    }
    
    if (!process) {
      return {
        success: false,
        error: 'Process not found'
      };
    }
    
    // Create a new task
    const task = await prisma.task.create({
      data: {
        taskUUID: uuidv4(),
        taskNodeId: body.taskNodeId,
        taskName: body.taskName,
        taskType: body.taskType,
        taskData: body.taskData || {},
        taskProcessId: process.processID,
        taskAssigneeId: body.assigneeId || null
      }
    });
    
    return {
      success: true,
      task
    };
  } catch (error) {
    console.error(`Error creating task for process ${processId}:`, error);
    
    return {
      success: false,
      error: 'Failed to create task',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    };
  }
}); 