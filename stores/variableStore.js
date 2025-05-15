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
      const { scope = 'process' } = variable;
      
      if (scope === 'global') {
        this.globalVariables.push({
          ...variable,
          scope: 'global'
        });
      } else {
        this.processVariables.push({
          ...variable,
          scope: 'process'
        });
      }
    },

    // Update an existing variable
    updateVariable(name, updates, scope = 'process') {
      const variables = scope === 'global' 
        ? this.globalVariables 
        : this.processVariables;
      
      const index = variables.findIndex(v => v.name === name);
      if (index !== -1) {
        variables[index] = {
          ...variables[index],
          ...updates
        };
      }
    },

    // Delete a variable
    deleteVariable(name, scope = 'process') {
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
    }
  }
}); 