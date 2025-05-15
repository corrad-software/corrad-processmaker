import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  // Get the form ID from the route params
  const id = event.context.params.id;
  
  try {
    // Try to delete by UUID first
    let form;
    try {
      form = await prisma.form.delete({
        where: { formUUID: id }
      });
    } catch (e) {
      // If UUID not found, try numeric ID
      if (!isNaN(parseInt(id))) {
        form = await prisma.form.delete({
          where: { formID: parseInt(id) }
        });
      } else {
        throw e;
      }
    }
    
    return {
      success: true,
      message: 'Form deleted successfully'
    };
  } catch (error) {
    console.error(`Error deleting form ${id}:`, error);
    
    // Handle specific errors
    if (error.code === 'P2025') {
      return {
        success: false,
        error: 'Form not found'
      };
    }
    
    // Handle cases where the form has associated tasks
    if (error.code === 'P2003') {
      return {
        success: false,
        error: 'Cannot delete form because it is associated with one or more tasks'
      };
    }
    
    return {
      success: false,
      error: 'Failed to delete form',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    };
  }
}); 