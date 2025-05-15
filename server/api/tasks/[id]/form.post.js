import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  // Get the task ID from the route params
  const taskId = event.context.params.id;
  
  try {
    // Parse the request body
    const body = await readBody(event);
    
    // Validate required fields
    if (!body.formId) {
      return {
        success: false,
        error: 'Form ID is required'
      };
    }
    
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
    
    // Find the form
    let form;
    const formId = body.formId;
    
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(formId)) {
      // If it looks like a UUID
      form = await prisma.form.findUnique({
        where: { formUUID: formId }
      });
    } else if (!isNaN(parseInt(formId))) {
      // If it's a numeric ID
      form = await prisma.form.findUnique({
        where: { formID: parseInt(formId) }
      });
    }
    
    if (!form) {
      return {
        success: false,
        error: 'Form not found'
      };
    }
    
    // Link the form to the task
    const updatedTask = await prisma.task.update({
      where: {
        taskID: task.taskID
      },
      data: {
        taskFormId: form.formID,
        taskData: {
          ...task.taskData,
          formName: form.formName,
          formId: form.formID,
          formUuid: form.formUUID
        }
      },
      include: {
        form: true
      }
    });
    
    return {
      success: true,
      task: updatedTask
    };
  } catch (error) {
    console.error(`Error connecting form to task ${taskId}:`, error);
    
    return {
      success: false,
      error: 'Failed to connect form to task',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    };
  }
}); 