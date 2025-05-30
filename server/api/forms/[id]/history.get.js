import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  // Get the form ID from the route params
  const id = event.context.params.id;
  
  try {
    // First, find the form to get its internal ID
    let form;
    try {
      form = await prisma.form.findFirst({
        where: {
          OR: [
            { formUUID: id },
            { formID: !isNaN(parseInt(id)) ? parseInt(id) : -1 }
          ]
        },
        select: { formID: true, formUUID: true, formName: true }
      });
    } catch (e) {
      throw new Error('Form not found');
    }

    if (!form) {
      return {
        success: false,
        error: 'Form not found'
      };
    }

    // Get all history entries for this form
    const history = await prisma.formHistory.findMany({
      where: { formID: form.formID },
      include: {
        savedByUser: {
          select: {
            userID: true,
            userFullName: true,
            userUsername: true
          }
        }
      },
      orderBy: { versionNumber: 'desc' }
    });

    // Get current form info for comparison
    const currentForm = await prisma.form.findUnique({
      where: { formID: form.formID },
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
      form: {
        formID: form.formID,
        formUUID: form.formUUID,
        formName: form.formName
      },
      currentVersion: currentForm,
      history,
      totalVersions: history.length
    };
  } catch (error) {
    console.error(`Error fetching form history for ${id}:`, error);
    
    return {
      success: false,
      error: 'Failed to fetch form history',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    };
  }
}); 