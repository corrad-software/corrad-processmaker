<template>
  <RsModal v-model="showModal" title="Process Settings" size="xl" position="center">
    <div>
      <RsTab :tabs="settingsTabs" v-model="activeTab">
        <!-- Process Info Tab -->
        <template #info>
          <div class="p-4 space-y-4">
            <FormKit
              type="text"
              label="Process Name"
              v-model="localProcess.name"
              help="Name of your process"
              validation="required"
            />
            
            <FormKit
              type="textarea"
              label="Process Description"
              v-model="localProcess.description"
              help="Brief description of what this process does"
              rows="3"
            />
            
            <FormKit
              type="select"
              label="Priority Level"
              v-model="localProcess.priority"
              :options="[
                { label: 'Low Priority', value: 'low' },
                { label: 'Normal Priority', value: 'normal' },
                { label: 'High Priority', value: 'high' },
                { label: 'Critical Priority', value: 'critical' }
              ]"
              help="Set the priority level for this process"
            />
            
            <FormKit
              type="text"
              label="Process Category"
              v-model="localProcess.category"
              help="Category or department this process belongs to"
              placeholder="e.g., HR, Finance, Operations"
            />
            
            <FormKit
              type="text"
              label="Owner/Manager"
              v-model="localProcess.owner"
              help="Person responsible for this process"
              placeholder="e.g., John Doe, HR Manager"
            />
          </div>
        </template>

        <!-- Execution Settings Tab -->
        <template #execution>
          <div class="p-4 space-y-4">
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div class="flex items-center mb-2">
                <Icon name="material-symbols:info" class="w-5 h-5 text-blue-600 mr-2" />
                <h4 class="font-medium text-blue-900">Execution Settings</h4>
              </div>
              <p class="text-sm text-blue-700">
                Configure how this process should execute and handle different scenarios.
              </p>
            </div>
            
            <FormKit
              type="select"
              label="Process Type"
              v-model="localProcess.processType"
              :options="[
                { label: 'Standard Process', value: 'standard' },
                { label: 'Approval Workflow', value: 'approval' },
                { label: 'Data Collection', value: 'data_collection' },
                { label: 'Automated Task', value: 'automation' },
                { label: 'Review Process', value: 'review' }
              ]"
              help="Type of process workflow"
            />
            
            <div class="grid grid-cols-2 gap-4">
              <FormKit
                type="number"
                label="Max Execution Time (minutes)"
                v-model="localProcess.maxExecutionTime"
                help="Maximum time allowed for process completion"
                min="1"
                max="10080"
              />
              
              <FormKit
                type="number"
                label="Auto-Timeout (hours)"
                v-model="localProcess.autoTimeout"
                help="Automatically timeout after specified hours"
                min="1"
                max="168"
              />
            </div>
            
            <FormKit
              type="checkbox"
              label="Allow Parallel Execution"
              v-model="localProcess.allowParallel"
              help="Allow multiple instances of this process to run simultaneously"
            />
            
            <FormKit
              type="checkbox"
              label="Enable Error Recovery"
              v-model="localProcess.enableErrorRecovery"
              help="Automatically retry failed steps before stopping"
            />
            
            <FormKit
              type="checkbox"
              label="Send Completion Notifications"
              v-model="localProcess.sendNotifications"
              help="Send notifications when process completes"
            />
          </div>
        </template>

        <!-- Variables & Data Tab -->
        <template #variables>
          <div class="p-4 space-y-4">
            <div class="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
              <div class="flex items-center mb-2">
                <Icon name="material-symbols:data-object" class="w-5 h-5 text-purple-600 mr-2" />
                <h4 class="font-medium text-purple-900">Variable Configuration</h4>
              </div>
              <p class="text-sm text-purple-700">
                Configure data handling and variable persistence settings.
              </p>
            </div>
            
            <FormKit
              type="select"
              label="Data Persistence"
              v-model="localProcess.dataPersistence"
              :options="[
                { label: 'Session Only', value: 'session' },
                { label: 'Temporary (24 hours)', value: 'temporary' },
                { label: 'Short Term (7 days)', value: 'short_term' },
                { label: 'Long Term (30 days)', value: 'long_term' },
                { label: 'Permanent', value: 'permanent' }
              ]"
              help="How long should process data be stored"
            />
            
            <FormKit
              type="checkbox"
              label="Log Variable Changes"
              v-model="localProcess.logVariableChanges"
              help="Keep a log of all variable modifications during execution"
            />
            
            <FormKit
              type="checkbox"
              label="Encrypt Sensitive Data"
              v-model="localProcess.encryptSensitiveData"
              help="Automatically encrypt variables marked as sensitive"
            />
            
            <FormKit
              type="textarea"
              label="Data Retention Policy"
              v-model="localProcess.dataRetentionPolicy"
              help="Describe how data should be handled after process completion"
              rows="3"
              placeholder="e.g., Delete personal data after 30 days, archive business data for 7 years"
            />
          </div>
        </template>

        <!-- Permissions Tab -->
        <template #permissions>
          <div class="p-4 space-y-4">
            <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div class="flex items-center mb-2">
                <Icon name="material-symbols:security" class="w-5 h-5 text-green-600 mr-2" />
                <h4 class="font-medium text-green-900">Access Control</h4>
              </div>
              <p class="text-sm text-green-700">
                Define who can execute, modify, and view this process.
              </p>
            </div>
            
            <FormKit
              type="select"
              label="Execution Permission"
              v-model="localProcess.executionPermission"
              :options="[
                { label: 'Anyone', value: 'public' },
                { label: 'Authenticated Users', value: 'authenticated' },
                { label: 'Specific Roles', value: 'roles' },
                { label: 'Process Managers Only', value: 'managers' },
                { label: 'Administrators Only', value: 'admin' }
              ]"
              help="Who can start and execute this process"
            />
            
            <FormKit
              type="text"
              label="Allowed Roles"
              v-model="localProcess.allowedRoles"
              help="Comma-separated list of roles that can execute this process"
              placeholder="e.g., manager, hr_admin, finance_user"
              v-if="localProcess.executionPermission === 'roles'"
            />
            
            <FormKit
              type="select"
              label="Modification Permission"
              v-model="localProcess.modificationPermission"
              :options="[
                { label: 'Process Owner Only', value: 'owner' },
                { label: 'Process Managers', value: 'managers' },
                { label: 'Administrators', value: 'admin' },
                { label: 'Anyone with Edit Rights', value: 'editors' }
              ]"
              help="Who can modify this process"
            />
            
            <FormKit
              type="checkbox"
              label="Require Approval for Changes"
              v-model="localProcess.requireApproval"
              help="Changes to this process must be approved before taking effect"
            />
            
            <FormKit
              type="checkbox"
              label="Enable Audit Trail"
              v-model="localProcess.enableAuditTrail"
              help="Keep detailed logs of who accessed and modified this process"
            />
          </div>
        </template>

        <!-- JSON Export Tab -->
        <template #json>
          <div class="p-4">
            <div class="mb-4">
              <h3 class="text-lg font-medium mb-2">Process Configuration</h3>
              <p class="text-sm text-gray-600 mb-4">
                This section displays the complete process configuration as JSON for developers and system integration.
              </p>
              
              <!-- Process metadata -->
              <div class="bg-gray-50 p-3 rounded border mb-4 text-sm">
                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <span class="font-medium">Node Count:</span> {{ nodeCount }}
                  </div>
                  <div>
                    <span class="font-medium">Edge Count:</span> {{ edgeCount }}
                  </div>
                  <div>
                    <span class="font-medium">Process ID:</span> {{ localProcess.id || 'Not saved yet' }}
                  </div>
                  <div>
                    <span class="font-medium">Variable Count:</span> {{ variableCount }}
                  </div>
                </div>
              </div>
              
              <!-- Action buttons -->
              <div class="flex gap-2 mb-4">
                <RsButton @click="copyToClipboard" variant="secondary" size="sm">
                  <Icon name="material-symbols:content-copy" class="mr-1" />
                  Copy JSON
                </RsButton>
                <RsButton @click="downloadJson" variant="secondary" size="sm">
                  <Icon name="material-symbols:download" class="mr-1" />
                  Download
                </RsButton>
              </div>
            </div>
            
            <!-- JSON Display -->
            <div class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto" style="max-height: 400px;">
              <pre class="text-sm">{{ formattedJson }}</pre>
            </div>
          </div>
        </template>
      </RsTab>
    </div>
    
    <!-- Footer Actions -->
    <template #footer>
      <div class="flex justify-end gap-2">
        <RsButton @click="closeModal" variant="tertiary">
          Cancel
        </RsButton>
        <RsButton @click="saveSettings" variant="primary">
          Save Settings
        </RsButton>
      </div>
    </template>
  </RsModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useProcessBuilderStore } from '~/stores/processBuilder'
import { useVariableStore } from '~/stores/variableStore'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const processStore = useProcessBuilderStore()
const variableStore = useVariableStore()

// Modal visibility
const showModal = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Settings tabs configuration
const settingsTabs = [
  { key: 'info', label: 'Process Info', icon: 'material-symbols:info-outline' },
  { key: 'execution', label: 'Execution', icon: 'material-symbols:play-circle-outline' },
  { key: 'variables', label: 'Variables & Data', icon: 'material-symbols:data-object' },
  { key: 'permissions', label: 'Permissions', icon: 'material-symbols:security' },
  { key: 'json', label: 'Source', icon: 'material-symbols:code' }
]

const activeTab = ref('info')

// Local process data (copy of current process)
const localProcess = ref({
  name: '',
  description: '',
  priority: 'normal',
  category: '',
  owner: '',
  processType: 'standard',
  maxExecutionTime: 60,
  autoTimeout: 24,
  allowParallel: false,
  enableErrorRecovery: true,
  sendNotifications: true,
  dataPersistence: 'short_term',
  logVariableChanges: true,
  encryptSensitiveData: false,
  dataRetentionPolicy: '',
  executionPermission: 'authenticated',
  allowedRoles: '',
  modificationPermission: 'managers',
  requireApproval: false,
  enableAuditTrail: true
})

// Computed properties for metadata
const nodeCount = computed(() => {
  return processStore.currentProcess?.nodes?.length || 0
})

const edgeCount = computed(() => {
  return processStore.currentProcess?.edges?.length || 0
})

const variableCount = computed(() => {
  const allVars = variableStore.getAllVariables
  return (allVars.global?.length || 0) + (allVars.process?.length || 0)
})

// JSON export functionality
const formattedJson = computed(() => {
  const exportData = {
    processInfo: {
      id: localProcess.value.id,
      name: localProcess.value.name,
      description: localProcess.value.description,
      priority: localProcess.value.priority,
      category: localProcess.value.category,
      owner: localProcess.value.owner
    },
    settings: {
      processType: localProcess.value.processType,
      maxExecutionTime: localProcess.value.maxExecutionTime,
      autoTimeout: localProcess.value.autoTimeout,
      allowParallel: localProcess.value.allowParallel,
      enableErrorRecovery: localProcess.value.enableErrorRecovery,
      sendNotifications: localProcess.value.sendNotifications
    },
    dataSettings: {
      dataPersistence: localProcess.value.dataPersistence,
      logVariableChanges: localProcess.value.logVariableChanges,
      encryptSensitiveData: localProcess.value.encryptSensitiveData,
      dataRetentionPolicy: localProcess.value.dataRetentionPolicy
    },
    permissions: {
      executionPermission: localProcess.value.executionPermission,
      allowedRoles: localProcess.value.allowedRoles,
      modificationPermission: localProcess.value.modificationPermission,
      requireApproval: localProcess.value.requireApproval,
      enableAuditTrail: localProcess.value.enableAuditTrail
    },
    workflow: {
      nodes: processStore.currentProcess?.nodes || [],
      edges: processStore.currentProcess?.edges || []
    },
    variables: variableStore.getAllVariables,
    metadata: {
      nodeCount: nodeCount.value,
      edgeCount: edgeCount.value,
      variableCount: variableCount.value,
      exportedAt: new Date().toISOString()
    }
  }
  
  return JSON.stringify(exportData, null, 2)
})

// Watch for changes to current process and sync with local data
watch(() => processStore.currentProcess, (newProcess) => {
  if (newProcess) {
    localProcess.value = {
      ...localProcess.value,
      id: newProcess.id,
      name: newProcess.name || '',
      description: newProcess.description || '',
      ...newProcess.settings
    }
  }
}, { immediate: true, deep: true })

// Methods
const closeModal = () => {
  showModal.value = false
}

const saveSettings = () => {
  // Update the process in the store
  if (processStore.currentProcess) {
    const updatedProcess = {
      ...processStore.currentProcess,
      name: localProcess.value.name,
      description: localProcess.value.description,
      settings: {
        priority: localProcess.value.priority,
        category: localProcess.value.category,
        owner: localProcess.value.owner,
        processType: localProcess.value.processType,
        maxExecutionTime: localProcess.value.maxExecutionTime,
        autoTimeout: localProcess.value.autoTimeout,
        allowParallel: localProcess.value.allowParallel,
        enableErrorRecovery: localProcess.value.enableErrorRecovery,
        sendNotifications: localProcess.value.sendNotifications,
        dataPersistence: localProcess.value.dataPersistence,
        logVariableChanges: localProcess.value.logVariableChanges,
        encryptSensitiveData: localProcess.value.encryptSensitiveData,
        dataRetentionPolicy: localProcess.value.dataRetentionPolicy,
        executionPermission: localProcess.value.executionPermission,
        allowedRoles: localProcess.value.allowedRoles,
        modificationPermission: localProcess.value.modificationPermission,
        requireApproval: localProcess.value.requireApproval,
        enableAuditTrail: localProcess.value.enableAuditTrail
      }
    }
    
    // Update the store
    processStore.updateCurrentProcess(updatedProcess)
  }
  
  closeModal()
}

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(formattedJson.value)
    // You might want to show a toast notification here
    console.log('JSON copied to clipboard')
  } catch (err) {
    console.error('Failed to copy JSON:', err)
  }
}

const downloadJson = () => {
  const blob = new Blob([formattedJson.value], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${localProcess.value.name || 'process'}_settings.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
/* Custom styling for the settings modal */
:deep(.formkit-outer) {
  margin-bottom: 1rem;
}

:deep(.formkit-label) {
  font-weight: 500;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
  color: #374151;
}

:deep(.formkit-help) {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

:deep(.formkit-messages) {
  font-size: 0.75rem;
  color: #ef4444;
  margin-top: 0.25rem;
}

pre {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
}
</style> 