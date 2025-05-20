# Process Builder Technical Appendix

This document provides technical implementation details for developers working with the Process Builder system.

> For user documentation and usage guidelines, please refer to [Process Builder Documentation](USER_GUIDE.md)

## Architecture Overview

### Technology Stack
- **Frontend Framework**: Nuxt 3 / Vue 3
- **State Management**: Pinia
- **Flow Visualization**: Vue Flow
- **UI Framework**: Tailwind CSS
- **Icons**: Material Design Icons
- **Validation**: Zod
- **Form Components**: FormKit

### Key Dependencies
```json
{
  "@vue-flow/core": "^1.42.5",
  "@vue-flow/background": "^1.3.2",
  "@vue-flow/controls": "^1.1.2",
  "@vue-flow/minimap": "^1.5.3",
  "@pinia/nuxt": "^0.4.11",
  "@formkit/nuxt": "^1.5.5",
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
│   ├── GatewayConditionManager.vue # Gateway conditions UI
│   ├── ApiNodeConfiguration.vue  # API node configuration
│   ├── FormNodeConfiguration.vue # Form node configuration
│   ├── BusinessRuleConfiguration.vue # Business rule configuration
│   └── VariableManager.vue       # Process variables manager
stores/
├── processBuilder.js       # State management
└── variableStore.js        # Variable state management
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

## Enhanced Node Configuration Components

The following components implement the improved UI/UX for node configuration:

### 1. VariableManager.vue

The Variable Manager allows users to create, edit, and manage global process variables.

```vue
<template>
  <div class="variable-manager">
    <!-- Header with Add Button -->
    <div class="bg-gray-50 border-b border-gray-200 p-4">
      <div class="flex items-center justify-between">
        <div class="flex items-start">
          <div class="mr-4 text-blue-500 flex-shrink-0 mt-1">
            <Icon name="material-symbols:data-object" class="text-2xl" />
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-900">Process Variables</h3>
            <p class="mt-1 text-sm text-gray-500">
              Define and manage global variables to store and pass data within your process
            </p>
          </div>
        </div>
        <RsButton
          @click="() => { resetForm(); showAddVariable = true; }"
          variant="primary"
          size="sm"
        >
          <Icon name="material-symbols:add" class="mr-1" />
          Add Variable
        </RsButton>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="px-4 pt-3 pb-2">
      <div class="relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon name="material-symbols:search" class="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          v-model="searchQuery"
          class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Search variables..."
        />
      </div>
    </div>

    <!-- Variable List with Empty States -->
    <div class="p-4 overflow-auto flex-grow">
      <!-- Empty State -->
      <div v-if="!variables.length" class="text-center py-10 px-4 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
        <!-- ... empty state UI ... -->
      </div>

      <!-- Variable List -->
      <div v-else-if="filteredVariables.length" class="space-y-3">
        <!-- Variable Card Design -->
        <div
          v-for="variable in filteredVariables"
          :key="variable.name"
          class="variable-item"
        >
          <!-- ... variable card UI ... -->
        </div>
      </div>

      <!-- No search results -->
      <div v-else class="text-center py-8">
        <!-- ... no results UI ... -->
      </div>
    </div>

    <!-- Add/Edit Variable Modal -->
    <RsModal
      v-model="showAddVariable"
      :title="editingVariable ? 'Edit Variable' : 'Add Variable'"
      size="md"
      :hideFooter="true"
      :overlayClose="false"
    >
      <!-- ... modal content with FormKit ... -->
    </RsModal>
  </div>
</template>
```

### 2. BusinessRuleConfiguration.vue

The Business Rule Configuration component provides a stepped workflow for configuring rule nodes.

```vue
<template>
  <div>
    <!-- Header with descriptive info -->
    <div class="bg-purple-50 p-4 border-b border-purple-200">
      <div class="flex items-start">
        <div class="mr-4 text-purple-500 flex-shrink-0 mt-1">
          <Icon name="material-symbols:rule" class="text-2xl" />
        </div>
        <div>
          <h3 class="text-lg font-medium text-gray-900">Business Rule Configuration</h3>
          <p class="mt-1 text-sm text-gray-500">
            Define conditional logic to control process flow based on data values
          </p>
        </div>
      </div>
    </div>

    <!-- Step-by-step configuration -->
    <div class="p-4">
      <!-- Progress steps -->
      <div class="flex items-center mb-6">
        <div class="flex-1">
          <button
            @click="activeStep = 1"
            :class="['step-button', activeStep === 1 ? 'active-step' : '']"
          >
            <span class="step-number">1</span>
            <span class="step-text">Define Variables</span>
          </button>
        </div>
        <div class="step-connector"></div>
        <div class="flex-1">
          <button
            @click="activeStep = 2"
            :class="['step-button', activeStep === 2 ? 'active-step' : '']"
          >
            <span class="step-number">2</span>
            <span class="step-text">Create Rules</span>
          </button>
        </div>
        <div class="step-connector"></div>
        <div class="flex-1">
          <button
            @click="activeStep = 3"
            :class="['step-button', activeStep === 3 ? 'active-step' : '']"
          >
            <span class="step-number">3</span>
            <span class="step-text">Define Actions</span>
          </button>
        </div>
      </div>

      <!-- Step content -->
      <div v-if="activeStep === 1">
        <!-- Variable selection UI -->
        <div class="space-y-4">
          <h4 class="font-medium text-gray-900">Select Process Variables</h4>
          <p class="text-sm text-gray-500">Choose variables to use in your business rules</p>
          
          <div class="variable-selector border border-gray-200 rounded-md p-4 bg-white">
            <!-- Variable list with checkboxes -->
            <div v-for="variable in availableVariables" :key="variable.name" class="py-2 flex items-center">
              <input 
                type="checkbox" 
                :id="variable.name" 
                v-model="selectedVariables" 
                :value="variable.name"
                class="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <label :for="variable.name" class="ml-2 text-sm text-gray-700 flex items-center">
                {{ variable.name }}
                <RsBadge :variant="getTypeColor(variable.type)" size="sm" class="ml-2">
                  {{ variable.type }}
                </RsBadge>
              </label>
            </div>
            
            <!-- Empty state -->
            <div v-if="!availableVariables.length" class="text-center py-4">
              <p class="text-sm text-gray-500 mb-2">No variables available</p>
              <RsButton @click="openVariableManager" size="sm" variant="tertiary">
                <Icon name="material-symbols:add" class="mr-1" />
                Add Variables
              </RsButton>
            </div>
          </div>
          
          <!-- Navigation buttons -->
          <div class="flex justify-end mt-4">
            <RsButton @click="activeStep = 2" variant="primary" :disabled="!selectedVariables.length">
              Continue
              <Icon name="material-symbols:arrow-forward" class="ml-1" />
            </RsButton>
          </div>
        </div>
      </div>
      
      <div v-else-if="activeStep === 2">
        <!-- Rule creation UI -->
        <div class="space-y-4">
          <h4 class="font-medium text-gray-900">Create Conditional Rules</h4>
          <p class="text-sm text-gray-500">Define the conditions that will trigger specific actions</p>
          
          <!-- Rule builder -->
          <div class="rules-builder bg-white border border-gray-200 rounded-md p-4">
            <div v-for="(rule, index) in rules" :key="index" class="rule-group mb-4 p-3 bg-purple-50 rounded-md border border-purple-200">
              <!-- Rule header -->
              <div class="flex justify-between items-center mb-2">
                <h5 class="font-medium text-purple-700">Rule {{ index + 1 }}</h5>
                <button @click="removeRule(index)" class="text-gray-400 hover:text-red-500">
                  <Icon name="material-symbols:delete" class="w-4 h-4" />
                </button>
              </div>
              
              <!-- Condition builder -->
              <div class="space-y-2">
                <div v-for="(condition, condIndex) in rule.conditions" :key="condIndex" class="flex items-center gap-2">
                  <select 
                    v-model="condition.variable" 
                    class="form-select rounded-md text-sm border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  >
                    <option value="" disabled>Select variable</option>
                    <option v-for="v in selectedVariables" :key="v" :value="v">{{ v }}</option>
                  </select>
                  
                  <select 
                    v-model="condition.operator" 
                    class="form-select rounded-md text-sm border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  >
                    <option value="" disabled>Select operator</option>
                    <option value="equals">equals</option>
                    <option value="notEquals">not equals</option>
                    <option value="greaterThan">greater than</option>
                    <option value="lessThan">less than</option>
                    <option value="contains">contains</option>
                  </select>
                  
                  <input 
                    v-model="condition.value" 
                    type="text" 
                    placeholder="Value" 
                    class="form-input rounded-md text-sm border-gray-300 focus:border-purple-500 focus:ring-purple-500 flex-1"
                  />
                  
                  <button @click="removeCondition(rule, condIndex)" class="text-gray-400 hover:text-red-500 p-1">
                    <Icon name="material-symbols:remove" class="w-4 h-4" />
                  </button>
                </div>
                
                <button @click="addCondition(rule)" class="text-purple-600 hover:text-purple-700 text-sm flex items-center">
                  <Icon name="material-symbols:add" class="w-4 h-4 mr-1" />
                  Add condition
                </button>
              </div>
            </div>
            
            <button @click="addRule" class="mt-2 text-purple-600 hover:text-purple-700 text-sm flex items-center">
              <Icon name="material-symbols:add" class="w-4 h-4 mr-1" />
              Add Rule
            </button>
          </div>
          
          <!-- Navigation buttons -->
          <div class="flex justify-between mt-4">
            <RsButton @click="activeStep = 1" variant="tertiary">
              <Icon name="material-symbols:arrow-back" class="mr-1" />
              Back
            </RsButton>
            <RsButton @click="activeStep = 3" variant="primary" :disabled="!hasValidRules">
              Continue
              <Icon name="material-symbols:arrow-forward" class="ml-1" />
            </RsButton>
          </div>
        </div>
      </div>
      
      <div v-else-if="activeStep === 3">
        <!-- Action definition UI -->
        <div class="space-y-4">
          <h4 class="font-medium text-gray-900">Define Actions</h4>
          <p class="text-sm text-gray-500">Specify what happens when rules are triggered</p>
          
          <!-- Actions configuration -->
          <div class="actions-config bg-white border border-gray-200 rounded-md p-4">
            <div v-for="(rule, index) in rules" :key="index" class="mb-4 p-3 bg-purple-50 rounded-md border border-purple-200">
              <h5 class="font-medium text-purple-700 mb-2">Rule {{ index + 1 }} Actions</h5>
              
              <!-- Action type selection -->
              <div class="mb-3">
                <label class="block text-sm font-medium text-gray-700 mb-1">Action Type</label>
                <select 
                  v-model="rule.actionType" 
                  class="form-select w-full rounded-md text-sm border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                >
                  <option value="setVariable">Set Variable Value</option>
                  <option value="executeFunction">Execute Function</option>
                  <option value="triggerEvent">Trigger Event</option>
                </select>
              </div>
              
              <!-- Action config based on type -->
              <div v-if="rule.actionType === 'setVariable'" class="space-y-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Target Variable</label>
                  <select 
                    v-model="rule.targetVariable" 
                    class="form-select w-full rounded-md text-sm border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  >
                    <option value="" disabled>Select variable</option>
                    <option v-for="v in availableVariables" :key="v.name" :value="v.name">{{ v.name }}</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">New Value</label>
                  <input 
                    v-model="rule.targetValue" 
                    type="text" 
                    placeholder="Value expression" 
                    class="form-input w-full rounded-md text-sm border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
              </div>
              
              <!-- Other action type configurations -->
            </div>
          </div>
          
          <!-- Navigation buttons -->
          <div class="flex justify-between mt-4">
            <RsButton @click="activeStep = 2" variant="tertiary">
              <Icon name="material-symbols:arrow-back" class="mr-1" />
              Back
            </RsButton>
            <RsButton @click="saveRules" variant="primary" :disabled="!isFormValid">
              <Icon name="material-symbols:save" class="mr-1" />
              Save Rules
            </RsButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useVariableStore } from '~/stores/variableStore';

const variableStore = useVariableStore();
const activeStep = ref(1);
const selectedVariables = ref([]);
const rules = ref([]);

// Get available variables from the store
const availableVariables = computed(() => {
  return variableStore.getAllVariables.global || [];
});

// Computed property to check if rules are valid
const hasValidRules = computed(() => {
  if (!rules.value.length) return false;
  
  return rules.value.every(rule => {
    return rule.conditions.length > 0 && 
           rule.conditions.every(c => c.variable && c.operator && c.value !== '');
  });
});

// Computed property to check if form is valid for submission
const isFormValid = computed(() => {
  if (!hasValidRules.value) return false;
  
  return rules.value.every(rule => {
    if (rule.actionType === 'setVariable') {
      return rule.targetVariable && rule.targetValue !== '';
    }
    // Add validation for other action types
    return true;
  });
});

// Add a new rule
const addRule = () => {
  rules.value.push({
    conditions: [{ variable: '', operator: '', value: '' }],
    actionType: 'setVariable',
    targetVariable: '',
    targetValue: ''
  });
};

// Remove a rule
const removeRule = (index) => {
  rules.value.splice(index, 1);
};

// Add a condition to a rule
const addCondition = (rule) => {
  rule.conditions.push({ variable: '', operator: '', value: '' });
};

// Remove a condition from a rule
const removeCondition = (rule, index) => {
  rule.conditions.splice(index, 1);
};

// Open variable manager
const openVariableManager = () => {
  // Implementation to open the variable manager modal
};

// Get color for variable type badge
const getTypeColor = (type) => {
  switch (type) {
    case 'string': return 'blue';
    case 'int': 
    case 'decimal': return 'purple';
    case 'object': return 'emerald';
    case 'datetime':
    case 'date': return 'amber';
    case 'boolean': return 'indigo';
    default: return 'gray';
  }
};

// Save the rules
const saveRules = () => {
  // Emit event with rule configuration
  emit('save', {
    rules: rules.value,
    variables: selectedVariables.value
  });
};

// Initialize with existing configuration if available
const init = (config) => {
  if (config) {
    selectedVariables.value = config.variables || [];
    rules.value = config.rules || [];
    activeStep.value = 1; // Reset to first step
  }
};

// Initialize on component mount if props are provided
onMounted(() => {
  if (props.initialConfig) {
    init(props.initialConfig);
  }
});
</script>

### 3. GatewayConditionManager.vue

The Gateway Condition Manager provides an enhanced UI for decision point configuration.

```vue
<template>
  <div>
    <!-- Header with descriptive info -->
    <div class="bg-orange-50 p-4 border-b border-orange-200">
      <div class="flex items-start">
        <div class="mr-4 text-orange-500 flex-shrink-0 mt-1">
          <Icon name="material-symbols:call-split" class="text-2xl" />
        </div>
        <div>
          <h3 class="text-lg font-medium text-gray-900">Decision Point Configuration</h3>
          <p class="mt-1 text-sm text-gray-500">
            Create multiple paths with conditions to direct process flow
          </p>
        </div>
      </div>
    </div>

    <!-- Path management -->
    <div class="p-4">
      <!-- Path list with conditions -->
      <div class="space-y-4">
        <div v-for="(path, index) in paths" :key="index" class="path-item">
          <!-- Path configuration UI -->
        </div>
      </div>

      <!-- Add new path -->
      <div class="mt-4">
        <RsButton @click="addPath" variant="secondary" size="sm">
          <Icon name="material-symbols:add" class="mr-1" />
          Add Path
        </RsButton>
      </div>

      <!-- Default path configuration -->
      <div class="mt-6 p-4 bg-gray-50 rounded-md border border-gray-200">
        <h4 class="font-medium text-gray-700 mb-2">Default Path</h4>
        <p class="text-sm text-gray-500 mb-4">
          This path will be followed when no other path conditions are met
        </p>
        <!-- Default path settings -->
      </div>
    </div>
  </div>
</template>
```

### 4. ApiNodeConfiguration.vue

The API Node Configuration component provides a stepped interface for configuring API calls.

```vue
<template>
  <div>
    <!-- Header with descriptive info -->
    <div class="bg-indigo-50 p-4 border-b border-indigo-200">
      <div class="flex items-start">
        <div class="mr-4 text-indigo-500 flex-shrink-0 mt-1">
          <Icon name="material-symbols:api" class="text-2xl" />
        </div>
        <div>
          <h3 class="text-lg font-medium text-gray-900">API Configuration</h3>
          <p class="mt-1 text-sm text-gray-500">
            Configure external API calls to integrate with other systems
          </p>
        </div>
      </div>
    </div>

    <!-- Step-by-step configuration -->
    <div class="p-4">
      <!-- Progress steps -->
      <div class="flex items-center mb-6">
        <!-- Step indicators -->
      </div>

      <!-- Step content -->
      <div v-if="activeStep === 1">
        <!-- Endpoint configuration -->
      </div>
      <div v-else-if="activeStep === 2">
        <!-- Request mapping -->
      </div>
      <div v-else-if="activeStep === 3">
        <!-- Response mapping -->
      </div>
    </div>
  </div>
</template>
```

### 5. FormNodeConfiguration.vue

The Form Node Configuration component provides a stepped interface for configuring form interactions.

```vue
<template>
  <div>
    <!-- Header with descriptive info -->
    <div class="bg-emerald-50 p-4 border-b border-emerald-200">
      <div class="flex items-start">
        <div class="mr-4 text-emerald-500 flex-shrink-0 mt-1">
          <Icon name="material-symbols:database-form" class="text-2xl" />
        </div>
        <div>
          <h3 class="text-lg font-medium text-gray-900">Form Configuration</h3>
          <p class="mt-1 text-sm text-gray-500">
            Connect process flow with user forms for data collection and display
          </p>
        </div>
      </div>
    </div>

    <!-- Step-by-step configuration -->
    <div class="p-4">
      <!-- Progress steps -->
      <div class="flex items-center mb-6">
        <!-- Step indicators -->
      </div>

      <!-- Step content -->
      <div v-if="activeStep === 1">
        <!-- Form selection -->
      </div>
      <div v-else-if="activeStep === 2">
        <!-- Data mapping -->
      </div>
      <div v-else-if="activeStep === 3">
        <!-- Options configuration -->
      </div>
    </div>
  </div>
</template>
```

## State Management

The project uses Pinia for state management. Key stores include:

### variableStore.js

```javascript
import { defineStore } from 'pinia';

export const useVariableStore = defineStore('variables', {
  state: () => ({
    variables: {
      global: [],
      local: {}
    }
  }),
  
  getters: {
    getAllVariables: (state) => state.variables,
    getVariableByName: (state) => (name, scope = 'global') => {
      if (scope === 'global') {
        return state.variables.global.find(v => v.name === name);
      } else {
        return state.variables.local[scope]?.find(v => v.name === name);
      }
    }
  },
  
  actions: {
    addVariable(variable) {
      const { scope = 'global' } = variable;
      
      if (scope === 'global') {
        this.variables.global.push(variable);
      } else {
        if (!this.variables.local[scope]) {
          this.variables.local[scope] = [];
        }
        this.variables.local[scope].push(variable);
      }
    },
    
    updateVariable(name, updatedVariable, scope = 'global') {
      if (scope === 'global') {
        const index = this.variables.global.findIndex(v => v.name === name);
        if (index !== -1) {
          this.variables.global[index] = { ...updatedVariable };
        }
      } else {
        if (this.variables.local[scope]) {
          const index = this.variables.local[scope].findIndex(v => v.name === name);
          if (index !== -1) {
            this.variables.local[scope][index] = { ...updatedVariable };
          }
        }
      }
    },
    
    deleteVariable(name, scope = 'global') {
      if (scope === 'global') {
        this.variables.global = this.variables.global.filter(v => v.name !== name);
      } else if (this.variables.local[scope]) {
        this.variables.local[scope] = this.variables.local[scope].filter(v => v.name !== name);
      }
    }
  }
});
```

## UI Component Styling

The project uses Tailwind CSS for styling with consistent patterns:

### Color Theming by Component Type

Each node type has a consistent color theme:

- **Business Rules**: Purple
- **API Tasks**: Indigo
- **Form Tasks**: Emerald
- **Decision Points**: Orange
- **Variables**: Blue

### Common Visual Elements

1. **Modal Headers**:
```html
<div class="bg-{color}-50 p-4 border-b border-{color}-200">
  <div class="flex items-start">
    <div class="mr-4 text-{color}-500 flex-shrink-0 mt-1">
      <Icon name="material-symbols:{icon}" class="text-2xl" />
    </div>
    <div>
      <h3 class="text-lg font-medium text-gray-900">{Title}</h3>
      <p class="mt-1 text-sm text-gray-500">{Description}</p>
    </div>
  </div>
</div>
```

2. **Step Indicators**:
```html
<div class="flex items-center mb-6">
  <div class="flex-1">
    <button
      @click="activeStep = 1"
      :class="['step-button', activeStep === 1 ? 'active-step' : '']"
    >
      <span class="step-number">1</span>
      <span class="step-text">{Step Name}</span>
    </button>
  </div>
  <div class="step-connector"></div>
  <!-- Additional steps -->
</div>
```

3. **Empty States**:
```html
<div class="text-center py-10 px-4 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
  <Icon
    name="material-symbols:{icon}"
    class="w-14 h-14 mx-auto mb-3 text-gray-400"
  />
  <h4 class="text-base font-medium text-gray-900 mb-1">
    {Empty State Title}
  </h4>
  <p class="text-sm text-gray-500 mb-4 max-w-md mx-auto">
    {Empty State Description}
  </p>
  <RsButton
    @click="primaryAction"
    variant="primary"
    size="md"
  >
    <Icon name="material-symbols:add" class="mr-1" />
    {Action Text}
  </RsButton>
</div>
```

## Best Practices for Development

When developing new components or enhancing existing ones:

1. **Consistent Design Pattern**:
   - Follow the established design patterns for node configurations
   - Use the same structure for headers, step indicators, and action buttons
   - Maintain the color coding system for different node types

2. **Responsive Components**:
   - Ensure all components work on various screen sizes
   - Use responsive utilities from Tailwind
   - Test on mobile and desktop views

3. **State Management**:
   - Store node configuration in the appropriate Pinia store
   - Use reactive Vue 3 patterns with `ref`, `computed`, etc.
   - Implement proper validation before saving

4. **Accessibility**:
   - Ensure all UI elements are keyboard accessible
   - Use semantic HTML elements
   - Maintain proper focus management in modals

5. **Data Flow Visualization**:
   - Use visual indicators to show data flow direction
   - Provide clear feedback on how variables are used
   - Highlight connections between nodes

---

For user documentation and usage guidelines, please refer to [Process Builder Documentation](USER_GUIDE.md).

Last updated: July 10, 2024 