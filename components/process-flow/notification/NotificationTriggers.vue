<template>
  <div class="notification-triggers">
    <div class="mb-4 flex justify-between items-center">
      <h3 class="text-lg font-medium text-gray-900">Notification Triggers</h3>
      <RsButton @click="showNewTriggerModal = true" variant="primary" size="sm">
        <Icon name="material-symbols:add" class="mr-1" />
        New Trigger
      </RsButton>
    </div>

    <!-- Triggers List -->
    <div v-if="triggers.length > 0" class="space-y-3">
      <div v-for="trigger in triggers" :key="trigger.id" 
        class="border rounded-md p-3 hover:bg-gray-50 cursor-pointer"
        @click="selectTrigger(trigger)">
        <div class="flex justify-between items-start">
          <div>
            <h4 class="font-medium text-gray-800">{{ trigger.name }}</h4>
            <p class="text-sm text-gray-500">{{ trigger.description }}</p>
          </div>
          <div :class="`text-${getTriggerTypeColor(trigger.triggerType)}-500`">
            <Icon :name="getTriggerTypeIcon(trigger.triggerType)" />
          </div>
        </div>
        <div class="flex items-center mt-2 text-xs text-gray-500 space-x-4">
          <span class="flex items-center">
            <Icon name="material-symbols:trigger" class="mr-1" />
            {{ trigger.triggerType }}
          </span>
          <span class="flex items-center">
            <Icon name="material-symbols:template-outline" class="mr-1" />
            {{ trigger.templateName || 'No template' }}
          </span>
          <span v-if="trigger.enabled" class="flex items-center text-green-500">
            <Icon name="material-symbols:check-circle-outline" class="mr-1" />
            Enabled
          </span>
          <span v-else class="flex items-center text-gray-400">
            <Icon name="material-symbols:disabled-circle-outline" class="mr-1" />
            Disabled
          </span>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-8 bg-gray-50 rounded-md">
      <Icon name="material-symbols:bolt" class="text-4xl text-gray-400 mb-2" />
      <h4 class="text-gray-500 font-medium">No Triggers</h4>
      <p class="text-sm text-gray-400 mb-4">Create triggers to define when notifications should be sent</p>
      <RsButton @click="showNewTriggerModal = true" variant="primary" size="sm">
        Create Trigger
      </RsButton>
    </div>

    <!-- Trigger Modal -->
    <RsModal
      v-model="showTriggerModal"
      :title="editingTrigger ? 'Edit Trigger' : 'New Trigger'"
      size="lg"
      position="center"
      :okCallback="saveTrigger"
      okTitle="Save Trigger"
      :cancelCallback="closeTriggerModal"
    >
      <div class="p-4 space-y-4">
        <!-- Basic Info -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Trigger Name</label>
            <input
              v-model="currentTrigger.name"
              type="text"
              class="w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
              placeholder="Enter trigger name"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Trigger Type</label>
            <select
              v-model="currentTrigger.triggerType"
              class="w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
            >
              <option value="event">Event-based</option>
              <option value="schedule">Schedule-based</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            v-model="currentTrigger.description"
            rows="2"
            class="w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
            placeholder="Describe this trigger's purpose"
          ></textarea>
        </div>

        <!-- Event-based settings -->
        <div v-if="currentTrigger.triggerType === 'event'" class="border-t pt-4">
          <h4 class="font-medium text-gray-700 mb-3">Event Settings</h4>
          
          <div class="mb-3">
            <label class="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
            <select
              v-model="currentTrigger.eventType"
              class="w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
            >
              <option value="status_change">Status Change</option>
              <option value="task_assignment">Task Assignment</option>
              <option value="form_submission">Form Submission</option>
              <option value="process_started">Process Started</option>
              <option value="process_completed">Process Completed</option>
              <option value="task_deadline_approaching">Task Deadline Approaching</option>
              <option value="task_overdue">Task Overdue</option>
            </select>
          </div>
          
          <!-- Status change specific fields -->
          <div v-if="currentTrigger.eventType === 'status_change'" class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">From Status</label>
              <select
                v-model="currentTrigger.fromStatus"
                class="w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
              >
                <option value="any">Any Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">To Status</label>
              <select
                v-model="currentTrigger.toStatus"
                class="w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
          
          <!-- Task deadline specific fields -->
          <div v-if="currentTrigger.eventType === 'task_deadline_approaching'" class="mb-3">
            <label class="block text-sm font-medium text-gray-700 mb-1">Hours Before Deadline</label>
            <input
              v-model.number="currentTrigger.hoursBeforeDeadline"
              type="number"
              min="1"
              class="w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
              placeholder="24"
            />
          </div>
        </div>
        
        <!-- Schedule-based settings -->
        <div v-if="currentTrigger.triggerType === 'schedule'" class="border-t pt-4">
          <h4 class="font-medium text-gray-700 mb-3">Schedule Settings</h4>
          
          <div class="mb-3">
            <label class="block text-sm font-medium text-gray-700 mb-1">Schedule Type</label>
            <select
              v-model="currentTrigger.scheduleType"
              class="w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
            >
              <option value="one_time">One-time</option>
              <option value="recurring">Recurring</option>
            </select>
          </div>
          
          <!-- One-time schedule -->
          <div v-if="currentTrigger.scheduleType === 'one_time'" class="mb-3">
            <label class="block text-sm font-medium text-gray-700 mb-1">Scheduled Date/Time</label>
            <input
              v-model="currentTrigger.scheduledDateTime"
              type="datetime-local"
              class="w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
            />
          </div>
          
          <!-- Recurring schedule -->
          <div v-if="currentTrigger.scheduleType === 'recurring'" class="space-y-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Recurrence Pattern</label>
              <select
                v-model="currentTrigger.recurrencePattern"
                class="w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            
            <!-- Weekly options -->
            <div v-if="currentTrigger.recurrencePattern === 'weekly'" class="mb-3">
              <label class="block text-sm font-medium text-gray-700 mb-2">Days of Week</label>
              <div class="flex flex-wrap gap-2">
                <label v-for="day in weekDays" :key="day.value" class="inline-flex items-center">
                  <input 
                    type="checkbox" 
                    v-model="currentTrigger.daysOfWeek" 
                    :value="day.value" 
                    class="form-checkbox" 
                  />
                  <span class="ml-2">{{ day.label }}</span>
                </label>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Time of Day</label>
              <input
                v-model="currentTrigger.timeOfDay"
                type="time"
                class="w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
              />
            </div>
          </div>
        </div>
        
        <!-- Conditions -->
        <div class="border-t pt-4">
          <div class="flex justify-between items-center mb-2">
            <h4 class="font-medium text-gray-700">Conditions</h4>
            <RsButton @click="addCondition" variant="tertiary" size="xs">
              <Icon name="material-symbols:add" class="mr-1" />
              Add Condition
            </RsButton>
          </div>
          
          <div v-if="currentTrigger.conditions.length === 0" class="text-center py-4 bg-gray-50 rounded-md text-sm text-gray-500">
            No conditions added. Notification will trigger without additional conditions.
          </div>
          
          <div v-else class="space-y-3">
            <div v-for="(condition, index) in currentTrigger.conditions" :key="index" class="p-3 border rounded-md bg-gray-50">
              <div class="flex justify-between items-start">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
                  <div>
                    <select
                      v-model="condition.field"
                      class="w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
                    >
                      <option value="">Select field</option>
                      <option v-for="field in availableFields" :key="field.name" :value="field.name">
                        {{ field.label }}
                      </option>
                    </select>
                  </div>
                  <div>
                    <select
                      v-model="condition.operator"
                      class="w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
                    >
                      <option value="equals">Equals</option>
                      <option value="not_equals">Not Equals</option>
                      <option value="contains">Contains</option>
                      <option value="greater_than">Greater Than</option>
                      <option value="less_than">Less Than</option>
                    </select>
                  </div>
                  <div>
                    <input
                      v-model="condition.value"
                      type="text"
                      class="w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
                      placeholder="Value"
                    />
                  </div>
                </div>
                <button @click="removeCondition(index)" class="ml-2 text-red-500 hover:text-red-700">
                  <Icon name="material-symbols:delete-outline" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Notification template -->
        <div class="border-t pt-4">
          <h4 class="font-medium text-gray-700 mb-3">Notification Settings</h4>
          
          <div class="mb-3">
            <label class="block text-sm font-medium text-gray-700 mb-1">Select Template</label>
            <select
              v-model="currentTrigger.templateId"
              class="w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
            >
              <option value="">Select a template</option>
              <option v-for="template in availableTemplates" :key="template.id" :value="template.id">
                {{ template.name }}
              </option>
            </select>
          </div>
          
          <!-- Recipients -->
          <div class="mb-3">
            <label class="block text-sm font-medium text-gray-700 mb-1">Recipients</label>
            <select
              v-model="currentTrigger.recipientType"
              class="w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm mb-2"
            >
              <option value="user">Specific User</option>
              <option value="role">Role</option>
              <option value="process_variable">Process Variable</option>
              <option value="event_initiator">Event Initiator</option>
              <option value="task_assignee">Task Assignee</option>
            </select>
            
            <div v-if="currentTrigger.recipientType === 'user'">
              <select
                v-model="currentTrigger.recipientUserId"
                class="w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
              >
                <option value="">Select user</option>
                <option v-for="user in mockUsers" :key="user.id" :value="user.id">
                  {{ user.name }}
                </option>
              </select>
            </div>
            
            <div v-if="currentTrigger.recipientType === 'role'">
              <select
                v-model="currentTrigger.recipientRoleId"
                class="w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
              >
                <option value="">Select role</option>
                <option v-for="role in mockRoles" :key="role.id" :value="role.id">
                  {{ role.name }}
                </option>
              </select>
            </div>
            
            <div v-if="currentTrigger.recipientType === 'process_variable'">
              <select
                v-model="currentTrigger.recipientVariable"
                class="w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
              >
                <option value="">Select variable</option>
                <option v-for="variable in availableVariables" :key="variable.name" :value="variable.name">
                  {{ variable.label }}
                </option>
              </select>
            </div>
          </div>
        </div>
        
        <!-- Enable/Disable -->
        <div class="border-t pt-4">
          <label class="inline-flex items-center">
            <input 
              type="checkbox" 
              v-model="currentTrigger.enabled" 
              class="form-checkbox" 
            />
            <span class="ml-2">Enable this trigger</span>
          </label>
        </div>
      </div>
    </RsModal>

    <!-- Delete Confirmation Modal -->
    <RsModal
      v-model="showDeleteModal"
      title="Delete Trigger"
      size="md"
      position="center"
      :okCallback="confirmDeleteTrigger"
      okTitle="Delete"
      :cancelCallback="cancelDeleteTrigger"
    >
      <div class="p-4">
        <div class="flex items-start mb-4">
          <div class="mr-4 text-red-500 flex-shrink-0 mt-1">
            <Icon name="material-symbols:delete-outline" class="text-2xl" />
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-900">Delete Trigger</h3>
            <p class="text-sm text-gray-500 mt-1">
              Are you sure you want to delete this trigger? This action cannot be undone.
            </p>
          </div>
        </div>
        <div class="bg-gray-50 p-3 rounded-md">
          <p class="font-medium">{{ triggerToDelete?.name }}</p>
          <p class="text-sm text-gray-500">{{ triggerToDelete?.description }}</p>
        </div>
      </div>
    </RsModal>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { Icon } from '#components';

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  availableTemplates: {
    type: Array,
    default: () => []
  },
  availableVariables: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:modelValue', 'select']);

// Trigger data
const triggers = ref(props.modelValue || []);
const showTriggerModal = ref(false);
const showNewTriggerModal = ref(false);
const showDeleteModal = ref(false);
const editingTrigger = ref(false);
const triggerToDelete = ref(null);

// Mock data
const mockUsers = [
  { id: 'user1', name: 'John Doe' },
  { id: 'user2', name: 'Jane Smith' },
  { id: 'user3', name: 'Mike Johnson' }
];

const mockRoles = [
  { id: 'role1', name: 'Administrator' },
  { id: 'role2', name: 'Manager' },
  { id: 'role3', name: 'Approver' },
  { id: 'role4', name: 'User' }
];

const weekDays = [
  { value: 'monday', label: 'Mon' },
  { value: 'tuesday', label: 'Tue' },
  { value: 'wednesday', label: 'Wed' },
  { value: 'thursday', label: 'Thu' },
  { value: 'friday', label: 'Fri' },
  { value: 'saturday', label: 'Sat' },
  { value: 'sunday', label: 'Sun' }
];

// Available fields for conditions
const availableFields = [
  { name: 'status', label: 'Status' },
  { name: 'assignee', label: 'Assignee' },
  { name: 'dueDate', label: 'Due Date' },
  { name: 'priority', label: 'Priority' },
  { name: 'formData.firstName', label: 'Form: First Name' },
  { name: 'formData.lastName', label: 'Form: Last Name' },
  { name: 'formData.email', label: 'Form: Email' }
];

// Current trigger being edited
const currentTrigger = ref({
  id: '',
  name: '',
  description: '',
  triggerType: 'event',
  eventType: 'status_change',
  fromStatus: 'any',
  toStatus: 'completed',
  hoursBeforeDeadline: 24,
  scheduleType: 'recurring',
  scheduledDateTime: '',
  recurrencePattern: 'daily',
  daysOfWeek: [],
  timeOfDay: '09:00',
  conditions: [],
  templateId: '',
  templateName: '',
  recipientType: 'user',
  recipientUserId: '',
  recipientRoleId: '',
  recipientVariable: '',
  enabled: true
});

// Watch for changes to modelValue prop
watch(() => props.modelValue, (value) => {
  triggers.value = value || [];
}, { deep: true });

// Methods
const selectTrigger = (trigger) => {
  editingTrigger.value = true;
  currentTrigger.value = JSON.parse(JSON.stringify(trigger));
  showTriggerModal.value = true;
  emit('select', trigger);
};

const createNewTrigger = () => {
  editingTrigger.value = false;
  currentTrigger.value = {
    id: `trigger_${Date.now()}`,
    name: '',
    description: '',
    triggerType: 'event',
    eventType: 'status_change',
    fromStatus: 'any',
    toStatus: 'completed',
    hoursBeforeDeadline: 24,
    scheduleType: 'recurring',
    scheduledDateTime: '',
    recurrencePattern: 'daily',
    daysOfWeek: [],
    timeOfDay: '09:00',
    conditions: [],
    templateId: '',
    templateName: '',
    recipientType: 'user',
    recipientUserId: '',
    recipientRoleId: '',
    recipientVariable: '',
    enabled: true
  };
  showTriggerModal.value = true;
};

// Watch for new trigger modal trigger
watch(() => showNewTriggerModal.value, (value) => {
  if (value) {
    createNewTrigger();
    showNewTriggerModal.value = false;
  }
});

const saveTrigger = () => {
  if (!currentTrigger.value.name) {
    // Show error or validation
    return;
  }
  
  // Update template name reference for display
  if (currentTrigger.value.templateId) {
    const selectedTemplate = props.availableTemplates.find(t => t.id === currentTrigger.value.templateId);
    if (selectedTemplate) {
      currentTrigger.value.templateName = selectedTemplate.name;
    }
  }

  if (editingTrigger.value) {
    // Update existing trigger
    const index = triggers.value.findIndex(t => t.id === currentTrigger.value.id);
    if (index !== -1) {
      triggers.value[index] = JSON.parse(JSON.stringify(currentTrigger.value));
    }
  } else {
    // Add new trigger
    triggers.value.push(JSON.parse(JSON.stringify(currentTrigger.value)));
  }

  emit('update:modelValue', triggers.value);
  showTriggerModal.value = false;
};

const closeTriggerModal = () => {
  showTriggerModal.value = false;
};

const addCondition = () => {
  currentTrigger.value.conditions.push({
    field: '',
    operator: 'equals',
    value: ''
  });
};

const removeCondition = (index) => {
  currentTrigger.value.conditions.splice(index, 1);
};

const deleteTrigger = (trigger) => {
  triggerToDelete.value = trigger;
  showDeleteModal.value = true;
};

const confirmDeleteTrigger = () => {
  if (triggerToDelete.value) {
    triggers.value = triggers.value.filter(t => t.id !== triggerToDelete.value.id);
    emit('update:modelValue', triggers.value);
    triggerToDelete.value = null;
    showDeleteModal.value = false;
  }
};

const cancelDeleteTrigger = () => {
  triggerToDelete.value = null;
  showDeleteModal.value = false;
};

// Helper methods
const getTriggerTypeIcon = (type) => {
  if (type === 'event') return 'material-symbols:bolt';
  if (type === 'schedule') return 'material-symbols:schedule';
  return 'material-symbols:bolt';
};

const getTriggerTypeColor = (type) => {
  if (type === 'event') return 'orange';
  if (type === 'schedule') return 'blue';
  return 'gray';
};
</script>

<style scoped>
.notification-triggers {
  @apply bg-white rounded-md;
}
</style> 