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
    if (!body.versionNumber && !body.historyID) {
      return {
        success: false,
        error: 'Either versionNumber or historyID is required'
      };
    }

    // First, find the form to get its internal ID
    let form;
    try {
      form = await prisma.form.findFirst({
        where: {
          OR: [
            { formUUID: id },
            { formID: !isNaN(parseInt(id)) ? parseInt(id) : -1 }
          ]
        }
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

    // Find the specific version to restore
    let historyEntry;
    if (body.historyID) {
      historyEntry = await prisma.formHistory.findFirst({
        where: {
          historyID: body.historyID,
          formID: form.formID
        }
      });
    } else {
      historyEntry = await prisma.formHistory.findFirst({
        where: {
          formID: form.formID,
          versionNumber: body.versionNumber
        }
      });
    }

    if (!historyEntry) {
      return {
        success: false,
        error: 'Version not found in history'
      };
    }

    // Save current form to history before restoring (creating a new version)
    try {
      // Get the next version number
      const lastHistory = await prisma.formHistory.findFirst({
        where: { formID: form.formID },
        orderBy: { versionNumber: 'desc' }
      });
      
      const nextVersionNumber = lastHistory ? lastHistory.versionNumber + 1 : 1;

      // Save current state to history
      await prisma.formHistory.create({
        data: {
          formID: form.formID,
          formUUID: form.formUUID,
          formName: form.formName,
          formDescription: form.formDescription,
          formComponents: form.formComponents,
          formStatus: form.formStatus,
          customCSS: form.customCSS,
          customScript: form.customScript,
          formEvents: form.formEvents,
          scriptMode: form.scriptMode,
          versionNumber: nextVersionNumber,
          changeDescription: `Pre-restore backup before restoring to version ${historyEntry.versionNumber}`,
          savedBy: body.restoredBy || form.formCreatedBy,
          savedDate: form.formModifiedDate || form.formCreatedDate
        }
      });
    } catch (historyError) {
      console.error('Error creating pre-restore backup:', historyError);
      // Continue with restore even if backup fails
    }

    // Restore the form to the selected version
    const restoredForm = await prisma.form.update({
      where: { formID: form.formID },
      data: {
        formName: historyEntry.formName,
        formDescription: historyEntry.formDescription,
        formComponents: historyEntry.formComponents,
        formStatus: historyEntry.formStatus,
        customCSS: historyEntry.customCSS,
        customScript: historyEntry.customScript,
        formEvents: historyEntry.formEvents,
        scriptMode: historyEntry.scriptMode,
        formModifiedDate: new Date()
      }
    });

    // Create a history entry for the restore action
    try {
      const lastHistoryAfterRestore = await prisma.formHistory.findFirst({
        where: { formID: form.formID },
        orderBy: { versionNumber: 'desc' }
      });
      
      const nextVersionAfterRestore = lastHistoryAfterRestore ? lastHistoryAfterRestore.versionNumber + 1 : 1;

      await prisma.formHistory.create({
        data: {
          formID: form.formID,
          formUUID: form.formUUID,
          formName: historyEntry.formName,
          formDescription: historyEntry.formDescription,
          formComponents: historyEntry.formComponents,
          formStatus: historyEntry.formStatus,
          customCSS: historyEntry.customCSS,
          customScript: historyEntry.customScript,
          formEvents: historyEntry.formEvents,
          scriptMode: historyEntry.scriptMode,
          versionNumber: nextVersionAfterRestore,
          changeDescription: `Restored from version ${historyEntry.versionNumber}`,
          savedBy: body.restoredBy || form.formCreatedBy,
          savedDate: new Date()
        }
      });
    } catch (restoreHistoryError) {
      console.error('Error creating restore history entry:', restoreHistoryError);
    }

    return {
      success: true,
      form: restoredForm,
      restoredFromVersion: historyEntry.versionNumber,
      restoredFromDate: historyEntry.savedDate,
      message: `Form successfully restored to version ${historyEntry.versionNumber}`
    };
  } catch (error) {
    console.error(`Error restoring form ${id}:`, error);
    
    return {
      success: false,
      error: 'Failed to restore form',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    };
  }
}); 