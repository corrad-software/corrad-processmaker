<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h2 class="text-xl font-semibold text-gray-800">Process History</h2>
          <p class="text-sm text-gray-600 mt-1">{{ processInfo.processName }}</p>
        </div>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
          <Icon name="heroicons:x-mark" class="h-6 w-6" />
        </button>
      </div>

      <!-- Content -->
      <div class="flex h-[calc(90vh-120px)]">
        <!-- Version List (Left Side) -->
        <div class="w-1/3 border-r border-gray-200 bg-gray-50">
          <div class="p-4 border-b border-gray-200">
            <h3 class="font-medium text-gray-900">Versions</h3>
            <p class="text-sm text-gray-600">{{ totalVersions }} total versions</p>
          </div>
          
          <div class="overflow-y-auto h-full pb-20">
            <!-- Current Version -->
            <div class="p-4 bg-blue-50 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <div>
                  <div class="flex items-center space-x-2">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Current
                    </span>
                    <span class="text-sm font-medium text-gray-900">Latest Version</span>
                  </div>
                  <p class="text-xs text-gray-600 mt-1">
                    {{ formatDate(currentVersion?.processModifiedDate || currentVersion?.processCreatedDate) }}
                  </p>
                  <p class="text-xs text-gray-500">
                    by {{ currentVersion?.creator?.userFullName || 'Unknown' }}
                  </p>
                </div>
                <button 
                  @click="previewCurrent" 
                  class="text-blue-600 hover:text-blue-800 text-sm"
                  :class="{ 'font-semibold': selectedVersion === 'current' }"
                >
                  Preview
                </button>
              </div>
            </div>

            <!-- Historical Versions -->
            <div 
              v-for="version in history" 
              :key="version.historyID"
              class="p-4 border-b border-gray-200 hover:bg-gray-100 cursor-pointer"
              :class="{ 'bg-blue-50': selectedVersion?.historyID === version.historyID }"
              @click="selectVersion(version)"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <div class="flex items-center space-x-2">
                    <span class="text-sm font-medium text-gray-900">
                      Version {{ version.versionNumber }}
                    </span>
                    <span v-if="version.changeDescription" class="text-xs text-gray-500">
                      - {{ version.changeDescription }}
                    </span>
                  </div>
                  <p class="text-xs text-gray-600 mt-1">
                    {{ formatDate(version.savedDate) }}
                  </p>
                  <p class="text-xs text-gray-500">
                    by {{ version.savedByUser?.userFullName || 'Unknown' }}
                  </p>
                </div>
                <div class="flex items-center space-x-2">
                  <button 
                    @click.stop="previewVersion(version)" 
                    class="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Preview
                  </button>
                  <button 
                    @click.stop="restoreVersion(version)"
                    class="text-green-600 hover:text-green-800 text-sm"
                    :disabled="isRestoring"
                  >
                    Restore
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Preview Area (Right Side) -->
        <div class="flex-1 bg-white">
          <div class="p-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h3 class="font-medium text-gray-900">
                {{ previewData ? 'Preview' : 'Select a version to preview' }}
              </h3>
              <div v-if="previewData && selectedVersion !== 'current'" class="flex items-center space-x-2">
                <button 
                  @click="restoreVersion(selectedVersion)"
                  :disabled="isRestoring"
                  class="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {{ isRestoring ? 'Restoring...' : 'Restore This Version' }}
                </button>
              </div>
            </div>
          </div>

          <div class="overflow-y-auto h-full pb-20">
            <!-- Preview Content -->
            <div v-if="previewData" class="p-6">
              <!-- Process Info -->
              <div class="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 class="font-medium text-gray-900 mb-2">Process Information</h4>
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span class="text-gray-600">Name:</span>
                    <span class="ml-2 font-medium">{{ previewData.processName }}</span>
                  </div>
                  <div>
                    <span class="text-gray-600">Status:</span>
                    <span class="ml-2 font-medium capitalize">{{ previewData.processStatus }}</span>
                  </div>
                  <div>
                    <span class="text-gray-600">Nodes:</span>
                    <span class="ml-2 font-medium">{{ previewData.processDefinition?.nodes?.length || 0 }}</span>
                  </div>
                  <div>
                    <span class="text-gray-600">Connections:</span>
                    <span class="ml-2 font-medium">{{ previewData.processDefinition?.edges?.length || 0 }}</span>
                  </div>
                  <div v-if="previewData.processCategory" class="col-span-2">
                    <span class="text-gray-600">Category:</span>
                    <span class="ml-2">{{ previewData.processCategory }}</span>
                  </div>
                  <div class="col-span-2" v-if="previewData.processDescription">
                    <span class="text-gray-600">Description:</span>
                    <span class="ml-2">{{ previewData.processDescription }}</span>
                  </div>
                  <div v-if="previewData.versionInfo" class="col-span-2">
                    <span class="text-gray-600">Version:</span>
                    <span class="ml-2 font-medium">{{ previewData.versionInfo.versionNumber }}</span>
                    <span class="ml-2 text-gray-500">
                      ({{ formatDate(previewData.versionInfo.savedDate) }})
                    </span>
                  </div>
                </div>
              </div>

              <!-- Process Nodes Preview -->
              <div class="space-y-4">
                <h4 class="font-medium text-gray-900">Process Nodes</h4>
                <div class="border rounded-lg p-4 bg-white">
                  <div v-if="previewData.processDefinition?.nodes?.length" class="space-y-3">
                    <div 
                      v-for="(node, index) in previewData.processDefinition.nodes" 
                      :key="index"
                      class="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                    >
                      <div class="flex items-center space-x-3">
                        <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Icon :name="getNodeIcon(node.type)" class="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div class="font-medium text-gray-900">
                            {{ node.data?.label || node.label || node.type }}
                          </div>
                          <div class="text-sm text-gray-600">
                            {{ node.id }}
                          </div>
                        </div>
                      </div>
                      <div class="text-sm text-gray-500">
                        {{ getNodeTypeName(node.type) }}
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-center py-8 text-gray-500">
                    No nodes in this version
                  </div>
                </div>
              </div>

              <!-- Process Variables Preview (if any) -->
              <div v-if="previewData.processVariables && Object.keys(previewData.processVariables).length > 0" class="mt-6">
                <h4 class="font-medium text-gray-900 mb-2">Process Variables</h4>
                <div class="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm font-mono">
                  <pre class="whitespace-pre-wrap">{{ JSON.stringify(previewData.processVariables, null, 2) }}</pre>
                </div>
              </div>

              <!-- Process Settings Preview (if any) -->
              <div v-if="previewData.processSettings && Object.keys(previewData.processSettings).length > 0" class="mt-6">
                <h4 class="font-medium text-gray-900 mb-2">Process Settings</h4>
                <div class="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm font-mono">
                  <pre class="whitespace-pre-wrap">{{ JSON.stringify(previewData.processSettings, null, 2) }}</pre>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else class="flex items-center justify-center h-full text-gray-500">
              <div class="text-center">
                <Icon name="heroicons:document-text" class="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Select a version to preview its contents</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer with Close Button -->
      <div class="flex justify-end p-4 border-t border-gray-200 bg-gray-50">
        <button 
          @click="$emit('close')" 
          class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useProcessBuilderStore } from '~/stores/processBuilder'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  processId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['close', 'restored'])

const processStore = useProcessBuilderStore()

// Try to use toast composable if available, with fallback
let toast
try {
  toast = useToast()
} catch (error) {
  toast = {
    success: (msg) => console.log('Success:', msg),
    error: (msg) => console.error('Error:', msg),
    info: (msg) => console.info('Info:', msg),
    warning: (msg) => console.warn('Warning:', msg)
  }
}

// Reactive data
const history = ref([])
const currentVersion = ref(null)
const processInfo = ref({})
const totalVersions = ref(0)
const selectedVersion = ref(null)
const previewData = ref(null)
const isRestoring = ref(false)

// Computed
const isLoading = computed(() => history.value.length === 0 && props.isOpen)

// Methods
const loadHistory = async () => {
  try {
    const result = await processStore.getProcessHistory(props.processId)
    history.value = result.history
    currentVersion.value = result.currentVersion
    processInfo.value = result.form
    totalVersions.value = result.totalVersions
  } catch (error) {
    console.error('Error loading process history:', error)
    toast.error('Failed to load process history')
  }
}

const selectVersion = (version) => {
  selectedVersion.value = version
  previewVersion(version)
}

const previewCurrent = () => {
  selectedVersion.value = 'current'
  previewData.value = {
    processName: currentVersion.value.processName,
    processDescription: currentVersion.value.processDescription,
    processDefinition: currentVersion.value.processDefinition,
    processStatus: currentVersion.value.processStatus,
    processCategory: currentVersion.value.processCategory,
    processOwner: currentVersion.value.processOwner,
    processPermissions: currentVersion.value.processPermissions,
    processPriority: currentVersion.value.processPriority,
    processSettings: currentVersion.value.processSettings,
    processVariables: currentVersion.value.processVariables,
    templateCategory: currentVersion.value.templateCategory
  }
}

const previewVersion = async (version) => {
  try {
    if (version === 'current') {
      previewCurrent()
      return
    }

    const result = await processStore.loadProcessVersionPreview(props.processId, version.historyID)
    previewData.value = result
  } catch (error) {
    console.error('Error loading version preview:', error)
    toast.error('Failed to load version preview')
  }
}

const restoreVersion = async (version) => {
  if (isRestoring.value) return

  const confirmed = confirm(`Are you sure you want to restore to version ${version.versionNumber}? This will create a new version with the restored content.`)
  if (!confirmed) return

  isRestoring.value = true
  try {
    const result = await processStore.restoreProcessVersion(props.processId, version)
    toast.success(result.message || 'Process restored successfully')
    emit('restored', result)
    emit('close')
  } catch (error) {
    console.error('Error restoring version:', error)
    toast.error('Failed to restore process version')
  } finally {
    isRestoring.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'Unknown'
  const date = new Date(dateString)
  return date.toLocaleString()
}

const getNodeIcon = (type) => {
  const icons = {
    'start': 'heroicons:play-circle',
    'end': 'heroicons:stop-circle',
    'task': 'heroicons:rectangle-stack',
    'form': 'heroicons:document-text',
    'gateway': 'heroicons:arrows-pointing-out',
    'script': 'heroicons:code-bracket',
    'api': 'heroicons:cloud-arrow-down',
    'notification': 'heroicons:bell',
    'business-rule': 'heroicons:document-check'
  }
  return icons[type] || 'heroicons:rectangle-stack'
}

const getNodeTypeName = (type) => {
  const names = {
    'start': 'Start Event',
    'end': 'End Event', 
    'task': 'Task',
    'form': 'Form Task',
    'gateway': 'Gateway',
    'script': 'Script Task',
    'api': 'API Call',
    'notification': 'Notification',
    'business-rule': 'Business Rule'
  }
  return names[type] || type.charAt(0).toUpperCase() + type.slice(1)
}

// Watchers
watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    loadHistory()
  } else {
    // Reset state when modal closes
    selectedVersion.value = null
    previewData.value = null
  }
})
</script> 