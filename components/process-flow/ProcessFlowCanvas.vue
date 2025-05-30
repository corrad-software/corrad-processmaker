<script setup>
import { ref, onMounted, computed, shallowRef, watch, defineExpose, nextTick } from 'vue';
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

const emit = defineEmits(['nodeClick', 'edgeClick', 'paneClick', 'nodesChange', 'edgesChange', 'nodeSelected', 'edgeSelected']);

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
  removeEdges,
  updateNodeInternals
} = useVueFlow({
  defaultEdgeOptions: {
    animated: true,
    type: 'smoothstep'
  },
  deleteKeyCode: 'Delete',
  selectionKeyCode: 'Shift',
  multiSelectionKeyCode: 'Control',
  connectionMode: 'loose',
  isValidConnection: (connection) => {
    // console.log('Validating connection:', connection);
    return true;
  }
});

// Default nodes if empty
const defaultNodes = [];

// Default edges if empty
const defaultEdges = [];

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
  connectionRadius: 25,
  elevateEdgesOnSelect: true,
  nodesDraggable: true,
  nodesConnectable: true,
  elementsSelectable: true,
  selectNodesOnDrag: false,
  panOnDrag: [0, 2],
  panOnScroll: false,
  zoomOnScroll: true,
  zoomOnPinch: true,
  zoomOnDoubleClick: false,
  connectOnClick: false
});

// Use shallowRef for selected node to avoid unnecessary reactivity
const selectedNode = shallowRef(null);

// State management for preventing recursive updates
const isUpdatingNodes = ref(false);
const isUpdatingEdges = ref(false);

// Handle node selection
const onNodeClick = ({ node }) => {
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
      label: node.label || (node.data && node.data.label) || '',
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
const onEdgeClick = (event, edge) => {
  // Create a simplified copy of the edge data
  const edgeData = {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.label || '',
    sourceNode: nodes.value.find(node => node.id === edge.source),
    targetNode: nodes.value.find(node => node.id === edge.target)
  };
  
  emit('edgeSelected', edgeData);
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

// Watch for changes to initialNodes prop and update the canvas
watch(() => props.initialNodes, async (newNodes, oldNodes) => {
  if (newNodes && Array.isArray(newNodes) && !isUpdatingNodes.value) {
    isUpdatingNodes.value = true;
    
    try {
      // console.log('ProcessFlowCanvas: Updating nodes, count:', newNodes.length);
      
      // Instead of clearing all nodes, sync them intelligently
      const currentNodeIds = new Set(nodes.value.map(n => n.id));
      const newNodeIds = new Set(newNodes.map(n => n.id));
      
      // Remove nodes that are no longer in the new list
      const nodesToRemove = nodes.value.filter(node => !newNodeIds.has(node.id));
      if (nodesToRemove.length > 0) {
        removeNodes(nodesToRemove);
      }
      
      // Add new nodes that aren't already present
      const nodesToAdd = newNodes.filter(node => !currentNodeIds.has(node.id));
      if (nodesToAdd.length > 0) {
        addNodes([...nodesToAdd]); // Create a copy to avoid reactivity issues
      }
      
      // Update existing nodes that have changed
      newNodes.forEach(newNode => {
        const existingNode = nodes.value.find(n => n.id === newNode.id);
        if (existingNode) {
          // Check if the node has actually changed before updating
          const hasChanges = (
            existingNode.label !== newNode.label ||
            JSON.stringify(existingNode.data) !== JSON.stringify(newNode.data) ||
            Math.abs(existingNode.position.x - newNode.position.x) > 1 ||
            Math.abs(existingNode.position.y - newNode.position.y) > 1
          );
          
          if (hasChanges) {
            Object.assign(existingNode, {
              label: newNode.label,
              data: { ...newNode.data },
              position: { ...newNode.position }
            });
            updateNodeInternals([newNode.id]);
          }
        }
      });
      
      // Fit view only if we added new nodes and this is significant change
      if (nodesToAdd.length > 0) {
        await nextTick();
        setTimeout(() => {
          fitView();
        }, 100);
      }
    } finally {
      // Use a small delay to prevent immediate re-triggering
      setTimeout(() => {
        isUpdatingNodes.value = false;
      }, 50);
    }
  }
}, { deep: true });

// Watch for changes to initialEdges prop and update the canvas
// This watcher depends on nodes being already present
watch(() => [props.initialEdges, nodes.value.length], async ([newEdges, nodeCount]) => {
  if (newEdges && Array.isArray(newEdges) && nodeCount > 0 && !isUpdatingEdges.value) {
    isUpdatingEdges.value = true;
    
    try {
      // console.log('ProcessFlowCanvas: Updating edges, count:', newEdges.length, 'nodeCount:', nodeCount);
      
      // Instead of clearing all edges, sync them intelligently
      const currentEdgeIds = new Set(edges.value.map(e => e.id));
      const newEdgeIds = new Set(newEdges.map(e => e.id));
      
      // Remove edges that are no longer in the new list
      const edgesToRemove = edges.value.filter(edge => !newEdgeIds.has(edge.id));
      if (edgesToRemove.length > 0) {
        removeEdges(edgesToRemove);
      }
      
      if (newEdges.length > 0) {
        // Verify all nodes exist before adding edges
        const validEdges = newEdges.filter(edge => {
          const sourceExists = nodes.value.some(node => node.id === edge.source);
          const targetExists = nodes.value.some(node => node.id === edge.target);
          
          if (!sourceExists || !targetExists) {
            console.warn(`Skipping edge ${edge.id}: source ${edge.source} exists: ${sourceExists}, target ${edge.target} exists: ${targetExists}`);
            return false;
          }
          
          return true;
        });
        
        // Add new edges that aren't already present
        const edgesToAdd = validEdges.filter(edge => !currentEdgeIds.has(edge.id));
        
        if (edgesToAdd.length > 0) {
          // Ensure all edges have proper handle specifications
          const edgesWithHandles = edgesToAdd.map(edge => {
            // If edge already has sourceHandle and targetHandle, use them
            if (edge.sourceHandle && edge.targetHandle) {
              return edge;
            }
            
            // Otherwise, generate default handles based on node types
            const sourceNode = nodes.value.find(n => n.id === edge.source);
            const targetNode = nodes.value.find(n => n.id === edge.target);
            
            let sourceHandle = edge.sourceHandle;
            let targetHandle = edge.targetHandle;
            
            // Generate default source handle if missing
            if (!sourceHandle && sourceNode) {
              if (sourceNode.type === 'start') {
                sourceHandle = `${edge.source}-bottom`; // Start nodes prefer bottom output
              } else if (sourceNode.type === 'gateway') {
                sourceHandle = `${edge.source}-right`; // Gateway nodes prefer right output for first connection
              } else {
                sourceHandle = `${edge.source}-bottom`; // Most nodes prefer bottom output
              }
            }
            
            // Generate default target handle if missing
            if (!targetHandle && targetNode) {
              if (targetNode.type === 'end') {
                targetHandle = `${edge.target}-top`; // End nodes prefer top input
              } else {
                targetHandle = `${edge.target}-top`; // Most nodes prefer top input
              }
            }
            
            return {
              ...edge,
              sourceHandle,
              targetHandle
            };
          });
          
          addEdges([...edgesWithHandles]); // Create a copy to avoid reactivity issues
          // console.log('ProcessFlowCanvas: Successfully added edges with handles:', edgesWithHandles.length);
        }
        
        // Update existing edges that have changed
        newEdges.forEach(newEdge => {
          const existingEdge = edges.value.find(e => e.id === newEdge.id);
          if (existingEdge) {
            // Check if the edge has actually changed before updating
            const hasChanges = (
              existingEdge.label !== newEdge.label ||
              existingEdge.sourceHandle !== newEdge.sourceHandle ||
              existingEdge.targetHandle !== newEdge.targetHandle ||
              JSON.stringify(existingEdge.style) !== JSON.stringify(newEdge.style)
            );
            
            if (hasChanges) {
              Object.assign(existingEdge, {
                label: newEdge.label,
                sourceHandle: newEdge.sourceHandle,
                targetHandle: newEdge.targetHandle,
                style: newEdge.style ? { ...newEdge.style } : undefined
              });
            }
          }
        });
      }
    } finally {
      // Use a small delay to prevent immediate re-triggering
      setTimeout(() => {
        isUpdatingEdges.value = false;
      }, 50);
    }
  } else if (newEdges && Array.isArray(newEdges) && newEdges.length > 0 && nodeCount === 0) {
    // console.log('ProcessFlowCanvas: Edges provided but no nodes yet, waiting...');
  }
}, { deep: true });

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
  
  console.log('Connection created:', connection);
  
  // Try to determine if this is coming from a gateway
  const sourceNode = nodes.value.find(node => node.id === connection.source);
  let label = '';
  
  // If the source is a gateway, we should add a label based on conditions
  if (sourceNode && sourceNode.type === 'gateway') {
    // Check if there's a default path label
    if (sourceNode.data && sourceNode.data.defaultPath) {
      label = sourceNode.data.defaultPath;
    }
    
    // For existing gateway connections, check if we should use a condition's output
    const existingEdges = edges.value.filter(edge => edge.source === connection.source);
    if (existingEdges.length === 0 && sourceNode.data.conditions && sourceNode.data.conditions.length > 0) {
      // If this is the first connection and we have conditions, use the first condition's output
      const firstCondition = sourceNode.data.conditions[0];
      if (firstCondition && firstCondition.output) {
        label = firstCondition.output;
      }
    } else if (sourceNode.data.conditions) {
      // If we already have connections, try to find an unused condition
      const usedOutputs = existingEdges.map(edge => edge.label);
      const unusedCondition = sourceNode.data.conditions.find(condition => 
        condition.output && !usedOutputs.includes(condition.output)
      );
      
      if (unusedCondition) {
        label = unusedCondition.output;
      }
    }
  }
  
  const newEdge = {
    id: `${connection.source}-${connection.target}-${Date.now()}`,
    source: connection.source,
    target: connection.target,
    sourceHandle: connection.sourceHandle,
    targetHandle: connection.targetHandle,
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#555' },
    label: label
  };
  
  console.log('Creating edge with handles:', {
    sourceHandle: connection.sourceHandle,
    targetHandle: connection.targetHandle,
    source: connection.source,
    target: connection.target
  });

  // Add the edge directly to Vue Flow for immediate visual feedback
  addEdges([newEdge]);
  
  // Emit the edge change in the format the parent expects
  emit('edgesChange', [{ type: 'add', id: newEdge.id }], edges.value);
};

// Handle node removal
const onNodeDelete = (event) => {
  // Check if we have a node in the event
  if (event && event.node) {
    removeNodes([event.node]);
    emit('nodesChange', nodes.value);
  }
};

// Handle edge removal
const onEdgeDelete = (event) => {
  // Check if we have an edge in the event
  if (event && event.edge) {
    removeEdges([event.edge]);
    emit('edgesChange', edges.value);
  }
};

// Handle delete key press to remove selected elements
const onDeleteKeyPress = () => {
  const { getSelectedNodes, getSelectedEdges } = flowInstance.value;
  const selectedNodes = getSelectedNodes();
  const selectedEdges = getSelectedEdges();
  
  if (selectedNodes.length > 0) {
    removeNodes(selectedNodes);
    emit('nodesChange', nodes.value);
  }
  
  if (selectedEdges.length > 0) {
    removeEdges(selectedEdges);
    emit('edgesChange', edges.value);
  }
};

// Handle drop event
const onDrop = (event) => {
  event.preventDefault();
  event.stopPropagation();

  try {
    // Get the dragged component data
    const componentData = JSON.parse(event.dataTransfer.getData('text/plain'));
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

    addNodes([newNode]);
  } catch (error) {
    console.error('Error handling drop:', error);
  }
};

// Handle drag over
const onDragOver = (event) => {
  event.preventDefault();
  event.stopPropagation();
  event.dataTransfer.dropEffect = 'copy';
};

// Define methods to expose to parent components
defineExpose({
  updateNode,
  addNode,
  removeNode,
  fitView,
  syncCanvas
});

// Update an existing node
function updateNode(nodeId, newData) {
  const nodeToUpdate = nodes.value.find(node => node.id === nodeId);
  if (!nodeToUpdate) return;
  
  // Update the node properties
  if (newData.label) {
    nodeToUpdate.label = newData.label;
  }
  
  // Update the node data
  if (newData.data) {
    nodeToUpdate.data = {
      ...nodeToUpdate.data,
      ...newData.data
    };
  }
  
  // Update node internals to trigger re-render
  updateNodeInternals([nodeId]);
  
  return nodeToUpdate;
}

// Add a new node to the canvas
function addNode(node) {
  addNodes([node]);
  return node;
}

// Remove a node from the canvas
function removeNode(nodeId) {
  const nodeToRemove = nodes.value.find(node => node.id === nodeId);
  if (!nodeToRemove) return;
  
  removeNodes([nodeToRemove]);
  return nodeToRemove;
}

// Add explicit sync method to manually update canvas
function syncCanvas(newNodes, newEdges) {
  console.log('Explicit canvas sync called:', newNodes?.length, 'nodes,', newEdges?.length, 'edges');
  
  // Force clear the updating flags first to ensure we can process
  isUpdatingNodes.value = false;
  isUpdatingEdges.value = false;
  
  // Wait a moment for any ongoing operations to complete
  setTimeout(() => {
    try {
      console.log('Starting canvas sync operation...');
      
      // Sync nodes first
      if (newNodes && Array.isArray(newNodes)) {
        const currentNodeIds = new Set(nodes.value.map(n => n.id));
        const newNodeIds = new Set(newNodes.map(n => n.id));
        
        console.log('Current nodes:', currentNodeIds.size, 'New nodes:', newNodeIds.size);
        
        // Remove nodes that are no longer in the new list
        const nodesToRemove = nodes.value.filter(node => !newNodeIds.has(node.id));
        if (nodesToRemove.length > 0) {
          console.log('Removing nodes:', nodesToRemove.map(n => n.id));
          removeNodes(nodesToRemove);
        }
        
        // Add new nodes that aren't already present
        const nodesToAdd = newNodes.filter(node => !currentNodeIds.has(node.id));
        if (nodesToAdd.length > 0) {
          console.log('Adding nodes:', nodesToAdd.map(n => n.id));
          addNodes([...nodesToAdd]);
        }
        
        // Update existing nodes
        newNodes.forEach(newNode => {
          const existingNode = nodes.value.find(n => n.id === newNode.id);
          if (existingNode) {
            Object.assign(existingNode, {
              label: newNode.label,
              data: { ...newNode.data },
              position: { ...newNode.position }
            });
            updateNodeInternals([newNode.id]);
          }
        });
      }
      
      console.log('Nodes processed, current count:', nodes.value.length);
      
      // Sync edges after nodes are updated
      if (newEdges && Array.isArray(newEdges) && nodes.value.length > 0) {
        const currentEdgeIds = new Set(edges.value.map(e => e.id));
        const newEdgeIds = new Set(newEdges.map(e => e.id));
        
        console.log('Current edges:', currentEdgeIds.size, 'New edges:', newEdgeIds.size);
        
        // Remove edges that are no longer in the new list
        const edgesToRemove = edges.value.filter(edge => !newEdgeIds.has(edge.id));
        if (edgesToRemove.length > 0) {
          console.log('Removing edges:', edgesToRemove.map(e => e.id));
          removeEdges(edgesToRemove);
        }
        
        // Add new edges that aren't already present
        const edgesToAdd = newEdges.filter(edge => !currentEdgeIds.has(edge.id));
        if (edgesToAdd.length > 0) {
          console.log('Processing new edges:', edgesToAdd.map(e => `${e.source}->${e.target}`));
          
          // Verify nodes exist and add handles
          const validEdges = edgesToAdd.filter(edge => {
            const sourceExists = nodes.value.some(node => node.id === edge.source);
            const targetExists = nodes.value.some(node => node.id === edge.target);
            
            if (!sourceExists || !targetExists) {
              console.warn(`Skipping edge ${edge.id}: source ${edge.source} exists: ${sourceExists}, target ${edge.target} exists: ${targetExists}`);
              return false;
            }
            
            return true;
          });
          
          console.log('Valid edges to add:', validEdges.length);
          
          const edgesWithHandles = validEdges.map(edge => {
            // If edge already has sourceHandle and targetHandle, use them
            if (edge.sourceHandle && edge.targetHandle) {
              console.log(`Edge ${edge.id} already has handles:`, edge.sourceHandle, '->', edge.targetHandle);
              return edge;
            }
            
            const sourceNode = nodes.value.find(n => n.id === edge.source);
            const targetNode = nodes.value.find(n => n.id === edge.target);
            
            let sourceHandle = edge.sourceHandle;
            let targetHandle = edge.targetHandle;
            
            if (!sourceHandle && sourceNode) {
              if (sourceNode.type === 'start') {
                sourceHandle = `${edge.source}-bottom`;
              } else if (sourceNode.type === 'gateway') {
                sourceHandle = `${edge.source}-right`;
              } else {
                sourceHandle = `${edge.source}-bottom`;
              }
            }
            
            if (!targetHandle && targetNode) {
              if (targetNode.type === 'end') {
                targetHandle = `${edge.target}-top`;
              } else {
                targetHandle = `${edge.target}-top`;
              }
            }
            
            console.log(`Generated handles for edge ${edge.id}:`, sourceHandle, '->', targetHandle);
            return { ...edge, sourceHandle, targetHandle };
          });
          
          if (edgesWithHandles.length > 0) {
            console.log('Adding edges with handles:', edgesWithHandles.length);
            addEdges([...edgesWithHandles]);
          }
        }
        
        // Update existing edges
        newEdges.forEach(newEdge => {
          const existingEdge = edges.value.find(e => e.id === newEdge.id);
          if (existingEdge) {
            Object.assign(existingEdge, {
              label: newEdge.label,
              sourceHandle: newEdge.sourceHandle,
              targetHandle: newEdge.targetHandle,
              style: newEdge.style ? { ...newEdge.style } : undefined
            });
          }
        });
      } else if (newEdges && Array.isArray(newEdges) && newEdges.length > 0) {
        console.warn('Cannot add edges: nodes not ready. Node count:', nodes.value.length);
      }
      
      console.log('Canvas sync completed - Final count: nodes:', nodes.value.length, 'edges:', edges.value.length);
      
    } catch (error) {
      console.error('Error during canvas sync:', error);
    }
  }, 50); // Small delay to allow any pending operations to complete
}
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
      @keyup.delete="onDeleteKeyPress"
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
  height: calc(100vh - 190px); /* Adjust based on new header/footer height */
  min-height: 500px;
  border: 1px solid #e2e8f0;
  border-radius: 0;
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
  font-size: 18px;
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