import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  // Get the form ID from the route params
  const id = event.context.params.id;
  
  try {
    // Parse the request body
    const body = await readBody(event);
    
    // Validate required fields
    if (!body.formName) {
      return {
        success: false,
        error: 'Form name is required'
      };
    }
    
    // Prepare update data
    const updateData = {
      formName: body.formName,
      formComponents: body.components || [],
      formModifiedDate: new Date()
    };
    
    // Add optional fields if provided
    if (body.formDescription !== undefined) {
      updateData.formDescription = body.formDescription;
    }
    
    if (body.status !== undefined) {
      updateData.formStatus = body.status;
    }
    
    // Try to update by UUID first
    let form;
    try {
      form = await prisma.form.update({
        where: { formUUID: id },
        data: updateData
      });
    } catch (e) {
      // If UUID not found, try numeric ID
      if (!isNaN(parseInt(id))) {
        form = await prisma.form.update({
          where: { formID: parseInt(id) },
          data: updateData
        });
      } else {
        throw e;
      }
    }
    
    return {
      success: true,
      form
    };
  } catch (error) {
    console.error(`Error updating form ${id}:`, error);
    
    // Handle specific errors
    if (error.code === 'P2025') {
      return {
        success: false,
        error: 'Form not found'
      };
    }
    
    return {
      success: false,
      error: 'Failed to update form',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    };
  }
}); 