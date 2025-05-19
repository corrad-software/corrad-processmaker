<template>
  <div class="api-node-configuration">
    <h3 class="text-lg font-semibold mb-4">API Call Configuration</h3>
    
    <div class="form-group mb-4">
      <label for="nodeLabel" class="form-label">Node Label</label>
      <input
        id="nodeLabel"
        v-model="localNodeData.label"
        type="text"
        class="form-control"
        placeholder="API Call"
      />
    </div>
    
    <div class="form-group mb-4">
      <label for="nodeDescription" class="form-label">Description</label>
      <textarea
        id="nodeDescription"
        v-model="localNodeData.description"
        class="form-control"
        placeholder="API call description"
        rows="2"
      ></textarea>
    </div>
    
    <div class="form-group mb-4">
      <label for="apiMethod" class="form-label">HTTP Method</label>
      <select
        id="apiMethod"
        v-model="localNodeData.apiMethod"
        class="form-control"
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
      />
      <small class="form-text text-muted">
        You can use process variables with curly braces: https://example.com/api/users/{userId}
      </small>
    </div>
    
    <div class="form-group mb-4" v-if="showRequestBody">
      <label for="requestBody" class="form-label">Request Body</label>
      <textarea
        id="requestBody"
        v-model="localNodeData.requestBody"
        class="form-control font-mono"
        placeholder='{ "key": "value" }'
        rows="4"
      ></textarea>
      <small class="form-text text-muted">
        You can use process variables with curly braces: { "userId": "{userId}" }
      </small>
    </div>
    
    <div class="form-group mb-4">
      <label for="headers" class="form-label">Headers</label>
      <textarea
        id="headers"
        v-model="localNodeData.headers"
        class="form-control font-mono"
        placeholder='{ "Content-Type": "application/json" }'
        rows="3"
      ></textarea>
    </div>
    
    <div class="form-group mb-4">
      <label for="outputVariable" class="form-label">Output Variable</label>
      <div class="flex gap-2">
        <select
          id="outputVariable"
          v-model="localNodeData.outputVariable"
          class="form-control flex-grow"
        >
          <option value="" disabled>Select a global variable</option>
          <option value="apiResponse">Create new: apiResponse</option>
          <optgroup label="Global Variables">
            <option
              v-for="variable in availableVariables.global"
              :key="variable.name"
              :value="variable.name"
            >
              {{ variable.description ? `${variable.name} (${variable.description})` : variable.name }}
            </option>
          </optgroup>
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
    
    <div class="form-group mb-4">
      <label class="form-label d-block">Error Handling</label>
      <div class="form-check">
        <input
          id="continueOnError"
          v-model="localNodeData.continueOnError"
          type="checkbox"
          class="form-check-input"
        />
        <label for="continueOnError" class="form-check-label">
          Continue process execution on error
        </label>
      </div>
    </div>
    
    <div class="form-group mb-4">
      <label for="errorVariable" class="form-label">Error Variable</label>
      <div class="flex gap-2">
        <select
          id="errorVariable"
          v-model="localNodeData.errorVariable"
          class="form-control flex-grow"
        >
          <option value="" disabled>Select a global variable</option>
          <option value="apiError">Create new: apiError</option>
          <optgroup label="Global Variables">
            <option
              v-for="variable in availableVariables.global"
              :key="variable.name"
              :value="variable.name"
            >
              {{ variable.description ? `${variable.name} (${variable.description})` : variable.name }}
            </option>
          </optgroup>
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
    
    <!-- Test API Call Button -->
    <div class="form-group mt-6">
      <RsButton @click="testApiCall" variant="primary" :disabled="!localNodeData.apiUrl">
        <Icon name="material-symbols:send" class="mr-1" />
        Test API Call
      </RsButton>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useProcessBuilderStore } from '@/stores/processBuilder';
import { useVariableStore } from '@/stores/variableStore';

const props = defineProps({
  nodeId: {
    type: String,
    required: true
  }
});

// Get the stores
const processStore = useProcessBuilderStore();
const variableStore = useVariableStore();

// Local state for node data
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
  const globalVars = variableStore.getAllVariables.global.map(v => ({
    name: v.name || 'unnamed',
    label: v?.description
      ? `${v.description} (${v.name || 'unnamed'}, global)`
      : `${v.name || 'unnamed'} (global)`,
    type: v.type || 'string',
    scope: 'global'
  }));
  
  return {
    global: globalVars
  };
});

// Load node data when component mounts or nodeId changes
watch(() => props.nodeId, () => {
  loadNodeData();
}, { immediate: true });

// Watch for changes in local data and emit updates
watch(localNodeData, (newValue) => {
  saveChanges();
}, { deep: true });

// Load node data from the store
function loadNodeData() {
  const node = processStore.currentProcess.nodes.find(n => n.id === props.nodeId);
  if (node && node.data) {
    localNodeData.value = {
      label: node.label || 'API Call',
      description: node.data.description || '',
      apiMethod: node.data.apiMethod || 'GET',
      apiUrl: node.data.apiUrl || '',
      requestBody: node.data.requestBody || '',
      headers: node.data.headers || '{ "Content-Type": "application/json" }',
      outputVariable: node.data.outputVariable || 'apiResponse',
      continueOnError: node.data.continueOnError || false,
      errorVariable: node.data.errorVariable || 'apiError'
    };
  }
}

// Function to create a new global variable
function createGlobalVariable(name, description = '') {
  variableStore.addVariable({
    name,
    type: 'object',
    scope: 'global',
    value: null,
    description: description || `API response from ${localNodeData.value.label}`
  });
}

// Save changes to the store
function saveChanges() {
  const updates = {
    label: localNodeData.value.label,
    data: {
      ...localNodeData.value,
      label: localNodeData.value.label // Ensure label is in both places
    }
  };

  // Update the node in the store
  processStore.updateNode(props.nodeId, updates);
  
  // Ensure variables exist
  if (localNodeData.value.outputVariable) {
    variableStore.addVariableIfNotExists({
      name: localNodeData.value.outputVariable,
      type: 'object',
      scope: 'global',
      value: null,
      description: `API response from ${localNodeData.value.label}`
    });
  }
  
  if (localNodeData.value.errorVariable) {
    variableStore.addVariableIfNotExists({
      name: localNodeData.value.errorVariable,
      type: 'object',
      scope: 'global',
      value: null,
      description: `API error from ${localNodeData.value.label}`
    });
  }
}

// Test API call function
async function testApiCall() {
  if (!localNodeData.value.apiUrl) return;
  
  const isLoading = ref(true);
  const testResult = ref(null);
  
  try {
    // Get process variables for substitution
    const processVariables = {
      global: {},
      process: {}
    };
    
    // Extract variables from the store
    const allVars = variableStore.getAllVariables;
    allVars.process.forEach(v => {
      processVariables.process[v.name] = v.value;
    });
    allVars.global.forEach(v => {
      processVariables.global[v.name] = v.value;
    });
    
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
          headers: localNodeData.value.headers,
          outputVariable: localNodeData.value.outputVariable,
          errorVariable: localNodeData.value.errorVariable,
          continueOnError: localNodeData.value.continueOnError
        },
        processVariables
      })
    });
    
    const result = await response.json();
    testResult.value = result;
    
    if (result.success && localNodeData.value.outputVariable) {
      variableStore.updateVariable(
        localNodeData.value.outputVariable,
        { value: result.data },
        'global'
      );
    } else if (!result.success && localNodeData.value.errorVariable) {
      variableStore.updateVariable(
        localNodeData.value.errorVariable,
        { value: result.error },
        'global'
      );
    }
  } catch (error) {
    testResult.value = {
      success: false,
      error: {
        message: error.message || 'An error occurred while testing the API call'
      }
    };
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
.api-node-configuration {
  padding: 1rem;
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