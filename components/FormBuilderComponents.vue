<template>
  <div class="form-components">
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

    <!-- Basic Inputs Category -->
    <div class="component-category mb-6">
      <h3 class="text-gray-700 text-sm font-medium px-3 mb-2">Basic Inputs</h3>
      <div class="grid grid-cols-2 gap-1 px-2">
        <div
          v-for="component in getComponentsByCategory('Basic Inputs')"
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

    <!-- Selection Inputs Category -->
    <div class="component-category mb-6">
      <h3 class="text-gray-700 text-sm font-medium px-3 mb-2">Selection Inputs</h3>
      <div class="grid grid-cols-2 gap-1 px-2">
        <div
          v-for="component in getComponentsByCategory('Selection Inputs')"
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

    <!-- Date and Time Category -->
    <div class="component-category mb-6">
      <h3 class="text-gray-700 text-sm font-medium px-3 mb-2">Date and Time</h3>
      <div class="grid grid-cols-2 gap-1 px-2">
        <div
          v-for="component in getComponentsByCategory('Date and Time')"
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

    <!-- Advanced Category -->
    <div class="component-category mb-6">
      <h3 class="text-gray-700 text-sm font-medium px-3 mb-2">Advanced</h3>
      <div class="grid grid-cols-2 gap-1 px-2">
        <div
          v-for="component in getComponentsByCategory('Advanced')"
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

    <!-- Layout Category -->
    <div class="component-category mb-6">
      <h3 class="text-gray-700 text-sm font-medium px-3 mb-2">Layout</h3>
      <div class="grid grid-cols-2 gap-1 px-2">
        <div
          v-for="component in getComponentsByCategory('Layout')"
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

// Define available form components
const availableComponents = [
  // Basic inputs
  {
    type: 'text',
    name: 'Text Field',
    category: 'Basic Inputs',
    icon: 'material-symbols:text-fields',
    description: 'Single line text input',
    defaultProps: {
      type: 'text',
      placeholder: 'Enter text...',
      help: '',
      validation: ''
    }
  },
  {
    type: 'textarea',
    name: 'Text Area',
    category: 'Basic Inputs',
    icon: 'material-symbols:article-outline',
    description: 'Multi-line text input',
    defaultProps: {
      type: 'textarea',
      placeholder: 'Enter text...',
      help: '',
      validation: ''
    }
  },
  {
    type: 'number',
    name: 'Number',
    category: 'Basic Inputs',
    icon: 'material-symbols:counter-1-outline',
    description: 'Numeric input field',
    defaultProps: {
      type: 'number',
      placeholder: '0',
      help: '',
      validation: ''
    }
  },
  {
    type: 'email',
    name: 'Email',
    category: 'Basic Inputs',
    icon: 'material-symbols:mail-outline',
    description: 'Email address input',
    defaultProps: {
      type: 'email',
      placeholder: 'email@example.com',
      help: '',
      validation: 'email'
    }
  },
  {
    type: 'password',
    name: 'Password',
    category: 'Basic Inputs',
    icon: 'material-symbols:password',
    description: 'Password input field',
    defaultProps: {
      type: 'password',
      placeholder: 'Enter password...',
      help: '',
      validation: ''
    }
  },
  
  // Selection inputs
  {
    type: 'select',
    name: 'Select Dropdown',
    category: 'Selection Inputs',
    icon: 'material-symbols:arrow-drop-down-circle-outline',
    description: 'Dropdown select menu',
    defaultProps: {
      type: 'select',
      placeholder: 'Select an option',
      help: '',
      options: [
        { label: 'Option 1', value: 'option_1' },
        { label: 'Option 2', value: 'option_2' },
        { label: 'Option 3', value: 'option_3' }
      ],
      validation: ''
    }
  },
  {
    type: 'checkbox',
    name: 'Checkbox Group',
    category: 'Selection Inputs',
    icon: 'material-symbols:check-box-outline',
    description: 'Multiple checkbox options',
    defaultProps: {
      type: 'checkbox',
      label: 'Checkbox Group',
      name: 'checkbox',
      help: 'Select all that apply',
      options: [
        { label: 'Option 1', value: 'option_1' },
        { label: 'Option 2', value: 'option_2' },
        { label: 'Option 3', value: 'option_3' }
      ],
      validation: ''
    }
  },
  {
    type: 'radio',
    name: 'Radio Group',
    category: 'Selection Inputs',
    icon: 'material-symbols:radio-button-checked-outline',
    description: 'Radio button group',
    defaultProps: {
      type: 'radio',
      help: '',
      options: [
        { label: 'Option 1', value: 'option_1' },
        { label: 'Option 2', value: 'option_2' },
        { label: 'Option 3', value: 'option_3' }
      ],
      validation: ''
    }
  },
  
  // Date and Time
  {
    type: 'date',
    name: 'Date Picker',
    category: 'Date and Time',
    icon: 'material-symbols:calendar-month-outline',
    description: 'Date selection input',
    defaultProps: {
      type: 'date',
      help: '',
      validation: ''
    }
  },
  {
    type: 'time',
    name: 'Time Picker',
    category: 'Date and Time',
    icon: 'material-symbols:schedule-outline',
    description: 'Time selection input',
    defaultProps: {
      type: 'time',
      help: '',
      validation: ''
    }
  },
  {
    type: 'datetime-local',
    name: 'Date & Time',
    category: 'Date and Time',
    icon: 'material-symbols:event-outline',
    description: 'Date and time selection',
    defaultProps: {
      type: 'datetime-local',
      help: '',
      validation: ''
    }
  },
  
  // Advanced
  {
    type: 'file',
    name: 'File Upload',
    category: 'Advanced',
    icon: 'material-symbols:upload-file-outline',
    description: 'File upload input',
    defaultProps: {
      type: 'file',
      help: '',
      accept: '*/*',
      validation: ''
    }
  },
  {
    type: 'repeater',
    name: 'Repeater',
    category: 'Advanced',
    icon: 'material-symbols:add-box-outline',
    description: 'Repeatable group of fields',
    defaultProps: {
      type: 'repeater',
      label: 'Repeater Section',
      name: 'repeater',
      help: 'Add multiple items',
      max: 5
    }
  },
  {
    type: 'group',
    name: 'Group',
    category: 'Advanced',
    icon: 'material-symbols:folder-outline',
    description: 'Group of related fields',
    defaultProps: {
      type: 'group',
      label: 'Field Group',
      name: 'group',
      help: 'Group of related fields'
    }
  },
  
  // Layout
  {
    type: 'heading',
    name: 'Heading',
    category: 'Layout',
    icon: 'material-symbols:title',
    description: 'Section heading text',
    defaultProps: {
      value: 'Section Heading',
      level: 2
    }
  },
  {
    type: 'paragraph',
    name: 'Paragraph',
    category: 'Layout',
    icon: 'material-symbols:text-snippet-outline',
    description: 'Paragraph of text',
    defaultProps: {
      value: 'Enter some descriptive text here.'
    }
  },
  {
    type: 'divider',
    name: 'Divider',
    category: 'Layout',
    icon: 'material-symbols:horizontal-rule',
    description: 'Horizontal divider line',
    defaultProps: {}
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
    component.type.toLowerCase().includes(query) ||
    component.category.toLowerCase().includes(query)
  );
};

// Handle drag start event
const onDragStart = (event, component) => {
  // Just set the basic component data, the optimal grid placement
  // will be calculated in the store when adding the component
  const componentWithGrid = {
    ...component,
    defaultProps: {
      ...component.defaultProps,
      width: '100%'
      // Note: gridColumn is now determined by the store's findOptimalGridPlacement method
    }
  };
  
  // Set the drag data
  event.dataTransfer.effectAllowed = 'copy';
  event.dataTransfer.setData('component', JSON.stringify(componentWithGrid));
};

// Add a component directly via click
const addComponent = (component) => {
  emit('add-component', component);
};
</script>

<style scoped>
.form-components {
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