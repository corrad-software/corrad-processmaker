import { executeApiCall } from '../../../services/apiNodeService';

/**
 * Test API Node Endpoint
 * 
 * This endpoint allows testing API node configurations without executing
 * the entire process. It takes the node configuration and process variables
 * as input and returns the API call result.
 */
export default defineEventHandler(async (event) => {
  try {
    // Get request body
    const body = await readBody(event);
    
    // Extract node configuration and process variables
    const { nodeConfig, processVariables } = body;
    
    // Validate input
    if (!nodeConfig || !nodeConfig.apiUrl) {
      return {
        success: false,
        error: {
          message: 'Invalid API node configuration. Missing apiUrl.'
        }
      };
    }
    
    // Structure the variables for the API call
    const structuredVariables = {
      global: {},
      process: {},
      ...processVariables
    };
    
    // Categorize variables by scope if they're not already structured
    if (!processVariables.global && !processVariables.process) {
      Object.entries(processVariables || {}).forEach(([name, value]) => {
        // Determine which variables are global based on the presence of an actual variable in the store
        // This would usually be handled by the process execution engine
        if (name === nodeConfig.outputVariable || name === nodeConfig.errorVariable) {
          structuredVariables.global[name] = value;
        } else {
          structuredVariables.process[name] = value;
        }
      });
    }
    
    // Execute the API call
    const result = await executeApiCall(nodeConfig, structuredVariables);
    
    // Update global variables with the result
    if (result.success && nodeConfig.outputVariable) {
      structuredVariables.global[nodeConfig.outputVariable] = result.data;
    } else if (!result.success && nodeConfig.errorVariable) {
      structuredVariables.global[nodeConfig.errorVariable] = result.error;
    }
    
    // Add the updated variables to the result
    result.variables = structuredVariables;
    
    // Return the result
    return result;
  } catch (error) {
    // Handle errors
    return {
      success: false,
      error: {
        message: error.message || 'An error occurred while testing the API node',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    };
  }
}); 