<template>
  <div class="variable-manager">
    <!-- Header with Add Button -->
    <div class="bg-gray-50 border-b border-gray-200 p-4">
      <div class="flex items-center justify-between">
        <div class="flex items-start">
          <div class="mr-4 text-blue-500 flex-shrink-0 mt-1">
            <Icon name="material-symbols:data-object" class="text-2xl" />
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-900">Variables</h3>
            <p class="mt-1 text-sm text-gray-500">
              Define and manage variables to store and pass data within your process
            </p>
          </div>
        </div>
        <RsButton
          @click="
            () => {
              resetForm();
              showAddVariable = true;
            }
          "
          variant="primary"
          size="sm"
        >
          <Icon name="material-symbols:add" class="mr-1" />
          Add Variable
        </RsButton>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="px-4 pt-3 pb-2">
      <div class="relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon name="material-symbols:search" class="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          v-model="searchQuery"
          class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Search variables..."
        />
      </div>
    </div>

    <!-- Variable List -->
    <div class="p-4 overflow-auto flex-grow">
      <!-- Empty State -->
      <div v-if="!variables.length" class="text-center py-10 px-4 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
        <Icon
          name="material-symbols:data-object"
          class="w-14 h-14 mx-auto mb-3 text-gray-400"
        />
        <h4 class="text-base font-medium text-gray-900 mb-1">
          No Variables Added Yet
        </h4>
        <p class="text-sm text-gray-500 mb-4 max-w-md mx-auto">
          Variables allow you to store and manage data in your process flow. Add your first variable to get started.
        </p>
        <RsButton
          @click="
            () => {
              resetForm();
              showAddVariable = true;
            }
          "
          variant="primary"
          size="md"
        >
          <Icon name="material-symbols:add" class="mr-1" />
          Add First Variable
        </RsButton>
      </div>

      <!-- Variable List -->
      <div v-else-if="filteredVariables.length" class="space-y-2">
        <div
          v-for="variable in filteredVariables"
          :key="variable.name"
          class="variable-item bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all duration-150 group"
        >
          <!-- Variable Header -->
          <div class="px-4 py-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3 min-w-0 flex-1">
                <!-- Variable Icon -->
                <div class="flex-shrink-0">
                  <div 
                    class="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold"
                    :class="{
                      'bg-blue-100 text-blue-700': variable.type === 'string',
                      'bg-purple-100 text-purple-700': ['int', 'decimal'].includes(variable.type),
                      'bg-indigo-100 text-indigo-700': variable.type === 'boolean',
                      'bg-amber-100 text-amber-700': ['date', 'datetime'].includes(variable.type),
                      'bg-emerald-100 text-emerald-700': variable.type === 'object',
                      'bg-gray-100 text-gray-700': !['string', 'int', 'decimal', 'boolean', 'date', 'datetime', 'object'].includes(variable.type)
                    }"
                  >
                    <Icon :name="getVariableIcon(variable.type)" class="w-4 h-4" />
                  </div>
                </div>
                
                <!-- Variable Info -->
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <h4 class="text-sm font-medium text-gray-900 truncate">{{ variable.name }}</h4>
                    <RsBadge 
                      :variant="getTypeColor(variable.type)" 
                      size="sm"
                      class="flex-shrink-0"
                    >
                      {{ variable.type }}
                    </RsBadge>
                  </div>
                  
                  <!-- Description -->
                  <p v-if="variable.description" class="text-xs text-gray-500 line-clamp-1">
                    {{ variable.description }}
                  </p>
                </div>
              </div>
              
              <!-- Actions -->
              <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  @click="editVariable(variable)"
                  class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="Edit variable"
                >
                  <Icon name="material-symbols:edit" class="w-4 h-4" />
                </button>
                <button
                  @click="deleteVariable(variable)"
                  class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Delete variable"
                >
                  <Icon name="material-symbols:delete" class="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <!-- Default Value Display -->
            <div v-if="variable.defaultValue !== undefined && variable.defaultValue !== ''" class="mt-3">
              <div class="bg-amber-50 rounded-md p-2 border border-amber-100">
                <div class="flex items-center gap-1.5 mb-1">
                  <Icon name="material-symbols:settings" class="w-3.5 h-3.5 text-amber-600" />
                  <span class="text-xs font-medium text-amber-700 uppercase tracking-wide">Default Value</span>
                </div>
                <div class="font-mono text-xs text-amber-800 break-all">
                  {{ formatValue(variable.defaultValue, variable.type) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No search results -->
      <div v-else class="text-center py-8">
        <Icon
          name="material-symbols:search-off"
          class="w-12 h-12 mx-auto mb-3 text-gray-400"
        />
        <h4 class="text-sm font-medium text-gray-900 mb-1">
          No matching variables found
        </h4>
        <p class="text-sm text-gray-500 mb-4">
          Try using different keywords or <a href="#" @click.prevent="searchQuery = ''" class="text-blue-500">clear your search</a>
        </p>
      </div>
    </div>

    <!-- Add/Edit Variable Modal -->
    <RsModal
      v-model="showAddVariable"
      :title="editingVariable ? 'Edit Variable' : 'Add Variable'"
      size="md"
      :hideFooter="true"
      :overlayClose="false"
    >
      <div class="mb-4 flex items-start" v-if="!editingVariable">
        <div class="mr-3 text-blue-500 flex-shrink-0 mt-1">
          <Icon name="material-symbols:data-object" class="text-xl" />
        </div>
        <p class="text-sm text-gray-600">
          Variables store data that can be used throughout your process flow. They can be updated by tasks, used in conditions, 
          or displayed in forms.
        </p>
      </div>
      
      <FormKit
        type="form"
        @submit="saveVariable"
        :actions="false"
        class="space-y-4"
      >
        <FormKit
          name="name"
          v-model="variableForm.name"
          type="text"
          label="Variable Name"
          placeholder="Enter variable name (e.g. customerName)"
          validation="required|alpha_numeric|length:3,50"
          :validation-messages="{
            required: 'Variable name is required',
            alpha_numeric:
              'Variable name can only contain letters, numbers, and underscores',
            length: 'Variable name must be between 3 and 50 characters',
          }"
          help="Use a descriptive name without spaces. Example: totalAmount, customerName, orderStatus"
        />

        <FormKit
          name="type"
          v-model="variableForm.type"
          type="select"
          label="Data Type"
          :options="variableTypes"
          validation="required"
          :validation-messages="{
            required: 'Variable type is required',
          }"
          help="Select the type of data this variable will store"
        />

        <FormKit
          name="defaultValue"
          v-model="variableForm.defaultValue"
          :type="getInputTypeForVariableType(variableForm.type)"
          :label="`Default Value${variableForm.type === 'boolean' ? '' : ' (Optional)'}`"
          :placeholder="getPlaceholderForType(variableForm.type)"
          :options="variableForm.type === 'boolean' ? [
            { label: 'True', value: true },
            { label: 'False', value: false }
          ] : undefined"
          :help="getHelpTextForType(variableForm.type)"
        />

        <FormKit
          name="description"
          v-model="variableForm.description"
          type="textarea"
          label="Description"
          placeholder="Enter a description to help others understand what this variable is used for"
          :rows="2"
          help="A clear description helps others understand the purpose of this variable"
        />

        <div class="flex justify-end space-x-2 pt-4 border-t border-gray-200">
          <RsButton type="button" @click="closeModal" variant="tertiary">
            Cancel
          </RsButton>
          <FormKit type="submit" input-class="rs-button rs-button-primary">
            {{ editingVariable ? "Update Variable" : "Add Variable" }}
          </FormKit>
        </div>
      </FormKit>
    </RsModal>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useVariableStore } from "~/stores/variableStore";

const variableStore = useVariableStore();

// State
const showAddVariable = ref(false);
const editingVariable = ref(null);
const searchQuery = ref("");
const variableForm = ref({
  name: "",
  type: "string",
  scope: "global",
  description: "",
  defaultValue: ""
});

// Variable type options with descriptions
const variableTypes = [
  { label: 'String - Text values', value: 'string' },
  { label: 'Int - Whole numbers', value: 'int' },
  { label: 'Decimal - Decimal numbers', value: 'decimal' },
  { label: 'Object - Complex data structure', value: 'object' },
  { label: 'DateTime - Date and time values', value: 'datetime' },
  { label: 'Date - Date values only', value: 'date' },
  { label: 'Boolean - True/False values', value: 'boolean' }
];

// Helper functions for default value input
const getInputTypeForVariableType = (type) => {
  switch (type) {
    case 'int':
    case 'decimal':
      return 'number';
    case 'boolean':
      return 'select';
    case 'date':
      return 'date';
    case 'datetime':
      return 'datetime-local';
    case 'object':
      return 'textarea';
    default:
      return 'text';
  }
};

const getPlaceholderForType = (type) => {
  switch (type) {
    case 'string':
      return 'Enter default text value';
    case 'int':
      return 'Enter default number (e.g. 0, 100)';
    case 'decimal':
      return 'Enter default decimal (e.g. 0.0, 99.99)';
    case 'object':
      return 'Enter default JSON object (e.g. {"key": "value"})';
    case 'date':
      return 'Select default date';
    case 'datetime':
      return 'Select default date and time';
    case 'boolean':
      return 'Select default boolean value';
    default:
      return 'Enter default value';
  }
};

const getHelpTextForType = (type) => {
  switch (type) {
    case 'string':
      return 'Default text that will be used when the variable is first created';
    case 'int':
      return 'Default whole number (no decimals)';
    case 'decimal':
      return 'Default decimal number (with decimal places)';
    case 'object':
      return 'Default JSON object - must be valid JSON format';
    case 'date':
      return 'Default date value for this variable';
    case 'datetime':
      return 'Default date and time value for this variable';
    case 'boolean':
      return 'Default true/false value for this variable';
    default:
      return 'Default value that will be used when the variable is first created';
  }
};

// Computed
const variables = computed(() => {
  // Return all variables (treating everything as global)
  const allVars = variableStore.getAllVariables;
  return [...allVars.global, ...allVars.process];
});

// Filtered variables based on search query
const filteredVariables = computed(() => {
  if (!searchQuery.value) return variables.value;
  
  const query = searchQuery.value.toLowerCase();
  return variables.value.filter(variable => 
    variable.name.toLowerCase().includes(query) || 
    (variable.description && variable.description.toLowerCase().includes(query)) ||
    variable.type.toLowerCase().includes(query)
  );
});

// Methods
const editVariable = (variable) => {
  editingVariable.value = variable;
  variableForm.value = { 
    ...variable,
    defaultValue: variable.defaultValue || ""
  };
  showAddVariable.value = true;
};

const deleteVariable = (variable) => {
  if (confirm(`Are you sure you want to delete the variable "${variable.name}"? This might affect parts of your process that use this variable.`)) {
    const scope = variable.scope || 'global';
    variableStore.deleteVariable(variable.name, scope);
  }
};

const resetForm = () => {
  variableForm.value = {
    name: "",
    type: "string",
    scope: "global",
    description: "",
    defaultValue: ""
  };
  editingVariable.value = null;
};

const closeModal = () => {
  showAddVariable.value = false;
  resetForm();
};

const saveVariable = async (formData) => {
  try {
    // Process default value based on type
    let processedDefaultValue = formData.defaultValue;
    
    if (formData.type === 'int' && processedDefaultValue !== '') {
      processedDefaultValue = parseInt(processedDefaultValue);
    } else if (formData.type === 'decimal' && processedDefaultValue !== '') {
      processedDefaultValue = parseFloat(processedDefaultValue);
    } else if (formData.type === 'object' && processedDefaultValue !== '') {
      try {
        processedDefaultValue = JSON.parse(processedDefaultValue);
      } catch (e) {
        alert('Invalid JSON format for object type. Please enter valid JSON.');
        return;
      }
    }

    // Create a new variable object
    const newVariable = {
      name: formData.name,
      type: formData.type,
      scope: "global",
      description: formData.description,
      defaultValue: processedDefaultValue
    };

    if (editingVariable.value) {
      // Update existing variable
      variableStore.updateVariable(
        editingVariable.value.name,
        newVariable,
        'global'
      );
    } else {
      // Add new variable
      variableStore.addVariable(newVariable);
    }

    // Close modal and reset form
    closeModal();
  } catch (error) {
    console.error("Error saving variable:", error);
    alert('Error saving variable. Please check your input and try again.');
  }
};

// Get badge color based on variable type
const getTypeColor = (type) => {
  switch (type) {
    case 'string': return 'info';
    case 'int': 
    case 'decimal': return 'primary';
    case 'object': return 'success';
    case 'datetime':
    case 'date': return 'warning';
    case 'boolean': return 'secondary';
    default: return 'secondary';
  }
};

// Format variable value for display
const formatValue = (value, type) => {
  if (value === undefined || value === null) return 'null';
  
  switch (type) {
    case 'object':
      try {
        return typeof value === 'string' ? value : JSON.stringify(value);
      } catch (e) {
        return String(value);
      }
    case 'boolean':
      return value ? 'true' : 'false';
    default:
      return String(value);
  }
};

// Get icon based on variable type
const getVariableIcon = (type) => {
  switch (type) {
    case 'string':
      return 'material-symbols:text-fields';
    case 'int':
    case 'decimal':
      return 'material-symbols:pin';
    case 'boolean':
      return 'material-symbols:toggle-on';
    case 'date':
      return 'material-symbols:calendar-today';
    case 'datetime':
      return 'material-symbols:schedule';
    case 'object':
      return 'material-symbols:data-object';
    default:
      return 'material-symbols:data-object';
  }
};
</script>

<style scoped>
.variable-manager {
  @apply h-full flex flex-col;
}

.variable-item {
  @apply transition-all duration-200;
}

.variable-item:hover {
  @apply transform -translate-y-0.5;
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Light styling for FormKit form */
:deep(.formkit-outer) {
  margin-bottom: 1rem;
}

:deep(.formkit-label) {
  font-weight: 500;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
  color: #374151;
}

:deep(.formkit-help) {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

:deep(.formkit-messages) {
  font-size: 0.75rem;
  color: #ef4444;
  margin-top: 0.25rem;
}
</style>
