<template>
  <div 
    class="component-preview form-field" 
    :style="componentStyle"
    :data-name="component.props.name"
    :data-type="component.type"
  >
    <!-- Hidden Field Special Display -->
    <div v-if="component.type === 'hidden' && isPreview" class="py-2">
      <div class="hidden-field-preview border-2 border-dashed border-gray-300 bg-gray-50 rounded-lg p-3">
        <div class="flex items-center space-x-2">
          <Icon name="heroicons:eye-slash" class="w-4 h-4 text-gray-400" />
          <span class="text-sm font-medium text-gray-600">Hidden Field</span>
        </div>
        <div class="mt-1">
          <div class="text-xs text-gray-500">
            <strong>Name:</strong> {{ component.props.name || 'unnamed' }}
          </div>
          <div class="text-xs text-gray-500">
            <strong>Value:</strong> {{ component.props.value || '(empty)' }}
          </div>
        </div>
        <div v-if="component.props.help" class="mt-1 text-xs text-gray-400">
          {{ component.props.help }}
        </div>
      </div>
    </div>

    <!-- Basic Input Types (including radio and checkbox) -->
    <FormKit 
      v-else-if="isInputType"
      :id="`preview-${component.id}`"
      :type="component.type"
      :name="component.props.name"
      :label="component.props.label"
      :help="component.props.help"
      :placeholder="component.props.placeholder"
      :validation="component.props.validation"
      :validation-visibility="isPreview ? 'live' : 'blur'"
      :readonly="isPreview"
      :options="component.props.options || undefined"
      :value="component.props.value || undefined"
      :accept="component.props.accept || undefined"
      :max="component.props.max || undefined"
      :mask="component.props.mask || undefined"
      :digits="component.props.digits || undefined"
      :multiple="component.props.multiple || undefined"
      :maxSize="component.props.maxSize || undefined"
      :maxFiles="component.props.maxFiles || undefined"
      :preserve-events="isPreview"
      @input.capture.stop="isPreview ? $event.stopPropagation() : null"
      @click.capture.stop="isPreview ? $event.stopPropagation() : null"
      :classes="component.type === 'checkbox' ? { 
        wrapper: 'mb-1',
        options: 'space-y-0.5'
      } : {}"
      :class="{ 'canvas-component': isPreview }"
    />
    

    
    <!-- Heading -->
    <div v-else-if="component.type === 'heading'" class="py-2">
      <component 
        :is="`h${component.props.level || 2}`" 
        class="font-semibold"
        :class="{
          'text-2xl': component.props.level === 2,
          'text-xl': component.props.level === 3,
          'text-lg': component.props.level === 4
        }"
      >
        {{ component.props.value || 'Heading Text' }}
      </component>
    </div>
    
    <!-- Paragraph -->
    <div v-else-if="component.type === 'paragraph'" class="py-2">
      <p class="text-gray-600">{{ component.props.value || 'Paragraph text goes here' }}</p>
    </div>
    
    <!-- Information Display -->
    <div v-else-if="component.type === 'info-display'" class="py-2">
      <div 
        class="info-display-container rounded"
        :style="{
          backgroundColor: component.props.backgroundColor || '#f9fafb',
          border: component.props.showBorder ? '1px solid #e5e7eb' : 'none'
        }"
      >
        <!-- Title -->
        <div v-if="component.props.title" class="p-3 border-b border-gray-200 bg-white">
          <h4 class="text-base font-medium text-gray-800">{{ component.props.title }}</h4>
        </div>
        
        <!-- Fields Display -->
        <div class="p-4">
          <div 
            v-if="component.props.layout === 'grid'"
            class="grid grid-cols-2 gap-4"
          >
            <div v-for="(field, index) in component.props.fields" :key="index" class="field-item">
              <dt class="text-sm font-medium text-gray-600">{{ field.label }}</dt>
              <dd class="text-sm text-gray-900 mt-1">{{ field.value }}</dd>
            </div>
          </div>
          
          <div 
            v-else-if="component.props.layout === 'horizontal'"
            class="space-y-2"
          >
            <div v-for="(field, index) in component.props.fields" :key="index" class="flex justify-between items-center">
              <dt class="text-sm font-medium text-gray-600">{{ field.label }}:</dt>
              <dd class="text-sm text-gray-900">{{ field.value }}</dd>
            </div>
          </div>
          
          <div v-else class="space-y-3">
            <div v-for="(field, index) in component.props.fields" :key="index" class="field-item">
              <dt class="text-sm font-medium text-gray-600">{{ field.label }}</dt>
              <dd class="text-sm text-gray-900 mt-1">{{ field.value }}</dd>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Divider -->
    <div v-else-if="component.type === 'divider'" class="py-4">
      <hr class="border-gray-200" />
    </div>
    
    <!-- Image Preview Component -->
    <div v-else-if="component.type === 'image-preview'" class="py-2">
      <div class="image-preview-container" :class="{ 'has-caption': component.props.showCaption && component.props.caption }">
        <label v-if="component.props.label" class="block text-sm font-medium text-gray-700 mb-1">
          {{ component.props.label }}
        </label>
        
        <div 
          class="image-container relative"
          :class="{ 'cursor-zoom-in': component.props.showZoom }"
          @click="handleImageClick"
        >
          <img 
            :src="component.props.imageUrl" 
            :alt="component.props.altText || 'Image preview'" 
            class="max-w-full rounded"
            :style="{
              maxWidth: component.props.maxWidth || '100%',
              height: component.props.height || 'auto',
            }"
          />
          <div v-if="component.props.showZoom" class="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white p-1 rounded">
            <Icon name="material-symbols:zoom-in" class="w-4 h-4" />
          </div>
        </div>
        
        <div v-if="component.props.showCaption && component.props.caption" class="mt-1 text-sm text-gray-500 text-center">
          {{ component.props.caption }}
        </div>
        
        <div v-if="component.props.help" class="mt-1 text-xs text-gray-500">
          {{ component.props.help }}
        </div>
      </div>
    </div>
    
    <!-- Repeating Group Component -->
    <div v-else-if="component.type === 'repeating-group'" class="py-2">
      <fieldset class="border rounded-md p-4">
        <legend class="text-sm font-medium px-2">{{ component.props.label || 'Group' }}</legend>
        
        <div v-if="component.props.help" class="mb-3 text-xs text-gray-500">
          {{ component.props.help }}
        </div>
        
        <!-- Default group preview (in edit mode) -->
        <div v-if="isPreview" class="repeating-groups space-y-4">
          <div class="group-item border border-gray-200 rounded-md p-3 bg-gray-50">
            <div class="flex justify-between items-center mb-3">
              <h4 class="text-sm font-medium text-gray-700">Item 1</h4>
              <button type="button" class="text-red-500 hover:text-red-700 text-sm">
                {{ component.props.removeText || 'Remove' }}
              </button>
            </div>
            
            <div class="space-y-3">
              <template v-for="(field, fieldIndex) in component.props.fields" :key="fieldIndex">
                <FormKit 
                  :type="field.type" 
                  :label="field.label"
                  :placeholder="field.placeholder"
                  :name="`${field.name}_1`"
                  :options="field.options"
                  disabled
                />
              </template>
            </div>
          </div>
          
          <button 
            type="button"
            class="inline-flex items-center px-3 py-1.5 border border-blue-600 text-blue-600 bg-white hover:bg-blue-50 rounded text-sm"
          >
            <Icon name="material-symbols:add-circle-outline" class="w-4 h-4 mr-1" />
            {{ component.props.buttonText || 'Add Item' }}
          </button>
        </div>
        
        <!-- Functional groups (in form view) -->
        <div v-else class="repeating-groups space-y-4">
          <div 
            v-for="(group, groupIndex) in (previewFormData[component.props.name] || [])" 
            :key="groupIndex"
            class="group-item border border-gray-200 rounded-md p-3 bg-gray-50"
          >
            <div class="flex justify-between items-center mb-3">
              <h4 class="text-sm font-medium text-gray-700">Item {{ groupIndex + 1 }}</h4>
              <button 
                v-if="(previewFormData[component.props.name]?.length || 0) > (component.props.minItems || 1)"
                type="button" 
                class="text-red-500 hover:text-red-700 text-sm"
                @click="removeGroupItem(groupIndex)"
              >
                {{ component.props.removeText || 'Remove' }}
              </button>
            </div>
            
            <div class="space-y-3">
              <template v-for="(field, fieldIndex) in component.props.fields" :key="fieldIndex">
                <FormKit 
                  :type="field.type" 
                  :label="field.label"
                  :placeholder="field.placeholder"
                  :name="`${component.props.name}.${groupIndex}.${field.name}`"
                  :options="field.options"
                  v-model="group[field.name]"
                />
              </template>
            </div>
          </div>
          
          <button 
            v-if="(previewFormData[component.props.name]?.length || 0) < (component.props.maxItems || 10)"
            type="button"
            class="inline-flex items-center px-3 py-1.5 border border-blue-600 text-blue-600 bg-white hover:bg-blue-50 rounded text-sm"
            @click="addGroupItem"
          >
            <Icon name="material-symbols:add-circle-outline" class="w-4 h-4 mr-1" />
            {{ component.props.buttonText || 'Add Item' }}
          </button>
        </div>
      </fieldset>
    </div>
    
    <!-- Dynamic List Component -->
    <div v-else-if="component.type === 'dynamic-list'" class="py-2">
      <div class="dynamic-list-container">
        <label v-if="component.props.label" class="block text-sm font-medium text-gray-700 mb-1">
          {{ component.props.label }}
        </label>
        
        <div v-if="component.props.help" class="mb-3 text-xs text-gray-500">
          {{ component.props.help }}
        </div>
        
        <div class="space-y-2">
          <div v-if="isPreview" class="list-items space-y-2">
            <div v-for="(item, index) in component.props.defaultItems" :key="index" class="flex items-center">
              <input 
                type="text" 
                :value="item"
                :placeholder="component.props.placeholder"
                disabled
                class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-700 disabled:bg-gray-50"
              />
              <button type="button" class="ml-2 text-red-500 hover:text-red-700">
                <Icon name="material-symbols:delete-outline" class="w-5 h-5" />
              </button>
            </div>
            
            <!-- Add button for preview -->
            <button 
              type="button"
              class="inline-flex items-center px-3 py-1.5 border border-blue-600 text-blue-600 bg-white hover:bg-blue-50 rounded text-sm"
            >
              <Icon name="material-symbols:add-circle-outline" class="w-4 h-4 mr-1" />
              {{ component.props.buttonText || 'Add Item' }}
            </button>
          </div>
          
          <div v-else class="list-items space-y-2">
            <div 
              v-for="(item, index) in (previewFormData[component.props.name] || [])" 
              :key="index" 
              class="flex items-center"
            >
              <input 
                type="text" 
                v-model="previewFormData[component.props.name][index]"
                :placeholder="component.props.placeholder"
                class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-700"
              />
              <button 
                v-if="(previewFormData[component.props.name]?.length || 0) > (component.props.minItems || 0)"
                type="button" 
                class="ml-2 text-red-500 hover:text-red-700"
                @click="removeListItem(index)"
              >
                <Icon name="material-symbols:delete-outline" class="w-5 h-5" />
              </button>
            </div>
            
            <button 
              v-if="(previewFormData[component.props.name]?.length || 0) < (component.props.maxItems || 20)"
              type="button"
              class="inline-flex items-center px-3 py-1.5 border border-blue-600 text-blue-600 bg-white hover:bg-blue-50 rounded text-sm"
              @click="addListItem"
            >
              <Icon name="material-symbols:add-circle-outline" class="w-4 h-4 mr-1" />
              {{ component.props.buttonText || 'Add Item' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Button Component -->
    <div v-else-if="component.type === 'button'" class="py-2">
      <label v-if="component.props.label" class="block text-sm font-medium text-gray-700 mb-2">
        {{ component.props.label }}
      </label>
      
      <RsButton
        :type="component.props.buttonType || 'button'"
        :variant="component.props.variant || 'primary'"
        :size="component.props.size || 'md'"
        :disabled="component.props.disabled || false"
        @click="handleButtonClick"
        class="button-component"
      >
        {{ component.props.label || 'Button' }}
      </RsButton>
      
      <div v-if="component.props.help" class="mt-1 text-xs text-gray-500">
        {{ component.props.help }}
      </div>
    </div>



    <!-- Unknown Component Type Fallback -->
    <div v-else class="p-4 border border-dashed border-gray-300 rounded">
      <div class="text-gray-500">Unknown component type: {{ component.type }}</div>
    </div>
  </div>
</template>

<script setup>
import { useNuxtApp } from '#app';
import { useFormBuilderStore } from '~/stores/formBuilder';

const props = defineProps({
  component: {
    type: Object,
    required: true
  },
  isPreview: {
    type: Boolean,
    default: false
  }
});

// Get access to the form builder store
const formStore = useFormBuilderStore();
const previewFormData = computed(() => formStore.previewFormData || {});

// Repeating group and dynamic list functionality
const addGroupItem = () => {
  if (props.isPreview) return;
  
  const groupName = props.component.props.name;
  if (!groupName) return;
  
  // Get current groups or initialize empty array
  const currentGroups = formStore.previewFormData[groupName] || [];
  
  // Create a new empty group
  const newGroup = {};
  
  // Add fields from configuration
  if (props.component.props.fields) {
    props.component.props.fields.forEach(field => {
      newGroup[field.name] = '';
    });
  }
  
  // Add the new group to the list
  currentGroups.push(newGroup);
  
  // Update the form data
  const updatedData = { ...formStore.previewFormData, [groupName]: currentGroups };
  formStore.updatePreviewFormData(updatedData);
};

const removeGroupItem = (index) => {
  if (props.isPreview) return;
  
  const groupName = props.component.props.name;
  if (!groupName) return;
  
  // Get current groups
  const currentGroups = [...(formStore.previewFormData[groupName] || [])];
  
  // Remove the group at the specified index
  currentGroups.splice(index, 1);
  
  // Update the form data
  const updatedData = { ...formStore.previewFormData, [groupName]: currentGroups };
  formStore.updatePreviewFormData(updatedData);
};

const addListItem = () => {
  if (props.isPreview) return;
  
  const listName = props.component.props.name;
  if (!listName) return;
  
  // Get current items or initialize empty array
  const currentItems = [...(formStore.previewFormData[listName] || [])];
  
  // Add an empty item
  currentItems.push('');
  
  // Update the form data
  const updatedData = { ...formStore.previewFormData, [listName]: currentItems };
  formStore.updatePreviewFormData(updatedData);
};

const removeListItem = (index) => {
  if (props.isPreview) return;
  
  const listName = props.component.props.name;
  if (!listName) return;
  
  // Get current items
  const currentItems = [...(formStore.previewFormData[listName] || [])];
  
  // Remove the item at the specified index
  currentItems.splice(index, 1);
  
  // Update the form data
  const updatedData = { ...formStore.previewFormData, [listName]: currentItems };
  formStore.updatePreviewFormData(updatedData);
};

// Handle button click
const handleButtonClick = () => {
  if (props.isPreview) return;
  
  // Execute custom onClick code if provided
  if (props.component.props.onClick) {
    try {
      // Create a safe execution context
      const context = {
        formData: formStore.previewFormData,
        componentName: props.component.props.name,
        buttonLabel: props.component.props.label
      };
      
      // Execute the custom code
      const func = new Function('context', props.component.props.onClick);
      func(context);
    } catch (error) {
      console.error('Error executing button onClick:', error);
    }
  }
  
  // Default behavior - log the button click
  console.log(`Button clicked: ${props.component.props.label || 'Unnamed Button'}`);
};



// Check if the component is a standard FormKit input type (excluding specialized components)
const isStandardInputType = computed(() => {
  const standardInputTypes = [
    'text', 'textarea', 'number', 'email', 'password',
    'date', 'time', 'datetime-local', 'url', 'tel',
    'select', 'radio', 'file', 'range', 'color', 'hidden'
  ];
  
  return standardInputTypes.includes(props.component.type);
});

// Check if the component is any FormKit input type (including checkbox and custom types)
const isInputType = computed(() => {
  const inputTypes = [
    'text', 'textarea', 'number', 'email', 'password',
    'date', 'time', 'datetime-local', 'url', 'tel',
    'select', 'checkbox', 'radio', 'file', 'range',
    'color', 'hidden', 'mask', 'otp', 'dropzone', 'switch'
  ];
  
  return inputTypes.includes(props.component.type);
});

// Handle image click for image preview component
const handleImageClick = (event) => {
  // Only do something if zoom is enabled
  if (!props.component.props.showZoom) return;
  
  // Get the image URL
  const imageUrl = props.component.props.imageUrl;
  if (!imageUrl) return;
  
  // Create a lightbox effect to view the image
  const lightbox = document.createElement('div');
  lightbox.style.position = 'fixed';
  lightbox.style.top = '0';
  lightbox.style.left = '0';
  lightbox.style.width = '100%';
  lightbox.style.height = '100%';
  lightbox.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
  lightbox.style.display = 'flex';
  lightbox.style.alignItems = 'center';
  lightbox.style.justifyContent = 'center';
  lightbox.style.zIndex = '1000';
  lightbox.style.cursor = 'zoom-out';
  
  // Create the image element
  const img = document.createElement('img');
  img.src = imageUrl;
  img.style.maxWidth = '90%';
  img.style.maxHeight = '90%';
  img.style.objectFit = 'contain';
  
  // Add close functionality
  lightbox.onclick = () => {
    document.body.removeChild(lightbox);
  };
  
  // Prevent image click from closing the lightbox
  img.onclick = (e) => {
    e.stopPropagation();
  };
  
  // Add to DOM
  lightbox.appendChild(img);
  document.body.appendChild(lightbox);
};

// Compute style based on grid properties
const componentStyle = computed(() => {
  // Only apply grid styles in the non-preview mode (actual form)
  if (props.isPreview) {
    return {}; // Styling is handled by parent in canvas mode
  }
  
  // Apply grid column in preview mode
  const gridColumn = props.component.props.gridColumn || 'span 12';
  
  return {
    gridColumn: gridColumn,
    width: '100%', // Always use 100% within the grid cell
    boxSizing: 'border-box'
  };
});
</script>

<style scoped>
.component-preview {
  width: 100%;
}

:deep(.formkit-wrapper) {
  margin-bottom: 0.5rem !important;
}

:deep(.formkit-options) {
  gap: 0.25rem !important;
}

/* Improve visibility of disabled inputs in the canvas view */
:deep(.canvas-component.formkit-disabled),
:deep(.canvas-component.formkit-disabled input),
:deep(.canvas-component.formkit-disabled select),
:deep(.canvas-component.formkit-disabled textarea) {
  opacity: 0.8 !important;
  pointer-events: none;
}

/* Image Preview Component */
.image-preview-container {
  display: flex;
  flex-direction: column;
}

.image-container {
  display: flex;
  justify-content: center;
  border-radius: 0.375rem;
  overflow: hidden;
  max-width: 100%;
}

.image-container img {
  display: block;
  border-radius: 0.375rem;
  max-width: 100%;
}

.has-caption {
  padding-bottom: 0.5rem;
}

/* Repeating Group Component */
.repeating-groups {
  width: 100%;
}

.group-item {
  transition: all 0.2s ease-in-out;
}

.group-item:hover {
  border-color: #93c5fd;
}

/* Dynamic List Component */
.dynamic-list-container {
  width: 100%;
}

.list-items {
  width: 100%;
}
</style> 