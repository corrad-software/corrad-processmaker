# Form Builder Documentation

## Overview

The Form Builder is a drag-and-drop interface for creating dynamic forms. It allows users to build forms by selecting input components, configuring them, and arranging them in the desired order. The form builder follows the design pattern of the code playground with a full-screen empty layout.

## Files Structure

### Pages

1. **`pages/form-builder/index.vue`**
   - Main form builder interface with three-panel layout
   - Drag and drop interface for building forms
   - Uses empty layout for fullscreen experience
   - Contains form name input and save/preview actions
   - [View File](pages/form-builder/index.vue)

2. **`pages/form-builder/manage.vue`**
   - Form management interface
   - Lists saved forms with search functionality
   - Provides edit and delete actions for each form
   - Uses empty layout and matches design of main page
   - [View File](pages/form-builder/manage.vue)

### Components

3. **`components/FormBuilderComponents.vue`**
   - Left panel component that displays available form elements
   - Categorizes components into groups (Basic Inputs, Selection Inputs, etc.)
   - Provides search functionality for finding components
   - Components can be dragged to the canvas
   - Uses Material Design icons
   - [View File](components/FormBuilderComponents.vue)

4. **`components/FormBuilderCanvas.vue`**
   - Middle panel component that displays the form being built
   - Handles drag-and-drop reordering of components
   - Renders form elements with preview mode
   - Provides selection, deletion, and reordering capabilities
   - Uses vuedraggable for drag-and-drop functionality
   - [View File](components/FormBuilderCanvas.vue)

5. **`components/FormBuilderConfiguration.vue`**
   - Right panel component for configuring selected form elements
   - Tabbed interface with Basic, Validation, and Advanced sections
   - Dynamically shows/hides fields based on component type
   - Provides rich validation options
   - [View File](components/FormBuilderConfiguration.vue)

6. **`components/ComponentPreview.vue`**
   - Renders a preview of form components
   - Handles different component types (inputs, headings, paragraphs, etc.)
   - Uses FormKit for rendering form inputs
   - Provides formatting for non-input elements (headings, paragraphs, dividers)
   - [View File](components/ComponentPreview.vue)

### State Management

7. **`stores/formBuilder.js`**
   - Pinia store for managing form builder state
   - Handles form components, selected component, dragging state
   - Provides actions for adding, updating, moving, and deleting components
   - Handles form saving and loading with localStorage
   - Persists saved forms
   - [View File](stores/formBuilder.js)

### Utilities

8. **`composables/useToast.js`**
   - Toast notification composable for consistent toast messages
   - Wraps Vue Toastification with standardized configurations
   - Provides success, error, warning, and info methods
   - [View File](composables/useToast.js)

## Key Features

### Form Building
- Drag-and-drop interface for adding components to the form
- Reordering components via drag-and-drop
- Configuring component properties (labels, placeholders, validation, etc.)
- Real-time preview of the form being built

### Component Types
- **Basic Inputs**: Text, Textarea, Number, Email, Password
- **Selection Inputs**: Select, Checkbox, Radio
- **Date and Time**: Date Picker, Time Picker, Date & Time
- **Advanced**: File Upload, Repeater, Group
- **Layout**: Heading, Paragraph, Divider

### Form Management
- Save forms to localStorage
- List all saved forms
- Search for forms by name
- Edit existing forms
- Delete forms

### Validation
- Built-in validation options (required, email, min, max, etc.)
- Quick validation buttons
- Validation rule syntax help
- Required field checkbox

## UI/UX Design

- Professional dark header with logo and main actions
- Three-panel layout for Components, Canvas, and Configuration
- Material Design icons throughout
- Empty layout for fullscreen experience
- Responsive design that works on mobile and desktop
- Consistent styling with the Code Playground

## Implementation Details

### Layout Structure
- Header with navigation and primary actions
- Form name input section
- Three-panel main content area
- Preview modal for testing the form

### State Management
- Centralized Pinia store for form state
- Computed properties for derived state
- Watchers for reactivity
- Local storage for persistence

### Component Communication
- Props for parent-to-child data flow
- Events for child-to-parent communication
- Store actions for cross-component communication

### Styling
- Tailwind CSS for utility-first styling
- Custom transitions and animations
- Responsive breakpoints
- Consistent color scheme

## Usage Instructions

1. Navigate to `/form-builder` to access the form builder
2. Add components by dragging them from the left panel to the canvas
3. Select a component on the canvas to configure it in the right panel
4. Save the form using the Save button in the header
5. Preview the form by clicking the Preview button
6. Manage saved forms by clicking the Manage Forms button
7. Search, edit, or delete forms in the management interface

## Development Notes

- The form builder uses vuedraggable for drag-and-drop functionality
- FormKit is used for all form inputs
- Material Design icons are used throughout
- The form builder follows the design patterns established in the code playground
- All components are responsive and work on mobile devices

## Future Enhancements

- Backend integration for saving forms to a database
- Form publishing and sharing functionality
- Form versioning
- Form templates
- More advanced validation options
- Conditional display of form fields
- Multi-page forms

---

This documentation was generated on April 9, 2025. 