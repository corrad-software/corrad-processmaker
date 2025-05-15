<script setup>
import { ref, computed, onMounted } from 'vue';
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
  router.push('/');
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
  <div class="flex flex-col h-screen bg-gray-50">
    <!-- Header Bar -->
    <header
      class="bg-gray-800 px-4 py-4 flex items-center justify-between text-white shadow-md"
    >
      <div class="flex items-center gap-3">
        <Icon
          @click="goToBuilder"
          name="ph:arrow-circle-left-duotone"
          class="cursor-pointer w-6 h-6"
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
      <div class="mb-6">
        <div class="relative max-w-md">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search processes..."
            class="w-full px-4 py-2 pl-10 border rounded bg-white"
          />
          <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Icon name="material-symbols:search" class="text-lg" />
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
                <div class="flex space-x-3 justify-end">
                  <button 
                    @click="editProcess(process.id)"
                    class="text-blue-600 hover:text-blue-900"
                    title="Edit Process"
                  >
                    <Icon name="material-symbols:edit" class="text-lg" />
                  </button>
                  <button 
                    @click="duplicateProcess(process)"
                    class="text-green-600 hover:text-green-900"
                    title="Duplicate Process"
                  >
                    <Icon name="material-symbols:content-copy" class="text-lg" />
                  </button>
                  <button 
                    @click="confirmDelete(process.id)"
                    class="text-red-600 hover:text-red-900"
                    title="Delete Process"
                  >
                    <Icon name="material-symbols:delete" class="text-lg" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Delete confirmation dialog -->
    <RsModal v-model="showDeleteConfirm" title="Confirm Delete" size="md" position="center">
      <div class="p-4">
        <div class="flex items-center mb-4">
          <Icon name="material-symbols:warning-outline" class="text-yellow-500 w-8 h-8 mr-3" />
          <div>
            <p class="text-gray-600">Are you sure you want to delete this process? This action cannot be undone.</p>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <RsButton @click="cancelDelete" variant="tertiary">
            Cancel
          </RsButton>
          <RsButton @click="deleteProcess" variant="danger">
            Delete
          </RsButton>
        </div>
      </template>
    </RsModal>
  </div>
</template>

<style scoped>
/* No need for any special styles, using the flex layout */
</style> 