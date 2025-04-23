<script setup>
import { ref, onMounted, computed, shallowRef } from 'vue';
import { VueFlow, useVueFlow, Panel } from '@vue-flow/core';
import { Background } from '@vue-flow/background';
import { Controls } from '@vue-flow/controls';
import { MiniMap } from '@vue-flow/minimap';
import { nodeTypes as customNodeTypes, nodeStyles } from './ProcessFlowNodes';
import '@vue-flow/core/dist/style.css';
import '@vue-flow/core/dist/theme-default.css';
import '@vue-flow/controls/dist/style.css';
import '@vue-flow/minimap/dist/style.css';

// Add Material Icons import
const materialIconsLink = document.createElement('link');
materialIconsLink.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
materialIconsLink.rel = 'stylesheet';
document.head.appendChild(materialIconsLink);

const props = defineProps({
  initialNodes: {
    type: Array,
    default: () => []
  },
  initialEdges: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['nodeClick', 'edgeClick', 'paneClick', 'nodesChange', 'edgesChange', 'nodeSelected']);

// Get the flow instance
const { flowInstance } = useVueFlow();

// Initialize Vue Flow
const {
  nodes,
  edges,
  addNodes,
  addEdges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  fitView,
  project,
  removeNodes,
  removeEdges
} = useVueFlow({
  defaultEdgeOptions: {
    animated: true,
    type: 'smoothstep'
  },
  deleteKeyCode: 'Delete',
  selectionKeyCode: 'Shift',
  multiSelectionKeyCode: 'Control',
  connectionMode: 'loose'
});

// Default nodes if empty
const defaultNodes = [
  {
    id: 'start',
    type: 'start',
    label: 'Start Process',
    position: { x: 100, y: 100 },
    data: {
      description: 'Process starts here'
    }
  },
  {
    id: 'form1',
    type: 'form',
    label: 'Request Form',
    position: { x: 100, y: 250 },
    data: {
      description: 'User fills out request form',
      formName: 'Request Form'
    }
  },
  {
    id: 'gateway',
    type: 'gateway',
    label: 'Approval Required?',
    position: { x: 100, y: 400 },
    data: {
      description: 'Check if approval is required',
      conditions: ['Amount > 1000', 'Special Request']
    }
  },
  {
    id: 'task1',
    type: 'task',
    label: 'Manager Approval',
    position: { x: 250, y: 550 },
    data: {
      description: 'Manager reviews the request',
      assignee: 'Department Manager'
    }
  },
  {
    id: 'script1',
    type: 'script',
    label: 'Process Request',
    position: { x: -50, y: 550 },
    data: {
      description: 'Automatically process the request',
      language: 'JavaScript'
    }
  },
  {
    id: 'end',
    type: 'end',
    label: 'End Process',
    position: { x: 100, y: 700 },
    data: {
      description: 'Process completes here'
    }
  }
];

// Default edges if empty
const defaultEdges = [
  {
    id: 'start-form1',
    source: 'start',
    target: 'form1',
    animated: true
  },
  {
    id: 'form1-gateway',
    source: 'form1',
    target: 'gateway',
    animated: true
  },
  {
    id: 'gateway-task1',
    source: 'gateway',
    target: 'task1',
    animated: true,
    label: 'Yes',
    type: 'smoothstep'
  },
  {
    id: 'gateway-script1',
    source: 'gateway',
    target: 'script1',
    animated: true,
    label: 'No',
    type: 'smoothstep'
  },
  {
    id: 'task1-end',
    source: 'task1',
    target: 'end',
    animated: true
  },
  {
    id: 'script1-end',
    source: 'script1',
    target: 'end',
    animated: true
  }
];

// Flow configuration
const flowOptions = ref({
  defaultZoom: 1,
  minZoom: 0.2,
  maxZoom: 4,
  fitViewOnInit: true,
  snapToGrid: true,
  snapGrid: [15, 15],
  edgeUpdaterRadius: 10,
  connectionMode: 'loose',
  elevateEdgesOnSelect: true,
  nodesDraggable: true,
  nodesConnectable: true,
  elementsSelectable: true,
  selectNodesOnDrag: false,
  panOnDrag: [0, 2],
  panOnScroll: false,
  zoomOnScroll: true,
  zoomOnPinch: true,
  zoomOnDoubleClick: false
});

// Use shallowRef for selected node to avoid unnecessary reactivity
const selectedNode = shallowRef(null);

// Handle node selection
const onNodeClick = ({ node }) => {
  // Add detailed debugging
  // console.log('Raw node:', node);

  // Check if node exists and has required properties
  if (!node || !node.id) {
    console.warn('Invalid node clicked - Missing required properties');
    return;
  }

  try {
    // Create a plain object copy of the node to avoid reactivity issues
    const nodeData = {
      id: node.id,
      type: node.type,
      data: node.data ? JSON.parse(JSON.stringify(node.data)) : {},
      position: node.dimensions ? { 
        x: node.dimensions.x || 0, 
        y: node.dimensions.y || 0 
      } : { x: 0, y: 0 }
    };

    // console.log('Processed node data:', nodeData);
    selectedNode.value = nodeData;
    emit('nodeSelected', nodeData);
  } catch (error) {
    console.error('Error processing node data:', error);
  }
};

// Handle edge click
const onEdgeClick = (_, edge) => {
  emit('edgeClick', edge);
};

// Handle pane (background) click
const onPaneClick = () => {
  selectedNode.value = null;
  emit('paneClick');
};

// Window resize handler
const resizeFlow = () => {
  setTimeout(() => {
    fitView();
  }, 200);
};

onMounted(() => {
  // Initialize with provided nodes or default ones
  if (props.initialNodes.length) {
    addNodes(props.initialNodes);
  } else {
    addNodes(defaultNodes);
  }
  
  // Initialize with provided edges or default ones
  if (props.initialEdges.length) {
    addEdges(props.initialEdges);
  } else {
    addEdges(defaultEdges);
  }
  
  // Setup window resize handler
  window.addEventListener('resize', resizeFlow);
  
  // Initial fit view
  setTimeout(() => {
    fitView();
  }, 100);
});

// Handle node changes
onNodesChange((changes) => {
  emit('nodesChange', changes, nodes.value);
});

// Handle edge changes
onEdgesChange((changes) => {
  emit('edgesChange', changes, edges.value);
});

// Handle new connections
const handleConnect = (connection) => {
  if (!connection.source || !connection.target) return;
  
  const newEdge = {
    id: `${connection.source}-${connection.target}`,
    source: connection.source,
    target: connection.target,
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#555' }
  };

  addEdges([newEdge]);
  emit('edgesChange', edges.value);
};

// Handle node removal
const onNodeDelete = (nodes) => {
  removeNodes(nodes);
  emit('nodesChange', nodes.value);
};

// Handle edge removal
const onEdgeDelete = (edges) => {
  removeEdges(edges);
  emit('edgesChange', edges.value);
};

// Handle drop event
const onDrop = (event) => {
  event.preventDefault();

  try {
    // Get the dragged component data
    const componentData = JSON.parse(event.dataTransfer.getData('application/json'));
    if (!componentData) return;

    // Get the Vue Flow wrapper element
    const flowWrapper = event.currentTarget;
    const bounds = flowWrapper.getBoundingClientRect();

    // Calculate the position relative to the wrapper
    const position = project({
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top
    });

    // Create new node
    const newNode = {
      id: `${componentData.type}-${Date.now()}`,
      type: componentData.type,
      position,
      data: { 
        ...componentData.data,
        label: componentData.label
      }
    };

    // console.log('Adding new node:', newNode);
    addNodes([newNode]);
  } catch (error) {
    console.error('Error handling drop:', error);
  }
};

// Handle drag over
const onDragOver = (event) => {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
};
</script>

<template>
  <div 
    class="process-flow-container"
    @drop="onDrop"
    @dragover="onDragOver"
  >
    <VueFlow
      v-bind="flowOptions"
      class="bg-slate-50 process-flow"
      :nodeTypes="customNodeTypes"
      @node-click="onNodeClick"
      @edge-click="onEdgeClick"
      @pane-click="onPaneClick"
      @connect="handleConnect"
      @nodeDoubleClick="onNodeDelete"
      @edgeDoubleClick="onEdgeDelete"
    >
      <Background pattern-color="#aaa" gap="20" />
      <Controls />
      <MiniMap />
      
      <template #edge-label="{ label }">
        <div class="edge-label">{{ label }}</div>
      </template>

      <Panel position="top-right" class="node-controls">
        <div class="p-2 bg-white rounded shadow-sm text-sm">
          <div class="mb-1">Controls:</div>
          <div>• Delete: Remove selected</div>
          <div>• Shift: Select nodes</div>
          <div>• Drag between nodes to connect</div>
          <div>• Double-click to remove</div>
        </div>
      </Panel>
    </VueFlow>
  </div>
</template>

<style>
/* Node styles from ProcessFlowNodes.js are imported globally in a plugin */
.process-flow-container {
  width: 100%;
  height: calc(100vh - 216px); /* Adjust based on header/footer height */
  min-height: 600px;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  overflow: hidden;
  position: relative;
  flex: 1;
}

/* Make sure VueFlow takes full height */
:deep(.vue-flow) {
  height: 100% !important;
}

/* Ensure the flow wrapper fills container */
:deep(.vue-flow__container) {
  height: 100% !important;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .process-flow-container {
    height: calc(100vh - 150px);
    min-height: 400px;
  }
}

@media (max-width: 480px) {
  .process-flow-container {
    height: calc(100vh - 120px);
    min-height: 300px;
  }
  
  :deep(.vue-flow__controls) {
    transform: scale(0.8);
    transform-origin: bottom right;
  }
  
  :deep(.vue-flow__minimap) {
    transform: scale(0.8);
    transform-origin: top right;
  }
}

.edge-label {
  background-color: white;
  padding: 2px 4px;
  border-radius: 4px;
  font-size: 10px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* Vue Flow custom styles */
:deep(.vue-flow__edge-path) {
  stroke: #555;
  stroke-width: 2px;
}

:deep(.vue-flow__edge.selected .vue-flow__edge-path) {
  stroke: #ff6b6b;
  stroke-width: 3px;
}

:deep(.vue-flow__edge.animated .vue-flow__edge-path) {
  stroke-dasharray: 5;
  animation: flowEdgeAnimation 2s linear infinite;
}

/* Add custom node icon styles */
:deep(.custom-node) {
  border-radius: 6px;
  padding: 12px;
  background: white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  min-width: 150px;
}

:deep(.custom-node-header) {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

:deep(.custom-node-icon) {
  margin-right: 8px;
}

:deep(.custom-node-icon .material-icons) {
  font-size: 20px;
}

:deep(.node-start .custom-node-icon .material-icons) {
  color: #4CAF50;
}

:deep(.node-end .custom-node-icon .material-icons) {
  color: #f44336;
}

:deep(.node-task .custom-node-icon .material-icons) {
  color: #2196F3;
}

:deep(.node-form .custom-node-icon .material-icons) {
  color: #9C27B0;
}

:deep(.node-gateway .custom-node-icon .material-icons) {
  color: #FF9800;
}

:deep(.node-script .custom-node-icon .material-icons) {
  color: #607D8B;
}

:deep(.custom-node-title) {
  font-weight: 500;
  flex-grow: 1;
}

:deep(.custom-node-content) {
  font-size: 12px;
  color: #666;
}

@keyframes flowEdgeAnimation {
  from {
    stroke-dashoffset: 10;
  }
  to {
    stroke-dashoffset: 0;
  }
}

.node-controls {
  margin: 10px;
  color: #666;
  font-size: 12px;
  background: white;
  border-radius: 4px;
  pointer-events: all;
}

:deep(.vue-flow__handle) {
  width: 8px;
  height: 8px;
  background: #555;
  border: 2px solid white;
}

:deep(.vue-flow__handle:hover) {
  background: #ff6b6b;
}

:deep(.vue-flow__edge.selected .vue-flow__edge-path) {
  stroke: #ff6b6b;
  stroke-width: 3px;
}

:deep(.vue-flow__node.selected) {
  box-shadow: 0 0 0 2px #ff6b6b;
}
</style> 