<template>
  <div class="notification-queue">
    <div class="mb-4 flex justify-between items-center">
      <h3 class="text-lg font-medium text-gray-900">Notification Queue</h3>
      <div class="flex space-x-2">
        <RsButton @click="refreshQueue" variant="tertiary" size="sm">
          <Icon name="material-symbols:refresh" class="mr-1" />
          Refresh
        </RsButton>
        <RsButton @click="processQueue" variant="primary" size="sm" :disabled="queueItems.length === 0">
          <Icon name="material-symbols:play-arrow" class="mr-1" />
          Process Queue
        </RsButton>
      </div>
    </div>

    <!-- Queue Summary -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
      <div class="bg-blue-50 border border-blue-100 rounded-md p-3 flex flex-col items-center">
        <span class="text-blue-500 text-2xl font-semibold">{{ queueSummary.total }}</span>
        <span class="text-blue-700 text-sm">Total</span>
      </div>
      <div class="bg-yellow-50 border border-yellow-100 rounded-md p-3 flex flex-col items-center">
        <span class="text-yellow-500 text-2xl font-semibold">{{ queueSummary.pending }}</span>
        <span class="text-yellow-700 text-sm">Pending</span>
      </div>
      <div class="bg-green-50 border border-green-100 rounded-md p-3 flex flex-col items-center">
        <span class="text-green-500 text-2xl font-semibold">{{ queueSummary.sent }}</span>
        <span class="text-green-700 text-sm">Sent</span>
      </div>
      <div class="bg-red-50 border border-red-100 rounded-md p-3 flex flex-col items-center">
        <span class="text-red-500 text-2xl font-semibold">{{ queueSummary.failed }}</span>
        <span class="text-red-700 text-sm">Failed</span>
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
            <option value="pending">Pending</option>
            <option value="sent">Sent</option>
            <option value="failed">Failed</option>
            <option value="scheduled">Scheduled</option>
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

    <!-- Queue Items Table -->
    <div class="overflow-x-auto">
      <table class="min-w-full bg-white border border-gray-200 rounded-md">
        <thead>
          <tr class="bg-gray-50">
            <th class="py-2 px-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID
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
              Created
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
          <tr v-if="filteredQueueItems.length === 0">
            <td colspan="7" class="py-4 px-3 text-center text-sm text-gray-500">
              No notifications found matching your filters.
            </td>
          </tr>
          <tr v-for="item in filteredQueueItems" :key="item.id" class="hover:bg-gray-50">
            <td class="py-2 px-3 text-sm">
              <span class="font-mono text-xs">{{ item.id.substring(0, 8) }}</span>
            </td>
            <td class="py-2 px-3 text-sm">
              <div class="flex items-center">
                <div :class="`text-${getTypeColor(item.type)}-500 mr-2`">
                  <Icon :name="getTypeIcon(item.type)" />
                </div>
                <span class="capitalize">{{ item.type }}</span>
              </div>
            </td>
            <td class="py-2 px-3 text-sm">
              {{ item.recipient }}
            </td>
            <td class="py-2 px-3 text-sm">
              {{ item.subject }}
            </td>
            <td class="py-2 px-3 text-sm">
              {{ formatDate(item.createdAt) }}
            </td>
            <td class="py-2 px-3 text-sm">
              <span 
                :class="getStatusClass(item.status)" 
                class="px-2 py-1 text-xs font-medium rounded-full"
              >
                {{ item.status }}
              </span>
            </td>
            <td class="py-2 px-3 text-sm">
              <div class="flex space-x-2">
                <button 
                  @click="viewItem(item)" 
                  class="text-blue-600 hover:text-blue-800"
                  title="View Details"
                >
                  <Icon name="material-symbols:visibility-outline" />
                </button>
                <button 
                  v-if="item.status === 'pending' || item.status === 'failed'"
                  @click="resendItem(item)" 
                  class="text-green-600 hover:text-green-800"
                  title="Resend"
                >
                  <Icon name="material-symbols:send" />
                </button>
                <button 
                  @click="deleteItem(item)" 
                  class="text-red-600 hover:text-red-800"
                  title="Delete"
                >
                  <Icon name="material-symbols:delete-outline" />
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
        Showing {{ paginationStart }} to {{ paginationEnd }} of {{ filteredQueueItems.length }} items
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

    <!-- View Item Modal -->
    <RsModal
      v-model="showViewModal"
      title="Notification Details"
      size="lg"
      position="center"
      :cancelCallback="closeViewModal"
    >
      <div class="p-4">
        <div v-if="selectedItem" class="space-y-4">
          <div class="flex justify-between items-start">
            <div>
              <h3 class="text-lg font-medium text-gray-900">{{ selectedItem.subject }}</h3>
              <p class="text-sm text-gray-500">{{ formatDate(selectedItem.createdAt) }}</p>
            </div>
            <span 
              :class="getStatusClass(selectedItem.status)" 
              class="px-2 py-1 text-xs font-medium rounded-full"
            >
              {{ selectedItem.status }}
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-1">Type</h4>
              <div class="flex items-center">
                <div :class="`text-${getTypeColor(selectedItem.type)}-500 mr-2`">
                  <Icon :name="getTypeIcon(selectedItem.type)" />
                </div>
                <span class="capitalize">{{ selectedItem.type }}</span>
              </div>
            </div>
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-1">Channels</h4>
              <div class="flex items-center space-x-2">
                <span v-for="channel in selectedItem.channels" :key="channel" 
                  class="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                  {{ channel }}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 class="text-sm font-medium text-gray-700 mb-1">Recipient</h4>
            <p>{{ selectedItem.recipient }}</p>
          </div>

          <div>
            <h4 class="text-sm font-medium text-gray-700 mb-1">Message</h4>
            <div class="bg-gray-50 p-3 rounded-md whitespace-pre-wrap">
              {{ selectedItem.message }}
            </div>
          </div>

          <div v-if="selectedItem.status === 'failed'">
            <h4 class="text-sm font-medium text-gray-700 mb-1">Error</h4>
            <div class="bg-red-50 p-3 rounded-md text-red-700 whitespace-pre-wrap">
              {{ selectedItem.error || 'Unknown error occurred' }}
            </div>
          </div>

          <div v-if="selectedItem.attempts > 0">
            <h4 class="text-sm font-medium text-gray-700 mb-1">Delivery Attempts</h4>
            <p>{{ selectedItem.attempts }} attempt(s)</p>
            <div v-if="selectedItem.lastAttempt" class="text-xs text-gray-500">
              Last attempt: {{ formatDate(selectedItem.lastAttempt) }}
            </div>
          </div>
        </div>
      </div>
    </RsModal>

    <!-- Delete Confirmation Modal -->
    <RsModal
      v-model="showDeleteModal"
      title="Delete Notification"
      size="md"
      position="center"
      :okCallback="confirmDeleteItem"
      okTitle="Delete"
      :cancelCallback="cancelDeleteItem"
    >
      <div class="p-4">
        <div class="flex items-start mb-4">
          <div class="mr-4 text-red-500 flex-shrink-0 mt-1">
            <Icon name="material-symbols:delete-outline" class="text-2xl" />
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-900">Delete Notification</h3>
            <p class="text-sm text-gray-500 mt-1">
              Are you sure you want to delete this notification from the queue? This action cannot be undone.
            </p>
          </div>
        </div>
        <div v-if="itemToDelete" class="bg-gray-50 p-3 rounded-md">
          <p class="font-medium">{{ itemToDelete.subject }}</p>
          <p class="text-sm text-gray-500">Status: {{ itemToDelete.status }}</p>
          <p class="text-sm text-gray-500">Recipient: {{ itemToDelete.recipient }}</p>
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

const emit = defineEmits(['update:modelValue', 'process-queue']);

// Queue data
const queueItems = ref(props.modelValue || []);
const showViewModal = ref(false);
const showDeleteModal = ref(false);
const selectedItem = ref(null);
const itemToDelete = ref(null);

// Filters
const filters = ref({
  status: 'all',
  type: 'all',
  search: ''
});

// Pagination
const itemsPerPage = 10;
const currentPage = ref(1);

// Watch for changes to modelValue prop
watch(() => props.modelValue, (value) => {
  queueItems.value = value || [];
}, { deep: true });

// Computed properties
const filteredQueueItems = computed(() => {
  let items = [...queueItems.value];
  
  // Apply status filter
  if (filters.value.status !== 'all') {
    items = items.filter(item => item.status === filters.value.status);
  }
  
  // Apply type filter
  if (filters.value.type !== 'all') {
    items = items.filter(item => item.type === filters.value.type);
  }
  
  // Apply search filter
  if (filters.value.search) {
    const searchTerm = filters.value.search.toLowerCase();
    items = items.filter(item => 
      item.subject.toLowerCase().includes(searchTerm) ||
      item.recipient.toLowerCase().includes(searchTerm) ||
      item.message.toLowerCase().includes(searchTerm)
    );
  }
  
  return items;
});

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredQueueItems.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredQueueItems.value.length / itemsPerPage) || 1;
});

const paginationStart = computed(() => {
  if (filteredQueueItems.value.length === 0) return 0;
  return (currentPage.value - 1) * itemsPerPage + 1;
});

const paginationEnd = computed(() => {
  if (filteredQueueItems.value.length === 0) return 0;
  return Math.min(currentPage.value * itemsPerPage, filteredQueueItems.value.length);
});

const queueSummary = computed(() => {
  const total = queueItems.value.length;
  const pending = queueItems.value.filter(item => item.status === 'pending').length;
  const sent = queueItems.value.filter(item => item.status === 'sent').length;
  const failed = queueItems.value.filter(item => item.status === 'failed').length;
  
  return { total, pending, sent, failed };
});

// Methods
const refreshQueue = () => {
  // In a real implementation, this would fetch updated queue data from the server
  // For this demo, we'll just emit an event that the parent can handle
  emit('refresh-queue');
};

const processQueue = () => {
  // In a real implementation, this would trigger queue processing on the server
  // For this demo, we'll just emit an event that the parent can handle
  emit('process-queue');
};

const resetFilters = () => {
  filters.value = {
    status: 'all',
    type: 'all',
    search: ''
  };
  currentPage.value = 1;
};

const viewItem = (item) => {
  selectedItem.value = item;
  showViewModal.value = true;
};

const closeViewModal = () => {
  showViewModal.value = false;
  selectedItem.value = null;
};

const resendItem = (item) => {
  // In a real implementation, this would trigger a re-send on the server
  // For this demo, we'll just update the item status
  const index = queueItems.value.findIndex(i => i.id === item.id);
  if (index !== -1) {
    const updatedItem = { ...queueItems.value[index] };
    updatedItem.status = 'pending';
    updatedItem.attempts = (updatedItem.attempts || 0) + 1;
    updatedItem.lastAttempt = new Date().toISOString();
    queueItems.value[index] = updatedItem;
    
    emit('update:modelValue', queueItems.value);
  }
};

const deleteItem = (item) => {
  itemToDelete.value = item;
  showDeleteModal.value = true;
};

const confirmDeleteItem = () => {
  if (itemToDelete.value) {
    queueItems.value = queueItems.value.filter(item => item.id !== itemToDelete.value.id);
    emit('update:modelValue', queueItems.value);
    itemToDelete.value = null;
    showDeleteModal.value = false;
  }
};

const cancelDeleteItem = () => {
  itemToDelete.value = null;
  showDeleteModal.value = false;
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
    pending: 'bg-yellow-100 text-yellow-800',
    sent: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    scheduled: 'bg-blue-100 text-blue-800'
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};
</script>

<style scoped>
.notification-queue {
  @apply bg-white rounded-md;
}
</style> 