import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  // Get the form ID from the route params
  const id = event.context.params.id;
  
  try {
    // Try to find by UUID first
    let form = await prisma.form.findUnique({
      where: {
        formUUID: id
      },
      include: {
        creator: {
          select: {
            userID: true,
            userFullName: true
          }
        }
      }
    });
    
    // If not found, try to find by numeric ID
    if (!form && !isNaN(parseInt(id))) {
      form = await prisma.form.findUnique({
        where: {
          formID: parseInt(id)
        },
        include: {
          creator: {
            select: {
              userID: true,
              userFullName: true
            }
          }
        }
      });
    }
    
    // If form not found, return 404
    if (!form) {
      return {
        success: false,
        error: 'Form not found'
      };
    }
    
    return {
      success: true,
      form
    };
  } catch (error) {
    console.error(`Error fetching form ${id}:`, error);
    
    return {
      success: false,
      error: 'Failed to fetch form',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    };
  }
}); 