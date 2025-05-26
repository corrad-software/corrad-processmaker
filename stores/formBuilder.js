import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';

export const useFormBuilderStore = defineStore('formBuilder', {
  state: () => ({
    formComponents: [],
    selectedComponentId: null,
    formName: 'New Form',
    formDescription: '',
    isDraggingOver: false,
    savedForms: [],
    hasUnsavedChanges: false,
    actionHistory: [],
    currentHistoryIndex: -1,
    maxHistoryLength: 30, // Maximum number of history entries to keep
    currentFormId: null,
    
    // Custom scripts and styling
    formCustomScript: '',
    formCustomCSS: '',
    formEvents: {
      onLoad: true,
      onFieldChange: true,
      onSubmit: false,
      onValidation: false
    },
    scriptMode: 'safe', // 'safe' or 'advanced'
    
    // Form preview data
    previewFormData: {},
  }),
  
  getters: {
    selectedComponent: (state) => {
      if (!state.selectedComponentId) return null;
      return state.formComponents.find(c => c.id === state.selectedComponentId);
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
    },
    
    canUndo: (state) => {
      return state.currentHistoryIndex > 0;
    },
    
    historyEntries: (state) => {
      return state.actionHistory.map((entry, index) => ({
        ...entry,
        isCurrent: index === state.currentHistoryIndex
      }));
    },
    
    getPreviewFormData: (state) => {
      return state.previewFormData;
    }
  },
  
  actions: {
    // History Management
    recordHistory(action, details = {}) {
      // Remove any future history entries if we're not at the end
      if (this.currentHistoryIndex < this.actionHistory.length - 1) {
        this.actionHistory = this.actionHistory.slice(0, this.currentHistoryIndex + 1);
      }
      
      // Ensure we have a deep clone of the current state
      // Make sure to preserve the exact component IDs
      const currentComponents = this.formComponents.map(component => {
        const copy = JSON.parse(JSON.stringify(component));
        
        // Ensure the ID is preserved exactly
        if (component.id) {
          copy.id = component.id;
        }
        
        return copy;
      });
      
      // Create a new history entry
      const historyEntry = {
        id: uuidv4(),
        action,
        details,
        formState: {
          components: currentComponents,
          name: this.formName,
          description: this.formDescription,
          selectedComponentId: this.selectedComponentId
        },
        timestamp: new Date()
      };
      
      // Add to history and update index
      this.actionHistory.push(historyEntry);
      this.currentHistoryIndex = this.actionHistory.length - 1;
      
      // Limit history length
      if (this.actionHistory.length > this.maxHistoryLength) {
        this.actionHistory = this.actionHistory.slice(this.actionHistory.length - this.maxHistoryLength);
        this.currentHistoryIndex = this.actionHistory.length - 1;
      }
    },
    
    // Helper method to restore state from a history entry
    restoreStateFromHistory(historyState) {
      // Completely replace components with deep clone
      if (Array.isArray(historyState.components)) {
        // Make a deep clone to ensure we break all references
        this.formComponents = historyState.components.map(component => ({
          ...JSON.parse(JSON.stringify(component)),
          id: component.id // Preserve the exact ID
        }));
      } else {
        this.formComponents = [];
      }
      
      // Update other state properties
      this.formName = historyState.name || 'New Form';
      this.formDescription = historyState.description || '';
      
      // Make sure the selectedComponentId references a valid component
      this.selectedComponentId = historyState.selectedComponentId || null;
      if (this.selectedComponentId) {
        // Verify the selected component exists in the restored state
        const selectedExists = this.formComponents.some(c => c.id === this.selectedComponentId);
        if (!selectedExists) {
          this.selectedComponentId = this.formComponents.length > 0 ? this.formComponents[0].id : null;
        }
      }
    },
    
    undo() {
      if (!this.canUndo) return;
      
      // Get current and previous entries
      const currentEntry = this.actionHistory[this.currentHistoryIndex];
      this.currentHistoryIndex--;
      const previousEntry = this.actionHistory[this.currentHistoryIndex];
      
      // Restore the state from previous entry
      this.restoreStateFromHistory(previousEntry.formState);
      
      // Mark as having unsaved changes
      this.hasUnsavedChanges = true;
    },
    
    redo() {
      if (this.currentHistoryIndex >= this.actionHistory.length - 1) return;
      
      // Move forward one step in history
      this.currentHistoryIndex++;
      const nextEntry = this.actionHistory[this.currentHistoryIndex];
      
      // Restore the state from next entry
      this.restoreStateFromHistory(nextEntry.formState);
      
      // Mark as having unsaved changes
      this.hasUnsavedChanges = true;
    },
    
    addComponent(component) {
      // Add debugging
      console.log('FormStore: Adding component', component.type);
      
      // Store the state before the change for history
      const beforeComponents = [...this.formComponents];
      
      // Find optimal grid placement for the new component
      const { gridColumn, rowIndex, width } = this.findOptimalGridPlacement();
      
      const newComponentId = uuidv4();
      
      // Log the incoming component structure
      console.log('Component before processing:', JSON.stringify({
        type: component.type,
        name: component.name,
        hasDefaultProps: !!component.defaultProps,
        defaultPropsKeys: component.defaultProps ? Object.keys(component.defaultProps) : []
      }));
      
      try {
        // Create a deep copy of the default props to avoid reference issues
        const defaultProps = component.defaultProps ? JSON.parse(JSON.stringify(component.defaultProps)) : {};
        
        // Ensure the component has necessary grid properties
        defaultProps.width = defaultProps.width || width;
        defaultProps.gridColumn = defaultProps.gridColumn || gridColumn;
        
        // Generate a default name based on component type if not provided
        if (!defaultProps.name) {
          defaultProps.name = `${component.type}_${this.formComponents.length + 1}`;
        }
        
        // Generate a default label based on component name if not provided
        if (!defaultProps.label && !['heading', 'paragraph', 'divider'].includes(component.type)) {
          defaultProps.label = `${component.name} ${this.formComponents.length + 1}`;
        }
        
        // Handle special component types
        switch (component.type) {
          case 'image-preview':
            // Ensure all required image preview properties
            defaultProps.imageUrl = defaultProps.imageUrl || 'https://placehold.co/600x400';
            defaultProps.altText = defaultProps.altText || 'Preview image';
            defaultProps.caption = defaultProps.caption || '';
            defaultProps.showZoom = defaultProps.showZoom !== undefined ? defaultProps.showZoom : true;
            defaultProps.showCaption = defaultProps.showCaption !== undefined ? defaultProps.showCaption : true;
            defaultProps.maxWidth = defaultProps.maxWidth || '100%';
            defaultProps.height = defaultProps.height || 'auto';
            break;
            
          case 'repeating-group':
            // Ensure all required repeating group properties
            defaultProps.minItems = defaultProps.minItems !== undefined ? defaultProps.minItems : 1;
            defaultProps.maxItems = defaultProps.maxItems !== undefined ? defaultProps.maxItems : 10;
            defaultProps.buttonText = defaultProps.buttonText || 'Add Item';
            defaultProps.removeText = defaultProps.removeText || 'Remove';
            defaultProps.fields = defaultProps.fields || [
              { type: 'text', name: 'field_1', label: 'Field 1', placeholder: 'Enter value' }
            ];
            break;
            
          case 'dynamic-list':
            // Ensure all required dynamic list properties
            defaultProps.placeholder = defaultProps.placeholder || 'Enter item';
            defaultProps.buttonText = defaultProps.buttonText || 'Add Item';
            defaultProps.minItems = defaultProps.minItems !== undefined ? defaultProps.minItems : 0;
            defaultProps.maxItems = defaultProps.maxItems !== undefined ? defaultProps.maxItems : 20;
            defaultProps.defaultItems = Array.isArray(defaultProps.defaultItems) ? defaultProps.defaultItems : ['Item 1', 'Item 2'];
            break;

          case 'info-display':
            // Ensure all required info display properties
            defaultProps.title = defaultProps.title || 'Information';
            defaultProps.layout = defaultProps.layout || 'vertical';
            defaultProps.showBorder = defaultProps.showBorder !== undefined ? defaultProps.showBorder : true;
            defaultProps.backgroundColor = defaultProps.backgroundColor || '#f8fafc';
            defaultProps.fields = Array.isArray(defaultProps.fields) ? defaultProps.fields : [
              { label: 'Info Item', value: 'Value', key: 'item_1' }
            ];
            break;
            
          case 'file':
            // Ensure all required file upload properties
            defaultProps.accept = defaultProps.accept || '.pdf,.doc,.docx,.jpg,.jpeg,.png';
            break;
            
          case 'heading':
            // Ensure all required heading properties
            defaultProps.value = defaultProps.value || 'Heading';
            defaultProps.level = defaultProps.level || 2;
            break;
            
          case 'paragraph':
            // Ensure all required paragraph properties
            defaultProps.value = defaultProps.value || 'Paragraph text';
            break;
            
          case 'select':
          case 'radio':
          case 'checkbox':
            // Ensure options array exists
            if (!Array.isArray(defaultProps.options) || defaultProps.options.length === 0) {
              defaultProps.options = [
                { label: 'Option 1', value: 'option_1' },
                { label: 'Option 2', value: 'option_2' }
              ];
            }
            break;
            
          case 'range':
            // Ensure all required range properties
            defaultProps.min = defaultProps.min !== undefined ? defaultProps.min : 0;
            defaultProps.max = defaultProps.max !== undefined ? defaultProps.max : 100;
            defaultProps.step = defaultProps.step !== undefined ? defaultProps.step : 1;
            defaultProps.value = defaultProps.value !== undefined ? defaultProps.value : 50;
            break;
            
          case 'color':
            // Ensure color has a default value
            defaultProps.value = defaultProps.value || '#3b82f6';
            break;
            
          case 'switch':
            // Ensure switch has a default value
            defaultProps.value = defaultProps.value !== undefined ? defaultProps.value : false;
            break;
            
          case 'hidden':
            // Ensure hidden field has a value
            defaultProps.value = defaultProps.value || '';
            break;
            
          case 'button':
            // Ensure all required button properties
            defaultProps.buttonType = defaultProps.buttonType || 'button';
            defaultProps.variant = defaultProps.variant || 'primary';
            defaultProps.size = defaultProps.size || 'md';
            defaultProps.disabled = defaultProps.disabled !== undefined ? defaultProps.disabled : false;
            defaultProps.onClick = defaultProps.onClick || '';
            break;
            
          case 'mask':
            // Ensure all required mask properties
            defaultProps.mask = defaultProps.mask || '###-###-####';
            break;
            
          case 'otp':
            // Ensure all required OTP properties
            defaultProps.digits = defaultProps.digits !== undefined ? defaultProps.digits : 6;
            break;
            
          case 'dropzone':
            // Ensure all required dropzone properties
            defaultProps.accept = defaultProps.accept || 'image/*,.pdf,.doc,.docx';
            defaultProps.multiple = defaultProps.multiple !== undefined ? defaultProps.multiple : true;
            defaultProps.maxSize = defaultProps.maxSize !== undefined ? defaultProps.maxSize : 5242880; // 5MB
            defaultProps.maxFiles = defaultProps.maxFiles !== undefined ? defaultProps.maxFiles : 5;
            break;
            
          case 'switch':
            // Ensure switch has a default value
            defaultProps.value = defaultProps.value !== undefined ? defaultProps.value : false;
            break;
        }
        
        const newComponent = {
          ...component,
          id: newComponentId,
          props: defaultProps
        };
        
        this.formComponents.push(newComponent);
        // Explicitly select the new component
        this.selectedComponentId = newComponentId;
        this.hasUnsavedChanges = true;
        
        // Record the action in history
        this.recordHistory('add_component', {
          componentType: component.type,
          componentId: newComponentId,
          componentName: newComponent.props.label || newComponent.type,
          beforeState: {
            components: beforeComponents,
            selectedComponentId: null // Was null before adding
          },
          newComponent: newComponent
        });
        
        console.log('Component successfully added:', newComponent.type, newComponent.id);
      } catch (error) {
        console.error('Error adding component:', error);
        console.error('Problematic component:', component);
      }
    },
    
    // Find optimal placement for a new component in the grid
    findOptimalGridPlacement() {
      if (this.formComponents.length === 0) {
        // First component - full width
        return { 
          gridColumn: 'span 12', 
          rowIndex: 0,
          width: '100%'
        };
      }
      
      // Group components by their implicit row
      const rows = [];
      let currentRowY = 0;
      let currentRowIndex = 0;
      let currentRowSpace = 0;
      
      // Sort components by their position in the form (to handle reordering)
      // This assumes components are ordered top to bottom
      const sortedComponents = [...this.formComponents];
      
      // Track used columns in each row
      sortedComponents.forEach(component => {
        const spanMatch = component.props.gridColumn?.match(/span\s+(\d+)/) || [];
        const columnSpan = parseInt(spanMatch[1]) || 12;
        
        // If this is the first component in a row or there's enough space
        if (currentRowSpace === 0) {
          // Start a new row
          currentRowSpace = 12 - columnSpan;
          rows[currentRowIndex] = { components: [component], remainingSpace: currentRowSpace };
        } else if (columnSpan <= currentRowSpace) {
          // Add to current row
          currentRowSpace -= columnSpan;
          rows[currentRowIndex].components.push(component);
          rows[currentRowIndex].remainingSpace = currentRowSpace;
        } else {
          // Start a new row
          currentRowIndex++;
          currentRowSpace = 12 - columnSpan;
          rows[currentRowIndex] = { components: [component], remainingSpace: currentRowSpace };
        }
      });
      
      // Find the row with remaining space
      const rowWithSpace = rows.find(row => row.remainingSpace > 0);
      
      if (rowWithSpace) {
        // Use remaining space in an existing row
        const remainingColumns = rowWithSpace.remainingSpace;
        
        // Calculate width percentage based on columns
        // Convert columns to percentage (each column is 8.33% of the grid)
        let widthPercent;
        
        // Map grid columns to standard width percentages
        switch (remainingColumns) {
          case 3: widthPercent = 25; break;  // 3/12 = 25%
          case 4: widthPercent = 33; break;  // 4/12 = 33.33%
          case 6: widthPercent = 50; break;  // 6/12 = 50%
          case 8: widthPercent = 66; break;  // 8/12 = 66.67%
          case 9: widthPercent = 75; break;  // 9/12 = 75%
          case 12: widthPercent = 100; break; // 12/12 = 100%
          default: widthPercent = Math.round((remainingColumns / 12) * 100);
        }
        
        return {
          gridColumn: `span ${remainingColumns}`,
          rowIndex: rows.indexOf(rowWithSpace),
          width: `${widthPercent}%`
        };
      } else {
        // No space in existing rows, create a new row
        return { 
          gridColumn: 'span 12', 
          rowIndex: rows.length,
          width: '100%' 
        };
      }
    },
    
    selectComponent(id) {
      // Don't record history for selection changes
      this.selectedComponentId = id;
    },
    
    updateComponent(updatedComponent) {
      const index = this.formComponents.findIndex(c => c.id === updatedComponent.id);
      
      if (index !== -1) {
        // Store old component for history
        const oldComponent = { ...this.formComponents[index] };
        const beforeComponents = [...this.formComponents];
        
        // Update the component
        this.formComponents[index] = JSON.parse(JSON.stringify(updatedComponent));
        this.hasUnsavedChanges = true;
        
        // Record in history
        this.recordHistory('update_component', {
          componentId: updatedComponent.id,
          componentType: updatedComponent.type,
          componentName: updatedComponent.props.label,
          oldComponent: oldComponent,
          newComponent: this.formComponents[index],
          beforeState: {
            components: beforeComponents,
            selectedComponentId: this.selectedComponentId
          }
        });
      }
    },
    
    moveComponent({ oldIndex, newIndex }) {
      if (oldIndex !== newIndex) {
        // Record before state
        const beforeComponents = [...this.formComponents];
        const componentToMove = { ...this.formComponents[oldIndex] };
        const beforeOrder = this.formComponents.map(c => c.id);
        
        // Perform the move
        this.formComponents.splice(oldIndex, 1);
        this.formComponents.splice(newIndex, 0, componentToMove);
        
        // Optimize layout after reordering
        this.optimizeGridLayout();
        this.hasUnsavedChanges = true;
        
        // Record in history
        this.recordHistory('move_component', {
          componentId: componentToMove.id,
          componentName: componentToMove.props.label,
          oldIndex,
          newIndex,
          beforeOrder,
          afterOrder: this.formComponents.map(c => c.id),
          beforeState: {
            components: beforeComponents,
            selectedComponentId: this.selectedComponentId
          }
        });
      }
    },
    
    deleteComponent(id) {
      const index = this.formComponents.findIndex(c => c.id === id);
      
      if (index !== -1) {
        // Store the component for history
        const deletedComponent = { ...this.formComponents[index] };
        
        // Store the current state before deletion for history
        const beforeComponents = [...this.formComponents];
        
        // Remove the component
        this.formComponents.splice(index, 1);
        
        // Update selection if the deleted component was selected
        if (this.selectedComponentId === id) {
          this.selectedComponentId = null;
          
          // If there are other components, select the first one after deletion
          if (this.formComponents.length > 0) {
            // Select the component at the same index, or the last component if we deleted the last one
            const newIndex = Math.min(index, this.formComponents.length - 1);
            this.selectedComponentId = this.formComponents[newIndex].id;
          }
        }
        
        // Optimize layout after deletion
        this.optimizeGridLayout();
        this.hasUnsavedChanges = true;
        
        // Record in history
        this.recordHistory('delete_component', {
          componentId: id,
          componentType: deletedComponent.type,
          componentName: deletedComponent.props.label,
          componentIndex: index,
          deletedComponent: deletedComponent,
          beforeState: {
            components: beforeComponents,
            selectedComponentId: this.selectedComponentId
          }
        });
      }
    },
    
    setDraggingOver(isDragging) {
      this.isDraggingOver = isDragging;
    },
    
    setFormName(name) {
      const oldName = this.formName;
      
      if (this.formName !== name) {
        this.formName = name;
        this.hasUnsavedChanges = true;
        
        // Record in history
        this.recordHistory('change_form_name', {
          oldName,
          newName: name
        });
      }
    },
    
    setFormDescription(description) {
      const oldDescription = this.formDescription;
      
      if (this.formDescription !== description) {
        this.formDescription = description;
        this.hasUnsavedChanges = true;
        
        // Record in history
        this.recordHistory('change_form_description', {
          oldDescription,
          newDescription: description
        });
      }
    },
    
    resetUnsavedChanges() {
      this.hasUnsavedChanges = false;
    },
    
    // Update preview form data
    updatePreviewFormData(data) {
      this.previewFormData = { ...data };
    },
    
    // Get forms from the backend
    async getForms() {
      try {
        // Use the API endpoint to fetch forms
        const response = await fetch('/api/forms');
        const result = await response.json();
        
        if (result.success && Array.isArray(result.forms)) {
          return result.forms;
        } else {
          console.error('Error in API response:', result.error || 'Unknown error');
          return [];
        }
      } catch (error) {
        console.error('Error fetching forms:', error);
        return [];
      }
    },
    
    // Load saved forms from the API
    async loadSavedForms() {
      try {
        // Fetch forms from the API
        const forms = await this.getForms();
        
        // Transform to the format expected by the UI
        this.savedForms = forms.map(form => ({
          id: form.formUUID,
          name: form.formName,
          description: form.formDescription || '',
          components: form.formComponents || [],
          createdAt: form.formCreatedDate,
          updatedAt: form.formModifiedDate
        }));
        
        return this.savedForms;
      } catch (error) {
        console.error('Error loading saved forms:', error);
        this.savedForms = [];
        return [];
      }
    },
    
    // Save form to the database
    async saveForm() {
      try {
        const formData = {
          formName: this.formName,
          formDescription: this.formDescription,
          components: this.formComponents.map(c => ({
            type: c.type,
            props: c.props
          })),
          customScript: this.formCustomScript,
          customCSS: this.formCustomCSS,
          formEvents: this.formEvents,
          scriptMode: this.scriptMode
        };
        
        // Determine if this is a new form or an update
        const isNewForm = !this.currentFormId;
        let response;
        
        if (isNewForm) {
          // Create a new form
          response = await fetch('/api/forms/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
          });
        } else {
          // Update existing form
          response = await fetch(`/api/forms/${this.currentFormId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
          });
        }
        
        const result = await response.json();
        
        if (result.success) {
          // Update store state with the saved form
          this.currentFormId = result.form.formUUID;
          this.hasUnsavedChanges = false;
          
          // Record in history
          this.recordHistory('save_form', {
            formName: this.formName,
            formDescription: this.formDescription,
            componentCount: this.formComponents.length
          });
          
          return result.form;
        } else {
          throw new Error(result.error || 'Failed to save form');
        }
      } catch (error) {
        console.error('Error saving form:', error);
        throw error;
      }
    },
    
    // Load a form from the database
    async loadForm(formId) {
      if (!formId) {
        throw new Error('Form ID is required');
      }
      
      try {
        const response = await fetch(`/api/forms/${formId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success && result.form) {
          // Clear existing data
          this.formComponents = [];
          this.selectedComponentId = null;
          
          // Set form data
          this.formName = result.form.formName;
          this.formDescription = result.form.formDescription || '';
          this.currentFormId = result.form.formUUID;
          
          // Load custom scripts and settings
          this.formCustomScript = result.form.customScript || '';
          this.formCustomCSS = result.form.customCSS || '';
          this.formEvents = result.form.formEvents || {
            onLoad: true,
            onFieldChange: true,
            onSubmit: false,
            onValidation: false
          };
          this.scriptMode = result.form.scriptMode || 'safe';
          
          // Transform components from DB format to store format
          if (Array.isArray(result.form.formComponents)) {
            this.formComponents = result.form.formComponents.map(c => ({
              ...c,
              id: uuidv4() // Assign a new UUID for each component
            }));
          }
          
          // Clear and initialize history when loading a form
          this.actionHistory = [];
          this.currentHistoryIndex = -1;
          
          // Record initial state in history
          this.recordHistory('load_form', {
            formName: result.form.formName,
            formId: formId
          });
          
          return result.form;
        } else {
          throw new Error(result.error || 'Failed to load form');
        }
      } catch (error) {
        console.error(`Error loading form ${formId}:`, error);
        throw error;
      }
    },
    
    // Delete a form from the database
    async deleteForm(formId) {
      try {
        const response = await fetch(`/api/forms/${formId}`, {
          method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
          return true;
        } else {
          throw new Error(result.error || 'Failed to delete form');
        }
      } catch (error) {
        console.error(`Error deleting form ${formId}:`, error);
        throw error;
      }
    },
    
    // Clear the current form
    clearForm() {
      // Capture the current state before clearing
      const oldComponents = [...this.formComponents];
      const oldName = this.formName;
      const oldDescription = this.formDescription;
      
      // Clear form data
      this.formComponents = [];
      this.selectedComponentId = null;
      this.formName = 'New Form';
      this.formDescription = '';
      this.currentFormId = null;
      this.hasUnsavedChanges = false;
      
      // Reset custom scripts and settings
      this.formCustomScript = '';
      this.formCustomCSS = '';
      this.formEvents = {
        onLoad: true,
        onFieldChange: true,
        onSubmit: false,
        onValidation: false
      };
      this.scriptMode = 'safe';
      
      // Clear history when starting a new form and add initial state
      this.actionHistory = [];
      this.currentHistoryIndex = -1;
      
      // Record the initial empty state
      this.recordHistory('new_form', {
        message: 'Created a new empty form'
      });
    },
    
    // Optimize the grid layout by analyzing the current components
    // and adjusting their sizes to fill available spaces
    optimizeGridLayout() {
      // Skip if no components
      if (this.formComponents.length === 0) return;
      
      // Group components by their implicit row (similar to findOptimalGridPlacement)
      const rows = [];
      let currentRowIndex = 0;
      let currentRowSpace = 12; // Full width available initially
      
      // Sort components by their position in the form
      const sortedComponents = [...this.formComponents];
      
      // First pass: Group components into rows
      sortedComponents.forEach(component => {
        const spanMatch = component.props.gridColumn?.match(/span\s+(\d+)/) || [];
        const columnSpan = parseInt(spanMatch[1]) || 12;
        
        // If this is the first component in a row or there's enough space
        if (currentRowSpace === 12) { // Start of a new row
          currentRowSpace = 12 - columnSpan;
          rows[currentRowIndex] = { 
            components: [{ component, span: columnSpan }], 
            remainingSpace: currentRowSpace 
          };
        } else if (columnSpan <= currentRowSpace) {
          // Add to current row
          currentRowSpace -= columnSpan;
          rows[currentRowIndex].components.push({ component, span: columnSpan });
          rows[currentRowIndex].remainingSpace = currentRowSpace;
        } else {
          // Start a new row
          currentRowIndex++;
          currentRowSpace = 12 - columnSpan;
          rows[currentRowIndex] = { 
            components: [{ component, span: columnSpan }], 
            remainingSpace: currentRowSpace 
          };
        }
      });
      
      // Second pass: Optimize each row
      rows.forEach(row => {
        // Skip full rows
        if (row.remainingSpace === 0) return;
        
        // If there's only one component in a row with remaining space,
        // expand it to fill the row
        if (row.components.length === 1 && row.remainingSpace > 0) {
          const comp = row.components[0];
          const totalSpan = 12; // Full row
          this.updateComponentSize(comp.component, totalSpan);
        } 
        // If there are multiple components in a row with remaining space,
        // distribute the space proportionally
        else if (row.components.length > 1 && row.remainingSpace > 0) {
          // Calculate how much extra space each component gets
          const extraSpanPerComponent = Math.floor(row.remainingSpace / row.components.length);
          let remainingExtraSpan = row.remainingSpace % row.components.length;
          
          // Distribute the remaining columns among components
          row.components.forEach(comp => {
            // Calculate new span, adding extra space plus one more if there's remainder
            let extraSpan = extraSpanPerComponent;
            if (remainingExtraSpan > 0) {
              extraSpan += 1;
              remainingExtraSpan--;
            }
            
            const newSpan = comp.span + extraSpan;
            this.updateComponentSize(comp.component, newSpan);
          });
        }
      });
    },
    
    // Update a component's size based on a new column span
    updateComponentSize(component, newSpan) {
      // Convert the span to a standard width percentage
      let widthPercent;
      switch (newSpan) {
        case 3: widthPercent = 25; break;
        case 4: widthPercent = 33; break;
        case 6: widthPercent = 50; break;
        case 8: widthPercent = 66; break;
        case 9: widthPercent = 75; break;
        case 12: widthPercent = 100; break;
        default: widthPercent = Math.round((newSpan / 12) * 100);
      }
      
      // Update the component
      const index = this.formComponents.findIndex(c => c.id === component.id);
      if (index !== -1) {
        this.formComponents[index] = {
          ...component,
          props: {
            ...component.props,
            width: `${widthPercent}%`,
            gridColumn: `span ${newSpan}`
          }
        };
      }
    }
  },
  
  persist: {
    paths: ['savedForms']
  }
}); 