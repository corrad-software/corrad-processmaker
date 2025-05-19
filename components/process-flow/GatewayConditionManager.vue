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
</script>

<template>
  <div class="gateway-condition-manager">
    <div class="mb-4">
      <div class="flex justify-between items-center mb-3">
        <h3 class="text-sm font-medium text-gray-700">Decision Point Conditions</h3>
        <button 
          @click="addConditionGroup" 
          class="px-2 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600 flex items-center"
        >
          <Icon name="material-symbols:add" class="w-3.5 h-3.5 mr-1" />
          Add Path
        </button>
      </div>
      
      <div v-if="localConditions.length === 0" class="text-gray-500 text-sm italic mb-2">
        No conditions defined. Default path will be taken.
      </div>
      
      <div v-else class="conditions-list space-y-3 mb-4">
        <!-- One condition group per outgoing path -->
        <div 
          v-for="(group, groupIndex) in localConditions" 
          :key="group.id"
          class="condition-group border-2 rounded-md bg-orange-50"
          :data-collapsed="isGroupCollapsed(group.id)"
          @click.stop="isGroupCollapsed(group.id) ? toggleGroupCollapse(group.id) : null"
        >
          <!-- Group header (always visible) -->
          <div class="p-3 border-b border-orange-200 flex items-center justify-between bg-orange-100">
            <div class="flex-1 mr-2">
              <div class="text-xs font-medium mb-1">
                Path Name:
                <span v-if="isGroupCollapsed(group.id)" class="ml-1 text-orange-600">
                  ({{ group.conditions.length }} condition{{ group.conditions.length !== 1 ? 's' : '' }})
                </span>
              </div>
              <input 
                type="text"
                :value="group.output"
                @input="updateConditionGroup(groupIndex, 'output', $event.target.value)"
                @blur="saveChanges"
                class="w-full p-2 border rounded text-xs"
                placeholder="Path label (e.g. 'Yes', 'Approved')"
              />
            </div>
            
            <div class="flex items-center">
              <!-- Collapse/expand button -->
              <button
                @click="toggleGroupCollapse(group.id); $event.stopPropagation();"
                class="p-1 text-gray-500 hover:text-gray-700 mr-2"
                :title="isGroupCollapsed(group.id) ? 'Expand' : 'Collapse'"
              >
                <Icon 
                  :name="isGroupCollapsed(group.id) ? 'material-symbols:expand-more' : 'material-symbols:expand-less'" 
                  class="w-5 h-5"
                />
              </button>
              
              <!-- Delete button -->
              <button 
                @click="removeConditionGroup(groupIndex); $event.stopPropagation();"
                class="p-1 text-gray-400 hover:text-red-500"
                title="Remove path"
              >
                <Icon name="material-symbols:delete-outline" class="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <!-- Collapsible content -->
          <div v-if="!isGroupCollapsed(group.id)" class="p-3">
            <!-- Individual conditions in this group -->
            <div class="space-y-3">
              <div 
                v-for="(condition, conditionIndex) in group.conditions" 
                :key="condition.id"
                class="condition-item p-3 border border-orange-200 rounded-md bg-white relative"
              >
                <button 
                  v-if="group.conditions.length > 1"
                  @click.stop="removeConditionFromGroup(groupIndex, conditionIndex)"
                  class="absolute top-1 right-1 text-gray-400 hover:text-red-500"
                  title="Remove condition"
                >
                  <Icon name="material-symbols:close" class="w-4 h-4" />
                </button>
                
                <!-- Logical operator selector before each condition except the first one -->
                <div v-if="conditionIndex > 0" class="mb-2 pb-2 border-b border-gray-200">
                  <select
                    :value="condition.logicalOperator || 'and'"
                    @change="updateCondition(groupIndex, conditionIndex, 'logicalOperator', $event.target.value)"
                    @blur="saveChanges"
                    class="w-full text-xs border border-gray-300 rounded px-2 py-1 bg-gray-50"
                  >
                    <option value="and">AND (Both conditions must be true)</option>
                    <option value="or">OR (Either condition can be true)</option>
                  </select>
                </div>
                
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <!-- Variable -->
                  <select 
                    :value="condition.variable"
                    @change="updateCondition(groupIndex, conditionIndex, 'variable', $event.target.value)"
                    @blur="saveChanges"
                    class="w-full p-2 border rounded text-xs"
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
                    @change="updateCondition(groupIndex, conditionIndex, 'operator', $event.target.value)"
                    @blur="saveChanges"
                    class="w-full p-2 border rounded text-xs"
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
                    @input="updateCondition(groupIndex, conditionIndex, 'value', $event.target.value)"
                    @blur="saveChanges"
                    class="w-full p-2 border rounded text-xs"
                    :placeholder="'Value'"
                  />
                  <div v-else class="w-full p-2 border rounded flex items-center">
                    <input 
                      type="checkbox"
                      :checked="condition.value === true || condition.value === 'true'"
                      @change="updateCondition(groupIndex, conditionIndex, 'value', $event.target.checked)"
                      @blur="saveChanges"
                      class="mr-2"
                    />
                    <span class="text-xs">{{ condition.value === true || condition.value === 'true' ? 'Yes' : 'No' }}</span>
                  </div>
                </div>
              </div>
              
              <!-- Add another condition button -->
              <div class="text-center">
                <button 
                  @click.stop="addConditionToGroup(groupIndex)"
                  class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded hover:bg-gray-200 border border-gray-300 flex items-center mx-auto"
                >
                  <Icon name="material-symbols:add" class="w-3 h-3 mr-1" />
                  Add Another Condition
                </button>
              </div>
            </div>
          </div>
          
          <!-- Condition summary (always visible, even when collapsed) -->
          <div class="p-2 bg-orange-100 rounded-b-md border-t border-orange-200 text-xs text-orange-800">
            <span class="font-medium">Outcome:</span> 
            <span v-if="group.conditions.length === 1">
              If {{ conditionText(group.conditions[0]) }}
            </span>
            <span v-else>
              If {{ groupedConditionText(group) }}
            </span>
            <span class="font-medium"> → follow path "{{ group.output || 'Unlabeled path' }}"</span>
          </div>
        </div>
      </div>
      
      <!-- Default path -->
      <div class="default-path p-3 border rounded-md bg-gray-50">
        <div class="text-xs font-medium mb-1">Default Path (when no conditions match):</div>
        <input 
          type="text"
          v-model="defaultPath"
          @blur="saveChanges"
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

.condition-group {
  border-color: #fdba74;
  transition: all 0.2s;
}

.condition-group:hover {
  border-color: #f97316;
}

.condition-item {
  transition: all 0.2s;
}

.condition-item:hover {
  border-color: #f97316;
}

/* Adding new styles for collapsed state */
.condition-group[data-collapsed="true"]:hover {
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.condition-group[data-collapsed="true"] {
  background-color: #ffedd5;
}

.condition-group[data-collapsed="true"] .p-3.border-b {
  border-bottom: none;
}
</style> 