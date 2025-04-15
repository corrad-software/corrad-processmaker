<template>
  <div>
    <div class="flex flex-col h-screen bg-gray-50">
      <!-- Header -->
      <header
        class="bg-gray-800 p-2 flex flex-wrap items-center justify-between text-white"
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
          <RsButton @click="navigateToBuilder" variant="primary" class="mr-2">
            <Icon name="material-symbols:add" class="mr-2" />
            Create New Form
          </RsButton>
          <h1 class="text-lg font-semibold">Manage Forms</h1>
        </div>
      </header>

      <!-- Main content -->
      <div class="flex-1 overflow-auto p-6">
        <div class="container mx-auto">
          <!-- Search bar -->
          <div class="bg-white p-4 rounded-lg shadow-sm mb-6">
            <div
              class="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              <h2 class="text-xl font-medium">Saved Forms</h2>
              <div class="relative w-full md:w-64">
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
              <RsButton @click="navigateToBuilder" variant="primary"
                >Create Form</RsButton
              >
            </div>

            <div v-else>
              <RsTable
                :field="['Form Name', 'Created', 'Actions']"
                :data="filteredForms"
                :options="{ striped: true, hover: true }"
                :optionsAdvanced="{ sortable: true, responsive: true }"
              >
                <template #cell-2="{ row, index }">
                  <div class="flex space-x-2 justify-end">
                    <RsButton
                      @click="editForm(row.id)"
                      size="sm"
                      variant="tertiary"
                    >
                      <template #prepend>
                        <Icon
                          name="material-symbols:edit-outline"
                          class="w-4 h-4"
                        />
                      </template>
                      Edit
                    </RsButton>
                    <RsButton
                      @click="deleteForm(row.id)"
                      size="sm"
                      variant="tertiary"
                      class="text-red-500"
                    >
                      <template #prepend>
                        <Icon
                          name="material-symbols:delete-outline"
                          class="w-4 h-4"
                        />
                      </template>
                      Delete
                    </RsButton>
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
const toast = useToast();
const searchQuery = ref("");
const showUnsavedChangesModal = ref(false);

// Initialize and load forms
onMounted(() => {
  formStore.loadSavedForms();
});

// Format date for display
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Filtered and formatted forms for table display
const filteredForms = computed(() => {
  return formStore.savedForms
    .filter((form) => {
      if (!searchQuery.value) return true;
      return form.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    })
    .map((form) => ({
      id: form.id,
      "Form Name": form.name,
      Created: formatDate(form.createdAt),
    }));
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

const editForm = (formId) => {
  formStore.loadForm(formId);
  router.push("/form-builder");
};

const deleteForm = (formId) => {
  if (confirm("Are you sure you want to delete this form?")) {
    const index = formStore.savedForms.findIndex((f) => f.id === formId);
    if (index !== -1) {
      formStore.savedForms.splice(index, 1);
      localStorage.setItem("savedForms", JSON.stringify(formStore.savedForms));
      toast.success("Form deleted successfully");
    }
  }
};
</script>
