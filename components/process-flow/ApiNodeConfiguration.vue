<template>
  <div class="api-node-configuration">
    <!-- <h3 class="text-lg font-semibold mb-4">API Call Configuration</h3> -->
    
    <!-- <div class="form-group mb-4">
      <label for="nodeLabel" class="form-label">Node Label</label>
      <input
        id="nodeLabel"
        v-model="localNodeData.label"
        type="text"
        class="form-control"
        placeholder="API Call"
        @blur="saveChanges"
      />
    </div> -->
    
    <!-- <div class="form-group mb-4">
      <label for="nodeDescription" class="form-label">Description</label>
      <textarea
        id="nodeDescription"
        v-model="localNodeData.description"
        class="form-control"
        placeholder="API call description"
        rows="2"
        @blur="saveChanges"
      ></textarea>
    </div> -->
    
    <div class="form-group mb-4">
      <label for="apiMethod" class="form-label">HTTP Method</label>
      <select
        id="apiMethod"
        v-model="localNodeData.apiMethod"
        class="form-control"
        @change="saveChanges"
      >
        <option value="GET">GET</option>
        <option value="POST">POST</option>
        <option value="PUT">PUT</option>
        <option value="PATCH">PATCH</option>
        <option value="DELETE">DELETE</option>
      </select>
    </div>
    
    <div class="form-group mb-4">
      <label for="apiUrl" class="form-label">API URL</label>
      <input
        id="apiUrl"
        v-model="localNodeData.apiUrl"
        type="text"
        class="form-control"
        placeholder="https://example.com/api/endpoint"
        @blur="saveChanges"
      />
      <small class="form-text text-muted">
        You can use process variables with curly braces: https://example.com/api/users/{userId}
      </small>
    </div>
    
    <!-- Variable Insertion for Request Body -->
    <div class="form-group mb-4" v-if="showRequestBody">
      <label for="requestBody" class="form-label">Request Body</label>
      <div class="space-y-2">
        <div class="flex gap-2">
          <select
            class="form-control text-sm"
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
          >
            <Icon name="material-symbols:format-align-left" />
          </RsButton>
        </div>
        <textarea
          id="requestBody"
          v-model="localNodeData.requestBody"
          class="form-control font-mono"
          placeholder='{ "key": "{variableName}" }'
          rows="6"
          @blur="saveChanges"
        ></textarea>
      </div>
      <small class="form-text text-muted mt-1">
        Use variables in curly braces, e.g.: { "userId": "{userId}" }
      </small>
      
      <!-- Request Body Preview -->
      <div v-if="localNodeData.requestBody" class="mt-3 border-t pt-3">
        <div class="text-sm font-medium text-gray-700 mb-2">Preview with Current Values:</div>
        <div class="bg-white border rounded p-3">
          <pre class="text-xs font-mono whitespace-pre-wrap">{{ getPreviewWithValues('requestBody') }}</pre>
        </div>
      </div>
    </div>
    
    <!-- Variable Insertion for Headers -->
    <div class="form-group mb-4">
      <label for="headers" class="form-label">Headers</label>
      <div class="space-y-2">
        <div class="flex gap-2">
          <select
            class="form-control text-sm"
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
          >
            <Icon name="material-symbols:format-align-left" />
          </RsButton>
        </div>
        <textarea
          id="headers"
          v-model="localNodeData.headers"
          class="form-control font-mono"
          placeholder='{ "Authorization": "Bearer {accessToken}" }'
          rows="4"
          @blur="saveChanges"
        ></textarea>
      </div>
      <small class="form-text text-muted mt-1">
        Use variables in curly braces, e.g.: { "Authorization": "Bearer {accessToken}" }
      </small>
      
      <!-- Headers Preview -->
      <div v-if="localNodeData.headers" class="mt-3 border-t pt-3">
        <div class="text-sm font-medium text-gray-700 mb-2">Preview with Current Values:</div>
        <div class="bg-white border rounded p-3">
          <pre class="text-xs font-mono whitespace-pre-wrap">{{ getPreviewWithValues('headers') }}</pre>
        </div>
      </div>
    </div>
    
    <!-- Output Variable Selection -->
    <div class="form-group mb-4">
      <label for="outputVariable" class="form-label">Output Variable</label>
      <div class="flex gap-2">
        <select
          id="outputVariable"
          v-model="localNodeData.outputVariable"
          class="form-control flex-grow"
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
        <button
          @click="createGlobalVariable(localNodeData.outputVariable)"
          class="flex-shrink-0 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          title="Create a new global variable"
        >
          <Icon name="material-symbols:add" />
        </button>
      </div>
      <small class="form-text text-muted">
        API response will be stored in this global variable
      </small>
    </div>
    
    <!-- Error Variable Selection -->
    <div class="form-group mb-4">
      <label for="errorVariable" class="form-label">Error Variable</label>
      <div class="flex gap-2">
        <select
          id="errorVariable"
          v-model="localNodeData.errorVariable"
          class="form-control flex-grow"
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
        <button
          @click="createGlobalVariable(localNodeData.errorVariable, `API error from ${localNodeData.label}`)"
          class="flex-shrink-0 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          title="Create a new global variable"
        >
          <Icon name="material-symbols:add" />
        </button>
      </div>
      <small class="form-text text-muted">
        API errors will be stored in this global variable
      </small>
    </div>
    
    <!-- Test API Call Button and Results -->
    <div class="form-group mt-6 space-y-4">
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
      <div v-if="testResult" :class="[
        'p-4 rounded-md border',
        testResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
      ]">
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
          <div class="text-sm text-gray-600 mb-2">Response stored in variable: {{ localNodeData.outputVariable }}</div>
          <div class="bg-white border border-green-100 rounded p-3">
            <pre class="text-xs font-mono whitespace-pre-wrap">{{ JSON.stringify(testResult.data, null, 2) }}</pre>
          </div>
        </div>

        <!-- Error Response -->
        <div v-else class="mt-3">
          <div class="text-sm text-red-600 mb-2">Error stored in variable: {{ localNodeData.errorVariable }}</div>
          <div class="bg-white border border-red-100 rounded p-3">
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
.api-node-configuration {
  padding: 1rem;
  background-color: #f8f8f8;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  line-height: 1.5;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
}

.form-text {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.75rem;
}

.form-check {
  display: flex;
  align-items: center;
}

.form-check-input {
  margin-right: 0.5rem;
}

.font-mono {
  font-family: monospace;
}
</style> 