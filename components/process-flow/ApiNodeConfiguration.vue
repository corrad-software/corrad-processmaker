<template>
  <div class="api-node-configuration">
    <!-- Step 1: Basic configuration -->
    <div class="mb-6 bg-gray-50 p-4 rounded-md border border-gray-200">
      <div class="flex items-center mb-3">
        <div class="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
          <span class="text-xs font-semibold text-indigo-600">1</span>
        </div>
        <h4 class="font-medium">Basic Configuration</h4>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- HTTP Method -->
        <div>
          <label for="apiMethod" class="block text-sm font-medium text-gray-700 mb-1">HTTP Method</label>
          <select
            id="apiMethod"
            v-model="localNodeData.apiMethod"
            class="w-full p-2 border rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 text-sm"
            @change="saveChanges"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="PATCH">PATCH</option>
            <option value="DELETE">DELETE</option>
          </select>
          <p class="mt-1 text-xs text-gray-500">
            The HTTP method determines how the API call interacts with the endpoint.
          </p>
        </div>
        
        <!-- API URL -->
        <div>
          <label for="apiUrl" class="block text-sm font-medium text-gray-700 mb-1">API URL</label>
          <input
            id="apiUrl"
            v-model="localNodeData.apiUrl"
            type="text"
            class="w-full p-2 border rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 text-sm"
            placeholder="https://example.com/api/endpoint"
            @blur="saveChanges"
          />
          <p class="mt-1 text-xs text-gray-500">
            Use variables with <code class="bg-gray-100 px-1">{variableName}</code> syntax, e.g.: <code class="bg-gray-100 px-1">https://api.example.com/users/{userId}</code>
          </p>
        </div>
      </div>
    </div>
    
    <!-- Step 2: Headers and Body -->
    <div class="mb-6 bg-gray-50 p-4 rounded-md border border-gray-200">
      <div class="flex items-center mb-3">
        <div class="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
          <span class="text-xs font-semibold text-indigo-600">2</span>
        </div>
        <h4 class="font-medium">Request Configuration</h4>
      </div>
      
      <!-- Headers -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">Headers</label>
        <div class="bg-white p-3 border rounded-md shadow-sm">
          <div class="flex gap-2 mb-2">
            <select
              class="form-select text-sm flex-grow"
              @change="insertVariable($event.target.value, 'headers')"
            >
              <option value="">Insert Variable...</option>
              <option
                v-for="variable in availableVariables"
                :key="variable.name"
                :value="variable.name"
              >
                {{ variable.label }}
              </option>
            </select>
            <RsButton
              variant="secondary"
              size="sm"
              @click="formatJson('headers')"
              title="Format JSON"
              class="flex-shrink-0"
            >
              <Icon name="material-symbols:format-align-left" />
              Format
            </RsButton>
          </div>
          <textarea
            id="headers"
            v-model="localNodeData.headers"
            class="w-full p-2 border rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 text-sm font-mono"
            placeholder='{ "Authorization": "Bearer {accessToken}" }'
            rows="4"
            @blur="saveChanges"
          ></textarea>
          <p class="mt-1 text-xs text-gray-500">
            Set HTTP headers as a JSON object. Use variables with <code class="bg-gray-100 px-1">{variableName}</code> syntax.
          </p>
          
          <!-- Headers Preview -->
          <div v-if="localNodeData.headers" class="mt-3 pt-3 border-t border-gray-200">
            <div class="text-xs font-medium text-gray-700 mb-1">Preview with Current Values:</div>
            <div class="bg-gray-50 border rounded p-2">
              <pre class="text-xs font-mono whitespace-pre-wrap">{{ getPreviewWithValues('headers') }}</pre>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Request Body - show only for POST, PUT, PATCH -->
      <div v-if="showRequestBody" class="mt-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">Request Body</label>
        <div class="bg-white p-3 border rounded-md shadow-sm">
          <div class="flex gap-2 mb-2">
            <select
              class="form-select text-sm flex-grow"
              @change="insertVariable($event.target.value, 'requestBody')"
            >
              <option value="">Insert Variable...</option>
              <option
                v-for="variable in availableVariables"
                :key="variable.name"
                :value="variable.name"
              >
                {{ variable.label }}
              </option>
            </select>
            <RsButton
              variant="secondary"
              size="sm"
              @click="formatJson('requestBody')"
              title="Format JSON"
              class="flex-shrink-0"
            >
              <Icon name="material-symbols:format-align-left" />
              Format
            </RsButton>
          </div>
          <textarea
            id="requestBody"
            v-model="localNodeData.requestBody"
            class="w-full p-2 border rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 text-sm font-mono"
            placeholder='{ "key": "value", "userId": "{userId}" }'
            rows="6"
            @blur="saveChanges"
          ></textarea>
          <p class="mt-1 text-xs text-gray-500">
            Request body to send with the API call. Use variables with <code class="bg-gray-100 px-1">{variableName}</code> syntax.
          </p>
          
          <!-- Request Body Preview -->
          <div v-if="localNodeData.requestBody" class="mt-3 pt-3 border-t border-gray-200">
            <div class="text-xs font-medium text-gray-700 mb-1">Preview with Current Values:</div>
            <div class="bg-gray-50 border rounded p-2">
              <pre class="text-xs font-mono whitespace-pre-wrap">{{ getPreviewWithValues('requestBody') }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Step 3: Response Handling -->
    <div class="mb-6 bg-gray-50 p-4 rounded-md border border-gray-200">
      <div class="flex items-center mb-3">
        <div class="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
          <span class="text-xs font-semibold text-indigo-600">3</span>
        </div>
        <h4 class="font-medium">Response Handling</h4>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Output Variable -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Output Variable</label>
          <div class="flex gap-2">
            <select
              v-model="localNodeData.outputVariable"
              class="w-full p-2 border rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 text-sm"
              @change="saveChanges"
            >
              <option value="" disabled>Select a global variable</option>
              <option value="apiResponse">Create new: apiResponse</option>
              <option
                v-for="variable in availableVariables"
                :key="variable.name"
                :value="variable.name"
              >
                {{ variable.label }}
              </option>
            </select>
            <RsButton
              @click="createGlobalVariable(localNodeData.outputVariable)"
              variant="primary"
              size="sm"
              title="Create a new global variable"
              class="flex-shrink-0"
            >
              <Icon name="material-symbols:add" class="mr-1" />
              Create
            </RsButton>
          </div>
          <p class="mt-1 text-xs text-gray-500">
            API response will be stored in this global variable for use in later steps
          </p>
        </div>
        
        <!-- Error Variable -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Error Variable</label>
          <div class="flex gap-2">
            <select
              v-model="localNodeData.errorVariable"
              class="w-full p-2 border rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 text-sm"
              @change="saveChanges"
            >
              <option value="" disabled>Select a global variable</option>
              <option value="apiError">Create new: apiError</option>
              <option
                v-for="variable in availableVariables"
                :key="variable.name"
                :value="variable.name"
              >
                {{ variable.label }}
              </option>
            </select>
            <RsButton
              @click="createGlobalVariable(localNodeData.errorVariable, `API error from ${localNodeData.label}`)"
              variant="primary"
              size="sm"
              title="Create a new global variable"
              class="flex-shrink-0"
            >
              <Icon name="material-symbols:add" class="mr-1" />
              Create
            </RsButton>
          </div>
          <p class="mt-1 text-xs text-gray-500">
            Any API errors will be stored in this variable for error handling
          </p>
        </div>
      </div>
      
      <!-- Continue on Error -->
      <div class="mt-4">
        <label class="flex items-center">
          <input
            type="checkbox"
            v-model="localNodeData.continueOnError"
            class="form-checkbox h-4 w-4 text-indigo-600 focus:ring-indigo-500"
            @change="saveChanges"
          />
          <span class="ml-2 text-sm">Continue workflow execution even if API call fails</span>
        </label>
        <p class="mt-1 pl-6 text-xs text-gray-500">
          When enabled, the process will continue to the next step even if this API call fails
        </p>
      </div>
    </div>
    
    <!-- Step 4: Test API Call -->
    <div class="mb-6 bg-gray-50 p-4 rounded-md border border-gray-200">
      <div class="flex items-center mb-3">
        <div class="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
          <span class="text-xs font-semibold text-indigo-600">4</span>
        </div>
        <h4 class="font-medium">Test API Call</h4>
      </div>
      
      <p class="text-sm text-gray-600 mb-3">
        Test your API configuration to verify it works as expected before saving
      </p>
      
      <div class="flex items-center gap-4">
        <RsButton @click="testApiCall" variant="primary" :disabled="!localNodeData.apiUrl || isLoading">
          <Icon name="material-symbols:send" class="mr-1" />
          {{ isLoading ? 'Testing...' : 'Test API Call' }}
        </RsButton>
        <div v-if="isLoading" class="text-gray-600 text-sm flex items-center">
          <Icon name="material-symbols:sync" class="animate-spin mr-2" />
          Testing API endpoint...
        </div>
      </div>

      <!-- API Test Results -->
      <div v-if="testResult" class="mt-4 p-4 rounded-md border"
        :class="testResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'"
      >
        <div class="flex items-start justify-between">
          <div class="flex items-center">
            <Icon 
              :name="testResult.success ? 'material-symbols:check-circle' : 'material-symbols:error'" 
              :class="testResult.success ? 'text-green-500' : 'text-red-500'"
              class="w-5 h-5 mr-2"
            />
            <span :class="testResult.success ? 'text-green-700' : 'text-red-700'" class="font-medium">
              {{ testResult.success ? 'API Call Successful' : 'API Call Failed' }}
            </span>
          </div>
          <button @click="testResult = null" class="text-gray-400 hover:text-gray-600">
            <Icon name="material-symbols:close" class="w-4 h-4" />
          </button>
        </div>

        <!-- Success Response -->
        <div v-if="testResult.success" class="mt-3">
          <div class="text-sm text-gray-600 mb-2">Response stored in variable: <code class="bg-green-100 px-1">{{ localNodeData.outputVariable }}</code></div>
          <div class="bg-white border border-green-100 rounded p-3 max-h-60 overflow-auto">
            <pre class="text-xs font-mono whitespace-pre-wrap">{{ JSON.stringify(testResult.data, null, 2) }}</pre>
          </div>
        </div>

        <!-- Error Response -->
        <div v-else class="mt-3">
          <div class="text-sm text-red-600 mb-2">Error stored in variable: <code class="bg-red-100 px-1">{{ localNodeData.errorVariable }}</code></div>
          <div class="bg-white border border-red-100 rounded p-3 max-h-60 overflow-auto">
            <pre class="text-xs font-mono whitespace-pre-wrap text-red-600">{{ JSON.stringify(testResult.error, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { useProcessBuilderStore } from '@/stores/processBuilder';
import { useVariableStore } from '@/stores/variableStore';

const props = defineProps({
  nodeData: {
    type: Object,
    required: true
  },
  availableVariables: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update']);

// Get the variable store for creating variables
const variableStore = useVariableStore();

// Local state for node data - create a deep copy to avoid mutation issues
const localNodeData = ref({
  label: 'API Call',
  description: '',
  apiMethod: 'GET',
  apiUrl: '',
  requestBody: '',
  headers: '{ "Content-Type": "application/json" }',
  outputVariable: 'apiResponse',
  continueOnError: false,
  errorVariable: 'apiError'
});

// Computed for showing request body based on method
const showRequestBody = computed(() => {
  return ['POST', 'PUT', 'PATCH'].includes(localNodeData.value.apiMethod);
});

// Get available variables for dropdowns
const availableVariables = computed(() => {
  // Only use global variables, matching VariableManager implementation
  const globalVars = props.availableVariables?.map(v => ({
    name: v.name || 'unnamed',
    label: v?.description
      ? `${v.name} (${v.description})`
      : v.name,
    type: v.type || 'string',
    value: v.value
  })) || [];

  return globalVars;
});

// Watch for changes from parent props
watch(() => props.nodeData, (newNodeData) => {
  if (newNodeData) {
    // Create a deep copy to break reactivity chains with parent
    localNodeData.value = {
      label: newNodeData.label || 'API Call',
      description: newNodeData.description || '',
      apiMethod: newNodeData.apiMethod || 'GET',
      apiUrl: newNodeData.apiUrl || '',
      requestBody: newNodeData.requestBody || '',
      headers: newNodeData.headers || '{ "Content-Type": "application/json" }',
      outputVariable: newNodeData.outputVariable || 'apiResponse',
      continueOnError: newNodeData.continueOnError || false,
      errorVariable: newNodeData.errorVariable || 'apiError'
    };
  }
}, { immediate: true, deep: true });

// Function to create a new global variable
function createGlobalVariable(name, description = '') {
  if (!name) return;
  
  const newVariable = {
    name,
    type: 'object',
    scope: 'global',
    description: description || `API response from ${localNodeData.value.label}`
  };

  // Add the variable using the store's addVariable method
  variableStore.addVariable(newVariable);
  
  // Force a refresh of the component
  nextTick(() => {
    saveChanges();
  });
}

// Save changes by emitting them to parent
function saveChanges() {
  // Create a clean copy of the data to avoid reactivity issues
  const nodeDataCopy = JSON.parse(JSON.stringify(localNodeData.value));
  
  // Ensure variables exist before saving
  if (nodeDataCopy.outputVariable) {
    variableStore.addVariableIfNotExists({
      name: nodeDataCopy.outputVariable,
      type: 'object',
      scope: 'global',
      value: null,
      description: `API response from ${nodeDataCopy.label}`
    });
  }
  
  if (nodeDataCopy.errorVariable) {
    variableStore.addVariableIfNotExists({
      name: nodeDataCopy.errorVariable,
      type: 'object',
      scope: 'global',
      value: null,
      description: `API error from ${nodeDataCopy.label}`
    });
  }
  
  // Emit the updated data to parent
  emit('update', nodeDataCopy);
}

// Add these refs for handling the API test state
const isLoading = ref(false);
const testResult = ref(null);

// Update the testApiCall function
async function testApiCall() {
  if (!localNodeData.value.apiUrl) return;
  
  isLoading.value = true;
  testResult.value = null;
  
  try {
    // Get process variables for substitution
    const processVariables = {
      global: {},
      process: {}
    };
    
    // Extract variables from available variables
    if (props.availableVariables) {
      props.availableVariables.forEach(v => {
        processVariables.global[v.name] = v.value;
      });
    }
    
    // Call the test API endpoint
    const response = await fetch('/api/process/test-api-node', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nodeConfig: {
          apiMethod: localNodeData.value.apiMethod,
          apiUrl: localNodeData.value.apiUrl,
          requestBody: localNodeData.value.requestBody,
          headers: JSON.parse(localNodeData.value.headers || '{}'),
          outputVariable: localNodeData.value.outputVariable,
          errorVariable: localNodeData.value.errorVariable,
          continueOnError: localNodeData.value.continueOnError
        },
        processVariables
      })
    });
    
    const result = await response.json();
    
    // Store the test result
    testResult.value = {
      success: response.ok && !result.error,
      data: result.data,
      error: result.error || (response.ok ? null : { message: 'API request failed' })
    };
    
    // Update variables in the store
    if (testResult.value.success && localNodeData.value.outputVariable) {
      variableStore.updateVariable(
        localNodeData.value.outputVariable,
        { value: result.data },
        'global'
      );
    } else if (!testResult.value.success && localNodeData.value.errorVariable) {
      variableStore.updateVariable(
        localNodeData.value.errorVariable,
        { value: testResult.value.error },
        'global'
      );
    }
  } catch (error) {
    console.error('API test error:', error);
    testResult.value = {
      success: false,
      error: {
        message: error.message || 'An error occurred while testing the API call',
        details: error.toString()
      }
    };
    
    // Store error in variable
    if (localNodeData.value.errorVariable) {
      variableStore.updateVariable(
        localNodeData.value.errorVariable,
        { value: testResult.value.error },
        'global'
      );
    }
  } finally {
    isLoading.value = false;
  }
}

// Function to insert a variable at cursor position or append to end
function insertVariable(variableName, field) {
  if (!variableName) return;
  
  const varName = `{${variableName}}`;
  const textarea = document.getElementById(field);
  
  if (textarea.selectionStart || textarea.selectionStart === 0) {
    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    
    localNodeData.value[field] = 
      textarea.value.substring(0, startPos) +
      varName +
      textarea.value.substring(endPos);
      
    // Reset cursor position after variable
    textarea.selectionStart = startPos + varName.length;
    textarea.selectionEnd = startPos + varName.length;
  } else {
    localNodeData.value[field] += varName;
  }
  
  saveChanges();
}

// Function to format JSON in a field
function formatJson(field) {
  try {
    const value = localNodeData.value[field];
    if (!value) return;
    
    const parsed = JSON.parse(value);
    localNodeData.value[field] = JSON.stringify(parsed, null, 2);
    saveChanges();
  } catch (error) {
    console.warn(`Failed to format JSON for ${field}:`, error);
  }
}

// Function to preview values with actual variable values
function getPreviewWithValues(field) {
  try {
    let text = localNodeData.value[field];
    if (!text) return '';
    
    // Replace all variables with their current values
    const variablePattern = /{([^}]+)}/g;
    text = text.replace(variablePattern, (match, varName) => {
      const variable = availableVariables.value.find(v => v.name === varName);
      if (variable) {
        return JSON.stringify(variable.value) || '(undefined)';
      }
      return '(undefined)';
    });
    
    // Try to format as JSON if possible
    try {
      const parsed = JSON.parse(text);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return text;
    }
  } catch (error) {
    return '(Invalid format)';
  }
}
</script>

<style scoped>
.form-checkbox {
  @apply text-indigo-600 focus:ring-indigo-500;
}

.form-select {
  @apply border rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 p-2;
}

code {
  font-family: monospace;
  border-radius: 0.25rem;
}
</style> 