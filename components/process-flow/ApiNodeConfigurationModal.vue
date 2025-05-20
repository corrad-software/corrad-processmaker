<template>
  <RsModal
    v-model="showModal"
    title="API Call Configuration"
    size="xl"
    position="center"
    :okCallback="saveAndClose"
    okTitle="Save"
    :cancelCallback="closeModal"
  >
    <template #body>
      <div class="mb-6">
        <div class="flex items-start">
          <div class="mr-4 text-indigo-500 flex-shrink-0 mt-1">
            <Icon name="material-symbols:api" class="text-2xl" />
          </div>
          <div>
            <h3 class="text-lg font-semibold mb-1">Configure API Call</h3>
            <p class="text-sm text-gray-600">
              Set up an external API call to integrate with third-party services or fetch data from other systems.
              The API response will be stored in a process variable for later use.
            </p>
          </div>
        </div>
      </div>

      <!-- Main configuration area -->
      <ApiNodeConfiguration 
        :nodeData="localNodeData" 
        :availableVariables="availableVariables"
        @update="handleUpdate"
      />

      <!-- Quick Reference Guide -->
      <div class="mt-6 bg-blue-50 p-4 rounded-md border border-blue-100">
        <h4 class="font-medium text-blue-700 mb-2 flex items-center">
          <Icon name="material-symbols:info-outline" class="mr-1" />
          Quick Reference Guide
        </h4>
        <div class="text-sm text-blue-700">
          <ul class="list-disc list-inside space-y-1">
            <li>Variable placeholders can be used with <code class="bg-blue-100 px-1">{variableName}</code> syntax</li>
            <li>API responses are stored in your chosen output variable</li>
            <li>Error handling allows your process to recover from failed API calls</li>
            <li>You can test API calls directly from this configuration panel</li>
            <li>Response data structure depends on the API you're calling</li>
          </ul>
        </div>
      </div>
    </template>
  </RsModal>
</template>

<script setup>
import { ref, watch } from 'vue';
import ApiNodeConfiguration from './ApiNodeConfiguration.vue';
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
  localNodeData.value = { ...value };
}, { deep: true });

function handleUpdate(updatedData) {
  localNodeData.value = { ...updatedData };
}

function saveAndClose() {
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