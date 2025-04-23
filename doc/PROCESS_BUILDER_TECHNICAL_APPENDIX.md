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
│   └── ProcessFlowNodes.js       # Custom node types
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

## State Management

### Process Builder Store
```typescript
export const useProcessBuilderStore = defineStore('processBuilder', {
  state: () => ({
    processes: [],
    currentProcess: null,
    selectedNodeId: null,
    selectedEdgeId: null,
    unsavedChanges: false
  }),
  
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
      this.currentProcess = process;
    },
    
    updateNode(nodeData) {
      if (!this.currentProcess || !nodeData.id) return;
      
      const nodeIndex = this.currentProcess.nodes.findIndex(
        node => node.id === nodeData.id
      );
      
      if (nodeIndex > -1) {
        this.currentProcess.nodes[nodeIndex] = {
          ...this.currentProcess.nodes[nodeIndex],
          ...nodeData
        };
        this.unsavedChanges = true;
      }
    },
    
    // Additional actions...
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
    formName?: string;
    language?: string;
    conditions?: string[];
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

## Event Handling

### Node Events
```typescript
// Node selection
function onNodeClick(node: Node): void {
  selectedNode.value = node;
  emit('nodeSelected', node);
}

// Node deletion
function onNodeDelete(nodes: Node[]): void {
  removeNodes(nodes);
  emit('nodesChange', nodes.value);
}

// Node dragging
function onNodeDragStop(node: Node): void {
  updateNodePosition(node);
  emit('nodePositionChange', node);
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

Last updated: May 15, 2024 