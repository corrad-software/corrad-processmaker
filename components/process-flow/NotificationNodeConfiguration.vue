<template>
  <div class="notification-node-configuration">
    <!-- Step 1: Basic Configuration -->
    <div class="mb-6 bg-gray-50 p-4 rounded-md border border-gray-200">
      <div class="flex items-center mb-3">
        <div class="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
          <span class="text-xs font-semibold text-blue-600">1</span>
        </div>
        <h4 class="font-medium">Basic Configuration</h4>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Notification Name -->
        <div>
          <label for="nodeLabel" class="block text-sm font-medium text-gray-700 mb-1">Notification Name</label>
          <input
            id="nodeLabel"
            v-model="localNodeData.label"
            type="text"
            class="w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
            placeholder="Enter a descriptive name"
            @blur="saveChanges"
          />
          <p class="mt-1 text-xs text-gray-500">
            A clear name helps identify this notification in the process flow
          </p>
        </div>
        
        <!-- Description -->
        <div>
          <label for="nodeDescription" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            id="nodeDescription"
            v-model="localNodeData.description"
            class="w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
            placeholder="Describe what this notification does"
            rows="2"
            @blur="saveChanges"
          ></textarea>
          <p class="mt-1 text-xs text-gray-500">
            Optional description to explain this notification's purpose
          </p>
        </div>
      </div>
    </div>
    
    <!-- Step 2: Notification Type -->
    <div class="mb-6 bg-gray-50 p-4 rounded-md border border-gray-200">
      <div class="flex items-center mb-3">
        <div class="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
          <span class="text-xs font-semibold text-blue-600">2</span>
        </div>
        <h4 class="font-medium">Notification Type</h4>
      </div>
      
      <div class="grid grid-cols-1 gap-4">
        <div class="flex flex-wrap gap-3 justify-center">
          <div 
            v-for="type in notificationTypes" 
            :key="type.value"
            @click="selectNotificationType(type.value)"
            class="notification-type-card cursor-pointer p-3 border rounded-md flex items-center"
            :class="localNodeData.notificationType === type.value ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200 hover:bg-gray-50'"
          >
            <div :class="`text-${type.color}-500 mr-3`">
              <Icon :name="type.icon" class="text-xl" />
            </div>
            <div>
              <h5 class="font-medium text-sm">{{ type.label }}</h5>
              <p class="text-xs text-gray-500">{{ type.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Step 3: Recipients -->
    <div class="mb-6 bg-gray-50 p-4 rounded-md border border-gray-200">
      <div class="flex items-center mb-3">
        <div class="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
          <span class="text-xs font-semibold text-blue-600">3</span>
        </div>
        <h4 class="font-medium">Recipients</h4>
      </div>
      
      <div class="grid grid-cols-1 gap-4">
        <!-- Recipient Type Selection -->
        <div class="mb-3">
          <label class="block text-sm font-medium text-gray-700 mb-2">Recipient Type</label>
          <div class="flex flex-wrap gap-2">
            <label class="inline-flex items-center">
              <input 
                type="radio" 
                v-model="localNodeData.recipientType" 
                value="user" 
                class="form-radio" 
                @change="saveChanges"
              />
              <span class="ml-2">User</span>
            </label>
            <label class="inline-flex items-center">
              <input 
                type="radio" 
                v-model="localNodeData.recipientType" 
                value="role" 
                class="form-radio" 
                @change="saveChanges"
              />
              <span class="ml-2">Role</span>
            </label>
            <label class="inline-flex items-center">
              <input 
                type="radio" 
                v-model="localNodeData.recipientType" 
                value="group" 
                class="form-radio" 
                @change="saveChanges"
              />
              <span class="ml-2">Group</span>
            </label>
            <label class="inline-flex items-center">
              <input 
                type="radio" 
                v-model="localNodeData.recipientType" 
                value="variable" 
                class="form-radio" 
                @change="saveChanges"
              />
              <span class="ml-2">Process Variable</span>
            </label>
            <label class="inline-flex items-center">
              <input 
                type="radio" 
                v-model="localNodeData.recipientType" 
                value="email" 
                class="form-radio" 
                @change="saveChanges"
              />
              <span class="ml-2">Email Address</span>
            </label>
          </div>
        </div>
        
        <!-- Dynamic Recipient Input based on type -->
        <div>
          <div v-if="localNodeData.recipientType === 'user'">
            <label class="block text-sm font-medium text-gray-700 mb-1">Select User</label>
            <select 
              v-model="localNodeData.recipientUser" 
              class="w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
              @change="saveChanges"
            >
              <option value="">Select a user</option>
              <option v-for="user in mockUsers" :key="user.id" :value="user.id">
                {{ user.name }}
              </option>
            </select>
          </div>
          
          <div v-if="localNodeData.recipientType === 'role'">
            <label class="block text-sm font-medium text-gray-700 mb-1">Select Role</label>
            <select 
              v-model="localNodeData.recipientRole" 
              class="w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
              @change="saveChanges"
            >
              <option value="">Select a role</option>
              <option v-for="role in mockRoles" :key="role.id" :value="role.id">
                {{ role.name }}
              </option>
            </select>
          </div>
          
          <div v-if="localNodeData.recipientType === 'group'">
            <label class="block text-sm font-medium text-gray-700 mb-1">Select Group</label>
            <select 
              v-model="localNodeData.recipientGroup" 
              class="w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
              @change="saveChanges"
            >
              <option value="">Select a group</option>
              <option v-for="group in mockGroups" :key="group.id" :value="group.id">
                {{ group.name }}
              </option>
            </select>
          </div>
          
          <div v-if="localNodeData.recipientType === 'variable'">
            <label class="block text-sm font-medium text-gray-700 mb-1">Select Variable</label>
            <select 
              v-model="localNodeData.recipientVariable" 
              class="w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
              @change="saveChanges"
            >
              <option value="">Select a variable</option>
              <option v-for="variable in availableVariables" :key="variable.name" :value="variable.name">
                {{ variable.label || variable.name }}
              </option>
            </select>
            <p class="mt-1 text-xs text-gray-500">
              Variable should contain a user ID, role ID, or email address
            </p>
          </div>
          
          <div v-if="localNodeData.recipientType === 'email'">
            <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input 
              v-model="localNodeData.recipientEmail" 
              type="email"
              class="w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
              placeholder="Enter email address"
              @blur="saveChanges"
            />
          </div>
        </div>
      </div>
    </div>
    
    <!-- Step 4: Notification Content -->
    <div class="mb-6 bg-gray-50 p-4 rounded-md border border-gray-200">
      <div class="flex items-center mb-3">
        <div class="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
          <span class="text-xs font-semibold text-blue-600">4</span>
        </div>
        <h4 class="font-medium">Notification Content</h4>
      </div>
      
      <div class="grid grid-cols-1 gap-4">
        <!-- Subject -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Subject</label>
          <input 
            v-model="localNodeData.subject" 
            type="text"
            class="w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
            placeholder="Enter notification subject"
            @blur="saveChanges"
          />
          <p class="mt-1 text-xs text-gray-500">
            You can use variable placeholders with {variableName} syntax
          </p>
        </div>
        
        <!-- Message Body -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Message</label>
          <!-- Message Format Selector -->
          <div class="flex items-center mb-2 space-x-4">
            <label class="inline-flex items-center">
              <input 
                type="radio" 
                v-model="localNodeData.messageFormat" 
                value="text" 
                class="form-radio" 
                @change="saveChanges"
              />
              <span class="ml-2 text-sm">Plain Text</span>
            </label>
            <label class="inline-flex items-center">
              <input 
                type="radio" 
                v-model="localNodeData.messageFormat" 
                value="richtext" 
                class="form-radio" 
                @change="saveChanges"
              />
              <span class="ml-2 text-sm">Rich Text</span>
            </label>
            <label class="inline-flex items-center">
              <input 
                type="radio" 
                v-model="localNodeData.messageFormat" 
                value="html" 
                class="form-radio" 
                @change="saveChanges"
              />
              <span class="ml-2 text-sm">HTML</span>
            </label>
          </div>
          
          <!-- Plain Text Editor -->
          <textarea 
            v-if="localNodeData.messageFormat === 'text'"
            v-model="localNodeData.message" 
            class="w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
            placeholder="Enter notification message"
            rows="4"
            @blur="saveChanges"
          ></textarea>
          
          <!-- Rich Text Editor -->
          <div v-if="localNodeData.messageFormat === 'richtext'" class="border rounded-md">
            <ClientOnly>
              <QuillEditor
                v-model:content="localNodeData.richTextMessage"
                contentType="html"
                theme="snow"
                toolbar="essential"
                @update:content="saveChanges"
                placeholder="Enter rich text notification message"
              />
            </ClientOnly>
            <div class="bg-gray-50 border-t p-2">
              <p class="text-xs text-gray-500">
                You can use variable placeholders with {variableName} syntax in your content
              </p>
            </div>
          </div>
          
          <!-- Rich Text Preview -->
          <div v-if="localNodeData.messageFormat === 'richtext'" class="mt-2">
            <div class="flex justify-between items-center mb-2">
              <label class="block text-sm font-medium text-gray-700">Rich Text Preview</label>
              <button 
                @click="showRichTextPreview = !showRichTextPreview"
                class="text-xs text-blue-600 hover:text-blue-800"
              >
                {{ showRichTextPreview ? 'Hide Preview' : 'Show Preview' }}
              </button>
            </div>
            <div v-if="showRichTextPreview" class="border rounded-md p-3 bg-white html-preview">
              <div v-html="localNodeData.richTextMessage"></div>
            </div>
          </div>
          
          <!-- HTML Editor -->
          <div v-if="localNodeData.messageFormat === 'html'" class="border rounded-md">
            <div class="bg-gray-50 border-b p-2 flex justify-between items-center">
              <span class="text-sm font-medium">HTML Editor</span>
              <div class="flex space-x-2">
                <select 
                  v-model="htmlTemplate" 
                  class="text-xs p-1 border rounded"
                  @change="applyHtmlTemplate"
                >
                  <option value="">Select Template</option>
                  <option value="basic">Basic Template</option>
                  <option value="card">Card Template</option>
                  <option value="email">Email Template</option>
                </select>
                <button 
                  class="text-xs px-2 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded hover:bg-blue-100"
                  @click="showHtmlHelpers = !showHtmlHelpers"
                >
                  {{ showHtmlHelpers ? 'Hide Helpers' : 'Show Helpers' }}
                </button>
              </div>
            </div>
            
            <!-- HTML Helpers -->
            <div v-if="showHtmlHelpers" class="bg-blue-50 p-2 border-b border-blue-200">
              <div class="text-xs font-medium mb-1 text-blue-700">Insert HTML Elements:</div>
              <div class="flex flex-wrap gap-1">
                <button 
                  v-for="(snippet, key) in htmlSnippets" 
                  :key="key"
                  @click="insertHtmlSnippet(snippet.code)"
                  class="text-xs px-2 py-1 bg-white border border-blue-200 rounded hover:bg-blue-100"
                  :title="snippet.description"
                >
                  {{ snippet.label }}
                </button>
              </div>
            </div>
            
            <ClientOnly>
              <rs-code-mirror 
                v-model="localNodeData.htmlMessage" 
                mode="html" 
                height="250px"
                @update:modelValue="saveChanges"
              />
            </ClientOnly>
          </div>
          
          <p class="mt-1 text-xs text-gray-500">
            You can use variable placeholders with {variableName} syntax
          </p>
        </div>
        
        <!-- HTML Preview -->
        <div v-if="localNodeData.messageFormat === 'html'" class="mt-2">
          <div class="flex justify-between items-center mb-2">
            <label class="block text-sm font-medium text-gray-700">HTML Preview</label>
            <button 
              @click="showHtmlPreview = !showHtmlPreview"
              class="text-xs text-blue-600 hover:text-blue-800"
            >
              {{ showHtmlPreview ? 'Hide Preview' : 'Show Preview' }}
            </button>
          </div>
          <div v-if="showHtmlPreview" class="border rounded-md p-3 bg-white html-preview">
            <div v-html="localNodeData.htmlMessage"></div>
          </div>
        </div>
        
        <!-- Variable Preview -->
        <div v-if="hasVariablePlaceholders" class="bg-white p-3 border rounded-md">
          <h5 class="font-medium text-sm mb-2">Variable Placeholders Used</h5>
          <div class="flex flex-wrap gap-2">
            <div 
              v-for="variable in usedVariables" 
              :key="variable"
              class="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md flex items-center"
            >
              <span>{{ variable }}</span>
              <span 
                v-if="!isValidVariable(variable)" 
                class="ml-1 text-red-500" 
                title="This variable is not defined in the process"
              >
                <Icon name="material-symbols:warning" class="text-xs" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Delivery Options -->
    <div class="mb-6 bg-gray-50 p-4 rounded-md border border-gray-200">
      <div class="flex items-center mb-3">
        <div class="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
          <span class="text-xs font-semibold text-blue-600">5</span>
        </div>
        <h4 class="font-medium">Delivery Options</h4>
      </div>
      
      <div class="grid grid-cols-1 gap-4">
        <div class="space-y-2">
          <label class="inline-flex items-center">
            <input 
              type="checkbox" 
              v-model="localNodeData.deliveryOptions.inApp" 
              class="form-checkbox" 
              @change="saveChanges"
            />
            <span class="ml-2">In-app notification</span>
          </label>
          <label class="inline-flex items-center">
            <input 
              type="checkbox" 
              v-model="localNodeData.deliveryOptions.email" 
              class="form-checkbox" 
              @change="saveChanges"
            />
            <span class="ml-2">Email notification</span>
          </label>
          <p v-if="localNodeData.messageFormat === 'html' || localNodeData.messageFormat === 'richtext'" class="mt-1 text-xs text-blue-600 bg-blue-50 p-2 rounded">
            <Icon name="material-symbols:info-outline" class="inline-block mr-1" />
            {{ localNodeData.messageFormat === 'html' ? 'HTML' : 'Rich Text' }} formatting is only supported for email notifications
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useVariableStore } from '~/stores/variableStore';

const props = defineProps({
  nodeData: {
    type: Object,
    required: true
  },
  availableVariables: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update']);

// Initialize local data with defaults
const localNodeData = ref({
  label: props.nodeData.label || 'Notification',
  description: props.nodeData.description || '',
  notificationType: props.nodeData.notificationType || 'info',
  recipientType: props.nodeData.recipientType || 'user',
  recipientUser: props.nodeData.recipientUser || '',
  recipientRole: props.nodeData.recipientRole || '',
  recipientGroup: props.nodeData.recipientGroup || '',
  recipientVariable: props.nodeData.recipientVariable || '',
  recipientEmail: props.nodeData.recipientEmail || '',
  subject: props.nodeData.subject || '',
  message: props.nodeData.message || '',
  priority: props.nodeData.priority || 'medium',
  deliveryOptions: props.nodeData.deliveryOptions || {
    inApp: true,
    email: false,
    sms: false
  },
  expiration: props.nodeData.expiration || {
    enabled: false,
    value: 24,
    unit: 'hours'
  },
  messageFormat: props.nodeData.messageFormat || 'text',
  htmlMessage: props.nodeData.htmlMessage || '',
  richTextMessage: props.nodeData.richTextMessage || ''
});

// Preview state
const showHtmlPreview = ref(false);
const htmlTemplate = ref('');
const showHtmlHelpers = ref(false);
const showRichTextPreview = ref(false);

// HTML Templates
const templates = {
  basic: `<div style="font-family: Arial, sans-serif; padding: 15px;">
  <h2 style="color: #3b82f6;">Notification Title</h2>
  <p>Hello {userName},</p>
  <p>This is a basic notification message.</p>
  <p>Thank you,<br>Process Maker</p>
</div>`,
  card: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
  <div style="background-color: #3b82f6; color: white; padding: 15px;">
    <h2 style="margin: 0;">Important Notification</h2>
  </div>
  <div style="padding: 20px;">
    <p>Hello {userName},</p>
    <p>This is an important notification regarding {processName}.</p>
    <p>Please review the details below:</p>
    <ul>
      <li>Item 1: {item1}</li>
      <li>Item 2: {item2}</li>
    </ul>
    <div style="margin-top: 20px; padding: 10px; background-color: #f3f4f6; border-radius: 4px;">
      <p style="margin: 0; font-size: 14px;">Reference ID: {referenceId}</p>
    </div>
  </div>
  <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 14px;">
    <p>This is an automated notification from Process Maker.</p>
  </div>
</div>`,
  email: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Process Notification</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
    <tr>
      <td style="background-color: #3b82f6; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Process Notification</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px;">
        <p>Hello {userName},</p>
        <p>You have a new notification regarding process <strong>{processName}</strong>.</p>
        <p>Status: <span style="color: #10b981; font-weight: bold;">{status}</span></p>
        <p>Please take appropriate action by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="{actionUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">View Details</a>
        </div>
        <p>If you have any questions, please contact the system administrator.</p>
        <p>Thank you,<br>Process Maker Team</p>
      </td>
    </tr>
    <tr>
      <td style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 14px; color: #6b7280;">
        <p>This is an automated email. Please do not reply to this message.</p>
        <p>© 2023 Process Maker. All rights reserved.</p>
      </td>
    </tr>
  </table>
</body>
</html>`
};

// Apply HTML template
const applyHtmlTemplate = () => {
  if (htmlTemplate.value && templates[htmlTemplate.value]) {
    localNodeData.value.htmlMessage = templates[htmlTemplate.value];
    saveChanges();
    // Reset the select after applying
    htmlTemplate.value = '';
  }
};

// Watch for changes to nodeData prop
watch(() => props.nodeData, (value) => {
  // Merge incoming props with defaults for any missing values
  localNodeData.value = {
    label: value.label || localNodeData.value.label,
    description: value.description || localNodeData.value.description,
    notificationType: value.notificationType || localNodeData.value.notificationType,
    recipientType: value.recipientType || localNodeData.value.recipientType,
    recipientUser: value.recipientUser || localNodeData.value.recipientUser,
    recipientRole: value.recipientRole || localNodeData.value.recipientRole,
    recipientGroup: value.recipientGroup || localNodeData.value.recipientGroup,
    recipientVariable: value.recipientVariable || localNodeData.value.recipientVariable,
    recipientEmail: value.recipientEmail || localNodeData.value.recipientEmail,
    subject: value.subject || localNodeData.value.subject,
    message: value.message || localNodeData.value.message,
    priority: value.priority || localNodeData.value.priority,
    deliveryOptions: value.deliveryOptions || localNodeData.value.deliveryOptions,
    expiration: value.expiration || localNodeData.value.expiration,
    messageFormat: value.messageFormat || localNodeData.value.messageFormat,
    htmlMessage: value.htmlMessage || localNodeData.value.htmlMessage,
    richTextMessage: value.richTextMessage || localNodeData.value.richTextMessage
  };
}, { deep: true });

// Mock data for demonstration
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

const mockGroups = [
  { id: 'group1', name: 'Marketing Team' },
  { id: 'group2', name: 'Finance Team' },
  { id: 'group3', name: 'Operations Team' }
];

// Notification types
const notificationTypes = [
  { 
    value: 'info', 
    label: 'Information', 
    icon: 'material-symbols:info-outline', 
    color: 'blue',
    description: 'General information notifications' 
  },
  { 
    value: 'success', 
    label: 'Success', 
    icon: 'material-symbols:check-circle-outline', 
    color: 'green',
    description: 'Success or completion notifications' 
  },
  { 
    value: 'warning', 
    label: 'Warning', 
    icon: 'material-symbols:warning-outline', 
    color: 'yellow',
    description: 'Warning notifications requiring attention' 
  },
  { 
    value: 'error', 
    label: 'Error', 
    icon: 'material-symbols:error-outline', 
    color: 'red',
    description: 'Error notifications requiring action' 
  },
  { 
    value: 'reminder', 
    label: 'Reminder', 
    icon: 'material-symbols:notifications-active', 
    color: 'purple',
    description: 'Reminders about pending tasks or deadlines' 
  },
  { 
    value: 'status', 
    label: 'Status Update', 
    icon: 'material-symbols:update', 
    color: 'indigo',
    description: 'Updates about process or task status changes' 
  }
];

// Priority options
const priorities = [
  { 
    value: 'low', 
    label: 'Low', 
    icon: 'material-symbols:arrow-downward', 
    color: 'gray' 
  },
  { 
    value: 'medium', 
    label: 'Medium', 
    icon: 'material-symbols:drag-handle', 
    color: 'blue' 
  },
  { 
    value: 'high', 
    label: 'High', 
    icon: 'material-symbols:arrow-upward', 
    color: 'red' 
  }
];

// Methods
const saveChanges = () => {
  emit('update', localNodeData.value);
};

const selectNotificationType = (type) => {
  localNodeData.value.notificationType = type;
  saveChanges();
};

// Extract variables from content
const extractVariables = (text) => {
  const regex = /{([^}]+)}/g;
  const matches = [];
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    matches.push(match[1]);
  }
  
  return [...new Set(matches)]; // Return unique values
};

// Check if a variable exists in available variables
const isValidVariable = (variableName) => {
  return props.availableVariables.some(v => v.name === variableName);
};

// Computed properties
const usedVariables = computed(() => {
  const subjectVars = extractVariables(localNodeData.value.subject || '');
  const messageVars = extractVariables(localNodeData.value.message || '');
  const htmlVars = extractVariables(localNodeData.value.htmlMessage || '');
  const richTextVars = extractVariables(localNodeData.value.richTextMessage || '');
  return [...new Set([...subjectVars, ...messageVars, ...htmlVars, ...richTextVars])];
});

const hasVariablePlaceholders = computed(() => {
  return usedVariables.value.length > 0;
});

// HTML Helpers
const htmlSnippets = [
  { label: 'h1', code: '<h1>Heading 1</h1>', description: 'Adds a level 1 heading' },
  { label: 'h2', code: '<h2>Heading 2</h2>', description: 'Adds a level 2 heading' },
  { label: 'h3', code: '<h3>Heading 3</h3>', description: 'Adds a level 3 heading' },
  { label: 'p', code: '<p>Paragraph</p>', description: 'Adds a paragraph' },
  { label: 'a', code: '<a href="#">Link</a>', description: 'Adds a clickable link' },
  { label: 'img', code: '<img src="https://via.placeholder.com/150" alt="Placeholder">', description: 'Adds an image' },
  { label: 'ul', code: '<ul><li>Item 1</li><li>Item 2</li></ul>', description: 'Adds an unordered list' },
  { label: 'ol', code: '<ol><li>Item 1</li><li>Item 2</li></ol>', description: 'Adds an ordered list' },
  { label: 'div', code: '<div>Divider</div>', description: 'Adds a divider' },
  { label: 'span', code: '<span>Highlight</span>', description: 'Adds a highlighted text' }
];

const insertHtmlSnippet = (code) => {
  // Simply append the snippet to the end of the current content
  localNodeData.value.htmlMessage = (localNodeData.value.htmlMessage || '') + '\n' + code;
  saveChanges();
};

// Watch for message format changes to enable email delivery for HTML and Rich Text
watch(() => localNodeData.value.messageFormat, (newFormat) => {
  if ((newFormat === 'html' || newFormat === 'richtext') && !localNodeData.value.deliveryOptions.email) {
    // Automatically enable email delivery when HTML or Rich Text format is selected
    localNodeData.value.deliveryOptions.email = true;
    saveChanges();
  }
});
</script>

<style scoped>
.notification-type-card {
  min-width: 200px;
  flex: 1 0 200px;
  max-width: 300px;
  height: 100px;
  display: flex;
  align-items: center;
}

/* HTML Editor Styles */
:deep(.cm-editor) {
  font-family: monospace;
  font-size: 14px;
}

:deep(.cm-content) {
  padding: 8px;
}

/* Preview Styles */
.html-preview {
  max-height: 300px;
  overflow: auto;
}
</style> 