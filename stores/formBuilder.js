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
    maxHistoryLength: 30 // Maximum number of history entries to keep
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
    },
    
    canUndo: (state) => {
      return state.currentHistoryIndex > 0;
    },
    
    historyEntries: (state) => {
      return state.actionHistory.map((entry, index) => ({
        ...entry,
        isCurrent: index === state.currentHistoryIndex
      }));
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
      // Store the state before the change for history
      const beforeComponents = [...this.formComponents];
      
      // Find optimal grid placement for the new component
      const { gridColumn, rowIndex, width } = this.findOptimalGridPlacement();
      
      const newComponentId = uuidv4();
      const newComponent = {
        ...component,
        id: newComponentId,
        props: {
          ...component.defaultProps,
          name: `${component.type}_${this.formComponents.length + 1}`,
          label: `${component.name} ${this.formComponents.length + 1}`,
          width: width,
          gridColumn: gridColumn
        }
      };
      
      this.formComponents.push(newComponent);
      // Explicitly select the new component
      this.selectedComponentId = newComponentId;
      this.hasUnsavedChanges = true;
      
      // Record the action in history
      this.recordHistory('add_component', {
        componentType: component.type,
        componentId: newComponentId,
        componentName: newComponent.props.label,
        beforeState: {
          components: beforeComponents,
          selectedComponentId: null // Was null before adding
        },
        newComponent: newComponent
      });
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
    
    saveForm() {
      const formData = this.formConfig;
      
      // Add to saved forms array
      const existingIndex = this.savedForms.findIndex(f => f.id === formData.id);
      if (existingIndex !== -1) {
        this.savedForms[existingIndex] = formData;
      } else {
        this.savedForms.push(formData);
      }
      
      // Save to localStorage for persistence
      localStorage.setItem('savedForms', JSON.stringify(this.savedForms));
      
      this.hasUnsavedChanges = false;
      
      // Record in history
      this.recordHistory('save_form', {
        formName: this.formName,
        formDescription: this.formDescription,
        componentCount: this.formComponents.length
      });
      
      return formData;
    },
    
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
      this.hasUnsavedChanges = false;
      
      // Clear history when starting a new form and add initial state
      this.actionHistory = [];
      this.currentHistoryIndex = -1;
      
      // Record the initial empty state
      this.recordHistory('new_form', {
        message: 'Created a new empty form'
      });
    },
    
    loadForm(formId) {
      const savedForms = JSON.parse(localStorage.getItem('savedForms') || '[]');
      const form = savedForms.find(f => f.id === formId);
      
      if (form) {
        // Clear existing data
        this.formComponents = [];
        this.selectedComponentId = null;
        
        // Set form data
        this.formName = form.name;
        this.formDescription = form.description;
        this.formComponents = form.components.map(c => ({
          ...c,
          id: uuidv4()
        }));
        
        // Clear and initialize history when loading a form
        this.actionHistory = [];
        this.currentHistoryIndex = -1;
        
        // Record initial state in history
        this.recordHistory('load_form', {
          formName: form.name,
          formId: formId
        });
      }
    },
    
    loadSavedForms() {
      const savedForms = JSON.parse(localStorage.getItem('savedForms') || '[]');
      this.savedForms = savedForms;
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