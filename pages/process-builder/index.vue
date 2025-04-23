<script setup>
import { ref, onMounted, computed, shallowRef } from 'vue';
import { useProcessBuilderStore } from '~/stores/processBuilder';
import { useRouter } from 'vue-router';
import ProcessFlowCanvas from '~/components/process-flow/ProcessFlowCanvas.vue';

// Initialize the store and router
const processStore = useProcessBuilderStore();
const router = useRouter();

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

// Handle node selection
const onNodeSelected = (node) => {
  selectedNodeData.value = JSON.parse(JSON.stringify(node));
  selectedNode.value = node;
  processStore.selectNode(node.id);
};

// Update node in store
const updateNodeInStore = () => {
  if (selectedNodeData.value) {
    processStore.updateNode(selectedNodeData.value);
  }
};

// Handle pane click (deselection)
const onPaneClick = () => {
  selectedNode.value = null;
  selectedNodeData.value = null;
  processStore.clearSelection();
};

// Handle node changes
const onNodesChange = (changes, nodes) => {
  // For now just log changes
  // console.log('Nodes changed:', changes);
};

// Handle edge changes
const onEdgesChange = (changes, edges) => {
  // For now just log changes
  // console.log('Edges changed:', changes);
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

// Go to process management
const goToManage = () => {
  router.push('/process-builder/manage');
};

// Mock demo process for testing if no process exists
const createDemoProcess = () => {
  const process = processStore.createProcess('Demo Process', 'A demonstration process flow');
  processStore.setCurrentProcess(process.id);
};

// Check if we have any processes, if not create a demo one
onMounted(() => {
  if (!processStore.currentProcess && processStore.processes.length === 0) {
    createDemoProcess();
  }
});

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

// Generate unique node ID
const generateNodeId = (type) => {
  return `${type}-${Math.random().toString(36).substr(2, 9)}`;
};
</script>

<template>
  <div class="process-builder-container h-[calc(100vh-100px)] flex flex-col">
    <div class="process-builder-header mb-4 flex justify-between items-center p-4 bg-white shadow-sm">
      <h1 class="text-2xl font-bold">Process Builder</h1>
      
      <div class="process-builder-actions flex gap-2">
        <button
          v-if="!isCreatingProcess"
          @click="isCreatingProcess = true"
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          New Process
        </button>
        
        <button
          v-if="hasCurrentProcess"
          @click="processStore.saveProcess()"
          class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          :disabled="!processStore.hasUnsavedChanges"
        >
          Save Process
        </button>
        
        <button
          @click="goToManage"
          class="px-4 py-2 border rounded hover:bg-gray-100"
        >
          Manage Processes
        </button>
      </div>
    </div>
    
    <!-- New process form -->
    <div v-if="isCreatingProcess" class="mb-4 p-4 border rounded bg-gray-50 mx-4">
      <h2 class="text-lg font-bold mb-2">Create New Process</h2>
      
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">Process Name</label>
        <input
          v-model="newProcessName"
          type="text"
          class="w-full px-3 py-2 border rounded"
          placeholder="Enter process name"
        />
      </div>
      
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          v-model="newProcessDescription"
          rows="2"
          class="w-full px-3 py-2 border rounded"
          placeholder="Enter process description"
        ></textarea>
      </div>
      
      <div class="flex gap-2">
        <button
          @click="createNewProcess"
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          :disabled="!newProcessName.trim()"
        >
          Create
        </button>
        
        <button
          @click="isCreatingProcess = false"
          class="px-4 py-2 border rounded hover:bg-gray-100"
        >
          Cancel
        </button>
      </div>
    </div>
    
    <div v-if="hasCurrentProcess" class="flex flex-1 gap-4 p-4 min-h-0 overflow-hidden">
      <!-- Left panel - Component palette -->
      <div class="process-builder-palette w-64 bg-white shadow-md rounded-md overflow-y-auto">
        <div class="p-4">
          <h2 class="text-lg font-bold mb-2">Components</h2>
          <div class="process-builder-component-list space-y-2">
            <div 
              v-for="component in components"
              :key="component.type"
              class="process-component-item p-2 border rounded cursor-grab hover:bg-gray-50 transition-transform"
              draggable="true"
              @dragstart="(e) => onDragStart(e, component)"
              @dragend="onDragEnd"
            >
              <div class="flex items-center">
                <i :class="['material-icons mr-2', component.iconColor]">{{ component.icon }}</i>
                <span>{{ component.label }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Middle panel - Canvas -->
      <div class="process-builder-canvas flex-1 min-w-0">
        <ProcessFlowCanvas
          @node-selected="onNodeSelected"
          @pane-click="onPaneClick"
          @nodes-change="onNodesChange"
          @edges-change="onEdgesChange"
        />
      </div>
      
      <!-- Right panel - Properties -->
      <div class="process-builder-properties w-72 bg-white shadow-md rounded-md overflow-y-auto">
        <div class="p-4">
          <h2 class="text-lg font-bold mb-2">Properties</h2>
          
          <div v-if="selectedNodeData" class="process-properties-content space-y-4">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Node ID</label>
              <div class="px-3 py-2 border rounded bg-gray-50 text-sm">{{ selectedNodeData.id }}</div>
            </div>
            
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Node Type</label>
              <div class="px-3 py-2 border rounded bg-gray-50 text-sm">{{ selectedNodeData.type }}</div>
            </div>
            
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Label</label>
              <input
                type="text"
                v-model="nodeLabel"
                class="w-full px-3 py-2 border rounded text-sm"
              />
            </div>
            
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                v-model="nodeDescription"
                rows="3"
                class="w-full px-3 py-2 border rounded text-sm"
              ></textarea>
            </div>
            
            <!-- Conditional fields based on node type -->
            <div v-if="selectedNodeData.type === 'task'" class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
              <input
                type="text"
                v-model="nodeAssignee"
                class="w-full px-3 py-2 border rounded text-sm"
              />
            </div>
            
            <div v-if="selectedNodeData.type === 'form'" class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Form Name</label>
              <input
                type="text"
                v-model="nodeFormName"
                class="w-full px-3 py-2 border rounded text-sm"
              />
            </div>
            
            <div v-if="selectedNodeData.type === 'script'" class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Language</label>
              <select
                v-model="nodeLanguage"
                class="w-full px-3 py-2 border rounded text-sm"
              >
                <option value="JavaScript">JavaScript</option>
                <option value="PHP">PHP</option>
                <option value="Python">Python</option>
              </select>
            </div>
          </div>
          
          <div v-else class="text-gray-500 text-sm italic">
            Select a node to view its properties
          </div>
        </div>
      </div>
    </div>
    
    <!-- No process message -->
    <div v-if="!hasCurrentProcess && !isCreatingProcess" class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <div class="text-gray-500 mb-4">
          <i class="material-icons text-5xl">account_tree</i>
          <p class="mt-2 text-lg">No process is currently open</p>
        </div>
        
        <div class="flex flex-col items-center space-y-3">
          <button
            @click="isCreatingProcess = true"
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Create New Process
          </button>
          
          <button
            @click="goToManage"
            class="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Go to Process Management
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.process-builder-container {
  background-color: #f8fafc;
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