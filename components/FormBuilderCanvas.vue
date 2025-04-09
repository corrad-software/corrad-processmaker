<template>
  <div class="form-builder-canvas">
    <div v-if="formComponents.length === 0" class="flex flex-col items-center justify-center h-full py-16 text-gray-400">
      <Icon name="material-symbols:layers-outline" class="w-16 h-16 mb-4 text-gray-300" />
      <p class="text-base font-medium">Drag components here</p>
      <p class="text-xs mt-1">Or click a component from the sidebar</p>
    </div>
    
    <draggable
      v-else
      v-model="componentList"
      group="form-components"
      item-key="id"
      handle=".drag-handle"
      ghost-class="ghost"
      animation="300"
      @end="onDragEnd"
    >
      <template #item="{ element, index }">
        <div 
          class="form-component relative mb-3 border rounded-md overflow-hidden transition-all"
          :class="{ 
            'ring-2 ring-blue-400 bg-blue-50 border-transparent': selectedComponentId === element.id,
            'bg-white border-gray-200 hover:border-gray-300': selectedComponentId !== element.id
          }"
          @click.capture="selectComponent(element)"
        >
          <div class="component-actions absolute right-1.5 top-1.5 flex space-x-1 z-10">
            <button 
              class="p-1 text-gray-400 hover:text-gray-600 rounded"
              title="Drag to reorder"
            >
              <span class="drag-handle cursor-move">
                <Icon name="material-symbols:drag-indicator" class="w-4 h-4" />
              </span>
            </button>
            <button 
              class="p-1 text-gray-400 hover:text-red-500 rounded"
              title="Delete component"
              @click.stop="deleteComponent(element.id)"
            >
              <Icon name="material-symbols:delete-outline" class="w-4 h-4" />
            </button>
          </div>
          
          <div class="p-3">
            <component-preview 
              :component="element" 
              :is-preview="true"
            />
          </div>
        </div>
      </template>
    </draggable>
  </div>
</template>

<script setup>
import draggable from 'vuedraggable';
import { onMounted, watch } from 'vue';

const props = defineProps({
  formComponents: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['select-component', 'move-component', 'delete-component']);

const selectedComponentId = ref(null);

// Watch for changes in formComponents
watch(() => props.formComponents, (newComponents) => {
  // If the currently selected component is no longer in the list, deselect it
  if (selectedComponentId.value && 
      !newComponents.some(comp => comp.id === selectedComponentId.value)) {
    selectedComponentId.value = null;
  }
}, { deep: true });

// Create a reactive list with the form components
const componentList = computed({
  get: () => props.formComponents,
  set: (value) => {
    // Do nothing here to avoid reactivity loops - let onDragEnd handle the changes
  }
});

// Handle component selection
const selectComponent = (component) => {
  selectedComponentId.value = component.id;
  
  // Use a copy of the component to prevent reactivity issues
  const componentCopy = JSON.parse(JSON.stringify(component));
  emit('select-component', componentCopy);
};

// Handle component deletion
const deleteComponent = (id) => {
  if (selectedComponentId.value === id) {
    selectedComponentId.value = null;
  }
  emit('delete-component', id);
};

// Handle drag end event for reordering
const onDragEnd = (event) => {
  if (event.oldIndex !== event.newIndex) {
    emit('move-component', { 
      oldIndex: event.oldIndex, 
      newIndex: event.newIndex 
    });
  }
};
</script>

<style scoped>
.ghost {
  opacity: 0.5;
  background: #e0f2fe;
  border: 1px dashed #60a5fa;
}

.form-component {
  transition: all 0.2s ease;
}

.form-component:hover .component-actions {
  opacity: 1;
}

.component-actions {
  opacity: 0;
  transition: opacity 0.15s ease;
}

.form-component:hover {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
</style> 