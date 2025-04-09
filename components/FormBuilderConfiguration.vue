<template>
  <div class="config-panel">
    <template v-if="component">
      <div class="mb-3">
        <div class="text-xs text-gray-500">{{ component.type }}</div>
        <div class="text-base font-medium text-gray-700">{{ component.props.label || component.name }}</div>
      </div>
      
      <div class="custom-tabs">
        <!-- Tab Navigation -->
        <div class="custom-tab-nav">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            @click="activeTab = tab.id"
            class="custom-tab-button"
            :class="{ 'active': activeTab === tab.id }"
          >
            {{ tab.label }}
          </button>
        </div>
        
        <!-- Tab Content -->
        <div class="custom-tab-content p-4 border border-gray-200 rounded-b bg-white">
          <!-- Basic Tab -->
          <div v-if="activeTab === 'basic'" class="space-y-3">
            <!-- Standard Fields For All Components -->
            <FormKit
              v-if="showField('label')"
              type="text"
              label="Label"
              name="label"
              v-model="configModel.label"
              help="The label displayed above the field"
            />
            
            <FormKit
              v-if="showField('name')"
              type="text"
              label="Field Name"
              name="name"
              v-model="configModel.name"
              help="The name used when submitting the form"
              validation="required"
            />
            
            <FormKit
              v-if="showField('placeholder')"
              type="text"
              label="Placeholder"
              name="placeholder"
              v-model="configModel.placeholder"
              help="Text shown when field is empty"
            />
            
            <FormKit
              v-if="showField('help')"
              type="textarea"
              label="Help Text"
              name="help"
              v-model="configModel.help"
              help="Helpful text displayed below the field"
            />
            
            <!-- Value Fields For Text Components -->
            <FormKit
              v-if="showField('value')"
              type="textarea"
              label="Content"
              name="value"
              v-model="configModel.value"
              help="The content to display"
            />
            
            <!-- Level Field For Heading -->
            <FormKit
              v-if="showField('level')"
              type="select"
              label="Heading Level"
              name="level"
              v-model="configModel.level"
              :options="[
                { label: 'Heading 1 (Large)', value: 1 },
                { label: 'Heading 2 (Medium)', value: 2 },
                { label: 'Heading 3 (Small)', value: 3 },
                { label: 'Heading 4 (Extra Small)', value: 4 }
              ]"
              help="Size of the heading"
            />
            
            <!-- Options For Select/Radio/Checkbox -->
            <div v-if="showField('options')">
              <div class="flex justify-between items-center mb-1">
                <label class="text-sm font-medium">Options</label>
                <button 
                  class="text-xs text-blue-600 hover:text-blue-700 flex items-center" 
                  @click="addOption"
                >
                  <Icon name="material-symbols:add-circle-outline" class="w-3.5 h-3.5 mr-0.5" />
                  Add Option
                </button>
              </div>
              
              <div class="border rounded bg-gray-50 divide-y">
                <div 
                  v-for="(option, index) in configModel.options" 
                  :key="index"
                  class="flex items-center p-2"
                >
                  <div class="flex-1 grid grid-cols-2 gap-2">
                    <FormKit
                      type="text"
                      placeholder="Label"
                      v-model="option.label"
                    />
                    <div class="flex items-center">
                      <FormKit
                        type="text"
                        placeholder="Value"
                        v-model="option.value"
                      />
                      <button 
                        class="ml-1 p-1 text-gray-400 hover:text-red-500 rounded" 
                        @click="removeOption(index)"
                        title="Remove option"
                      >
                        <Icon name="material-symbols:delete-outline" class="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div v-if="configModel.options && configModel.options.length === 0" class="p-2 text-center text-gray-500 text-xs">
                  No options added yet
                </div>
              </div>
            </div>
            
            <!-- Accept Types for File Upload -->
            <FormKit
              v-if="showField('accept')"
              type="text"
              label="Accepted File Types"
              name="accept"
              v-model="configModel.accept"
              help="File types, e.g. '.jpg,.png,image/*'"
            />
            
            <!-- Max items for repeater -->
            <FormKit
              v-if="showField('max')"
              type="number"
              label="Maximum Items"
              name="max"
              v-model="configModel.max"
              help="Maximum number of repeatable items"
              min="1"
            />
          </div>
          
          <!-- Validation Tab -->
          <div v-if="activeTab === 'validation'" class="space-y-3">
            <div class="mb-3">
              <div class="flex justify-between items-center mb-1">
                <label class="text-sm font-medium">Available Validations</label>
              </div>
              <div class="flex flex-wrap gap-1">
                <button 
                  v-for="validator in availableValidators" 
                  :key="validator.name"
                  @click="addValidator(validator.name)"
                  class="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded flex items-center"
                >
                  <Icon name="material-symbols:add-circle-outline" class="w-3 h-3 mr-0.5 text-blue-600" />
                  {{ validator.label }}
                </button>
              </div>
            </div>
            
            <FormKit
              type="textarea"
              label="Validation Rules"
              name="validation"
              v-model="configModel.validation"
              help="Comma-separated validation rules"
              placeholder="e.g., required,email,min:5"
            />
            
            <div class="text-xs text-gray-600 mt-2 bg-gray-50 p-2 rounded-md">
              <div class="font-medium mb-1 text-gray-700">Common Validations:</div>
              <div class="grid grid-cols-2 gap-x-2 gap-y-1">
                <div><code>required</code> - Required field</div>
                <div><code>email</code> - Valid email</div>
                <div><code>min:8</code> - Min length</div>
                <div><code>max:100</code> - Max length</div>
                <div><code>url</code> - Valid URL</div>
                <div><code>date</code> - Valid date</div>
              </div>
            </div>
            
            <FormKit
              type="checkbox"
              label="Required Field"
              name="isRequired"
              v-model="isRequired"
              help="Make this field required for form submission"
            />
          </div>
          
          <!-- Advanced Tab -->
          <div v-if="activeTab === 'advanced'" class="space-y-3">
            <FormKit
              v-if="showField('id')"
              type="text"
              label="Component ID"
              name="componentId"
              :value="component.id"
              help="Unique identifier for this component"
              disabled
            />
            
            <!-- Show JSON representation -->
            <div class="bg-gray-50 p-2 rounded-md">
              <div class="text-xs font-medium mb-1">Component JSON:</div>
              <pre class="text-xs overflow-auto max-h-32">{{ JSON.stringify(component, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { useDebounceFn } from '@vueuse/core';

const props = defineProps({
  component: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update-component']);

// Define available tabs
const tabs = [
  { id: 'basic', label: 'Basic' },
  { id: 'validation', label: 'Validation' },
  { id: 'advanced', label: 'Advanced' }
];

// Set active tab
const activeTab = ref('basic');

// Create a deep copy of props to prevent direct mutation
const configModel = ref(JSON.parse(JSON.stringify(props.component.props || {})));

// Watch for component changes from parent, but with a deep equality check to avoid loops
watch(() => props.component, (newComponent) => {
  // Deep compare objects before updating to prevent unnecessary reactivity
  if (JSON.stringify(configModel.value) !== JSON.stringify(newComponent.props)) {
    configModel.value = JSON.parse(JSON.stringify(newComponent.props || {}));
  }
}, { deep: true });

// Watch for changes in the configuration and emit updates using a debounce
const debouncedEmit = useDebounceFn(() => {
  const updatedComponent = {
    ...props.component,
    props: JSON.parse(JSON.stringify(configModel.value))
  };
  emit('update-component', updatedComponent);
}, 100);

// Use debounced emit to avoid feedback loops
watch(configModel, () => {
  debouncedEmit();
}, { deep: true });

// Computed property to determine if the required validation is present
const isRequired = computed({
  get: () => {
    const validation = configModel.value.validation || '';
    return validation.includes('required');
  },
  set: (value) => {
    let validation = configModel.value.validation || '';
    
    // Remove existing required validation if present
    validation = validation.split(',')
      .filter(rule => rule.trim() !== 'required')
      .join(',');
    
    // Add required validation if checked
    if (value) {
      validation = 'required' + (validation ? ',' + validation : '');
    }
    
    configModel.value.validation = validation;
  }
});

// Define available validators that can be added
const availableValidators = [
  { name: 'required', label: 'Required' },
  { name: 'email', label: 'Email' },
  { name: 'url', label: 'URL' },
  { name: 'number', label: 'Number' },
  { name: 'min:5', label: 'Min:5' },
  { name: 'max:100', label: 'Max:100' },
  { name: 'between:5,10', label: 'Between' },
  { name: 'date', label: 'Date' },
  { name: 'matches:/pattern/', label: 'Pattern' }
];

// Add a validator to the validation string
const addValidator = (validator) => {
  let validation = configModel.value.validation || '';
  
  // Check if this validator is already included
  if (!validation.includes(validator)) {
    validation = validation ? validation + ',' + validator : validator;
    configModel.value.validation = validation;
  }
};

// Determine which fields to show based on component type
const showField = (fieldName) => {
  const componentType = props.component.type;
  
  switch (fieldName) {
    case 'label':
      return !['heading', 'paragraph', 'divider'].includes(componentType);
    case 'name':
      return !['heading', 'paragraph', 'divider'].includes(componentType);
    case 'placeholder':
      return ['text', 'textarea', 'email', 'password', 'number', 'select'].includes(componentType);
    case 'help':
      return !['heading', 'paragraph', 'divider'].includes(componentType);
    case 'value':
      return ['heading', 'paragraph'].includes(componentType);
    case 'level':
      return componentType === 'heading';
    case 'options':
      return ['select', 'radio', 'checkbox'].includes(componentType);
    case 'accept':
      return componentType === 'file';
    case 'max':
      return componentType === 'repeater';
    case 'id':
      return true; // Always show component ID in advanced tab
    default:
      return false;
  }
};

// Add a new option to select/radio/checkbox
const addOption = () => {
  if (!configModel.value.options) {
    configModel.value.options = [];
  }
  
  configModel.value.options.push({
    label: `Option ${configModel.value.options.length + 1}`,
    value: `option_${configModel.value.options.length + 1}`
  });
};

// Remove an option from select/radio/checkbox
const removeOption = (index) => {
  configModel.value.options.splice(index, 1);
};
</script>

<style scoped>
.config-panel {
  font-size: 0.9rem;
}

:deep(.formkit-inner) {
  min-height: auto !important;
}

:deep(.formkit-label) {
  font-size: 0.8rem;
  margin-bottom: 0.25rem;
}

:deep(.formkit-help) {
  font-size: 0.7rem;
  margin-top: 0.15rem;
}

.custom-tabs {
  border-radius: 0.375rem;
  overflow: hidden;
}

.custom-tab-nav {
  display: flex;
  background-color: #f9fafb;
  border-top-left-radius: 0.375rem;
  border-top-right-radius: 0.375rem;
}

.custom-tab-button {
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
  cursor: pointer;
  flex-grow: 1;
  text-align: center;
}

.custom-tab-button:hover {
  color: #4b5563;
  background-color: rgba(243, 244, 246, 0.8);
}

.custom-tab-button.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
  background-color: white;
}

.custom-tab-content {
  border-top: none;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
</style> 