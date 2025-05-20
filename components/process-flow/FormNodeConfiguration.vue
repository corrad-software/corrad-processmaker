<template>
  <div class="form-node-configuration">
    <!-- <h3 class="text-lg font-semibold mb-4">Form Task Configuration</h3> -->
    
    <!-- <div class="form-group mb-4">
      <label for="nodeLabel" class="form-label">Node Label</label>
      <input
        id="nodeLabel"
        v-model="localNodeData.label"
        type="text"
        class="form-control"
        placeholder="Form Task"
        @blur="saveChanges"
      />
    </div> -->
    
    <!-- <div class="form-group mb-4">
      <label for="nodeDescription" class="form-label">Description</label>
      <textarea
        id="nodeDescription"
        v-model="localNodeData.description"
        class="form-control"
        placeholder="Form task description"
        rows="2"
        @blur="saveChanges"
      ></textarea>
    </div> -->
    
    <!-- Step 1: Form Selection -->
    <div class="mb-6 bg-gray-50 p-4 rounded-md border border-gray-200">
      <div class="flex items-center mb-3">
        <div class="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center mr-2">
          <span class="text-xs font-semibold text-emerald-600">1</span>
        </div>
        <h4 class="font-medium">Form Selection</h4>
      </div>
      
      <div class="grid grid-cols-1 gap-4">
        <div>
          <p class="text-sm text-gray-600 mb-3">
            Select an existing form or create a new one to use in this task.
          </p>
          <!-- Form Selector Component -->
          <div class="bg-white p-3 border rounded-md shadow-sm">
            <FormSelector 
              :formId="localNodeData.formId"
              @select="handleFormSelection"
              @clear="clearFormSelection"
            />
          </div>
        </div>
      </div>
    </div>
    
    <!-- Step 2: Form Data Mapping (only if form is selected) -->
    <div v-if="localNodeData.formId" class="mb-6 bg-gray-50 p-4 rounded-md border border-gray-200">
      <div class="flex items-center mb-3">
        <div class="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center mr-2">
          <span class="text-xs font-semibold text-emerald-600">2</span>
        </div>
        <h4 class="font-medium">Form Data Mapping</h4>
      </div>
      
      <p class="text-sm text-gray-600 mb-4">
        Configure how data flows between your process and the form.
      </p>
        
      <!-- Input Variables Mapping (Process → Form) -->
      <div class="mb-5">
        <div class="flex justify-between items-center mb-3">
          <div>
            <h5 class="text-sm font-medium flex items-center">
              <span class="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mr-2 text-xs">
                <Icon name="material-symbols:arrow-outward" />
              </span>
              Input Variables (Process → Form)
            </h5>
            <p class="text-xs text-gray-500 ml-7">Map process variables to pre-fill form fields</p>
          </div>
          <RsButton 
            @click="addInputMapping()" 
            variant="secondary"
            size="sm"
            class="btn-sm-emerald"
          >
            <Icon name="material-symbols:add" class="mr-1" /> Add Mapping
          </RsButton>
        </div>
        
        <!-- No input mappings placeholder -->
        <div v-if="!localNodeData.inputMappings || localNodeData.inputMappings.length === 0" 
             class="py-4 text-center text-gray-500 text-sm border border-dashed rounded-md bg-white">
          <p class="mb-2">
            No input mappings defined. Form will not be prefilled with process data.
          </p>
          <RsButton 
            @click="addInputMapping()" 
            variant="secondary"
            size="sm"
            class="btn-sm-emerald"
          >
            <Icon name="material-symbols:add" class="mr-1" /> Add First Mapping
          </RsButton>
        </div>
        
        <div v-else class="space-y-3">
          <div v-for="(mapping, index) in localNodeData.inputMappings" :key="'input-' + index" 
               class="p-4 border rounded-md bg-blue-50">
            <div class="flex justify-between mb-3">
              <h5 class="text-sm font-medium flex items-center">
                <Icon name="material-symbols:arrow-outward" class="text-blue-600 mr-1" />
                Process Variable to Form Field #{{ index + 1 }}
              </h5>
              <button 
                @click="removeInputMapping(index)" 
                class="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                title="Remove mapping"
              >
                <Icon name="material-symbols:delete-outline" />
              </button>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Process Variable</label>
                <select 
                  v-model="mapping.processVariable" 
                  class="form-select"
                  @change="saveChanges"
                >
                  <option value="" disabled>Select a process variable</option>
                  <option
                    v-for="variable in availableVariables"
                    :key="variable.name"
                    :value="variable.name"
                  >
                    {{ variable.label }}
                  </option>
                </select>
                <p class="mt-1 text-xs text-gray-500">
                  The source variable containing the data
                </p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Form Field Name</label>
                <input 
                  v-model="mapping.formField" 
                  type="text" 
                  class="form-control"
                  placeholder="e.g., first_name"
                  @blur="saveChanges"
                />
                <p class="mt-1 text-xs text-gray-500">
                  The target field ID in the form
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Output Variables Mapping (Form → Process) -->
      <div class="mb-3">
        <div class="flex justify-between items-center mb-3">
          <div>
            <h5 class="text-sm font-medium flex items-center">
              <span class="w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center mr-2 text-xs">
                <Icon name="material-symbols:arrow-back" />
              </span>
              Output Variables (Form → Process)
            </h5>
            <p class="text-xs text-gray-500 ml-7">Store form submission data in process variables</p>
          </div>
          <RsButton 
            @click="addOutputMapping()" 
            variant="secondary"
            size="sm"
            class="btn-sm-emerald"
          >
            <Icon name="material-symbols:add" class="mr-1" /> Add Mapping
          </RsButton>
        </div>
        
        <!-- No output mappings placeholder -->
        <div v-if="!localNodeData.outputMappings || localNodeData.outputMappings.length === 0" 
             class="py-4 text-center text-gray-500 text-sm border border-dashed rounded-md bg-white">
          <p class="mb-2">
            No output mappings defined. Form data will not be stored in process variables.
          </p>
          <RsButton 
            @click="addOutputMapping()" 
            variant="secondary"
            size="sm"
            class="btn-sm-emerald"
          >
            <Icon name="material-symbols:add" class="mr-1" /> Add First Mapping
          </RsButton>
        </div>
        
        <div v-else class="space-y-3">
          <div v-for="(mapping, index) in localNodeData.outputMappings" :key="'output-' + index" 
               class="p-4 border rounded-md bg-green-50">
            <div class="flex justify-between mb-3">
              <h5 class="text-sm font-medium flex items-center">
                <Icon name="material-symbols:arrow-back" class="text-green-600 mr-1" />
                Form Field to Process Variable #{{ index + 1 }}
              </h5>
              <button 
                @click="removeOutputMapping(index)" 
                class="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                title="Remove mapping"
              >
                <Icon name="material-symbols:delete-outline" />
              </button>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Form Field Name</label>
                <input 
                  v-model="mapping.formField" 
                  type="text" 
                  class="form-control"
                  placeholder="e.g., first_name"
                  @blur="saveChanges"
                />
                <p class="mt-1 text-xs text-gray-500">
                  The source field ID in the form
                </p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Process Variable</label>
                <div class="flex items-center gap-2">
                  <select 
                    v-model="mapping.processVariable" 
                    class="form-select"
                    @change="saveChanges"
                  >
                    <option value="" disabled>Select a variable</option>
                    <option :value="'create_new_' + getVariableNameFromFormField(mapping.formField)">
                      Create new variable
                    </option>
                    <option
                      v-for="variable in availableVariables"
                      :key="variable.name"
                      :value="variable.name"
                    >
                      {{ variable.label }}
                    </option>
                  </select>
                  <RsButton
                    v-if="mapping.processVariable && mapping.processVariable.startsWith('create_new_')"
                    @click="createVariableFromMapping(mapping)"
                    variant="primary"
                    size="sm"
                    title="Create this variable"
                    class="flex-shrink-0 btn-add-var"
                  >
                    <Icon name="material-symbols:add" />
                  </RsButton>
                </div>
                <p class="mt-1 text-xs text-gray-500">
                  The target variable to store form data
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { useVariableStore } from '@/stores/variableStore';
import FormSelector from './FormSelector.vue';
import { Icon } from '#components';

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
  label: 'Form Task',
  description: '',
  formId: null,
  formName: '',
  formUuid: null,
  inputMappings: [],
  outputMappings: []
});

// Watch for changes from parent props
watch(() => props.nodeData, (newNodeData) => {
  if (newNodeData) {
    // Create a deep copy to break reactivity chains with parent
    localNodeData.value = {
      label: newNodeData.label || 'Form Task',
      description: newNodeData.description || '',
      formId: newNodeData.formId || null,
      formName: newNodeData.formName || '',
      formUuid: newNodeData.formUuid || null,
      inputMappings: Array.isArray(newNodeData.inputMappings) 
        ? [...newNodeData.inputMappings] 
        : [],
      outputMappings: Array.isArray(newNodeData.outputMappings) 
        ? [...newNodeData.outputMappings] 
        : []
    };
  }
}, { immediate: true, deep: true });

// Function to handle form selection
function handleFormSelection(form) {
  if (!form) return;
  
  localNodeData.value = {
    ...localNodeData.value,
    formId: form.formID,
    formName: form.formName,
    formUuid: form.formUUID,
    label: form.formName || 'Form Task',
    description: `Form: ${form.formName}`
  };
  
  saveChanges();
}

// Function to clear form selection
function clearFormSelection() {
  localNodeData.value = {
    ...localNodeData.value,
    formId: null,
    formName: '',
    formUuid: null,
    label: 'Form Task',
    description: 'Form submission task',
    inputMappings: [],
    outputMappings: []
  };
  
  saveChanges();
}

// Add an input mapping
function addInputMapping() {
  if (!localNodeData.value.inputMappings) {
    localNodeData.value.inputMappings = [];
  }
  
  localNodeData.value.inputMappings.push({
    processVariable: '',
    formField: ''
  });
  
  saveChanges();
}

// Remove an input mapping
function removeInputMapping(index) {
  localNodeData.value.inputMappings.splice(index, 1);
  saveChanges();
}

// Add an output mapping
function addOutputMapping() {
  if (!localNodeData.value.outputMappings) {
    localNodeData.value.outputMappings = [];
  }
  
  localNodeData.value.outputMappings.push({
    formField: '',
    processVariable: ''
  });
  
  saveChanges();
}

// Remove an output mapping
function removeOutputMapping(index) {
  localNodeData.value.outputMappings.splice(index, 1);
  saveChanges();
}

// Generate a variable name from a form field
function getVariableNameFromFormField(formField) {
  if (!formField) return 'form_data';
  
  // Convert the form field to a valid variable name
  // Remove spaces, special characters, and convert to camelCase
  return formField.replace(/[^a-zA-Z0-9_]/g, '_')
    .replace(/^([A-Z])/, (match) => match.toLowerCase())
    .replace(/[\s_]+(\w)/g, (_, c) => c.toUpperCase());
}

// Create a variable from a mapping
function createVariableFromMapping(mapping) {
  if (!mapping.processVariable || !mapping.processVariable.startsWith('create_new_')) return;
  
  const variableName = mapping.processVariable.replace('create_new_', '');
  if (!variableName) return;
  
  // Create the variable
  const newVariable = {
    name: variableName,
    type: 'string',
    scope: 'global',
    description: `Form data from ${mapping.formField} in ${localNodeData.value.formName || 'form'}`
  };
  
  // Add the variable
  variableStore.addVariable(newVariable);
  
  // Update the mapping to use the new variable
  mapping.processVariable = variableName;
  
  // Save changes
  nextTick(() => {
    saveChanges();
  });
}

// Save changes by emitting them to parent
function saveChanges() {
  // Create a clean copy of the data to avoid reactivity issues
  const nodeDataCopy = JSON.parse(JSON.stringify(localNodeData.value));
  
  // Emit the updated data to parent
  emit('update', nodeDataCopy);
}
</script>

<style scoped>
/* .form-node-configuration {
  padding: 1rem;
  background-color: #f8f8f8;
} */

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

.form-control {
  @apply block w-full p-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm;
}

.form-select {
  @apply block w-full p-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm;
}

.btn-sm-emerald {
  @apply bg-white hover:bg-gray-50 text-emerald-700 border-emerald-300 hover:border-emerald-400 focus:ring-emerald-500;
}

.btn-add-var {
  @apply bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500;
}
</style> 