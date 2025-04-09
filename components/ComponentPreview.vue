<template>
  <div class="component-preview">
    <!-- Basic Input Types -->
    <FormKit 
      v-if="isInputType"
      :id="`preview-${component.id}`"
      :type="component.props.type"
      :name="component.props.name"
      :label="component.props.label"
      :help="component.props.help"
      :placeholder="component.props.placeholder"
      :validation="component.props.validation"
      :validation-visibility="isPreview ? 'live' : 'blur'"
      :disabled="isPreview"
      :options="component.props.options || undefined"
      :value="component.props.value || undefined"
      :accept="component.props.accept || undefined"
      :max="component.props.max || undefined"
      :preserve-events="isPreview"
      @input.capture.stop="isPreview ? $event.stopPropagation() : null"
      @click.capture.stop="isPreview ? $event.stopPropagation() : null"
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
        {{ component.props.value }}
      </component>
    </div>
    
    <!-- Paragraph -->
    <div v-else-if="component.type === 'paragraph'" class="py-2">
      <p class="text-gray-600">{{ component.props.value }}</p>
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

// Check if the component is a standard FormKit input type
const isInputType = computed(() => {
  const inputTypes = [
    'text', 'textarea', 'number', 'email', 'password',
    'date', 'time', 'datetime-local', 'url', 'tel',
    'select', 'checkbox', 'radio', 'file', 'range',
    'color', 'hidden', 'group', 'repeater'
  ];
  
  return inputTypes.includes(props.component.type);
});
</script>

<style scoped>
.component-preview {
  width: 100%;
}
</style> 