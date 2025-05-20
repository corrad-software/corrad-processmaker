<template>
  <RsModal
    v-model="showModal"
    title="Decision Point Configuration"
    size="lg"
    position="center"
    :okCallback="saveAndClose"
    okTitle="Save"
    :cancelCallback="closeModal"
  >
    <template #body>
      <div class="mb-4">
        <h3 class="text-lg font-semibold">Configure Decision Paths</h3>
        <p class="text-sm text-gray-600">Set up conditions to determine which path the process should follow.</p>
      </div>
      <GatewayConditionManager 
        :conditions="conditions"
        :availableVariables="availableVariables"
        @update:conditions="handleConditionsUpdate"
      />
    </template>
  </RsModal>
</template>

<script setup>
import { ref, watch } from 'vue';
import GatewayConditionManager from './GatewayConditionManager.vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  conditions: {
    type: Array,
    required: true
  },
  availableVariables: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:modelValue', 'update:conditions']);

const showModal = ref(props.modelValue);
const localConditions = ref([...props.conditions]);

// Watch for changes to modelValue prop to sync modal visibility
watch(() => props.modelValue, (value) => {
  showModal.value = value;
});

// Watch for changes to showModal to emit update:modelValue
watch(() => showModal.value, (value) => {
  emit('update:modelValue', value);
});

// Watch for changes to conditions prop
watch(() => props.conditions, (value) => {
  localConditions.value = [...value];
}, { deep: true });

function handleConditionsUpdate(updatedConditions) {
  localConditions.value = [...updatedConditions];
  emit('update:conditions', updatedConditions);
}

function saveAndClose() {
  emit('update:conditions', localConditions.value);
  showModal.value = false;
}

function closeModal() {
  showModal.value = false;
}
</script> 