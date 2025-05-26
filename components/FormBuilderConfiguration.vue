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
            v-for="tab in availableTabs" 
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
            <!-- Width Configuration -->
            <div v-if="showField('width')">
              <label class="text-sm font-medium mb-1 block">Component Width</label>
              <div class="grid grid-cols-4 gap-2 mt-2">
                <button 
                  v-for="width in [25, 33, 50, 66, 75, 100]" 
                  :key="width"
                  @click="setComponentWidth(width)"
                  class="py-1 px-2 border rounded text-xs"
                  :class="{
                    'bg-blue-50 border-blue-200 text-blue-600': getComponentWidthPercent() === width,
                    'bg-white border-gray-200 text-gray-700 hover:bg-gray-50': getComponentWidthPercent() !== width
                  }"
                >
                  {{ width }}%
                </button>
              </div>
              <div class="flex items-center mt-2">
                <div class="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    class="bg-blue-600 h-2.5 rounded-full" 
                    :style="{ width: configModel.width || '100%' }"
                  ></div>
                </div>
                <span class="ml-2 text-xs text-gray-500">{{ configModel.width || '100%' }}</span>
              </div>
            </div>

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
            

            
            <!-- Information Display Configuration -->
            <template v-if="component.type === 'info-display'">
              <FormKit
                type="text"
                label="Title"
                name="title"
                v-model="configModel.title"
                help="Title displayed at the top"
              />
              
              <FormKit
                type="select"
                label="Layout"
                name="layout"
                v-model="configModel.layout"
                :options="[
                  { label: 'Vertical (Label above value)', value: 'vertical' },
                  { label: 'Horizontal (Label: Value)', value: 'horizontal' },
                  { label: 'Grid (2 columns)', value: 'grid' }
                ]"
                help="How to display the information fields"
              />
              
              <div class="grid grid-cols-2 gap-4">
                <FormKit
                  type="checkbox"
                  label="Show Border"
                  name="showBorder"
                  v-model="configModel.showBorder"
                  help="Show border around the information display"
                />
                
                <FormKit
                  type="color"
                  label="Background Color"
                  name="backgroundColor"
                  v-model="configModel.backgroundColor"
                  help="Background color"
                />
              </div>
              
              <!-- Information Fields Management -->
              <div>
                <div class="flex justify-between items-center mb-2">
                  <label class="text-sm font-medium">Information Fields</label>
                  <button 
                    class="text-xs text-blue-600 hover:text-blue-700 flex items-center" 
                    @click="addInfoField"
                  >
                    <Icon name="material-symbols:add-circle-outline" class="w-3.5 h-3.5 mr-0.5" />
                    Add Field
                  </button>
                </div>
                
                <div class="border rounded bg-gray-50 divide-y max-h-64 overflow-y-auto">
                  <div 
                    v-for="(field, index) in configModel.fields" 
                    :key="index"
                    class="p-3"
                  >
                    <div class="grid grid-cols-2 gap-2 mb-2">
                      <FormKit
                        type="text"
                        placeholder="Label (e.g., Customer Name)"
                        v-model="field.label"
                        :classes="{ outer: 'mb-0' }"
                      />
                      <FormKit
                        type="text"
                        placeholder="Key (e.g., customer_name)"
                        v-model="field.key"
                        :classes="{ outer: 'mb-0' }"
                      />
                    </div>
                    <div class="flex items-center">
                      <FormKit
                        type="text"
                        placeholder="Value (e.g., John Doe)"
                        v-model="field.value"
                        :classes="{ outer: 'mb-0 flex-1' }"
                      />
                      <button 
                        class="ml-2 p-1 text-gray-400 hover:text-red-500 rounded" 
                        @click="removeInfoField(index)"
                        title="Remove field"
                      >
                        <Icon name="material-symbols:delete-outline" class="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div v-if="!configModel.fields || configModel.fields.length === 0" class="p-3 text-center text-gray-500 text-xs">
                    No information fields added yet
                  </div>
                </div>
              </div>
            </template>
          </div>
          
          <!-- Validation Tab -->
          <div v-if="activeTab === 'validation'" class="space-y-4">
            <!-- Validation tab -->
            <FormKit v-if="showValidationTab" type="group" id="validation-section">
              <div class="flex flex-col mt-4 border p-4 rounded-md">
                <h3 class="font-medium text-gray-700 mb-4">Common Validations</h3>
                
                <!-- Required field -->
                <div class="mb-3 flex items-center">
                  <input 
                    type="checkbox" 
                    id="validation-required" 
                    v-model="isRequired" 
                    class="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500"
                  >
                  <label for="validation-required" class="text-sm text-gray-700">Required Field</label>
                </div>
                
                <!-- Email format validation -->
                <div class="mb-3 flex items-center">
                  <input 
                    type="checkbox" 
                    id="validation-email" 
                    v-model="isEmail" 
                    class="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500"
                  >
                  <label for="validation-email" class="text-sm text-gray-700">Email Format</label>
                </div>
                
                <!-- URL format validation -->
                <div class="mb-3 flex items-center">
                  <input 
                    type="checkbox" 
                    id="validation-url" 
                    v-model="isUrl" 
                    class="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500"
                  >
                  <label for="validation-url" class="text-sm text-gray-700">URL Format</label>
                </div>
                
                <!-- Numbers only validation -->
                <div class="mb-3 flex items-center">
                  <input 
                    type="checkbox" 
                    id="validation-number" 
                    v-model="isNumber" 
                    class="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500"
                  >
                  <label for="validation-number" class="text-sm text-gray-700">Numbers Only</label>
                </div>
                
                <!-- Min/Max validations -->
                <div class="grid grid-cols-2 gap-4 mt-2">
                  <!-- Min value/length -->
                  <div class="mb-3">
                    <label for="validation-min" class="block text-sm text-gray-700 mb-1">Minimum Value/Length</label>
                    <input 
                      type="number" 
                      id="validation-min" 
                      v-model="minValue" 
                      class="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter minimum"
                    >
                  </div>
                  
                  <!-- Max value/length -->
                  <div class="mb-3">
                    <label for="validation-max" class="block text-sm text-gray-700 mb-1">Maximum Value/Length</label>
                    <input 
                      type="number" 
                      id="validation-max" 
                      v-model="maxValue" 
                      class="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter maximum"
                    >
                  </div>
                </div>
              </div>
              
              <!-- Current validation rules (read-only) -->
              <div class="mt-4">
                <label for="current-validation-rules" class="block text-sm font-medium text-gray-700 mb-1">
                  Current Validation Rules
                </label>
                <textarea 
                  id="current-validation-rules" 
                  v-model="configModel.validation" 
                  readonly
                  class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50"
                  rows="3"
                ></textarea>
                <p class="text-xs text-gray-500 mt-1">
                  These are the validation rules that will be applied to this field.
                </p>
              </div>
            </FormKit>
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

// State variables
const activeTab = ref('basic');

// Create a deep copy of props to prevent direct mutation
const configModel = ref(JSON.parse(JSON.stringify(props.component?.props || {})));

// Watch for component changes from parent, with a better approach to handle updates
watch(() => props.component, (newComponent) => {
  if (!newComponent) return;
  
  // Make a fresh copy to ensure reactivity
  configModel.value = JSON.parse(JSON.stringify(newComponent.props || {}));
}, { immediate: true, deep: true });

// Watch for changes in the configuration and emit updates using a debounce
const debouncedEmit = useDebounceFn(() => {
  if (!props.component) return;
  
  // Create a new component object with updated props
  const updatedComponent = {
    ...props.component,
    id: props.component.id, // Ensure ID is preserved
    props: JSON.parse(JSON.stringify(configModel.value))
  };
  
  // Only emit if there are actual changes
  if (JSON.stringify(updatedComponent.props) !== JSON.stringify(props.component.props)) {
    emit('update-component', updatedComponent);
  }
}, 100);

// Watch for changes to configModel and emit updates
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
    updateValidation('required', value);
  }
});

// Email validation
const isEmail = computed({
  get: () => {
    const validation = configModel.value.validation || '';
    return validation.includes('email');
  },
  set: (value) => {
    updateValidation('email', value);
  }
});

// URL validation
const isUrl = computed({
  get: () => {
    const validation = configModel.value.validation || '';
    return validation.includes('url');
  },
  set: (value) => {
    updateValidation('url', value);
  }
});

// Number validation
const isNumber = computed({
  get: () => {
    const validation = configModel.value.validation || '';
    return validation.includes('number');
  },
  set: (value) => {
    updateValidation('number', value);
  }
});

// Min value/length
const minValue = computed({
  get: () => {
    const validation = configModel.value.validation || '';
    const minMatch = validation.match(/min:(\d+)/);
    return minMatch ? parseInt(minMatch[1]) : null;
  },
  set: (value) => {
    if (value === null || value === '') {
      // Remove min validation if empty
      updateValidation('min', false);
    } else {
      // Update with new value
      updateValidation('min', true, value);
    }
  }
});

// Max value/length
const maxValue = computed({
  get: () => {
    const validation = configModel.value.validation || '';
    const maxMatch = validation.match(/max:(\d+)/);
    return maxMatch ? parseInt(maxMatch[1]) : null;
  },
  set: (value) => {
    if (value === null || value === '') {
      // Remove max validation if empty
      updateValidation('max', false);
    } else {
      // Update with new value
      updateValidation('max', true, value);
    }
  }
});

// Helper function to update validation string
const updateValidation = (rule, isActive, value = null) => {
  // Parse current validation into array
  let validationRules = (configModel.value.validation || '')
    .split(',')
    .map(r => r.trim())
    .filter(r => r !== '');
  
  // Remove existing instance of the rule (including any with parameters)
  validationRules = validationRules.filter(r => !r.startsWith(`${rule}:`) && r !== rule);
  
  // Add rule if it should be active
  if (isActive) {
    if (value !== null) {
      // For rules with parameters like min:5
      validationRules.push(`${rule}:${value}`);
    } else {
      // For simple rules like required
      validationRules.push(rule);
    }
  }
  
  // Update the validation string
  configModel.value.validation = validationRules.join(',');
};

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
    case 'id':
      return true; // Always show component ID in advanced tab
    case 'width':
      return true; // Always show width in basic tab
    case 'title':
      return componentType === 'info-display';
    case 'layout':
    case 'showBorder':
    case 'fields':
      return componentType === 'info-display';
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

// Add a new information field for info-display component
const addInfoField = () => {
  if (!configModel.value.fields) {
    configModel.value.fields = [];
  }
  
  configModel.value.fields.push({
    label: `Field ${configModel.value.fields.length + 1}`,
    value: 'Value',
    key: `field_${configModel.value.fields.length + 1}`
  });
};

// Remove an information field from info-display component
const removeInfoField = (index) => {
  configModel.value.fields.splice(index, 1);
};

// Inside the <script setup> section
// Add width to fieldsToShow
const fieldsToShow = {
  // Basic input types
  text: ['label', 'name', 'placeholder', 'help', 'width'],
  textarea: ['label', 'name', 'placeholder', 'help', 'width'],
  number: ['label', 'name', 'placeholder', 'help', 'width'],
  email: ['label', 'name', 'placeholder', 'help', 'width'],
  password: ['label', 'name', 'placeholder', 'help', 'width'],
  
  // Selection types
  select: ['label', 'name', 'placeholder', 'help', 'options', 'width'],
  checkbox: ['label', 'name', 'help', 'options', 'width'],
  radio: ['label', 'name', 'help', 'options', 'width'],
  
  // Date and time
  date: ['label', 'name', 'placeholder', 'help', 'width'],
  time: ['label', 'name', 'placeholder', 'help', 'width'],
  'datetime-local': ['label', 'name', 'placeholder', 'help', 'width'],
  
  // Advanced
  file: ['label', 'name', 'help', 'accept', 'width'],
  
  // Layout elements
  heading: ['value', 'level', 'width'],
  paragraph: ['value', 'width'],
  divider: ['width'],
  'info-display': ['title', 'layout', 'showBorder', 'backgroundColor', 'fields', 'width']
};

// Add these methods
const getComponentWidthPercent = () => {
  if (!configModel.value.width) return 100;
  
  // Parse the width from percentage string
  const widthStr = configModel.value.width.toString();
  const match = widthStr.match(/(\d+)%/);
  return match ? parseInt(match[1]) : 100;
};

// Computed property to determine if validation tab should be shown
const showValidationTab = computed(() => {
  const nonValidationComponents = ['heading', 'paragraph', 'divider', 'info-display'];
  return !nonValidationComponents.includes(props.component.type);
});

const availableTabs = computed(() => {
  return [
    { id: 'basic', label: 'Basic' },
    ...(showValidationTab.value ? [{ id: 'validation', label: 'Validation' }] : []),
    { id: 'advanced', label: 'Advanced' }
  ];
});

// If activeTab is set to 'validation' but component type doesn't support validation,
// automatically switch to 'basic' tab
watch(showValidationTab, (showValidation) => {
  if (!showValidation && activeTab.value === 'validation') {
    activeTab.value = 'basic';
  }
}, { immediate: true });

const setComponentWidth = (widthPercent) => {
  // Convert precise percentages to exact grid column spans
  // This ensures the visual appearance matches the percentage
  let gridColumns;
  switch (widthPercent) {
    case 25: gridColumns = 3; break;  // 3/12 = 25%
    case 33: gridColumns = 4; break;  // 4/12 = 33.33%
    case 50: gridColumns = 6; break;  // 6/12 = 50%
    case 66: gridColumns = 8; break;  // 8/12 = 66.67%
    case 75: gridColumns = 9; break;  // 9/12 = 75%
    case 100: gridColumns = 12; break; // 12/12 = 100%
    default: gridColumns = Math.round((widthPercent / 100) * 12);
  }
  
  // Update the configModel
  configModel.value = {
    ...configModel.value,
    width: `${widthPercent}%`,
    gridColumn: `span ${gridColumns}`
  };
  
  // Emit update event
  emit('update-component', {
    id: props.component.id,
    ...props.component,
    props: configModel.value
  });
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