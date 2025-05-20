<template>
  <RsModal
    v-model="showModal"
    title="Decision Point Configuration"
    size="xl"
    position="center"
    :okCallback="saveAndClose"
    okTitle="Save"
    :cancelCallback="closeModal"
  >
    <template #body>
      <div class="mb-6">
        <div class="flex items-start">
          <div class="mr-4 text-orange-500 flex-shrink-0 mt-1">
            <Icon name="material-symbols:call-split" class="text-2xl" />
          </div>
          <div>
            <h3 class="text-lg font-semibold mb-1">Configure Decision Paths</h3>
            <p class="text-sm text-gray-600">
              Define the conditions that determine which path the process should follow. 
              The decision point evaluates conditions in order and follows the first matching path.
            </p>
          </div>
        </div>
      </div>

      <!-- Default path configuration -->
      <div class="mb-6 bg-gray-50 p-4 rounded-md border border-gray-200">
        <div class="flex items-center mb-2">
          <div class="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center mr-2">
            <span class="text-xs font-semibold text-orange-600">1</span>
          </div>
          <h4 class="font-medium">Default Path</h4>
        </div>
        <p class="text-sm text-gray-600 mb-3">
          This path will be taken when no conditions match. Give it a descriptive name.
        </p>
        <div class="flex items-center">
          <label class="text-sm font-medium text-gray-700 mr-2 w-24">Label:</label>
          <input
            v-model="defaultPathName"
            type="text"
            class="max-w-xs form-input rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-200"
            placeholder="e.g., Default, Other, No Match"
          />
        </div>
      </div>

      <!-- Condition paths -->
      <div class="mb-4">
        <div class="flex items-center mb-3">
          <div class="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center mr-2">
            <span class="text-xs font-semibold text-orange-600">2</span>
          </div>
          <h4 class="font-medium">Define Decision Paths</h4>
          <button 
            @click="addNewPath" 
            class="ml-auto px-3 py-1.5 bg-orange-500 text-white text-sm rounded-md hover:bg-orange-600 transition flex items-center"
          >
            <Icon name="material-symbols:add" class="w-4 h-4 mr-1" />
            Add New Path
          </button>
        </div>
        <p class="text-sm text-gray-600 mb-4">
          Each path represents a possible route your process can take based on the conditions you define.
        </p>
      </div>

      <!-- Gateway Condition Manager Component -->
      <GatewayConditionManager 
        :conditions="localConditions"
        :availableVariables="availableVariables"
        :defaultPath="defaultPathName"
        @update:conditions="handleConditionsUpdate"
        @update:defaultPath="updateDefaultPath"
      />

      <!-- Quick Reference Guide -->
      <div class="mt-6 bg-blue-50 p-4 rounded-md border border-blue-100">
        <h4 class="font-medium text-blue-700 mb-2 flex items-center">
          <Icon name="material-symbols:info-outline" class="mr-1" />
          Quick Reference Guide
        </h4>
        <div class="text-sm text-blue-700">
          <ul class="list-disc list-inside space-y-1">
            <li>Decision points evaluate conditions in order from top to bottom</li>
            <li>The first path with matching conditions will be followed</li>
            <li>If no conditions match, the default path will be taken</li>
            <li>Each path can have multiple conditions combined with AND/OR logic</li>
            <li>Make sure to give each path a clear, descriptive name</li>
          </ul>
        </div>
      </div>
    </template>
  </RsModal>
</template>

<script setup>
import { ref, watch } from 'vue';
import GatewayConditionManager from './GatewayConditionManager.vue';
import { Icon } from '#components';

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
  },
  defaultPath: {
    type: String,
    default: 'Default'
  }
});

const emit = defineEmits(['update:modelValue', 'update:conditions', 'update:defaultPath']);

const showModal = ref(props.modelValue);
const localConditions = ref([...props.conditions]);
const defaultPathName = ref(props.defaultPath || 'Default');

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

// Watch for changes to defaultPath prop
watch(() => props.defaultPath, (value) => {
  defaultPathName.value = value || 'Default';
});

function handleConditionsUpdate(updatedConditions) {
  localConditions.value = [...updatedConditions];
}

function updateDefaultPath(value) {
  defaultPathName.value = value;
}

function saveAndClose() {
  emit('update:conditions', localConditions.value);
  emit('update:defaultPath', defaultPathName.value);
  showModal.value = false;
}

function closeModal() {
  showModal.value = false;
}

function addNewPath() {
  // Create a default new path
  const defaultVar = props.availableVariables.length > 0 ? props.availableVariables[0] : null;
  
  if (!defaultVar) {
    alert('No variables available. Please add process variables before creating conditions.');
    return;
  }

  const newConditionGroup = {
    id: `condition-group-${Date.now()}`,
    output: `Path ${localConditions.value.length + 1}`, // Auto-numbered path
    conditions: [
      {
        id: `condition-${Date.now()}`,
        variable: defaultVar.name,
        operator: 'eq', // Default to equals
        value: '',
        valueType: defaultVar.type || 'string',
        logicalOperator: 'and'
      }
    ]
  };
  
  localConditions.value.push(newConditionGroup);
  emit('update:conditions', [...localConditions.value]);
}
</script>

<style scoped>
.form-input {
  @apply text-sm py-2 px-3;
}
</style> 