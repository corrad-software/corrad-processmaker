<template>
  <div class="flex flex-col h-screen bg-gray-50">
    <!-- Header Bar -->
    <header
      class="bg-gray-800 px-4 py-4 flex items-center justify-between text-white shadow-md"
    >
      <div class="flex items-center gap-3">
        <Icon
          @click="navigateTo('/', { external: true })"
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
        <FormKit
          type="text"
          name="formName"
          placeholder="Form Name"
          v-model="formName"
          validation="required"
          validation-visibility="live"
          :validation-messages="{ required: 'Please enter a form name' }"
          class="form-name-input"
          :classes="{
            outer: 'mb-0',
          }"
        />

        <RsButton @click="handleSave" variant="primary" size="sm">
          <Icon name="material-symbols:save" class="mr-1" />
          Save Form
        </RsButton>

        <RsButton @click="handlePreview" variant="secondary" size="sm">
          <Icon name="material-symbols:preview" class="mr-1" />
          Preview
        </RsButton>

        <RsButton @click="navigateToManage" variant="secondary" size="sm">
          <Icon name="material-symbols:settings" class="mr-1" />
          Manage Forms
        </RsButton>
      </div>
    </header>

    <!-- Main Content Area -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Left Panel - Components Sidebar -->
      <div
        class="w-64 bg-white border-r border-gray-200 flex flex-col overflow-hidden"
      >
        <div class="border-b border-gray-200">
          <div class="flex">
            <button
              @click="leftSidebarTab = 'components'"
              class="px-4 py-3 text-sm font-medium flex-1"
              :class="{
                'text-blue-600 border-b-2 border-blue-600': leftSidebarTab === 'components',
                'text-gray-500 hover:text-gray-700': leftSidebarTab !== 'components'
              }"
            >
              <div class="flex items-center justify-center">
                <Icon name="material-symbols:category" class="w-4 h-4 mr-1.5" />
                Components
              </div>
            </button>
            <button
              @click="leftSidebarTab = 'history'"
              class="px-4 py-3 text-sm font-medium flex-1"
              :class="{
                'text-blue-600 border-b-2 border-blue-600': leftSidebarTab === 'history',
                'text-gray-500 hover:text-gray-700': leftSidebarTab !== 'history'
              }"
            >
              <div class="flex items-center justify-center">
                <Icon name="material-symbols:history" class="w-4 h-4 mr-1.5" />
                History
              </div>
            </button>
          </div>
        </div>
        
        <!-- Components Tab Content -->
        <div v-if="leftSidebarTab === 'components'" class="overflow-y-auto flex-1">
          <div
            class="p-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center"
          >
            <h2 class="text-sm font-medium text-gray-700">Components</h2>
            <div class="relative">
              <button class="px-2 py-1 text-xs text-gray-500 hover:text-gray-700">
                <Icon name="material-symbols:refresh" class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <FormBuilderComponents @add-component="handleAddComponent" />
        </div>
        
        <!-- History Tab Content -->
        <div v-else-if="leftSidebarTab === 'history'" class="overflow-y-auto flex-1">
          <div
            class="p-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center"
          >
            <h2 class="text-sm font-medium text-gray-700">History</h2>
            <div class="flex items-center space-x-1">
              <button 
                @click="formStore.undo()" 
                class="p-1 text-xs rounded text-gray-500 hover:text-gray-700 disabled:opacity-50"
                :disabled="!formStore.canUndo"
                title="Undo"
              >
                <Icon name="material-symbols:undo" class="w-3.5 h-3.5" />
              </button>
              <button 
                @click="formStore.redo()" 
                class="p-1 text-xs rounded text-gray-500 hover:text-gray-700 disabled:opacity-50"
                :disabled="formStore.currentHistoryIndex >= formStore.actionHistory.length - 1"
                title="Redo"
              >
                <Icon name="material-symbols:redo" class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <FormBuilderHistory />
        </div>
      </div>

      <!-- Middle Panel - Form Canvas -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <div
          class="py-2 px-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center h-12"
        >
          <h2 class="text-sm font-medium text-gray-700">Form Canvas</h2>
          <div class="flex items-center gap-2">
            <span class="text-xs text-gray-500"
              >Drag components to build your form</span
            >
          </div>
        </div>
        <div class="flex-1 overflow-auto p-6">
          <div
            class="border-2 border-dashed border-gray-300 bg-white rounded-md min-h-[calc(100vh-170px)] p-4"
            :class="{ 'border-blue-400 bg-blue-50': formStore.isDraggingOver }"
            @dragover.prevent="handleDragOver"
            @dragleave.prevent="handleDragLeave"
            @drop.prevent="handleDrop"
          >
            <FormBuilderCanvas
              :form-components="formStore.formComponents"
              @select-component="handleSelectComponent"
              @move-component="handleMoveComponent"
              @delete-component="handleDeleteComponent"
              @update-component="handleUpdateComponent"
              @optimize-layout="handleOptimizeLayout"
            />
          </div>
        </div>
      </div>

      <!-- Right Panel - Configuration Sidebar -->
      <div
        class="w-72 bg-white border-l border-gray-200 flex flex-col overflow-hidden"
      >
        <div
          class="p-3 border-b border-gray-200 bg-gray-50 h-12 flex items-center"
        >
          <h2 class="text-sm font-medium text-gray-700">Configuration</h2>
        </div>
        <div class="overflow-y-auto flex-1 p-3">
          <FormBuilderConfiguration
            v-if="formStore.selectedComponent"
            :component="formStore.selectedComponent"
            @update-component="handleUpdateComponent"
          />
          <div
            v-else
            class="flex items-center justify-center h-full text-gray-500"
          >
            <div class="text-center p-4">
              <Icon
                name="material-symbols:settings-suggest"
                class="w-12 h-12 mx-auto mb-3 text-gray-300"
              />
              <p class="text-sm font-medium">No component selected</p>
              <p class="text-xs mt-1">Select a component to configure</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Preview Modal -->
    <RsModal v-model="showPreview" title="Form Preview" size="xl">
      <div class="max-h-[70vh] overflow-y-auto p-4">
        <FormKit type="form" @submit="handlePreviewSubmit" :actions="false">
          <div class="grid-preview-container">
            <template
              v-for="(component, index) in formStore.formComponents"
              :key="index"
            >
              <component-preview :component="component" :is-preview="false" />
            </template>
          </div>
          <FormKit type="submit" label="Submit" />
        </FormKit>
      </div>
      <template #footer> </template>
    </RsModal>

    <!-- Unsaved Changes Modal -->
    <RsModal v-model="showUnsavedChangesModal" title="Unsaved Changes" size="md" position="center">
      <div class="p-4">
        <div class="flex items-center mb-4">
          <Icon name="material-symbols:warning-outline" class="text-yellow-500 w-8 h-8 mr-3" />
          <div>
            <h3 class="font-medium text-lg">You have unsaved changes</h3>
            <p class="text-gray-600">Are you sure you want to leave? Your changes will be lost.</p>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <RsButton @click="cancelNavigation" variant="tertiary">
            Stay
          </RsButton>
          <RsButton @click="confirmNavigation" variant="danger">
            Leave
          </RsButton>
        </div>
      </template>
    </RsModal>
  </div>
</template>

<script setup>
import { useFormBuilderStore } from "~/stores/formBuilder";
import FormBuilderHistory from "~/components/FormBuilderHistory.vue";

definePageMeta({
  title: "Form Builder",
  description: "Create dynamic forms with drag and drop",
  layout: "empty",
  middleware: ["auth"],
  requiresAuth: true,
});

const router = useRouter();
const formStore = useFormBuilderStore();
const toast = useToast();

const showPreview = ref(false);
const showUnsavedChangesModal = ref(false);
const pendingNavigation = ref(null);
const navigationTarget = ref(null);
const navigationConfirmed = ref(false);
const leftSidebarTab = ref('components');

// Computed property for form name with getter and setter
const formName = computed({
  get: () => formStore.formName,
  set: (value) => {
    if (value !== formStore.formName) {
      formStore.setFormName(value);
    }
  }
});

// Initialize the form builder
onMounted(() => {
  formStore.loadSavedForms();
  
  // Add the beforeunload event listener
  window.addEventListener('beforeunload', handleBeforeUnload);
  
  // Setup keyboard shortcuts
  window.addEventListener('keydown', handleKeyboardShortcuts);
});

onUnmounted(() => {
  // Remove event listeners
  window.removeEventListener('beforeunload', handleBeforeUnload);
  window.removeEventListener('keydown', handleKeyboardShortcuts);
});

// Show warning if there are unsaved changes
const handleBeforeUnload = (event) => {
  if (formStore.hasUnsavedChanges) {
    event.preventDefault();
    event.returnValue = '';
    return '';
  }
};

// Handle keyboard shortcuts
const handleKeyboardShortcuts = (event) => {
  // Undo: Ctrl+Z
  if (event.ctrlKey && event.key === 'z' && !event.shiftKey) {
    event.preventDefault();
    if (formStore.canUndo) {
      formStore.undo();
    }
  }
  
  // Redo: Ctrl+Y or Ctrl+Shift+Z
  if ((event.ctrlKey && event.key === 'y') || 
      (event.ctrlKey && event.shiftKey && event.key === 'z')) {
    event.preventDefault();
    if (formStore.currentHistoryIndex < formStore.actionHistory.length - 1) {
      formStore.redo();
    }
  }
};

// Navigation guards
// Add navigation guard
onBeforeRouteLeave((to, from, next) => {
  // If navigation was already confirmed or there are no unsaved changes, proceed
  if (navigationConfirmed.value || !formStore.hasUnsavedChanges) {
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

const confirmNavigation = () => {
  showUnsavedChangesModal.value = false;
  
  if (pendingNavigation.value) {
    pendingNavigation.value();
  } else if (navigationTarget.value) {
    navigationConfirmed.value = true; // Mark as confirmed before navigating
    router.push(navigationTarget.value);
  }
};

// Handler methods
const handleAddComponent = (component) => {
  formStore.addComponent(component);
};

const handleSelectComponent = (component) => {
  if (!component || !component.id) return;
  formStore.selectComponent(component.id);
};

const handleUpdateComponent = (updatedComponent) => {
  if (!updatedComponent || !updatedComponent.id) return;
  formStore.updateComponent(updatedComponent);
};

const handleMoveComponent = ({ oldIndex, newIndex }) => {
  formStore.moveComponent({ oldIndex, newIndex });
};

const handleDeleteComponent = (id) => {
  if (!id) return;
  formStore.deleteComponent(id);
};

const handleDragOver = (event) => {
  formStore.setDraggingOver(true);
};

const handleDragLeave = (event) => {
  formStore.setDraggingOver(false);
};

const handleDrop = (event) => {
  formStore.setDraggingOver(false);
  const componentData = JSON.parse(event.dataTransfer.getData("component"));
  formStore.addComponent(componentData);
};

const handleSave = () => {
  if (!formStore.formName.trim()) {
    toast.error("Please enter a form name");
    return;
  }

  if (formStore.formComponents.length === 0) {
    toast.error("Please add at least one component to the form");
    return;
  }

  formStore.saveForm();
  toast.success("Form saved successfully");
};

const handlePreview = () => {
  if (formStore.formComponents.length === 0) {
    toast.error("Please add at least one component to the form");
    return;
  }

  showPreview.value = true;
};

const handlePreviewSubmit = (formData) => {
  console.log("Form submitted:", formData);
  showPreview.value = false;
  toast.success("Form submitted successfully");
};

const navigateToManage = () => {
  // If already confirmed or no unsaved changes, navigate directly
  if (navigationConfirmed.value || !formStore.hasUnsavedChanges) {
    router.push("/form-builder/manage");
    return;
  }
  
  // Otherwise show confirmation modal
  showUnsavedChangesModal.value = true;
  navigationTarget.value = "/form-builder/manage";
};

const handleOptimizeLayout = () => {
  formStore.optimizeGridLayout();
};
</script>

<style scoped>
.form-name-input :deep(.formkit-inner) {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  color: white;
  min-width: 200px;
}

.form-name-input :deep(.formkit-inner:focus-within) {
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1);
}

.form-name-input :deep(input::placeholder) {
  color: rgba(255, 255, 255, 0.6);
}

.form-name-input :deep(.formkit-message) {
  color: rgba(255, 200, 200, 0.9);
  font-size: 0.7rem;
  position: absolute;
}

.grid-preview-container {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-auto-flow: row dense;
  column-gap: 16px;
  row-gap: 16px;
  width: 100%;
  box-sizing: border-box;
}
</style>
