<template>
  <div class="form-components">
    <div v-for="group in groupedComponents" :key="group.category" class="mb-2">
      <RsCollapse>
        <RsCollapseItem 
          :title="group.category" 
          :open="group.category === 'Basic Inputs'"
          class="text-sm font-medium"
        >
          <div class="grid grid-cols-1 gap-1.5 mt-2">
            <div 
              v-for="component in group.components" 
              :key="component.type"
              class="component-item border border-gray-200 rounded p-2 flex items-center cursor-grab hover:bg-gray-50 transition-colors"
              :class="{ 'hidden': !matchesSearch(component) }"
              draggable="true"
              @dragstart="onDragStart($event, component)"
              @click="addComponent(component)"
            >
              <div class="bg-gray-100 p-1.5 rounded mr-2 flex items-center justify-center w-8 h-8 flex-shrink-0">
                <Icon :name="component.icon" class="w-4 h-4 text-gray-600" />
              </div>
              <div class="min-w-0 flex-1">
                <div class="font-medium text-sm truncate">{{ component.name }}</div>
                <div class="text-xs text-gray-500 truncate">{{ component.description }}</div>
              </div>
            </div>
          </div>
        </RsCollapseItem>
      </RsCollapse>
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
    name: 'Checkbox',
    category: 'Selection Inputs',
    icon: 'material-symbols:check-box-outline',
    description: 'Single checkbox input',
    defaultProps: {
      type: 'checkbox',
      help: '',
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
      help: '',
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
      help: ''
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

// Group components by category
const groupedComponents = computed(() => {
  const grouped = {};
  
  availableComponents.forEach(component => {
    if (!grouped[component.category]) {
      grouped[component.category] = {
        category: component.category,
        components: []
      };
    }
    
    grouped[component.category].components.push(component);
  });
  
  return Object.values(grouped);
});

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
  // Set the drag data
  event.dataTransfer.effectAllowed = 'copy';
  event.dataTransfer.setData('component', JSON.stringify(component));
  
  // Let browser handle the drag image naturally
  // Don't call emit here to avoid double component creation
};

// Add a click handler for adding components directly
const addComponent = (component) => {
  emit('add-component', component);
};
</script>

<style scoped>
.component-item {
  transition: transform 0.1s ease-in-out;
}

.component-item:active {
  transform: scale(0.97);
}

:deep(.collapse-title) {
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
}

:deep(.collapse-content) {
  padding: 0.5rem;
}
</style> 