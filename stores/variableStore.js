import { defineStore } from 'pinia';

export const useVariableStore = defineStore('variables', {
  state: () => ({
    // Global variables accessible across all processes
    globalVariables: [],
    
    // Current process variables
    processVariables: [],
    
    // Variables for the currently selected node
    nodeVariables: {
      input: [],
      output: []
    }
  }),

  getters: {
    // Get all variables
    getAllVariables: (state) => {
      return {
        global: state.globalVariables,
        process: state.processVariables,
        node: state.nodeVariables
      };
    },

    // Get variable by name and scope
    getVariable: (state) => (name, scope = 'process') => {
      const variables = scope === 'global' 
        ? state.globalVariables 
        : state.processVariables;
      return variables.find(v => v.name === name);
    }
  },

  actions: {
    // Add a new variable
    addVariable(variable) {
      // Respect the scope passed in, default to global if not specified
      const scope = variable.scope || 'global';
      const updatedVariable = {
        ...variable,
        scope: scope
      };
      
      if (scope === 'process') {
        this.processVariables.push(updatedVariable);
      } else {
        this.globalVariables.push(updatedVariable);
      }
    },

    // Add a variable only if it doesn't already exist
    addVariableIfNotExists(variable) {
      const name = variable.name;
      // Default to global scope
      const scope = variable.scope || 'global';
      const variables = scope === 'global' 
        ? this.globalVariables 
        : this.processVariables;
      
      // Check if variable already exists
      const exists = variables.some(v => v.name === name);
      
      // If it doesn't exist, add it
      if (!exists) {
        this.addVariable(variable);
      }
    },

    // Update an existing variable
    updateVariable(name, updates, scope = 'global') {
      const variables = scope === 'global' 
        ? this.globalVariables 
        : this.processVariables;
      
      const index = variables.findIndex(v => v.name === name);
      if (index !== -1) {
        variables[index] = {
          ...variables[index],
          ...updates,
          scope // Ensure the scope is preserved
        };
      }
    },

    // Delete a variable
    deleteVariable(name, scope = 'global') {
      const variables = scope === 'global' 
        ? this.globalVariables 
        : this.processVariables;
      
      const index = variables.findIndex(v => v.name === name);
      if (index !== -1) {
        variables.splice(index, 1);
      }
    },

    // Set node variables
    setNodeVariables(variables) {
      this.nodeVariables = variables;
    },

    // Clear process variables (when switching processes)
    clearProcessVariables() {
      this.processVariables = [];
      this.nodeVariables = {
        input: [],
        output: []
      };
    },

    // Clear all process variables specifically (for template application)
    clearAllProcessVariables() {
      this.processVariables = [];
    }
  }
}); 