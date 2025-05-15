import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  // Get the task ID from the route params
  const taskId = event.context.params.id;
  
  try {
    // Find the task
    let task;
    
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(taskId)) {
      // If it looks like a UUID
      task = await prisma.task.findUnique({
        where: { taskUUID: taskId }
      });
    } else if (!isNaN(parseInt(taskId))) {
      // If it's a numeric ID
      task = await prisma.task.findUnique({
        where: { taskID: parseInt(taskId) }
      });
    }
    
    if (!task) {
      return {
        success: false,
        error: 'Task not found'
      };
    }
    
    // Prepare task data without form information
    let taskData = task.taskData || {};
    delete taskData.formName;
    delete taskData.formId;
    delete taskData.formUuid;
    
    // Unlink the form from the task
    const updatedTask = await prisma.task.update({
      where: {
        taskID: task.taskID
      },
      data: {
        taskFormId: null,
        taskData: taskData
      }
    });
    
    return {
      success: true,
      task: updatedTask
    };
  } catch (error) {
    console.error(`Error removing form from task ${taskId}:`, error);
    
    return {
      success: false,
      error: 'Failed to remove form from task',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    };
  }
}); 