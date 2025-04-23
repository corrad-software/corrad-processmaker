<script setup>
import { ref, computed, onMounted } from 'vue';
import { useProcessBuilderStore } from '~/stores/processBuilder';
import { useRouter } from 'vue-router';

// Initialize the store and router
const processStore = useProcessBuilderStore();
const router = useRouter();

// Reference to the search input
const searchQuery = ref('');

// Confirmation dialog state
const showDeleteConfirm = ref(false);
const processToDelete = ref(null);

// Filtered processes
const filteredProcesses = computed(() => {
  if (!searchQuery.value) {
    return processStore.processes;
  }
  
  const query = searchQuery.value.toLowerCase();
  return processStore.processes.filter(
    process => process.name.toLowerCase().includes(query) || 
               process.description.toLowerCase().includes(query)
  );
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

// Edit a process
const editProcess = (processId) => {
  processStore.setCurrentProcess(processId);
  router.push('/process-builder');
};

// Duplicate a process
const duplicateProcess = (process) => {
  const newName = `${process.name} (Copy)`;
  const newProcess = processStore.createProcess(newName, process.description);
  
  // Copy nodes and edges
  process.nodes.forEach(node => {
    processStore.addNode({
      ...node,
      id: undefined // Let the store generate a new ID
    });
  });
  
  process.edges.forEach(edge => {
    processStore.addEdge({
      ...edge,
      id: undefined // Let the store generate a new ID
    });
  });
  
  processStore.saveProcess();
};

// Delete a process
const deleteProcess = () => {
  if (processToDelete.value) {
    processStore.deleteProcess(processToDelete.value);
    showDeleteConfirm.value = false;
    processToDelete.value = null;
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
  processStore.currentProcess = null;
  router.push('/process-builder');
};

// Go back to builder
const goToBuilder = () => {
  router.push('/process-builder');
};

// Check if we have processes, if not create a demo one
onMounted(() => {
  if (processStore.processes.length === 0) {
    // Create a demo process
    const process = processStore.createProcess(
      'Demo Process',
      'A demonstration process flow for testing purposes'
    );
    
    // Save it
    processStore.saveProcess();
  }
});
</script>

<template>
  <div class="process-management p-6">
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center">
        <button 
          @click="goToBuilder" 
          class="mr-3 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <i class="material-icons">arrow_back</i>
        </button>
        <h1 class="text-2xl font-bold">Process Management</h1>
      </div>
      
      <button
        @click="createNewProcess"
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Create New Process
      </button>
    </div>
    
    <div class="mb-6">
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search processes..."
          class="w-full px-4 py-2 pl-10 border rounded"
        />
        <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <i class="material-icons text-lg">search</i>
        </span>
      </div>
    </div>
    
    <div class="bg-white shadow-md rounded-lg overflow-hidden">
      <table class="w-full table-auto">
        <thead class="bg-gray-50 border-b">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-if="filteredProcesses.length === 0">
            <td colspan="5" class="px-6 py-4 text-center text-gray-500 italic">
              No processes found
            </td>
          </tr>
          <tr v-for="process in filteredProcesses" :key="process.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="font-medium text-gray-900">{{ process.name }}</div>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm text-gray-500 truncate max-w-xs">{{ process.description }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-500">{{ formatDate(process.createdAt) }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-500">{{ formatDate(process.updatedAt) }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <div class="flex space-x-2 justify-end">
                <button 
                  @click="editProcess(process.id)"
                  class="text-blue-600 hover:text-blue-900"
                  title="Edit Process"
                >
                  <i class="material-icons">edit</i>
                </button>
                <button 
                  @click="duplicateProcess(process)"
                  class="text-green-600 hover:text-green-900"
                  title="Duplicate Process"
                >
                  <i class="material-icons">content_copy</i>
                </button>
                <button 
                  @click="confirmDelete(process.id)"
                  class="text-red-600 hover:text-red-900"
                  title="Delete Process"
                >
                  <i class="material-icons">delete</i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Delete confirmation dialog -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-96">
        <h3 class="text-lg font-bold mb-4">Confirm Delete</h3>
        <p class="mb-6">Are you sure you want to delete this process? This action cannot be undone.</p>
        <div class="flex justify-end space-x-2">
          <button 
            @click="cancelDelete"
            class="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button 
            @click="deleteProcess"
            class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.process-management {
  min-height: calc(100vh - 80px);
}
</style> 