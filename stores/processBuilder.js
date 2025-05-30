import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';
import { useVariableStore } from './variableStore';

export const useProcessBuilderStore = defineStore('processBuilder', {
  state: () => ({
    processes: [], // Only populated from database via fetchProcesses()
    currentProcess: null,
    selectedNodeId: null,
    selectedEdgeId: null,
    history: [],
    historyIndex: -1,
    unsavedChanges: false,
    lastChangeDescription: ''
  }),

  getters: {
    /**
     * Get the current process object
     */
    process: (state) => {
      return state.currentProcess;
    },

    /**
     * Get the selected node
     */
    selectedNode: (state) => {
      if (!state.currentProcess || !state.selectedNodeId) return null;
      return state.currentProcess.nodes.find(node => node.id === state.selectedNodeId);
    },

    /**
     * Get the selected edge
     */
    selectedEdge: (state) => {
      if (!state.currentProcess || !state.selectedEdgeId) return null;
      return state.currentProcess.edges.find(edge => edge.id === state.selectedEdgeId);
    },

    /**
     * Check if there are unsaved changes
     */
    hasUnsavedChanges: (state) => {
      return state.unsavedChanges;
    },

    /**
     * Check if undo is available
     */
    canUndo: (state) => {
      return state.historyIndex > 0;
    },

    /**
     * Check if redo is available
     */
    canRedo: (state) => {
      return state.historyIndex < state.history.length - 1;
    }
  },

  actions: {
    /**
     * Create a new process
     */
    async createProcess(name, description = '') {
      try {
        const processData = {
          processName: name,
          processDescription: description,
          nodes: [],
          edges: [],
          viewport: { x: 0, y: 0, zoom: 1 },
          variables: {},
          settings: {},
          permissions: {},
          createdBy: 1 // TODO: Get from auth store
        };

        const response = await $fetch('/api/process/create', {
          method: 'POST',
          body: processData
        });

        if (response.success) {
          const process = {
            id: response.process.processUUID,
            name: response.process.processName,
            description: response.process.processDescription,
            nodes: response.process.processDefinition.nodes || [],
            edges: response.process.processDefinition.edges || [],
            variables: response.process.processVariables || {},
            settings: response.process.processSettings || {},
            permissions: response.process.processPermissions || {},
            createdAt: response.process.processCreatedDate,
            updatedAt: response.process.processModifiedDate
          };

          // Set as current process but DON'T add to processes array
          // The processes array should only be populated from fetchProcesses()
          this.currentProcess = process;
          this.unsavedChanges = false;

          // Clear any existing variables
          useVariableStore().clearProcessVariables();

          return process;
        } else {
          throw new Error(response.error || 'Failed to create process');
        }
      } catch (error) {
        console.error('Error creating process:', error);
        throw error;
      }
    },

    /**
     * Load a process
     */
    async loadProcess(processId) {
      try {
        const response = await $fetch(`/api/process/${processId}`);
        
        if (response.success) {
          const apiProcess = response.process;
          const definition = apiProcess.processDefinition;
          
          let nodes = definition.nodes || [];
          let edges = definition.edges || [];
          
          // If nodes array is empty but edges contain node data, extract nodes from edges
          if (nodes.length === 0 && edges.length > 0) {
            const nodeMap = new Map();
            
            // Extract unique nodes from edge sourceNode and targetNode
            edges.forEach(edge => {
              if (edge.sourceNode) {
                nodeMap.set(edge.sourceNode.id, {
                  id: edge.sourceNode.id,
                  type: edge.sourceNode.type,
                  label: edge.sourceNode.data?.label || edge.sourceNode.label,
                  position: edge.sourceNode.position,
                  data: edge.sourceNode.data || {}
                });
              }
              
              if (edge.targetNode) {
                nodeMap.set(edge.targetNode.id, {
                  id: edge.targetNode.id,
                  type: edge.targetNode.type,
                  label: edge.targetNode.data?.label || edge.targetNode.label,
                  position: edge.targetNode.position,
                  data: edge.targetNode.data || {}
                });
              }
            });
            
            // Convert to array
            nodes = Array.from(nodeMap.values());
            
            // Clean up edges to remove embedded node data (Vue Flow doesn't need it)
            edges = edges.map(edge => ({
              id: edge.id,
              source: edge.source,
              target: edge.target,
              label: edge.label || '',
              type: edge.type || 'smoothstep',
              animated: edge.animated !== undefined ? edge.animated : true,
              data: edge.data || {}
            }));
          }
          
          const process = {
            id: apiProcess.processUUID,
            name: apiProcess.processName,
            description: apiProcess.processDescription,
            nodes: nodes,
            edges: edges,
            viewport: definition.viewport || { x: 0, y: 0, zoom: 1 },
            variables: apiProcess.processVariables || {},
            settings: apiProcess.processSettings || {},
            permissions: apiProcess.processPermissions || {},
            createdAt: apiProcess.processCreatedDate,
            updatedAt: apiProcess.processModifiedDate
          };

          this.currentProcess = process;
          
          // Load variables into variable store
          if (process.variables) {
            const variableStore = useVariableStore();
            Object.entries(process.variables).forEach(([name, variable]) => {
              variableStore.addVariable(variable);
            });
          }
          
          this.unsavedChanges = false;
          return { success: true, process };
        } else {
          const errorMessage = response.error || 'Failed to load process';
          console.error('Load process failed:', errorMessage);
          return { success: false, error: errorMessage };
        }
      } catch (error) {
        const errorMessage = error.data?.error || error.message || 'Network error occurred';
        console.error('Error loading process:', errorMessage);
        return { success: false, error: errorMessage };
      }
    },

    /**
     * Set the current process from the processes list
     */
    setCurrentProcess(processId) {
      const process = this.processes.find(p => p.id === processId);
      if (process) {
        this.currentProcess = JSON.parse(JSON.stringify(process)); // Deep clone
        this.selectedNodeId = null;
        this.selectedEdgeId = null;
        this.clearHistory();
        this.unsavedChanges = false;
      }
    },

    /**
     * Update the current process with new data
     */
    updateCurrentProcess(processUpdates) {
      if (!this.currentProcess) return;

      this.currentProcess = {
        ...this.currentProcess,
        ...processUpdates,
        updatedAt: new Date().toISOString()
      };
      
      this.unsavedChanges = true;
      this.saveToHistory('Update process settings');
    },

    /**
     * Save the current process
     */
    async saveProcess() {
      if (!this.currentProcess) return false;

      try {
        const processData = {
          processName: this.currentProcess.name,
          processDescription: this.currentProcess.description,
          nodes: this.currentProcess.nodes,
          edges: this.currentProcess.edges,
          viewport: this.currentProcess.viewport || { x: 0, y: 0, zoom: 1 },
          variables: useVariableStore().getAllVariables.process || {},
          settings: this.currentProcess.settings || {},
          permissions: this.currentProcess.permissions || {}
          // Note: processStatus is intentionally NOT included here to preserve current status
          // Status changes should only happen through explicit publish/unpublish actions
        };

        const response = await $fetch(`/api/process/${this.currentProcess.id}`, {
          method: 'PUT',
          body: processData
        });

        if (response.success) {
          // Update local state with server response
          const apiProcess = response.process;
          this.currentProcess.updatedAt = apiProcess.processModifiedDate;
          
          // Update in processes array if it exists there
          const index = this.processes.findIndex(p => p.id === this.currentProcess.id);
          if (index !== -1) {
            this.processes[index] = { ...this.currentProcess };
          }

          this.unsavedChanges = false;
          return true;
        } else {
          throw new Error(response.error || 'Failed to save process');
        }
      } catch (error) {
        console.error('Error saving process:', error);
        return false;
      }
    },

    /**
     * Delete a process
     */
    async deleteProcess(processId) {
      try {
        const response = await $fetch(`/api/process/${processId}`, {
          method: 'DELETE'
        });

        if (response.success) {
          // Remove from local processes array (since we're filtering out deleted ones)
          const index = this.processes.findIndex(p => p.id === processId);
          if (index !== -1) {
            this.processes.splice(index, 1);
          }
          
          // Clear current process if it's the one being deleted
          if (this.currentProcess && this.currentProcess.id === processId) {
            this.currentProcess = null;
            this.selectedNodeId = null;
            this.selectedEdgeId = null;
            this.clearHistory();
          }
          
          return true;
        } else {
          throw new Error(response.error || 'Failed to delete process');
        }
      } catch (error) {
        console.error('Error deleting process:', error);
        return false;
      }
    },

    /**
     * Restore a deleted process
     */
    async restoreProcess(processId) {
      try {
        const response = await $fetch(`/api/process/${processId}/restore`, {
          method: 'POST'
        });

        if (response.success) {
          // Refresh the processes list to reflect the change
          // Don't modify local array directly since status filtering might be complex
          return true;
        } else {
          throw new Error(response.error || 'Failed to restore process');
        }
      } catch (error) {
        console.error('Error restoring process:', error);
        throw error;
      }
    },

    /**
     * Fetch all processes from database
     */
    async fetchProcesses(options = {}) {
      try {
        const queryParams = new URLSearchParams();
        
        if (options.page) queryParams.append('page', options.page);
        if (options.limit) queryParams.append('limit', options.limit);
        if (options.status) queryParams.append('status', options.status);
        if (options.category) queryParams.append('category', options.category);
        if (options.search) queryParams.append('search', options.search);
        if (options.isTemplate !== undefined) queryParams.append('isTemplate', options.isTemplate);
        if (options.sortBy) queryParams.append('sortBy', options.sortBy);
        if (options.sortOrder) queryParams.append('sortOrder', options.sortOrder);

        const url = `/api/process${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
        const response = await $fetch(url);

        if (response.success) {
          // Replace the entire processes array with fresh data from database
          this.processes = response.data.processes.map(apiProcess => ({
            id: apiProcess.processUUID,
            name: apiProcess.processName,
            description: apiProcess.processDescription,
            category: apiProcess.processCategory,
            priority: apiProcess.processPriority,
            owner: apiProcess.processOwner,
            status: apiProcess.processStatus,
            isTemplate: apiProcess.isTemplate,
            templateCategory: apiProcess.templateCategory,
            createdAt: apiProcess.processCreatedDate,
            updatedAt: apiProcess.processModifiedDate,
            creator: apiProcess.creator
          }));
          
          return response.data;
        } else {
          throw new Error(response.error || 'Failed to fetch processes');
        }
      } catch (error) {
        console.error('Error fetching processes:', error);
        throw error;
      }
    },

    /**
     * Publish a process
     */
    async publishProcess(processId) {
      try {
        const response = await $fetch(`/api/process/${processId}/publish`, {
          method: 'POST'
        });

        if (response.success) {
          // Update local state if process exists in the array
          const process = this.processes.find(p => p.id === processId);
          if (process) {
            process.status = 'published';
            process.updatedAt = response.process.processModifiedDate;
          }
          
          // Update current process if it's the same one
          if (this.currentProcess && this.currentProcess.id === processId) {
            this.currentProcess.status = 'published';
            this.currentProcess.updatedAt = response.process.processModifiedDate;
          }
          
          return true;
        } else {
          throw new Error(response.error || 'Failed to publish process');
        }
      } catch (error) {
        console.error('Error publishing process:', error);
        throw error;
      }
    },

    /**
     * Duplicate a process
     */
    async duplicateProcess(processId, newName = null, asTemplate = false) {
      try {
        const response = await $fetch(`/api/process/${processId}/duplicate`, {
          method: 'POST',
          body: {
            newName,
            asTemplate,
            createdBy: 1 // TODO: Get from auth store
          }
        });

        if (response.success) {
          const apiProcess = response.process;
          const newProcess = {
            id: apiProcess.processUUID,
            name: apiProcess.processName,
            description: apiProcess.processDescription,
            category: apiProcess.processCategory,
            priority: apiProcess.processPriority,
            owner: apiProcess.processOwner,
            status: apiProcess.processStatus,
            isTemplate: apiProcess.isTemplate,
            templateCategory: apiProcess.templateCategory,
            createdAt: apiProcess.processCreatedDate,
            updatedAt: apiProcess.processModifiedDate,
            creator: apiProcess.creator
          };

          // DON'T add to processes array - let fetchProcesses() handle that
          // The manage page should call fetchProcesses() after duplication
          return newProcess;
        } else {
          throw new Error(response.error || 'Failed to duplicate process');
        }
      } catch (error) {
        console.error('Error duplicating process:', error);
        throw error;
      }
    },

    /**
     * Clear the processes list (useful when switching contexts)
     */
    clearProcesses() {
      this.processes = [];
    },

    /**
     * Clear the current process (useful when starting fresh)
     */
    clearCurrentProcess() {
      this.currentProcess = null;
      this.selectedNodeId = null;
      this.selectedEdgeId = null;
      this.clearHistory();
      this.unsavedChanges = false;
    },

    /**
     * Add a node to the current process
     */
    addNode(node) {
      if (!this.currentProcess) return;

      const newNode = {
        id: node.id || uuidv4(),
        type: node.type,
        label: node.label || 'New Node',
        position: node.position || { x: 0, y: 0 },
        data: node.data || {}
      };

      this.currentProcess.nodes.push(newNode);
      this.selectedNodeId = newNode.id;
      this.saveToHistory('Add node');
      this.unsavedChanges = true;

      return newNode;
    },

    /**
     * Update a node in the current process
     */
    updateNode(nodeId, updates) {
      if (!this.currentProcess) return;

      const node = this.currentProcess.nodes.find(n => n.id === nodeId);
      if (node) {
        Object.assign(node, updates);
        this.saveToHistory('Update node');
        this.unsavedChanges = true;
      }
    },

    /**
     * Delete a node from the current process
     */
    deleteNode(nodeId) {
      if (!this.currentProcess) return;

      // Find the node index
      const index = this.currentProcess.nodes.findIndex(n => n.id === nodeId);
      if (index !== -1) {
        // Remove the node
        this.currentProcess.nodes.splice(index, 1);
        
        // Remove any edges connected to this node
        const edgesToRemove = this.currentProcess.edges.filter(
          edge => edge.source === nodeId || edge.target === nodeId
        );
        
        edgesToRemove.forEach(edge => {
          const edgeIndex = this.currentProcess.edges.findIndex(e => e.id === edge.id);
          if (edgeIndex !== -1) {
            this.currentProcess.edges.splice(edgeIndex, 1);
          }
        });

        // Clear selection if the deleted node was selected
        if (this.selectedNodeId === nodeId) {
          this.selectedNodeId = null;
        }

        this.saveToHistory('Delete node');
        this.unsavedChanges = true;
        
        return true; // Return success
      }
      
      return false; // Return failure
    },

    /**
     * Add an edge to the current process
     */
    addEdge(edge) {
      if (!this.currentProcess) return;

      const newEdge = {
        id: edge.id || `${edge.source}-${edge.target}`,
        source: edge.source,
        target: edge.target,
        label: edge.label || '',
        type: edge.type || 'default',
        animated: edge.animated !== undefined ? edge.animated : true,
        data: edge.data || {}
      };

      this.currentProcess.edges.push(newEdge);
      this.selectedEdgeId = newEdge.id;
      this.saveToHistory('Add edge');
      this.unsavedChanges = true;

      return newEdge;
    },

    /**
     * Update an edge in the current process
     */
    updateEdge(edgeIdOrObject, updates) {
      if (!this.currentProcess) return;

      // Handle different parameter formats
      let edgeId, edgeUpdates;
      
      if (typeof edgeIdOrObject === 'string') {
        // Called with (id, updates)
        edgeId = edgeIdOrObject;
        edgeUpdates = updates || {};
      } else if (typeof edgeIdOrObject === 'object') {
        // Called with an edge object
        edgeId = edgeIdOrObject.id;
        
        if (updates) {
          // Called with (edge, updates)
          edgeUpdates = updates;
        } else {
          // Called with just the edge object containing updates
          edgeUpdates = { ...edgeIdOrObject };
          delete edgeUpdates.id; // Don't update the ID
        }
      } else {
        return; // Invalid parameters
      }

      const edge = this.currentProcess.edges.find(e => e.id === edgeId);
      if (edge) {
        Object.assign(edge, edgeUpdates);
        this.saveToHistory('Update edge');
        this.unsavedChanges = true;
      }
    },

    /**
     * Delete an edge from the current process
     */
    deleteEdge(edgeId) {
      if (!this.currentProcess) return;

      const index = this.currentProcess.edges.findIndex(e => e.id === edgeId);
      if (index !== -1) {
        this.currentProcess.edges.splice(index, 1);
        
        if (this.selectedEdgeId === edgeId) {
          this.selectedEdgeId = null;
        }

        this.saveToHistory('Delete edge');
        this.unsavedChanges = true;
      }
    },

    /**
     * Update node positions after drag
     */
    updateNodePositions(nodePositions) {
      if (!this.currentProcess) return;

      Object.entries(nodePositions).forEach(([nodeId, position]) => {
        const node = this.currentProcess.nodes.find(n => n.id === nodeId);
        if (node) {
          node.position = position;
        }
      });

      this.saveToHistory('Move nodes');
      this.unsavedChanges = true;
    },

    /**
     * Select a node
     */
    selectNode(nodeId) {
      this.selectedNodeId = nodeId;
      this.selectedEdgeId = null;
    },

    /**
     * Select an edge
     */
    selectEdge(edgeId) {
      this.selectedEdgeId = edgeId;
      this.selectedNodeId = null;
    },

    /**
     * Clear selection
     */
    clearSelection() {
      this.selectedNodeId = null;
      this.selectedEdgeId = null;
    },

    /**
     * Save the current state to history
     */
    saveToHistory(actionName) {
      // Remove any future states if we're in the middle of the history
      if (this.historyIndex < this.history.length - 1) {
        this.history = this.history.slice(0, this.historyIndex + 1);
      }

      // Add current state to history
      this.history.push({
        state: JSON.parse(JSON.stringify(this.currentProcess)),
        action: actionName,
        timestamp: new Date().toISOString()
      });

      // Move history pointer
      this.historyIndex = this.history.length - 1;

      // Limit history size
      if (this.history.length > 50) {
        this.history.shift();
        this.historyIndex--;
      }
    },

    /**
     * Undo the last action
     */
    undo() {
      if (this.historyIndex > 0) {
        this.historyIndex--;
        this.currentProcess = JSON.parse(JSON.stringify(this.history[this.historyIndex].state));
        this.unsavedChanges = true;
      }
    },

    /**
     * Redo the last undone action
     */
    redo() {
      if (this.historyIndex < this.history.length - 1) {
        this.historyIndex++;
        this.currentProcess = JSON.parse(JSON.stringify(this.history[this.historyIndex].state));
        this.unsavedChanges = true;
      }
    },

    /**
     * Clear history
     */
    clearHistory() {
      this.history = [];
      if (this.currentProcess) {
        this.history.push({
          state: JSON.parse(JSON.stringify(this.currentProcess)),
          action: 'Initial state',
          timestamp: new Date().toISOString()
        });
      }
      this.historyIndex = 0;
    },

    /**
     * Get process version history
     */
    async getProcessHistory(processId) {
      try {
        const response = await $fetch(`/api/process/${processId}/history`);
        
        if (response.success) {
          return response.data;
        } else {
          throw new Error(response.error || 'Failed to get process history');
        }
      } catch (error) {
        console.error('Error getting process history:', error);
        throw error;
      }
    },

    /**
     * Get specific process version details
     */
    async getProcessVersion(processId, versionId) {
      try {
        const response = await $fetch(`/api/process/${processId}/version/${versionId}`);
        
        if (response.success) {
          return response.data;
        } else {
          throw new Error(response.error || 'Failed to get process version');
        }
      } catch (error) {
        console.error('Error getting process version:', error);
        throw error;
      }
    },

    /**
     * Restore process to a previous version
     */
    async restoreProcessVersion(processId, version) {
      try {
        const requestData = {
          historyId: version.historyID,
          versionNumber: version.versionNumber,
          restoredBy: 1 // TODO: Get from auth store
        };

        const response = await $fetch(`/api/process/${processId}/restore`, {
          method: 'POST',
          body: requestData
        });

        if (response.success) {
          // Update local state with restored process
          if (this.currentProcess && this.currentProcess.id === processId) {
            await this.loadProcess(processId);
          }
          
          return response;
        } else {
          throw new Error(response.error || 'Failed to restore process version');
        }
      } catch (error) {
        console.error('Error restoring process version:', error);
        throw error;
      }
    },

    /**
     * Load process version for preview (without changing current process)
     */
    async loadProcessVersionPreview(processId, versionId) {
      try {
        const response = await $fetch(`/api/process/${processId}/version/${versionId}`);
        
        if (response.success) {
          return response.data;
        } else {
          throw new Error(response.error || 'Failed to load process version preview');
        }
      } catch (error) {
        console.error('Error loading process version preview:', error);
        throw error;
      }
    },

    /**
     * Set change description for next save
     */
    setChangeDescription(description) {
      this.lastChangeDescription = description;
    },

    /**
     * Enhanced save process with change tracking
     */
    async saveProcessWithDescription(changeDescription = '') {
      if (!this.currentProcess) return false;

      try {
        const processData = {
          processName: this.currentProcess.name,
          processDescription: this.currentProcess.description,
          nodes: this.currentProcess.nodes,
          edges: this.currentProcess.edges,
          viewport: this.currentProcess.viewport || { x: 0, y: 0, zoom: 1 },
          variables: useVariableStore().getAllVariables.process || {},
          settings: this.currentProcess.settings || {},
          permissions: this.currentProcess.permissions || {},
          changeDescription: changeDescription || this.lastChangeDescription,
          savedBy: 1 // TODO: Get from auth store
        };

        const response = await $fetch(`/api/process/${this.currentProcess.id}`, {
          method: 'PUT',
          body: processData
        });

        if (response.success) {
          // Update local state with server response
          const apiProcess = response.process;
          this.currentProcess.updatedAt = apiProcess.processModifiedDate;
          this.currentProcess.version = apiProcess.processVersion;
          
          // Update in processes array if it exists there
          const index = this.processes.findIndex(p => p.id === this.currentProcess.id);
          if (index !== -1) {
            this.processes[index] = { ...this.currentProcess };
          }

          this.unsavedChanges = false;
          this.lastChangeDescription = '';
          return response;
        } else {
          throw new Error(response.error || 'Failed to save process');
        }
      } catch (error) {
        console.error('Error saving process:', error);
        throw error;
      }
    }
  }
}); 