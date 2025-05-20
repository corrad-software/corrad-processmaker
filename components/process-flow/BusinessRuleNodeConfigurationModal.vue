<template>
  <RsModal
    v-model="showModal"
    title="Business Rule Configuration"
    size="xl"
    position="center"
    :okCallback="saveAndClose"
    okTitle="Save"
    :cancelCallback="closeModal"
  >
    <template #body>
      <div class="mb-6">
        <div class="flex items-start">
          <div class="mr-4 text-purple-500 flex-shrink-0 mt-1">
            <Icon name="material-symbols:rule" class="text-2xl" />
          </div>
          <div>
            <h3 class="text-lg font-semibold mb-1">Configure Business Rules</h3>
            <p class="text-sm text-gray-600">
              Define conditional rules that automatically perform actions when specific conditions are met.
              Add multiple rules to handle different scenarios in your process.
            </p>
          </div>
        </div>
      </div>

      <!-- Main configuration area -->
      <BusinessRuleNodeConfiguration
        :nodeId="nodeId"
        :nodeData="localNodeData"
        :availableVariables="availableVariables"
        @update="handleUpdate"
        @close="closeModal"
      />

      <!-- Quick Reference Guide -->
      <div class="mt-6 bg-purple-50 p-4 rounded-md border border-purple-100">
        <h4 class="font-medium text-purple-700 mb-2 flex items-center">
          <Icon name="material-symbols:info-outline" class="mr-1" />
          Quick Reference Guide
        </h4>
        <div class="text-sm text-purple-700">
          <ul class="list-disc list-inside space-y-1">
            <li>Each rule consists of conditions (IF) and actions (THEN)</li>
            <li>Conditions can use AND logic (all must match) or OR logic (any can match)</li>
            <li>Actions will execute when all conditions are met</li>
            <li>Multiple rules allow for complex decision trees</li>
            <li>Rules are evaluated in the order they appear</li>
          </ul>
        </div>
      </div>
    </template>
  </RsModal>
</template>

<script setup>
import { ref, watch } from 'vue';
import BusinessRuleNodeConfiguration from './BusinessRuleNodeConfiguration.vue';
import { Icon } from '#components';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  nodeId: {
    type: String,
    required: true
  },
  nodeData: {
    type: Object,
    default: () => ({})
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