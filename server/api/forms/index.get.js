import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    // Get all active forms
    const forms = await prisma.form.findMany({
      where: {
        formStatus: 'active'
      },
      orderBy: {
        formCreatedDate: 'desc'
      },
      select: {
        formID: true,
        formUUID: true,
        formName: true,
        formDescription: true,
        formStatus: true,
        formCreatedDate: true,
        formModifiedDate: true,
        // Don't include the full components data to keep response size small
        creator: {
          select: {
            userID: true,
            userFullName: true
          }
        }
      }
    });

    return {
      success: true,
      forms
    };
  } catch (error) {
    console.error('Error fetching forms:', error);
    
    return {
      success: false,
      error: 'Failed to fetch forms',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    };
  }
}); 