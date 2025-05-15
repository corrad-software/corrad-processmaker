<template>
  <div class="form-selector">
    <div class="form-selector-header mb-2">
      <h3 class="text-sm font-medium text-gray-700">Form Selection</h3>
    </div>
    
    <div v-if="loading" class="flex justify-center py-4">
      <div class="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
    </div>
    
    <div v-else-if="forms.length === 0" class="text-center py-4 text-gray-500">
      <p>No forms available</p>
      <RsButton 
        variant="secondary" 
        size="sm" 
        class="mt-2"
        @click="createNewForm"
      >
        Create New Form
      </RsButton>
    </div>
    
    <div v-else class="form-selector-content">
      <div class="form-search mb-2">
        <FormKit
          type="text"
          name="formSearch"
          placeholder="Search forms..."
          v-model="searchQuery"
          :delay="200"
          :classes="{
            outer: 'mb-0',
            input: 'w-full'
          }"
        />
      </div>
      
      <div class="form-list max-h-60 overflow-y-auto border rounded-md">
        <div
          v-for="form in filteredForms"
          :key="form.formUUID"
          class="form-item p-2 hover:bg-gray-50 cursor-pointer border-b"
          :class="{'bg-blue-50': selectedFormId === form.formID}"
          @click="selectForm(form)"
        >
          <div class="flex justify-between items-center">
            <div>
              <div class="font-medium text-sm">{{ form.formName }}</div>
              <div class="text-xs text-gray-500 truncate">{{ form.formDescription || 'No description' }}</div>
            </div>
            <div v-if="selectedFormId === form.formID" class="text-blue-500">
              <Icon name="material-symbols:check-circle" />
            </div>
          </div>
        </div>
      </div>
      
      <div class="form-selector-footer mt-3 flex justify-between">
        <RsButton 
          variant="secondary" 
          size="sm" 
          @click="createNewForm"
        >
          Create New
        </RsButton>
        
        <RsButton 
          v-if="selectedForm"
          variant="secondary" 
          size="sm" 
          @click="previewForm"
        >
          Preview Form
        </RsButton>
      </div>
    </div>
    
    <div v-if="selectedForm" class="selected-form-preview mt-4 p-3 border rounded-md bg-gray-50">
      <div class="flex justify-between items-center mb-2">
        <h4 class="text-sm font-medium">Selected Form</h4>
        <div @click="clearSelection" class="text-red-500 cursor-pointer text-sm">
          <Icon name="material-symbols:close" />
        </div>
      </div>
      
      <div class="text-sm">{{ selectedForm.formName }}</div>
      <div class="text-xs text-gray-500">{{ selectedForm.formDescription || 'No description' }}</div>
      
      <div class="mt-2 text-xs text-gray-500">
        <div class="flex justify-between">
          <span>Created:</span>
          <span>{{ formatDate(selectedForm.formCreatedDate) }}</span>
        </div>
        <div class="flex justify-between">
          <span>Status:</span>
          <span class="capitalize">{{ selectedForm.formStatus }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useFormBuilderStore } from '~/stores/formBuilder';
import { useRouter } from 'vue-router';

const props = defineProps({
  formId: {
    type: Number,
    default: null
  },
  nodeData: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['select', 'clear']);

const router = useRouter();
const formStore = useFormBuilderStore();
const forms = ref([]);
const loading = ref(true);
const searchQuery = ref('');
const selectedFormId = ref(props.formId);
const selectedNodeData = ref(null);

// Fetch forms from the API
const fetchForms = async () => {
  loading.value = true;
  try {
    // Use the API endpoint we created
    const response = await fetch('/api/forms');
    const result = await response.json();
    
    if (result.success && Array.isArray(result.forms)) {
      forms.value = result.forms;
    } else {
      console.error('Error in API response:', result.error || 'Unknown error');
      forms.value = [];
    }
  } catch (error) {
    console.error('Error fetching forms:', error);
    forms.value = [];
  } finally {
    loading.value = false;
  }
};

// Filter forms based on search query
const filteredForms = computed(() => {
  if (!searchQuery.value) return forms.value;
  const query = searchQuery.value.toLowerCase();
  return forms.value.filter(form => 
    form.formName.toLowerCase().includes(query) || 
    (form.formDescription && form.formDescription.toLowerCase().includes(query))
  );
});

// Get the selected form
const selectedForm = computed(() => {
  if (!selectedFormId.value) return null;
  return forms.value.find(form => form.formID === selectedFormId.value);
});

// Select a form
const selectForm = async (form) => {
  selectedFormId.value = form.formID;
  
  try {
    // If we have a task ID in the node, update the task in the database
    if (selectedNodeData.value?.id) {
      const response = await fetch(`/api/tasks/${selectedNodeData.value.id}/form`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          formId: form.formID
        })
      });
      
      const result = await response.json();
      
      if (!result.success) {
        console.error('Error connecting form to task:', result.error);
      }
    }
    
    // Emit the form selection event for parent components
    emit('select', form);
  } catch (error) {
    console.error('Error selecting form:', error);
  }
};

// Clear the selection
const clearSelection = async () => {
  selectedFormId.value = null;
  
  try {
    // If we have a task ID in the node, remove the form from the task in the database
    if (selectedNodeData.value?.id) {
      const response = await fetch(`/api/tasks/${selectedNodeData.value.id}/form`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (!result.success) {
        console.error('Error removing form from task:', result.error);
      }
    }
    
    // Emit the clear selection event for parent components
    emit('clear');
  } catch (error) {
    console.error('Error clearing form selection:', error);
  }
};

// Navigate to create a new form
const createNewForm = () => {
  router.push('/form-builder');
};

// Preview the selected form
const previewForm = () => {
  // This would open a preview modal or navigate to form preview
  // For now, we'll just navigate to the form builder with the form ID
  if (selectedForm.value) {
    router.push(`/form-builder?id=${selectedForm.value.formUUID}`);
  }
};

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

// Load forms when component mounts
onMounted(() => {
  fetchForms();
  selectedNodeData.value = props.nodeData;
});
</script>

<style scoped>
.form-selector {
  border-radius: 0.375rem;
}

.form-list {
  border-radius: 0.375rem;
}

.form-item:last-child {
  border-bottom: none;
}
</style> 