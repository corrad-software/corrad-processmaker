<template>
  <RsModal
    v-model="showModal"
    title="Form Task Configuration"
    size="xl"
    position="center"
    :okCallback="saveAndClose"
    okTitle="Save"
    :cancelCallback="closeModal"
  >
    <template #body>
      <div class="mb-6">
        <div class="flex items-start">
          <div class="mr-4 text-emerald-500 flex-shrink-0 mt-1">
            <Icon name="material-symbols:format-list-bulleted" class="text-2xl" />
          </div>
          <div>
            <h3 class="text-lg font-semibold mb-1">Configure Form Task</h3>
            <p class="text-sm text-gray-600">
              Connect a form to your process flow to collect user input. Form submissions can be used to feed data 
              into your process or to display information to users.
            </p>
          </div>
        </div>
      </div>

      <!-- Main configuration area -->
      <FormNodeConfiguration 
        ref="formNodeConfigRef"
        :nodeData="localNodeData" 
        :availableVariables="availableVariables"
        @update="handleUpdate"
      />

      <!-- Quick Reference Guide -->
      <div class="mt-6 bg-emerald-50 p-4 rounded-md border border-emerald-100">
        <h4 class="font-medium text-emerald-700 mb-2 flex items-center">
          <Icon name="material-symbols:info-outline" class="mr-1" />
          Quick Reference Guide
        </h4>
        <div class="text-sm text-emerald-700">
          <ul class="list-disc list-inside space-y-1">
            <li>Select a form from your existing forms or create a new one</li>
            <li>Map process variables to form fields to pre-fill the form</li>
            <li>Map form fields to process variables to collect submission data</li>
            <li>The form will be displayed to users when this task is reached in the process</li>
            <li>Process execution will continue once the form is submitted</li>
          </ul>
        </div>
      </div>
    </template>
  </RsModal>
</template>

<script setup>
import { ref, watch } from 'vue';
import FormNodeConfiguration from './FormNodeConfiguration.vue';
import { Icon } from '#components';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  nodeData: {
    type: Object,
    required: true
  },
  availableVariables: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:modelValue', 'update']);

const showModal = ref(props.modelValue);
const localNodeData = ref({ ...props.nodeData });
const formNodeConfigRef = ref(null);

// Watch for changes to modelValue prop to sync modal visibility
watch(() => props.modelValue, (value) => {
  showModal.value = value;
});

// Watch for changes to showModal to emit update:modelValue
watch(() => showModal.value, (value) => {
  emit('update:modelValue', value);
});

// Watch for changes to nodeData prop
watch(() => props.nodeData, (value) => {
  // Create deep copy to prevent reactivity issues
  localNodeData.value = {
    ...value,
    inputMappings: Array.isArray(value.inputMappings) 
      ? value.inputMappings.map(mapping => ({ ...mapping }))
      : [],
    outputMappings: Array.isArray(value.outputMappings) 
      ? value.outputMappings.map(mapping => ({ ...mapping }))
      : [],
    fieldConditions: Array.isArray(value.fieldConditions) 
      ? value.fieldConditions.map(condition => ({ ...condition }))
      : []
  };
}, { deep: true });

function handleUpdate(updatedData) {
  localNodeData.value = { ...updatedData };
  // Store the changes but don't emit until explicit save
}

function saveAndClose() {
  // Explicitly save all changes including field conditions
  if (formNodeConfigRef.value && formNodeConfigRef.value.saveAllChanges) {
    formNodeConfigRef.value.saveAllChanges();
  }
  
  // Also emit the current data to ensure all changes are saved
  emit('update', localNodeData.value);
  showModal.value = false;
}

function closeModal() {
  showModal.value = false;
}
</script>

<style scoped>
code {
  font-family: monospace;
  border-radius: 0.25rem;
}
</style> 