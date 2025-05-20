<template>
  <div class="business-rule-node-configuration">
    <!-- Step 1: Basic Configuration -->
    <div class="mb-6 bg-gray-50 p-4 rounded-md border border-gray-200">
      <div class="flex items-center mb-3">
        <div class="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center mr-2">
          <span class="text-xs font-semibold text-purple-600">1</span>
        </div>
        <h4 class="font-medium">Basic Configuration</h4>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Rule Name -->
        <div>
          <label for="nodeLabel" class="block text-sm font-medium text-gray-700 mb-1">Rule Name</label>
          <input
            id="nodeLabel"
            v-model="localNodeData.label"
            type="text"
            class="w-full p-2 border rounded-md shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-200 text-sm"
            placeholder="Enter a descriptive name"
            @blur="saveChanges"
          />
          <p class="mt-1 text-xs text-gray-500">
            A clear name helps identify this rule in the process flow
          </p>
        </div>
        
        <!-- Description -->
        <div>
          <label for="nodeDescription" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            id="nodeDescription"
            v-model="localNodeData.description"
            class="w-full p-2 border rounded-md shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-200 text-sm"
            placeholder="Describe what this rule does"
            rows="2"
            @blur="saveChanges"
          ></textarea>
          <p class="mt-1 text-xs text-gray-500">
            Optional description to explain this rule's purpose
          </p>
        </div>
      </div>
    </div>
    
    <!-- Step 2: Business Rules Definition -->
    <div class="mb-6 bg-gray-50 p-4 rounded-md border border-gray-200">
      <div class="flex items-center mb-3">
        <div class="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center mr-2">
          <span class="text-xs font-semibold text-purple-600">2</span>
        </div>
        <h4 class="font-medium">Business Rules</h4>
      </div>
      
      <div class="flex justify-between items-center mb-3">
        <p class="text-sm text-gray-600">
          Define when conditions occur and what actions should be taken
        </p>
        <RsButton 
          @click="addRuleGroup" 
          variant="primary"
          size="sm"
          class="btn-add-rule"
        >
          <Icon name="material-symbols:add" class="mr-1" /> Add Rule
        </RsButton>
      </div>
      
      <!-- No rules placeholder -->
      <div v-if="!localNodeData.ruleGroups || localNodeData.ruleGroups.length === 0" 
           class="py-6 px-4 text-center border-2 border-dashed border-purple-200 rounded-md bg-purple-50">
        <div class="text-purple-500 mb-2">
          <Icon name="material-symbols:rule" class="w-12 h-12 mx-auto" />
        </div>
        <h3 class="text-lg font-medium text-gray-700 mb-2">No Business Rules Defined</h3>
        <p class="text-sm text-gray-600 mb-4">
          Add your first rule to define when conditions occur and what actions should be taken.
        </p>
        <RsButton 
          @click="addRuleGroup" 
          variant="primary"
          size="md"
        >
          <Icon name="material-symbols:add" class="mr-1" /> Add First Rule
        </RsButton>
      </div>
      
      <!-- Rules list -->
      <div v-else class="space-y-6">
        <!-- Each rule group is an if-then rule -->
        <div 
          v-for="(ruleGroup, groupIndex) in localNodeData.ruleGroups" 
          :key="groupIndex"
          class="rule-group border rounded-md overflow-hidden bg-white shadow-sm transition-all hover:shadow-md"
        >
          <!-- Rule header -->
          <div class="rule-header bg-purple-50 px-4 py-3 flex justify-between items-center border-b">
            <h5 class="font-medium flex items-center">
              <Icon name="material-symbols:format-list-numbered" class="mr-1 text-purple-600" />
              <span class="text-purple-600 mr-1">Rule {{ groupIndex + 1 }}:</span> 
              {{ ruleGroup.name || 'Unnamed Rule' }}
            </h5>
            <div class="flex items-center space-x-2">
              <input
                v-model="ruleGroup.name"
                type="text"
                class="form-control h-8 text-sm"
                placeholder="Rule name"
                @blur="saveChanges"
              />
              <button 
                @click="removeRuleGroup(groupIndex)" 
                class="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                title="Remove rule"
              >
                <Icon name="material-symbols:delete-outline" />
              </button>
            </div>
          </div>
          
          <!-- IF section -->
          <div class="if-section p-4 bg-gray-50 border-b">
            <div class="flex justify-between items-center mb-3">
              <h6 class="font-medium text-gray-700 flex items-center">
                <span class="w-5 h-5 bg-purple-100 rounded-full text-xs flex items-center justify-center text-purple-800 mr-2">
                  IF
                </span>
                Conditions
              </h6>
              <RsButton 
                @click="addCondition(groupIndex)" 
                variant="secondary"
                size="sm"
                class="btn-sm-purple"
              >
                <Icon name="material-symbols:add" class="mr-1" /> Add Condition
              </RsButton>
            </div>
            
            <!-- No conditions placeholder -->
            <div v-if="!ruleGroup.conditions || ruleGroup.conditions.length === 0" 
                class="py-4 text-center text-gray-500 text-sm border border-dashed rounded-md bg-white">
              <p class="mb-2">
                No conditions defined. Add a condition to specify when this rule applies.
              </p>
              <RsButton 
                @click="addCondition(groupIndex)" 
                variant="secondary"
                size="sm"
                class="btn-sm-purple"
              >
                <Icon name="material-symbols:add" class="mr-1" /> Add First Condition
              </RsButton>
            </div>
            
            <!-- Conditions table -->
            <div v-else>
              <div class="bg-white border rounded-md overflow-hidden">
                <table class="w-full border-collapse">
                  <thead>
                    <tr>
                      <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variable</th>
                      <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operator</th>
                      <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                      <th class="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(condition, condIndex) in ruleGroup.conditions" :key="condIndex" class="border-t hover:bg-gray-50">
                      <td class="px-3 py-2">
                        <select
                          v-model="condition.variable"
                          class="form-select"
                          @change="saveChanges"
                        >
                          <option value="" disabled>Select variable</option>
                          <option
                            v-for="variable in availableVariables"
                            :key="variable.name"
                            :value="variable.name"
                          >
                            {{ variable.label }}
                          </option>
                        </select>
                      </td>
                      <td class="px-3 py-2">
                        <select
                          v-model="condition.operator"
                          class="form-select"
                          @change="updateConditionOperator(groupIndex, condIndex)"
                        >
                          <option value="" disabled>Select operator</option>
                          <option
                            v-for="op in getOperatorsForType(
                              availableVariables.find(v => v.name === condition.variable)?.type
                            )"
                            :key="op.value"
                            :value="op.value"
                          >
                            {{ op.label }}
                          </option>
                        </select>
                      </td>
                      <td class="px-3 py-2">
                        <template v-if="getInputType(
                          availableVariables.find(v => v.name === condition.variable)?.type,
                          condition.operator
                        ) !== 'none'">
                          <input
                            v-model="condition.value"
                            :type="getInputType(
                              availableVariables.find(v => v.name === condition.variable)?.type,
                              condition.operator
                            )"
                            class="form-control"
                            :placeholder="condition.operator?.includes('n_days') ? 'Number of days' : 'Value'"
                            @blur="saveChanges"
                          />
                        </template>
                        <span v-else class="text-gray-400 text-sm italic">N/A</span>
                      </td>
                      <td class="px-3 py-2 text-center">
                        <button 
                          @click="removeCondition(groupIndex, condIndex)" 
                          class="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                          title="Remove condition"
                        >
                          <Icon name="material-symbols:delete-outline" class="text-sm" />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <!-- Condition type selection -->
              <div class="mt-3 pt-3 border-t border-gray-200 flex flex-wrap items-center">
                <span class="text-sm font-medium text-gray-700 mr-3">Match Type:</span>
                <div class="space-x-4">
                  <label class="inline-flex items-center">
                    <input 
                      type="radio" 
                      v-model="ruleGroup.conditionType" 
                      value="all" 
                      class="form-radio" 
                      @change="saveChanges" 
                    />
                    <span class="ml-2 text-sm">Match All Conditions (AND)</span>
                  </label>
                  <label class="inline-flex items-center">
                    <input 
                      type="radio" 
                      v-model="ruleGroup.conditionType" 
                      value="any" 
                      class="form-radio" 
                      @change="saveChanges" 
                    />
                    <span class="ml-2 text-sm">Match Any Condition (OR)</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <!-- THEN section -->
          <div class="then-section p-4">
            <div class="flex justify-between items-center mb-3">
              <h6 class="font-medium text-gray-700 flex items-center">
                <span class="w-5 h-5 bg-purple-100 rounded-full text-xs flex items-center justify-center text-purple-800 mr-2">
                  THEN
                </span>
                Actions
              </h6>
              <RsButton 
                @click="addAction(groupIndex)" 
                variant="secondary"
                size="sm"
                class="btn-sm-purple"
              >
                <Icon name="material-symbols:add" class="mr-1" /> Add Action
              </RsButton>
            </div>
            
            <!-- No actions placeholder -->
            <div v-if="!ruleGroup.actions || ruleGroup.actions.length === 0" 
                class="py-4 text-center text-gray-500 text-sm border border-dashed rounded-md bg-white">
              <p class="mb-2">
                No actions defined. Add an action to specify what happens when conditions are met.
              </p>
              <RsButton 
                @click="addAction(groupIndex)" 
                variant="secondary"
                size="sm"
                class="btn-sm-purple"
              >
                <Icon name="material-symbols:add" class="mr-1" /> Add First Action
              </RsButton>
            </div>
            
            <!-- Actions table -->
            <div v-else>
              <div class="bg-white border rounded-md overflow-hidden">
                <table class="w-full border-collapse">
                  <thead>
                    <tr>
                      <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action Type</th>
                      <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                      <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Configuration</th>
                      <th class="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(action, actionIndex) in ruleGroup.actions" :key="actionIndex" class="border-t hover:bg-gray-50">
                      <td class="px-3 py-2">
                        <select
                          v-model="action.type"
                          class="form-select"
                          @change="updateActionType(groupIndex, actionIndex)"
                        >
                          <option value="set_variable">Set Variable</option>
                          <option value="calculate">Calculate Value</option>
                          <option value="increment">Increment Variable</option>
                          <option value="decrement">Decrement Variable</option>
                        </select>
                      </td>
                      <td class="px-3 py-2">
                        <select
                          v-model="action.variable"
                          class="form-select"
                          @change="saveChanges"
                        >
                          <option value="" disabled>Target variable</option>
                          <option
                            v-for="variable in availableVariables"
                            :key="variable.name"
                            :value="variable.name"
                          >
                            {{ variable.label }}
                          </option>
                        </select>
                      </td>
                      <td class="px-3 py-2">
                        <!-- Set Variable -->
                        <div v-if="action.type === 'set_variable'">
                          <input
                            v-model="action.value"
                            type="text"
                            class="form-control"
                            placeholder="Value"
                            @blur="saveChanges"
                          />
                        </div>
                        
                        <!-- Calculate -->
                        <div v-else-if="action.type === 'calculate'" class="flex items-center space-x-2">
                          <select
                            v-model="action.operator"
                            class="form-select w-24"
                            @change="saveChanges"
                          >
                            <option value="add">+</option>
                            <option value="subtract">-</option>
                            <option value="multiply">×</option>
                            <option value="divide">÷</option>
                          </select>
                          
                          <input
                            v-model="action.value"
                            type="text"
                            class="form-control"
                            placeholder="Value"
                            @blur="saveChanges"
                          />
                        </div>
                        
                        <!-- Increment/Decrement -->
                        <div v-else>
                          <span class="text-gray-400 text-sm italic">
                            {{ action.type === 'increment' ? 'Will increase by 1' : 'Will decrease by 1' }}
                          </span>
                        </div>
                      </td>
                      <td class="px-3 py-2 text-center">
                        <button 
                          @click="removeAction(groupIndex, actionIndex)" 
                          class="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                          title="Remove action"
                        >
                          <Icon name="material-symbols:delete-outline" class="text-sm" />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useVariableStore } from '~/stores/variableStore';
import { DateTime } from 'luxon';
import { Icon } from '#components';

const props = defineProps({
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

const emit = defineEmits(['update', 'close']);

// Get the variable store for variables
const variableStore = useVariableStore();

// Create a local copy of the node data for editing
const localNodeData = ref({
  label: '',
  description: '',
  ruleGroups: [],
  priority: 'medium',
  ...props.nodeData
});

// Get available variables for conditions and actions
const availableVariables = computed(() => {
  const processVars = variableStore.getAllVariables.process.map(v => ({
    name: v.name || 'unnamed',
    label: v?.description
      ? `${v.description} (${v.name || 'unnamed'}, process)`
      : `${v.name || 'unnamed'} (process)`,
    type: v.type || 'string',
    scope: 'process'
  }));
  
  const globalVars = variableStore.getAllVariables.global.map(v => ({
    name: v.name || 'unnamed',
    label: v?.description
      ? `${v.description} (${v.name || 'unnamed'}, global)`
      : `${v.name || 'unnamed'} (global)`,
    type: v.type || 'string',
    scope: 'global'
  }));
  
  return [...processVars, ...globalVars];
});

// Initialize with default values if needed
onMounted(() => {
  // If we have old-style conditions/actions, migrate them to the new format
  if (Array.isArray(localNodeData.value.conditions) && localNodeData.value.conditions.length > 0) {
    migrateOldFormat();
  } else if (!localNodeData.value.ruleGroups) {
    localNodeData.value.ruleGroups = [];
  }
  
  if (!localNodeData.value.priority) {
    localNodeData.value.priority = 'medium';
  }
  
  saveChanges();
});

// Migrate old format to new format
const migrateOldFormat = () => {
  // Convert old format (separate conditions and actions) to new format (rule groups)
  const defaultRuleGroup = {
    name: 'Rule 1',
    conditions: localNodeData.value.conditions || [],
    actions: localNodeData.value.actions || [],
    conditionType: 'all' // Default to "AND" logic
  };
  
  localNodeData.value.ruleGroups = [defaultRuleGroup];
  
  // Remove old properties
  delete localNodeData.value.conditions;
  delete localNodeData.value.actions;
};

// Watch for changes from parent
watch(() => props.nodeData, (newData) => {
  if (newData) {
    // Initialize with the passed data
    localNodeData.value = {
      label: '',
      description: '',
      ruleGroups: [],
      priority: 'medium',
      ...newData
    };
    
    // Check if we need to migrate
    if (Array.isArray(localNodeData.value.conditions) && !Array.isArray(localNodeData.value.ruleGroups)) {
      migrateOldFormat();
    }
  }
}, { deep: true });

// Save changes to the node
const saveChanges = () => {
  emit('update', localNodeData.value);
};

// Rule group operations
const addRuleGroup = () => {
  localNodeData.value.ruleGroups.push({
    name: `Rule ${localNodeData.value.ruleGroups.length + 1}`,
    conditions: [],
    actions: [],
    conditionType: 'all'
  });
  saveChanges();
};

const removeRuleGroup = (groupIndex) => {
  localNodeData.value.ruleGroups.splice(groupIndex, 1);
  saveChanges();
};

// Condition operations
const addCondition = (groupIndex) => {
  localNodeData.value.ruleGroups[groupIndex].conditions.push({
    variable: '',
    operator: 'eq',
    value: ''
  });
  saveChanges();
};

const removeCondition = (groupIndex, conditionIndex) => {
  localNodeData.value.ruleGroups[groupIndex].conditions.splice(conditionIndex, 1);
  saveChanges();
};

// Action operations
const addAction = (groupIndex) => {
  localNodeData.value.ruleGroups[groupIndex].actions.push({
    type: 'set_variable',
    variable: '',
    value: ''
  });
  saveChanges();
};

const removeAction = (groupIndex, actionIndex) => {
  localNodeData.value.ruleGroups[groupIndex].actions.splice(actionIndex, 1);
  saveChanges();
};

// Update action properties based on type
const updateActionType = (groupIndex, actionIndex) => {
  const action = localNodeData.value.ruleGroups[groupIndex].actions[actionIndex];
  
  // Reset properties for the action type
  if (action.type === 'set_variable') {
    action.variable = action.variable || '';
    action.value = action.value || '';
    delete action.operator;
  } else if (action.type === 'calculate') {
    action.variable = action.variable || '';
    action.operator = action.operator || 'add';
    action.value = action.value || '';
  } else if (['increment', 'decrement'].includes(action.type)) {
    action.variable = action.variable || '';
    delete action.value;
    delete action.operator;
  }
  
  saveChanges();
};

// Get operators based on variable type
const getOperatorsForType = (type) => {
  switch (type?.toLowerCase()) {
    case 'number':
    case 'int':
    case 'decimal':
      return [
        { value: 'eq', label: '= (Equal to)' },
        { value: 'neq', label: '≠ (Not equal to)' },
        { value: 'gt', label: '> (Greater than)' },
        { value: 'gte', label: '≥ (Greater than or equal)' },
        { value: 'lt', label: '< (Less than)' },
        { value: 'lte', label: '≤ (Less than or equal)' }
      ];
    case 'string':
      return [
        { value: 'eq', label: '= (Equal to)' },
        { value: 'neq', label: '≠ (Not equal to)' },
        { value: 'contains', label: 'Contains' },
        { value: 'not_contains', label: 'Does not contain' },
        { value: 'starts_with', label: 'Starts with' },
        { value: 'ends_with', label: 'Ends with' },
        { value: 'is_empty', label: 'Is empty' },
        { value: 'is_not_empty', label: 'Is not empty' }
      ];
    case 'datetime':
    case 'date':
      return [
        { value: 'eq', label: '= (Equal to)' },
        { value: 'neq', label: '≠ (Not equal to)' },
        { value: 'gt', label: '> (After)' },
        { value: 'gte', label: '≥ (On or after)' },
        { value: 'lt', label: '< (Before)' },
        { value: 'lte', label: '≤ (On or before)' },
        { value: 'is_today', label: 'Is today' },
        { value: 'is_future', label: 'Is in the future' },
        { value: 'is_past', label: 'Is in the past' },
        { value: 'last_n_days', label: 'In the last N days' },
        { value: 'next_n_days', label: 'In the next N days' }
      ];
    case 'boolean':
      return [
        { value: 'is_true', label: 'Is true' },
        { value: 'is_false', label: 'Is false' }
      ];
    case 'object':
      return [
        { value: 'eq', label: '= (Equal to)' },
        { value: 'neq', label: '≠ (Not equal to)' },
        { value: 'contains_key', label: 'Contains key' },
        { value: 'not_contains_key', label: 'Does not contain key' },
        { value: 'is_empty', label: 'Is empty' },
        { value: 'is_not_empty', label: 'Is not empty' }
      ];
    default:
      return [
        { value: 'eq', label: '= (Equal to)' },
        { value: 'neq', label: '≠ (Not equal to)' },
        { value: 'is_empty', label: 'Is empty' },
        { value: 'is_not_empty', label: 'Is not empty' }
      ];
  }
};

// Get input type based on variable type and operator
const getInputType = (varType, operator) => {
  // Special operators that don't need value input
  const noValueOperators = [
    'is_empty', 'is_not_empty', 'is_true', 'is_false',
    'is_today', 'is_future', 'is_past'
  ];
  
  if (noValueOperators.includes(operator)) {
    return 'none';
  }

  switch (varType?.toLowerCase()) {
    case 'number':
    case 'int':
    case 'decimal':
      return 'number';
    case 'datetime':
      return 'datetime-local';
    case 'date':
      return 'date';
    case 'boolean':
      return 'checkbox';
    case 'object':
      return 'text'; // For JSON input
    default:
      return 'text';
  }
};

// Format value based on type for display/comparison
const formatValue = (value, type, operator) => {
  if (value === null || value === undefined) return '';
  
  switch (type?.toLowerCase()) {
    case 'datetime':
    case 'date':
      try {
        const dt = DateTime.fromISO(value);
        return type === 'datetime' ? dt.toISO() : dt.toISODate();
      } catch {
        return value;
      }
    case 'number':
    case 'int':
    case 'decimal':
      return Number(value);
    case 'boolean':
      return Boolean(value);
    case 'object':
      try {
        return typeof value === 'string' ? value : JSON.stringify(value);
      } catch {
        return String(value);
      }
    default:
      return String(value);
  }
};

// Parse value from input based on type
const parseValue = (value, type) => {
  if (value === null || value === undefined) return null;
  
  switch (type?.toLowerCase()) {
    case 'datetime':
    case 'date':
      try {
        const dt = DateTime.fromISO(value);
        return type === 'datetime' ? dt.toISO() : dt.toISODate();
      } catch {
        return value;
      }
    case 'number':
    case 'int':
      return parseInt(value);
    case 'decimal':
      return parseFloat(value);
    case 'boolean':
      return Boolean(value);
    case 'object':
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    default:
      return value;
  }
};

// Add new methods for handling condition updates
const updateConditionOperator = (groupIndex, condIndex) => {
  const condition = localNodeData.value.ruleGroups[groupIndex].conditions[condIndex];
  const varType = availableVariables.value.find(v => v.name === condition.variable)?.type;
  
  // Reset value if operator doesn't need it
  if (getInputType(varType, condition.operator) === 'none') {
    condition.value = null;
  }
  
  saveChanges();
};
</script>

<style scoped>
.form-control {
  @apply block w-full p-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm;
}

.form-select {
  @apply block w-full p-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm;
}

.form-checkbox {
  @apply h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded;
}

.form-radio {
  @apply h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300;
}

.btn-add-rule {
  @apply bg-purple-600 hover:bg-purple-700 focus:ring-purple-500;
}

.btn-sm-purple {
  @apply bg-white hover:bg-gray-50 text-purple-700 border-purple-300 hover:border-purple-400 focus:ring-purple-500;
}

table {
  @apply border-collapse;
}

th {
  @apply font-medium text-xs text-gray-600 bg-gray-50 py-2 px-3;
}

tbody tr {
  @apply hover:bg-gray-50;
}

td {
  @apply border-t border-gray-200 py-2 px-3;
}

.rule-group {
  @apply transition-all duration-200 relative border-purple-200;
}

.rule-group:hover {
  @apply shadow-md border-purple-300;
}
</style> 