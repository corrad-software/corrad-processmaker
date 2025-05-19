<template>
  <div class="form-node-configuration">
    <h3 class="text-lg font-semibold mb-4">Form Task Configuration</h3>
    
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
    
    <!-- Form Selection -->
    <div class="form-group mb-4">
      <FormSelector 
        :formId="localNodeData.formId"
        @select="handleFormSelection"
        @clear="clearFormSelection"
      />
    </div>
    
    <!-- Form Data Mapping Section -->
    <div v-if="localNodeData.formId" class="form-group mb-6">
      <div class="border-t border-gray-200 my-4 pt-4">
        <h4 class="text-base font-medium mb-4">Form Data Mapping</h4>
        
        <!-- Input Variables -->
        <div class="mb-4">
          <div class="flex justify-between items-center mb-2">
            <label class="form-label">Input Variables (Prefill Form)</label>
            <button 
              @click="addInputMapping()" 
              class="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 flex items-center"
            >
              <Icon name="material-symbols:add" class="w-3.5 h-3.5 mr-1" />
              Add Mapping
            </button>
          </div>
          
          <div v-if="!localNodeData.inputMappings || localNodeData.inputMappings.length === 0" class="text-sm text-gray-500 italic mb-2">
            No input mappings defined. Form will not be prefilled with process data.
          </div>
          
          <div v-else class="space-y-2">
            <div v-for="(mapping, index) in localNodeData.inputMappings" :key="'input-' + index" class="p-3 border rounded-md bg-blue-50">
              <div class="flex justify-between mb-2">
                <h5 class="text-sm font-medium">Mapping #{{ index + 1 }}</h5>
                <button @click="removeInputMapping(index)" class="text-red-500 hover:text-red-700">
                  <Icon name="material-symbols:delete-outline" class="w-4 h-4" />
                </button>
              </div>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs mb-1">Process Variable</label>
                  <select 
                    v-model="mapping.processVariable" 
                    class="w-full p-2 border rounded text-sm"
                    @change="saveChanges"
                  >
                    <option value="" disabled>Select a variable</option>
                    <option
                      v-for="variable in availableVariables"
                      :key="variable.name"
                      :value="variable.name"
                    >
                      {{ variable.label }}
                    </option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-xs mb-1">Form Field</label>
                  <input 
                    v-model="mapping.formField" 
                    type="text" 
                    class="w-full p-2 border rounded text-sm"
                    placeholder="form_field_name"
                    @blur="saveChanges"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Output Variables -->
        <div class="mb-4">
          <div class="flex justify-between items-center mb-2">
            <label class="form-label">Output Variables (Form Submissions)</label>
            <button 
              @click="addOutputMapping()" 
              class="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 flex items-center"
            >
              <Icon name="material-symbols:add" class="w-3.5 h-3.5 mr-1" />
              Add Mapping
            </button>
          </div>
          
          <div v-if="!localNodeData.outputMappings || localNodeData.outputMappings.length === 0" class="text-sm text-gray-500 italic mb-2">
            No output mappings defined. Form data will not be stored in process variables.
          </div>
          
          <div v-else class="space-y-2">
            <div v-for="(mapping, index) in localNodeData.outputMappings" :key="'output-' + index" class="p-3 border rounded-md bg-green-50">
              <div class="flex justify-between mb-2">
                <h5 class="text-sm font-medium">Mapping #{{ index + 1 }}</h5>
                <button @click="removeOutputMapping(index)" class="text-red-500 hover:text-red-700">
                  <Icon name="material-symbols:delete-outline" class="w-4 h-4" />
                </button>
              </div>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs mb-1">Form Field</label>
                  <input 
                    v-model="mapping.formField" 
                    type="text" 
                    class="w-full p-2 border rounded text-sm"
                    placeholder="form_field_name"
                    @blur="saveChanges"
                  />
                </div>
                
                <div>
                  <label class="block text-xs mb-1">Process Variable</label>
                  <div class="flex items-center gap-2">
                    <select 
                      v-model="mapping.processVariable" 
                      class="w-full p-2 border rounded text-sm"
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
                    <button
                      v-if="mapping.processVariable && mapping.processVariable.startsWith('create_new_')"
                      @click="createVariableFromMapping(mapping)"
                      class="shrink-0 px-2 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      title="Create this variable"
                    >
                      <Icon name="material-symbols:add" class="w-4 h-4" />
                    </button>
                  </div>
                </div>
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
.form-node-configuration {
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
</style> 