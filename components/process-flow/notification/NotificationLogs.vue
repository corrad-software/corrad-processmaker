<template>
  <div class="notification-logs">
    <div class="mb-4 flex justify-between items-center">
      <h3 class="text-lg font-medium text-gray-900">Notification Logs</h3>
      <div class="flex space-x-2">
        <RsButton @click="refreshLogs" variant="tertiary" size="sm">
          <Icon name="material-symbols:refresh" class="mr-1" />
          Refresh
        </RsButton>
        <RsButton @click="exportLogs" variant="secondary" size="sm" :disabled="logs.length === 0">
          <Icon name="material-symbols:download" class="mr-1" />
          Export
        </RsButton>
      </div>
    </div>

    <!-- Filter Controls -->
    <div class="bg-gray-50 border border-gray-200 rounded-md p-3 mb-4">
      <div class="flex flex-wrap gap-3">
        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            v-model="filters.status"
            class="w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
          >
            <option value="all">All</option>
            <option value="delivered">Delivered</option>
            <option value="read">Read</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select
            v-model="filters.type"
            class="w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
          >
            <option value="all">All</option>
            <option value="info">Information</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
        </div>
        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">Channel</label>
          <select
            v-model="filters.channel"
            class="w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
          >
            <option value="all">All Channels</option>
            <option value="in-app">In-App</option>
            <option value="email">Email</option>
            <option value="sms">SMS</option>
          </select>
        </div>
        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
          <div class="flex space-x-2">
            <input
              v-model="filters.dateFrom"
              type="date"
              class="w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
            />
            <input
              v-model="filters.dateTo"
              type="date"
              class="w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
            />
          </div>
        </div>
        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            v-model="filters.search"
            type="text"
            class="w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
            placeholder="Search by recipient or subject..."
          />
        </div>
        <div class="flex items-end">
          <RsButton @click="resetFilters" variant="tertiary" size="sm">
            Reset
          </RsButton>
        </div>
      </div>
    </div>

    <!-- Log Items Table -->
    <div class="overflow-x-auto">
      <table class="min-w-full bg-white border border-gray-200 rounded-md">
        <thead>
          <tr class="bg-gray-50">
            <th class="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID
            </th>
            <th class="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Timestamp
            </th>
            <th class="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th class="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Recipient
            </th>
            <th class="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Subject
            </th>
            <th class="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Channel
            </th>
            <th class="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th class="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-if="filteredLogs.length === 0">
            <td colspan="8" class="py-4 px-3 text-center text-sm text-gray-500">
              No notification logs found matching your filters.
            </td>
          </tr>
          <tr v-for="log in paginatedLogs" :key="log.id" class="hover:bg-gray-50">
            <td class="py-2 px-3 text-sm">
              <span class="font-mono text-xs">{{ log.id.substring(0, 8) }}</span>
            </td>
            <td class="py-2 px-3 text-sm">
              {{ formatDate(log.timestamp) }}
            </td>
            <td class="py-2 px-3 text-sm">
              <div class="flex items-center">
                <div :class="`text-${getTypeColor(log.type)}-500 mr-2`">
                  <Icon :name="getTypeIcon(log.type)" />
                </div>
                <span class="capitalize">{{ log.type }}</span>
              </div>
            </td>
            <td class="py-2 px-3 text-sm">
              {{ log.recipient }}
            </td>
            <td class="py-2 px-3 text-sm">
              {{ log.subject }}
            </td>
            <td class="py-2 px-3 text-sm">
              <span class="capitalize">{{ log.channel }}</span>
            </td>
            <td class="py-2 px-3 text-sm">
              <span 
                :class="getStatusClass(log.status)" 
                class="px-2 py-1 text-xs font-medium rounded-full"
              >
                {{ log.status }}
              </span>
            </td>
            <td class="py-2 px-3 text-sm">
              <div class="flex space-x-2">
                <button 
                  @click="viewLog(log)" 
                  class="text-blue-600 hover:text-blue-800"
                  title="View Details"
                >
                  <Icon name="material-symbols:visibility-outline" />
                </button>
                <button 
                  v-if="log.status === 'failed'"
                  @click="resendNotification(log)" 
                  class="text-green-600 hover:text-green-800"
                  title="Resend"
                >
                  <Icon name="material-symbols:refresh" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="mt-4 flex justify-between items-center">
      <div class="text-sm text-gray-500">
        Showing {{ paginationStart }} to {{ paginationEnd }} of {{ filteredLogs.length }} items
      </div>
      <div class="flex space-x-2">
        <RsButton 
          @click="prevPage" 
          variant="tertiary" 
          size="sm"
          :disabled="currentPage === 1"
        >
          Previous
        </RsButton>
        <RsButton 
          @click="nextPage" 
          variant="tertiary" 
          size="sm"
          :disabled="currentPage >= totalPages"
        >
          Next
        </RsButton>
      </div>
    </div>

    <!-- View Log Modal -->
    <RsModal
      v-model="showViewModal"
      title="Notification Log Details"
      size="lg"
      position="center"
      :cancelCallback="closeViewModal"
    >
      <div class="p-4">
        <div v-if="selectedLog" class="space-y-4">
          <div class="flex justify-between items-start">
            <div>
              <h3 class="text-lg font-medium text-gray-900">{{ selectedLog.subject }}</h3>
              <p class="text-sm text-gray-500">{{ formatDate(selectedLog.timestamp) }}</p>
            </div>
            <span 
              :class="getStatusClass(selectedLog.status)" 
              class="px-2 py-1 text-xs font-medium rounded-full"
            >
              {{ selectedLog.status }}
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-1">Type</h4>
              <div class="flex items-center">
                <div :class="`text-${getTypeColor(selectedLog.type)}-500 mr-2`">
                  <Icon :name="getTypeIcon(selectedLog.type)" />
                </div>
                <span class="capitalize">{{ selectedLog.type }}</span>
              </div>
            </div>
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-1">Channel</h4>
              <div class="flex items-center">
                <div class="text-blue-500 mr-2">
                  <Icon :name="getChannelIcon(selectedLog.channel)" />
                </div>
                <span class="capitalize">{{ selectedLog.channel }}</span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-1">Recipient</h4>
              <p>{{ selectedLog.recipient }}</p>
            </div>
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-1">Template</h4>
              <p>{{ selectedLog.templateName || 'Custom notification' }}</p>
            </div>
          </div>

          <div>
            <h4 class="text-sm font-medium text-gray-700 mb-1">Message</h4>
            <div class="bg-gray-50 p-3 rounded-md whitespace-pre-wrap">
              {{ selectedLog.message }}
            </div>
          </div>

          <div v-if="selectedLog.status === 'failed'">
            <h4 class="text-sm font-medium text-gray-700 mb-1">Error</h4>
            <div class="bg-red-50 p-3 rounded-md text-red-700 whitespace-pre-wrap">
              {{ selectedLog.error || 'Unknown error occurred' }}
            </div>
          </div>

          <div v-if="selectedLog.readAt">
            <h4 class="text-sm font-medium text-gray-700 mb-1">Read Information</h4>
            <div class="bg-green-50 p-3 rounded-md">
              <p class="text-green-700">Read at: {{ formatDate(selectedLog.readAt) }}</p>
            </div>
          </div>

          <div v-if="selectedLog.metadata">
            <h4 class="text-sm font-medium text-gray-700 mb-1">Additional Information</h4>
            <div class="bg-gray-50 p-3 rounded-md font-mono text-xs">
              <pre>{{ JSON.stringify(selectedLog.metadata, null, 2) }}</pre>
            </div>
          </div>
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
});

const emit = defineEmits(['update:modelValue', 'resend', 'export']);

// Log data
const logs = ref(props.modelValue || []);
const showViewModal = ref(false);
const selectedLog = ref(null);

// Filters
const filters = ref({
  status: 'all',
  type: 'all',
  channel: 'all',
  dateFrom: '',
  dateTo: '',
  search: ''
});

// Pagination
const itemsPerPage = 10;
const currentPage = ref(1);

// Watch for changes to modelValue prop
watch(() => props.modelValue, (value) => {
  logs.value = value || [];
}, { deep: true });

// Computed properties
const filteredLogs = computed(() => {
  let items = [...logs.value];
  
  // Apply status filter
  if (filters.value.status !== 'all') {
    items = items.filter(item => item.status === filters.value.status);
  }
  
  // Apply type filter
  if (filters.value.type !== 'all') {
    items = items.filter(item => item.type === filters.value.type);
  }
  
  // Apply channel filter
  if (filters.value.channel !== 'all') {
    items = items.filter(item => item.channel === filters.value.channel);
  }
  
  // Apply date range filter
  if (filters.value.dateFrom) {
    const fromDate = new Date(filters.value.dateFrom);
    fromDate.setHours(0, 0, 0, 0);
    items = items.filter(item => new Date(item.timestamp) >= fromDate);
  }
  
  if (filters.value.dateTo) {
    const toDate = new Date(filters.value.dateTo);
    toDate.setHours(23, 59, 59, 999);
    items = items.filter(item => new Date(item.timestamp) <= toDate);
  }
  
  // Apply search filter
  if (filters.value.search) {
    const searchTerm = filters.value.search.toLowerCase();
    items = items.filter(item => 
      (item.subject && item.subject.toLowerCase().includes(searchTerm)) ||
      (item.recipient && item.recipient.toLowerCase().includes(searchTerm)) ||
      (item.message && item.message.toLowerCase().includes(searchTerm))
    );
  }
  
  // Sort by timestamp (newest first)
  return items.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
});

const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredLogs.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredLogs.value.length / itemsPerPage) || 1;
});

const paginationStart = computed(() => {
  if (filteredLogs.value.length === 0) return 0;
  return (currentPage.value - 1) * itemsPerPage + 1;
});

const paginationEnd = computed(() => {
  if (filteredLogs.value.length === 0) return 0;
  return Math.min(currentPage.value * itemsPerPage, filteredLogs.value.length);
});

// Methods
const refreshLogs = () => {
  // In a real implementation, this would fetch updated log data from the server
  // For this demo, we'll just emit an event that the parent can handle
  emit('refresh-logs');
};

const exportLogs = () => {
  // In a real implementation, this would trigger an export on the server
  // For this demo, we'll just emit an event that the parent can handle
  emit('export', filteredLogs.value);
};

const resetFilters = () => {
  filters.value = {
    status: 'all',
    type: 'all',
    channel: 'all',
    dateFrom: '',
    dateTo: '',
    search: ''
  };
  currentPage.value = 1;
};

const viewLog = (log) => {
  selectedLog.value = log;
  showViewModal.value = true;
};

const closeViewModal = () => {
  showViewModal.value = false;
  selectedLog.value = null;
};

const resendNotification = (log) => {
  // Emit event for resending
  emit('resend', log);
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
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
    minute: '2-digit',
    second: '2-digit'
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

const getChannelIcon = (channel) => {
  const icons = {
    'in-app': 'material-symbols:notifications-outline',
    'email': 'material-symbols:mail-outline',
    'sms': 'material-symbols:smartphone-outline'
  };
  return icons[channel] || 'material-symbols:notifications-outline';
};

const getStatusClass = (status) => {
  const classes = {
    delivered: 'bg-green-100 text-green-800',
    read: 'bg-blue-100 text-blue-800',
    failed: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800'
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};
</script>

<style scoped>
.notification-logs {
  @apply bg-white rounded-md;
}
</style> 