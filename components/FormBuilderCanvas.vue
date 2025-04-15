<template>
  <div class="form-builder-canvas">
    <div v-if="formComponents.length === 0" class="flex flex-col items-center justify-center h-full py-16 text-gray-400">
      <Icon name="material-symbols:layers-outline" class="w-16 h-16 mb-4 text-gray-300" />
      <p class="text-base font-medium">Drag components here</p>
      <p class="text-xs mt-1">Or click a component from the sidebar</p>
    </div>
    
    <div v-else class="grid-container">
      <draggable
        v-model="componentList"
        group="form-components"
        item-key="id"
        handle=".drag-handle"
        ghost-class="ghost"
        animation="300"
        class="draggable-container"
        @end="onDragEnd"
      >
        <template #item="{ element, index }">
          <div 
            class="form-component relative border rounded-md overflow-hidden transition-all"
            :class="{ 
              'ring-2 ring-blue-400 bg-blue-50 border-transparent': selectedComponentId === element.id,
              'bg-white border-gray-200 hover:border-gray-300': selectedComponentId !== element.id
            }"
            :style="{
              gridColumn: element.props.gridColumn || 'span 12'
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
                class="p-1 text-gray-400 hover:text-gray-600 rounded"
                title="Resize component"
                @click.stop="toggleResizeMode(element)"
              >
                <Icon name="material-symbols:resize" class="w-4 h-4" />
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

            <!-- Resize handle - only shown when in resize mode -->
            <div 
              v-if="resizeMode && selectedComponentId === element.id"
              class="resize-handles"
            >
              <div 
                class="resize-handle resize-handle-right"
                @mousedown.stop.prevent="startResize($event, element)"
              ></div>
            </div>
          </div>
        </template>
      </draggable>
    </div>
  </div>
</template>

<script setup>
import draggable from 'vuedraggable';
import { onMounted, watch, onUnmounted, nextTick } from 'vue';

const props = defineProps({
  formComponents: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['select-component', 'move-component', 'delete-component', 'update-component', 'optimize-layout']);

const selectedComponentId = ref(null);
const resizeMode = ref(false);
const resizing = ref(false);
const initialWidth = ref(0);
const initialX = ref(0);

// Watch for changes in formComponents
watch(() => props.formComponents, (newComponents) => {
  // If the currently selected component is no longer in the list, deselect it
  if (selectedComponentId.value && 
      !newComponents.some(comp => comp.id === selectedComponentId.value)) {
    selectedComponentId.value = null;
    resizeMode.value = false;
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
  if (!component || !component.id) return;
  
  selectedComponentId.value = component.id;
  
  // Use a copy of the component to prevent reactivity issues
  // But make sure to keep the original ID
  const componentCopy = JSON.parse(JSON.stringify(component));
  componentCopy.id = component.id; // Ensure ID preservation
  
  emit('select-component', componentCopy);
};

// Handle component deletion
const deleteComponent = (id) => {
  if (selectedComponentId.value === id) {
    selectedComponentId.value = null;
    resizeMode.value = false;
  }
  emit('delete-component', id);
};

// Toggle resize mode
const toggleResizeMode = (component) => {
  resizeMode.value = !resizeMode.value;
  selectedComponentId.value = component.id;
};

// Start resizing
const startResize = (event, component) => {
  resizing.value = true;
  selectedComponentId.value = component.id;
  
  // Store initial values
  initialWidth.value = parseInt(component.props.width) || 100;
  initialX.value = event.clientX;
  
  // Add event listeners
  document.addEventListener('mousemove', handleResize);
  document.addEventListener('mouseup', stopResize);
};

// Handle resize event
const handleResize = (event) => {
  if (!resizing.value || !selectedComponentId.value) return;
  
  // Calculate new width
  const component = props.formComponents.find(c => c.id === selectedComponentId.value);
  if (!component) return;
  
  // Calculate delta
  const deltaX = event.clientX - initialX.value;
  
  // Convert to percentage of container width
  const container = document.querySelector('.grid-container');
  if (!container) return;
  
  const containerWidth = container.offsetWidth;
  const deltaPercentage = (deltaX / containerWidth) * 100;
  
  // Calculate new width (with constraints)
  let newWidth = initialWidth.value + deltaPercentage;
  
  // Constrain to reasonable values
  newWidth = Math.max(25, Math.min(100, newWidth)); // Min 25%, max 100%
  
  // Get the current column span
  const currentSpanMatch = component.props.gridColumn?.match(/span\s+(\d+)/) || [];
  const currentSpan = parseInt(currentSpanMatch[1]) || 12;
  
  // Define standard widths for snap points (25%, 33%, 50%, 66%, 75%, 100%)
  const standardWidths = [25, 33, 50, 66, 75, 100];
  
  // Snap to nearest standard width if within 5%
  for (const std of standardWidths) {
    if (Math.abs(newWidth - std) < 5) {
      newWidth = std;
      break;
    }
  }
  
  // Convert precise percentages to exact grid column spans
  // This ensures the visual appearance matches the percentage
  let gridColumns;
  switch (newWidth) {
    case 25: gridColumns = 3; break;  // 3/12 = 25%
    case 33: gridColumns = 4; break;  // 4/12 = 33.33%
    case 50: gridColumns = 6; break;  // 6/12 = 50%
    case 66: gridColumns = 8; break;  // 8/12 = 66.67%
    case 75: gridColumns = 9; break;  // 9/12 = 75%
    case 100: gridColumns = 12; break; // 12/12 = 100%
    default: gridColumns = Math.round((newWidth / 100) * 12);
  }
  
  // Only update if the span actually changed to avoid unnecessary rerenders
  if (gridColumns !== currentSpan) {
    // Update component's width and grid column span
    const updatedComponent = {
      ...component,
      props: {
        ...component.props,
        width: `${newWidth}%`,
        gridColumn: `span ${gridColumns}`
      }
    };
    
    // Signal component update
    emit('update-component', updatedComponent);
    
    // Signal that a resize has occurred that might require layout optimization
    // Using nextTick to ensure the update is processed first
    nextTick(() => {
      emit('optimize-layout');
    });
  }
};

// Stop resizing
const stopResize = () => {
  resizing.value = false;
  
  // Remove event listeners
  document.removeEventListener('mousemove', handleResize);
  document.removeEventListener('mouseup', stopResize);
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

// Clean up event listeners when component is unmounted
onUnmounted(() => {
  document.removeEventListener('mousemove', handleResize);
  document.removeEventListener('mouseup', stopResize);
});
</script>

<style scoped>
.grid-container {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-auto-flow: row dense; /* This enables automatic filling of gaps */
  column-gap: 16px;
  row-gap: 16px;
  width: 100%;
  padding: 0;
  box-sizing: border-box;
}

.draggable-container {
  display: contents; /* This makes draggable container not interfere with the grid */
}

.ghost {
  opacity: 0.5;
  background: #e0f2fe;
  border: 1px dashed #60a5fa;
  width: 100% !important;
  grid-column: span 12 !important;
}

.form-component {
  transition: all 0.2s ease;
  grid-column: span 12; /* Default to full width */
  width: 100% !important; /* Force the width within the grid cell */
  margin-bottom: 16px;
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

.resize-handles {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  pointer-events: none;
}

.resize-handle {
  position: absolute;
  pointer-events: auto;
  cursor: col-resize;
}

.resize-handle-right {
  top: 0;
  right: 0;
  width: 8px;
  height: 100%;
  background-color: rgba(37, 99, 235, 0.2);
  position: absolute;
  cursor: col-resize;
}

.resize-handle-right:hover,
.resize-handle-right:active {
  background-color: rgba(37, 99, 235, 0.4);
  width: 8px;
}
</style> 