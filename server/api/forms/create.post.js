import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

// Initialize Prisma client
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
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
    
    // Create a new form in the database
    const form = await prisma.form.create({
      data: {
        formUUID: uuidv4(),
        formName: body.formName,
        formDescription: body.formDescription || null,
        formComponents: body.components || [],
        formStatus: body.status || 'active',
        formCreatedBy: body.createdBy || null // In a real app, this would come from the authenticated user
      }
    });
    
    return {
      success: true,
      form
    };
  } catch (error) {
    console.error('Error creating form:', error);
    
    return {
      success: false,
      error: 'Failed to create form',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    };
  }
}); 