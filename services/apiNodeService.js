/**
 * API Node Service
 * 
 * This service handles the execution of API Call nodes in the process flow.
 * It supports dynamic variable substitution in URLs, headers, and request bodies.
 */

// Helper function to substitute process variables in a string
// Example: "Hello {name}" with {name: "World"} becomes "Hello World"
function substituteVariables(text, variables) {
  if (!text || typeof text !== 'string') return text;
  
  return text.replace(/{([^{}]+)}/g, (match, variableName) => {
    const variable = variables[variableName.trim()];
    return variable !== undefined ? variable : match;
  });
}

// Helper function to substitute variables in a JSON object or string
function substituteVariablesInObject(obj, variables) {
  if (typeof obj === 'string') {
    try {
      // If it's a JSON string, parse it, substitute, then stringify
      const parsed = JSON.parse(obj);
      return JSON.stringify(substituteVariablesInObject(parsed, variables));
    } catch (e) {
      // If it's not valid JSON, treat as regular string
      return substituteVariables(obj, variables);
    }
  }
  
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  
  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => substituteVariablesInObject(item, variables));
  }
  
  // Handle objects
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = substituteVariablesInObject(value, variables);
  }
  
  return result;
}

// Execute an API call based on node configuration
export async function executeApiCall(nodeConfig, processVariables) {
  const {
    apiMethod = 'GET',
    apiUrl = '',
    requestBody = '',
    headers = '{ "Content-Type": "application/json" }',
    outputVariable = 'apiResponse',
    errorVariable = 'apiError',
    continueOnError = false
  } = nodeConfig;
  
  // Combine global and process variables
  const allVariables = {
    ...processVariables.global || {},
    ...processVariables.process || {},
    ...processVariables
  };
  
  // Substitute variables in URL
  const processedUrl = substituteVariables(apiUrl, allVariables);
  
  // Parse and process headers
  let processedHeaders = {};
  try {
    if (typeof headers === 'string') {
      processedHeaders = JSON.parse(headers);
    } else if (typeof headers === 'object' && headers !== null) {
      processedHeaders = headers;
    }
    
    // Substitute variables in headers
    processedHeaders = substituteVariablesInObject(processedHeaders, allVariables);
  } catch (error) {
    console.error('Error processing headers:', error);
    processedHeaders = { 'Content-Type': 'application/json' };
  }
  
  // Prepare request options
  const options = {
    method: apiMethod,
    headers: processedHeaders
  };
  
  // Add request body for appropriate methods
  if (['POST', 'PUT', 'PATCH'].includes(apiMethod) && requestBody) {
    let processedBody;
    
    try {
      // Try to parse as JSON if it's a string
      if (typeof requestBody === 'string') {
        const bodyObj = JSON.parse(requestBody);
        processedBody = substituteVariablesInObject(bodyObj, allVariables);
        options.body = JSON.stringify(processedBody);
      } else {
        // If it's already an object
        processedBody = substituteVariablesInObject(requestBody, allVariables);
        options.body = JSON.stringify(processedBody);
      }
    } catch (error) {
      // If not valid JSON, treat as string with variable substitution
      options.body = substituteVariables(requestBody, allVariables);
    }
  }
  
  // Create result object
  const result = {
    outputVariable,
    errorVariable,
    continueOnError,
    outputScope: 'global', // Specify that output should go to global variables
    success: false,
    data: null,
    error: null
  };
  
  try {
    // Make the API call
    const response = await fetch(processedUrl, options);
    
    // Get response data
    let responseData;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }
    
    // Store result data
    result.success = response.ok;
    result.data = {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries([...response.headers.entries()]),
      data: responseData
    };
    
    // If not successful, also store as error
    if (!response.ok) {
      result.error = {
        message: `API call failed with status ${response.status}`,
        status: response.status,
        statusText: response.statusText,
        data: responseData
      };
    }
  } catch (error) {
    // Handle network or other errors
    result.success = false;
    result.error = {
      message: error.message || 'Unknown error occurred during API call',
      stack: error.stack,
      name: error.name
    };
  }
  
  return result;
}

export default {
  executeApiCall
}; 