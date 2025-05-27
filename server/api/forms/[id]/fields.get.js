import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const formId = event.context.params.id;
    
    if (!formId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Form ID is required'
      });
    }

    // Fetch the form from database
    const form = await prisma.form.findFirst({
      where: {
        OR: [
          { formID: parseInt(formId) || -1 },
          { formUUID: formId }
        ]
      },
      select: {
        formID: true,
        formUUID: true,
        formName: true,
        formComponents: true
      }
    });

    if (!form) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Form not found'
      });
    }

    // Extract form fields from the form components
    const formFields = [];
    
    if (form.formComponents && Array.isArray(form.formComponents)) {
      form.formComponents.forEach(component => {
        // Only include components that have names (actual form fields)
        if (component.props && component.props.name) {
          // Filter out non-input components
          const inputTypes = [
            'text', 'textarea', 'number', 'email', 'password', 'url', 'tel', 
            'select', 'checkbox', 'radio', 'switch', 'date', 'time', 
            'datetime-local', 'range', 'color', 'file', 'otp', 'dropzone',
            'mask', 'hidden'
          ];
          
          if (inputTypes.includes(component.type)) {
            formFields.push({
              name: component.props.name,
              label: component.props.label || component.props.name,
              type: component.type,
              required: component.props.validation && component.props.validation.includes('required'),
              description: component.props.help || ''
            });
          }
        }
      });
    }

    return {
      success: true,
      form: {
        id: form.formID,
        uuid: form.formUUID,
        name: form.formName
      },
      fields: formFields
    };

  } catch (error) {
    console.error('Error fetching form fields:', error);
    
    if (error.statusCode) {
      throw error;
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch form fields'
    });
  } finally {
    await prisma.$disconnect();
  }
}); 