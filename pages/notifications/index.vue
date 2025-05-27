<script setup>
import { ref, onMounted, computed } from 'vue';
import { useVariableStore } from '~/stores/variableStore';
import NotificationManager from '~/components/process-flow/notification/NotificationManager.vue';

// Define page meta
definePageMeta({
  title: "Notification Manager",
  description: "Manage notifications, templates, triggers, and user preferences",
  layout: "default",
  middleware: ["auth"],
  requiresAuth: true,
});

// Initialize the store
const variableStore = useVariableStore();

// Get available variables for usage in notifications
const availableVariables = computed(() => {
  const processVars = variableStore.getAllVariables.process.map(v => ({
    name: v.name || 'unnamed',
    label: v?.description
      ? `${v.description} (${v.name || 'unnamed'}, process)`
      : `${v.name || 'unnamed'} (process)` ,
    type: v.type || 'string',
    scope: 'process'
  }));
  const globalVars = variableStore.getAllVariables.global.map(v => ({
    name: v.name || 'unnamed',
    label: v?.description
      ? `${v.description} (${v.name || 'unnamed'}, global)`
      : `${v.name || 'unnamed'} (global)` ,
    type: v.type || 'string',
    scope: 'global'
  }));
  
  return [...processVars, ...globalVars];
});

// Current user ID
const userId = ref('current_user');

// Get notification preferences (in a real implementation, this would be fetched from the API)
onMounted(() => {
  // In a real implementation, fetch user data, notification templates, triggers, etc.
  console.log('Notification Manager loaded');
});
</script>

<template>
  <div>
    <div class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold text-gray-900">
          Notification Center
        </h1>
      </div>
    </div>
    
    <main>
      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <NotificationManager 
            :userId="userId"
            :availableVariables="availableVariables"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Additional styles if needed */
</style> 