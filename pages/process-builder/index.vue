<script setup>
import { ref, onMounted, computed, shallowRef, onUnmounted } from 'vue';
import { useProcessBuilderStore } from '~/stores/processBuilder';
import { useVariableStore } from '~/stores/variableStore';
import { useRouter } from 'vue-router';
import ProcessFlowCanvas from '~/components/process-flow/ProcessFlowCanvas.vue';
import ProcessBuilderComponents from '~/components/process-flow/ProcessBuilderComponents.vue';
import FormSelector from '~/components/process-flow/FormSelector.vue';
import GatewayConditionManager from '~/components/process-flow/GatewayConditionManager.vue';
import VariableManager from '~/components/process-flow/VariableManager.vue';
import { onBeforeRouteLeave } from 'vue-router';

// Define page meta
definePageMeta({
  title: "Process Builder",
  description: "Create business processes with drag and drop",
  layout: "empty",
  middleware: ["auth"],
  requiresAuth: true,
});

// Initialize the store and router
const processStore = useProcessBuilderStore();
const router = useRouter();
const variableStore = useVariableStore();

// Track selected node local state (syncs with store)
// Using shallowRef to avoid making Vue components reactive
const selectedNode = shallowRef(null);

// Track if we're creating a new process
const isCreatingProcess = ref(false);
const newProcessName = ref('');
const newProcessDescription = ref('');

// Track selected node data
const selectedNodeData = ref(null);

// Track drag data
const draggedComponent = ref(null);

// Add a variable to track selected edge
const selectedEdgeData = ref(null);

// Add variables for navigation handling
const showUnsavedChangesModal = ref(false);
const pendingNavigation = ref(null);
const navigationTarget = ref(null);
const navigationConfirmed = ref(false);

// Component definitions
const components = [
  {
    type: 'start',
    label: 'Start',
    icon: 'play_circle_filled',
    iconColor: 'text-green-500',
    data: { description: 'Process starts here' }
  },
  {
    type: 'task',
    label: 'Task',
    icon: 'assignment',
    iconColor: 'text-blue-500',
    data: { description: 'Task node', assignee: '' }
  },
  {
    type: 'form',
    label: 'Form',
    icon: 'description',
    iconColor: 'text-purple-500',
    data: { description: 'Form submission', formName: '' }
  },
  {
    type: 'gateway',
    label: 'Gateway',
    icon: 'call_split',
    iconColor: 'text-orange-500',
    data: { description: 'Decision point', conditions: [] }
  },
  {
    type: 'script',
    label: 'Script',
    icon: 'code',
    iconColor: 'text-gray-500',
    data: { description: 'Script execution', language: 'JavaScript' }
  },
  {
    type: 'end',
    label: 'End',
    icon: 'stop_circle',
    iconColor: 'text-red-500',
    data: { description: 'Process completes here' }
  }
];

// Computed to check if we have a current process
const hasCurrentProcess = computed(() => {
  return !!processStore.currentProcess;
});

// Computed properties for node data
const nodeLabel = computed({
  get: () => selectedNodeData.value?.data?.label || '',
  set: (value) => {
    if (selectedNodeData.value) {
      selectedNodeData.value.data.label = value;
      updateNodeInStore();
    }
  }
});

const nodeDescription = computed({
  get: () => selectedNodeData.value?.data?.description || '',
  set: (value) => {
    if (selectedNodeData.value) {
      selectedNodeData.value.data.description = value;
      updateNodeInStore();
    }
  }
});

const nodeAssignee = computed({
  get: () => selectedNodeData.value?.data?.assignee || '',
  set: (value) => {
    if (selectedNodeData.value) {
      selectedNodeData.value.data.assignee = value;
      updateNodeInStore();
    }
  }
});

const nodeFormName = computed({
  get: () => selectedNodeData.value?.data?.formName || '',
  set: (value) => {
    if (selectedNodeData.value) {
      selectedNodeData.value.data.formName = value;
      updateNodeInStore();
    }
  }
});

const nodeLanguage = computed({
  get: () => selectedNodeData.value?.data?.language || 'JavaScript',
  set: (value) => {
    if (selectedNodeData.value) {
      selectedNodeData.value.data.language = value;
      updateNodeInStore();
    }
  }
});

// Add a computed property for gateway conditions
const nodeConditions = computed({
  get: () => selectedNodeData.value?.data?.conditions || [],
  set: (value) => {
    if (selectedNodeData.value) {
      selectedNodeData.value.data.conditions = value;
      updateNodeInStore();
    }
  }
});

// Add a computed property for gateway default path
const nodeDefaultPath = computed({
  get: () => selectedNodeData.value?.data?.defaultPath || 'Default',
  set: (value) => {
    if (selectedNodeData.value) {
      selectedNodeData.value.data.defaultPath = value;
      updateNodeInStore();
    }
  }
});

// Computed for gateway available variables
const gatewayAvailableVariables = computed(() => {
  const processVars = variableStore.getAllVariables.process.map(v => ({
    name: v.name || 'unnamed',
    label: v?.description
      ? `${v.description} (${v.name || 'unnamed'}, process)`
      : `${v.name || 'unnamed'} (process)` ,
    type: v.type || 'string',
    scope: 'process'
  }));
  const globalVars = variableStore.getAllVariables.global.map(v => ({
    name: v.name || 'unnamed',
    label: v?.description
      ? `${v.description} (${v.name || 'unnamed'}, global)`
      : `${v.name || 'unnamed'} (global)` ,
    type: v.type || 'string',
    scope: 'global'
  }));
  const allVars = [...processVars, ...globalVars];
  console.log('Gateway available variables:', allVars);
  return allVars;
});

// Handle node selection
const onNodeSelected = (node) => {
  selectedNodeData.value = JSON.parse(JSON.stringify(node));
  selectedNode.value = node;
  selectedEdgeData.value = null;
  processStore.selectNode(node.id);
};

// Handle edge selection
const onEdgeSelected = (edge) => {
  selectedEdgeData.value = edge;
  selectedNode.value = null;
  selectedNodeData.value = null;
  processStore.selectEdge(edge.id);
};

// Update edge label
const updateEdgeLabel = (value) => {
  if (selectedEdgeData.value) {
    processStore.updateEdge(selectedEdgeData.value.id, { label: value });
    selectedEdgeData.value.label = value;
  }
};

// Update the pane click handler to clear edge selection too
const onPaneClick = () => {
  selectedNode.value = null;
  selectedNodeData.value = null;
  selectedEdgeData.value = null;
  processStore.clearSelection();
};

// Update node in store
const updateNodeInStore = () => {
  if (selectedNodeData.value) {
    // Make sure we're passing the nodeId and updates correctly
    processStore.updateNode(selectedNodeData.value.id, {
      label: selectedNodeData.value.label,
      data: selectedNodeData.value.data
    });
  }
};

// Handle condition update
const handleConditionUpdate = (conditions) => {
  if (selectedNodeData.value && selectedNodeData.value.type === 'gateway') {
    selectedNodeData.value.data.conditions = conditions;
    updateNodeInStore();
  }
};

// Handle updates from the canvas when nodes change
const onNodesChange = (changes, currentNodes) => {
  if (!changes || !currentNodes) return;
  
  // Handle node removals
  const removedNodes = changes
    .filter(change => change.type === 'remove')
    .map(change => change.id);
    
  if (removedNodes.length > 0) {
    removedNodes.forEach(nodeId => {
      processStore.deleteNode(nodeId);
    });
    
    // Clear selection if the selected node was deleted
    if (selectedNodeData.value && removedNodes.includes(selectedNodeData.value.id)) {
      selectedNodeData.value = null;
    }
  }
  
  // Handle position changes
  const positionChanges = {};
  changes
    .filter(change => change.type === 'position' && change.position)
    .forEach(change => {
      positionChanges[change.id] = change.position;
    });
    
  if (Object.keys(positionChanges).length > 0) {
    processStore.updateNodePositions(positionChanges);
  }
  
  // Update node selection if needed
  if (selectedNodeData.value) {
    const updatedNode = currentNodes.find(node => node.id === selectedNodeData.value.id);
    if (updatedNode) {
      selectedNodeData.value = { ...updatedNode };
    }
  }
};

// Handle updates from the canvas when edges change
const onEdgesChange = (changes, currentEdges) => {
  if (!changes || !currentEdges) return;
  
  // Handle edge removals
  const removedEdges = changes
    .filter(change => change.type === 'remove')
    .map(change => change.id);
    
  if (removedEdges.length > 0) {
    removedEdges.forEach(edgeId => {
      processStore.deleteEdge(edgeId);
    });
    
    // Clear selection if the selected edge was deleted
    if (selectedEdgeData.value && removedEdges.includes(selectedEdgeData.value.id)) {
      selectedEdgeData.value = null;
    }
  }
  
  // Sync all edges
  processStore.currentProcess.edges = currentEdges;
};

// Handle creating a new process
const createNewProcess = () => {
  if (!newProcessName.value.trim()) return;
  
  processStore.createProcess(
    newProcessName.value.trim(),
    newProcessDescription.value.trim()
  );
  
  isCreatingProcess.value = false;
  newProcessName.value = '';
  newProcessDescription.value = '';
};

// Add navigation guard
onBeforeRouteLeave((to, from, next) => {
  // If navigation was already confirmed or there are no unsaved changes, proceed
  if (navigationConfirmed.value || !processStore.hasUnsavedChanges) {
    next();
    return;
  }
  
  // Otherwise show the confirmation modal
  showUnsavedChangesModal.value = true;
  pendingNavigation.value = () => {
    navigationConfirmed.value = true;
    next();
  };
  next(false);
});

// Navigation handlers
const cancelNavigation = () => {
  showUnsavedChangesModal.value = false;
  pendingNavigation.value = null;
  navigationTarget.value = null;
  navigationConfirmed.value = false;
};

// Update the confirmNavigation function to handle targets
const confirmNavigation = (target) => {
  // If already confirmed or no unsaved changes, navigate directly
  if (navigationConfirmed.value || !processStore.hasUnsavedChanges) {
    router.push(target);
    return;
  }
  
  // Otherwise show confirmation modal
  showUnsavedChangesModal.value = true;
  navigationTarget.value = target;
};

// Add proceeding with navigation
const proceedWithNavigation = () => {
  showUnsavedChangesModal.value = false;
  
  if (pendingNavigation.value) {
    pendingNavigation.value();
  } else if (navigationTarget.value) {
    navigationConfirmed.value = true; // Mark as confirmed before navigating
    router.push(navigationTarget.value);
  }
};

// Update the goToManage function to use the navigation system
const goToManage = () => {
  // If already confirmed or no unsaved changes, navigate directly
  if (navigationConfirmed.value || !processStore.hasUnsavedChanges) {
    router.push('/process-builder/manage');
    return;
  }
  
  // Otherwise show confirmation modal
  showUnsavedChangesModal.value = true;
  navigationTarget.value = "/process-builder/manage";
};

// Add events for beforeunload
onMounted(() => {
  // No automatic process creation - let the user create one explicitly
  
  // Add the beforeunload event listener
  window.addEventListener('beforeunload', handleBeforeUnload);
});

onUnmounted(() => {
  // Remove event listeners
  window.removeEventListener('beforeunload', handleBeforeUnload);
});

// Show warning if there are unsaved changes
const handleBeforeUnload = (event) => {
  if (processStore.hasUnsavedChanges) {
    event.preventDefault();
    event.returnValue = '';
    return '';
  }
};

// Handle drag start
const onDragStart = (event, component) => {
  try {
    const dragData = {
      type: component.type,
      label: component.label,
      data: {
        ...component.data,
        label: component.label
      }
    };
    
    draggedComponent.value = dragData;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('application/json', JSON.stringify(dragData));
    
    // Add visual feedback
    event.target.classList.add('dragging');
  } catch (error) {
    console.error('Error starting drag:', error);
  }
};

// Handle drag end
const onDragEnd = (event) => {
  event.target.classList.remove('dragging');
  draggedComponent.value = null;
};

// Add these functions to handle form selection
const handleFormSelection = (form) => {
  if (selectedNodeData.value && form) {
    selectedNodeData.value.data.formId = form.formID;
    selectedNodeData.value.data.formName = form.formName;
    selectedNodeData.value.data.formUuid = form.formUUID;
    updateNodeInStore();
  }
};

const clearFormSelection = () => {
  if (selectedNodeData.value) {
    selectedNodeData.value.data.formId = null;
    selectedNodeData.value.data.formName = '';
    selectedNodeData.value.data.formUuid = null;
    updateNodeInStore();
  }
};

// Delete current node
const deleteNode = () => {
  if (selectedNodeData.value) {
    // Store the node ID before clearing the selection
    const nodeId = selectedNodeData.value.id;
    
    // Clear selection first to avoid references to deleted node
    selectedNodeData.value = null;
    selectedNode.value = null;
    
    // Delete the node
    processStore.deleteNode(nodeId);
  }
};

// Delete current edge
const deleteEdge = () => {
  if (selectedEdgeData.value) {
    processStore.deleteEdge(selectedEdgeData.value.id);
    selectedEdgeData.value = null;
  }
};

// Save current process
const saveProcess = () => {
  processStore.saveProcess();
};

// Add a component handler to add components from the component panel
const onAddComponent = (component) => {
  // Create a new node from the component definition
  const newNode = {
    id: `${component.type}_${Date.now()}`,
    type: component.type,
    position: { x: 100, y: 100 }, // Default position
    label: component.label,
    data: component.data
  };
  
  // Add the node to the process
  processStore.addNode(newNode);
  
  // Select the newly added node
  onNodeSelected(newNode);
};

// Fix references to functions
const onFormSelected = (formData) => {
  if (selectedNodeData.value && selectedNodeData.value.type === 'form') {
    selectedNodeData.value.data.formId = formData.id;
    selectedNodeData.value.data.formName = formData.name;
    updateNodeInStore();
  }
};

const onConditionsUpdated = (conditions) => {
  if (selectedNodeData.value && selectedNodeData.value.type === 'gateway') {
    selectedNodeData.value.data.conditions = conditions;
    updateNodeInStore();
  }
};
</script>

<template>
  <div class="process-builder flex flex-col h-screen bg-white">
    <!-- Header Bar -->
    <header
      class="bg-gray-800 px-4 py-4 flex items-center justify-between text-white shadow-md"
    >
      <div class="flex items-center gap-3">
        <img
          src="@/assets/img/logo/logo-word-white.svg"
          alt="Corrad Logo"
          class="h-7"
        />
      </div>

      <div class="flex items-center gap-3">
        <FormKit
          v-if="hasCurrentProcess"
          v-model="processStore.currentProcess.name"
          type="text"
          placeholder="Enter process name"
          :classes="{
            outer: 'w-64 mb-0',
            input: 'w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
          }"
        />
      </div>
      
      <div class="flex items-center gap-3">
        <RsButton @click="saveProcess" variant="primary" size="sm" :disabled="!hasCurrentProcess">
          <Icon name="material-symbols:save" class="mr-1" />
          Save Process
        </RsButton>
        <RsButton @click="confirmNavigation('/process-builder/manage')" variant="tertiary" size="sm">
          <Icon name="material-symbols:arrow-back" class="mr-1" />
          Back to Processes
        </RsButton>
      </div>
    </header>

    <!-- Main Content Area -->
    <div class="flex-1 flex overflow-hidden" v-if="hasCurrentProcess">
      <!-- Left Panel - Components -->
      <div class="w-64 border-r border-gray-200 flex flex-col overflow-hidden">
        <div class="bg-gray-100 p-3 flex items-center justify-between border-b border-gray-200">
          <h2 class="text-sm font-medium text-gray-700">Process Components</h2>
        </div>
        <div class="flex-1 overflow-y-auto">
          <ProcessBuilderComponents @add-component="onAddComponent" />
        </div>
      </div>

      <!-- Center Panel - Process Canvas -->
      <div class="flex-1 relative">
        <ProcessFlowCanvas 
          :initial-nodes="processStore.currentProcess.nodes"
          :initial-edges="processStore.currentProcess.edges"
          @node-selected="onNodeSelected"
          @edge-selected="onEdgeSelected"
          @pane-click="onPaneClick" 
          @nodes-change="onNodesChange"
          @edges-change="onEdgesChange"
        />
      </div>

      <!-- Right Panel - Properties -->
      <div class="w-80 border-l border-gray-200 flex flex-col overflow-hidden">
        <div class="bg-gray-100 p-3 flex items-center justify-between border-b border-gray-200">
          <h2 class="text-sm font-medium text-gray-700">Properties</h2>
        </div>
        <div class="flex-1 overflow-y-auto">
          <!-- Show variable manager when no node is selected -->
          <VariableManager v-if="!selectedNodeData" />
          
          <!-- Show node properties when a node is selected -->
          <div v-else class="p-4 space-y-4">
            <!-- Node Label -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Label</label>
              <input
                v-model="nodeLabel"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <!-- Node Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                v-model="nodeDescription"
                rows="2"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <!-- Node Type Specific Properties -->
            <div v-if="selectedNodeData.type === 'task'">
              <label class="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
              <input
                v-model="nodeAssignee"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <!-- Form Selection for Form Nodes -->
            <div v-if="selectedNodeData.type === 'form'">
              <FormSelector @select="onFormSelected" />
            </div>

            <!-- Gateway Conditions -->
            <div v-if="selectedNodeData.type === 'gateway'">
              <GatewayConditionManager
                :conditions="selectedNodeData.data.conditions"
                @update="onConditionsUpdated"
                :availableVariables="gatewayAvailableVariables"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state - No process selected -->
    <div v-else class="flex-1 flex items-center justify-center bg-gray-50">
      <div class="text-center p-8 max-w-md">
        <Icon name="material-symbols:flowchart" class="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h2 class="text-xl font-semibold text-gray-800 mb-2">Create a New Process</h2>
        <p class="text-gray-600 mb-6">Get started by creating a new process or navigate back to manage your existing processes.</p>
        
        <div class="space-y-3">
          <div class="mb-4">
            <FormKit
              v-model="newProcessName"
              type="text"
              label="Process Name"
              placeholder="Enter a name for your new process"
              validation="required"
            />
            
            <FormKit
              v-model="newProcessDescription"
              type="textarea"
              label="Description (Optional)"
              placeholder="Enter a description"
              :rows="3"
            />
          </div>
          
          <div class="flex justify-center gap-4">
            <RsButton @click="createNewProcess" variant="primary" :disabled="!newProcessName.trim()">
              <Icon name="material-symbols:add" class="mr-1" />
              Create Process
            </RsButton>
            
            <RsButton @click="confirmNavigation('/process-builder/manage')" variant="tertiary">
              <Icon name="material-symbols:arrow-back" class="mr-1" />
              Back to Processes
            </RsButton>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Unsaved changes dialog -->
    <RsModal v-model="showUnsavedChangesModal" title="Unsaved Changes" size="md" position="center">
      <div class="p-4">
        <div class="flex items-center mb-4">
          <Icon name="material-symbols:warning-outline" class="text-yellow-500 w-8 h-8 mr-3" />
          <div>
            <p class="text-gray-600">You have unsaved changes that will be lost if you leave the page.</p>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <RsButton @click="cancelNavigation" variant="tertiary">
            Stay on this Page
          </RsButton>
          <RsButton @click="proceedWithNavigation" variant="danger">
            Discard Changes
          </RsButton>
        </div>
      </template>
    </RsModal>
  </div>
</template>

<style scoped>
.process-builder {
  --flow-node-selected-color: theme('colors.blue.500');
  --flow-background-color: theme('colors.gray.100');
  --flow-connection-path-color: theme('colors.gray.400');
  --flow-connection-path-hover-color: theme('colors.blue.400');
}

:deep(.custom-node) {
  border-radius: 4px;
  padding: 10px;
}

:deep(.custom-node.selected) {
  border-color: var(--flow-node-selected-color);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
}

:deep(.custom-node-content) {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

:deep(.custom-node-title) {
  margin-top: 4px;
  text-align: center;
  font-weight: 500;
}

:deep(.node-gateway) {
  transform: rotate(45deg);
  background: white;
  border: 2px solid #FF9800;
}

:deep(.node-gateway .custom-node-content) {
  transform: rotate(-45deg);
}

:deep(.node-start), :deep(.node-end) {
  border-radius: 50%;
  width: 60px;
  height: 60px;
}

:deep(.node-task), :deep(.node-form), :deep(.node-script) {
  min-width: 160px;
  background: white;
  border: 1px solid #ddd;
}

:deep(.node-details) {
  margin-top: 8px;
  font-size: 0.75rem;
  width: 100%;
}

:deep(.node-description) {
  color: #666;
  margin-bottom: 4px;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.process-builder-container {
  background-color: #f8fafc;
}

.process-name-input :deep(.formkit-inner) {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  color: white;
  min-width: 200px;
}

.process-name-input :deep(.formkit-inner:focus-within) {
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1);
}

.process-name-input :deep(input::placeholder) {
  color: rgba(255, 255, 255, 0.6);
}

.process-name-input :deep(.formkit-message) {
  color: rgba(255, 200, 200, 0.9);
  font-size: 0.7rem;
  position: absolute;
}

.process-builder-palette,
.process-builder-properties {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.process-component-item.dragging {
  opacity: 0.5;
  transform: scale(0.95);
}

.process-component-item {
  transition: all 0.2s ease;
  user-select: none;
}

.process-component-item:active {
  cursor: grabbing;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .process-builder-palette {
    width: 200px;
  }
  
  .process-builder-properties {
    width: 250px;
  }
}

@media (max-width: 768px) {
  .process-builder-actions {
    flex-wrap: wrap;
  }
  
  .process-builder-palette,
  .process-builder-properties {
    display: none;
  }
  
  .process-builder-canvas {
    width: 100%;
  }
}
</style> 