import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';

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
    
    selectComponent(id) {
      this.selectedComponentId = id;
    },
    
    updateComponent(updatedComponent) {
      const index = this.formComponents.findIndex(c => c.id === updatedComponent.id);
      if (index !== -1) {
        this.formComponents[index] = JSON.parse(JSON.stringify(updatedComponent));
      }
    },
    
    moveComponent({ oldIndex, newIndex }) {
      if (oldIndex !== newIndex) {
        const component = this.formComponents.splice(oldIndex, 1)[0];
        this.formComponents.splice(newIndex, 0, component);
      }
    },
    
    deleteComponent(id) {
      const index = this.formComponents.findIndex(c => c.id === id);
      if (index !== -1) {
        this.formComponents.splice(index, 1);
        if (this.selectedComponentId === id) {
          this.selectedComponentId = null;
          
          // If there are other components, select the first one after deletion
          if (this.formComponents.length > 0) {
            // Select the component at the same index, or the last component if we deleted the last one
            const newIndex = Math.min(index, this.formComponents.length - 1);
            this.selectedComponentId = this.formComponents[newIndex].id;
          }
        }
      }
    },
    
    setDraggingOver(isDragging) {
      this.isDraggingOver = isDragging;
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
      
      return formData;
    },
    
    loadForm(formId) {
      const savedForms = JSON.parse(localStorage.getItem('savedForms') || '[]');
      const form = savedForms.find(f => f.id === formId);
      
      if (form) {
        this.formName = form.name;
        this.formDescription = form.description;
        this.formComponents = form.components.map(c => ({
          ...c,
          id: uuidv4()
        }));
        this.selectedComponentId = null;
      }
    },
    
    clearForm() {
      this.formComponents = [];
      this.selectedComponentId = null;
      this.formName = 'New Form';
      this.formDescription = '';
    },
    
    loadSavedForms() {
      const savedForms = JSON.parse(localStorage.getItem('savedForms') || '[]');
      this.savedForms = savedForms;
    }
  },
  
  persist: {
    paths: ['savedForms']
  }
}); 