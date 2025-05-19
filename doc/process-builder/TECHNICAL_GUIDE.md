# Process Builder Technical Appendix

This document provides technical implementation details for developers working with the Process Builder system.

> For user documentation and usage guidelines, please refer to [Process Builder Documentation](PROCESS_BUILDER_DOCUMENTATION.md)

## Architecture Overview

### Technology Stack
- **Frontend Framework**: Nuxt 3 / Vue 3
- **State Management**: Pinia
- **Flow Visualization**: Vue Flow
- **UI Framework**: Tailwind CSS
- **Icons**: Material Design Icons
- **Validation**: Zod

### Key Dependencies
```json
{
  "@vue-flow/core": "^1.42.5",
  "@vue-flow/background": "^1.3.2",
  "@vue-flow/controls": "^1.1.2",
  "@vue-flow/minimap": "^1.5.3",
  "@pinia/nuxt": "^0.4.11",
  "uuid": "^10.0.0",
  "zod": "^3.22.2"
}
```

## Project Structure

```
pages/
├── process-builder/
│   ├── index.vue           # Main builder interface
│   └── manage.vue          # Process management
components/
├── process-flow/
│   ├── ProcessFlowCanvas.vue     # Flow canvas
│   ├── ProcessFlowNodes.js       # Custom node types
│   ├── FormSelector.vue          # Form selection component
│   └── GatewayConditionManager.vue # Gateway conditions UI
stores/
└── processBuilder.js       # State management
composables/
└── useProcessValidation.js # Process validation
types/
└── process-builder.d.ts    # TypeScript definitions
```

## Component Architecture

### Core Components

1. **ProcessFlowCanvas.vue**
```vue
<script setup>
import { ref, onMounted } from 'vue';
import { VueFlow, useVueFlow, Panel } from '@vue-flow/core';
import { Background } from '@vue-flow/background';
import { Controls } from '@vue-flow/controls';
import { MiniMap } from '@vue-flow/minimap';
import { nodeTypes } from './ProcessFlowNodes';

// Initialize Vue Flow with options
const {
  nodes,
  edges,
  addNodes,
  addEdges,
  removeNodes,
  removeEdges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  fitView,
  project
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

// Flow configuration
const flowOptions = {
  defaultZoom: 1,
  minZoom: 0.2,
  maxZoom: 4,
  fitViewOnInit: true,
  snapToGrid: true,
  snapGrid: [15, 15],
  connectionMode: 'loose',
  elementsSelectable: true,
  nodesDraggable: true,
  nodesConnectable: true
};

// Event handlers for node/edge changes
onNodesChange((changes) => {
  emit('nodesChange', changes, nodes.value);
});

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
    animated: true
  };

  addEdges([newEdge]);
};

// Handle node deletion
const onNodeDelete = (event) => {
  if (event && event.node) {
    removeNodes([event.node]);
    emit('nodesChange', nodes.value);
  }
};

// Handle edge deletion
const onEdgeDelete = (event) => {
  if (event && event.edge) {
    removeEdges([event.edge]);
    emit('edgesChange', edges.value);
  }
};

// Handle delete key press
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
</script>
```

2. **ProcessFlowNodes.js**
```javascript
import { h, markRaw } from 'vue';
import { Handle, Position } from '@vue-flow/core';

// Custom node renderer with handles
const CustomNode = markRaw({
  template: `
    <div :class="['custom-node', 'node-' + type]">
      <Handle
        v-if="type !== 'start'"
        type="target"
        position="top"
      />
      
      <div class="custom-node-header">
        <div class="custom-node-icon">
          <slot name="icon"></slot>
        </div>
        <div class="custom-node-title">{{ label }}</div>
      </div>
      
      <div class="custom-node-content">
        <slot></slot>
      </div>

      <Handle
        v-if="type !== 'end'"
        type="source"
        position="bottom"
      />
    </div>
  `,
  props: ['id', 'type', 'label', 'data'],
  components: { Handle }
});

// Node type definitions
export const nodeTypes = markRaw({
  task: TaskNode,
  start: StartNode,
  end: EndNode,
  gateway: GatewayNode,
  form: FormNode,
  script: ScriptNode
});
```

3. **FormSelector.vue**
```vue
<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['update:modelValue', 'select']);

const forms = ref([]);
const loading = ref(false);
const error = ref(null);

// Load available forms from the API
const loadForms = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await fetch('/api/forms');
    if (!response.ok) throw new Error('Failed to load forms');
    
    const data = await response.json();
    forms.value = data.forms || [];
  } catch (err) {
    error.value = err.message;
    console.error('Error loading forms:', err);
  } finally {
    loading.value = false;
  }
};

// Select a form
const selectForm = (form) => {
  emit('update:modelValue', form.formID);
  emit('select', form);
};

// Clear form selection
const clearSelection = () => {
  emit('update:modelValue', null);
  emit('select', null);
};

// Load forms on component mount
onMounted(() => {
  loadForms();
});
</script>
```

## State Management

### Process Builder Store
```typescript
export const useProcessBuilderStore = defineStore('processBuilder', {
  state: () => ({
    processes: [],
    currentProcess: null,
    selectedNodeId: null,
    selectedEdgeId: null,
    history: [],
    historyIndex: -1,
    unsavedChanges: false
  }),
  
  getters: {
    selectedNode: (state) => {
      if (!state.currentProcess || !state.selectedNodeId) return null;
      return state.currentProcess.nodes.find(node => node.id === state.selectedNodeId);
    },
    
    selectedEdge: (state) => {
      if (!state.currentProcess || !state.selectedEdgeId) return null;
      return state.currentProcess.edges.find(edge => edge.id === state.selectedEdgeId);
    },
    
    hasUnsavedChanges: (state) => {
      return state.unsavedChanges;
    }
  },
  
  actions: {
    createProcess(name, description) {
      const process = {
        id: uuidv4(),
        name,
        description,
        nodes: [],
        edges: [],
        createdAt: new Date().toISOString()
      };
      this.processes.push(process);
      this.currentProcess = JSON.parse(JSON.stringify(process)); // Deep clone
      this.clearHistory();
      this.unsavedChanges = false;
    },
    
    addNode(node) {
      if (!this.currentProcess) return;

      const newNode = {
        id: node.id || uuidv4(),
        type: node.type,
        label: node.label || 'New Node',
        position: node.position || { x: 0, y: 0 },
        data: node.data || {}
      };

      this.currentProcess.nodes.push(newNode);
      this.selectedNodeId = newNode.id;
      this.saveToHistory('Add node');
      this.unsavedChanges = true;

      return newNode;
    },
    
    updateNode(nodeId, updates) {
      if (!this.currentProcess) return;

      const node = this.currentProcess.nodes.find(n => n.id === nodeId);
      if (node) {
        Object.assign(node, updates);
        this.saveToHistory('Update node');
        this.unsavedChanges = true;
      }
    },
    
    deleteNode(nodeId) {
      if (!this.currentProcess) return;

      const index = this.currentProcess.nodes.findIndex(n => n.id === nodeId);
      if (index !== -1) {
        // Remove the node
        this.currentProcess.nodes.splice(index, 1);
        
        // Remove any edges connected to this node
        const edgesToRemove = this.currentProcess.edges.filter(
          edge => edge.source === nodeId || edge.target === nodeId
        );
        
        edgesToRemove.forEach(edge => {
          const edgeIndex = this.currentProcess.edges.findIndex(e => e.id === edge.id);
          if (edgeIndex !== -1) {
            this.currentProcess.edges.splice(edgeIndex, 1);
          }
        });

        // Clear selection if the deleted node was selected
        if (this.selectedNodeId === nodeId) {
          this.selectedNodeId = null;
        }

        this.saveToHistory('Delete node');
        this.unsavedChanges = true;
        
        return true;
      }
      
      return false;
    }
  }
});
```

## Node Types and Styles

### Node Configuration
```typescript
interface NodeConfig {
  type: 'start' | 'end' | 'task' | 'form' | 'script' | 'gateway';
  label: string;
  icon: string;
  iconColor: string;
  data: {
    description?: string;
    assignee?: string;
    formId?: string;
    formName?: string;
    language?: string;
    conditions?: Condition[];
    defaultPath?: string;
  };
}

const nodeConfigs: Record<string, NodeConfig> = {
  start: {
    type: 'start',
    label: 'Start',
    icon: 'play_circle_filled',
    iconColor: 'text-green-500',
    data: { description: 'Process starts here' }
  },
  task: {
    type: 'task',
    label: 'Task',
    icon: 'assignment',
    iconColor: 'text-blue-500',
    data: { description: 'Task node', assignee: '' }
  },
  form: {
    type: 'form',
    label: 'Form Task',
    icon: 'description',
    iconColor: 'text-purple-500',
    data: { 
      description: 'Form submission task',
      formId: null,
      formName: null,
      formUuid: null
    }
  },
  // Additional node configurations...
};
```

## Connection Handling

### Connection Logic
```typescript
// Connection validation
function validateConnection(connection: Connection): boolean {
  if (!connection.source || !connection.target) return false;
  if (connection.source === connection.target) return false;
  
  const sourceNode = nodes.value.find(n => n.id === connection.source);
  const targetNode = nodes.value.find(n => n.id === connection.target);
  
  if (!sourceNode || !targetNode) return false;
  
  // Prevent connecting to start node's input or from end node's output
  if (targetNode.type === 'start') return false;
  if (sourceNode.type === 'end') return false;
  
  return true;
}

// Create new connection
function createConnection(connection: Connection): Edge {
  return {
    id: `${connection.source}-${connection.target}`,
    source: connection.source,
    target: connection.target,
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#555' }
  };
}
```

## Form Integration

### Form Task Implementation
```typescript
// Form task node implementation
const FormNode = markRaw({
  props: ['id', 'type', 'label', 'selected', 'data'],
  computed: {
    nodeLabel() {
      return this.label || (this.data && this.data.label) || 'Form Task';
    },
    formName() {
      return this.data?.formName || 'None selected';
    },
    hasForm() {
      return !!(this.data?.formId && this.data?.formName);
    }
  },
  render() {
    const badgeContent = this.hasForm ? 
      h('span', { class: 'node-badge bg-purple-100 text-purple-600 px-1 text-xs rounded' }, 'Form') : 
      null;
    
    return h(CustomNode, {
      id: this.id,
      type: 'form',
      label: this.nodeLabel,
      selected: this.selected,
      data: this.data,
      onClick: () => this.$emit('node-click', this.id)
    }, {
      icon: () => h('i', { class: 'material-icons text-purple-500' }, 'description'),
      badge: () => badgeContent,
      default: () => h('div', { class: 'node-details' }, [
        h('p', { class: 'node-description' }, this.data?.description || 'Form submission task'),
        h('div', { class: 'node-form-info' }, [
          h('span', { class: 'node-form-label' }, 'Form: '),
          h('span', { 
            class: this.hasForm ? 'node-form-value text-purple-600 font-medium' : 'node-form-value text-gray-400 italic' 
          }, this.formName)
        ])
      ])
    });
  }
});
```

### Form Selection in Process Builder
```vue
<!-- Form selection in process properties panel -->
<div v-if="selectedNodeData.type === 'form'" class="space-y-3">
  <FormSelector
    v-model="selectedNodeData.data.formId" 
    @select="handleFormSelection"
    @clear="clearFormSelection"
    :formId="selectedNodeData.data?.formId"
  />
</div>

<script setup>
// Form selection handler
const handleFormSelection = (form) => {
  if (selectedNodeData.value) {
    // Update all form-related data
    selectedNodeData.value.data = {
      ...selectedNodeData.value.data,
      formId: form.formID,
      formName: form.formName,
      formUuid: form.formUUID,
      label: form.formName,
      description: `Form: ${form.formName}`
    };
    
    // Also update the node's root label
    selectedNodeData.value.label = form.formName;
    
    // Update the node in store to trigger reactivity
    updateNodeInStore();
  }
};

// Clear form selection
const clearFormSelection = () => {
  if (selectedNodeData.value) {
    selectedNodeData.value.data = {
      ...selectedNodeData.value.data,
      formId: null,
      formName: '',
      formUuid: null,
      label: 'Form Task',
      description: 'Form submission task'
    };
    
    // Reset the node's root label
    selectedNodeData.value.label = 'Form Task';
    
    // Update the node in store
    updateNodeInStore();
  }
};
</script>
```

## Decision Point/Gateway Node

### Gateway Node Implementation
```typescript
// Decision/Gateway node
export const GatewayNode = markRaw({
  props: ['id', 'type', 'label', 'selected', 'data'],
  computed: {
    nodeLabel() {
      return this.label || (this.data && this.data.label) || 'Decision Point';
    },
    
    totalPaths() {
      return Array.isArray(this.data?.conditions) ? this.data.conditions.length : 0;
    },
    
    totalConditions() {
      if (!Array.isArray(this.data?.conditions)) return 0;
      
      return this.data.conditions.reduce((total, group) => {
        return total + (Array.isArray(group.conditions) ? group.conditions.length : 0);
      }, 0);
    },
    
    conditionSummary() {
      if (this.totalPaths === 0) return 'No paths';
      
      const paths = this.data.conditions
        .map(group => group.output || 'Unlabeled')
        .filter(Boolean)
        .join(', ');
        
      return paths || 'Unconfigured paths';
    }
  },
  render() {
    // Create the badge content
    const badgeContent = h('span', { 
      class: 'node-badge bg-orange-100 text-orange-600 px-1 text-xs rounded absolute -top-5 left-1/2 transform -translate-x-1/2 whitespace-nowrap'
    }, `${this.totalPaths} path${this.totalPaths !== 1 ? 's' : ''}`);

    return h(CustomNode, {
      id: this.id,
      type: 'gateway',
      label: this.nodeLabel,
      selected: this.selected,
      data: this.data,
      onClick: () => this.$emit('node-click', this.id)
    }, {
      icon: () => h('i', { class: 'material-icons text-orange-500' }, 'call_split'),
      badge: () => badgeContent,
      default: () => h('div', { class: 'gateway-details' }, [
        h('div', { class: 'node-conditions-value' }, this.conditionSummary)
      ])
    });
  }
});
```

### Gateway Node Styling
```css
/* Gateway specific styles */
.node-gateway {
  width: 120px !important;
  height: 120px !important;
  background: white;
  transform: rotate(45deg);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 2px solid #f97316;
  position: relative;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.node-gateway:hover {
  border-color: #ea580c;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.node-gateway .custom-node-content {
  position: absolute;
  transform: rotate(-45deg);
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px;
}

.node-gateway .custom-node-title {
  font-size: 12px;
  font-weight: 500;
  color: #333;
  margin: 0;
  text-align: center;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}

.node-gateway .gateway-details {
  width: 100%;
  text-align: center;
  margin-top: 4px;
}

.node-gateway .node-conditions-value {
  font-size: 11px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
  line-height: 1.2;
}

.node-gateway .material-icons {
  font-size: 24px;
  color: #f97316;
  margin-bottom: 4px;
}

.node-gateway .node-badge {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%) rotate(-45deg);
  background-color: #fff7ed;
  border: 1px solid #fdba74;
  z-index: 10;
  font-size: 11px;
  padding: 2px 8px;
  white-space: nowrap;
  margin-top: 8px;
}

/* Position handles correctly for gateway node */
.handle-gateway-input {
  transform: translateY(-42px) !important;
  background-color: #f97316 !important;
  border: 2px solid white !important;
  width: 12px !important;
  height: 12px !important;
}

.handle-gateway-output {
  transform: translateY(42px) !important;
  background-color: #f97316 !important;
  border: 2px solid white !important;
  width: 12px !important;
  height: 12px !important;
}
```

### Gateway Condition Management
```typescript
// Handle condition update
const handleConditionUpdate = (conditions) => {
  if (selectedNodeData.value && selectedNodeData.value.type === 'gateway') {
    // Update conditions in the node data
    selectedNodeData.value.data = {
      ...selectedNodeData.value.data,
      conditions: conditions
    };
    
    // Update edges with new condition outputs
    if (processStore.currentProcess?.edges) {
      const updatedEdges = processStore.currentProcess.edges.map(edge => {
        if (edge.source === selectedNodeData.value.id) {
          // Find matching condition group
          const matchingGroup = conditions.find(group => group.output === edge.label);
          if (!matchingGroup) {
            // If no matching group found, update edge label to default
            return {
              ...edge,
              label: selectedNodeData.value.data.defaultPath || 'Default'
            };
          }
        }
        return edge;
      });
      
      // Update edges in store
      processStore.currentProcess.edges = updatedEdges;
    }
    
    // Update the node in store
    updateNodeInStore();
  }
};
```

## Event Handling

### Node Events
```typescript
// Node selection
function onNodeClick({ node }): void {
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

    selectedNode.value = nodeData;
    emit('nodeSelected', nodeData);
  } catch (error) {
    console.error('Error processing node data:', error);
  }
}

// Node deletion
function onNodeDelete(event): void {
  // Check if we have a node in the event
  if (event && event.node) {
    removeNodes([event.node]);
    emit('nodesChange', nodes.value);
  }
}

// Handle delete key press
function onDeleteKeyPress(): void {
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
}
```

### Edge Events
```typescript
// Edge selection
function onEdgeClick(event, edge): void {
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
}

// Edge deletion
function onEdgeDelete(event): void {
  if (event && event.edge) {
    removeEdges([event.edge]);
    emit('edgesChange', edges.value);
  }
}
```

## Development Guidelines

### Best Practices
1. Use Vue Flow's built-in features instead of custom implementations
2. Handle all node/edge updates through the store
3. Maintain proper typings for all components
4. Follow Vue 3 Composition API patterns
5. Implement proper validation for all process changes

### Performance Considerations
1. Use `markRaw` for node components
2. Minimize reactive wrapping of node data
3. Use proper key bindings for lists
4. Implement efficient node filtering
5. Optimize canvas rendering

### Error Handling
1. Validate all connections before creation
2. Handle edge cases in node operations
3. Provide meaningful error messages
4. Implement proper error boundaries
5. Log errors appropriately

---

For user documentation and usage guidelines, please refer to [Process Builder Documentation](PROCESS_BUILDER_DOCUMENTATION.md).

Last updated: June 10, 2024 