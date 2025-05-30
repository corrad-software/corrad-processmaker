import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  // Get the form ID and version ID from the route params
  const { id: formId, versionId } = event.context.params;
  
  try {
    // First, find the form to get its internal ID
    let form;
    try {
      form = await prisma.form.findFirst({
        where: {
          OR: [
            { formUUID: formId },
            { formID: !isNaN(parseInt(formId)) ? parseInt(formId) : -1 }
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

    // Find the specific version - can be either historyID or versionNumber
    let historyEntry;
    
    if (!isNaN(parseInt(versionId))) {
      // Try as historyID first
      historyEntry = await prisma.formHistory.findFirst({
        where: {
          historyID: parseInt(versionId),
          formID: form.formID
        },
        include: {
          savedByUser: {
            select: {
              userID: true,
              userFullName: true,
              userUsername: true
            }
          }
        }
      });

      // If not found, try as versionNumber
      if (!historyEntry) {
        historyEntry = await prisma.formHistory.findFirst({
          where: {
            formID: form.formID,
            versionNumber: parseInt(versionId)
          },
          include: {
            savedByUser: {
              select: {
                userID: true,
                userFullName: true,
                userUsername: true
              }
            }
          }
        });
      }
    }

    if (!historyEntry) {
      return {
        success: false,
        error: 'Version not found'
      };
    }

    // Get adjacent versions for navigation
    const previousVersion = await prisma.formHistory.findFirst({
      where: {
        formID: form.formID,
        versionNumber: { lt: historyEntry.versionNumber }
      },
      orderBy: { versionNumber: 'desc' },
      select: { historyID: true, versionNumber: true, savedDate: true }
    });

    const nextVersion = await prisma.formHistory.findFirst({
      where: {
        formID: form.formID,
        versionNumber: { gt: historyEntry.versionNumber }
      },
      orderBy: { versionNumber: 'asc' },
      select: { historyID: true, versionNumber: true, savedDate: true }
    });

    // Get total version count
    const totalVersions = await prisma.formHistory.count({
      where: { formID: form.formID }
    });

    return {
      success: true,
      version: historyEntry,
      navigation: {
        previous: previousVersion,
        next: nextVersion,
        totalVersions,
        currentPosition: historyEntry.versionNumber
      },
      formInfo: {
        formID: form.formID,
        formUUID: form.formUUID,
        formName: form.formName
      }
    };
  } catch (error) {
    console.error(`Error fetching form version ${formId}/${versionId}:`, error);
    
    return {
      success: false,
      error: 'Failed to fetch form version',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    };
  }
}); 