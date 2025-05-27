<template>
  <div class="user-preferences">
    <div class="mb-4 flex justify-between items-center">
      <h3 class="text-lg font-medium text-gray-900">Notification Preferences</h3>
      <div class="flex space-x-2">
        <RsButton @click="savePreferences" variant="primary" size="sm">
          <Icon name="material-symbols:save" class="mr-1" />
          Save Preferences
        </RsButton>
      </div>
    </div>

    <!-- General Preferences -->
    <div class="bg-white border border-gray-200 rounded-md mb-4">
      <div class="border-b border-gray-200 px-4 py-3 bg-gray-50">
        <h4 class="font-medium text-gray-700">General Preferences</h4>
      </div>
      <div class="p-4 space-y-4">
        <div>
          <label class="flex items-center">
            <input 
              type="checkbox" 
              v-model="preferences.enabled" 
              class="form-checkbox h-4 w-4 text-blue-600"
            />
            <span class="ml-2">Enable all notifications</span>
          </label>
          <p class="mt-1 text-xs text-gray-500 ml-6">
            When disabled, you will not receive any notifications regardless of other settings
          </p>
        </div>

        <div v-if="preferences.enabled">
          <h5 class="text-sm font-medium text-gray-700 mb-2">Default Delivery Methods</h5>
          <div class="space-y-2">
            <label class="flex items-center">
              <input 
                type="checkbox" 
                v-model="preferences.channels.inApp" 
                class="form-checkbox h-4 w-4 text-blue-600"
              />
              <span class="ml-2">In-app notifications</span>
            </label>
            <label class="flex items-center">
              <input 
                type="checkbox" 
                v-model="preferences.channels.email" 
                class="form-checkbox h-4 w-4 text-blue-600"
              />
              <span class="ml-2">Email notifications</span>
            </label>
          </div>
        </div>

        <div v-if="preferences.enabled && preferences.channels.email">
          <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <input
            v-model="preferences.email"
            type="email"
            class="w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
            placeholder="your.email@example.com"
          />
        </div>

        <div v-if="preferences.enabled">
          <h5 class="text-sm font-medium text-gray-700 mb-2">Notification Frequency</h5>
          <div class="space-y-2">
            <label class="flex items-center">
              <input 
                type="radio" 
                v-model="preferences.frequency" 
                value="instant" 
                class="form-radio h-4 w-4 text-blue-600"
              />
              <span class="ml-2">Instant (receive notifications immediately)</span>
            </label>
            <label class="flex items-center">
              <input 
                type="radio" 
                v-model="preferences.frequency" 
                value="digest" 
                class="form-radio h-4 w-4 text-blue-600"
              />
              <span class="ml-2">Digest (receive a daily summary)</span>
            </label>
          </div>
        </div>

        <div v-if="preferences.enabled && preferences.frequency === 'digest'">
          <label class="block text-sm font-medium text-gray-700 mb-1">Digest Time</label>
          <select
            v-model="preferences.digestTime"
            class="w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
          >
            <option value="08:00">Morning (8:00 AM)</option>
            <option value="12:00">Noon (12:00 PM)</option>
            <option value="17:00">Evening (5:00 PM)</option>
          </select>
        </div>

        <div v-if="preferences.enabled">
          <h5 class="text-sm font-medium text-gray-700 mb-2">Do Not Disturb</h5>
          <label class="flex items-center mb-2">
            <input 
              type="checkbox" 
              v-model="preferences.dnd.enabled" 
              class="form-checkbox h-4 w-4 text-blue-600"
            />
            <span class="ml-2">Enable Do Not Disturb hours</span>
          </label>
          
          <div v-if="preferences.dnd.enabled" class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input
                v-model="preferences.dnd.startTime"
                type="time"
                class="w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input
                v-model="preferences.dnd.endTime"
                type="time"
                class="w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Notification Type Preferences -->
    <div class="bg-white border border-gray-200 rounded-md">
      <div class="border-b border-gray-200 px-4 py-3 bg-gray-50">
        <h4 class="font-medium text-gray-700">Notification Type Preferences</h4>
      </div>
      <div class="p-4">
        <p class="text-sm text-gray-500 mb-4">
          Customize how you receive different types of notifications.
        </p>

        <div v-if="notificationTypes.length === 0" class="text-center py-4 bg-gray-50 rounded-md">
          <p class="text-gray-500">No notification types available to configure.</p>
        </div>

        <div v-else class="space-y-4">
          <div v-for="type in notificationTypes" :key="type.id" class="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
            <div class="flex items-start justify-between mb-2">
              <div class="flex items-center">
                <div :class="`text-${type.color}-500 mr-2`">
                  <Icon :name="type.icon" class="text-xl" />
                </div>
                <h5 class="font-medium">{{ type.name }}</h5>
              </div>
              <label class="inline-flex items-center">
                <input 
                  type="checkbox" 
                  v-model="typePreferences[type.id].enabled" 
                  class="form-checkbox h-4 w-4 text-blue-600"
                  :disabled="!preferences.enabled"
                />
                <span class="ml-2 text-sm">Enabled</span>
              </label>
            </div>

            <p class="text-sm text-gray-500 mb-3">{{ type.description }}</p>

            <div v-if="typePreferences[type.id].enabled && preferences.enabled" class="bg-gray-50 p-3 rounded-md">
              <h6 class="text-sm font-medium mb-2">Delivery Methods</h6>
              <div class="space-y-1">
                <label class="flex items-center">
                  <input 
                    type="checkbox" 
                    v-model="typePreferences[type.id].channels.inApp" 
                    class="form-checkbox h-4 w-4 text-blue-600"
                    :disabled="!preferences.channels.inApp"
                  />
                  <span class="ml-2 text-sm" :class="{'text-gray-400': !preferences.channels.inApp}">
                    In-app notifications
                  </span>
                </label>
                <label class="flex items-center">
                  <input 
                    type="checkbox" 
                    v-model="typePreferences[type.id].channels.email" 
                    class="form-checkbox h-4 w-4 text-blue-600"
                    :disabled="!preferences.channels.email"
                  />
                  <span class="ml-2 text-sm" :class="{'text-gray-400': !preferences.channels.email}">
                    Email notifications
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { Icon } from '#components';

const props = defineProps({
  userId: {
    type: String,
    default: ''
  },
  modelValue: {
    type: Object,
    default: () => ({})
  },
  notificationTypes: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:modelValue', 'save']);

// Default preferences
const defaultPreferences = {
  enabled: true,
  channels: {
    inApp: true,
    email: false,
    sms: false
  },
  email: '',
  phoneNumber: '',
  frequency: 'instant',
  digestTime: '08:00',
  dnd: {
    enabled: false,
    startTime: '22:00',
    endTime: '08:00'
  }
};

// User preferences
const preferences = ref({ ...defaultPreferences });

// Type-specific preferences
const typePreferences = ref({});

// Initialize preferences from props
watch(() => props.modelValue, (value) => {
  if (value && Object.keys(value).length > 0) {
    preferences.value = { 
      ...defaultPreferences,
      ...value
    };
  } else {
    preferences.value = { ...defaultPreferences };
  }
}, { immediate: true, deep: true });

// Initialize type preferences
onMounted(() => {
  initializeTypePreferences();
});

watch(() => props.notificationTypes, () => {
  initializeTypePreferences();
}, { deep: true });

const initializeTypePreferences = () => {
  // Create default preferences for each notification type
  props.notificationTypes.forEach(type => {
    // If we already have preferences for this type, keep them
    if (!typePreferences.value[type.id]) {
      typePreferences.value[type.id] = {
        enabled: true,
        channels: {
          inApp: true,
          email: false,
          sms: false
        }
      };
    }
    
    // If we have saved preferences in the modelValue, use those
    if (props.modelValue && props.modelValue.typePreferences && props.modelValue.typePreferences[type.id]) {
      typePreferences.value[type.id] = {
        ...typePreferences.value[type.id],
        ...props.modelValue.typePreferences[type.id]
      };
    }
  });
};

const savePreferences = () => {
  // Combine general preferences with type-specific preferences
  const combinedPreferences = {
    ...preferences.value,
    typePreferences: typePreferences.value
  };
  
  // Update model value
  emit('update:modelValue', combinedPreferences);
  
  // Emit save event
  emit('save', combinedPreferences);
};
</script>

<style scoped>
.user-preferences {
  @apply bg-white rounded-md;
}
</style> 