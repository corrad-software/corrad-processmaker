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

        <RsButton @click="showFormSettings = true" variant="secondary" size="sm">
          <Icon name="material-symbols:code" class="mr-1" />
          Form Settings
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
        <div class="form-container">
          <!-- Form Script Engine -->
          <FormScriptEngine
            :form-data="previewFormData"
            :custom-script="formStore.formCustomScript"
            :custom-css="formStore.formCustomCSS"
            :form-events="formStore.formEvents"
            :script-mode="formStore.scriptMode"
            @field-change="handleScriptFieldChange"
            @field-validate="handleScriptFieldValidate"
          />
          
          <FormKit type="form" @submit="handlePreviewSubmit" :actions="false" v-model="previewFormData">
            <div class="grid-preview-container">
              <template
                v-for="(component, index) in formStore.formComponents"
                :key="index"
              >
                <component-preview :component="component" :is-preview="false" />
              </template>
            </div>
            <FormKit type="submit" label="Submit" class="form-submit" />
          </FormKit>
        </div>
      </div>
      <template #footer> </template>
    </RsModal>

    <!-- Form Settings Modal -->
    <RsModal v-model="showFormSettings" title="Form Settings & Scripts" size="xl">
      <div class="max-h-[70vh] overflow-y-auto">
        <RsTab :tabs="settingsTabs" v-model="activeSettingsTab">
          <!-- Form Info Tab -->
          <template #info>
            <div class="p-4 space-y-4">
              <FormKit
                type="text"
                label="Form Name"
                v-model="formStore.formName"
                help="Name of your form"
                validation="required"
              />
              
              <FormKit
                type="textarea"
                label="Form Description"
                v-model="formStore.formDescription"
                help="Brief description of what this form is for"
                rows="3"
              />
            </div>
          </template>

          <!-- Custom JavaScript Tab -->
          <template #javascript>
            <div class="p-4">
              <div class="mb-4">
                <h3 class="text-lg font-medium mb-2">Custom JavaScript</h3>
                <p class="text-sm text-gray-600 mb-4">
                  Write custom JavaScript to add dynamic behavior to your form. 
                  Use <code class="bg-gray-100 px-1 rounded">this.getField('fieldName')</code> to access form fields.
                </p>
                
                <!-- Helper Functions Reference -->
                <div class="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
                  <details>
                    <summary class="text-sm font-medium text-blue-800 cursor-pointer">📚 Available Helper Functions</summary>
                    <div class="mt-2 text-xs text-blue-700 space-y-1">
                      <div><code>this.getField('name')</code> - Get field value</div>
                      <div><code>this.setField('name', value)</code> - Set field value</div>
                      <div><code>this.hideField('name')</code> - Hide field</div>
                      <div><code>this.showField('name')</code> - Show field</div>
                      <div><code>this.disableField('name')</code> - Disable field</div>
                      <div><code>this.enableField('name')</code> - Enable field</div>
                      <div><code>this.validateField('name')</code> - Trigger field validation</div>
                      <div><code>this.getAllFieldValues()</code> - Get all form values</div>
                    </div>
                  </details>
                </div>
              </div>

              <RsCodeMirror
                v-model="formStore.formCustomScript"
                language="javascript"
                :height="400"
                placeholder="// Example: Hide/show fields based on selection
// this.onFieldChange('customer_type', (value) => {
//   if (value === 'business') {
//     this.showField('company_name');
//     this.showField('tax_id');
//   } else {
//     this.hideField('company_name');
//     this.hideField('tax_id');
//   }
// });

// Example: Calculate total
// this.onFieldChange(['quantity', 'price'], () => {
//   const qty = this.getField('quantity') || 0;
//   const price = this.getField('price') || 0;
//   this.setField('total', qty * price);
// });"
              />
            </div>
          </template>

          <!-- Custom CSS Tab -->
          <template #css>
            <div class="p-4">
              <div class="mb-4">
                <h3 class="text-lg font-medium mb-2">Custom CSS</h3>
                <p class="text-sm text-gray-600 mb-4">
                  Add custom styles to enhance your form appearance. Use <code class="bg-gray-100 px-1 rounded">.form-container</code> to target the form.
                </p>
                
                <!-- CSS Helper Reference -->
                <div class="mb-4 p-3 bg-green-50 rounded border border-green-200">
                  <details>
                    <summary class="text-sm font-medium text-green-800 cursor-pointer">🎨 CSS Selectors</summary>
                    <div class="mt-2 text-xs text-green-700 space-y-1">
                      <div><code>.form-container</code> - Main form wrapper</div>
                      <div><code>.form-field</code> - Individual form fields</div>
                      <div><code>.form-field[data-name="fieldName"]</code> - Specific field</div>
                      <div><code>.form-section</code> - Form sections</div>
                      <div><code>.form-submit</code> - Submit button</div>
                      <div><code>.info-display</code> - Info display components</div>
                    </div>
                  </details>
                </div>
              </div>

              <RsCodeMirror
                v-model="formStore.formCustomCSS"
                language="css"
                :height="400"
                placeholder="/* Example: Custom field styling */
/* .form-field[data-name='customer_name'] {
  background: #f0f9ff;
  border: 2px solid #0ea5e9;
}

/* Example: Hide field initially */
/* .form-field[data-name='hidden_field'] {
  display: none;
}

/* Example: Custom info display styling */
/* .info-display {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
} */"
              />
            </div>
          </template>

          <!-- Script Events Tab -->
          <template #events>
            <div class="p-4">
              <div class="mb-4">
                <h3 class="text-lg font-medium mb-2">Form Events</h3>
                <p class="text-sm text-gray-600 mb-4">
                  Configure when your custom scripts should run.
                </p>
              </div>

              <div class="space-y-4">
                <div class="border rounded p-4">
                  <h4 class="font-medium mb-2">Event Triggers</h4>
                  <div class="space-y-2">
                    <label class="flex items-center">
                      <input type="checkbox" v-model="formStore.formEvents.onLoad" class="mr-2">
                      <span class="text-sm">On Form Load</span>
                    </label>
                    <label class="flex items-center">
                      <input type="checkbox" v-model="formStore.formEvents.onFieldChange" class="mr-2">
                      <span class="text-sm">On Field Change</span>
                    </label>
                    <label class="flex items-center">
                      <input type="checkbox" v-model="formStore.formEvents.onSubmit" class="mr-2">
                      <span class="text-sm">Before Form Submit</span>
                    </label>
                    <label class="flex items-center">
                      <input type="checkbox" v-model="formStore.formEvents.onValidation" class="mr-2">
                      <span class="text-sm">On Field Validation</span>
                    </label>
                  </div>
                </div>

                <div class="border rounded p-4">
                  <h4 class="font-medium mb-2">Script Execution Mode</h4>
                  <div class="space-y-2">
                    <label class="flex items-center">
                      <input type="radio" v-model="formStore.scriptMode" value="safe" class="mr-2">
                      <span class="text-sm">Safe Mode (Recommended) - Limited but secure</span>
                    </label>
                    <label class="flex items-center">
                      <input type="radio" v-model="formStore.scriptMode" value="advanced" class="mr-2">
                      <span class="text-sm">Advanced Mode - Full JavaScript access</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </RsTab>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <RsButton @click="showFormSettings = false" variant="tertiary">
            Cancel
          </RsButton>
          <RsButton @click="saveFormSettings" variant="primary">
            Save Settings
          </RsButton>
        </div>
      </template>
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
let toast;

// Try to use the toast composable if available
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

const showPreview = ref(false);
const showUnsavedChangesModal = ref(false);
const pendingNavigation = ref(null);
const navigationTarget = ref(null);
const navigationConfirmed = ref(false);
const leftSidebarTab = ref('components');
const showFormSettings = ref(false);
const activeSettingsTab = ref('info');

// Settings tabs configuration
const settingsTabs = [
  { key: 'info', label: 'Form Info', icon: 'material-symbols:info-outline' },
  { key: 'javascript', label: 'JavaScript', icon: 'material-symbols:code' },
  { key: 'css', label: 'CSS', icon: 'material-symbols:palette-outline' },
  { key: 'events', label: 'Events', icon: 'material-symbols:event-outline' }
];

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
onMounted(async () => {
  try {
    await formStore.loadSavedForms();
    
    // Check if there's a form ID in the URL query parameters
    const route = useRoute();
    const formId = route.query.id;
    
    if (formId) {
      try {
        await formStore.loadForm(formId);
        toast.success(`Form '${formStore.formName}' loaded successfully`);
      } catch (error) {
        console.error('Error loading form from ID:', error);
        toast.error(`Failed to load form: ${error.message || 'Unknown error'}`);
      }
    }
  } catch (error) {
    console.error('Error initializing form builder:', error);
    toast.error(`Initialization error: ${error.message || 'Unknown error'}`);
  }
  
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

const handleSave = async () => {
  if (!formStore.formName.trim()) {
    toast.error("Please enter a form name");
    return;
  }

  if (formStore.formComponents.length === 0) {
    toast.error("Please add at least one component to the form");
    return;
  }

  try {
    const savedForm = await formStore.saveForm();
    toast.success("Form saved successfully");
    
    // Update URL to include the form ID without reloading the page
    const newPath = `/form-builder?id=${savedForm.formUUID}`;
    window.history.replaceState({}, '', newPath);
  } catch (error) {
    console.error("Error saving form:", error);
    toast.error(`Failed to save form: ${error.message || 'Unknown error'}`);
  }
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

const saveFormSettings = () => {
  // Form settings are automatically saved through the store's reactive updates
  showFormSettings.value = false;
  toast.success("Form settings saved successfully");
};

// Preview form data for script interactions
const previewFormData = ref({});

// Initialize preview form data with default values
watchEffect(() => {
  const newFormData = {};
  formStore.formComponents.forEach(component => {
    if (component.props.name) {
      // Set default values based on component type
      switch (component.type) {
        case 'checkbox':
          newFormData[component.props.name] = [];
          break;
        case 'number':
          newFormData[component.props.name] = 0;
          break;
        default:
          newFormData[component.props.name] = component.props.value || '';
      }
    }
  });
  previewFormData.value = newFormData;
});

// Handle script-driven field changes
const handleScriptFieldChange = ({ fieldName, value }) => {
  previewFormData.value[fieldName] = value;
};

// Handle script-driven field validation
const handleScriptFieldValidate = ({ fieldName }) => {
  // Could integrate with FormKit validation here
  console.log(`Validating field: ${fieldName}`);
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
