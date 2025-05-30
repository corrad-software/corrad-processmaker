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

    // First, get the current form data to save to history
    let currentForm;
    try {
      currentForm = await prisma.form.findFirst({
        where: {
          OR: [
            { formUUID: id },
            { formID: !isNaN(parseInt(id)) ? parseInt(id) : -1 }
          ]
        }
      });
    } catch (e) {
      console.error('Error fetching current form for history:', e);
    }

    // If we found the current form, save it to history before updating
    if (currentForm) {
      try {
        // Get the next version number
        const lastHistory = await prisma.formHistory.findFirst({
          where: { formID: currentForm.formID },
          orderBy: { versionNumber: 'desc' }
        });
        
        const nextVersionNumber = lastHistory ? lastHistory.versionNumber + 1 : 1;

        // Save current form data to history
        await prisma.formHistory.create({
          data: {
            formID: currentForm.formID,
            formUUID: currentForm.formUUID,
            formName: currentForm.formName,
            formDescription: currentForm.formDescription,
            formComponents: currentForm.formComponents,
            formStatus: currentForm.formStatus,
            customCSS: currentForm.customCSS,
            customScript: currentForm.customScript,
            formEvents: currentForm.formEvents,
            scriptMode: currentForm.scriptMode,
            versionNumber: nextVersionNumber,
            changeDescription: body.changeDescription || null,
            savedBy: body.savedBy || currentForm.formCreatedBy,
            savedDate: currentForm.formModifiedDate || currentForm.formCreatedDate
          }
        });

        console.log(`Saved form ${currentForm.formUUID} version ${nextVersionNumber} to history`);
      } catch (historyError) {
        console.error('Error saving form to history:', historyError);
        // Continue with update even if history save fails
      }
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
    
    // Add the missing custom script and styling fields
    if (body.customScript !== undefined) {
      updateData.customScript = body.customScript;
    }
    
    if (body.customCSS !== undefined) {
      updateData.customCSS = body.customCSS;
    }
    
    if (body.formEvents !== undefined) {
      updateData.formEvents = body.formEvents;
    }
    
    if (body.scriptMode !== undefined) {
      updateData.scriptMode = body.scriptMode;
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
      form,
      versionSaved: currentForm ? true : false
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