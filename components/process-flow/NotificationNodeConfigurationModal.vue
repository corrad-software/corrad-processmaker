<template>
  <RsModal
    v-model="showModal"
    title="Notification Configuration"
    size="xl"
    position="center"
    :okCallback="saveAndClose"
    okTitle="Save"
    :cancelCallback="closeModal"
  >
    <template #body>
      <div class="mb-6">
        <div class="flex items-start">
          <div class="mr-4 text-blue-500 flex-shrink-0 mt-1">
            <Icon name="material-symbols:notifications-outline" class="text-2xl" />
          </div>
          <div>
            <h3 class="text-lg font-semibold mb-1">Configure Notification</h3>
            <p class="text-sm text-gray-600">
              Set up notifications that will be sent to users during the process execution.
              Notifications can be delivered via in-app alerts, email, or SMS.
            </p>
          </div>
        </div>
      </div>

      <!-- Main configuration area -->
      <NotificationNodeConfiguration 
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
            <li>Select notification type and priority to control how it appears</li>
            <li>Choose recipients who will receive the notification</li>
            <li>Use variable placeholders with <code class="bg-blue-100 px-1">{variableName}</code> syntax</li>
            <li>Configure delivery methods (in-app, email, SMS)</li>
            <li>Set expiration time for time-sensitive notifications</li>
          </ul>
        </div>
      </div>
    </template>
  </RsModal>
</template>

<script setup>
import { ref, watch } from 'vue';
import NotificationNodeConfiguration from './NotificationNodeConfiguration.vue';
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