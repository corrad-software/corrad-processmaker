<template>
  <div class="notification-templates">
    <div class="mb-4 flex justify-between items-center">
      <h3 class="text-lg font-medium text-gray-900">Notification Templates</h3>
      <RsButton @click="showNewTemplateModal = true" variant="primary" size="sm">
        <Icon name="material-symbols:add" class="mr-1" />
        New Template
      </RsButton>
    </div>

    <!-- Templates List -->
    <div v-if="templates.length > 0" class="space-y-3">
      <div v-for="template in templates" :key="template.id" 
        class="border rounded-md p-3 hover:bg-gray-50 cursor-pointer"
        @click="selectTemplate(template)">
        <div class="flex justify-between items-start">
          <div>
            <h4 class="font-medium text-gray-800">{{ template.name }}</h4>
            <p class="text-sm text-gray-500">{{ template.description }}</p>
          </div>
          <div :class="`text-${getTypeColor(template.type)}-500`">
            <Icon :name="getTypeIcon(template.type)" />
          </div>
        </div>
        <div class="flex items-center mt-2 text-xs text-gray-500 space-x-4">
          <span class="flex items-center">
            <Icon name="material-symbols:label-outline" class="mr-1" />
            {{ template.type }}
          </span>
          <span class="flex items-center">
            <Icon name="material-symbols:device-hub" class="mr-1" />
            {{ getChannelsText(template.channels) }}
          </span>
          <span class="flex items-center">
            <Icon name="material-symbols:flag" class="mr-1" />
            {{ template.priority }}
          </span>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-8 bg-gray-50 rounded-md">
      <Icon name="material-symbols:notifications-outline" class="text-4xl text-gray-400 mb-2" />
      <h4 class="text-gray-500 font-medium">No Templates</h4>
      <p class="text-sm text-gray-400 mb-4">Create notification templates to reuse across your processes</p>
      <RsButton @click="showNewTemplateModal = true" variant="primary" size="sm">
        Create Template
      </RsButton>
    </div>

    <!-- Template Modal -->
    <RsModal
      v-model="showTemplateModal"
      :title="editingTemplate ? 'Edit Template' : 'New Template'"
      size="lg"
      position="center"
      :okCallback="saveTemplate"
      okTitle="Save Template"
      :cancelCallback="closeTemplateModal"
    >
      <div class="p-4 space-y-4">
        <!-- Basic Info -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
            <input
              v-model="currentTemplate.name"
              type="text"
              class="w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
              placeholder="Enter template name"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Notification Type</label>
            <select
              v-model="currentTemplate.type"
              class="w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
            >
              <option value="info">Information</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            v-model="currentTemplate.description"
            rows="2"
            class="w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
            placeholder="Describe this template's purpose"
          ></textarea>
        </div>

        <!-- Channels -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Delivery Channels</label>
          <div class="space-y-2">
            <label class="inline-flex items-center mr-4">
              <input 
                type="checkbox" 
                v-model="currentTemplate.channels.inApp" 
                class="form-checkbox" 
              />
              <span class="ml-2">In-app notification</span>
            </label>
            <label class="inline-flex items-center mr-4">
              <input 
                type="checkbox" 
                v-model="currentTemplate.channels.email" 
                class="form-checkbox" 
              />
              <span class="ml-2">Email notification</span>
            </label>
          </div>
        </div>

        <!-- Content -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Subject</label>
          <input 
            v-model="currentTemplate.subject" 
            type="text"
            class="w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
            placeholder="Enter notification subject"
          />
          <p class="mt-1 text-xs text-gray-500">
            You can use variable placeholders with {variableName} syntax
          </p>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Message Body</label>
          <textarea 
            v-model="currentTemplate.message" 
            class="w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
            placeholder="Enter notification message"
            rows="4"
          ></textarea>
          <p class="mt-1 text-xs text-gray-500">
            You can use variable placeholders with {variableName} syntax
          </p>
        </div>
        
        <!-- Email HTML Content -->
        <div v-if="currentTemplate.channels.email">
          <div class="flex justify-between items-center mb-2">
            <label class="block text-sm font-medium text-gray-700">Email Format</label>
            <div class="flex items-center space-x-2">
              <label class="inline-flex items-center">
                <input 
                  type="radio" 
                  v-model="currentTemplate.emailFormat" 
                  value="plain" 
                  class="form-radio" 
                />
                <span class="ml-1 text-sm">Plain Text</span>
              </label>
              <label class="inline-flex items-center">
                <input 
                  type="radio" 
                  v-model="currentTemplate.emailFormat" 
                  value="html" 
                  class="form-radio" 
                />
                <span class="ml-1 text-sm">HTML</span>
              </label>
            </div>
          </div>
          
          <div v-if="currentTemplate.emailFormat === 'html'" class="border rounded-md">
            <div class="bg-gray-50 border-b p-2 flex justify-between items-center">
              <span class="text-sm font-medium">HTML Email Content</span>
              <div class="flex space-x-1">
                <button class="p-1 hover:bg-gray-200 rounded" title="Bold">
                  <Icon name="material-symbols:format-bold" />
                </button>
                <button class="p-1 hover:bg-gray-200 rounded" title="Italic">
                  <Icon name="material-symbols:format-italic" />
                </button>
                <button class="p-1 hover:bg-gray-200 rounded" title="Link">
                  <Icon name="material-symbols:link" />
                </button>
                <button class="p-1 hover:bg-gray-200 rounded" title="List">
                  <Icon name="material-symbols:format-list-bulleted" />
                </button>
              </div>
            </div>
            <textarea 
              v-model="currentTemplate.htmlEmailContent" 
              class="w-full p-2 border-0 focus:ring-0 text-sm font-mono"
              placeholder="<div>Enter HTML email content here</div>"
              rows="10"
            ></textarea>
            <div class="bg-gray-50 border-t p-2">
              <p class="text-xs text-gray-500">
                You can use variable placeholders with {variableName} syntax in your HTML
              </p>
            </div>
          </div>
          
          <!-- HTML Preview -->
          <div v-if="currentTemplate.emailFormat === 'html'" class="mt-2">
            <div class="flex justify-between items-center mb-2">
              <label class="block text-sm font-medium text-gray-700">Preview</label>
              <button 
                @click="showHtmlPreview = !showHtmlPreview"
                class="text-xs text-blue-600 hover:text-blue-800"
              >
                {{ showHtmlPreview ? 'Hide Preview' : 'Show Preview' }}
              </button>
            </div>
            <div v-if="showHtmlPreview" class="border rounded-md p-3 bg-white">
              <div v-html="currentTemplate.htmlEmailContent"></div>
            </div>
          </div>
        </div>

        <!-- Advanced Settings -->
        <div>
          <div class="flex justify-between items-center mb-2">
            <label class="block text-sm font-medium text-gray-700">Advanced Settings</label>
            <button 
              @click="showAdvancedSettings = !showAdvancedSettings"
              class="text-sm text-blue-600 hover:text-blue-800"
            >
              {{ showAdvancedSettings ? 'Hide' : 'Show' }}
            </button>
          </div>
          
          <div v-if="showAdvancedSettings" class="space-y-4 border-t pt-3 mt-2">
            <!-- Priority -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <div class="flex flex-wrap gap-3">
                <label 
                  v-for="priority in priorities" 
                  :key="priority.value"
                  class="inline-flex items-center cursor-pointer p-2 border rounded-md"
                  :class="currentTemplate.priority === priority.value ? `bg-${priority.color}-50 border-${priority.color}-300` : 'bg-white border-gray-200 hover:bg-gray-50'"
                >
                  <input 
                    type="radio" 
                    v-model="currentTemplate.priority" 
                    :value="priority.value" 
                    class="form-radio hidden" 
                  />
                  <span :class="`text-${priority.color}-500 mr-2`">
                    <Icon :name="priority.icon" class="text-lg" />
                  </span>
                  <span>{{ priority.label }}</span>
                </label>
              </div>
            </div>

            <!-- Language Support -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Language</label>
              <select
                v-model="currentTemplate.language"
                class="w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="zh">Chinese</option>
              </select>
            </div>

            <!-- Expiration Settings -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Expiration</label>
              <div class="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  v-model="currentTemplate.expiration.enabled" 
                  class="form-checkbox" 
                />
                <span>Expire after</span>
                <input 
                  v-model.number="currentTemplate.expiration.value" 
                  type="number"
                  min="1"
                  class="w-20 p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
                  :disabled="!currentTemplate.expiration.enabled"
                />
                <select 
                  v-model="currentTemplate.expiration.unit" 
                  class="p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
                  :disabled="!currentTemplate.expiration.enabled"
                >
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Variable Preview -->
        <div v-if="usedVariables.length > 0" class="bg-gray-50 p-3 border rounded-md">
          <h5 class="font-medium text-sm mb-2">Variable Placeholders Used</h5>
          <div class="flex flex-wrap gap-2">
            <div 
              v-for="variable in usedVariables" 
              :key="variable"
              class="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md"
            >
              {{ variable }}
            </div>
          </div>
        </div>
      </div>
    </RsModal>

    <!-- Delete Confirmation Modal -->
    <RsModal
      v-model="showDeleteModal"
      title="Delete Template"
      size="md"
      position="center"
      :okCallback="confirmDeleteTemplate"
      okTitle="Delete"
      :cancelCallback="cancelDeleteTemplate"
    >
      <div class="p-4">
        <div class="flex items-start mb-4">
          <div class="mr-4 text-red-500 flex-shrink-0 mt-1">
            <Icon name="material-symbols:delete-outline" class="text-2xl" />
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-900">Delete Template</h3>
            <p class="text-sm text-gray-500 mt-1">
              Are you sure you want to delete this template? This action cannot be undone.
            </p>
          </div>
        </div>
        <div class="bg-gray-50 p-3 rounded-md">
          <p class="font-medium">{{ templateToDelete?.name }}</p>
          <p class="text-sm text-gray-500">{{ templateToDelete?.description }}</p>
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
  }
});

const emit = defineEmits(['update:modelValue', 'select']);

// Template data
const templates = ref(props.modelValue || []);
const showTemplateModal = ref(false);
const showNewTemplateModal = ref(false);
const showDeleteModal = ref(false);
const showAdvancedSettings = ref(false);
const showHtmlPreview = ref(false);
const editingTemplate = ref(false);
const templateToDelete = ref(null);

// Current template being edited
const currentTemplate = ref({
  id: '',
  name: '',
  description: '',
  type: 'info',
  subject: '',
  message: '',
  emailFormat: 'plain',
  htmlEmailContent: '',
  channels: {
    inApp: true,
    email: false,
    sms: false
  },
  priority: 'medium',
  language: 'en',
  expiration: {
    enabled: false,
    value: 24,
    unit: 'hours'
  }
});

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

// Watch for changes to modelValue prop
watch(() => props.modelValue, (value) => {
  templates.value = value || [];
}, { deep: true });

// Methods
const selectTemplate = (template) => {
  editingTemplate.value = true;
  currentTemplate.value = JSON.parse(JSON.stringify(template));
  // Set default emailFormat if it doesn't exist
  if (!currentTemplate.value.emailFormat) {
    currentTemplate.value.emailFormat = 'plain';
  }
  // Set default htmlEmailContent if it doesn't exist
  if (!currentTemplate.value.htmlEmailContent) {
    currentTemplate.value.htmlEmailContent = '';
  }
  showTemplateModal.value = true;
  emit('select', template);
};

const createNewTemplate = () => {
  editingTemplate.value = false;
  currentTemplate.value = {
    id: `template_${Date.now()}`,
    name: '',
    description: '',
    type: 'info',
    subject: '',
    message: '',
    emailFormat: 'plain',
    htmlEmailContent: '',
    channels: {
      inApp: true,
      email: false,
      sms: false
    },
    priority: 'medium',
    language: 'en',
    expiration: {
      enabled: false,
      value: 24,
      unit: 'hours'
    }
  };
  showTemplateModal.value = true;
};

// Watch for new template modal trigger
watch(() => showNewTemplateModal.value, (value) => {
  if (value) {
    createNewTemplate();
    showNewTemplateModal.value = false;
  }
});

const saveTemplate = () => {
  if (!currentTemplate.value.name) {
    // Show error or validation
    return;
  }

  if (editingTemplate.value) {
    // Update existing template
    const index = templates.value.findIndex(t => t.id === currentTemplate.value.id);
    if (index !== -1) {
      templates.value[index] = JSON.parse(JSON.stringify(currentTemplate.value));
    }
  } else {
    // Add new template
    templates.value.push(JSON.parse(JSON.stringify(currentTemplate.value)));
  }

  emit('update:modelValue', templates.value);
  showTemplateModal.value = false;
};

const closeTemplateModal = () => {
  showTemplateModal.value = false;
};

const deleteTemplate = (template) => {
  templateToDelete.value = template;
  showDeleteModal.value = true;
};

const confirmDeleteTemplate = () => {
  if (templateToDelete.value) {
    templates.value = templates.value.filter(t => t.id !== templateToDelete.value.id);
    emit('update:modelValue', templates.value);
    templateToDelete.value = null;
    showDeleteModal.value = false;
  }
};

const cancelDeleteTemplate = () => {
  templateToDelete.value = null;
  showDeleteModal.value = false;
};

// Helper methods
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

const getChannelsText = (channels) => {
  const enabledChannels = [];
  if (channels.inApp) enabledChannels.push('In-app');
  if (channels.email) enabledChannels.push('Email');
  if (channels.sms) enabledChannels.push('SMS');
  
  return enabledChannels.length > 0 
    ? enabledChannels.join(', ') 
    : 'None';
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

// Computed properties
const usedVariables = computed(() => {
  const subjectVars = extractVariables(currentTemplate.value.subject || '');
  const messageVars = extractVariables(currentTemplate.value.message || '');
  const htmlVars = extractVariables(currentTemplate.value.htmlEmailContent || '');
  return [...new Set([...subjectVars, ...messageVars, ...htmlVars])];
});
</script>

<style scoped>
.notification-templates {
  @apply bg-white rounded-md;
}
</style> 