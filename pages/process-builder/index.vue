<script setup>
import { ref, onMounted, computed, shallowRef, onUnmounted, nextTick, watch } from 'vue';
import { useProcessBuilderStore } from '~/stores/processBuilder';
import { useVariableStore } from '~/stores/variableStore';
import { useRouter, useRoute } from 'vue-router';
import ProcessFlowCanvas from '~/components/process-flow/ProcessFlowCanvas.vue';
import ProcessBuilderComponents from '~/components/process-flow/ProcessBuilderComponents.vue';
import FormSelector from '~/components/process-flow/FormSelector.vue';
import GatewayConditionManager from '~/components/process-flow/GatewayConditionManager.vue';
import GatewayConditionManagerModal from '~/components/process-flow/GatewayConditionManagerModal.vue';
import ApiNodeConfiguration from '~/components/process-flow/ApiNodeConfiguration.vue';
import ApiNodeConfigurationModal from '~/components/process-flow/ApiNodeConfigurationModal.vue';
import VariableManager from '~/components/process-flow/VariableManager.vue';
import { onBeforeRouteLeave } from 'vue-router';
import FormNodeConfiguration from '~/components/process-flow/FormNodeConfiguration.vue';
import FormNodeConfigurationModal from '~/components/process-flow/FormNodeConfigurationModal.vue';

import BusinessRuleNodeConfiguration from '~/components/process-flow/BusinessRuleNodeConfiguration.vue';
import BusinessRuleNodeConfigurationModal from '~/components/process-flow/BusinessRuleNodeConfigurationModal.vue';
import NotificationNodeConfigurationModal from '~/components/process-flow/NotificationNodeConfigurationModal.vue';
import ProcessTemplatesModal from '~/components/ProcessTemplatesModal.vue';
import ProcessSettingsModal from '~/components/process-flow/ProcessSettingsModal.vue';

// Define page meta
definePageMeta({
  title: "Process Builder",
  description: "Create business processes with drag and drop",
  layout: "empty",
  middleware: ["auth"],
  requiresAuth: true,
});

// Initialize the store and router
const processStore = useProcessBuilderStore();
const router = useRouter();
const route = useRoute();
const variableStore = useVariableStore();

// Initialize toast with fallback
let toast;
try {
  toast = useToast();
} catch (error) {
  // Create a simple toast object if composable is not available
  toast = {
    success: (msg) => console.log('Success:', msg),
    error: (msg) => console.error('Error:', msg),
    info: (msg) => console.info('Info:', msg),
    warning: (msg) => console.warn('Warning:', msg)
  };
}

// Track selected node local state (syncs with store)
// Using shallowRef to avoid making Vue components reactive
const selectedNode = shallowRef(null);

// Track if we're creating a new process
const isCreatingProcess = ref(false);
const newProcessName = ref('');
const newProcessDescription = ref('');

// Track selected node data
const selectedNodeData = ref(null);

// Track drag data
const draggedComponent = ref(null);

// Add a variable to track selected edge
const selectedEdgeData = ref(null);

// Add variables for navigation handling
const showUnsavedChangesModal = ref(false);
const pendingNavigation = ref(null);
const navigationTarget = ref(null);
const navigationConfirmed = ref(false);
const isSaving = ref(false);

// Add a ref for the ProcessFlowCanvas component
const processFlowCanvas = ref(null);

// Add state for node configuration modals
const showFormConfigModal = ref(false);
const showApiConfigModal = ref(false);
const showGatewayConfigModal = ref(false);
const showBusinessRuleConfigModal = ref(false);
const showNotificationConfigModal = ref(false);
const showTemplatesModal = ref(false);
const showProcessSettings = ref(false);
const showDropdown = ref(false);

// Component definitions
const components = [
  {
    type: 'start',
    label: 'Start Point',
    icon: 'play_circle_filled',
    iconColor: 'text-green-500',
    data: { description: 'Process starts here' }
  },
  {
    type: 'form',
    label: 'Form',
    icon: 'description',
    iconColor: 'text-purple-500',
    data: { description: 'Form submission', formName: '' }
  },
  {
    type: 'api',
    label: 'API Call',
    icon: 'api',
    iconColor: 'text-indigo-500',
    data: { 
      description: 'External API call',
      apiMethod: 'GET',
      apiUrl: '',
      requestBody: '',
      headers: '{ "Content-Type": "application/json" }',
      outputVariable: 'apiResponse',
      continueOnError: false,
      errorVariable: 'apiError'
    }
  },
  {
    type: 'gateway',
    label: 'Decision Point',
    icon: 'call_split',
    iconColor: 'text-orange-500',
    data: { description: 'Decision point for branching the workflow', conditions: [] }
  },
  {
    type: 'script',
    label: 'Script',
    icon: 'code',
    iconColor: 'text-gray-500',
    data: { description: 'Script execution', language: 'JavaScript' }
  },
  {
    type: 'end',
    label: 'End Point',
    icon: 'stop_circle',
    iconColor: 'text-red-500',
    data: { description: 'Process completes here' }
  }
];

// Computed to check if we have a current process
const hasCurrentProcess = computed(() => {
  return !!processStore.currentProcess;
});

// Computed properties for node data
const nodeLabel = computed({
  get: () => selectedNodeData.value?.label || '',
  set: (value) => {
    if (selectedNodeData.value) {
      selectedNodeData.value.label = value;
      updateNodeInStore();
    }
  }
});

const nodeDescription = computed({
  get: () => selectedNodeData.value?.data?.description || '',
  set: (value) => {
    if (selectedNodeData.value) {
      selectedNodeData.value.data.description = value;
      updateNodeInStore();
    }
  }
});

const nodeAssignee = computed({
  get: () => selectedNodeData.value?.data?.assignee || '',
  set: (value) => {
    if (selectedNodeData.value) {
      selectedNodeData.value.data.assignee = value;
      updateNodeInStore();
    }
  }
});

const nodeFormName = computed({
  get: () => selectedNodeData.value?.data?.formName || '',
  set: (value) => {
    if (selectedNodeData.value) {
      selectedNodeData.value.data.formName = value;
      updateNodeInStore();
    }
  }
});

const nodeLanguage = computed({
  get: () => selectedNodeData.value?.data?.language || 'JavaScript',
  set: (value) => {
    if (selectedNodeData.value) {
      selectedNodeData.value.data.language = value;
      updateNodeInStore();
    }
  }
});

// Add a computed property for gateway conditions
const nodeConditions = computed({
  get: () => selectedNodeData.value?.data?.conditions || [],
  set: (value) => {
    if (selectedNodeData.value) {
      selectedNodeData.value.data.conditions = value;
      updateNodeInStore();
    }
  }
});

// Add a computed property for gateway default path
const nodeDefaultPath = computed({
  get: () => selectedNodeData.value?.data?.defaultPath || 'Default',
  set: (value) => {
    if (selectedNodeData.value) {
      selectedNodeData.value.data.defaultPath = value;
      updateNodeInStore();
    }
  }
});

// Computed for gateway available variables
const gatewayAvailableVariables = computed(() => {
  const processVars = variableStore.getAllVariables.process.map(v => ({
    name: v.name || 'unnamed',
    label: v?.description
      ? `${v.description} (${v.name || 'unnamed'}, process)`
      : `${v.name || 'unnamed'} (process)` ,
    type: v.type || 'string',
    scope: 'process'
  }));
  const globalVars = variableStore.getAllVariables.global.map(v => ({
    name: v.name || 'unnamed',
    label: v?.description
      ? `${v.description} (${v.name || 'unnamed'}, global)`
      : `${v.name || 'unnamed'} (global)` ,
    type: v.type || 'string',
    scope: 'global'
  }));
  const allVars = [...processVars, ...globalVars];
  // console.log('Gateway available variables:', allVars);
  return allVars;
});

// Handle node selection
const onNodeSelected = (node) => {
  // console.log('Node selected:', node);
  
  // Create a deep copy of the node to avoid reactivity issues
  const nodeCopy = JSON.parse(JSON.stringify(node));
  
  // Always ensure label is present in both places for consistency
  if (!nodeCopy.label && nodeCopy.data && nodeCopy.data.label) {
    // If label is missing but exists in data, use it
    nodeCopy.label = nodeCopy.data.label;
  } else if (nodeCopy.label && nodeCopy.data) {
    // If label exists, make sure it's also in data
    nodeCopy.data.label = nodeCopy.label;
  }
  
  // Set the selected node data
  selectedNodeData.value = nodeCopy;
  
  // Keep a reference to the original node
  selectedNode.value = node;
  selectedEdgeData.value = null;
  processStore.selectNode(node.id);
};

// Handle edge selection
const onEdgeSelected = (edge) => {
  selectedEdgeData.value = edge;
  selectedNode.value = null;
  selectedNodeData.value = null;
  processStore.selectEdge(edge.id);
};

// Update edge label
const updateEdgeLabel = (value) => {
  if (selectedEdgeData.value) {
    processStore.updateEdge(selectedEdgeData.value.id, { label: value });
    selectedEdgeData.value.label = value;
  }
};

// Update the pane click handler to clear edge selection too
const onPaneClick = () => {
  selectedNode.value = null;
  selectedNodeData.value = null;
  selectedEdgeData.value = null;
  processStore.clearSelection();
};

// Update node in store
const updateNodeInStore = () => {
  if (selectedNodeData.value) {
    // console.log('Updating node:', selectedNodeData.value.id, selectedNodeData.value.label);
    
    // Simplify the update to avoid recursive reactivity
    const nodeId = selectedNodeData.value.id;
    const newLabel = selectedNodeData.value.label;
    const newData = { ...selectedNodeData.value.data };
    
    // Update the node canvas separately to avoid reactivity chain
    nextTick(() => {
      if (processFlowCanvas.value) {
        processFlowCanvas.value.updateNode(nodeId, {
          label: newLabel,
          data: {
            ...newData,
            label: newLabel
          }
        });
      }
    });
    
    // Update in store with minimal change
    processStore.updateNode(nodeId, {
      label: newLabel,
      data: newData
    });
  }
};

// Handle condition update
const handleConditionUpdate = (conditions) => {
  if (selectedNodeData.value && selectedNodeData.value.type === 'gateway') {
    // Update conditions in the node data
    selectedNodeData.value.data = {
      ...selectedNodeData.value.data,
      conditions: conditions
    };
    
    // Update edges with new condition outputs
    if (processStore.currentProcess?.edges) {
      const updatedEdges = processStore.currentProcess.edges.map(edge => {
        if (edge.source === selectedNodeData.value.id) {
          // Find matching condition group
          const matchingGroup = conditions.find(group => group.output === edge.label);
          
          // If no matching group found, and this isn't the default path, update edge label
          if (!matchingGroup && edge.label !== selectedNodeData.value.data.defaultPath) {
            return {
              ...edge,
              label: selectedNodeData.value.data.defaultPath || 'Default'
            };
          }
        }
        return edge;
      });
      
      // Update edges in store
      processStore.currentProcess.edges = updatedEdges;
    }
    
    // Update the node in store
    updateNodeInStore();
  }
};

// Handle updates from the canvas when nodes change
const onNodesChange = (changes, currentNodes) => {
  if (!changes || !currentNodes) return;
  
  // Handle node removals
  const removedNodes = changes
    .filter(change => change.type === 'remove')
    .map(change => change.id);
    
  if (removedNodes.length > 0) {
    removedNodes.forEach(nodeId => {
      processStore.deleteNode(nodeId);
    });
    
    // Clear selection if the selected node was deleted
    if (selectedNodeData.value && removedNodes.includes(selectedNodeData.value.id)) {
      selectedNodeData.value = null;
    }
  }
  
  // Handle position changes (only when dragging is complete)
  const positionChanges = {};
  changes
    .filter(change => change.type === 'position' && change.position && !change.dragging)
    .forEach(change => {
      positionChanges[change.id] = change.position;
    });
    
  if (Object.keys(positionChanges).length > 0) {
    processStore.updateNodePositions(positionChanges);
  }
  
  // Update node selection if needed
  if (selectedNodeData.value) {
    const updatedNode = currentNodes.find(node => node.id === selectedNodeData.value.id);
    if (updatedNode) {
      selectedNodeData.value = { ...updatedNode };
    }
  }
};

// Handle updates from the canvas when edges change
const onEdgesChange = (changes, currentEdges) => {
  if (!changes || !currentEdges) return;
  
  // Handle edge removals
  const removedEdges = changes
    .filter(change => change.type === 'remove')
    .map(change => change.id);
    
  if (removedEdges.length > 0) {
    removedEdges.forEach(edgeId => {
      processStore.deleteEdge(edgeId);
    });
    
    // Clear selection if the selected edge was deleted
    if (selectedEdgeData.value && removedEdges.includes(selectedEdgeData.value.id)) {
      selectedEdgeData.value = null;
    }
  }
  
  // Handle edge additions (new connections)
  const addedEdges = changes.filter(change => change.type === 'add');
  
  if (addedEdges.length > 0) {
    addedEdges.forEach(change => {
      const edge = currentEdges.find(e => e.id === change.id);
      if (edge) {
        processStore.addEdge({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          label: edge.label || '',
          type: edge.type || 'smoothstep',
          animated: edge.animated !== undefined ? edge.animated : true,
          data: edge.data || {}
        });
      }
    });
  }
};

// Handle creating a new process
const createNewProcess = async () => {
  if (!newProcessName.value.trim()) {
    toast.error('Please enter a process name');
    return;
  }
  
  try {
    const newProcess = await processStore.createProcess(
      newProcessName.value.trim(),
      newProcessDescription.value.trim()
    );
    
    if (newProcess && newProcess.id) {
      // Update the URL to include the new process ID
      router.replace(`/process-builder?id=${newProcess.id}`);
      
      // Show success message
      toast.success(`Process "${newProcess.name}" created successfully`);
      
      // Reset form
      isCreatingProcess.value = false;
      newProcessName.value = '';
      newProcessDescription.value = '';
      
      // Reset navigation confirmation
      navigationConfirmed.value = false;
    } else {
      toast.error('Failed to create process. Please try again.');
    }
  } catch (error) {
    console.error('Error creating process:', error);
    toast.error(`Failed to create process: ${error.message || 'Unknown error'}`);
  }
};

// Add navigation guard
onBeforeRouteLeave((to, from, next) => {
  // If navigation was already confirmed or there are no unsaved changes, proceed
  if (navigationConfirmed.value || !processStore.hasUnsavedChanges) {
    next();
    return;
  }
  
  // Otherwise show the confirmation modal
  showUnsavedChangesModal.value = true;
  pendingNavigation.value = () => {
    navigationConfirmed.value = true;
    next();
  };
  next(false);
});

// Navigation handlers
const cancelNavigation = () => {
  showUnsavedChangesModal.value = false;
  pendingNavigation.value = null;
  navigationTarget.value = null;
  navigationConfirmed.value = false;
};

// Update the confirmNavigation function to handle targets
const confirmNavigation = (target) => {
  // Force check unsaved changes by calling the getter
  const hasChanges = processStore.hasUnsavedChanges;
  
  // If already confirmed or no unsaved changes, navigate directly
  if (navigationConfirmed.value || !hasChanges) {
    // Clear the current process when navigating away
    if (target !== '/process-builder') {
      processStore.clearCurrentProcess();
    }
    // Reset navigation confirmation
    navigationConfirmed.value = false;
    router.push(target);
    return;
  }
  
  // Otherwise show confirmation modal
  showUnsavedChangesModal.value = true;
  navigationTarget.value = target;
};

// Add proceeding with navigation
const proceedWithNavigation = () => {
  showUnsavedChangesModal.value = false;
  
  if (pendingNavigation.value) {
    pendingNavigation.value();
  } else if (navigationTarget.value) {
    // Clear the current process when navigating away
    if (navigationTarget.value !== '/process-builder') {
      processStore.clearCurrentProcess();
    }
    navigationConfirmed.value = true; // Mark as confirmed before navigating
    router.push(navigationTarget.value);
  }
};

// Update the goToManage function to use the navigation system
const goToManage = () => {
  // If already confirmed or no unsaved changes, navigate directly
  if (navigationConfirmed.value || !processStore.hasUnsavedChanges) {
    router.push('/process-builder/manage');
    return;
  }
  
  // Otherwise show confirmation modal
  showUnsavedChangesModal.value = true;
  navigationTarget.value = "/process-builder/manage";
};

// Add events for beforeunload
onMounted(() => {
  // Check if there's a process ID in the URL query parameters
  const processId = route.query.id;
  
  if (processId) {
    // Load the specific process
    processStore.loadProcess(processId).then((result) => {
      if (!result.success) {
        console.error('Failed to load process:', processId, result.error);
        // Could show an error notification here
        // For now, just redirect back to manage page
        router.push('/process-builder/manage');
      }
    }).catch((error) => {
      console.error('Error loading process:', error);
      router.push('/process-builder/manage');
    });
  }
  
  // Add the beforeunload event listener
  window.addEventListener('beforeunload', handleBeforeUnload);
  
  // Add click outside listener for dropdown
  document.addEventListener('click', handleClickOutside);
});

// Handle click outside dropdown
const handleClickOutside = (event) => {
  if (!event.target.closest('.dropdown')) {
    showDropdown.value = false;
  }
};

onUnmounted(() => {
  // Remove event listeners
  window.removeEventListener('beforeunload', handleBeforeUnload);
  document.removeEventListener('click', handleClickOutside);
});

// Show warning if there are unsaved changes
const handleBeforeUnload = (event) => {
  if (processStore.hasUnsavedChanges) {
    event.preventDefault();
    event.returnValue = '';
    return '';
  }
};

// Handle drag start
const onDragStart = (event, component) => {
  try {
    const dragData = {
      type: component.type,
      label: component.label,
      data: {
        ...component.data,
        label: component.label
      }
    };
    
    draggedComponent.value = dragData;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('application/json', JSON.stringify(dragData));
    
    // Add visual feedback
    event.target.classList.add('dragging');
  } catch (error) {
    console.error('Error starting drag:', error);
  }
};

// Handle drag end
const onDragEnd = (event) => {
  event.target.classList.remove('dragging');
  draggedComponent.value = null;
};

// Add these functions to handle form selection
const handleFormSelection = (form) => {
  if (selectedNodeData.value) {
    // Update all form-related data
    selectedNodeData.value.data = {
      ...selectedNodeData.value.data,
      formId: form.formID,
      formName: form.formName,
      formUuid: form.formUUID,
      label: form.formName,
      description: `Form: ${form.formName}`
    };
    
    // Also update the node's root label
    selectedNodeData.value.label = form.formName;
    
    // Update the node in store to trigger reactivity
    updateNodeInStore();
  }
};

const clearFormSelection = () => {
  if (selectedNodeData.value) {
    selectedNodeData.value.data = {
      ...selectedNodeData.value.data,
      formId: null,
      formName: '',
      formUuid: null,
      label: 'Form Task',
      description: 'Form submission task'
    };
    
    // Reset the node's root label
    selectedNodeData.value.label = 'Form Task';
    
    // Update the node in store
    updateNodeInStore();
  }
};

// Delete current node
const deleteNode = () => {
  if (selectedNodeData.value) {
    // Store the node ID before clearing the selection
    const nodeId = selectedNodeData.value.id;
    
    // Clear selection first to avoid references to deleted node
    selectedNodeData.value = null;
    selectedNode.value = null;
    
    // Delete the node
    processStore.deleteNode(nodeId);
  }
};

// Delete current edge
const deleteEdge = () => {
  if (selectedEdgeData.value) {
    processStore.deleteEdge(selectedEdgeData.value.id);
    selectedEdgeData.value = null;
  }
};

// Save current process
const saveProcess = async () => {
  if (!processStore.currentProcess) {
    toast.error('No process to save');
    return;
  }
  
  if (!processStore.currentProcess.name.trim()) {
    toast.error('Please enter a process name before saving');
    return;
  }
  
  if (isSaving.value) {
    return; // Prevent multiple simultaneous save operations
  }
  
  try {
    isSaving.value = true;
    const success = await processStore.saveProcess();
    
    if (success) {
      toast.success(`Process "${processStore.currentProcess.name}" saved successfully`);
      
      // Reset navigation confirmation since changes are now saved
      navigationConfirmed.value = false;
      
      // Force a reactivity update to ensure unsavedChanges is properly reflected
      await nextTick();
    } else {
      toast.error('Failed to save process. Please try again.');
    }
  } catch (error) {
    console.error('Error saving process:', error);
    toast.error(`Failed to save process: ${error.message || 'Unknown error'}`);
  } finally {
    isSaving.value = false;
  }
};

// Add a component handler to add components from the component panel
const onAddComponent = (component) => {
  // Create a new node from the component definition
  const newNode = {
    id: `${component.type}_${Date.now()}`,
    type: component.type,
    position: { x: 100, y: 100 }, // Default position
    label: component.label,
    data: component.data
  };
  
  // Add the node to the process
  processStore.addNode(newNode);
  
  // Select the newly added node
  onNodeSelected(newNode);
};

// Handle template application
const applyProcessTemplate = async (template) => {
  try {
    console.log('Applying process template:', template.name);
    console.log('Template nodes:', template.nodes ? template.nodes.length : 0);
    console.log('Template edges:', template.edges ? template.edges.length : 0);
    
    // Create a new process if one doesn't exist
    if (!processStore.currentProcess) {
      console.log('No current process, creating new one...');
      processStore.createProcess(template.name, template.description || 'Process created from template');
    } else {
      // Confirm if there's already content in the existing process
      if (processStore.currentProcess.nodes.length > 0 || processStore.currentProcess.edges.length > 0) {
        if (!confirm("This will replace your current process content. Continue?")) {
          return;
        }
      }
      
      // Update process name if user allows
      if (processStore.currentProcess.name === 'New Process' || confirm("Update the process name to match the template?")) {
        processStore.currentProcess.name = template.name;
        processStore.currentProcess.description = template.description;
      }
    }

    // Clear current process nodes and edges
    if (processStore.currentProcess) {
      console.log('Clearing existing nodes and edges...');
      processStore.currentProcess.nodes = [];
      processStore.currentProcess.edges = [];
    }

    // Add nodes and edges together - let the canvas watchers handle the sequencing
    const templateNodes = template.nodes || [];
    const templateEdges = template.edges || [];
    
    console.log('Adding template nodes:', templateNodes.length);
    console.log('Adding template edges:', templateEdges.length);
    
    // Process nodes first
    templateNodes.forEach((node) => {
      const newNode = {
        ...node,
        id: node.id, // Keep original ID for edge references
        label: node.data?.label || node.label || `${node.type} node`, // Set label at root level
        position: node.position || { x: 100, y: 100 },
        data: {
          ...node.data,
          label: node.data?.label || node.label || `${node.type} node`
        }
      };
      
      processStore.addNode(newNode);
    });
    
    // Process edges after nodes
    templateEdges.forEach((edge) => {
      const newEdge = {
        ...edge,
        id: edge.id, // Keep original ID
        type: edge.type || 'smoothstep',
        animated: edge.animated !== undefined ? edge.animated : true
      };
      
      processStore.addEdge(newEdge);
    });
    
    // Add template variables to the variable store
    if (template.variables && template.variables.length > 0) {
      console.log('Adding template variables:', template.variables.length);
      
      // Clear existing process variables first
      variableStore.clearAllProcessVariables();
      
      template.variables.forEach((variable) => {
        console.log(`Adding variable: ${variable.name} (${variable.type}) with scope: ${variable.scope}`);
        variableStore.addVariable({
          ...variable,
          id: crypto.randomUUID() // Generate unique ID for the variable
        });
      });
    }

    console.log('Template application completed - nodes:', processStore.currentProcess.nodes.length, 'edges:', processStore.currentProcess.edges.length);

    // Mark the process as having unsaved changes
    processStore.unsavedChanges = true;
    
    // Fit the view to show all nodes
    if (processFlowCanvas.value && processFlowCanvas.value.fitView) {
      nextTick(() => {
        processFlowCanvas.value.fitView();
      });
    }
    
    // Show success message
    console.log(`Template "${template.name}" applied successfully`);
    
  } catch (error) {
    console.error('Error applying process template:', error);
    alert('Failed to apply template: ' + error.message);
  }
};

// Fix references to functions
const onFormSelected = (formData) => {
  if (selectedNodeData.value && selectedNodeData.value.type === 'form') {
    selectedNodeData.value.data.formId = formData.id;
    selectedNodeData.value.data.formName = formData.name;
    updateNodeInStore();
  }
};

const onConditionsUpdated = (conditions) => {
  if (selectedNodeData.value && selectedNodeData.value.type === 'gateway') {
    selectedNodeData.value.data.conditions = conditions;
    updateNodeInStore();
  }
};

// Handle API node update
const handleApiNodeUpdate = (updatedData) => {
  if (selectedNodeData.value && selectedNodeData.value.type === 'api') {
    // Make sure to update the label both in data and at the root level
    const newLabel = updatedData.label || 'API Call';
    
    // Update the data
    selectedNodeData.value.data = {
      ...updatedData,
      label: newLabel // Ensure label is in data
    };
    
    // Also update the root label
    selectedNodeData.value.label = newLabel;
    
    // Update the node in store
    updateNodeInStore();
  }
};

// Add this function to handle form node updates
const handleFormNodeUpdate = (updatedData) => {
  if (selectedNodeData.value && selectedNodeData.value.type === 'form') {
    // Make sure to update the label both in data and at the root level
    const newLabel = updatedData.label || 'Form Task';
    
    // Update the data
    selectedNodeData.value.data = {
      ...updatedData,
      label: newLabel // Ensure label is in data
    };
    
    // Also update the root label
    selectedNodeData.value.label = newLabel;
    
    // Update the node in store
    updateNodeInStore();
  }
};

// Update handler for business rule node
const handleBusinessRuleUpdate = (data) => {
  if (selectedNodeData.value) {
    selectedNodeData.value.data = {
      ...selectedNodeData.value.data,
      ...data
    };
    updateNodeInStore();
  }
};

// Add a method to handle default path updates
const handleDefaultPathUpdate = (path) => {
  if (selectedNodeData.value && selectedNodeData.value.type === 'gateway') {
    selectedNodeData.value.data.defaultPath = path;
    updateNodeInStore();
  }
};

// Handle notification node update
const handleNotificationNodeUpdate = (updatedData) => {
  if (selectedNodeData.value) {
    selectedNodeData.value.data = { ...updatedData };
    updateNodeInStore();
  }
};

// Navigate to variables page
const navigateToVariables = () => {
  confirmNavigation('/variables');
};

// Watch for route changes to handle process ID changes
watch(() => route.query.id, (newProcessId, oldProcessId) => {
  // Only react if the process ID actually changed and it's not empty
  if (newProcessId && newProcessId !== oldProcessId) {
    processStore.loadProcess(newProcessId).then((result) => {
      if (!result.success) {
        console.error('Failed to load process:', newProcessId, result.error);
        router.push('/process-builder/manage');
      }
    }).catch((error) => {
      console.error('Error loading process:', error);
      router.push('/process-builder/manage');
    });
  } else if (!newProcessId && oldProcessId) {
    // If the ID was removed from the URL, clear the current process
    processStore.clearCurrentProcess();
  }
});

// Watch for unsaved changes to reset navigation confirmation
watch(() => processStore.hasUnsavedChanges, (hasChanges) => {
  // If there are no more unsaved changes, reset navigation confirmation
  if (!hasChanges) {
    navigationConfirmed.value = false;
  }
});
</script>

<template>
  <div class="process-builder flex flex-col h-screen bg-white">
    <!-- Header Bar -->
    <header
      class="bg-gray-800 px-4 py-4 flex items-center justify-between text-white shadow-md"
    >
      <!-- Left section - Logo and navigation -->
      <div class="flex items-center gap-3">
        <Icon
          @click="confirmNavigation('/process-builder/manage')"
          name="ph:arrow-circle-left-duotone"
          class="cursor-pointer w-6 h-6"
        />
        <img
          src="@/assets/img/logo/logo-word-white.svg"
          alt="Corrad Logo"
          class="h-7"
        />
      </div>

      <!-- Middle section - Process name -->
      <div class="flex-1 flex justify-center items-center mx-4">
        <FormKit
          v-if="hasCurrentProcess"
          v-model="processStore.currentProcess.name"
          type="text"
          placeholder="Process Name"
          validation="required"
          validation-visibility="live"
          :validation-messages="{ required: 'Please enter a process name' }"
          class="process-name-input max-w-md"
          :classes="{
            outer: 'mb-0 w-full',
          }"
        />
        <div v-else class="text-lg font-medium text-gray-400">No Process Selected</div>
      </div>

      <!-- Right section - Actions -->
      <div class="flex items-center">
        <!-- Primary actions -->
        <div class="flex items-center mr-2 border-r border-gray-600 pr-2">
          <RsButton @click="saveProcess" variant="primary" size="sm" class="mr-2" :disabled="!hasCurrentProcess || isSaving">
            <Icon v-if="isSaving" name="material-symbols:progress-activity" class="mr-1 animate-spin" />
            <Icon v-else name="material-symbols:save" class="mr-1" />
            {{ isSaving ? 'Saving...' : 'Save' }}
          </RsButton>
        </div>
        
        <!-- Templates button -->
        <div class="mr-2 border-r border-gray-600 pr-2">
          <RsButton @click="showTemplatesModal = true" variant="secondary" size="sm" :disabled="!hasCurrentProcess">
            <Icon name="material-symbols:description-outline" class="mr-1" />
            Templates
          </RsButton>
        </div>
        
        <!-- Secondary actions -->
        <div class="flex items-center">
          <div class="dropdown relative">
            <RsButton @click="showDropdown = !showDropdown" variant="tertiary" size="sm" class="flex items-center">
              <Icon name="material-symbols:more-vert" class="w-5 h-5" />
            </RsButton>
            
            <div v-if="showDropdown" class="dropdown-menu absolute right-0 mt-2 bg-white rounded shadow-lg py-1 z-10 w-48 text-gray-800">
              <button @click="showProcessSettings = true; showDropdown = false" class="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center">
                <Icon name="material-symbols:tune" class="mr-2 w-4 h-4" />
                <span>Process Settings</span>
              </button>
              <button @click="navigateToVariables(); showDropdown = false" class="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center">
                <Icon name="material-symbols:data-object" class="mr-2 w-4 h-4" />
                <span>Variables</span>
              </button>
              <button @click="confirmNavigation('/process-builder/manage'); showDropdown = false" class="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center">
                <Icon name="material-symbols:settings" class="mr-2 w-4 h-4" />
                <span>Manage Processes</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content Area -->
    <div class="flex-1 flex overflow-hidden" v-if="hasCurrentProcess">
      <!-- Left Panel - Components -->
      <div class="w-64 border-r border-gray-200 flex flex-col overflow-hidden">
        <div class="bg-gray-100 p-3 flex items-center justify-between border-b border-gray-200">
          <h2 class="text-sm font-medium text-gray-700">Process Components</h2>
        </div>
        <div class="flex-1 overflow-y-auto">
          <ProcessBuilderComponents @add-component="onAddComponent" />
        </div>
      </div>

      <!-- Center Panel - Process Canvas -->
      <div class="flex-1 relative">
        <ProcessFlowCanvas 
          ref="processFlowCanvas"
          :initial-nodes="processStore.currentProcess.nodes"
          :initial-edges="processStore.currentProcess.edges"
          @node-selected="onNodeSelected"
          @edge-selected="onEdgeSelected"
          @pane-click="onPaneClick" 
          @nodes-change="onNodesChange"
          @edges-change="onEdgesChange"
        />
      </div>

      <!-- Right Panel - Properties -->
      <div class="w-80 border-l border-gray-200 flex flex-col overflow-hidden">
        <div class="bg-gray-100 p-3 flex items-center justify-between border-b border-gray-200">
          <h2 class="text-sm font-medium text-gray-700">Properties</h2>
        </div>
        <div class="flex-1 overflow-y-auto">
          <!-- Show variable manager when no node is selected -->
          <VariableManager v-if="!selectedNodeData" />
          
          <!-- Show node properties when a node is selected -->
          <div v-else class="p-4 space-y-4">
            <!-- Node Label -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Label</label>
              <input
                v-model="nodeLabel"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <!-- Node Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                v-model="nodeDescription"
                rows="2"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <!-- Node Type Specific Properties -->

            <!-- Form Selection for Form Nodes -->
            <div v-if="selectedNodeData.type === 'form'">
              <RsButton @click="showFormConfigModal = true" variant="primary" class="w-full">
                Configure Form Task
              </RsButton>
            </div>

            <!-- API Configuration for API Nodes -->
            <div v-if="selectedNodeData.type === 'api'">
              <RsButton @click="showApiConfigModal = true" variant="primary" class="w-full">
                Configure API Call
              </RsButton>
            </div>

            <!-- Gateway Conditions -->
            <div v-if="selectedNodeData.type === 'gateway'">
              <RsButton @click="showGatewayConfigModal = true" variant="primary" class="w-full">
                Configure Decision Paths
              </RsButton>
            </div>
            
            <!-- Business Rule Configuration -->
            <div v-if="selectedNodeData.type === 'business-rule'">
              <RsButton @click="showBusinessRuleConfigModal = true" variant="primary" class="w-full">
                Configure Business Rule
              </RsButton>
            </div>
            
            <!-- Notification Configuration -->
            <div v-if="selectedNodeData.type === 'notification'">
              <RsButton @click="showNotificationConfigModal = true" variant="primary" class="w-full">
                Configure Notification
              </RsButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state - No process selected -->
    <div v-else class="flex-1 flex items-center justify-center bg-gray-50">
      <div class="text-center p-8 max-w-md">
        <Icon name="material-symbols:flowchart" class="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h2 class="text-xl font-semibold text-gray-800 mb-2">Create a New Process</h2>
        <p class="text-gray-600 mb-6">Get started by creating a new process or navigate back to manage your existing processes.</p>
        
        <div class="space-y-3">
          <div class="mb-4">
            <FormKit
              v-model="newProcessName"
              type="text"
              label="Process Name"
              placeholder="Enter a name for your new process"
              validation="required"
            />
            
            <FormKit
              v-model="newProcessDescription"
              type="textarea"
              label="Description (Optional)"
              placeholder="Enter a description"
              :rows="3"
            />
          </div>
          
          <div class="flex justify-center gap-4">
            <RsButton @click="createNewProcess" variant="primary" :disabled="!newProcessName.trim()">
              <Icon name="material-symbols:add" class="mr-1" />
              Create Process
            </RsButton>
            
            <RsButton @click="confirmNavigation('/process-builder/manage')" variant="tertiary">
              <Icon name="material-symbols:arrow-back" class="mr-1" />
              Back to Processes
            </RsButton>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Unsaved changes dialog -->
    <RsModal v-model="showUnsavedChangesModal" title="Unsaved Changes" size="md" position="center">
      <div class="p-4">
        <div class="flex items-center mb-4">
          <Icon name="material-symbols:warning-outline" class="text-yellow-500 w-8 h-8 mr-3" />
          <div>
            <p class="text-gray-600">You have unsaved changes that will be lost if you leave the page.</p>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <RsButton @click="cancelNavigation" variant="tertiary">
            Stay on this Page
          </RsButton>
          <RsButton @click="proceedWithNavigation" variant="danger">
            Discard Changes
          </RsButton>
        </div>
      </template>
    </RsModal>
    
    <!-- Form Task Configuration Modal -->
    <FormNodeConfigurationModal
      v-if="selectedNodeData && selectedNodeData.type === 'form'"
      v-model="showFormConfigModal"
      :nodeData="selectedNodeData.data"
      :availableVariables="variableStore.getAllVariables.global"
      @update="handleFormNodeUpdate"
    />
    
    <!-- API Call Configuration Modal -->
    <ApiNodeConfigurationModal
      v-if="selectedNodeData && selectedNodeData.type === 'api'"
      v-model="showApiConfigModal"
      :nodeData="selectedNodeData.data"
      :availableVariables="gatewayAvailableVariables"
      @update="handleApiNodeUpdate"
    />
    
    <!-- Gateway/Decision Point Configuration Modal -->
    <GatewayConditionManagerModal
      v-if="selectedNodeData && selectedNodeData.type === 'gateway'"
      v-model="showGatewayConfigModal"
      :conditions="selectedNodeData.data.conditions || []"
      :availableVariables="gatewayAvailableVariables"
      :defaultPath="selectedNodeData.data.defaultPath || 'Default'"
      @update:conditions="handleConditionUpdate"
      @update:defaultPath="handleDefaultPathUpdate"
    />
    
    <!-- Business Rule Configuration Modal -->
    <BusinessRuleNodeConfigurationModal
      v-if="selectedNodeData && selectedNodeData.type === 'business-rule'"
      v-model="showBusinessRuleConfigModal"
      :nodeId="selectedNodeData.id"
      :nodeData="selectedNodeData.data"
      :availableVariables="gatewayAvailableVariables"
      @update="handleBusinessRuleUpdate"
    />
    
    <!-- Notification Configuration Modal -->
    <NotificationNodeConfigurationModal
      v-if="selectedNodeData && selectedNodeData.type === 'notification'"
      v-model="showNotificationConfigModal"
      :nodeData="selectedNodeData.data"
      :availableVariables="gatewayAvailableVariables"
      @update="handleNotificationNodeUpdate"
    />
    
    <!-- Process Templates Modal -->
    <ProcessTemplatesModal
      v-model="showTemplatesModal"
      @select-template="applyProcessTemplate"
    />
    
    <!-- Process Settings Modal -->
    <ProcessSettingsModal
      v-model="showProcessSettings"
    />
  </div>
</template>

<style scoped>
.process-builder {
  --flow-node-selected-color: theme('colors.blue.500');
  --flow-background-color: theme('colors.gray.100');
  --flow-connection-path-color: theme('colors.gray.400');
  --flow-connection-path-hover-color: theme('colors.blue.400');
}

:deep(.custom-node) {
  border-radius: 4px;
  padding: 10px;
}

:deep(.custom-node.selected) {
  border-color: var(--flow-node-selected-color);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
}

:deep(.custom-node-content) {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

:deep(.custom-node-title) {
  margin-top: 4px;
  text-align: center;
  font-weight: 500;
}

:deep(.node-gateway) {
  transform: rotate(45deg);
  background: white;
  border: 2px solid #FF9800;
}

:deep(.node-gateway .custom-node-content) {
  transform: rotate(-45deg);
}

:deep(.node-start), :deep(.node-end) {
  border-radius: 50%;
  width: 60px;
  height: 60px;
}

:deep(.node-task), :deep(.node-form), :deep(.node-script) {
  min-width: 160px;
  background: white;
  border: 1px solid #ddd;
}

:deep(.node-business-rule) {
  min-width: 160px;
  background: white;
  border: 1px solid #ddd;
  border-left: 4px solid #9333ea;  /* Purple border to match our icon color */
}

:deep(.node-notification) {
  min-width: 160px;
  background: white;
  border: 1px solid #ddd;
  border-left: 4px solid #3b82f6;  /* Blue border to match our icon color */
}

:deep(.node-details) {
  margin-top: 8px;
  font-size: 0.75rem;
  width: 100%;
}

:deep(.node-description) {
  color: #666;
  margin-bottom: 4px;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.process-builder-container {
  background-color: #f8fafc;
}

.process-name-input {
  width: 100%;
  max-width: 400px;
}

.process-name-input :deep(.formkit-inner) {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.process-name-input :deep(.formkit-inner:focus-within) {
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1);
}

.process-name-input :deep(input::placeholder) {
  color: rgba(255, 255, 255, 0.6);
}

.process-name-input :deep(.formkit-message) {
  color: rgba(255, 200, 200, 0.9);
  font-size: 0.7rem;
  position: absolute;
}

.process-builder-palette,
.process-builder-properties {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.process-component-item.dragging {
  opacity: 0.5;
  transform: scale(0.95);
}

.process-component-item {
  transition: all 0.2s ease;
  user-select: none;
}

.process-component-item:active {
  cursor: grabbing;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .process-builder-palette {
    width: 200px;
  }
  
  .process-builder-properties {
    width: 250px;
  }
}

@media (max-width: 768px) {
  .process-builder-actions {
    flex-wrap: wrap;
  }
  
  .process-builder-palette,
  .process-builder-properties {
    display: none;
  }
  
  .process-builder-canvas {
    width: 100%;
  }
}
</style> 