<template>
  <div class="history-panel">
    <div v-if="formStore.actionHistory.length === 0" class="p-4 text-center text-gray-500">
      <p class="text-sm">No history yet</p>
      <p class="text-xs mt-1">Actions will appear here</p>
    </div>
    
    <div v-else class="history-entries">
      <div class="history-controls px-3 py-2 border-b border-gray-200 flex items-center justify-between">
        <div class="flex items-center">
          <button 
            @click="handleUndo" 
            class="p-1.5 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded"
            :disabled="!canUndo"
            title="Undo (Ctrl+Z)"
          >
            <div class="flex items-center">
              <Icon name="material-symbols:undo" class="w-4 h-4" />
              <span class="ml-1 text-xs hidden sm:inline">Undo</span>
              <span class="ml-1 text-xs text-gray-400 hidden sm:inline">(Ctrl+Z)</span>
            </div>
          </button>
          <button 
            @click="handleRedo" 
            class="p-1.5 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded ml-1"
            :disabled="!canRedo"
            title="Redo (Ctrl+Y)"
          >
            <div class="flex items-center">
              <Icon name="material-symbols:redo" class="w-4 h-4" />
              <span class="ml-1 text-xs hidden sm:inline">Redo</span>
              <span class="ml-1 text-xs text-gray-400 hidden sm:inline">(Ctrl+Y)</span>
            </div>
          </button>
        </div>
        <div class="text-xs text-gray-500 flex items-center">
          <span class="mr-1">{{ formStore.actionHistory.length > 0 ? formStore.currentHistoryIndex + 1 : 0 }} / {{ formStore.actionHistory.length }}</span>
          <span
            v-if="formStore.actionHistory.length > 0" 
            class="hint-text text-blue-400 cursor-help ml-1"
            title="Ctrl+Z: Undo | Ctrl+Y: Redo | Click on any history entry to jump to that state"
          >
            <Icon name="material-symbols:info-outline" class="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
      
      <div class="history-list overflow-y-auto flex-1">
        <div
          v-for="(entry, index) in formStore.historyEntries"
          :key="entry.id"
          @click="jumpToHistoryState(index)"
          class="history-entry px-3 py-1.5 border-b border-gray-100 flex items-center cursor-pointer"
          :class="{
            'bg-blue-50': entry.isCurrent,
            'hover:bg-gray-50': !entry.isCurrent
          }"
        >
          <div class="flex-1">
            <div class="flex items-center">
              <div class="history-action-icon mr-2">
                <Icon 
                  :name="getActionIcon(entry.action)" 
                  class="w-4 h-4" 
                  :class="getActionIconColor(entry.action)"
                />
              </div>
              <div class="text-sm font-medium">{{ getActionName(entry.action) }}</div>
            </div>
            <div class="text-xs text-gray-500 mt-0.5">{{ getActionDescription(entry) }}</div>
          </div>
          <div class="ml-2 text-xs text-gray-400">
            {{ formatTimestamp(entry.timestamp) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useFormBuilderStore } from "~/stores/formBuilder";
import { computed } from 'vue';

const formStore = useFormBuilderStore();

// Computed properties for undo/redo capabilities
const canUndo = computed(() => formStore.currentHistoryIndex > 0);
const canRedo = computed(() => 
  formStore.actionHistory.length > 0 && 
  formStore.currentHistoryIndex < formStore.actionHistory.length - 1
);

// Handle undo and redo actions
const handleUndo = () => {
  formStore.undo();
};

const handleRedo = () => {
  formStore.redo();
};

// Jump to a specific history state
const jumpToHistoryState = (index) => {
  if (index === formStore.currentHistoryIndex) return;
  
  // Get the target history entry
  const targetEntry = formStore.actionHistory[index];
  if (!targetEntry) return;
  
  // Direct restore to target state 
  formStore.restoreStateFromHistory(targetEntry.formState);
  
  // Update the current history index to match
  formStore.currentHistoryIndex = index;
  
  // Mark as having unsaved changes
  formStore.hasUnsavedChanges = true;
};

// Format timestamp (e.g., "5m ago")
const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  
  if (diffMin < 1) return 'just now';
  if (diffMin === 1) return '1m ago';
  if (diffMin < 60) return `${diffMin}m ago`;
  
  const diffHour = Math.round(diffMin / 60);
  if (diffHour === 1) return '1h ago';
  if (diffHour < 24) return `${diffHour}h ago`;
  
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Get the icon for a specific action
const getActionIcon = (action) => {
  switch (action) {
    case 'new_form': return 'material-symbols:note-add';
    case 'add_component': return 'material-symbols:add-circle-outline';
    case 'update_component': return 'material-symbols:edit-outline';
    case 'delete_component': return 'material-symbols:delete-outline';
    case 'move_component': return 'material-symbols:swap-vert';
    case 'change_form_name': return 'material-symbols:edit-document';
    case 'change_form_description': return 'material-symbols:description-outline';
    case 'save_form': return 'material-symbols:save';
    case 'load_form': return 'material-symbols:folder-open';
    default: return 'material-symbols:history';
  }
};

// Get the color class for action icons
const getActionIconColor = (action) => {
  switch (action) {
    case 'new_form': return 'text-blue-600';
    case 'add_component': return 'text-green-600';
    case 'update_component': return 'text-blue-600';
    case 'delete_component': return 'text-red-600';
    case 'move_component': return 'text-purple-600';
    case 'save_form': return 'text-green-600';
    case 'load_form': return 'text-blue-600';
    default: return 'text-gray-600';
  }
};

// Get a human-readable name for the action
const getActionName = (action) => {
  switch (action) {
    case 'new_form': return 'New Form';
    case 'add_component': return 'Add Component';
    case 'update_component': return 'Update Component';
    case 'delete_component': return 'Delete Component';
    case 'move_component': return 'Move Component';
    case 'change_form_name': return 'Rename Form';
    case 'change_form_description': return 'Edit Description';
    case 'save_form': return 'Save Form';
    case 'load_form': return 'Load Form';
    default: return 'Action';
  }
};

// Get a description for the specific action
const getActionDescription = (entry) => {
  const { action, details } = entry;
  
  switch (action) {
    case 'new_form':
      return 'Created a new empty form';
    
    case 'add_component':
      return `Added ${details.componentName || details.componentType}`;
    
    case 'update_component':
      return `Updated ${details.componentName || details.componentType}`;
    
    case 'delete_component':
      return `Deleted ${details.componentName || details.componentType}`;
    
    case 'move_component':
      return `Moved ${details.componentName} from position ${details.oldIndex + 1} to ${details.newIndex + 1}`;
    
    case 'change_form_name':
      return `Changed form name to "${details.newName}"`;
    
    case 'change_form_description':
      return `Updated form description`;
    
    case 'save_form':
      return `Saved form "${details.formName}" with ${details.componentCount} components`;
    
    case 'load_form':
      return `Loaded form "${details.formName}"`;
    
    default:
      return 'Unknown action';
  }
};
</script>

<style scoped>
.history-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.history-entries {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.history-list {
  height: calc(100% - 40px);
}

.history-entry {
  transition: background-color 0.1s ease;
}

.history-entry.bg-blue-50 {
  border-left: 3px solid #3b82f6;
}
</style> 