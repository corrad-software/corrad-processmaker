<template>
  <div class="repeating-table-container">
    <!-- Header Section -->
    <div class="repeating-table-header">
      <div class="header-content">
        <div class="header-left">
          <h3 v-if="config.label" class="table-title">{{ config.label }}</h3>
          <p v-if="config.help" class="table-help">{{ config.help }}</p>
        </div>
        <div v-if="showRecordCount" class="header-right">
          <div class="record-count">
            {{ data.length }} record{{ data.length !== 1 ? 's' : '' }}
            <span v-if="config.maxRecords" class="record-limit">/ {{ config.maxRecords }} max</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Controls Section -->
    <div v-if="config.enableSearch || (!isAddDisabled && data.length > 0)" class="controls-section">
      <!-- Search Bar -->
      <div v-if="config.enableSearch" class="search-container">
        <div class="search-input-wrapper">
          <Icon name="heroicons:magnifying-glass" class="search-icon" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search records..."
            class="search-input"
          />
          <RsButton
            v-if="searchQuery"
            @click="searchQuery = ''"
            variant="secondary-text"
            size="sm"
            title="Clear search"
          >
            <Icon name="heroicons:x-mark" class="w-4 h-4" />
          </RsButton>
        </div>
      </div>

      <!-- Add Button (only show when there are existing records) -->
      <RsButton
        v-if="data.length > 0"
        @click="openAddModal"
        :disabled="isAddDisabled"
        variant="primary"
        size="sm"
      >
        <Icon name="heroicons:plus" class="w-4 h-4 mr-2" />
        {{ config.buttonText || 'Add Record' }}
      </RsButton>
    </div>

    <!-- Data Table -->
    <div class="table-container">
      <div v-if="paginatedData.length > 0" class="table-wrapper">
        <div class="table-content">
          <table class="data-table">
            <thead class="table-header-row">
              <tr>
                <th v-if="config.showRowNumbers" class="row-number-header">#</th>
                <th
                  v-for="column in config.columns"
                  :key="column.name"
                  class="column-header"
                >
                  <div class="column-header-content">
                    <span class="header-text">{{ column.label }}</span>
                    <span v-if="column.required" class="required-indicator">*</span>
                  </div>
                </th>
                <th v-if="showActions" class="actions-header">Actions</th>
              </tr>
            </thead>
            <tbody class="table-body">
              <tr
                v-for="(record, index) in paginatedData"
                :key="index"
                class="data-row"
                :class="{ 'row-hover': !isPreview }"
              >
                <td v-if="config.showRowNumbers" class="row-number-cell">
                  <div class="row-number">{{ getRowNumber(index) }}</div>
                </td>
                <td
                  v-for="column in config.columns"
                  :key="column.name"
                  class="data-cell"
                >
                  <div class="cell-content">
                    <span class="cell-value">{{ formatCellValue(record[column.name], column) }}</span>
                  </div>
                </td>
                <td v-if="showActions" class="actions-cell">
                  <div class="action-buttons-row">
                    <RsButton
                      v-if="config.allowEdit"
                      @click="openEditModal(record, getOriginalIndex(record))"
                      variant="info-text"
                      size="sm"
                      title="Edit record"
                    >
                      <Icon name="heroicons:pencil-square" class="w-4 h-4" />
                    </RsButton>
                    <RsButton
                      v-if="config.allowDelete"
                      @click="deleteRecord(getOriginalIndex(record))"
                      variant="danger-text"
                      size="sm"
                      title="Delete record"
                    >
                      <Icon name="heroicons:trash" class="w-4 h-4" />
                    </RsButton>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <div class="empty-content">
          <div class="empty-icon-container">
            <Icon name="heroicons:table-cells" class="empty-icon" />
          </div>
          <div class="empty-text">
            <h4 class="empty-title">No records yet</h4>
            <p class="empty-description">
              {{ searchQuery ? 'No records match your search criteria.' : 'Click "' + (config.buttonText || 'Add Record') + '" to add your first record.' }}
            </p>
          </div>
          <RsButton
            v-if="!searchQuery && !isAddDisabled"
            @click="openAddModal"
            variant="primary"
            size="md"
          >
            <Icon name="heroicons:plus" class="w-4 h-4 mr-2" />
            {{ config.buttonText || 'Add Record' }}
          </RsButton>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="filteredData.length > 0 && totalPages > 1" class="pagination-container">
      <div class="pagination-info">
        <span class="pagination-text">
          Showing {{ startRecord }} to {{ endRecord }} of {{ filteredData.length }} records
        </span>
      </div>
      
      <div class="pagination-controls">
        <div class="page-size-selector">
          <label class="page-size-label">Show:</label>
          <select v-model="pageSize" @change="currentPage = 1" class="page-size-select">
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
          <span class="page-size-suffix">per page</span>
        </div>
        
        <div class="page-navigation">
          <RsButton
            @click="goToPage(1)"
            :disabled="currentPage === 1"
            variant="secondary-outline"
            size="sm"
            title="First page"
          >
            <Icon name="heroicons:chevron-double-left" class="w-4 h-4" />
          </RsButton>
          
          <RsButton
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            variant="secondary-outline"
            size="sm"
            title="Previous page"
          >
            <Icon name="heroicons:chevron-left" class="w-4 h-4" />
          </RsButton>
          
          <div class="page-numbers">
            <RsButton
              v-for="page in visiblePages"
              :key="page"
              @click="goToPage(page)"
              :variant="page === currentPage ? 'primary' : 'secondary-outline'"
              size="sm"
            >
              {{ page }}
            </RsButton>
          </div>
          
          <RsButton
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            variant="secondary-outline"
            size="sm"
            title="Next page"
          >
            <Icon name="heroicons:chevron-right" class="w-4 h-4" />
          </RsButton>
          
          <RsButton
            @click="goToPage(totalPages)"
            :disabled="currentPage === totalPages"
            variant="secondary-outline"
            size="sm"
            title="Last page"
          >
            <Icon name="heroicons:chevron-double-right" class="w-4 h-4" />
          </RsButton>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-container">
        <div class="modal-header">
          <div class="modal-title-section">
            <h3 class="modal-title">
              {{ editingIndex !== null ? 'Edit Record' : 'Add New Record' }}
            </h3>
          </div>
          <RsButton @click="closeModal" variant="secondary-text" size="sm">
            <Icon name="heroicons:x-mark" class="w-6 h-6" />
          </RsButton>
        </div>

        <div class="modal-body">
          <FormKit
            :id="formId"
            type="form"
            :actions="false"
            v-model="formData"
            @submit="saveRecord"
            class="record-form"
          >
            <div class="form-grid">
              <div
                v-for="column in config.columns"
                :key="column.name"
                class="form-field"
                :class="{ 'form-field-full': column.type === 'textarea' }"
              >
                <FormKit
                  :type="getFormKitType(column.type)"
                  :label="column.label"
                  :name="column.name"
                  :placeholder="column.placeholder"
                  :validation="getValidationRules(column)"
                  :required="column.required"
                  :options="column.options"
                  :classes="{ outer: 'field-wrapper' }"
                />
              </div>
            </div>
          </FormKit>
        </div>

        <div class="modal-footer">
          <RsButton @click="closeModal" variant="secondary-outline">
            Cancel
          </RsButton>
          <RsButton @click="submitForm" variant="primary">
            <Icon name="heroicons:check" class="w-4 h-4 mr-2" />
            {{ editingIndex !== null ? 'Update Record' : 'Add Record' }}
          </RsButton>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="cancelDelete">
      <div class="modal-container modal-small">
        <div class="modal-header">
          <div class="modal-title-section">
            <h3 class="modal-title">Confirm Delete</h3>
          </div>
          <RsButton @click="cancelDelete" variant="secondary-text" size="sm">
            <Icon name="heroicons:x-mark" class="w-6 h-6" />
          </RsButton>
        </div>

        <div class="modal-body">
          <div class="delete-warning">
            <div class="warning-icon-container">
              <Icon name="heroicons:exclamation-triangle" class="warning-icon" />
            </div>
            <div class="warning-content">
              <p class="warning-title">Are you sure you want to delete this record?</p>
              <p class="warning-message">This action cannot be undone.</p>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <RsButton @click="cancelDelete" variant="secondary-outline">
            Cancel
          </RsButton>
          <RsButton @click="confirmDelete" variant="danger">
            <Icon name="heroicons:trash" class="w-4 h-4 mr-2" />
            Delete Record
          </RsButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { v4 as uuidv4 } from 'uuid'

const props = defineProps({
  config: {
    type: Object,
    required: true
  },
  modelValue: {
    type: Array,
    default: () => []
  },
  isPreview: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

// Reactive state
const data = ref([...props.modelValue])
const searchQuery = ref('')
const showModal = ref(false)
const showDeleteConfirm = ref(false)
const editingIndex = ref(null)
const deleteIndex = ref(null)
const formData = ref({})
const formId = ref(`table-form-${uuidv4()}`)

// Pagination state
const currentPage = ref(1)
const pageSize = ref(10)

// Computed properties
const filteredData = computed(() => {
  if (!searchQuery.value) return data.value
  
  const query = searchQuery.value.toLowerCase()
  return data.value.filter(record => {
    return props.config.columns.some(column => {
      const value = record[column.name]
      return value && value.toString().toLowerCase().includes(query)
    })
  })
})

const isAddDisabled = computed(() => {
  return props.config.maxRecords && data.value.length >= props.config.maxRecords
})

const showActions = computed(() => {
  return (props.config.allowEdit || props.config.allowDelete) && !props.isPreview
})

const showRecordCount = computed(() => {
  return data.value.length > 0 || props.config.maxRecords
})

// Pagination computed properties
const totalPages = computed(() => {
  return Math.ceil(filteredData.value.length / pageSize.value)
})

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredData.value.slice(start, end)
})

const startRecord = computed(() => {
  if (filteredData.value.length === 0) return 0
  return (currentPage.value - 1) * pageSize.value + 1
})

const endRecord = computed(() => {
  const end = currentPage.value * pageSize.value
  return Math.min(end, filteredData.value.length)
})

const visiblePages = computed(() => {
  const delta = 2
  const range = []
  const rangeWithDots = []
  
  for (let i = Math.max(2, currentPage.value - delta); 
       i <= Math.min(totalPages.value - 1, currentPage.value + delta); 
       i++) {
    range.push(i)
  }
  
  if (currentPage.value - delta > 2) {
    rangeWithDots.push(1, '...')
  } else {
    rangeWithDots.push(1)
  }
  
  rangeWithDots.push(...range)
  
  if (currentPage.value + delta < totalPages.value - 1) {
    rangeWithDots.push('...', totalPages.value)
  } else {
    rangeWithDots.push(totalPages.value)
  }
  
  return rangeWithDots.filter((item, index, array) => array.indexOf(item) === index)
})

// Watch for external data changes
watch(() => props.modelValue, (newValue) => {
  data.value = [...newValue]
}, { deep: true })

// Watch for internal data changes and emit
watch(data, (newData) => {
  emit('update:modelValue', [...newData])
}, { deep: true })

// Methods
const openAddModal = () => {
  if (props.isPreview) return
  
  editingIndex.value = null
  formData.value = {}
  
  // Initialize form data with empty values
  props.config.columns.forEach(column => {
    formData.value[column.name] = getDefaultValue(column.type)
  })
  
  showModal.value = true
}

const openEditModal = (record, index) => {
  if (props.isPreview) return
  
  editingIndex.value = index
  formData.value = { ...record }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingIndex.value = null
  formData.value = {}
}

const submitForm = () => {
  // Trigger form submission programmatically
  const form = document.getElementById(formId.value)
  if (form) {
    form.requestSubmit()
  }
}

const saveRecord = (formData) => {
  if (editingIndex.value !== null) {
    // Update existing record
    data.value[editingIndex.value] = { ...formData }
  } else {
    // Add new record
    data.value.push({ ...formData })
  }
  
  closeModal()
}

const deleteRecord = (index) => {
  if (props.isPreview) return
  
  if (props.config.confirmDelete) {
    deleteIndex.value = index
    showDeleteConfirm.value = true
  } else {
    data.value.splice(index, 1)
  }
}

const confirmDelete = () => {
  if (deleteIndex.value !== null) {
    data.value.splice(deleteIndex.value, 1)
  }
  cancelDelete()
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
  deleteIndex.value = null
}

const getOriginalIndex = (record) => {
  return data.value.findIndex(item => item === record)
}

const formatCellValue = (value, column) => {
  if (value === null || value === undefined || value === '') {
    return '-'
  }
  
  if (column.type === 'date') {
    return new Date(value).toLocaleDateString()
  }
  
  if (column.type === 'time') {
    return value
  }
  
  if (column.type === 'checkbox') {
    return value ? 'Yes' : 'No'
  }
  
  if (column.type === 'select' && column.options) {
    const option = column.options.find(opt => opt.value === value)
    return option ? option.label : value
  }
  
  return value.toString()
}

const getFormKitType = (columnType) => {
  const typeMap = {
    text: 'text',
    number: 'number',
    email: 'email',
    tel: 'tel',
    date: 'date',
    time: 'time',
    url: 'url',
    select: 'select',
    checkbox: 'checkbox',
    textarea: 'textarea'
  }
  return typeMap[columnType] || 'text'
}

const getValidationRules = (column) => {
  let rules = []
  
  if (column.required) {
    rules.push('required')
  }
  
  if (column.validation) {
    const customRules = column.validation.split('|').filter(rule => rule.trim())
    rules.push(...customRules)
  }
  
  return rules.join('|')
}

const getDefaultValue = (type) => {
  switch (type) {
    case 'number':
      return null
    case 'checkbox':
      return false
    case 'date':
    case 'time':
      return ''
    default:
      return ''
  }
}

const goToPage = (page) => {
  currentPage.value = page
}

const getRowNumber = (index) => {
  return (currentPage.value - 1) * pageSize.value + index + 1
}

// Watch for search changes to reset pagination
watch(searchQuery, () => {
  currentPage.value = 1
})
</script>

<style scoped>
.repeating-table-container {
  @apply border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm w-full;
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
}

.repeating-table-header {
  @apply p-4 md:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200;
  min-height: auto;
  box-sizing: border-box;
}

.header-content {
  /* Mobile first: flex-col, items-center (horizontal centering), gap-2 */
  @apply flex flex-col items-center gap-2 w-full;
  /* SM and up: flex-row, justify-between, items-baseline (vertical for text), gap-3 */
  @apply sm:flex-row sm:justify-between sm:items-baseline sm:gap-3;
}

.header-left {
  @apply flex-1 min-w-0; /* Allows shrinking, good for title/help */
}

.table-title {
  @apply text-lg font-semibold text-gray-800 leading-tight; /* Ensure it can wrap if very long, though not the current issue */
}

.table-help {
  @apply text-sm text-gray-600 break-words leading-relaxed mt-1; /* Spacing below title if help exists */
}

.header-right {
  @apply flex items-center flex-shrink-0; /* flex-shrink-0 prevents the badge from shrinking */
}

.record-count {
  @apply text-sm text-gray-600 bg-white px-3 py-1 rounded-full border border-gray-200 font-medium whitespace-nowrap;
}

.record-limit {
  @apply text-gray-500;
}

.controls-section {
  @apply flex flex-col md:flex-row md:justify-between md:items-center gap-3 p-4 bg-gray-50 border-b border-gray-200;
}

.search-container {
  @apply flex-1 max-w-md;
}

.search-input-wrapper {
  @apply relative;
}

.search-icon {
  @apply absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400;
}

.search-input {
  @apply w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm;
}

.clear-search {
  @apply absolute right-3 top-1/2 transform -translate-y-1/2;
}

.add-button {
  @apply inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm min-w-max;
}

.add-button.disabled {
  @apply bg-gray-400 cursor-not-allowed hover:bg-gray-400;
}

.table-container {
  @apply overflow-hidden;
}

.table-wrapper {
  @apply overflow-x-auto;
}

.table-content {
  @apply mx-4 md:mx-6;
}

.data-table {
  @apply w-full divide-y divide-gray-200;
}

.table-header-row {
  @apply bg-gray-50;
}

.column-header,
.row-number-header,
.actions-header {
  @apply px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider;
}

.row-number-header {
  @apply w-16 text-center;
}

.actions-header {
  @apply w-32 text-center;
}

.column-header-content {
  @apply flex items-center;
}

.header-text {
  @apply font-medium text-gray-700;
}

.required-indicator {
  @apply text-red-500 ml-1 font-bold;
}

.table-body {
  @apply bg-white divide-y divide-gray-200;
}

.data-row {
  @apply transition-colors duration-150;
}

.data-row.row-hover:hover {
  @apply bg-blue-50;
}

.row-number-cell,
.data-cell,
.actions-cell {
  @apply px-6 py-4 whitespace-nowrap;
}

.row-number {
  @apply flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full text-sm text-gray-600 font-medium;
}

.cell-content {
  @apply flex items-center;
}

.cell-value {
  @apply text-sm text-gray-900;
}

.action-buttons-row {
  @apply flex justify-center space-x-2;
}

.action-button {
  @apply p-2 rounded-md transition-colors duration-150;
}

.edit-button {
  @apply text-blue-600 hover:text-blue-800 hover:bg-blue-100;
}

.delete-button {
  @apply text-red-600 hover:text-red-800 hover:bg-red-100;
}

.empty-state {
  @apply py-16 px-6;
}

.empty-content {
  @apply flex flex-col items-center text-center max-w-md mx-auto;
}

.empty-icon-container {
  @apply mb-6;
}

.empty-icon {
  @apply w-16 h-16 text-gray-300;
}

.empty-text {
  @apply mb-6;
}

.empty-title {
  @apply text-xl font-medium text-gray-900 mb-2;
}

.empty-description {
  @apply text-gray-500 leading-relaxed;
}

.empty-add-button {
  @apply inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium;
}

.modal-overlay {
  @apply fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm;
}

.modal-container {
  @apply bg-white rounded-xl shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-hidden;
}

.modal-container.modal-small {
  @apply max-w-md;
}

.modal-header {
  @apply flex justify-between items-start p-6 border-b border-gray-200 bg-gray-50;
}

.modal-title-section {
  @apply flex-1 pr-4;
}

.modal-title {
  @apply text-xl font-semibold text-gray-800 mb-1;
}

.modal-close {
  @apply text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-200;
}

.modal-body {
  @apply p-6 overflow-y-auto max-h-[60vh];
}

.form-grid {
  @apply grid grid-cols-1 md:grid-cols-2 gap-6;
}

.form-field {
  @apply col-span-1;
}

.form-field-full {
  @apply col-span-full;
}

.field-wrapper {
  @apply mb-0;
}

.modal-footer {
  @apply flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50;
}

.modal-button {
  @apply px-4 py-2 rounded-lg font-medium transition-colors duration-150;
}

.cancel-button {
  @apply text-gray-700 bg-white border border-gray-300 hover:bg-gray-50;
}

.save-button {
  @apply text-white bg-blue-600 hover:bg-blue-700;
}

.delete-warning {
  @apply flex items-start space-x-4;
}

.warning-icon-container {
  @apply flex-shrink-0;
}

.warning-icon {
  @apply w-6 h-6 text-amber-500;
}

.warning-content {
  @apply flex-1;
}

.warning-title {
  @apply font-medium text-gray-900 mb-2;
}

.warning-message {
  @apply text-gray-600 text-sm;
}

.delete-confirm-button {
  @apply text-white bg-red-600 hover:bg-red-700;
}

/* Pagination Styles */
.pagination-container {
  @apply flex flex-col md:flex-row md:justify-between md:items-center gap-4 p-4 md:p-6 bg-gray-50 border-t border-gray-200;
}

.pagination-info {
  @apply flex items-center;
}

.pagination-text {
  @apply text-sm text-gray-700 font-medium;
}

.pagination-controls {
  @apply flex flex-col sm:flex-row items-center gap-4;
}

.page-size-selector {
  @apply flex items-center gap-2 text-sm;
}

.page-size-label {
  @apply text-gray-700 font-medium;
}

.page-size-select {
  @apply border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
}

.page-size-suffix {
  @apply text-gray-600;
}

.page-navigation {
  @apply flex items-center gap-1;
}

.pagination-button {
  @apply flex items-center justify-center w-8 h-8 text-sm text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-500 transition-colors;
}

.page-numbers {
  @apply flex items-center gap-1 mx-2;
}

.page-number-button {
  @apply flex items-center justify-center w-8 h-8 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors;
}

.page-number-button.active {
  @apply text-white bg-blue-600 border-blue-600 hover:bg-blue-700;
}

/* Responsive design */
@media (max-width: 768px) {
  .repeating-table-header {
    @apply p-3;
  }
  
  .header-content {
    @apply flex-col gap-2;
  }
  
  .table-title {
    @apply text-base font-semibold leading-tight;
  }
  
  .table-help {
    @apply text-sm leading-relaxed;
  }
  
  .header-right {
    @apply mt-2;
  }
  
  .controls-section {
    @apply p-3 gap-3;
  }
  
  .table-content {
    @apply mx-2;
  }
  
  .form-grid {
    @apply grid-cols-1;
  }
  
  .table-container {
    @apply text-sm;
  }
  
  .row-number-cell,
  .data-cell,
  .actions-cell {
    @apply px-3 py-3;
  }
  
  .column-header,
  .row-number-header,
  .actions-header {
    @apply px-3 py-2;
  }
  
  .modal-container {
    @apply mx-2;
  }
  
  .empty-state {
    @apply py-8 px-4;
  }
  
  .pagination-container {
    @apply p-3 gap-3;
  }
  
  .pagination-controls {
    @apply flex-col gap-3;
  }
  
  .page-navigation {
    @apply justify-center;
  }
}
</style> 