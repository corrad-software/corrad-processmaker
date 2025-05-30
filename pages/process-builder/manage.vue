<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import { useProcessBuilderStore } from '~/stores/processBuilder';
import { useRouter } from 'vue-router';

// Define page meta
definePageMeta({
  title: "Process Management",
  description: "Manage your business processes",
  layout: "empty",
  middleware: ["auth"],
  requiresAuth: true,
});

// Initialize the store and router
const processStore = useProcessBuilderStore();
const router = useRouter();

// State
const searchQuery = ref('');
const loading = ref(false);
const showDeleteConfirm = ref(false);
const processToDelete = ref(null);
const statusFilter = ref('');
const sortBy = ref('processCreatedDate');
const sortOrder = ref('desc');

// Status options for filtering
const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
  { value: 'deleted', label: 'Deleted' }
];

// Filtered processes - now just returns the processes from store since filtering happens on backend
const filteredProcesses = computed(() => {
  return processStore.processes;
});

// Format date for display
const formatDate = (isoString) => {
  if (!isoString) return '';
  
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  }).format(date);
};

// Get status badge variant
const getStatusVariant = (status) => {
  switch (status) {
    case 'published': return 'success';
    case 'draft': return 'warning';
    case 'archived': return 'secondary';
    case 'deleted': return 'danger';
    default: return 'primary';
  }
};

// Load processes from API with filters
const loadProcesses = async () => {
  loading.value = true;
  try {
    const options = {
      sortBy: sortBy.value,
      sortOrder: sortOrder.value
    };
    
    // Add filters if they have values
    if (statusFilter.value) {
      options.status = statusFilter.value;
    }
    
    if (searchQuery.value.trim()) {
      options.search = searchQuery.value.trim();
    }
    
    await processStore.fetchProcesses(options);
  } catch (error) {
    console.error('Error loading processes:', error);
    // TODO: Show error notification
  } finally {
    loading.value = false;
  }
};

// Watch for changes in filters and reload processes
watch([searchQuery, statusFilter], () => {
  // Debounce the search to avoid too many API calls
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    loadProcesses();
  }, 500);
});

let searchTimeout = null;

// Edit a process
const editProcess = async (processId) => {
  try {
    // Navigate to process builder with the process ID as a query parameter
    router.push(`/process-builder?id=${processId}`);
  } catch (error) {
    console.error('Error navigating to process:', error);
    // TODO: Show error notification
  }
};

// Duplicate a process
const duplicateProcess = async (process) => {
  try {
    loading.value = true;
    const newName = `${process.name} (Copy)`;
    await processStore.duplicateProcess(process.id, newName);
    
    // Refresh the process list
    await loadProcesses();
    
    // TODO: Show success notification
  } catch (error) {
    console.error('Error duplicating process:', error);
    // TODO: Show error notification
  } finally {
    loading.value = false;
  }
};

// Delete a process
const deleteProcess = async () => {
  if (!processToDelete.value) return;
  
  try {
    loading.value = true;
    await processStore.deleteProcess(processToDelete.value);
    
    // Refresh the process list
    await loadProcesses();
    
    showDeleteConfirm.value = false;
    processToDelete.value = null;
    
    // TODO: Show success notification
  } catch (error) {
    console.error('Error deleting process:', error);
    // TODO: Show error notification
  } finally {
    loading.value = false;
  }
};

// Publish a process
const publishProcess = async (processId) => {
  try {
    loading.value = true;
    await processStore.publishProcess(processId);
    
    // Refresh the process list
    await loadProcesses();
    
    // TODO: Show success notification
  } catch (error) {
    console.error('Error publishing process:', error);
    // TODO: Show error notification
  } finally {
    loading.value = false;
  }
};

// Restore a deleted process
const restoreProcess = async (processId) => {
  try {
    loading.value = true;
    await processStore.restoreProcess(processId);
    
    // Refresh the process list
    await loadProcesses();
    
    // TODO: Show success notification
  } catch (error) {
    console.error('Error restoring process:', error);
    // TODO: Show error notification
  } finally {
    loading.value = false;
  }
};

// Show delete confirmation
const confirmDelete = (processId) => {
  processToDelete.value = processId;
  showDeleteConfirm.value = true;
};

// Close delete confirmation
const cancelDelete = () => {
  showDeleteConfirm.value = false;
  processToDelete.value = null;
};

// Create a new process
const createNewProcess = () => {
  // Clear current process to start fresh
  processStore.clearCurrentProcess();
  router.push('/process-builder');
};

// Go back to builder
const goToBuilder = () => {
  router.push('/');
};

// Load processes on component mount
onMounted(async () => {
  await loadProcesses();
});

// Clear all filters
const clearFilters = () => {
  searchQuery.value = '';
  statusFilter.value = '';
  // loadProcesses will be called automatically by the watcher
};

// Clean up the search timeout on component unmount
onUnmounted(() => {
  clearTimeout(searchTimeout);
});
</script>

<template>
  <div class="flex flex-col h-screen bg-gray-50">
    <!-- Header Bar -->
    <header
      class="bg-gray-800 px-4 py-4 flex items-center justify-between text-white shadow-md"
    >
      <div class="flex items-center gap-3">
        <Icon
          @click="goToBuilder"
          name="ph:arrow-circle-left-duotone"
          class="cursor-pointer w-6 h-6 hover:text-gray-300"
        />
        <img
          src="@/assets/img/logo/logo-word-white.svg"
          alt="Corrad Logo"
          class="h-7"
        />
      </div>

      <div class="flex items-center gap-3">
        <h1 class="text-xl font-semibold text-white">Process Management</h1>
      </div>
      
      <div class="flex items-center gap-3">
        <RsButton @click="createNewProcess" variant="primary" size="sm">
          <Icon name="material-symbols:add" class="mr-1" />
          Create New Process
        </RsButton>
      </div>
    </header>

    <!-- Main Content Area -->
    <div class="flex-1 p-6 overflow-auto">
      <!-- Filters and Search -->
      <div class="mb-6 flex flex-col sm:flex-row gap-4">
        <div class="flex-1 max-w-md">
          <FormKit
            v-model="searchQuery"
            type="text"
            placeholder="Search processes..."
            :classes="{
              outer: 'mb-0',
              wrapper: 'relative',
              inner: 'relative',
              input: 'w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
              prefixIcon: 'absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none'
            }"
          >
            <template #prefixIcon>
              <Icon name="material-symbols:search" class="text-lg" />
            </template>
          </FormKit>
        </div>
        
        <div class="min-w-48">
          <FormKit
            v-model="statusFilter"
            type="select"
            :options="statusOptions"
            placeholder="Filter by status"
            :classes="{
              outer: 'mb-0',
              input: 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white'
            }"
          />
        </div>
        
        <div class="flex gap-2">
          <RsButton @click="clearFilters" variant="secondary" size="sm" :disabled="loading" v-if="searchQuery || statusFilter">
            <Icon name="material-symbols:filter-alt-off" class="mr-1" />
            Clear Filters
          </RsButton>
          
          <RsButton @click="loadProcesses" variant="tertiary" size="sm" :disabled="loading">
            <Icon name="material-symbols:refresh" class="mr-1" />
            Refresh
          </RsButton>
        </div>
      </div>
      
      <!-- Loading State -->
      <div v-if="loading && processStore.processes.length === 0" class="flex justify-center items-center py-12">
        <div class="text-center">
          <Icon name="material-symbols:progress-activity" class="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
          <p class="text-gray-500">Loading processes...</p>
        </div>
      </div>
      
      <!-- Processes Table -->
      <div v-else class="bg-white shadow-md rounded-lg overflow-hidden">
        <table class="w-full table-auto">
          <thead class="bg-gray-50 border-b">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-if="filteredProcesses.length === 0">
              <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                <div class="flex flex-col items-center">
                  <Icon name="material-symbols:folder-open-outline" class="w-12 h-12 text-gray-300 mb-2" />
                  <p class="text-lg font-medium mb-1">
                    {{ (searchQuery || statusFilter) ? 'No processes match your filters' : 'No processes found' }}
                  </p>
                  <p class="text-sm mb-2">
                    {{ (searchQuery || statusFilter) ? 'Try adjusting your search or filter criteria' : 'Create your first process to get started' }}
                  </p>
                  
                  <!-- Show current filters if any -->
                  <div v-if="searchQuery || statusFilter" class="text-xs text-gray-400 mb-4 space-y-1">
                    <div v-if="searchQuery">Search: "{{ searchQuery }}"</div>
                    <div v-if="statusFilter">Status: {{ statusOptions.find(opt => opt.value === statusFilter)?.label }}</div>
                  </div>
                  
                  <div class="flex gap-2">
                    <RsButton v-if="searchQuery || statusFilter" @click="clearFilters" variant="secondary" size="sm">
                      <Icon name="material-symbols:filter-alt-off" class="mr-1" />
                      Clear Filters
                    </RsButton>
                    <RsButton v-if="!searchQuery && !statusFilter" @click="createNewProcess" variant="primary" size="sm">
                      <Icon name="material-symbols:add" class="mr-1" />
                      Create New Process
                    </RsButton>
                  </div>
                </div>
              </td>
            </tr>
            <tr v-for="process in filteredProcesses" :key="process.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="font-medium text-gray-900">{{ process.name }}</div>
                <div v-if="process.creator" class="text-sm text-gray-500">
                  by {{ process.creator.userFullName || process.creator.userUsername }}
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-700 max-w-xs truncate">
                  {{ process.description || 'No description' }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <RsBadge :variant="getStatusVariant(process.status)">
                  {{ process.status || 'draft' }}
                </RsBadge>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-700">
                  {{ process.category || '-' }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">{{ formatDate(process.createdAt) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">{{ formatDate(process.updatedAt) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex space-x-2 justify-end">
                  <!-- Show restore button for deleted processes -->
                  <button 
                    v-if="process.status === 'deleted'"
                    @click="restoreProcess(process.id)"
                    class="p-1 text-green-600 hover:text-green-900 hover:bg-green-50 rounded"
                    title="Restore Process"
                    :disabled="loading"
                  >
                    <Icon name="material-symbols:restore" class="text-lg" />
                  </button>
                  
                  <!-- Regular action buttons for non-deleted processes -->
                  <template v-else>
                    <button 
                      @click="editProcess(process.id)"
                      class="p-1 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded"
                      title="Edit Process"
                      :disabled="loading"
                    >
                      <Icon name="material-symbols:edit" class="text-lg" />
                    </button>
                    
                    <button 
                      v-if="process.status === 'draft'"
                      @click="publishProcess(process.id)"
                      class="p-1 text-green-600 hover:text-green-900 hover:bg-green-50 rounded"
                      title="Publish Process"
                      :disabled="loading"
                    >
                      <Icon name="material-symbols:publish" class="text-lg" />
                    </button>
                    
                    <button 
                      @click="duplicateProcess(process)"
                      class="p-1 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded"
                      title="Duplicate Process"
                      :disabled="loading"
                    >
                      <Icon name="material-symbols:content-copy" class="text-lg" />
                    </button>
                    
                    <button 
                      @click="confirmDelete(process.id)"
                      class="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                      title="Delete Process"
                      :disabled="loading || process.status === 'published'"
                    >
                      <Icon name="material-symbols:delete" class="text-lg" />
                    </button>
                  </template>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Global Loading Overlay -->
      <div v-if="loading && processStore.processes.length > 0" class="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 flex items-center space-x-3">
          <Icon name="material-symbols:progress-activity" class="w-6 h-6 animate-spin text-blue-500" />
          <span class="text-gray-700">Processing...</span>
        </div>
      </div>
    </div>
    
    <!-- Delete confirmation dialog -->
    <RsModal v-model="showDeleteConfirm" title="Move Process to Trash" size="md" position="center">
      <div class="p-4">
        <div class="flex items-center mb-4">
          <Icon name="material-symbols:delete-outline" class="text-orange-500 w-8 h-8 mr-3 flex-shrink-0" />
          <div>
            <p class="text-gray-600 font-medium mb-1">Move to Trash</p>
            <p class="text-gray-600 text-sm">
              This process will be moved to trash but not permanently deleted. You can restore it later from the "Deleted" filter if needed.
            </p>
            <p class="text-gray-500 text-xs mt-2">
              Note: Published processes cannot be deleted and must be unpublished first.
            </p>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <RsButton @click="cancelDelete" variant="tertiary" :disabled="loading">
            Cancel
          </RsButton>
          <RsButton @click="deleteProcess" variant="warning" :disabled="loading">
            <Icon v-if="loading" name="material-symbols:progress-activity" class="w-4 h-4 animate-spin mr-1" />
            Move to Trash
          </RsButton>
        </div>
      </template>
    </RsModal>
  </div>
</template>

<style scoped>
/* Custom styles for better UX */
.hover\:bg-gray-50:hover {
  transition: background-color 0.15s ease-in-out;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style> 