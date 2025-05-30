<template>
  <div class="component-preview form-field" :style="componentStyle" :data-name="component.props.name"
    :data-type="component.type">
    <!-- Hidden Field Special Display -->
    <div v-if="component.type === 'hidden' && isPreview" class="py-2">
      <div class="hidden-field-preview border-2 border-dashed border-gray-300 bg-gray-50 rounded-lg p-3">
        <div class="flex items-center space-x-2">
          <Icon name="heroicons:eye-slash" class="w-4 h-4 text-gray-400" />
          <span class="text-sm font-medium text-gray-600">Hidden Field</span>
        </div>
        <div class="mt-1">
          <div class="text-xs text-gray-500">
            <strong>Name:</strong> {{ component.props.name || 'unnamed' }}
          </div>
          <div class="text-xs text-gray-500">
            <strong>Value:</strong> {{ component.props.value || '(empty)' }}
          </div>
        </div>
        <div v-if="component.props.help" class="mt-1 text-xs text-gray-400">
          {{ component.props.help }}
        </div>
      </div>
    </div>

    <!-- Basic Input Types (including radio and checkbox) -->
    <FormKit v-else-if="isInputType" :id="`preview-${component.id}`" :type="component.type" :name="component.props.name"
      :label="component.props.label" :help="component.props.help" :placeholder="component.props.placeholder"
      :validation="component.props.validation" :validation-visibility="isPreview ? 'live' : 'blur'"
      :readonly="isPreview" :options="component.props.options || undefined" :value="component.props.value || undefined"
      :accept="component.props.accept || undefined" :max="component.props.max || undefined"
      :mask="component.props.mask || undefined" :digits="component.props.digits || undefined"
      :multiple="component.props.multiple || undefined" :maxSize="component.props.maxSize || undefined"
      :maxFiles="component.props.maxFiles || undefined" :classes="component.type === 'checkbox' ? {
        wrapper: 'mb-1',
        options: 'space-y-0.5'
      } : {}" :class="{ 'canvas-component': isPreview }" />



    <!-- Heading -->
    <div v-else-if="component.type === 'heading'" class="py-2">
      <component :is="`h${component.props.level || 2}`" class="font-semibold" :class="{
        'text-2xl': component.props.level === 2,
        'text-xl': component.props.level === 3,
        'text-lg': component.props.level === 4
      }">
        {{ component.props.value || 'Heading Text' }}
      </component>
    </div>

    <!-- Paragraph -->
    <div v-else-if="component.type === 'paragraph'" class="py-2">
      <p class="text-gray-600">{{ component.props.value || 'Paragraph text goes here' }}</p>
    </div>

    <!-- Information Display -->
    <div v-else-if="component.type === 'info-display'" class="py-2">
      <div class="info-display-container rounded" :style="{
        backgroundColor: component.props.backgroundColor || '#f9fafb',
        border: component.props.showBorder ? '1px solid #e5e7eb' : 'none'
      }">
        <!-- Title -->
        <div v-if="component.props.title" class="p-3 border-b border-gray-200 bg-white">
          <h4 class="text-base font-medium text-gray-800">{{ component.props.title }}</h4>
        </div>

        <!-- Fields Display -->
        <div class="p-4">
          <div v-if="component.props.layout === 'grid'" class="grid grid-cols-2 gap-4">
            <div v-for="(field, index) in component.props.fields" :key="index" class="field-item">
              <dt class="text-sm font-medium text-gray-600">{{ field.label }}</dt>
              <dd class="text-sm text-gray-900 mt-1">{{ field.value }}</dd>
            </div>
          </div>

          <div v-else-if="component.props.layout === 'horizontal'" class="space-y-2">
            <div v-for="(field, index) in component.props.fields" :key="index"
              class="flex justify-between items-center">
              <dt class="text-sm font-medium text-gray-600">{{ field.label }}:</dt>
              <dd class="text-sm text-gray-900">{{ field.value }}</dd>
            </div>
          </div>

          <div v-else class="space-y-3">
            <div v-for="(field, index) in component.props.fields" :key="index" class="field-item">
              <dt class="text-sm font-medium text-gray-600">{{ field.label }}</dt>
              <dd class="text-sm text-gray-900 mt-1">{{ field.value }}</dd>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Divider -->
    <div v-else-if="component.type === 'divider'" class="py-4">
      <hr class="border-gray-200" />
    </div>

    <!-- Image Preview Component -->
    <div v-else-if="component.type === 'image-preview'" class="py-2">
      <div class="image-preview-container"
        :class="{ 'has-caption': component.props.showCaption && component.props.caption }">
        <label v-if="component.props.label" class="block text-sm font-medium text-gray-700 mb-1">
          {{ component.props.label }}
        </label>

        <div class="image-container relative" :class="{ 'cursor-zoom-in': component.props.showZoom }"
          @click="handleImageClick">
          <img :src="component.props.imageUrl" :alt="component.props.altText || 'Image preview'"
            class="max-w-full rounded" :style="{
              maxWidth: component.props.maxWidth || '100%',
              height: component.props.height || 'auto',
            }" />
          <div v-if="component.props.showZoom"
            class="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white p-1 rounded">
            <Icon name="material-symbols:zoom-in" class="w-4 h-4" />
          </div>
        </div>

        <div v-if="component.props.showCaption && component.props.caption"
          class="mt-1 text-sm text-gray-500 text-center">
          {{ component.props.caption }}
        </div>

        <div v-if="component.props.help" class="mt-1 text-xs text-gray-500">
          {{ component.props.help }}
        </div>
      </div>
    </div>

    <!-- Repeating Group Component -->
    <div v-else-if="component.type === 'repeating-group'" class="py-2">
      <fieldset class="border rounded-md p-4">
        <legend class="text-sm font-medium px-2">{{ component.props.label || 'Group' }}</legend>

        <div v-if="component.props.help" class="mb-3 text-xs text-gray-500">
          {{ component.props.help }}
        </div>

        <!-- Default group preview (in edit mode) -->
        <div v-if="isPreview" class="repeating-groups space-y-4">
          <div class="group-item border border-gray-200 rounded-md p-3 bg-gray-50">
            <div class="flex justify-between items-center mb-3">
              <h4 class="text-sm font-medium text-gray-700">Item 1</h4>
              <button type="button" class="text-red-500 hover:text-red-700 text-sm">
                {{ component.props.removeText || 'Remove' }}
              </button>
            </div>

            <div class="space-y-3">
              <template v-for="(field, fieldIndex) in component.props.fields" :key="fieldIndex">
                <FormKit :type="field.type" :label="field.label" :placeholder="field.placeholder"
                  :name="`${field.name}_1`" :options="field.options" disabled />
              </template>
            </div>
          </div>

          <button type="button"
            class="inline-flex items-center px-3 py-1.5 border border-blue-600 text-blue-600 bg-white hover:bg-blue-50 rounded text-sm">
            <Icon name="material-symbols:add-circle-outline" class="w-4 h-4 mr-1" />
            {{ component.props.buttonText || 'Add Item' }}
          </button>
        </div>

        <!-- Functional groups (in form view) -->
        <div v-else class="repeating-groups space-y-4">
          <div v-for="(group, groupIndex) in (previewFormData[component.props.name] || [])" :key="groupIndex"
            class="group-item border border-gray-200 rounded-md p-3 bg-gray-50">
            <div class="flex justify-between items-center mb-3">
              <h4 class="text-sm font-medium text-gray-700">Item {{ groupIndex + 1 }}</h4>
              <button v-if="(previewFormData[component.props.name]?.length || 0) > (component.props.minItems || 1)"
                type="button" class="text-red-500 hover:text-red-700 text-sm" @click="removeGroupItem(groupIndex)">
                {{ component.props.removeText || 'Remove' }}
              </button>
            </div>

            <div class="space-y-3">
              <template v-for="(field, fieldIndex) in component.props.fields" :key="fieldIndex">
                <FormKit :type="field.type" :label="field.label" :placeholder="field.placeholder"
                  :name="`${component.props.name}.${groupIndex}.${field.name}`" :options="field.options"
                  v-model="group[field.name]" />
              </template>
            </div>
          </div>

          <button v-if="(previewFormData[component.props.name]?.length || 0) < (component.props.maxItems || 10)"
            type="button"
            class="inline-flex items-center px-3 py-1.5 border border-blue-600 text-blue-600 bg-white hover:bg-blue-50 rounded text-sm"
            @click="addGroupItem">
            <Icon name="material-symbols:add-circle-outline" class="w-4 h-4 mr-1" />
            {{ component.props.buttonText || 'Add Item' }}
          </button>
        </div>
      </fieldset>
    </div>

    <!-- Dynamic List Component -->
    <div v-else-if="component.type === 'dynamic-list'" class="py-2">
      <div class="dynamic-list-container">
        <label v-if="component.props.label" class="block text-sm font-medium text-gray-700 mb-1">
          {{ component.props.label }}
          <span v-if="component.props.showItemCounter" class="text-xs text-gray-500 ml-2">
            ({{ (previewFormData[component.props.name] || []).length }}/{{ component.props.maxItems || 20 }})
          </span>
        </label>

        <div v-if="component.props.help" class="mb-3 text-xs text-gray-500">
          {{ component.props.help }}
        </div>

        <!-- Search Box (if enabled) -->
        <div v-if="component.props.enableSearch" class="mb-3">
          <div class="relative">
            <input type="text" v-model="searchQuery[component.props.name]" placeholder="Search items..."
              class="w-full px-3 py-2 pl-9 border border-gray-300 rounded-md text-sm" />
            <Icon name="material-symbols:search"
              class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>

        <!-- Bulk Operations Toolbar (if enabled) -->
        <div v-if="component.props.bulkOperations && (previewFormData[component.props.name] || []).length > 0"
          class="mb-3 flex items-center justify-between bg-gray-50 p-2 rounded">
          <div class="flex items-center space-x-2">
            <input type="checkbox" :checked="isAllSelected(component.props.name)"
              @change="toggleSelectAll(component.props.name)" class="h-4 w-4 rounded border-gray-300" />
            <span class="text-xs text-gray-600">
              {{ selectedItems[component.props.name]?.length || 0 }} selected
            </span>
          </div>
          <div class="flex space-x-2">
            <button v-if="(selectedItems[component.props.name]?.length || 0) > 0"
              @click="deleteSelectedItems(component.props.name)"
              class="text-xs text-red-600 hover:text-red-800 flex items-center">
              <Icon name="material-symbols:delete-outline" class="w-4 h-4 mr-1" />
              Delete Selected
            </button>
            <button v-if="component.props.importEnabled" @click="showImportModal(component.props.name)"
              class="text-xs text-blue-600 hover:text-blue-800 flex items-center">
              <Icon name="material-symbols:upload-file-outline" class="w-4 h-4 mr-1" />
              Import
            </button>
          </div>
        </div>

        <div class="space-y-2">
          <div v-if="isPreview" class="list-items space-y-2">
            <div v-for="(item, index) in component.props.defaultItems" :key="index" class="flex items-center">
              <input :type="component.props.itemType || 'text'" :value="item" :placeholder="component.props.placeholder"
                disabled
                class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-700 disabled:bg-gray-50" />
              <div v-if="component.props.enableSorting" class="ml-2 cursor-move text-gray-400">
                <Icon name="material-symbols:drag-indicator" class="w-5 h-5" />
              </div>
              <button type="button" class="ml-2 text-red-500 hover:text-red-700">
                <Icon name="material-symbols:delete-outline" class="w-5 h-5" />
              </button>
            </div>

            <!-- Add button for preview -->
            <button type="button"
              class="inline-flex items-center px-3 py-1.5 border border-blue-600 text-blue-600 bg-white hover:bg-blue-50 rounded text-sm">
              <Icon name="material-symbols:add-circle-outline" class="w-4 h-4 mr-1" />
              {{ component.props.buttonText || 'Add Item' }}
            </button>
          </div>

          <div v-else class="list-items space-y-2">
            <div v-for="(item, index) in getFilteredItems(component.props.name)" :key="index"
              class="flex items-center group">
              <input v-if="component.props.bulkOperations" type="checkbox"
                :checked="isItemSelected(component.props.name, index)"
                @change="toggleItemSelection(component.props.name, index)"
                class="mr-2 h-4 w-4 rounded border-gray-300" />
              <input :type="component.props.itemType || 'text'" v-model="previewFormData[component.props.name][index]"
                :placeholder="component.props.placeholder"
                :class="getItemInputClasses(component.props.name, index, item)"
                @blur="validateItem(component.props.name, index, item)"
                @input="handleItemInput(component.props.name, index, $event.target.value)" />
              <div v-if="component.props.enableSorting"
                class="ml-2 cursor-move text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <Icon name="material-symbols:drag-indicator" class="w-5 h-5" />
              </div>
              <button v-if="(previewFormData[component.props.name]?.length || 0) > (component.props.minItems || 0)"
                type="button" class="ml-2 text-red-500 hover:text-red-700" @click="removeListItem(index)">
                <Icon name="material-symbols:delete-outline" class="w-5 h-5" />
              </button>
            </div>

            <!-- Validation Messages -->
            <div v-if="validationErrors[component.props.name]" class="text-xs text-red-600 mt-1">
              {{ validationErrors[component.props.name] }}
            </div>

            <button v-if="(previewFormData[component.props.name]?.length || 0) < (component.props.maxItems || 20)"
              type="button"
              class="inline-flex items-center px-3 py-1.5 border border-blue-600 text-blue-600 bg-white hover:bg-blue-50 rounded text-sm"
              @click="addListItem">
              <Icon name="material-symbols:add-circle-outline" class="w-4 h-4 mr-1" />
              {{ component.props.buttonText || 'Add Item' }}
            </button>

            <!-- Export Button (if enabled) -->
            <div v-if="component.props.exportFormat && (previewFormData[component.props.name] || []).length > 0"
              class="mt-2">
              <button @click="exportItems(component.props.name, component.props.exportFormat)"
                class="text-xs text-green-600 hover:text-green-800 flex items-center">
                <Icon name="material-symbols:download" class="w-4 h-4 mr-1" />
                Export as {{ component.props.exportFormat.toUpperCase() }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Button Component -->
    <div v-else-if="component.type === 'button'" class="py-2">
      <label v-if="component.props.label" class="block text-sm font-medium text-gray-700 mb-2">
        {{ component.props.label }}
      </label>

      <RsButton :type="component.props.buttonType || 'button'" :variant="component.props.variant || 'primary'"
        :size="component.props.size || 'md'" :disabled="component.props.disabled || false" @click="handleButtonClick"
        class="button-component">
        {{ component.props.label || 'Button' }}
      </RsButton>

      <div v-if="component.props.help" class="mt-1 text-xs text-gray-500">
        {{ component.props.help }}
      </div>
    </div>



    <!-- Unknown Component Type Fallback -->
    <div v-else class="p-4 border border-dashed border-gray-300 rounded">
      <div class="text-gray-500">Unknown component type: {{ component.type }}</div>
    </div>
  </div>
</template>

<script setup>
import { useNuxtApp } from '#app';
import { useFormBuilderStore } from '~/stores/formBuilder';

const props = defineProps({
  component: {
    type: Object,
    required: true
  },
  isPreview: {
    type: Boolean,
    default: false
  }
});

// Get access to the form builder store
const formStore = useFormBuilderStore();
const previewFormData = computed(() => formStore.previewFormData || {});

// Enhanced dynamic list functionality
const searchQuery = ref({});
const selectedItems = ref({});
const validationErrors = ref({});

// Initialize data for components
onMounted(() => {
  // Initialize search and selection data for dynamic lists
  if (props.component.type === 'dynamic-list') {
    const listName = props.component.props.name;
    if (listName) {
      searchQuery.value[listName] = '';
      selectedItems.value[listName] = [];
      validationErrors.value[listName] = '';
      
      // Initialize form data with default items if they exist and form data is empty
      const currentFormData = formStore.previewFormData[listName];
      const defaultItems = props.component.props.defaultItems;
      
      if ((!currentFormData || currentFormData.length === 0) && defaultItems && defaultItems.length > 0) {
        const updatedData = { ...formStore.previewFormData, [listName]: [...defaultItems] };
        formStore.updatePreviewFormData(updatedData);
      }
    }
  }
});

// Watch for changes to component props, especially defaultItems
watch(() => props.component.props.defaultItems, (newDefaultItems, oldDefaultItems) => {
  if (props.component.type === 'dynamic-list') {
    const listName = props.component.props.name;
    if (!listName) return;
    
    // Always update when defaultItems change, regardless of current form data
    const items = newDefaultItems || [];
    
    const updatedData = { ...formStore.previewFormData, [listName]: [...items] };
    formStore.updatePreviewFormData(updatedData);
  }
}, { deep: true, immediate: true });

// Repeating group and dynamic list functionality
const addGroupItem = () => {
  if (props.isPreview) return;

  const groupName = props.component.props.name;
  if (!groupName) return;

  // Get current groups or initialize empty array
  const currentGroups = formStore.previewFormData[groupName] || [];

  // Create a new empty group
  const newGroup = {};

  // Add fields from configuration
  if (props.component.props.fields) {
    props.component.props.fields.forEach(field => {
      newGroup[field.name] = '';
    });
  }

  // Add the new group to the list
  currentGroups.push(newGroup);

  // Update the form data
  const updatedData = { ...formStore.previewFormData, [groupName]: currentGroups };
  formStore.updatePreviewFormData(updatedData);
};

const removeGroupItem = (index) => {
  if (props.isPreview) return;

  const groupName = props.component.props.name;
  if (!groupName) return;

  // Get current groups
  const currentGroups = [...(formStore.previewFormData[groupName] || [])];

  // Remove the group at the specified index
  currentGroups.splice(index, 1);

  // Update the form data
  const updatedData = { ...formStore.previewFormData, [groupName]: currentGroups };
  formStore.updatePreviewFormData(updatedData);
};

const addListItem = () => {
  if (props.isPreview) return;

  const listName = props.component.props.name;
  if (!listName) return;

  // Get current items or initialize empty array
  const currentItems = [...(formStore.previewFormData[listName] || [])];

  // Add an empty item
  currentItems.push('');

  // Update the form data
  const updatedData = { ...formStore.previewFormData, [listName]: currentItems };
  formStore.updatePreviewFormData(updatedData);
};

const removeListItem = (index) => {
  if (props.isPreview) return;

  const listName = props.component.props.name;
  if (!listName) return;

  // Get current items
  const currentItems = [...(formStore.previewFormData[listName] || [])];

  // Remove the item at the specified index
  currentItems.splice(index, 1);

  // Update the form data
  const updatedData = { ...formStore.previewFormData, [listName]: currentItems };
  formStore.updatePreviewFormData(updatedData);
};

// Enhanced Dynamic List Methods

// Validate individual item based on component settings
const validateItem = (listName, index, value) => {
  const component = props.component;
  if (!component.props.itemValidation) return true;

  // Simple validation for now - can be enhanced with more complex rules
  const rules = component.props.itemValidation.split('|');

  for (const rule of rules) {
    if (rule === 'required' && (!value || value.trim() === '')) {
      validationErrors.value[listName] = `Item ${index + 1} is required`;
      return false;
    }

    if (rule.startsWith('min:')) {
      const minLength = parseInt(rule.split(':')[1]);
      if (value.length < minLength) {
        validationErrors.value[listName] = `Item ${index + 1} must be at least ${minLength} characters`;
        return false;
      }
    }

    if (rule.startsWith('max:')) {
      const maxLength = parseInt(rule.split(':')[1]);
      if (value.length > maxLength) {
        validationErrors.value[listName] = `Item ${index + 1} cannot exceed ${maxLength} characters`;
        return false;
      }
    }

    if (rule === 'email' && component.props.itemType === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        validationErrors.value[listName] = `Item ${index + 1} must be a valid email address`;
        return false;
      }
    }

    if (rule === 'url' && component.props.itemType === 'url') {
      try {
        new URL(value);
      } catch {
        validationErrors.value[listName] = `Item ${index + 1} must be a valid URL`;
        return false;
      }
    }
  }

  // Clear validation error if validation passes
  validationErrors.value[listName] = '';
  return true;
};

// Check for duplicate items
const checkDuplicates = (listName, newValue, currentIndex) => {
  if (props.component.props.allowDuplicates) return true;

  const currentItems = formStore.previewFormData[listName] || [];
  const duplicateIndex = currentItems.findIndex((item, index) =>
    index !== currentIndex && item.toLowerCase() === newValue.toLowerCase()
  );

  if (duplicateIndex !== -1) {
    validationErrors.value[listName] = `Duplicate item detected. Item "${newValue}" already exists.`;
    return false;
  }

  validationErrors.value[listName] = '';
  return true;
};

// Handle item input with validation
const handleItemInput = (listName, index, value) => {
  // Check for duplicates if not allowed
  if (!checkDuplicates(listName, value, index)) {
    return;
  }

  // Validate the item
  validateItem(listName, index, value);
};

// Get CSS classes for item input based on validation state
const getItemInputClasses = (listName, index, value) => {
  const baseClasses = "block w-full border rounded-md shadow-sm py-2 px-3 text-gray-700";
  const hasError = validationErrors.value[listName];

  if (hasError) {
    return `${baseClasses} border-red-300 focus:border-red-500`;
  }

  return `${baseClasses} border-gray-300 focus:border-blue-500 focus:ring-blue-500`;
};

// Filter items based on search query
const getFilteredItems = (listName) => {
  const items = formStore.previewFormData[listName] || [];
  const query = searchQuery.value[listName];

  if (!query || !props.component.props.enableSearch) {
    return items;
  }

  return items.filter(item =>
    item.toLowerCase().includes(query.toLowerCase())
  );
};

// Bulk operations
const isItemSelected = (listName, index) => {
  return selectedItems.value[listName]?.includes(index) || false;
};

const toggleItemSelection = (listName, index) => {
  if (!selectedItems.value[listName]) {
    selectedItems.value[listName] = [];
  }

  const selectedList = selectedItems.value[listName];
  const selectedIndex = selectedList.indexOf(index);

  if (selectedIndex > -1) {
    selectedList.splice(selectedIndex, 1);
  } else {
    selectedList.push(index);
  }
};

const isAllSelected = (listName) => {
  const items = formStore.previewFormData[listName] || [];
  const selected = selectedItems.value[listName] || [];
  return items.length > 0 && selected.length === items.length;
};

const toggleSelectAll = (listName) => {
  const items = formStore.previewFormData[listName] || [];

  if (isAllSelected(listName)) {
    selectedItems.value[listName] = [];
  } else {
    selectedItems.value[listName] = items.map((_, index) => index);
  }
};

const deleteSelectedItems = (listName) => {
  if (!props.component.props.confirmDelete || confirm('Are you sure you want to delete the selected items?')) {
    const currentItems = [...(formStore.previewFormData[listName] || [])];
    const selected = selectedItems.value[listName] || [];

    // Sort indices in descending order to avoid index shifting issues
    selected.sort((a, b) => b - a);

    // Remove selected items
    selected.forEach(index => {
      currentItems.splice(index, 1);
    });

    // Update form data
    const updatedData = { ...formStore.previewFormData, [listName]: currentItems };
    formStore.updatePreviewFormData(updatedData);

    // Clear selection
    selectedItems.value[listName] = [];
  }
};

// Import/Export functionality
const exportItems = (listName, format) => {
  const items = formStore.previewFormData[listName] || [];
  let content = '';
  let filename = `${listName}_items`;
  let mimeType = 'text/plain';

  switch (format) {
    case 'json':
      content = JSON.stringify(items, null, 2);
      filename += '.json';
      mimeType = 'application/json';
      break;
    case 'csv':
      content = items.map(item => `"${item}"`).join('\n');
      filename += '.csv';
      mimeType = 'text/csv';
      break;
    default: // txt
      content = items.join('\n');
      filename += '.txt';
      break;
  }

  // Create and trigger download
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const showImportModal = (listName) => {
  // This would open a modal for importing items
  // For now, let's use a simple file input
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.txt,.csv,.json';
  input.onchange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        let importedItems = [];

        try {
          if (file.name.endsWith('.json')) {
            importedItems = JSON.parse(content);
          } else if (file.name.endsWith('.csv')) {
            importedItems = content.split('\n').map(line => line.replace(/"/g, '').trim()).filter(Boolean);
          } else {
            importedItems = content.split('\n').filter(Boolean);
          }

          // Add imported items to current list
          const currentItems = [...(formStore.previewFormData[listName] || [])];
          const newItems = [...currentItems, ...importedItems];

          // Respect max items limit
          const maxItems = props.component.props.maxItems || 20;
          if (newItems.length > maxItems) {
            newItems.splice(maxItems);
            alert(`Import limited to ${maxItems} items total.`);
          }

          // Update form data
          const updatedData = { ...formStore.previewFormData, [listName]: newItems };
          formStore.updatePreviewFormData(updatedData);

        } catch (error) {
          alert('Error importing file. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };
  input.click();
};

// Handle button click
const handleButtonClick = () => {
  if (props.isPreview) return;

  // Execute custom onClick code if provided
  if (props.component.props.onClick) {
    try {
      // Create a safe execution context
      const context = {
        formData: formStore.previewFormData,
        componentName: props.component.props.name,
        buttonLabel: props.component.props.label
      };

      // Execute the custom code
      const func = new Function('context', props.component.props.onClick);
      func(context);
    } catch (error) {
      console.error('Error executing button onClick:', error);
    }
  }

  // Default behavior - log the button click
};

// Check if the component is a standard FormKit input type (excluding specialized components)
const isStandardInputType = computed(() => {
  const standardInputTypes = [
    'text', 'textarea', 'number', 'email', 'password',
    'date', 'time', 'datetime-local', 'url', 'tel',
    'select', 'radio', 'file', 'range', 'color', 'hidden'
  ];

  return standardInputTypes.includes(props.component.type);
});

// Check if the component is any FormKit input type (including checkbox and custom types)
const isInputType = computed(() => {
  const inputTypes = [
    'text', 'textarea', 'number', 'email', 'password',
    'date', 'time', 'datetime-local', 'url', 'tel',
    'select', 'checkbox', 'radio', 'file', 'range',
    'color', 'hidden', 'mask', 'otp', 'dropzone', 'switch'
  ];

  return inputTypes.includes(props.component.type);
});

// Handle image click for image preview component
const handleImageClick = (event) => {
  // Only do something if zoom is enabled
  if (!props.component.props.showZoom) return;

  // Get the image URL
  const imageUrl = props.component.props.imageUrl;
  if (!imageUrl) return;

  // Create a lightbox effect to view the image
  const lightbox = document.createElement('div');
  lightbox.style.position = 'fixed';
  lightbox.style.top = '0';
  lightbox.style.left = '0';
  lightbox.style.width = '100%';
  lightbox.style.height = '100%';
  lightbox.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
  lightbox.style.display = 'flex';
  lightbox.style.alignItems = 'center';
  lightbox.style.justifyContent = 'center';
  lightbox.style.zIndex = '1000';
  lightbox.style.cursor = 'zoom-out';

  // Create the image element
  const img = document.createElement('img');
  img.src = imageUrl;
  img.style.maxWidth = '90%';
  img.style.maxHeight = '90%';
  img.style.objectFit = 'contain';

  // Add close functionality
  lightbox.onclick = () => {
    document.body.removeChild(lightbox);
  };

  // Prevent image click from closing the lightbox
  img.onclick = (e) => {
    e.stopPropagation();
  };

  // Add to DOM
  lightbox.appendChild(img);
  document.body.appendChild(lightbox);
};

// Compute style based on grid properties
const componentStyle = computed(() => {
  // Only apply grid styles in the non-preview mode (actual form)
  if (props.isPreview) {
    return {}; // Styling is handled by parent in canvas mode
  }

  // Apply grid column in preview mode
  const gridColumn = props.component.props.gridColumn || 'span 12';

  return {
    gridColumn: gridColumn,
    width: '100%', // Always use 100% within the grid cell
    boxSizing: 'border-box'
  };
});
</script>

<style scoped>
.component-preview {
  width: 100%;
}

:deep(.formkit-wrapper) {
  margin-bottom: 0.5rem !important;
}

:deep(.formkit-options) {
  gap: 0.25rem !important;
}

/* Improve visibility of disabled inputs in the canvas view */
:deep(.canvas-component.formkit-disabled),
:deep(.canvas-component.formkit-disabled input),
:deep(.canvas-component.formkit-disabled select),
:deep(.canvas-component.formkit-disabled textarea) {
  opacity: 0.8 !important;
  pointer-events: none;
}

/* Image Preview Component */
.image-preview-container {
  display: flex;
  flex-direction: column;
}

.image-container {
  display: flex;
  justify-content: center;
  border-radius: 0.375rem;
  overflow: hidden;
  max-width: 100%;
}

.image-container img {
  display: block;
  border-radius: 0.375rem;
  max-width: 100%;
}

.has-caption {
  padding-bottom: 0.5rem;
}

/* Repeating Group Component */
.repeating-groups {
  width: 100%;
}

.group-item {
  transition: all 0.2s ease-in-out;
}

.group-item:hover {
  border-color: #93c5fd;
}

/* Dynamic List Component */
.dynamic-list-container {
  width: 100%;
}

.list-items {
  width: 100%;
}
</style>