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

// Track which condition groups are collapsed
const collapsedGroups = ref({});

// Toggle collapse state of a group
const toggleGroupCollapse = (groupId) => {
  collapsedGroups.value[groupId] = !collapsedGroups.value[groupId];
};

// Check if a group is collapsed
const isGroupCollapsed = (groupId) => {
  return !!collapsedGroups.value[groupId];
};

// Watch for external changes
watch(() => props.conditions, (newConditions) => {
  // If we receive conditions in the old format, migrate them to the new format
  if (Array.isArray(newConditions) && newConditions.length > 0) {
    // Check if this is the old flat format with 'output' property
    if (newConditions[0].output !== undefined && !newConditions[0].conditions) {
      // Old format had individual conditions with 'output' property
      const conditionsByOutput = {};
      
      // Group conditions by their output path
      newConditions.forEach(condition => {
        const output = condition.output || 'Default Path';
        if (!conditionsByOutput[output]) {
          conditionsByOutput[output] = [];
        }
        // Create a copy without the output property
        const { output: _, ...conditionWithoutOutput } = condition;
        
        // Add logicalOperator to each condition (will only be used for 2nd+ conditions)
        conditionWithoutOutput.logicalOperator = 'and';
        
        conditionsByOutput[output].push(conditionWithoutOutput);
      });
      
      // Convert to new format
      const groupedConditions = Object.entries(conditionsByOutput).map(([output, conditions]) => ({
        id: `condition-group-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        output,
        conditions
      }));
      
      localConditions.value = groupedConditions;
    } 
    // Check if this is the old group format with logicalOperator at the group level
    else if (newConditions[0].conditions && newConditions[0].logicalOperator) {
      // Migrate from group-level logicalOperator to condition-level logicalOperator
      const migratedConditions = newConditions.map(group => {
        const groupCopy = { ...group };
        delete groupCopy.logicalOperator; // Remove group-level operator
        
        // Add logicalOperator to each condition
        if (groupCopy.conditions && groupCopy.conditions.length > 0) {
          groupCopy.conditions = groupCopy.conditions.map((condition, index) => {
            // First condition doesn't need an operator as it's the starting point
            if (index === 0) return { ...condition, logicalOperator: 'and' };
            // Apply the group's original operator to each subsequent condition
            return { ...condition, logicalOperator: group.logicalOperator || 'and' };
          });
        }
        
        return groupCopy;
      });
      
      localConditions.value = migratedConditions;
    } else {
      // It's already in the new format or is just empty
      localConditions.value = [...(newConditions || [])];
    }
  } else {
    // Empty array or undefined
    localConditions.value = [];
  }
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

// Add new condition group (represents one outgoing path with potentially multiple conditions)
const addConditionGroup = () => {
  if (!props.availableVariables || !props.availableVariables.length) {
    alert('No variables available. Please add a variable before creating a condition.');
    return;
  }
  
  const defaultVar = props.availableVariables[0];
  if (!defaultVar || !defaultVar.name) {
    alert('Invalid variable format. Please make sure variables have proper name and type.');
    return;
  }
  
  const newGroupId = `condition-group-${Date.now()}`;
  const newConditionGroup = {
    id: newGroupId,
    output: '', // Output path label (e.g., "Yes" or "Approved")
    conditions: [
      {
        id: `condition-${Date.now()}`,
        variable: defaultVar.name,
        operator: getOperatorsForType(defaultVar.type || 'string')[0].value,
        value: '',
        valueType: defaultVar.type || 'string',
        logicalOperator: 'and' // This won't be used for the first condition but included for consistency
      }
    ]
  };
  
  localConditions.value.push(newConditionGroup);
  // Make sure the new group is expanded
  collapsedGroups.value[newGroupId] = false;
  
  emit('update:conditions', [...localConditions.value]);
  emit('add-condition', newConditionGroup);
};

// Remove condition group
const removeConditionGroup = (groupIndex) => {
  // Get the ID before removing
  const groupId = localConditions.value[groupIndex].id;
  
  // Remove from conditions array
  localConditions.value.splice(groupIndex, 1);
  
  // Remove from collapsed state tracker
  delete collapsedGroups.value[groupId];
  
  emit('update:conditions', [...localConditions.value]);
  emit('remove-condition', groupIndex);
};

// Add a single condition to a group
const addConditionToGroup = (groupIndex) => {
  if (!props.availableVariables || !props.availableVariables.length) {
    alert('No variables available. Please add a variable before creating a condition.');
    return;
  }
  
  const defaultVar = props.availableVariables[0];
  const newCondition = {
    id: `condition-${Date.now()}`,
    variable: defaultVar.name,
    operator: getOperatorsForType(defaultVar.type || 'string')[0].value,
    value: '',
    valueType: defaultVar.type || 'string',
    logicalOperator: 'and' // Default operator for this condition
  };
  
  localConditions.value[groupIndex].conditions.push(newCondition);
  emit('update:conditions', [...localConditions.value]);
};

// Remove a single condition from a group
const removeConditionFromGroup = (groupIndex, conditionIndex) => {
  // Ensure we always have at least one condition in a group
  if (localConditions.value[groupIndex].conditions.length > 1) {
    localConditions.value[groupIndex].conditions.splice(conditionIndex, 1);
    emit('update:conditions', [...localConditions.value]);
  } else {
    alert('A condition group must have at least one condition. Remove the entire group instead.');
  }
};

// Update condition
const updateCondition = (groupIndex, conditionIndex, field, value) => {
  if (field === 'variable') {
    const selectedVar = props.availableVariables.find(v => v.name === value);
    if (!selectedVar) return;
    
    localConditions.value[groupIndex].conditions[conditionIndex].variable = value;
    localConditions.value[groupIndex].conditions[conditionIndex].valueType = selectedVar.type;
    // Reset operator to a valid one for this type
    localConditions.value[groupIndex].conditions[conditionIndex].operator = getOperatorsForType(selectedVar.type)[0].value;
    // Reset value
    localConditions.value[groupIndex].conditions[conditionIndex].value = '';
  } else {
    localConditions.value[groupIndex].conditions[conditionIndex][field] = value;
  }
  
  emit('update:conditions', [...localConditions.value]);
};

// Update condition group properties
const updateConditionGroup = (groupIndex, field, value) => {
  localConditions.value[groupIndex][field] = value;
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

// Default path value
const defaultPath = ref('Default');

// Update default path
const updateDefaultPath = (value) => {
  defaultPath.value = value;
  // Also emit the change to persist in parent component
  emit('update:conditions', [...localConditions.value]);
};

// Save when inputs lose focus
const saveChanges = () => {
  emit('update:conditions', [...localConditions.value]);
};

// Add this new computed property below other computed properties but before methods
const groupedConditionText = (group) => {
  if (!group.conditions || group.conditions.length === 0) return '';
  
  if (group.conditions.length === 1) {
    return conditionText(group.conditions[0]);
  }
  
  const conditions = group.conditions.map((c, i) => {
    const text = conditionText(c);
    return {
      index: i,
      text: text,
      operator: c.logicalOperator || 'and' // Individual condition operator (for conditions after first)
    };
  });
  
  // Build readable text with individual operators
  return conditions.map((c, i) => {
    if (i === 0) return c.text;
    return `${c.operator.toUpperCase()} ${c.text}`;
  }).join(' ');
};

// Add the following helper method to the existing script
const getValuePlaceholder = (condition) => {
  const varType = condition.valueType?.toLowerCase();
  if (varType === 'number') return 'Enter a number';
  if (varType === 'date') return 'Select a date';
  if (varType === 'string') return 'Enter text value';
  return 'Enter value';
};

// Add a method to get friendly path summary
const getPathSummary = (group) => {
  if (!group.conditions || group.conditions.length === 0) {
    return 'No conditions defined';
  }
  
  if (group.conditions.length === 1) {
    return conditionText(group.conditions[0]);
  }
  
  // Build readable text with individual operators
  return group.conditions.map((condition, index) => {
    const text = conditionText(condition);
    if (index === 0) return text;
    return `${condition.logicalOperator.toUpperCase()} ${text}`;
  }).join(' ');
};
</script>

<template>
  <div class="gateway-condition-manager">
    <!-- Empty state message when no paths are defined -->
    <div v-if="localConditions.length === 0" class="text-center p-6 border-2 border-dashed border-orange-200 rounded-lg bg-orange-50">
      <div class="text-orange-500 mb-2">
        <Icon name="material-symbols:call-split" class="w-12 h-12 mx-auto" />
      </div>
      <h3 class="text-lg font-medium text-gray-700 mb-2">No Decision Paths Defined</h3>
      <p class="text-sm text-gray-600 mb-4">
        Your process will always follow the default path: <span class="font-semibold">{{ defaultPath }}</span>
      </p>
      <button 
        @click="addConditionGroup" 
        class="px-4 py-2 bg-orange-500 text-white text-sm rounded-md hover:bg-orange-600 transition flex items-center mx-auto"
      >
        <Icon name="material-symbols:add" class="w-4 h-4 mr-1" />
        Add Your First Path
      </button>
    </div>
    
    <!-- Decision paths list -->
    <div v-else class="conditions-list space-y-4">
      <!-- Path cards - one per outgoing path -->
      <div 
        v-for="(group, groupIndex) in localConditions" 
        :key="group.id"
        class="condition-group border-2 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
        :class="{'border-orange-300 bg-orange-50': !isGroupCollapsed(group.id), 'border-gray-200': isGroupCollapsed(group.id)}"
        :data-collapsed="isGroupCollapsed(group.id)"
      >
        <!-- Path header -->
        <div 
          class="group p-3 border-b flex items-center justify-between cursor-pointer"
          :class="{'bg-orange-100 border-orange-200': !isGroupCollapsed(group.id), 'bg-gray-50 border-gray-200 hover:bg-gray-100': isGroupCollapsed(group.id)}"
          @click="toggleGroupCollapse(group.id)"
        >
          <div class="flex items-center space-x-2">
            <div class="text-orange-500">
              <Icon name="material-symbols:alt-route" class="w-5 h-5" />
            </div>
            <div class="font-medium">Path {{ groupIndex + 1 }}</div>
            <div 
              v-if="group.output" 
              class="text-sm rounded-full px-2 py-0.5 bg-orange-100 text-orange-700 border border-orange-200"
            >
              {{ group.output }}
            </div>
          </div>
          
          <div class="flex items-center">
            <!-- Condition count badge -->
            <div class="text-xs text-gray-500 bg-white px-2 py-0.5 rounded-full border mr-2">
              {{ group.conditions.length }} condition{{ group.conditions.length !== 1 ? 's' : '' }}
            </div>
            
            <!-- Collapse/expand button -->
            <button
              class="p-1 text-gray-500 hover:text-gray-700 group-hover:text-orange-600"
              :title="isGroupCollapsed(group.id) ? 'Expand' : 'Collapse'"
            >
              <Icon 
                :name="isGroupCollapsed(group.id) ? 'material-symbols:chevron-right' : 'material-symbols:expand-more'" 
                class="w-5 h-5"
              />
            </button>
            
            <!-- Delete button -->
            <button 
              @click.stop="removeConditionGroup(groupIndex)"
              class="p-1 text-gray-400 hover:text-red-500"
              title="Remove path"
            >
              <Icon name="material-symbols:delete-outline" class="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <!-- Path details when expanded -->
        <div v-if="!isGroupCollapsed(group.id)" class="path-details">
          <!-- Path name -->
          <div class="p-4 bg-white border-b border-orange-100">
            <label class="block text-sm font-medium text-gray-700 mb-1">Path Name</label>
            <div class="flex">
              <input 
                type="text"
                v-model="group.output"
                @blur="updateConditionGroup(groupIndex, 'output', group.output); saveChanges()"
                class="w-full p-2 border rounded-md shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-200 text-sm"
                placeholder="Path label (e.g. 'Yes', 'Approved')"
              />
            </div>
            <p class="mt-1 text-xs text-gray-500">
              This name will appear on the connection line leaving this decision point.
            </p>
          </div>
          
          <!-- Conditions list -->
          <div class="p-4">
            <div class="flex justify-between items-center mb-3">
              <h4 class="text-sm font-medium text-gray-700">Conditions for This Path</h4>
              <button 
                @click.stop="addConditionToGroup(groupIndex)"
                class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded hover:bg-gray-200 border border-gray-300 flex items-center"
              >
                <Icon name="material-symbols:add" class="w-3 h-3 mr-1" />
                Add Condition
              </button>
            </div>
            
            <!-- Individual conditions -->
            <div class="space-y-4">
              <div 
                v-for="(condition, conditionIndex) in group.conditions" 
                :key="condition.id"
                class="condition-item p-3 border rounded-md bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <!-- Condition header with remove button -->
                <div class="flex justify-between items-center mb-2">
                  <h5 class="text-xs font-medium">Condition {{ conditionIndex + 1 }}</h5>
                  <button 
                    v-if="group.conditions.length > 1"
                    @click.stop="removeConditionFromGroup(groupIndex, conditionIndex)"
                    class="text-gray-400 hover:text-red-500"
                    title="Remove condition"
                  >
                    <Icon name="material-symbols:delete-outline" class="w-4 h-4" />
                  </button>
                </div>
                
                <!-- Logical operator for conditions after the first one -->
                <div v-if="conditionIndex > 0" class="mb-3 py-2 px-3 bg-gray-50 rounded-md border">
                  <div class="text-xs text-gray-500 mb-1">Combine with previous condition using:</div>
                  <div class="flex space-x-2">
                    <label class="inline-flex items-center cursor-pointer">
                      <input
                        type="radio"
                        :checked="condition.logicalOperator === 'and'"
                        @change="updateCondition(groupIndex, conditionIndex, 'logicalOperator', 'and')"
                        class="form-radio text-orange-500 focus:ring-orange-500 h-4 w-4"
                      />
                      <span class="ml-1 text-sm">AND</span>
                    </label>
                    <label class="inline-flex items-center cursor-pointer">
                      <input
                        type="radio"
                        :checked="condition.logicalOperator === 'or'"
                        @change="updateCondition(groupIndex, conditionIndex, 'logicalOperator', 'or')"
                        class="form-radio text-orange-500 focus:ring-orange-500 h-4 w-4"
                      />
                      <span class="ml-1 text-sm">OR</span>
                    </label>
                  </div>
                </div>
                
                <!-- Condition builder -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <!-- Variable -->
                  <div>
                    <label class="block text-xs font-medium text-gray-700 mb-1">Variable</label>
                    <select 
                      v-model="condition.variable"
                      @change="updateCondition(groupIndex, conditionIndex, 'variable', condition.variable)"
                      class="w-full p-2 border rounded-md shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-200 text-sm"
                    >
                      <option 
                        v-for="variable in availableVariables" 
                        :key="variable.name" 
                        :value="variable.name"
                      >
                        {{ variable.label || variable.name }}
                      </option>
                    </select>
                  </div>
                  
                  <!-- Operator -->
                  <div>
                    <label class="block text-xs font-medium text-gray-700 mb-1">Operator</label>
                    <select 
                      v-model="condition.operator"
                      @change="updateCondition(groupIndex, conditionIndex, 'operator', condition.operator)"
                      class="w-full p-2 border rounded-md shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-200 text-sm"
                    >
                      <option 
                        v-for="operator in getOperatorsForType(
                          availableVariables.find(v => v.name === condition.variable)?.type || 'string'
                        )" 
                        :key="operator.value" 
                        :value="operator.value"
                      >
                        {{ operator.label }}
                      </option>
                    </select>
                  </div>
                  
                  <!-- Value -->
                  <div>
                    <label class="block text-xs font-medium text-gray-700 mb-1">Value</label>
                    <input 
                      v-if="condition.valueType !== 'boolean'"
                      :type="getInputTypeForVarType(condition.valueType)"
                      v-model="condition.value"
                      @blur="saveChanges"
                      class="w-full p-2 border rounded-md shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-200 text-sm"
                      :placeholder="getValuePlaceholder(condition)"
                    />
                    <div v-else class="flex items-center h-[38px] p-2 border rounded-md shadow-sm bg-white">
                      <input 
                        type="checkbox"
                        v-model="condition.value"
                        class="form-checkbox text-orange-500 focus:ring-orange-500"
                      />
                      <span class="ml-2 text-sm">{{ condition.value ? 'Yes/True' : 'No/False' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Summary of path conditions -->
          <div class="bg-orange-50 border-t border-orange-100 p-3">
            <div class="text-sm text-gray-700 flex items-center">
              <span class="font-medium text-orange-700 mr-2">Path Summary:</span>
              {{ getPathSummary(group) }}
            </div>
          </div>
        </div>
        
        <!-- Path summary when collapsed -->
        <div v-if="isGroupCollapsed(group.id)" class="p-3 bg-white border-t border-gray-100 text-sm">
          <span class="font-medium">If</span> {{ getPathSummary(group) }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gateway-condition-manager {
  @apply space-y-4;
}

.form-radio {
  @apply text-orange-500 focus:ring-orange-500;
}

.form-checkbox {
  @apply text-orange-500 focus:ring-orange-500;
}
</style> 