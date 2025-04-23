# Form Builder Technical Appendix

This document provides technical implementation details for developers working with the Form Builder system.

> For user documentation and usage guidelines, please refer to [Form Builder Documentation](FORM_BUILDER_DOCUMENTATION.md)

## Architecture Overview

### Technology Stack
- **Frontend Framework**: Nuxt 3 / Vue 3
- **State Management**: Pinia
- **Form Library**: FormKit
- **UI Framework**: Tailwind CSS
- **Icons**: Material Design Icons
- **Drag & Drop**: vuedraggable

### Key Dependencies
```json
{
  "@formkit/nuxt": "^1.0.0",
  "@pinia/nuxt": "^0.4.11",
  "vuedraggable": "^4.1.0",
  "@vueuse/core": "^10.1.2",
  "tailwindcss": "^3.3.2"
}
```

## Project Structure

```
pages/
├── form-builder/
│   ├── index.vue          # Main builder interface
│   └── manage.vue         # Form management
components/
├── FormBuilderComponents.vue  # Component library
├── FormBuilderCanvas.vue      # Form canvas
├── FormBuilderConfiguration.vue # Component config
└── ComponentPreview.vue       # Preview renderer
stores/
└── formBuilder.js        # State management
composables/
└── useToast.js          # Toast notifications
types/
└── form-builder.d.ts    # TypeScript definitions
```

## Component Architecture

### Core Components

1. **FormBuilderComponents.vue**
```vue
<script setup>
const emit = defineEmits(['add-component']);
const searchQuery = ref('');

// Component categories and definitions
const availableComponents = [
  {
    type: 'text',
    name: 'Text Field',
    category: 'Basic Inputs',
    icon: 'material-symbols:text-fields',
    defaultProps: {
      type: 'text',
      placeholder: '',
      validation: ''
    }
  },
  // ... other components
];

// Search and filtering logic
const filteredComponents = computed(() => {
  if (!searchQuery.value) return availableComponents;
  return availableComponents.filter(component => 
    component.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// Drag handlers
const onDragStart = (event, component) => {
  event.dataTransfer.effectAllowed = 'copy';
  event.dataTransfer.setData('component', JSON.stringify(component));
};
</script>
```

2. **FormBuilderCanvas.vue**
```vue
<script setup>
const props = defineProps({
  components: {
    type: Array,
    required: true
  }
});

// Drag and drop configuration
const dragOptions = {
  animation: 300,
  group: 'form-components',
  ghostClass: 'ghost',
  handle: '.drag-handle'
};

// Component selection
const selectComponent = (id) => {
  formStore.selectComponent(id);
};

// Grid system implementation
const calculateGridPosition = (index) => {
  return {
    gridColumn: `span ${component.width || 12} / span ${component.width || 12}`,
    order: index
  };
};
</script>
```

## State Management

### Pinia Store Structure
```typescript
interface FormState {
  formComponents: FormComponent[];
  selectedComponentId: string | null;
  formName: string;
  formDescription: string;
  isDraggingOver: boolean;
  savedForms: SavedForm[];
}

export const useFormBuilderStore = defineStore('formBuilder', {
  state: (): FormState => ({
    formComponents: [],
    selectedComponentId: null,
    formName: 'New Form',
    formDescription: '',
    isDraggingOver: false,
    savedForms: []
  }),
  
  getters: {
    selectedComponent: (state) => // Implementation
    formConfig: (state) => // Implementation
  },
  
  actions: {
    addComponent(component: FormComponent) // Implementation
    updateComponent(id: string, updates: Partial<FormComponent>) // Implementation
    deleteComponent(id: string) // Implementation
    moveComponent(oldIndex: number, newIndex: number) // Implementation
  }
});
```

## Form Component Types

### Type Definitions
```typescript
interface BaseComponent {
  id: string;
  type: string;
  name: string;
  category: ComponentCategory;
  icon: string;
  props: BaseComponentProps;
}

interface BaseComponentProps {
  name: string;
  label: string;
  help?: string;
  validation?: string;
  width?: number;
}

interface InputComponent extends BaseComponent {
  props: InputComponentProps;
}

interface SelectComponent extends BaseComponent {
  props: SelectComponentProps;
}

// Additional type definitions...
```

## Validation System

### Implementation
```typescript
const validationRules = {
  required: 'Value is required',
  email: 'Invalid email format',
  min: (min: number) => `Minimum value is ${min}`,
  max: (max: number) => `Maximum value is ${max}`,
  between: (min: number, max: number) => 
    `Value must be between ${min} and ${max}`,
  pattern: (pattern: string) => 
    `Value must match pattern: ${pattern}`
};

const validateField = (value: any, rules: string) => {
  // Validation implementation
};
```

## Grid System

### Implementation
```typescript
const gridSystem = {
  columns: 12,
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280
  },
  calculateSpan: (width: number) => 
    Math.min(Math.max(1, Math.round(width * 12)), 12)
};
```

## Event Handling

### Component Events
```typescript
const componentEvents = {
  onAdd: (event: DragEvent) => void;
  onUpdate: (event: UpdateEvent) => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onValidate: (component: FormComponent) => ValidationResult;
};
```

## Performance Optimization

### Implementation Details
1. **Component Lazy Loading**
```typescript
const ComponentPreview = defineAsyncComponent(() => 
  import('./ComponentPreview.vue')
);
```

2. **Virtual Scrolling**
```typescript
const virtualScroller = {
  itemSize: 50,
  minItemsPerPage: 10,
  maxBufferPx: 200
};
```

3. **Debounced Updates**
```typescript
const debouncedSave = useDebounceFn(() => {
  saveFormToStorage();
}, 500);
```

## Development Guidelines

### Component Development
1. Follow Vue 3 Composition API patterns
2. Implement proper TypeScript types
3. Use props validation
4. Emit typed events
5. Document component API

### State Management
1. Use Pinia for global state
2. Implement proper actions and getters
3. Use computed properties for derived state
4. Handle side effects in actions

### Styling
1. Use Tailwind utility classes
2. Follow BEM for custom CSS
3. Implement responsive design
4. Use CSS variables for theming

### Testing
1. Write unit tests for components
2. Test store actions and mutations
3. Implement E2E tests for critical paths
4. Test responsive behavior

## Error Handling

### Implementation
```typescript
const errorHandler = {
  handleValidationError: (error: ValidationError) => {
    // Handle validation errors
  },
  handleDragError: (error: DragError) => {
    // Handle drag and drop errors
  },
  handleStateError: (error: StateError) => {
    // Handle state management errors
  }
};
```

## Security Considerations

1. **Input Sanitization**
```typescript
const sanitizeInput = (input: string): string => {
  // Sanitization implementation
};
```

2. **Form Validation**
```typescript
const validateForm = async (form: FormData): Promise<ValidationResult> => {
  // Validation implementation
};
```

## Build and Deployment

### Build Configuration
```javascript
// nuxt.config.ts
export default defineNuxtConfig({
  // Configuration details
});
```

### Development Setup
```bash
# Installation
npm install

# Development
npm run dev

# Build
npm run build

# Preview
npm run preview
```

---

For user documentation and usage guidelines, please refer to [Form Builder Documentation](FORM_BUILDER_DOCUMENTATION.md).

Last updated: April 9, 2025 