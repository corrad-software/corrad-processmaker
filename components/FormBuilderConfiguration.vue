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
            
            <!-- Image Preview Settings -->
            <template v-if="component.type === 'image-preview'">
              <FormKit
                v-if="showField('imageUrl')"
                type="text"
                label="Image URL"
                name="imageUrl"
                v-model="configModel.imageUrl"
                help="URL of the image to display"
              />
              
              <FormKit
                v-if="showField('altText')"
                type="text"
                label="Alt Text"
                name="altText"
                v-model="configModel.altText"
                help="Alternative text for accessibility"
              />
              
              <FormKit
                v-if="showField('caption')"
                type="text"
                label="Caption"
                name="caption"
                v-model="configModel.caption"
                help="Caption displayed below the image"
              />
              
              <FormKit
                v-if="showField('maxWidth')"
                type="text"
                label="Max Width"
                name="maxWidth"
                v-model="configModel.maxWidth"
                help="Maximum width of the image (px or %)"
              />
              
              <FormKit
                v-if="showField('height')"
                type="text"
                label="Height"
                name="height"
                v-model="configModel.height"
                help="Height of the image (px or auto)"
              />
              
              <div v-if="showField('showZoom')" class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">Display Options</label>
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input type="checkbox" v-model="configModel.showZoom" class="mr-2 h-4 w-4 rounded border-gray-300">
                    <span class="text-sm text-gray-700">Enable zoom on click</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" v-model="configModel.showCaption" class="mr-2 h-4 w-4 rounded border-gray-300">
                    <span class="text-sm text-gray-700">Show caption</span>
                  </label>
                </div>
              </div>
            </template>

            <!-- Dynamic List Settings -->
            <template v-if="component.type === 'dynamic-list'">
              <FormKit
                v-if="showField('buttonText')"
                type="text"
                label="Add Button Text"
                name="buttonText"
                v-model="configModel.buttonText"
                help="Text for the add item button"
              />
              
              <div class="grid grid-cols-2 gap-3">
                <FormKit
                  v-if="showField('minItems')"
                  type="number"
                  label="Min Items"
                  name="minItems"
                  v-model="configModel.minItems"
                  help="Minimum number of items"
                  min="0"
                />
                
                <FormKit
                  v-if="showField('maxItems')"
                  type="number"
                  label="Max Items"
                  name="maxItems"
                  v-model="configModel.maxItems"
                  help="Maximum number of items"
                  min="1"
                />
              </div>
              
              <div v-if="showField('defaultItems')">
                <label class="block text-sm font-medium text-gray-700 mb-1">Default Items</label>
                <div class="border rounded-md p-3 bg-gray-50 space-y-2">
                  <div v-for="(item, index) in configModel.defaultItems" :key="index" class="flex items-center">
                    <input
                      type="text"
                      v-model="configModel.defaultItems[index]"
                      class="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                    <button 
                      @click="configModel.defaultItems.splice(index, 1)"
                      class="ml-2 text-red-500 hover:text-red-700"
                      type="button"
                    >
                      <Icon name="material-symbols:delete-outline" class="w-4 h-4" />
                    </button>
                  </div>
                  <button 
                    @click="configModel.defaultItems.push('')"
                    class="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                    type="button"
                  >
                    <Icon name="material-symbols:add-circle-outline" class="w-4 h-4 mr-1" />
                    Add Default Item
                  </button>
                </div>
              </div>
            </template>
            
            <!-- Repeating Group Settings -->
            <template v-if="component.type === 'repeating-group'">
              <div class="grid grid-cols-2 gap-3">
                <FormKit
                  v-if="showField('minItems')"
                  type="number"
                  label="Min Items"
                  name="minItems"
                  v-model="configModel.minItems"
                  help="Minimum number of groups"
                  min="0"
                />
                
                <FormKit
                  v-if="showField('maxItems')"
                  type="number"
                  label="Max Items"
                  name="maxItems"
                  v-model="configModel.maxItems"
                  help="Maximum number of groups"
                  min="1"
                />
              </div>
              
              <div class="grid grid-cols-2 gap-3">
                <FormKit
                  v-if="showField('buttonText')"
                  type="text"
                  label="Add Button Text"
                  name="buttonText"
                  v-model="configModel.buttonText"
                  help="Text for the add button"
                />
                
                <FormKit
                  v-if="showField('removeText')"
                  type="text"
                  label="Remove Button Text"
                  name="removeText"
                  v-model="configModel.removeText"
                  help="Text for the remove button"
                />
              </div>
              
              <div v-if="showField('fields')">
                <label class="block text-sm font-medium text-gray-700 mb-1">Group Fields</label>
                <div class="border rounded-md p-3 bg-gray-50 space-y-3">
                  <div v-for="(field, index) in configModel.fields" :key="index" class="border p-3 rounded bg-white">
                    <div class="flex justify-between items-center mb-2">
                      <h4 class="font-medium text-sm">Field {{ index + 1 }}</h4>
                      <button 
                        @click="configModel.fields.splice(index, 1)"
                        class="text-red-500 hover:text-red-700"
                        type="button"
                      >
                        <Icon name="material-symbols:delete-outline" class="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-2 mb-2">
                      <FormKit
                        type="select"
                        label="Field Type"
                        :options="[
                          { label: 'Text', value: 'text' },
                          { label: 'Number', value: 'number' },
                          { label: 'Email', value: 'email' },
                          { label: 'Select', value: 'select' },
                          { label: 'Date', value: 'date' }
                        ]"
                        v-model="field.type"
                      />
                      
                      <FormKit
                        type="text"
                        label="Field Name"
                        v-model="field.name"
                      />
                    </div>
                    
                    <div class="grid grid-cols-2 gap-2">
                      <FormKit
                        type="text"
                        label="Field Label"
                        v-model="field.label"
                      />
                      
                      <FormKit
                        type="text"
                        label="Placeholder"
                        v-model="field.placeholder"
                      />
                    </div>
                  </div>
                  
                  <button 
                    @click="addGroupField"
                    class="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                    type="button"
                  >
                    <Icon name="material-symbols:add-circle-outline" class="w-4 h-4 mr-1" />
                    Add Field
                  </button>
                </div>
              </div>
            </template>
            
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
            
            <!-- Mask Pattern -->
            <FormKit
              v-if="showField('mask')"
              type="text"
              label="Input Mask"
              name="mask"
              v-model="configModel.mask"
              help="Pattern for input formatting, e.g. '###-###-####' for phone numbers"
            />
            
            <!-- OTP Digits -->
            <FormKit
              v-if="showField('digits')"
              type="number"
              label="Number of Digits"
              name="digits"
              v-model="configModel.digits"
              help="Number of OTP digits (typically 4-8)"
              min="4"
              max="8"
            />
            
            <!-- Dropzone Settings -->
            <template v-if="component.type === 'dropzone'">
              <div class="grid grid-cols-2 gap-3">
                <FormKit
                  v-if="showField('maxSize')"
                  type="number"
                  label="Max File Size (bytes)"
                  name="maxSize"
                  v-model="configModel.maxSize"
                  help="Maximum file size in bytes (5MB = 5242880)"
                />
                
                <FormKit
                  v-if="showField('maxFiles')"
                  type="number"
                  label="Max Files"
                  name="maxFiles"
                  v-model="configModel.maxFiles"
                  help="Maximum number of files"
              min="1"
            />
              </div>
              
              <div class="flex items-center">
                <input 
                  type="checkbox" 
                  v-model="configModel.multiple" 
                  class="mr-2 h-4 w-4 rounded border-gray-300"
                >
                <span class="text-sm text-gray-700">Allow multiple files</span>
              </div>
            </template>
            

            
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
      return ['text', 'textarea', 'email', 'password', 'number', 'select', 'dynamic-list'].includes(componentType);
    case 'help':
      return !['heading', 'paragraph', 'divider'].includes(componentType);
    case 'value':
      return ['heading', 'paragraph'].includes(componentType);
    case 'level':
      return componentType === 'heading';
    case 'options':
      return ['select', 'radio', 'checkbox'].includes(componentType);
    case 'accept':
      return componentType === 'file' || componentType === 'dropzone';
    case 'mask':
      return componentType === 'mask';
    case 'digits':
      return componentType === 'otp';
    case 'maxSize':
    case 'maxFiles':
    case 'multiple':
      return componentType === 'dropzone';
    case 'id':
      return true; // Always show component ID in advanced tab
    case 'width':
      return true; // Always show width in basic tab
    case 'title':
      return componentType === 'info-display';
    case 'imageUrl':
    case 'altText':
    case 'caption':
    case 'showZoom':
    case 'showCaption':
    case 'maxWidth':
    case 'height':
      return componentType === 'image-preview';
    case 'minItems':
    case 'maxItems':
      return ['repeating-group', 'dynamic-list'].includes(componentType);
    case 'buttonText':
    case 'removeText':
      return componentType === 'repeating-group' || componentType === 'dynamic-list';
    case 'defaultItems':
      return componentType === 'dynamic-list';
    case 'fields':
      return componentType === 'info-display' || componentType === 'repeating-group';
    case 'layout':
    case 'showBorder':
      return componentType === 'info-display';
    case 'min':
    case 'max':
    case 'step':
      return componentType === 'range' || componentType === 'number';
    case 'buttonType':
    case 'variant':
    case 'size':
    case 'disabled':
    case 'onClick':
      return componentType === 'button';
    case 'value':
      return ['color', 'range', 'switch', 'hidden'].includes(componentType);
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

// Add a new field to repeating group component
const addGroupField = () => {
  if (!configModel.value.fields) {
    configModel.value.fields = [];
  }
  
  configModel.value.fields.push({
    type: 'text',
    name: `field_${configModel.value.fields.length + 1}`,
    label: `Field ${configModel.value.fields.length + 1}`,
    placeholder: 'Enter value'
  });
};

// Inside the <script setup> section
// Add width to fieldsToShow
const fieldsToShow = {
  // Basic input types
  text: ['label', 'name', 'placeholder', 'help', 'width'],
  textarea: ['label', 'name', 'placeholder', 'help', 'width'],
  number: ['label', 'name', 'placeholder', 'help', 'min', 'max', 'step', 'width'],
  email: ['label', 'name', 'placeholder', 'help', 'width'],
  password: ['label', 'name', 'placeholder', 'help', 'width'],
  url: ['label', 'name', 'placeholder', 'help', 'width'],
  tel: ['label', 'name', 'placeholder', 'help', 'width'],
  hidden: ['name', 'value', 'help', 'width'],
  
  // Selection types
  select: ['label', 'name', 'placeholder', 'help', 'options', 'width'],
  checkbox: ['label', 'name', 'help', 'options', 'width'],
  radio: ['label', 'name', 'help', 'options', 'width'],
  switch: ['label', 'name', 'help', 'value', 'width'],
  
  // Date and time
  date: ['label', 'name', 'placeholder', 'help', 'width'],
  time: ['label', 'name', 'placeholder', 'help', 'width'],
  'datetime-local': ['label', 'name', 'placeholder', 'help', 'width'],
  range: ['label', 'name', 'help', 'min', 'max', 'step', 'value', 'width'],
  color: ['label', 'name', 'help', 'value', 'width'],
  
  // Advanced
  file: ['label', 'name', 'help', 'accept', 'width'],
  otp: ['label', 'name', 'help', 'digits', 'width'],
  mask: ['label', 'name', 'placeholder', 'help', 'mask', 'width'],
  dropzone: ['label', 'name', 'help', 'accept', 'multiple', 'maxSize', 'maxFiles', 'width'],
  button: ['label', 'name', 'help', 'buttonType', 'variant', 'size', 'disabled', 'onClick', 'width'],
  'image-preview': ['label', 'name', 'help', 'imageUrl', 'altText', 'caption', 'showZoom', 'showCaption', 'maxWidth', 'height', 'width'],
  'repeating-group': ['label', 'name', 'help', 'minItems', 'maxItems', 'buttonText', 'removeText', 'fields', 'width'],
  'dynamic-list': ['label', 'name', 'help', 'placeholder', 'buttonText', 'minItems', 'maxItems', 'defaultItems', 'width'],
  
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
  const nonValidationComponents = ['heading', 'paragraph', 'divider', 'info-display', 'button'];
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