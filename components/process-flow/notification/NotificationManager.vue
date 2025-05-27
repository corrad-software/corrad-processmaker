<template>
  <div class="notification-manager">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900">Notification Manager</h2>
      <p class="text-gray-600">
        Manage notifications, templates, triggers, and preferences in one place.
      </p>
    </div>

    <!-- Tabs Navigation -->
    <div class="mb-6 border-b border-gray-200">
      <nav class="flex -mb-px">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'py-3 px-4 text-center border-b-2 font-medium text-sm',
            activeTab === tab.id
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
          class="mr-6"
        >
          <div class="flex items-center">
            <Icon :name="tab.icon" class="mr-2" />
            {{ tab.name }}
          </div>
        </button>
      </nav>
    </div>

    <!-- Tab Content -->
    <div v-if="activeTab === 'templates'" class="tab-content">
      <NotificationTemplates
        v-model="templates"
        @select="handleTemplateSelect"
      />
    </div>

    <div v-if="activeTab === 'triggers'" class="tab-content">
      <NotificationTriggers
        v-model="triggers"
        :availableTemplates="templates"
        :availableVariables="availableVariables"
        @select="handleTriggerSelect"
      />
    </div>

    <div v-if="activeTab === 'queue'" class="tab-content">
      <NotificationQueue
        v-model="queue"
        @process-queue="processQueue"
        @refresh-queue="refreshQueue"
        @resend="resendNotification"
      />
    </div>

    <div v-if="activeTab === 'logs'" class="tab-content">
      <NotificationLogs
        v-model="logs"
        @refresh-logs="refreshLogs"
        @export="exportLogs"
        @resend="resendNotification"
      />
    </div>

    <div v-if="activeTab === 'preferences'" class="tab-content">
      <UserPreferences
        v-model="userPreferences"
        :notificationTypes="notificationTypes"
        @save="saveUserPreferences"
      />
    </div>

    <!-- Dashboard (Summary Tab) -->
    <div v-if="activeTab === 'dashboard'" class="tab-content">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <!-- Summary Cards -->
        <div class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div class="flex items-center mb-4">
            <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
              <Icon name="material-symbols:template-outline" class="text-blue-600" />
            </div>
            <h3 class="text-lg font-medium text-gray-900">Templates</h3>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-3xl font-bold text-gray-800">{{ templates.length }}</span>
            <button 
              @click="activeTab = 'templates'" 
              class="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              View All
              <Icon name="material-symbols:chevron-right" class="ml-1" />
            </button>
          </div>
        </div>

        <div class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div class="flex items-center mb-4">
            <div class="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mr-3">
              <Icon name="material-symbols:bolt" class="text-orange-600" />
            </div>
            <h3 class="text-lg font-medium text-gray-900">Triggers</h3>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-3xl font-bold text-gray-800">{{ triggers.length }}</span>
            <button 
              @click="activeTab = 'triggers'" 
              class="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              View All
              <Icon name="material-symbols:chevron-right" class="ml-1" />
            </button>
          </div>
        </div>

        <div class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div class="flex items-center mb-4">
            <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
              <Icon name="material-symbols:notifications-outline" class="text-green-600" />
            </div>
            <h3 class="text-lg font-medium text-gray-900">Notifications</h3>
          </div>
          <div class="flex justify-between items-center">
            <div>
              <span class="text-3xl font-bold text-gray-800">{{ queue.length }}</span>
              <span class="text-sm text-gray-500 ml-2">In Queue</span>
            </div>
            <button 
              @click="activeTab = 'queue'" 
              class="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              View Queue
              <Icon name="material-symbols:chevron-right" class="ml-1" />
            </button>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="bg-white rounded-lg border border-gray-200 shadow-sm mb-8">
        <div class="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h3 class="font-medium text-gray-900">Recent Notifications</h3>
        </div>
        <div class="p-4">
          <div v-if="recentLogs.length === 0" class="text-center py-4">
            <p class="text-gray-500">No recent notifications.</p>
          </div>
          <div v-else class="space-y-3">
            <div v-for="log in recentLogs" :key="log.id" class="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
              <div class="flex items-start">
                <div :class="`text-${getTypeColor(log.type)}-500 mr-3 mt-1`">
                  <Icon :name="getTypeIcon(log.type)" />
                </div>
                <div class="flex-1">
                  <div class="flex justify-between items-start">
                    <h4 class="font-medium text-gray-900">{{ log.subject }}</h4>
                    <span 
                      :class="getStatusClass(log.status)" 
                      class="px-2 py-1 text-xs font-medium rounded-full"
                    >
                      {{ log.status }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-500 mt-1">
                    {{ log.recipient }} | {{ formatDate(log.timestamp) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="mt-4 text-center">
            <button 
              @click="activeTab = 'logs'" 
              class="text-sm text-blue-600 hover:text-blue-800 flex items-center justify-center mx-auto"
            >
              View All Logs
              <Icon name="material-symbols:chevron-right" class="ml-1" />
            </button>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div class="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h3 class="font-medium text-gray-900">Quick Actions</h3>
        </div>
        <div class="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <RsButton @click="activeTab = 'templates'; showNewTemplateModal = true" class="w-full">
            <Icon name="material-symbols:add" class="mr-1" />
            New Template
          </RsButton>
          <RsButton @click="activeTab = 'triggers'; showNewTriggerModal = true" class="w-full">
            <Icon name="material-symbols:add" class="mr-1" />
            New Trigger
          </RsButton>
          <RsButton @click="activeTab = 'queue'; processQueue()" class="w-full">
            <Icon name="material-symbols:play-arrow" class="mr-1" />
            Process Queue
          </RsButton>
          <RsButton @click="activeTab = 'logs'; exportLogs(logs)" class="w-full">
            <Icon name="material-symbols:download" class="mr-1" />
            Export Logs
          </RsButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { Icon } from '#components';
import NotificationTemplates from './NotificationTemplates.vue';
import NotificationTriggers from './NotificationTriggers.vue';
import NotificationQueue from './NotificationQueue.vue';
import NotificationLogs from './NotificationLogs.vue';
import UserPreferences from './UserPreferences.vue';

const props = defineProps({
  userId: {
    type: String,
    default: ''
  },
  availableVariables: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update']);

// Tab navigation
const tabs = [
  { id: 'dashboard', name: 'Dashboard', icon: 'material-symbols:dashboard' },
  { id: 'templates', name: 'Templates', icon: 'material-symbols:template-outline' },
  { id: 'triggers', name: 'Triggers', icon: 'material-symbols:bolt' },
  { id: 'queue', name: 'Queue', icon: 'material-symbols:queue' },
  { id: 'logs', name: 'Logs', icon: 'material-symbols:history' },
  { id: 'preferences', name: 'Preferences', icon: 'material-symbols:settings' }
];

const activeTab = ref('dashboard');

// Mock data for demo purposes
// In a real implementation, these would be loaded from an API
const templates = ref([
  {
    id: 'template_1',
    name: 'Task Assignment',
    description: 'Notify users when they are assigned a task',
    type: 'info',
    subject: 'New Task Assignment: {taskName}',
    message: 'Hello {userName},\n\nYou have been assigned a new task: {taskName}.\n\nDue Date: {dueDate}\nPriority: {priority}\n\nPlease log in to the system to view the details.',
    emailFormat: 'html',
    htmlEmailContent: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
  <div style="background-color: #f0f7ff; padding: 15px; border-radius: 5px 5px 0 0; border-bottom: 2px solid #3b82f6;">
    <h2 style="color: #1e40af; margin: 0;">New Task Assignment</h2>
  </div>
  <div style="padding: 20px;">
    <p style="margin-top: 0;">Hello {userName},</p>
    <p>You have been assigned a new task:</p>
    <div style="background-color: #f9fafb; border-left: 4px solid #3b82f6; padding: 15px; margin: 15px 0;">
      <h3 style="margin-top: 0; color: #1e40af;">{taskName}</h3>
      <p style="margin-bottom: 5px;"><strong>Due Date:</strong> {dueDate}</p>
      <p style="margin-bottom: 0;"><strong>Priority:</strong> {priority}</p>
    </div>
    <p>Please log in to the system to view the task details and take action.</p>
    <div style="text-align: center; margin-top: 25px;">
      <a href="#" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Task</a>
    </div>
  </div>
  <div style="background-color: #f9fafb; padding: 15px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #6b7280; border-radius: 0 0 5px 5px;">
    <p style="margin: 0;">This is an automated notification from the Process Management System.</p>
  </div>
</div>`,
    channels: {
      inApp: true,
      email: true,
      sms: false
    },
    priority: 'medium',
    language: 'en',
    expiration: {
      enabled: true,
      value: 48,
      unit: 'hours'
    }
  },
  {
    id: 'template_2',
    name: 'Approval Request',
    description: 'Request approval for a document or process',
    type: 'warning',
    subject: 'Approval Required: {documentName}',
    message: 'Hello {userName},\n\nYour approval is required for {documentName} submitted by {requesterName}.\n\nPlease review and approve or reject by {dueDate}.',
    emailFormat: 'html',
    htmlEmailContent: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
  <div style="background-color: #fffbeb; padding: 15px; border-radius: 5px 5px 0 0; border-bottom: 2px solid #f59e0b;">
    <h2 style="color: #92400e; margin: 0;">Approval Required</h2>
  </div>
  <div style="padding: 20px;">
    <p style="margin-top: 0;">Hello {userName},</p>
    <p>Your approval is required for the following document:</p>
    <div style="background-color: #f9fafb; border-left: 4px solid #f59e0b; padding: 15px; margin: 15px 0;">
      <h3 style="margin-top: 0; color: #92400e;">{documentName}</h3>
      <p style="margin-bottom: 5px;"><strong>Submitted by:</strong> {requesterName}</p>
      <p style="margin-bottom: 0;"><strong>Due by:</strong> {dueDate}</p>
    </div>
    <p>Please review the document and take action by the due date.</p>
    <div style="text-align: center; margin-top: 25px; display: flex; justify-content: center; gap: 10px;">
      <a href="#" style="background-color: #22c55e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Approve</a>
      <a href="#" style="background-color: #ef4444; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reject</a>
      <a href="#" style="background-color: #6b7280; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Review</a>
    </div>
  </div>
  <div style="background-color: #f9fafb; padding: 15px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #6b7280; border-radius: 0 0 5px 5px;">
    <p style="margin: 0;">This approval request requires your attention. Please respond by the due date.</p>
  </div>
</div>`,
    channels: {
      inApp: true,
      email: true,
      sms: false
    },
    priority: 'high',
    language: 'en',
    expiration: {
      enabled: false,
      value: 24,
      unit: 'hours'
    }
  },
  {
    id: 'template_3',
    name: 'Process Completed',
    description: 'Notify when a process is successfully completed',
    type: 'success',
    subject: 'Process {processName} Completed Successfully',
    message: 'Hello {userName},\n\nWe are pleased to inform you that the process {processName} has been completed successfully.\n\nCompletion Date: {completionDate}\n\nThank you for using our system.',
    emailFormat: 'html',
    htmlEmailContent: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
  <div style="background-color: #ecfdf5; padding: 15px; border-radius: 5px 5px 0 0; border-bottom: 2px solid #10b981;">
    <h2 style="color: #065f46; margin: 0;">Process Completed Successfully</h2>
  </div>
  <div style="padding: 20px;">
    <p style="margin-top: 0;">Hello {userName},</p>
    <p>We are pleased to inform you that the following process has been completed successfully:</p>
    <div style="background-color: #f9fafb; border-left: 4px solid #10b981; padding: 15px; margin: 15px 0; text-align: center;">
      <h3 style="margin-top: 0; color: #065f46;">{processName}</h3>
      <p style="margin-bottom: 0;"><strong>Completion Date:</strong> {completionDate}</p>
    </div>
    <div style="text-align: center; margin: 25px 0;">
      <img src="https://via.placeholder.com/100" alt="Success" style="width: 60px; height: 60px;">
      <p style="color: #10b981; font-size: 18px; font-weight: bold; margin-top: 10px;">All tasks completed</p>
    </div>
    <p style="text-align: center;">Thank you for using our system.</p>
  </div>
  <div style="background-color: #f9fafb; padding: 15px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #6b7280; border-radius: 0 0 5px 5px; text-align: center;">
    <p style="margin: 0;">This is an automated notification from the Process Management System.</p>
  </div>
</div>`,
    channels: {
      inApp: true,
      email: true,
      sms: false
    },
    priority: 'medium',
    language: 'en',
    expiration: {
      enabled: false,
      value: 24,
      unit: 'hours'
    }
  }
]);

const triggers = ref([
  {
    id: 'trigger_1',
    name: 'Task Assignment Notification',
    description: 'Send notification when a task is assigned',
    triggerType: 'event',
    eventType: 'task_assignment',
    conditions: [
      { field: 'priority', operator: 'equals', value: 'high' }
    ],
    templateId: 'template_1',
    templateName: 'Task Assignment',
    recipientType: 'task_assignee',
    enabled: true
  },
  {
    id: 'trigger_2',
    name: 'Approval Request Notification',
    description: 'Send notification when approval is needed',
    triggerType: 'event',
    eventType: 'status_change',
    fromStatus: 'pending',
    toStatus: 'in_progress',
    conditions: [],
    templateId: 'template_2',
    templateName: 'Approval Request',
    recipientType: 'role',
    recipientRoleId: 'role3',
    enabled: true
  },
  {
    id: 'trigger_3',
    name: 'Daily Task Reminder',
    description: 'Send daily reminders for overdue tasks',
    triggerType: 'schedule',
    scheduleType: 'recurring',
    recurrencePattern: 'daily',
    timeOfDay: '09:00',
    conditions: [
      { field: 'status', operator: 'not_equals', value: 'completed' },
      { field: 'dueDate', operator: 'less_than', value: 'today' }
    ],
    templateId: 'template_1',
    templateName: 'Task Assignment',
    recipientType: 'task_assignee',
    enabled: true
  }
]);

const queue = ref([
  {
    id: 'notification_1',
    type: 'info',
    recipient: 'john.doe@example.com',
    subject: 'New Task Assignment: Annual Report Review',
    message: 'Hello John,\n\nYou have been assigned a new task: Annual Report Review.\n\nDue Date: 2023-12-15\nPriority: High\n\nPlease log in to the system to view the details.',
    status: 'pending',
    createdAt: '2023-11-25T09:30:00Z',
    channels: ['in-app', 'email'],
    attempts: 0
  },
  {
    id: 'notification_2',
    type: 'warning',
    recipient: 'jane.smith@example.com',
    subject: 'Approval Required: Q4 Marketing Budget',
    message: 'Hello Jane,\n\nYour approval is required for Q4 Marketing Budget submitted by John Doe.\n\nPlease review and approve or reject by 2023-11-30.',
    status: 'sent',
    createdAt: '2023-11-24T14:15:00Z',
    channels: ['in-app', 'email'],
    attempts: 1
  },
  {
    id: 'notification_3',
    type: 'error',
    recipient: 'mike.johnson@example.com',
    subject: 'Urgent: System Maintenance Required',
    message: 'Hello Mike,\n\nUrgent attention is required for system maintenance.\n\nPlease address this issue as soon as possible.',
    status: 'failed',
    createdAt: '2023-11-23T18:45:00Z',
    channels: ['in-app', 'email', 'sms'],
    attempts: 3,
    error: 'Failed to deliver SMS: Invalid phone number format',
    lastAttempt: '2023-11-23T19:15:00Z'
  }
]);

const logs = ref([
  {
    id: 'log_1',
    type: 'info',
    recipient: 'john.doe@example.com',
    subject: 'New Task Assignment: Annual Report Review',
    message: 'Hello John,\n\nYou have been assigned a new task: Annual Report Review.\n\nDue Date: 2023-12-15\nPriority: High\n\nPlease log in to the system to view the details.',
    status: 'delivered',
    timestamp: '2023-11-20T09:30:00Z',
    channel: 'in-app',
    templateName: 'Task Assignment'
  },
  {
    id: 'log_2',
    type: 'info',
    recipient: 'john.doe@example.com',
    subject: 'New Task Assignment: Annual Report Review',
    message: 'Hello John,\n\nYou have been assigned a new task: Annual Report Review.\n\nDue Date: 2023-12-15\nPriority: High\n\nPlease log in to the system to view the details.',
    status: 'delivered',
    timestamp: '2023-11-20T09:30:05Z',
    channel: 'email',
    templateName: 'Task Assignment'
  },
  {
    id: 'log_3',
    type: 'warning',
    recipient: 'jane.smith@example.com',
    subject: 'Approval Required: Q4 Marketing Budget',
    message: 'Hello Jane,\n\nYour approval is required for Q4 Marketing Budget submitted by John Doe.\n\nPlease review and approve or reject by 2023-11-30.',
    status: 'read',
    timestamp: '2023-11-19T14:15:00Z',
    readAt: '2023-11-19T15:20:00Z',
    channel: 'in-app',
    templateName: 'Approval Request'
  },
  {
    id: 'log_4',
    type: 'success',
    recipient: 'mike.johnson@example.com',
    subject: 'Process Quarterly Review Completed Successfully',
    message: 'Hello Mike,\n\nWe are pleased to inform you that the process Quarterly Review has been completed successfully.\n\nCompletion Date: 2023-11-18\n\nThank you for using our system.',
    status: 'delivered',
    timestamp: '2023-11-18T11:30:00Z',
    channel: 'in-app',
    templateName: 'Process Completed'
  },
  {
    id: 'log_5',
    type: 'error',
    recipient: '+1234567890',
    subject: 'Urgent: System Maintenance Required',
    message: 'Hello Mike,\n\nUrgent attention is required for system maintenance.\n\nPlease address this issue as soon as possible.',
    status: 'failed',
    timestamp: '2023-11-17T18:45:00Z',
    channel: 'sms',
    error: 'Failed to deliver SMS: Invalid phone number format'
  }
]);

const userPreferences = ref({
  enabled: true,
  channels: {
    inApp: true,
    email: true,
    sms: false
  },
  email: 'current.user@example.com',
  phoneNumber: '',
  frequency: 'instant',
  digestTime: '08:00',
  dnd: {
    enabled: true,
    startTime: '22:00',
    endTime: '07:00'
  },
  typePreferences: {
    template_1: {
      enabled: true,
      channels: {
        inApp: true,
        email: true,
        sms: false
      }
    },
    template_2: {
      enabled: true,
      channels: {
        inApp: true,
        email: true,
        sms: false
      }
    },
    template_3: {
      enabled: true,
      channels: {
        inApp: true,
        email: false,
        sms: false
      }
    }
  }
});

// Notification types for preferences
const notificationTypes = computed(() => {
  return templates.value.map(template => ({
    id: template.id,
    name: template.name,
    description: template.description,
    icon: getTypeIcon(template.type),
    color: getTypeColor(template.type)
  }));
});

// Recent logs for dashboard
const recentLogs = computed(() => {
  return logs.value.slice(0, 5);
});

// Show modals for new items
const showNewTemplateModal = ref(false);
const showNewTriggerModal = ref(false);

// Watch for changes to showNewTemplateModal
watch(() => showNewTemplateModal.value, (value) => {
  if (value) {
    // Trigger the createNewTemplate method in the NotificationTemplates component
    // This is done by emitting an event that the component will listen for
    emit('new-template');
  }
});

// Watch for changes to showNewTriggerModal
watch(() => showNewTriggerModal.value, (value) => {
  if (value) {
    // Trigger the createNewTrigger method in the NotificationTriggers component
    // This is done by emitting an event that the component will listen for
    emit('new-trigger');
  }
});

// Methods
const handleTemplateSelect = (template) => {
  console.log('Template selected:', template);
  // In a real implementation, this would load the template for editing
};

const handleTriggerSelect = (trigger) => {
  console.log('Trigger selected:', trigger);
  // In a real implementation, this would load the trigger for editing
};

const processQueue = () => {
  console.log('Processing queue...');
  // In a real implementation, this would call an API to process the queue
  
  // For demo purposes, we'll update a few items in the queue
  const pendingItems = queue.value.filter(item => item.status === 'pending');
  pendingItems.forEach(item => {
    const index = queue.value.findIndex(i => i.id === item.id);
    if (index !== -1) {
      queue.value[index] = {
        ...item,
        status: Math.random() > 0.2 ? 'sent' : 'failed',
        attempts: item.attempts + 1,
        lastAttempt: new Date().toISOString(),
        error: Math.random() > 0.8 ? 'Connection timeout' : null
      };
      
      // Add to logs for sent items
      if (queue.value[index].status === 'sent') {
        logs.value.unshift({
          id: `log_${Date.now()}_${queue.value[index].id}`,
          type: queue.value[index].type,
          recipient: queue.value[index].recipient,
          subject: queue.value[index].subject,
          message: queue.value[index].message,
          status: 'delivered',
          timestamp: new Date().toISOString(),
          channel: queue.value[index].channels[0],
          templateName: queue.value[index].templateName || 'Custom Notification'
        });
      }
    }
  });
};

const refreshQueue = () => {
  console.log('Refreshing queue...');
  // In a real implementation, this would fetch updated queue data from the API
};

const refreshLogs = () => {
  console.log('Refreshing logs...');
  // In a real implementation, this would fetch updated log data from the API
};

const exportLogs = (logsToExport) => {
  console.log('Exporting logs:', logsToExport.length);
  // In a real implementation, this would trigger an export of logs
};

const resendNotification = (item) => {
  console.log('Resending notification:', item);
  // In a real implementation, this would call an API to resend the notification
  
  // For demo purposes, we'll add it back to the queue
  queue.value.push({
    id: `notification_${Date.now()}`,
    type: item.type,
    recipient: item.recipient,
    subject: item.subject,
    message: item.message,
    status: 'pending',
    createdAt: new Date().toISOString(),
    channels: [item.channel],
    attempts: 0
  });
};

const saveUserPreferences = (preferences) => {
  console.log('Saving user preferences:', preferences);
  // In a real implementation, this would call an API to save the preferences
};

// Helper methods
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const getTypeIcon = (type) => {
  const icons = {
    info: 'material-symbols:info-outline',
    success: 'material-symbols:check-circle-outline',
    warning: 'material-symbols:warning-outline',
    error: 'material-symbols:error-outline'
  };
  return icons[type] || icons.info;
};

const getTypeColor = (type) => {
  const colors = {
    info: 'blue',
    success: 'green',
    warning: 'yellow',
    error: 'red'
  };
  return colors[type] || colors.info;
};

const getStatusClass = (status) => {
  const classes = {
    delivered: 'bg-green-100 text-green-800',
    read: 'bg-blue-100 text-blue-800',
    failed: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800',
    sent: 'bg-green-100 text-green-800'
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};
</script>

<style scoped>
.notification-manager {
  @apply bg-white rounded-md p-6;
}

.tab-content {
  @apply min-h-[500px];
}
</style> 