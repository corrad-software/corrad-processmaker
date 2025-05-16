<template>
  <div class="variable-manager">
    <!-- Header with Add Button -->
    <div class="bg-gray-50 border-b border-gray-200 p-4">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-medium text-gray-900">Process Variables</h3>
          <p class="mt-1 text-sm text-gray-500">
            Manage variables for your process flow
          </p>
        </div>
        <RsButton
          @click="
            () => {
              resetForm();
              showAddVariable = true;
            }
          "
          variant="primary"
          size="sm"
        >
          <Icon name="material-symbols:add" class="mr-1" />
          Add Variable
        </RsButton>
      </div>
    </div>

    <!-- Variable List -->
    <div class="p-4">
      <!-- Empty State -->
      <div v-if="!variables.length" class="text-center py-8">
        <Icon
          name="material-symbols:data-object"
          class="w-12 h-12 mx-auto mb-3 text-gray-400"
        />
        <h4 class="text-sm font-medium text-gray-900 mb-1">
          No Variables Added
        </h4>
        <p class="text-sm text-gray-500 mb-4">
          Add variables to store and manage data in your process
        </p>
      </div>

      <!-- Variable List -->
      <div v-else class="space-y-2">
        <div
          v-for="variable in variables"
          :key="variable.name"
          class="variable-item"
        >
          <div
            class="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-200 hover:shadow-sm transition-all duration-200"
          >
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <span class="font-medium text-gray-900">{{
                  variable.name
                }}</span>
                <RsBadge
                  :variant="
                    variable.scope === 'global' ? 'primary' : 'secondary'
                  "
                  size="sm"
                >
                  {{ variable.scope }}
                </RsBadge>
                <RsBadge variant="outline" size="sm" class="text-gray-500">
                  {{ variable.type }}
                </RsBadge>
              </div>
              <p v-if="variable.description" class="mt-1 text-sm text-gray-500">
                {{ variable.description }}
              </p>
            </div>
            <div class="flex items-center gap-2 ml-4">
              <button
                @click="editVariable(variable)"
                class="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
                title="Edit variable"
              >
                <Icon name="material-symbols:edit" class="w-4 h-4" />
              </button>
              <button
                @click="deleteVariable(variable)"
                class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                title="Delete variable"
              >
                <Icon name="material-symbols:delete" class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Variable Modal -->
    <RsModal
      v-model="showAddVariable"
      :title="editingVariable ? 'Edit Variable' : 'Add Variable'"
      size="md"
      :hideFooter="true"
      :overlayClose="false"
    >
      <FormKit
        type="form"
        @submit="saveVariable"
        :actions="false"
        class="space-y-4"
      >
        <FormKit
          name="name"
          v-model="variableForm.name"
          type="text"
          label="Name"
          placeholder="Enter variable name"
          validation="required|alpha_numeric|length:3,50"
          :validation-messages="{
            required: 'Variable name is required',
            alpha_numeric:
              'Variable name can only contain letters, numbers, and underscores',
            length: 'Variable name must be between 3 and 50 characters',
          }"
        />

        <FormKit
          name="type"
          v-model="variableForm.type"
          type="select"
          label="Type"
          :options="[
            { label: 'String', value: 'string' },
            { label: 'Number', value: 'number' },
            { label: 'Boolean', value: 'boolean' },
            { label: 'Object', value: 'object' },
            { label: 'Array', value: 'array' },
            { label: 'Date', value: 'date' },
            { label: 'File', value: 'file' },
          ]"
          validation="required"
          :validation-messages="{
            required: 'Variable type is required',
          }"
        />

        <FormKit
          name="scope"
          v-model="variableForm.scope"
          type="select"
          label="Scope"
          :options="[
            { label: 'Process', value: 'process' },
            { label: 'Global', value: 'global' },
          ]"
          validation="required"
          :validation-messages="{
            required: 'Variable scope is required',
          }"
        />

        <FormKit
          name="description"
          v-model="variableForm.description"
          type="textarea"
          label="Description"
          placeholder="Enter variable description"
          :rows="2"
        />

        <FormKit
          name="isRequired"
          v-model="variableForm.isRequired"
          type="checkbox"
          label="Required"
          help="Mark this variable as required"
        />

        <div class="flex justify-end space-x-2 pt-4 border-t border-gray-200">
          <RsButton type="button" @click="closeModal" variant="tertiary">
            Cancel
          </RsButton>
          <FormKit type="submit" input-class="rs-button rs-button-primary">
            {{ editingVariable ? "Update" : "Add" }}
          </FormKit>
        </div>
      </FormKit>
    </RsModal>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useVariableStore } from "~/stores/variableStore";

const variableStore = useVariableStore();

// State
const showAddVariable = ref(false);
const editingVariable = ref(null);
const variableForm = ref({
  name: "",
  type: "string",
  scope: "process",
  description: "",
  isRequired: false,
});

// Computed
const variables = computed(() => {
  // This was only returning process variables, let's fix it to return both process and global variables
  const allVars = [
    ...variableStore.getAllVariables.process,
    ...variableStore.getAllVariables.global,
  ];
  return allVars;
});

// Methods
const editVariable = (variable) => {
  editingVariable.value = variable;
  variableForm.value = { ...variable };
  showAddVariable.value = true;
};

const deleteVariable = (variable) => {
  if (confirm(`Are you sure you want to delete ${variable.name}?`)) {
    variableStore.deleteVariable(variable.name, variable.scope);
  }
};

const resetForm = () => {
  variableForm.value = {
    name: "",
    type: "string",
    scope: "process",
    description: "",
    isRequired: false,
  };
  editingVariable.value = null;
};

const closeModal = () => {
  showAddVariable.value = false;
  resetForm();
};

const saveVariable = async (formData) => {
  try {
    // Create a new variable object
    const newVariable = {
      name: formData.name,
      type: formData.type,
      scope: formData.scope,
      description: formData.description,
      isRequired: formData.isRequired,
    };

    if (editingVariable.value) {
      // Update existing variable
      variableStore.updateVariable(
        editingVariable.value.name,
        newVariable,
        newVariable.scope
      );
    } else {
      // Add new variable
      variableStore.addVariable(newVariable);
    }

    // Close modal and reset form
    closeModal();
  } catch (error) {
    console.error("Error saving variable:", error);
    // You might want to show an error message to the user here
  }
};
</script>

<style scoped>
.variable-manager {
  @apply h-full flex flex-col;
}

.variable-item {
  @apply transition-all duration-200;
}

.variable-item:hover {
  @apply transform -translate-y-1;
}
</style>
