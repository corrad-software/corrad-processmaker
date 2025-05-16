<template>
  <div>
    <div class="flex flex-col h-screen bg-gray-50">
      <!-- Header -->
      <header
        class="bg-gray-800 p-2 flex flex-wrap items-center justify-between text-white min-h-[70px]"
      >
        <div class="flex items-center mb-2 sm:mb-0 gap-4">
          <Icon
            @click="navigateTo('/', { external: true })"
            name="ph:arrow-circle-left-duotone"
            class="cursor-pointer w-6 h-6"
          />
          <img
            src="@/assets/img/logo/logo-word-white.svg"
            alt="Corrad Logo"
            class="h-8 block mr-2"
          />
        </div>
        <div class="flex flex-wrap items-center space-x-2">
          <h1 class="text-lg font-semibold">Manage Forms</h1>
        </div>
      </header>

      <!-- Main content -->

      <div class="flex-1 overflow-auto p-6">
        <div class="container mx-auto">
          <!-- Header with title, search and create button -->
          <div class="bg-white p-4 rounded-lg shadow-sm mb-6">
            <div
              class="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              <h2 class="text-xl font-medium">Saved Forms</h2>
              <div class="flex space-x-4 items-center">
                <div class="relative w-64">
                  <input
                    type="text"
                    v-model="searchQuery"
                    placeholder="Search forms..."
                    class="w-full px-3 py-2 pl-9 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Icon
                    name="material-symbols:search"
                    class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                  />
                </div>
                <RsButton
                  @click="navigateToBuilder"
                  variant="primary"
                  class="flex items-center whitespace-nowrap"
                >
                  <Icon name="material-symbols:add" class="mr-2" />
                  Create Form
                </RsButton>
              </div>
            </div>
          </div>

          <!-- Forms list -->

          <div class="bg-white rounded-lg shadow-sm">
            <div
              v-if="formStore.savedForms.length === 0"
              class="text-center py-16 text-gray-500"
            >
              <Icon
                name="material-symbols:file-copy-outline"
                class="w-16 h-16 mx-auto mb-4"
              />
              <p class="text-lg font-medium">No forms found</p>
              <p class="text-sm mb-4">Start by creating a new form</p>
            </div>

            <div v-else>
              <RsTable
                :data="filteredForms"
                :options="{
                  variant: 'default',
                }"
              >
                <template v-slot:formName="data">
                  <div class="font-medium">{{ data.text }}</div>
                </template>
                <template v-slot:created="data">
                  <div>{{ data.text }}</div>
                </template>
                <template v-slot:action="data">
                  <div class="flex space-x-2">
                    <Icon
                      name="material-symbols:edit-outline-rounded"
                      class="text-primary hover:text-primary/90 cursor-pointer"
                      size="22"
                      @click="editForm(data.value.id)"
                    ></Icon>
                    <Icon
                      name="material-symbols:delete-outline"
                      class="text-red-500 hover:text-red-400 cursor-pointer"
                      size="22"
                      @click="deleteForm(data.value.id)"
                    ></Icon>
                  </div>
                </template>
              </RsTable>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Unsaved Changes Modal -->
    <RsModal
      v-model="showUnsavedChangesModal"
      title="Unsaved Changes"
      size="md"
    >
      <div class="p-4">
        <div class="flex items-center mb-4">
          <Icon
            name="material-symbols:warning-outline"
            class="text-yellow-500 w-8 h-8 mr-3"
          />
          <div>
            <h3 class="font-medium text-lg">You have unsaved changes</h3>
            <p class="text-gray-600">
              Are you sure you want to create a new form? Your unsaved changes
              will be lost.
            </p>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <RsButton @click="cancelNavigation" variant="tertiary">
            Cancel
          </RsButton>
          <RsButton @click="confirmNavigation" variant="danger">
            Create New Form
          </RsButton>
        </div>
      </template>
    </RsModal>

    <!-- Delete Confirmation Modal -->
    <RsModal v-model="showDeleteModal" title="Delete Form" size="md">
      <div class="p-4">
        <div class="flex items-center mb-4">
          <Icon
            name="material-symbols:delete-forever-outline"
            class="text-red-500 w-8 h-8 mr-3"
          />
          <div>
            <h3 class="font-medium text-lg">Delete Form</h3>
            <p class="text-gray-600">
              Are you sure you want to delete this form? This action cannot be
              undone.
            </p>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <RsButton @click="cancelDelete" variant="tertiary"> Cancel </RsButton>
          <RsButton @click="confirmDelete" variant="danger">
            Delete Form
          </RsButton>
        </div>
      </template>
    </RsModal>
  </div>
</template>

<script setup>
import { useFormBuilderStore } from "~/stores/formBuilder";

definePageMeta({
  title: "Manage Forms",
  description: "Manage your created forms",
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
    success: (msg) => console.log("Success:", msg),
    error: (msg) => console.error("Error:", msg),
    info: (msg) => console.info("Info:", msg),
    warning: (msg) => console.warn("Warning:", msg),
  };
}

const searchQuery = ref("");
const showUnsavedChangesModal = ref(false);
const showDeleteModal = ref(false);
const formToDelete = ref(null);

// Initialize and load forms
onMounted(async () => {
  try {
    await formStore.loadSavedForms();
  } catch (error) {
    console.error("Error loading forms:", error);
    toast.error("Failed to load forms: " + (error.message || "Unknown error"));
  }
});

// Format date for display
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date
    .toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
    .replace(",", "");
};

// Filtered and formatted forms for table display
const filteredForms = computed(() => {
  return formStore.savedForms
    .filter((form) => {
      if (!searchQuery.value) return true;
      return form.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    })
    .map((form) => {
      console.log(form);

      // Get form name or fallback to the ID if name is not available
      const formName = form.name ? form.name : form.id;

      return {
        id: form.id,
        formName: formName,
        created: form.createdAt ? formatDate(form.createdAt) : "New Form",
        action: { id: form.id }, // Pass the ID to the action slot
      };
    });
});

// Navigation and action handlers
const navigateToBuilder = () => {
  if (formStore.hasUnsavedChanges) {
    showUnsavedChangesModal.value = true;
  } else {
    formStore.clearForm();
    router.push("/form-builder");
  }
};

const cancelNavigation = () => {
  showUnsavedChangesModal.value = false;
};

const confirmNavigation = () => {
  showUnsavedChangesModal.value = false;
  formStore.clearForm();
  router.push("/form-builder");
};

const editForm = async (formId) => {
  try {
    await formStore.loadForm(formId);
    router.push("/form-builder");
  } catch (error) {
    console.error("Error loading form:", error);
    toast.error("Failed to load form: " + (error.message || "Unknown error"));
  }
};

const deleteForm = (formId) => {
  formToDelete.value = formId;
  showDeleteModal.value = true;
};

const cancelDelete = () => {
  showDeleteModal.value = false;
  formToDelete.value = null;
};

const confirmDelete = async () => {
  if (!formToDelete.value) return;

  try {
    // Call the API to delete the form
    await formStore.deleteForm(formToDelete.value);

    // Refresh the forms list
    await formStore.loadSavedForms();

    toast.success("Form deleted successfully");
  } catch (error) {
    console.error("Error deleting form:", error);
    toast.error("Failed to delete form: " + (error.message || "Unknown error"));
  } finally {
    showDeleteModal.value = false;
    formToDelete.value = null;
  }
};
</script>
