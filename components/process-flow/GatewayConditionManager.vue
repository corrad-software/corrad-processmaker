<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  conditions: {
    type: Array,
    default: () => []
  },
  availableVariables: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:conditions', 'add-condition', 'remove-condition']);

// Local copy of conditions
const localConditions = ref([...(props.conditions || [])]);

// Watch for external changes
watch(() => props.conditions, (newConditions) => {
  localConditions.value = [...(newConditions || [])];
}, { deep: true });

// Operators based on variable type
const getOperatorsForType = (type) => {
  switch (type) {
    case 'number':
      return [
        { value: 'eq', label: '= (Equal to)' },
        { value: 'neq', label: '≠ (Not equal to)' },
        { value: 'gt', label: '> (Greater than)' },
        { value: 'gte', label: '≥ (Greater than or equal to)' },
        { value: 'lt', label: '< (Less than)' },
        { value: 'lte', label: '≤ (Less than or equal to)' }
      ];
    case 'string':
      return [
        { value: 'eq', label: '= (Equal to)' },
        { value: 'neq', label: '≠ (Not equal to)' },
        { value: 'contains', label: 'Contains' },
        { value: 'startsWith', label: 'Starts with' },
        { value: 'endsWith', label: 'Ends with' }
      ];
    case 'boolean':
      return [
        { value: 'eq', label: '= (Equal to)' },
        { value: 'neq', label: '≠ (Not equal to)' }
      ];
    case 'date':
      return [
        { value: 'eq', label: '= (Equal to)' },
        { value: 'neq', label: '≠ (Not equal to)' },
        { value: 'gt', label: '> (After)' },
        { value: 'gte', label: '≥ (On or after)' },
        { value: 'lt', label: '< (Before)' },
        { value: 'lte', label: '≤ (On or before)' }
      ];
    default:
      return [
        { value: 'eq', label: '= (Equal to)' },
        { value: 'neq', label: '≠ (Not equal to)' }
      ];
  }
};

// Get value input type based on variable type
const getInputTypeForVarType = (type) => {
  switch (type) {
    case 'number': return 'number';
    case 'date': return 'date';
    case 'boolean': return 'checkbox';
    default: return 'text';
  }
};

// Add new condition
const addCondition = () => {
  if (!props.availableVariables || !props.availableVariables.length) {
    alert('No variables available. Please add a variable before creating a condition.');
    return;
  }
  
  const defaultVar = props.availableVariables[0];
  if (!defaultVar || !defaultVar.name) {
    alert('Invalid variable format. Please make sure variables have proper name and type.');
    return;
  }
  
  const newCondition = {
    id: `condition-${Date.now()}`,
    variable: defaultVar.name,
    operator: getOperatorsForType(defaultVar.type || 'string')[0].value,
    value: '',
    valueType: defaultVar.type || 'string',
    output: '', // Output path label (e.g., "Yes" or "No")
  };
  
  localConditions.value.push(newCondition);
  emit('update:conditions', [...localConditions.value]);
  emit('add-condition', newCondition);
};

// Remove condition
const removeCondition = (index) => {
  localConditions.value.splice(index, 1);
  emit('update:conditions', [...localConditions.value]);
  emit('remove-condition', index);
};

// Update condition
const updateCondition = (index, field, value) => {
  if (field === 'variable') {
    const selectedVar = props.availableVariables.find(v => v.name === value);
    localConditions.value[index].variable = value;
    localConditions.value[index].valueType = selectedVar.type;
    // Reset operator to a valid one for this type
    localConditions.value[index].operator = getOperatorsForType(selectedVar.type)[0].value;
    // Reset value
    localConditions.value[index].value = '';
  } else {
    localConditions.value[index][field] = value;
  }
  
  emit('update:conditions', [...localConditions.value]);
};

// Generate human-readable condition text
const conditionText = (condition) => {
  if (!condition.variable || !condition.operator) return '';
  
  const variable = props.availableVariables?.find(v => v.name === condition.variable);
  const operator = getOperatorsForType(variable?.type || 'string').find(op => op.value === condition.operator);
  
  const variableName = variable?.label || variable?.name || condition.variable || 'Unknown variable';
  const operatorText = operator?.label?.split(' ')[0] || condition.operator || '=';
  
  return `${variableName} ${operatorText} ${condition.value}`;
};
</script>

<template>
  <div class="gateway-condition-manager">
    <div class="mb-4">
      <div class="flex justify-between items-center mb-2">
        <h3 class="text-sm font-medium text-gray-700">Gateway Conditions</h3>
        <button 
          @click="addCondition" 
          class="px-2 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600"
        >
          Add Condition
        </button>
      </div>
      
      <div v-if="localConditions.length === 0" class="text-gray-500 text-sm italic mb-2">
        No conditions defined. Default path will be taken.
      </div>
      
      <div v-else class="conditions-list space-y-4 mb-4">
        <div 
          v-for="(condition, index) in localConditions" 
          :key="condition.id"
          class="condition-item p-3 border rounded-md bg-orange-50 relative"
        >
          <button 
            @click="removeCondition(index)"
            class="absolute top-1 right-1 text-gray-400 hover:text-red-500"
          >
            <i class="material-icons text-sm">close</i>
          </button>
          
          <div class="mb-2">
            <div class="text-xs font-medium mb-1">If</div>
            <div class="condition-grid grid grid-cols-3 gap-2">
              <!-- Variable -->
              <select 
                :value="condition.variable"
                @change="updateCondition(index, 'variable', $event.target.value)"
                class="col-span-1 p-2 border rounded text-xs"
              >
                <option 
                  v-for="variable in availableVariables" 
                  :key="variable.name" 
                  :value="variable.name"
                >
                  {{ variable.label || variable.name || 'Unnamed variable' }}
                </option>
              </select>
              
              <!-- Operator -->
              <select 
                :value="condition.operator"
                @change="updateCondition(index, 'operator', $event.target.value)"
                class="col-span-1 p-2 border rounded text-xs"
              >
                <option 
                  v-for="operator in getOperatorsForType(
                    props.availableVariables.find(v => v.name === condition.variable)?.type || 'string'
                  )" 
                  :key="operator.value" 
                  :value="operator.value"
                >
                  {{ operator.label }}
                </option>
              </select>
              
              <!-- Value -->
              <input 
                v-if="condition.valueType !== 'boolean'"
                :type="getInputTypeForVarType(condition.valueType)"
                :value="condition.value"
                @input="updateCondition(index, 'value', $event.target.value)"
                class="col-span-1 p-2 border rounded text-xs"
                :placeholder="'Value'"
              />
              <div v-else class="col-span-1 p-2 border rounded flex items-center">
                <input 
                  type="checkbox"
                  :checked="condition.value === true || condition.value === 'true'"
                  @change="updateCondition(index, 'value', $event.target.checked)"
                  class="mr-2"
                />
                <span class="text-xs">{{ condition.value === true || condition.value === 'true' ? 'Yes' : 'No' }}</span>
              </div>
            </div>
          </div>
          
          <!-- Output path -->
          <div class="mb-1">
            <div class="text-xs font-medium mb-1">Then follow path:</div>
            <input 
              type="text"
              :value="condition.output"
              @input="updateCondition(index, 'output', $event.target.value)"
              class="w-full p-2 border rounded text-xs"
              placeholder="Path label (e.g. 'Yes', 'Approved')"
            />
          </div>
          
          <!-- Condition summary -->
          <div class="mt-2 p-2 bg-white rounded-md border border-orange-200">
            <div class="text-xs text-orange-800">
              <span class="font-medium">Condition:</span> 
              {{ conditionText(condition) }} → {{ condition.output || 'Unlabeled path' }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- Default path -->
      <div class="default-path p-3 border rounded-md bg-gray-50">
        <div class="text-xs font-medium mb-1">Default Path (when no conditions match):</div>
        <input 
          type="text"
          value="Default"
          class="w-full p-2 border rounded text-xs"
          placeholder="Default path label (e.g. 'No', 'Rejected')"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.gateway-condition-manager {
  font-size: 0.875rem;
}

.condition-item {
  transition: all 0.2s;
}

.condition-item:hover {
  border-color: #f97316;
}
</style> 