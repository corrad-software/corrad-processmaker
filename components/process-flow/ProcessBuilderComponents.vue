<template>
  <div class="process-components">
    <!-- Search Bar -->
    <div class="search-container p-3 mb-2">
      <div class="relative">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search..."
          class="w-full px-3 py-2 pl-9 bg-white border border-gray-300 rounded text-gray-700 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <Icon
          name="material-symbols:search"
          class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
        />
      </div>
    </div>

    <!-- Core Components -->
    <div class="component-category mb-6">
      <h3 class="text-gray-700 text-sm font-medium px-3 mb-2">Core Components</h3>
      <div class="grid grid-cols-2 gap-1 px-2">
        <div
          v-for="component in getComponentsByCategory('Core')"
          :key="component.type"
          class="component-item rounded p-2 flex flex-col items-center justify-center cursor-grab hover:bg-gray-100 transition-colors border border-gray-200"
          :class="{ 'hidden': !matchesSearch(component) }"
          draggable="true"
          @dragstart="onDragStart($event, component)"
          @click="addComponent(component)"
        >
          <Icon :name="component.icon" class="mb-1 w-5 h-5 text-gray-600" />
          <span class="text-xs text-gray-600 text-center">{{ component.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['add-component']);
const searchQuery = ref('');

// Define basic process components aligned with BPMN notation
const availableComponents = [
  // Core components
  {
    type: 'start',
    name: 'Start Point',
    category: 'Core',
    icon: 'material-symbols:play-circle-outline',
    description: 'Initiates the process flow',
    defaultProps: {
      label: 'Start',
      data: {
        description: 'Process start point'
      }
    }
  },
  {
    type: 'end',
    name: 'End Point',
    category: 'Core',
    icon: 'material-symbols:stop-circle-outline',
    description: 'Terminates the process flow',
    defaultProps: {
      label: 'End',
      data: {
        description: 'Process end point'
      }
    }
  },
  {
    type: 'task',
    name: 'Task',
    category: 'Core',
    icon: 'material-symbols:assignment-outline',
    description: 'Manual or automated task',
    defaultProps: {
      label: 'Task',
      data: {
        description: 'A general task',
        assignee: ''
      }
    }
  },
  {
    type: 'form',
    name: 'Form Task',
    category: 'Core',
    icon: 'material-symbols:description-outline',
    description: 'Form to be filled out',
    defaultProps: {
      label: 'Form Task',
      data: {
        description: 'Form submission task',
        formId: null,
        formName: null
      }
    }
  },
  {
    type: 'api',
    name: 'API Call',
    category: 'Core',
    icon: 'material-symbols:api',
    description: 'Make external API calls',
    defaultProps: {
      label: 'API Call',
      data: {
        description: 'External API call',
        apiMethod: 'GET',
        apiUrl: '',
        requestBody: '',
        headers: '{ "Content-Type": "application/json" }',
        outputVariable: 'apiResponse',
        continueOnError: false,
        errorVariable: 'apiError'
      }
    }
  },
  {
    type: 'business-rule',
    name: 'Business Rule',
    category: 'Core',
    icon: 'material-symbols:rule',
    description: 'Apply business rules to process data',
    defaultProps: {
      label: 'Business Rule',
      data: {
        description: 'Applies business rules to process data',
        conditions: [],
        actions: [],
        priority: 'medium'
      }
    }
  },
  {
    type: 'gateway',
    name: 'Decision Point',
    category: 'Core',
    icon: 'material-symbols:call-split',
    description: 'Decision point for flow control',
    defaultProps: {
      label: 'Decision Point',
      data: {
        description: 'Decision point for branching the workflow',
        conditions: [],
        defaultPath: 'Default'
      }
    }
  }
];

// Get components by category for rendering in sections
const getComponentsByCategory = (category) => {
  return availableComponents.filter(component => component.category === category);
};

// Check if component matches search query
const matchesSearch = (component) => {
  if (!searchQuery.value) return true;
  
  const query = searchQuery.value.toLowerCase();
  return (
    component.name.toLowerCase().includes(query) ||
    component.description.toLowerCase().includes(query) ||
    component.type.toLowerCase().includes(query)
  );
};

// Handle drag start event
const onDragStart = (event, component) => {
  // Set the component data in the format expected by ProcessFlowCanvas
  const componentData = {
    type: component.type,
    label: component.defaultProps.label,
    data: component.defaultProps.data
  };
  
  // Set the drag data with text/plain format for better Mac compatibility
  event.dataTransfer.effectAllowed = 'copy';
  event.dataTransfer.dropEffect = 'copy';
  event.dataTransfer.setData('text/plain', JSON.stringify(componentData));
  
  // Add visual feedback
  event.target.classList.add('dragging');
};

// Add a component directly via click
const addComponent = (component) => {
  // Use same format as drag operation for consistency
  const componentData = {
    type: component.type,
    label: component.defaultProps.label,
    data: component.defaultProps.data
  };
  
  emit('add-component', componentData);
};
</script>

<style scoped>
.process-components {
  @apply bg-white h-full;
}

.component-item {
  @apply h-20;
  transition: all 0.15s ease-in-out;
}

.component-item:hover {
  transform: translateY(-2px);
}

.component-item:active {
  transform: scale(0.97);
}
</style> 