<template>
  <RsModal
    v-model="showModal"
    title="Business Rule Configuration"
    size="lg"
    position="center"
    :okCallback="saveAndClose"
    okTitle="Save"
    :cancelCallback="closeModal"
  >
    <template #body>
      <BusinessRuleNodeConfiguration
        :nodeId="nodeId"
        :nodeData="nodeData"
        :availableVariables="availableVariables"
        @update="handleUpdate"
        @close="closeModal"
      />
    </template>
  </RsModal>
</template>

<script setup>
import { ref, watch } from 'vue';
import BusinessRuleNodeConfiguration from './BusinessRuleNodeConfiguration.vue';

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