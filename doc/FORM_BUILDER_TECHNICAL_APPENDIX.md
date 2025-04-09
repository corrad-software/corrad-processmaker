# Form Builder Technical Appendix

This document provides technical details and code snippets for the form builder implementation.

## Table of Contents

1. [Component Structure](#component-structure)
2. [State Management](#state-management)
3. [Drag and Drop Implementation](#drag-and-drop-implementation)
4. [FormKit Integration](#formkit-integration)
5. [Validation System](#validation-system)
6. [Icons and UI Elements](#icons-and-ui-elements)
7. [Responsive Design](#responsive-design)

## Component Structure

The form builder is built with a modular component structure:

```
pages/
├── form-builder/
│   ├── index.vue          # Main form builder page
│   └── manage.vue         # Form management page
components/
├── FormBuilderComponents.vue  # Left panel components
├── FormBuilderCanvas.vue      # Middle panel canvas
├── FormBuilderConfiguration.vue # Right panel configuration
└── ComponentPreview.vue       # Component rendering
stores/
└── formBuilder.js        # State management
composables/
└── useToast.js          # Toast notifications
```

## State Management

### Pinia Store (stores/formBuilder.js)

The form builder uses Pinia for state management:

```javascript
export const useFormBuilderStore = defineStore('formBuilder', {
  state: () => ({
    formComponents: [],
    selectedComponentId: null,
    formName: 'New Form',
    formDescription: '',
    isDraggingOver: false,
    savedForms: []
  }),
  
  getters: {
    selectedComponent: (state) => {
      return state.selectedComponentId 
        ? state.formComponents.find(c => c.id === state.selectedComponentId)
        : null;
    },
    
    formConfig: (state) => {
      return {
        id: uuidv4(),
        name: state.formName,
        description: state.formDescription,
        components: state.formComponents.map(c => ({
          type: c.type,
          props: c.props
        })),
        createdAt: new Date().toISOString()
      };
    }
  },
  
  actions: {
    addComponent(component) {
      const newComponent = {
        ...component,
        id: uuidv4(),
        props: {
          ...component.defaultProps,
          name: `${component.type}_${this.formComponents.length + 1}`,
          label: `${component.name} ${this.formComponents.length + 1}`
        }
      };
      
      this.formComponents.push(newComponent);
      this.selectComponent(newComponent.id);
    },
    
    // ... other actions
  },
  
  persist: {
    paths: ['savedForms']
  }
});
```

## Drag and Drop Implementation

### Draggable Components

The form builder uses `vuedraggable` for drag-and-drop functionality:

```vue
<!-- FormBuilderCanvas.vue -->
<draggable
  v-model="componentList"
  group="form-components"
  item-key="id"
  handle=".drag-handle"
  ghost-class="ghost"
  animation="300"
  @end="onDragEnd"
>
  <template #item="{ element, index }">
    <div class="form-component relative mb-4 border rounded-md overflow-hidden">
      <!-- Component content -->
    </div>
  </template>
</draggable>
```

### Drag Start Handler

```javascript
// FormBuilderComponents.vue
const onDragStart = (event, component) => {
  event.dataTransfer.effectAllowed = 'copy';
  event.dataTransfer.setData('component', JSON.stringify(component));
  emit('add-component', component);
};
```

### Drop Handler

```javascript
// pages/form-builder/index.vue
const handleDrop = (event) => {
  formStore.setDraggingOver(false);
  const componentData = JSON.parse(event.dataTransfer.getData('component'));
  formStore.addComponent(componentData);
};
```

## FormKit Integration

### Component Preview

The form builder uses FormKit to render form components:

```vue
<!-- ComponentPreview.vue -->
<FormKit 
  v-if="isInputType"
  :id="`preview-${component.id}`"
  :type="component.props.type"
  :name="component.props.name"
  :label="component.props.label"
  :help="component.props.help"
  :placeholder="component.props.placeholder"
  :validation="component.props.validation"
  :validation-visibility="isPreview ? 'live' : 'blur'"
  :disabled="isPreview"
  :options="component.props.options || undefined"
  :value="component.props.value || undefined"
  :accept="component.props.accept || undefined"
  :max="component.props.max || undefined"
/>
```

## Validation System

### Validation Configuration

The configuration panel provides validation options:

```vue
<!-- FormBuilderConfiguration.vue -->
<RsTabItem title="Validation">
  <div class="space-y-4 pt-2">
    <div class="mb-4">
      <h4 class="text-sm font-medium mb-2">Available Validations</h4>
      <div class="grid grid-cols-2 gap-2">
        <RsButton 
          v-for="validator in availableValidators" 
          :key="validator.name"
          size="sm"
          variant="tertiary"
          class="text-left justify-start"
          @click="addValidator(validator.name)"
        >
          {{ validator.label }}
        </RsButton>
      </div>
    </div>
    
    <FormKit
      type="textarea"
      label="Validation Rules"
      name="validation"
      v-model="configModel.validation"
      help="Comma-separated validation rules (e.g., required,email,length:5,15)"
    />
    
    <!-- Validation help -->
  </div>
</RsTabItem>
```

### Available Validators

```javascript
const availableValidators = [
  { name: 'required', label: 'Required' },
  { name: 'email', label: 'Email' },
  { name: 'url', label: 'URL' },
  { name: 'number', label: 'Number' },
  { name: 'min:5', label: 'Min Length/Value' },
  { name: 'max:100', label: 'Max Length/Value' },
  { name: 'between:5,10', label: 'Between Range' },
  { name: 'date', label: 'Date' },
  { name: 'matches:/pattern/', label: 'Pattern Match' }
];
```

## Icons and UI Elements

### Material Design Icons

The form builder uses Material Design icons:

```vue
<Icon name="material-symbols:layers-outline" class="w-16 h-16 mb-4" />
```

### Component Icons

```javascript
// FormBuilderComponents.vue
const availableComponents = [
  {
    type: 'text',
    name: 'Text Field',
    category: 'Basic Inputs',
    icon: 'material-symbols:text-fields',
    // ...
  },
  // ...
];
```

## Responsive Design

### Responsive Layout

The form builder uses a responsive layout that adapts to different screen sizes:

```vue
<!-- pages/form-builder/index.vue -->
<div class="flex-1 flex flex-col lg:flex-row overflow-hidden">
  <!-- Left Panel -->
  <div class="lg:w-1/4 border-r border-gray-200 bg-white overflow-hidden flex flex-col">
    <!-- Left panel content -->
  </div>
  
  <!-- Middle Panel -->
  <div class="lg:w-2/4 bg-white overflow-hidden flex flex-col border-t lg:border-t-0 lg:border-r border-gray-200">
    <!-- Middle panel content -->
  </div>
  
  <!-- Right Panel -->
  <div class="lg:w-1/4 bg-white overflow-hidden flex flex-col border-t lg:border-t-0">
    <!-- Right panel content -->
  </div>
</div>
```

### Responsive Header

```vue
<header class="bg-gray-800 p-2 flex flex-wrap items-center justify-between text-white">
  <div class="flex items-center mb-2 sm:mb-0 gap-4">
    <!-- Logo and back button -->
  </div>
  <div class="flex flex-wrap items-center space-x-2">
    <!-- Actions -->
  </div>
</header>
```

## Component Data Structure

### Form Component Structure

```javascript
// Example of a form component object
{
  id: "550e8400-e29b-41d4-a716-446655440000", // UUID
  type: "text",
  name: "Text Field",
  category: "Basic Inputs",
  icon: "material-symbols:text-fields",
  props: {
    type: "text",
    name: "text_1",
    label: "Text Field 1",
    placeholder: "Enter text...",
    help: "",
    validation: "required"
  }
}
```

### Form Configuration Structure

```javascript
// Example of a saved form
{
  id: "550e8400-e29b-41d4-a716-446655440000", // UUID
  name: "Contact Form",
  description: "",
  components: [
    {
      type: "text",
      props: {
        type: "text",
        name: "name",
        label: "Name",
        placeholder: "Enter your name",
        validation: "required"
      }
    },
    {
      type: "email",
      props: {
        type: "email",
        name: "email",
        label: "Email",
        placeholder: "Enter your email",
        validation: "required,email"
      }
    }
  ],
  createdAt: "2025-04-09T03:30:00.000Z"
}
``` 