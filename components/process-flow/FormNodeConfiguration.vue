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
                <FormKit
                  type="select"
                  v-model="mapping.processVariable"
                  :options="processVariableOptions"
                  placeholder="Select a process variable"
                  :classes="{ outer: 'mb-0' }"
                />
                <p class="mt-1 text-xs text-gray-500">
                  The source variable containing the data
                </p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Form Field</label>
                <FormKit
                  type="select"
                  v-model="mapping.formField"
                  :options="formFieldOptions"
                  placeholder="Select a form field"
                  :disabled="formFields.length === 0"
                  :classes="{ outer: 'mb-0' }"
                />
                <p class="mt-1 text-xs text-gray-500">
                  {{ formFields.length === 0 ? 'No form fields available' : 'The target field in the form' }}
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
                <label class="block text-sm font-medium text-gray-700 mb-1">Form Field</label>
                <FormKit
                  type="select"
                  v-model="mapping.formField"
                  :options="formFieldOptions"
                  placeholder="Select a form field"
                  :disabled="formFields.length === 0"
                  :classes="{ outer: 'mb-0' }"
                />
                <p class="mt-1 text-xs text-gray-500">
                  {{ formFields.length === 0 ? 'No form fields available' : 'The source field in the form' }}
                </p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Process Variable</label>
                <div class="flex items-center gap-2">
                  <FormKit
                    type="select"
                    v-model="mapping.processVariable"
                    :options="[
                      { label: 'Create new variable', value: 'create_new_' + getVariableNameFromFormField(mapping.formField) },
                      ...processVariableOptions
                    ]"
                    placeholder="Select a variable"
                    :classes="{ outer: 'mb-0', input: 'flex-1' }"
                  />
                  <RsButton
                    v-if="getStringValue(mapping.processVariable) && getStringValue(mapping.processVariable).startsWith('create_new_')"
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
    
    <!-- Step 3: Field Conditions (only if form is selected) -->
    <div v-if="localNodeData.formId" class="mb-6 bg-gray-50 p-4 rounded-md border border-gray-200">
      <div class="flex items-center mb-3">
        <div class="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center mr-2">
          <span class="text-xs font-semibold text-emerald-600">3</span>
        </div>
        <h4 class="font-medium">Field Conditions</h4>
      </div>
      
      <p class="text-sm text-gray-600 mb-4">
        Configure conditional field behavior based on process variables (e.g., make fields readonly, hidden, or required).
      </p>
      
      <div class="mb-5">
        <div class="flex justify-between items-center mb-3">
          <div>
            <h5 class="text-sm font-medium flex items-center">
              <span class="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mr-2 text-xs">
                <Icon name="material-symbols:rule" />
              </span>
              Field Conditions
            </h5>
            <p class="text-xs text-gray-500 ml-7">Control field visibility, readonly state, and requirements dynamically</p>
          </div>
          <RsButton 
            @click="addFieldCondition()" 
            variant="secondary"
            size="sm"
            class="btn-sm-emerald"
          >
            <Icon name="material-symbols:add" class="mr-1" /> Add Condition
          </RsButton>
        </div>
        
        <!-- No field conditions placeholder -->
        <div v-if="!localNodeData.fieldConditions || localNodeData.fieldConditions.length === 0" 
             class="py-4 text-center text-gray-500 text-sm border border-dashed rounded-md bg-white">
          <p class="mb-2">
            No field conditions defined. All fields will use their default behavior.
          </p>
          <RsButton 
            @click="addFieldCondition()" 
            variant="secondary"
            size="sm"
            class="btn-sm-emerald"
          >
            <Icon name="material-symbols:add" class="mr-1" /> Add First Condition
          </RsButton>
        </div>
        
        <div v-else class="space-y-3">
          <div v-for="(condition, index) in localNodeData.fieldConditions" :key="'condition-' + index" 
               class="p-4 border rounded-md bg-amber-50">
            <div class="flex justify-between mb-3">
              <h5 class="text-sm font-medium flex items-center">
                <Icon name="material-symbols:rule" class="text-amber-600 mr-1" />
                Field Condition #{{ index + 1 }}
              </h5>
              <button 
                @click="removeFieldCondition(index)" 
                class="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                title="Remove condition"
              >
                <Icon name="material-symbols:delete-outline" />
              </button>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <!-- Process Variable -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Process Variable</label>
                <FormKit
                  type="select"
                  v-model="condition.processVariable"
                  :options="processVariableOptions"
                  placeholder="Select variable"
                  :classes="{ outer: 'mb-0' }"
                />
                <p class="mt-1 text-xs text-gray-500">Variable to check</p>
              </div>
              
              <!-- Operator -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Operator</label>
                <FormKit
                  type="select"
                  v-model="condition.operator"
                  :options="[
                    { label: 'Equals', value: 'equals' },
                    { label: 'Not Equals', value: 'not_equals' },
                    { label: 'Is True', value: 'is_true' },
                    { label: 'Is False', value: 'is_false' },
                    { label: 'Is Empty', value: 'is_empty' },
                    { label: 'Is Not Empty', value: 'is_not_empty' },
                    { label: 'Contains', value: 'contains' },
                    { label: 'Greater Than', value: 'greater_than' },
                    { label: 'Less Than', value: 'less_than' }
                  ]"
                  placeholder="Select operator"
                  :classes="{ outer: 'mb-0' }"
                />
                <p class="mt-1 text-xs text-gray-500">Comparison type</p>
              </div>
              
              <!-- Value -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Value</label>
                <FormKit
                  v-if="!['is_true', 'is_false', 'is_empty', 'is_not_empty'].includes(condition.operator)"
                  type="text"
                  v-model="condition.value"
                  placeholder="Comparison value"
                  :classes="{ outer: 'mb-0' }"
                />
                <div v-else class="text-xs text-gray-400 italic mt-2">
                  No value needed for this operator
                </div>
                <p class="mt-1 text-xs text-gray-500">Value to compare</p>
              </div>
              
              <!-- Target Form Field -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Target Field</label>
                <FormKit
                  type="select"
                  v-model="condition.targetField"
                  :options="formFieldOptions"
                  placeholder="Select field"
                  :disabled="formFields.length === 0"
                  :classes="{ outer: 'mb-0' }"
                />
                <p class="mt-1 text-xs text-gray-500">Field to control</p>
              </div>
            </div>
            
            <!-- Action Row -->
            <div class="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Action</label>
                <FormKit
                  type="select"
                  v-model="condition.action"
                  :options="[
                    { label: 'Make Readonly', value: 'readonly' },
                    { label: 'Hide Field', value: 'hide' },
                    { label: 'Make Required', value: 'required' },
                    { label: 'Make Optional', value: 'optional' },
                    { label: 'Show Field', value: 'show' },
                    { label: 'Enable Field', value: 'enable' }
                  ]"
                  placeholder="Select action"
                  :classes="{ outer: 'mb-0' }"
                />
                <p class="mt-1 text-xs text-gray-500">What to do when condition is met</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <FormKit
                  type="text"
                  v-model="condition.description"
                  placeholder="e.g., Hide email when user is resubmitting"
                  :classes="{ outer: 'mb-0' }"
                />
                <p class="mt-1 text-xs text-gray-500">For documentation purposes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Step 4: Assignment Configuration (only if form is selected) -->
    <div v-if="localNodeData.formId" class="mb-6 bg-gray-50 p-4 rounded-md border border-gray-200">
      <div class="flex items-center mb-3">
        <div class="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center mr-2">
          <span class="text-xs font-semibold text-emerald-600">4</span>
        </div>
        <h4 class="font-medium">Task Assignment</h4>
      </div>
      
      <p class="text-sm text-gray-600 mb-4">
        Configure who can complete this form task. Choose from specific users, roles, or dynamic assignment using variables.
      </p>
      
      <div class="mb-5">
        <!-- Assignment Type Selection -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Assignment Type</label>
          <FormKit
            type="select"
            v-model="localNodeData.assignmentType"
            :options="[
              { label: 'Anyone (Public)', value: 'public' },
              { label: 'Specific Users', value: 'users' },
              { label: 'Role-based', value: 'roles' },
              { label: 'Dynamic (from Variable)', value: 'variable' }
            ]"
            placeholder="Select assignment type"
            @input="handleAssignmentTypeChange"
            :classes="{ outer: 'mb-0' }"
          />
          <p class="mt-1 text-xs text-gray-500">How should this task be assigned</p>
        </div>
        
        <!-- Specific Users Assignment -->
        <div v-if="localNodeData.assignmentType === 'users'" class="bg-blue-50 p-4 rounded-md border border-blue-200">
          <div class="flex items-center mb-3">
            <Icon name="material-symbols:person" class="text-blue-600 mr-2" />
            <h5 class="text-sm font-medium text-blue-900">Assign to Specific Users</h5>
          </div>
          
          <div class="space-y-3">
            <FormKit
              type="select"
              v-model="localNodeData.assignedUsers"
              :options="availableUsers"
              placeholder="Select users..."
              multiple
              :classes="{ outer: 'mb-0' }"
            />
            <p class="text-xs text-blue-700">Selected users will be able to complete this form task</p>
          </div>
        </div>
        
        <!-- Role-based Assignment -->
        <div v-if="localNodeData.assignmentType === 'roles'" class="bg-purple-50 p-4 rounded-md border border-purple-200">
          <div class="flex items-center mb-3">
            <Icon name="material-symbols:group" class="text-purple-600 mr-2" />
            <h5 class="text-sm font-medium text-purple-900">Assign to Roles</h5>
          </div>
          
          <div class="space-y-3">
            <FormKit
              type="select"
              v-model="localNodeData.assignedRoles"
              :options="availableRoles"
              placeholder="Select roles..."
              multiple
              :classes="{ outer: 'mb-0' }"
            />
            <p class="text-xs text-purple-700">Any user with the selected roles will be able to complete this form task</p>
          </div>
        </div>
        
        <!-- Variable-based Assignment -->
        <div v-if="localNodeData.assignmentType === 'variable'" class="bg-green-50 p-4 rounded-md border border-green-200">
          <div class="flex items-center mb-3">
            <Icon name="material-symbols:code" class="text-green-600 mr-2" />
            <h5 class="text-sm font-medium text-green-900">Dynamic Assignment from Variable</h5>
          </div>
          
          <div class="space-y-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Assignment Variable</label>
              <FormKit
                type="select"
                v-model="localNodeData.assignmentVariable"
                :options="processVariableOptions"
                placeholder="Select variable containing assignment data"
                :classes="{ outer: 'mb-0' }"
              />
              <p class="mt-1 text-xs text-green-700">Variable should contain user ID, username, role name, or email address</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Variable Content Type</label>
              <FormKit
                type="select"
                v-model="localNodeData.assignmentVariableType"
                :options="[
                  { label: 'User ID', value: 'user_id' },
                  { label: 'Username', value: 'username' },
                  { label: 'Email Address', value: 'email' },
                  { label: 'Role Name', value: 'role_name' }
                ]"
                placeholder="What type of data does the variable contain"
                :classes="{ outer: 'mb-0' }"
              />
              <p class="mt-1 text-xs text-green-700">How to interpret the variable value for assignment</p>
            </div>
          </div>
        </div>
        
        <!-- Public Assignment Info -->
        <div v-if="localNodeData.assignmentType === 'public'" class="bg-gray-50 p-4 rounded-md border border-gray-200">
          <div class="flex items-center mb-2">
            <Icon name="material-symbols:public" class="text-gray-600 mr-2" />
            <h5 class="text-sm font-medium text-gray-900">Public Task</h5>
          </div>
          <p class="text-xs text-gray-600">Anyone with access to the process will be able to complete this form task</p>
        </div>
        
        <!-- Assignment Summary -->
        <div v-if="localNodeData.assignmentType && localNodeData.assignmentType !== 'public'" class="mt-4 p-3 bg-white border border-gray-200 rounded-md">
          <h6 class="text-sm font-medium text-gray-900 mb-2">Assignment Summary</h6>
          <div class="text-xs text-gray-600">
            <div v-if="localNodeData.assignmentType === 'users' && localNodeData.assignedUsers?.length">
              Task assigned to {{ localNodeData.assignedUsers.length }} user(s)
            </div>
            <div v-if="localNodeData.assignmentType === 'roles' && localNodeData.assignedRoles?.length">
              Task assigned to {{ localNodeData.assignedRoles.length }} role(s)
            </div>
            <div v-if="localNodeData.assignmentType === 'variable' && localNodeData.assignmentVariable">
              Task dynamically assigned using variable: {{ localNodeData.assignmentVariable }}
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
  },
  availableUsers: {
    type: Array,
    default: () => []
  },
  availableRoles: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update']);

// Get the variable store for creating variables
const variableStore = useVariableStore();

// State for form fields
const formFields = ref([]);
const isLoadingFields = ref(false);

// Local state for node data - create a deep copy to avoid mutation issues
const localNodeData = ref({
  label: 'Form Task',
  description: '',
  formId: null,
  formName: '',
  formUuid: null,
  inputMappings: [],
  outputMappings: [],
  fieldConditions: [],
  assignmentType: 'public',
  assignedUsers: [],
  assignedRoles: [],
  assignmentVariable: '',
  assignmentVariableType: 'user_id'
});

// Watch for changes from parent props
watch(() => props.nodeData, async (newNodeData) => {
  if (newNodeData) {
    // Create a deep copy to break reactivity chains with parent
    localNodeData.value = {
      label: newNodeData.label || 'Form Task',
      description: newNodeData.description || '',
      formId: newNodeData.formId || null,
      formName: newNodeData.formName || '',
      formUuid: newNodeData.formUuid || null,
      inputMappings: Array.isArray(newNodeData.inputMappings) 
        ? newNodeData.inputMappings.map(mapping => ({ ...mapping }))
        : [],
      outputMappings: Array.isArray(newNodeData.outputMappings) 
        ? newNodeData.outputMappings.map(mapping => ({ ...mapping }))
        : [],
      fieldConditions: Array.isArray(newNodeData.fieldConditions) 
        ? newNodeData.fieldConditions.map(condition => ({ ...condition }))
        : [],
      assignmentType: newNodeData.assignmentType || 'public',
      assignedUsers: Array.isArray(newNodeData.assignedUsers) ? newNodeData.assignedUsers.map(user => ({ ...user })) : [],
      assignedRoles: Array.isArray(newNodeData.assignedRoles) ? newNodeData.assignedRoles.map(role => ({ ...role })) : [],
      assignmentVariable: newNodeData.assignmentVariable || '',
      assignmentVariableType: newNodeData.assignmentVariableType || 'user_id'
    };
    
    // Load form fields if form is already selected
    if (newNodeData.formId || newNodeData.formUuid) {
      await loadFormFields(newNodeData.formId || newNodeData.formUuid);
    }
  }
}, { immediate: true, deep: true });

// Function to handle form selection
async function handleFormSelection(form) {
  if (!form) return;
  
  localNodeData.value = {
    ...localNodeData.value,
    formId: form.formID,
    formName: form.formName,
    formUuid: form.formUUID,
    label: form.formName || 'Form Task',
    description: `Form: ${form.formName}`,
    fieldConditions: [],
    assignmentType: 'public',
    assignedUsers: [],
    assignedRoles: [],
    assignmentVariable: '',
    assignmentVariableType: 'user_id'
  };
  
  // Load form fields for this form
  await loadFormFields(form.formID || form.formUUID);
  
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
    outputMappings: [],
    fieldConditions: [],
    assignmentType: 'public',
    assignedUsers: [],
    assignedRoles: [],
    assignmentVariable: '',
    assignmentVariableType: 'user_id'
  };
  
  // Clear form fields
  formFields.value = [];
  
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
  // Handle cases where formField is not a string
  if (!formField) return 'form_data';
  
  // Convert to string if it's not already (in case it's an object)
  let fieldName = '';
  if (typeof formField === 'string') {
    fieldName = formField;
  } else if (typeof formField === 'object' && formField.name) {
    fieldName = formField.name;
  } else if (typeof formField === 'object' && formField.value) {
    fieldName = formField.value;
  } else {
    return 'form_data';
  }
  
  // Ensure we have a valid string
  if (!fieldName || typeof fieldName !== 'string') {
    return 'form_data';
  }
  
  // Convert the form field to a valid variable name
  // Remove spaces, special characters, and convert to camelCase
  const result = fieldName.replace(/[^a-zA-Z0-9_]/g, '_')
    .replace(/^([A-Z])/, (match) => match.toLowerCase())
    .replace(/[\s_]+(\w)/g, (_, c) => c.toUpperCase());
    
  return result;
}

// Create a variable from a mapping
function createVariableFromMapping(mapping) {
  const processVariableValue = getStringValue(mapping.processVariable);
  
  if (!processVariableValue || !processVariableValue.startsWith('create_new_')) {
    return;
  }
  
  const variableName = processVariableValue.replace('create_new_', '');
  if (!variableName) {
    return;
  }
  
  // Create the variable
  const newVariable = {
    name: variableName,
    type: 'string',
    scope: 'global',
    description: `Form data from ${getStringValue(mapping.formField)} in ${localNodeData.value.formName || 'form'}`
  };
  
  // Add the variable
  variableStore.addVariable(newVariable);
  
  // Update the mapping to use the new variable name (string value, not object)
  mapping.processVariable = variableName;
  
  // Save changes
  nextTick(() => {
    saveChanges();
  });
}

// Load form fields for the selected form
async function loadFormFields(formId) {
  if (!formId) {
    formFields.value = [];
    return;
  }
  
  isLoadingFields.value = true;
  
  try {
    const response = await fetch(`/api/forms/${formId}/fields`);
    const result = await response.json();
    
    if (result.success && result.fields) {
      formFields.value = result.fields;
    } else {
      console.error('Failed to load form fields:', result.error);
      formFields.value = [];
    }
  } catch (error) {
    console.error('Error loading form fields:', error);
    formFields.value = [];
  } finally {
    isLoadingFields.value = false;
  }
}

// Computed property for form field options (for FormKit select)
const formFieldOptions = computed(() => {
  return formFields.value.map(field => ({
    label: `${field.label} (${field.name})`,
    value: field.name,
    description: field.description || `${field.type} field`
  }));
});

// Computed property for process variable options (for FormKit select)
const processVariableOptions = computed(() => {
  return props.availableVariables.map(variable => ({
    label: variable.label || `${variable.name} (${variable.scope || 'unknown'})`,
    value: variable.name,
    description: variable.description || `Type: ${variable.type || 'unknown'}`
  }));
});

// Reactive state for users and roles
const users = ref([]);
const roles = ref([]);

// Computed property for available users (for FormKit select)
const availableUsers = computed(() => {
  return users.value.map(user => ({
    label: user.userFullName ? `${user.userFullName} (${user.userUsername})` : user.userUsername,
    value: user.userID,
    username: user.userUsername,
    email: user.userEmail
  }));
});

// Computed property for available roles (for FormKit select)
const availableRoles = computed(() => {
  return roles.value.map(role => ({
    label: role.roleName,
    value: role.roleID,
    description: role.roleDescription
  }));
});

// Fetch users and roles data
async function fetchUsersAndRoles() {
  try {
    // Fetch users
    const usersResponse = await fetch('/api/users');
    const usersResult = await usersResponse.json();
    if (usersResult.success && usersResult.users) {
      users.value = usersResult.users;
    }

    // Fetch roles
    const rolesResponse = await fetch('/api/roles');
    const rolesResult = await rolesResponse.json();
    if (rolesResult.success && rolesResult.roles) {
      roles.value = rolesResult.roles;
    }
  } catch (error) {
    console.error('Error fetching users and roles:', error);
  }
}

// Fetch data when component mounts
nextTick(() => {
  fetchUsersAndRoles();
});

// Save changes by emitting them to parent
function saveChanges() {
  // Create a clean copy of the data to avoid reactivity issues
  const nodeDataCopy = {
    ...localNodeData.value,
    inputMappings: localNodeData.value.inputMappings ? 
      localNodeData.value.inputMappings.map(mapping => ({ ...mapping })) : [],
    outputMappings: localNodeData.value.outputMappings ? 
      localNodeData.value.outputMappings.map(mapping => ({ ...mapping })) : [],
    fieldConditions: localNodeData.value.fieldConditions ? 
      localNodeData.value.fieldConditions.map(condition => ({ ...condition })) : [],
    assignmentType: localNodeData.value.assignmentType || 'public',
    assignedUsers: localNodeData.value.assignedUsers ? localNodeData.value.assignedUsers.map(user => ({ ...user })) : [],
    assignedRoles: localNodeData.value.assignedRoles ? localNodeData.value.assignedRoles.map(role => ({ ...role })) : [],
    assignmentVariable: localNodeData.value.assignmentVariable || '',
    assignmentVariableType: localNodeData.value.assignmentVariableType || 'user_id'
  };
  
  // Emit the updated data to parent
  emit('update', nodeDataCopy);
}

// Explicit save function for when the Save button is clicked
function saveAllChanges() {
  saveChanges();
}

// Expose saveAllChanges so parent components can call it
defineExpose({
  saveAllChanges
});

// Add a field condition
function addFieldCondition() {
  if (!localNodeData.value.fieldConditions) {
    localNodeData.value.fieldConditions = [];
  }
  
  localNodeData.value.fieldConditions.push({
    processVariable: '',
    operator: '',
    value: '',
    targetField: '',
    action: '',
    description: ''
  });
  
  saveChanges();
}

// Remove a field condition
function removeFieldCondition(index) {
  localNodeData.value.fieldConditions.splice(index, 1);
  saveChanges();
}

// Helper function to safely extract string values from FormKit select options
function getStringValue(value) {
  if (typeof value === 'string') {
    return value;
  } else if (typeof value === 'object' && value.label) {
    return value.label;
  } else if (typeof value === 'object' && value.value) {
    return value.value;
  } else {
    console.warn('Unexpected value type:', value);
    return '';
  }
}

// Handle assignment type change
function handleAssignmentTypeChange() {
  // Implementation of handleAssignmentTypeChange function
  saveChanges();
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