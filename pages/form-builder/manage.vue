<template>
  <div class="flex flex-col h-screen bg-gray-50">
    <!-- Header Bar -->
    <header
      class="bg-gray-800 px-4 py-4 flex items-center justify-between text-white shadow-md"
    >
      <div class="flex items-center gap-3">
        <Icon
          @click="goToDashboard"
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
        <h1 class="text-xl font-semibold text-white">Form Management</h1>
      </div>
      
      <div class="flex items-center gap-3">
        <RsButton @click="createNewForm" variant="primary" size="sm">
          <Icon name="material-symbols:add" class="mr-1" />
          Create New Form
        </RsButton>
      </div>
    </header>

    <!-- Main Content Area -->
    <div class="flex-1 p-6 overflow-auto">
      <!-- Filters and Search -->
      <div class="mb-6 flex flex-col sm:flex-row gap-4">
        <div class="relative flex-1 max-w-md">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search forms..."
            class="w-full px-4 py-2 pl-10 border rounded bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Icon name="material-symbols:search" class="text-lg" />
          </span>
        </div>
        
        <RsButton @click="loadForms" variant="tertiary" size="sm" :disabled="loading">
          <Icon name="material-symbols:refresh" class="mr-1" />
          Refresh
        </RsButton>
      </div>
      
      <!-- Loading State -->
      <div v-if="loading && formStore.savedForms.length === 0" class="flex justify-center items-center py-12">
        <div class="text-center">
          <Icon name="material-symbols:progress-activity" class="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
          <p class="text-gray-500">Loading forms...</p>
        </div>
      </div>
      
      <!-- Forms Table -->
      <div v-else class="bg-white shadow-md rounded-lg overflow-hidden">
        <table class="w-full table-auto">
          <thead class="bg-gray-50 border-b">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Components</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-if="filteredForms.length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                <div class="flex flex-col items-center">
                  <Icon name="material-symbols:description-outline" class="w-12 h-12 text-gray-300 mb-2" />
                  <p class="text-lg font-medium mb-1">No forms found</p>
                  <p class="text-sm">
                    {{ searchQuery ? 'Try adjusting your search terms' : 'Create your first form to get started' }}
                  </p>
                  <RsButton v-if="!searchQuery" @click="createNewForm" variant="primary" size="sm" class="mt-4">
                    <Icon name="material-symbols:add" class="mr-1" />
                    Create New Form
                  </RsButton>
                </div>
              </td>
            </tr>
            <tr v-for="form in filteredForms" :key="form.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="font-medium text-gray-900">{{ form.name || 'Untitled Form' }}</div>
                <div class="text-sm text-gray-500">ID: {{ form.id }}</div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-700 max-w-xs truncate">
                  {{ form.description || 'No description' }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-700">
                  {{ form.components ? form.components.length : 0 }} components
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">{{ formatDate(form.createdAt) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">{{ formatDate(form.updatedAt) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex space-x-2 justify-end">
                  <button 
                    @click="editForm(form.id)"
                    class="p-1 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded"
                    title="Edit Form"
                    :disabled="loading"
                  >
                    <Icon name="material-symbols:edit" class="text-lg" />
                  </button>
                  
                  <button 
                    @click="duplicateForm(form)"
                    class="p-1 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded"
                    title="Duplicate Form"
                    :disabled="loading"
                  >
                    <Icon name="material-symbols:content-copy" class="text-lg" />
                  </button>
                  
                  <button 
                    @click="confirmDelete(form.id)"
                    class="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                    title="Delete Form"
                    :disabled="loading"
                  >
                    <Icon name="material-symbols:delete" class="text-lg" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Global Loading Overlay -->
      <div v-if="loading && formStore.savedForms.length > 0" class="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 flex items-center space-x-3">
          <Icon name="material-symbols:progress-activity" class="w-6 h-6 animate-spin text-blue-500" />
          <span class="text-gray-700">Processing...</span>
        </div>
      </div>
    </div>
    
    <!-- Unsaved Changes Modal -->
    <RsModal v-model="showUnsavedChangesModal" title="Unsaved Changes" size="md" position="center">
      <div class="p-4">
        <div class="flex items-center mb-4">
          <Icon name="material-symbols:warning-outline" class="text-yellow-500 w-8 h-8 mr-3 flex-shrink-0" />
          <div>
            <p class="text-gray-600 font-medium mb-1">You have unsaved changes</p>
            <p class="text-gray-600 text-sm">
              Are you sure you want to create a new form? Your unsaved changes will be lost.
            </p>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <RsButton @click="cancelNavigation" variant="tertiary" :disabled="loading">
            Cancel
          </RsButton>
          <RsButton @click="confirmNavigation" variant="danger" :disabled="loading">
            Create New Form
          </RsButton>
        </div>
      </template>
    </RsModal>
    
    <!-- Delete confirmation dialog -->
    <RsModal v-model="showDeleteConfirm" title="Confirm Delete" size="md" position="center">
      <div class="p-4">
        <div class="flex items-center mb-4">
          <Icon name="material-symbols:warning-outline" class="text-yellow-500 w-8 h-8 mr-3 flex-shrink-0" />
          <div>
            <p class="text-gray-600 font-medium mb-1">Delete Form</p>
            <p class="text-gray-600 text-sm">
              Are you sure you want to delete this form? This action cannot be undone and will permanently remove all form data.
            </p>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <RsButton @click="cancelDelete" variant="tertiary" :disabled="loading">
            Cancel
          </RsButton>
          <RsButton @click="deleteForm" variant="danger" :disabled="loading">
            <Icon v-if="loading" name="material-symbols:progress-activity" class="w-4 h-4 animate-spin mr-1" />
            Delete
          </RsButton>
        </div>
      </template>
    </RsModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useFormBuilderStore } from '~/stores/formBuilder';
import { useRouter } from 'vue-router';

// Define page meta
definePageMeta({
  title: "Form Management",
  description: "Manage your forms",
  layout: "empty",
  middleware: ["auth"],
  requiresAuth: true,
});

// Initialize the store and router
const formStore = useFormBuilderStore();
const router = useRouter();

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

// State
const searchQuery = ref('');
const loading = ref(false);
const showDeleteConfirm = ref(false);
const formToDelete = ref(null);
const sortBy = ref('createdAt');
const sortOrder = ref('desc');
const showUnsavedChangesModal = ref(false);

// Filtered forms
const filteredForms = computed(() => {
  let filtered = formStore.savedForms;
  
  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      form => 
        (form.name && form.name.toLowerCase().includes(query)) || 
        (form.description && form.description.toLowerCase().includes(query))
    );
  }
  
  return filtered;
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

// Load forms from API
const loadForms = async () => {
  loading.value = true;
  try {
    await formStore.loadSavedForms();
  } catch (error) {
    console.error('Error loading forms:', error);
    toast.error('Failed to load forms: ' + (error.message || 'Unknown error'));
  } finally {
    loading.value = false;
  }
};

// Edit a form
const editForm = async (formId) => {
  try {
    // Navigate to form builder with the form ID as a query parameter
    router.push(`/form-builder?id=${formId}`);
  } catch (error) {
    console.error('Error navigating to form:', error);
    toast.error('Failed to open form');
  }
};

// Duplicate a form
const duplicateForm = async (form) => {
  try {
    loading.value = true;
    const newName = `${form.name || 'Form'} (Copy)`;
    
    // Create a copy of the form
    const duplicatedForm = {
      ...form,
      id: null, // Will get new ID when saved
      name: newName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Load the original form, duplicate it, and save as new
    await formStore.loadForm(form.id);
    formStore.setFormName(newName);
    await formStore.saveForm();
    
    // Refresh the form list
    await loadForms();
    
    toast.success(`Form "${newName}" duplicated successfully`);
  } catch (error) {
    console.error('Error duplicating form:', error);
    toast.error('Failed to duplicate form: ' + (error.message || 'Unknown error'));
  } finally {
    loading.value = false;
  }
};

// Delete a form
const deleteForm = async () => {
  if (!formToDelete.value) return;
  
  try {
    loading.value = true;
    await formStore.deleteForm(formToDelete.value);
    
    // Refresh the form list
    await loadForms();
    
    showDeleteConfirm.value = false;
    formToDelete.value = null;
    
    toast.success('Form deleted successfully');
  } catch (error) {
    console.error('Error deleting form:', error);
    toast.error('Failed to delete form: ' + (error.message || 'Unknown error'));
  } finally {
    loading.value = false;
  }
};

// Show delete confirmation
const confirmDelete = (formId) => {
  formToDelete.value = formId;
  showDeleteConfirm.value = true;
};

// Close delete confirmation
const cancelDelete = () => {
  showDeleteConfirm.value = false;
  formToDelete.value = null;
};

// Create a new form
const createNewForm = () => {
  if (formStore.hasUnsavedChanges) {
    showUnsavedChangesModal.value = true;
  } else {
    // Clear current form to start fresh
    formStore.clearForm();
    router.push('/form-builder');
  }
};

// Navigation handlers for unsaved changes
const cancelNavigation = () => {
  showUnsavedChangesModal.value = false;
};

const confirmNavigation = () => {
  showUnsavedChangesModal.value = false;
  formStore.clearForm();
  router.push('/form-builder');
};

// Go back to main dashboard
const goToDashboard = () => {
  router.push('/');
};

// Load forms on component mount
onMounted(async () => {
  await loadForms();
});
</script>

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
