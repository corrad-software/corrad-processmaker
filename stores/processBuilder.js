import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';

export const useProcessBuilderStore = defineStore('processBuilder', {
  state: () => ({
    processes: [],
    currentProcess: null,
    selectedNodeId: null,
    selectedEdgeId: null,
    history: [],
    historyIndex: -1,
    unsavedChanges: false
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
    createProcess(name, description = '') {
      const newProcess = {
        id: uuidv4(),
        name,
        description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        nodes: [],
        edges: []
      };

      this.processes.push(newProcess);
      this.setCurrentProcess(newProcess.id);
      this.saveToHistory('Create process');
      this.unsavedChanges = true;

      return newProcess;
    },

    /**
     * Load a process
     */
    loadProcess(processId) {
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
     * Set the current process
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
     * Save the current process
     */
    saveProcess() {
      if (!this.currentProcess) return;

      const index = this.processes.findIndex(p => p.id === this.currentProcess.id);
      if (index !== -1) {
        this.currentProcess.updatedAt = new Date().toISOString();
        this.processes[index] = JSON.parse(JSON.stringify(this.currentProcess)); // Deep clone
        this.unsavedChanges = false;
      }
    },

    /**
     * Delete a process
     */
    deleteProcess(processId) {
      const index = this.processes.findIndex(p => p.id === processId);
      if (index !== -1) {
        this.processes.splice(index, 1);
        if (this.currentProcess && this.currentProcess.id === processId) {
          this.currentProcess = null;
          this.selectedNodeId = null;
          this.selectedEdgeId = null;
          this.clearHistory();
        }
      }
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

      const index = this.currentProcess.nodes.findIndex(n => n.id === nodeId);
      if (index !== -1) {
        this.currentProcess.nodes.splice(index, 1);
        
        // Remove any edges connected to this node
        this.currentProcess.edges = this.currentProcess.edges.filter(
          edge => edge.source !== nodeId && edge.target !== nodeId
        );

        if (this.selectedNodeId === nodeId) {
          this.selectedNodeId = null;
        }

        this.saveToHistory('Delete node');
        this.unsavedChanges = true;
      }
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
    updateEdge(edgeId, updates) {
      if (!this.currentProcess) return;

      const edge = this.currentProcess.edges.find(e => e.id === edgeId);
      if (edge) {
        Object.assign(edge, updates);
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
    }
  }
}); 