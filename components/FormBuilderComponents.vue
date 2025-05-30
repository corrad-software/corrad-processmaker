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

    <!-- Text Inputs Category -->
    <div class="component-category mb-4">
      <h3 class="text-gray-700 text-xs font-semibold px-3 mb-2 uppercase tracking-wider">Text Inputs</h3>
      <div class="grid grid-cols-2 gap-1 px-2">
        <div
          v-for="component in getComponentsByCategory('Basic Inputs')"
          :key="component.type"
          class="component-item rounded p-2 flex flex-col items-center justify-center cursor-grab hover:bg-gray-100 transition-colors border border-gray-200"
          :class="{ 'hidden': !matchesSearch(component) }"
          draggable="true"
          @dragstart="onDragStart($event, component)"
          @dragend="onDragEnd($event)"
          @click="addComponent(component)"
        >
          <Icon :name="component.icon" class="mb-1 w-5 h-5 text-gray-600" />
          <span class="text-xs text-gray-600 text-center">{{ component.name }}</span>
        </div>
      </div>
    </div>

    <!-- Selection & Toggle Category -->
    <div class="component-category mb-4">
      <h3 class="text-gray-700 text-xs font-semibold px-3 mb-2 uppercase tracking-wider">Selection & Toggle</h3>
      <div class="grid grid-cols-2 gap-1 px-2">
        <div
          v-for="component in getComponentsByCategory('Selection Inputs')"
          :key="component.type"
          class="component-item rounded p-2 flex flex-col items-center justify-center cursor-grab hover:bg-gray-100 transition-colors border border-gray-200"
          :class="{ 'hidden': !matchesSearch(component) }"
          draggable="true"
          @dragstart="onDragStart($event, component)"
          @dragend="onDragEnd($event)"
          @click="addComponent(component)"
        >
          <Icon :name="component.icon" class="mb-1 w-5 h-5 text-gray-600" />
          <span class="text-xs text-gray-600 text-center">{{ component.name }}</span>
        </div>
      </div>
    </div>

    <!-- Date & Pickers Category -->
    <div class="component-category mb-4">
      <h3 class="text-gray-700 text-xs font-semibold px-3 mb-2 uppercase tracking-wider">Date & Pickers</h3>
      <div class="grid grid-cols-2 gap-1 px-2">
        <div
          v-for="component in getComponentsByCategory('Date and Time')"
          :key="component.type"
          class="component-item rounded p-2 flex flex-col items-center justify-center cursor-grab hover:bg-gray-100 transition-colors border border-gray-200"
          :class="{ 'hidden': !matchesSearch(component) }"
          draggable="true"
          @dragstart="onDragStart($event, component)"
          @dragend="onDragEnd($event)"
          @click="addComponent(component)"
        >
          <Icon :name="component.icon" class="mb-1 w-5 h-5 text-gray-600" />
          <span class="text-xs text-gray-600 text-center">{{ component.name }}</span>
        </div>
      </div>
    </div>

    <!-- Advanced & Upload Category -->
    <div class="component-category mb-4">
      <h3 class="text-gray-700 text-xs font-semibold px-3 mb-2 uppercase tracking-wider">Advanced & Upload</h3>
      <div class="grid grid-cols-2 gap-1 px-2">
        <div
          v-for="component in getComponentsByCategory('Advanced')"
          :key="component.type"
          class="component-item rounded p-2 flex flex-col items-center justify-center cursor-grab hover:bg-gray-100 transition-colors border border-gray-200"
          :class="{ 'hidden': !matchesSearch(component) }"
          draggable="true"
          @dragstart="onDragStart($event, component)"
          @dragend="onDragEnd($event)"
          @click="addComponent(component)"
        >
          <Icon :name="component.icon" class="mb-1 w-5 h-5 text-gray-600" />
          <span class="text-xs text-gray-600 text-center">{{ component.name }}</span>
        </div>
      </div>
    </div>

    <!-- Layout & Content Category -->
    <div class="component-category mb-4">
      <h3 class="text-gray-700 text-xs font-semibold px-3 mb-2 uppercase tracking-wider">Layout & Content</h3>
      <div class="grid grid-cols-2 gap-1 px-2">
        <div
          v-for="component in getComponentsByCategory('Layout')"
          :key="component.type"
          class="component-item rounded p-2 flex flex-col items-center justify-center cursor-grab hover:bg-gray-100 transition-colors border border-gray-200"
          :class="{ 'hidden': !matchesSearch(component) }"
          draggable="true"
          @dragstart="onDragStart($event, component)"
          @dragend="onDragEnd($event)"
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
    icon: 'heroicons:document-text',
    description: 'Single line text input',
    defaultProps: {
      type: 'text',
      placeholder: 'Enter text...',
      help: '',
      validation: '',
      // Conditional Logic Properties
      conditionalLogic: {
        enabled: false,
        conditions: [], // Array of condition objects
        action: 'show', // 'show', 'hide', 'enable', 'disable'
        operator: 'and' // 'and', 'or'
      }
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
      validation: '',
      // Conditional Logic Properties
      conditionalLogic: {
        enabled: false,
        conditions: [],
        action: 'show',
        operator: 'and'
      }
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
      validation: '',
      // Conditional Logic Properties
      conditionalLogic: {
        enabled: false,
        conditions: [],
        action: 'show',
        operator: 'and'
      }
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
      validation: 'email',
      // Conditional Logic Properties
      conditionalLogic: {
        enabled: false,
        conditions: [],
        action: 'show',
        operator: 'and'
      }
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
      validation: '',
      // Conditional Logic Properties
      conditionalLogic: {
        enabled: false,
        conditions: [],
        action: 'show',
        operator: 'and'
      }
    }
  },
  {
    type: 'url',
    name: 'URL Field',
    category: 'Basic Inputs',
    icon: 'material-symbols:link',
    description: 'URL/website address input',
    defaultProps: {
      type: 'url',
      placeholder: 'https://example.com',
      help: '',
      validation: 'url'
    }
  },
  {
    type: 'tel',
    name: 'Phone Field',
    category: 'Basic Inputs',
    icon: 'heroicons:device-phone-mobile',
    description: 'Telephone number input',
    defaultProps: {
      type: 'tel',
      placeholder: '+1 (555) 123-4567',
      help: '',
      validation: ''
    }
  },
  {
    type: 'mask',
    name: 'Masked Input',
    category: 'Basic Inputs',
    icon: 'heroicons:pencil-square',
    description: 'Input field with custom masking',
    defaultProps: {
      type: 'mask',
      placeholder: 'Enter value...',
      help: 'Input will be formatted according to the mask',
      mask: '###-###-####',
      validation: ''
    }
  },
  {
    type: 'hidden',
    name: 'Hidden Field',
    category: 'Basic Inputs',
    icon: 'heroicons:eye-slash',
    description: 'Hidden field for storing values',
    defaultProps: {
      type: 'hidden',
      value: '',
      help: 'This field is hidden from users'
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
      validation: '',
      // Conditional Logic Properties
      conditionalLogic: {
        enabled: false,
        conditions: [],
        action: 'show',
        operator: 'and'
      }
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
  {
    type: 'switch',
    name: 'Switch Toggle',
    category: 'Selection Inputs',
    icon: 'material-symbols:toggle-on',
    description: 'Modern toggle switch',
    defaultProps: {
      type: 'switch',
      label: 'Enable Option',
      name: 'switch_field',
      help: 'Toggle this option on or off',
      value: false,
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
  {
    type: 'range',
    name: 'Range Slider',
    category: 'Date and Time',
    icon: 'material-symbols:linear-scale',
    description: 'Numeric range slider',
    defaultProps: {
      type: 'range',
      min: 0,
      max: 100,
      step: 1,
      value: 50,
      help: 'Drag to select a value',
      validation: ''
    }
  },
  {
    type: 'color',
    name: 'Color Picker',
    category: 'Date and Time',
    icon: 'material-symbols:palette',
    description: 'Color selection input',
    defaultProps: {
      type: 'color',
      value: '#3b82f6',
      help: 'Click to select a color',
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
    type: 'image-preview',
    name: 'Image Preview',
    category: 'Advanced',
    icon: 'material-symbols:image-outline',
    description: 'Display an image with preview capabilities',
    defaultProps: {
      label: 'Image Preview',
      name: 'image_preview',
      help: 'Image preview with zoom capability',
      imageUrl: 'https://placehold.co/600x400',
      altText: 'Preview image',
      caption: 'Image caption',
      showZoom: true,
      showCaption: true,
      maxWidth: '100%',
      height: 'auto'
    }
  },
  {
    type: 'repeating-group',
    name: 'Repeating Group',
    category: 'Advanced',
    icon: 'material-symbols:repeat',
    description: 'Collect multiple entries of the same data structure',
    defaultProps: {
      label: 'Person Information',
      name: 'person_group',
      help: 'Add multiple people with their details',
      minItems: 1,
      maxItems: 10,
      buttonText: 'Add Person',
      removeText: 'Remove',
      fields: [
        { type: 'text', name: 'name', label: 'Name', placeholder: 'Enter name' },
        { type: 'number', name: 'age', label: 'Age', placeholder: 'Enter age' },
        { type: 'email', name: 'email', label: 'Email', placeholder: 'Enter email' }
      ]
    }
  },
  {
    type: 'dynamic-list',
    name: 'Dynamic List',
    category: 'Advanced',
    icon: 'material-symbols:format-list-bulleted-add',
    description: 'Add multiple items to a dynamic list',
    defaultProps: {
      label: 'Items List',
      name: 'items_list',
      help: 'Add or remove items from the list',
      placeholder: 'Enter item',
      buttonText: 'Add Item',
      minItems: 0,
      maxItems: 20,
      defaultItems: ['Item 1', 'Item 2'],
      itemValidation: '',
      allowDuplicates: true,
      enableSorting: false,
      enableSearch: false,
      itemType: 'text',
      showItemCounter: true,
      confirmDelete: false,
      bulkOperations: false,
      exportFormat: 'json',
      importEnabled: false
    }
  },
  {
    type: 'otp',
    name: 'OTP Input',
    category: 'Advanced',
    icon: 'heroicons:key',
    description: 'One-time password verification field',
    defaultProps: {
      label: 'Verification Code',
      name: 'otp_code',
      help: 'Enter the verification code sent to you',
      digits: 6,
      validation: 'required'
    }
  },
  {
    type: 'dropzone',
    name: 'File Dropzone',
    category: 'Advanced',
    icon: 'heroicons:cloud-arrow-up',
    description: 'Drag & drop file upload area',
    defaultProps: {
      label: 'Upload Files',
      name: 'file_upload',
      help: 'Drag files here or click to browse',
      accept: 'image/*,.pdf,.doc,.docx',
      multiple: true,
      maxSize: 5242880, // 5MB
      maxFiles: 5,
      validation: ''
    }
  },
  {
    type: 'button',
    name: 'Button',
    category: 'Advanced',
    icon: 'material-symbols:smart-button',
    description: 'Action button for forms',
    defaultProps: {
      label: 'Click Me',
      name: 'action_button',
      help: 'Button for triggering actions',
      buttonType: 'button', // button, submit, reset
      variant: 'primary', // primary, secondary, success, warning, danger
      size: 'md', // sm, md, lg
      disabled: false,
      onClick: '' // Custom JavaScript code to execute
    }
  },
  
  // Layout
  {
    type: 'info-display',
    name: 'Info Display',
    category: 'Layout',
    icon: 'material-symbols:info-outline',
    description: 'Display read-only information in key-value format',
    defaultProps: {
      title: 'Information',
      fields: [
        { label: 'Customer Name', value: 'John Doe', key: 'customer_name' },
        { label: 'Email', value: 'john@example.com', key: 'customer_email' },
        { label: 'Phone', value: '+1-234-567-8900', key: 'customer_phone' }
      ],
      layout: 'vertical', // vertical, horizontal, grid
      showBorder: true,
      backgroundColor: '#f9fafb'
    }
  },
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
  
  // Prepare the JSON data
  const jsonData = JSON.stringify(componentWithGrid);
  
  try {
    // For Mac/Safari compatibility, use multiple data formats
    event.dataTransfer.effectAllowed = 'copy';
    
    // Add data in multiple formats for maximum compatibility
    // text/plain is the most universally supported
    event.dataTransfer.setData('text/plain', jsonData);
    
    // Custom format - might not work in all browsers but provides context
    try {
      event.dataTransfer.setData('component', jsonData);
    } catch (err) {
      console.log('Custom format not supported in this browser');
    }
    
    // Store component data in a global variable as fallback for Safari
    window.__draggedComponentData = componentWithGrid;
    
    // Add visual feedback
    event.target.classList.add('dragging');
    
    // Set a drag image
    try {
      const dragIcon = document.createElement('div');
      dragIcon.className = 'drag-preview';
      dragIcon.innerHTML = `<div class="p-2 bg-blue-100 border border-blue-300 rounded text-xs">${component.name}</div>`;
      dragIcon.style.position = 'absolute';
      dragIcon.style.top = '-1000px';
      document.body.appendChild(dragIcon);
      
      event.dataTransfer.setDragImage(dragIcon, 0, 0);
      
      // Clean up the drag image element after a short delay
      setTimeout(() => {
        document.body.removeChild(dragIcon);
      }, 100);
    } catch (err) {
      console.log('Custom drag image not supported in this browser');
    }
  } catch (error) {
    console.error('Error in drag start:', error);
  }
};

// Add a component directly via click
const addComponent = (component) => {
  emit('add-component', component);
};

// Handle drag end event
const onDragEnd = (event) => {
  event.target.classList.remove('dragging');
  
  // Clear the fallback data after a short delay
  setTimeout(() => {
    window.__draggedComponentData = null;
  }, 300);
};
</script>

<style scoped>
.form-components {
  @apply bg-white h-full;
  
  /* More compact layout */
  font-size: 0.75rem;
}

.component-category {
  @apply mb-3;
}

.component-category h3 {
  @apply text-xs font-semibold px-3 mb-2 uppercase tracking-wider text-gray-700;
}

.component-item {
  @apply h-20;
  transition: all 0.15s ease-in-out;
  min-height: 4.5rem;
}

.component-item .iconify {
  @apply w-5 h-5 mb-1;
}

.component-item span {
  @apply leading-tight;
}

.component-item:hover {
  transform: translateY(-2px);
}

.component-item:active {
  transform: scale(0.97);
}

.component-item.dragging {
  opacity: 0.5;
  background-color: #e0f2fe;
  border-color: #60a5fa;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.3);
}

.drag-preview {
  pointer-events: none;
  z-index: 9999;
}
</style> 