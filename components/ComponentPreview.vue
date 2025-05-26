<template>
  <div 
    class="component-preview form-field" 
    :style="componentStyle"
    :data-name="component.props.name"
    :data-type="component.type"
  >
    <!-- Basic Input Types (including radio and checkbox) -->
    <FormKit 
      v-if="isInputType"
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
    
    <!-- Unknown Component Type Fallback -->
    <div v-else class="p-4 border border-dashed border-gray-300 rounded">
      <div class="text-gray-500">Unknown component type: {{ component.type }}</div>
    </div>
  </div>
</template>

<script setup>
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

// Check if the component is a standard FormKit input type (excluding specialized components)
const isStandardInputType = computed(() => {
  const standardInputTypes = [
    'text', 'textarea', 'number', 'email', 'password',
    'date', 'time', 'datetime-local', 'url', 'tel',
    'select', 'radio', 'file', 'range', 'color', 'hidden'
  ];
  
  return standardInputTypes.includes(props.component.type);
});

// Check if the component is any FormKit input type (including checkbox)
const isInputType = computed(() => {
  const inputTypes = [
    'text', 'textarea', 'number', 'email', 'password',
    'date', 'time', 'datetime-local', 'url', 'tel',
    'select', 'checkbox', 'radio', 'file', 'range',
    'color', 'hidden'
  ];
  
  return inputTypes.includes(props.component.type);
});

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
:deep(.canvas-component .formkit-disabled) {
  opacity: 1 !important;
}

:deep(.canvas-component .formkit-input) {
  opacity: 1 !important;
  background-color: white !important;
  border-color: #d1d5db !important;
  color: #111827 !important;
  cursor: default !important;
}

:deep(.canvas-component .formkit-inner) {
  background-color: #ffffff !important;
  border-color: #d1d5db !important;
}

:deep(.canvas-component .formkit-label) {
  opacity: 1 !important;
  color: #374151 !important;
  font-weight: 500 !important;
}

:deep(.canvas-component .formkit-help) {
  opacity: 1 !important;
  color: #6b7280 !important;
}

:deep(.canvas-component[data-type="checkbox"] .formkit-input), 
:deep(.canvas-component[data-type="radio"] .formkit-input) {
  opacity: 1 !important;
  border-color: #9ca3af !important;
}

:deep(.canvas-component[data-type="select"] .formkit-input) {
  appearance: none !important;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e") !important;
  background-position: right 0.5rem center !important;
  background-repeat: no-repeat !important;
  background-size: 1.5em 1.5em !important;
}
</style> 