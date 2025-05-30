<template>
  <div class="flex flex-col h-screen bg-gray-50">
    <!-- Header Bar -->
    <header
      class="bg-gray-800 px-4 py-4 flex items-center justify-between text-white shadow-md"
    >
      <!-- Left section - Logo and navigation -->
      <div class="flex items-center gap-3">
        <Icon
          @click="navigateTo('/', { external: true })"
          name="ph:arrow-circle-left-duotone"
          class="cursor-pointer w-6 h-6"
        />
        <img
          src="@/assets/img/logo/logo-word-white.svg"
          alt="Corrad Logo"
          class="h-7"
        />
        <div v-if="isPreview" class="bg-blue-500 text-white text-xs px-2 py-1 rounded-full ml-2">
          Preview Mode
        </div>
      </div>

      <!-- Middle section - Form name -->
      <div class="flex-1 flex justify-center items-center mx-4">
        <FormKit
          v-if="!isPreview"
          type="text"
          name="formName"
          placeholder="Form Name"
          v-model="formName"
          validation="required"
          validation-visibility="live"
          :validation-messages="{ required: 'Please enter a form name' }"
          class="form-name-input max-w-md"
          :classes="{
            outer: 'mb-0 w-full',
          }"
        />
        <div v-else class="text-lg font-medium">{{ formName }}</div>
      </div>

      <!-- Right section - Actions -->
      <div class="flex items-center">
        <!-- Primary actions -->
        <div class="flex items-center mr-2 border-r border-gray-600 pr-2">
          <RsButton v-if="!isPreview" @click="handleSave" variant="primary" size="sm" class="mr-2">
          <Icon name="material-symbols:save" class="mr-1" />
            Save
        </RsButton>

          <RsButton @click="togglePreview" :variant="isPreview ? 'primary' : 'secondary'" size="sm">
            <Icon :name="isPreview ? 'material-symbols:edit' : 'material-symbols:preview'" class="mr-1" />
            {{ isPreview ? 'Edit' : 'Preview' }}
        </RsButton>
        </div>
        
        <!-- Templates button -->
        <div v-if="!isPreview" class="mr-2 border-r border-gray-600 pr-2">
          <RsButton @click="showTemplatesModal = true" variant="secondary" size="sm">
            <Icon name="material-symbols:description-outline" class="mr-1" />
            Templates
        </RsButton>
        </div>
        
        <!-- Secondary actions - only in edit mode -->
        <div v-if="!isPreview" class="flex items-center">
          <div class="dropdown relative">
            <RsButton @click="showDropdown = !showDropdown" variant="tertiary" size="sm" class="flex items-center">
              <Icon name="material-symbols:more-vert" class="w-5 h-5" />
            </RsButton>
            
            <div v-if="showDropdown" class="dropdown-menu absolute right-0 mt-2 bg-white rounded shadow-lg py-1 z-10 w-48 text-gray-800">
              <button @click="showFormSettings = true; showDropdown = false" class="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center">
                <Icon name="material-symbols:code" class="mr-2 w-4 h-4" />
                <span>Form Settings</span>
              </button>
              <button @click="navigateToManage(); showDropdown = false" class="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center">
                <Icon name="material-symbols:settings" class="mr-2 w-4 h-4" />
                <span>Manage Forms</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content Area -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Left Panel - Components Sidebar -->
      <div
        v-if="!isPreview"
        class="w-64 bg-white border-r border-gray-200 flex flex-col overflow-hidden"
      >
        <div class="border-b border-gray-200">
          <div class="flex">
            <button
              @click="leftSidebarTab = 'components'"
              class="px-4 py-3 text-sm font-medium flex-1"
              :class="{
                'text-blue-600 border-b-2 border-blue-600': leftSidebarTab === 'components',
                'text-gray-500 hover:text-gray-700': leftSidebarTab !== 'components'
              }"
            >
              <div class="flex items-center justify-center">
                <Icon name="material-symbols:category" class="w-4 h-4 mr-1.5" />
                Components
              </div>
            </button>
            <button
              @click="leftSidebarTab = 'history'"
              class="px-4 py-3 text-sm font-medium flex-1"
              :class="{
                'text-blue-600 border-b-2 border-blue-600': leftSidebarTab === 'history',
                'text-gray-500 hover:text-gray-700': leftSidebarTab !== 'history'
              }"
            >
              <div class="flex items-center justify-center">
                <Icon name="material-symbols:history" class="w-4 h-4 mr-1.5" />
                History
              </div>
            </button>
          </div>
        </div>
        
        <!-- Components Tab Content -->
        <div v-if="leftSidebarTab === 'components'" class="overflow-y-auto flex-1">
          <div
            class="p-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center"
          >
            <h2 class="text-sm font-medium text-gray-700">Components</h2>
            <div class="relative">
              <button class="px-2 py-1 text-xs text-gray-500 hover:text-gray-700">
                <Icon name="material-symbols:refresh" class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <FormBuilderComponents @add-component="handleAddComponent" />
        </div>
        
        <!-- History Tab Content -->
        <div v-else-if="leftSidebarTab === 'history'" class="overflow-y-auto flex-1">
          <div
            class="p-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center"
          >
            <h2 class="text-sm font-medium text-gray-700">History</h2>
            <div class="flex items-center space-x-1">
              <button 
                @click="formStore.undo()" 
                class="p-1 text-xs rounded text-gray-500 hover:text-gray-700 disabled:opacity-50"
                :disabled="!formStore.canUndo"
                title="Undo"
              >
                <Icon name="material-symbols:undo" class="w-3.5 h-3.5" />
              </button>
              <button 
                @click="formStore.redo()" 
                class="p-1 text-xs rounded text-gray-500 hover:text-gray-700 disabled:opacity-50"
                :disabled="formStore.currentHistoryIndex >= formStore.actionHistory.length - 1"
                title="Redo"
              >
                <Icon name="material-symbols:redo" class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <FormBuilderHistory />
        </div>
      </div>

      <!-- Middle Panel - Form Canvas -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <div
          class="py-2 px-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center h-12"
        >
          <h2 class="text-sm font-medium text-gray-700">{{ isPreview ? 'Form Preview' : 'Form Canvas' }}</h2>
          <div class="flex items-center gap-2">
            <span class="text-xs text-gray-500">
              {{ isPreview ? 'Preview mode - Form is interactive' : 'Drag components to build your form' }}
            </span>
          </div>
        </div>
        <div class="flex-1 overflow-auto p-6">
          <div
            id="form-drop-zone"
            class="border-2 border-dashed border-gray-300 bg-white rounded-md min-h-[calc(100vh-170px)] p-4"
            :class="{ 
              'border-blue-400 bg-blue-50': formStore.isDraggingOver && !isPreview,
              'border-solid': isPreview,
              'preview-mode': isPreview
            }"
            @dragover="!isPreview && handleDragOver($event)"
            @dragleave="!isPreview && handleDragLeave($event)"
            @drop="!isPreview && handleDrop($event)"
            @dragenter="!isPreview && handleDragEnter($event)"
          >
            <!-- Preview Mode -->
            <div v-if="isPreview" class="form-container">
              <FormScriptEngine
                ref="formScriptEngine"
                :form-data="previewFormData"
                :custom-script="formStore.formCustomScript"
                :custom-css="formStore.formCustomCSS"
                :form-events="formStore.formEvents"
                :script-mode="formStore.scriptMode"
                @field-change="handleScriptFieldChange"
                @field-validate="handleScriptFieldValidate"
              />
              
              <ConditionalLogicEngine
                ref="conditionalLogicEngine"
                :form-components="formStore.formComponents"
                :form-data="previewFormData"
                @script-generated="handleConditionalLogicGenerated"
              />
              
              <FormKit 
                ref="previewForm"
                type="form" 
                @submit="handlePreviewSubmit" 
                :actions="false" 
                v-model="previewFormData"
              >
                <div class="grid-preview-container">
                  <template
                    v-for="(component, index) in formStore.formComponents"
                    :key="index"
                  >
                    <component-preview :component="component" :is-preview="false" />
                  </template>
                </div>
                
                <!-- Only show submit button if no submit button components exist in the form -->
                <FormKit 
                  v-if="!formStore.formComponents.some(comp => comp.type === 'button' && comp.props.buttonType === 'submit')"
                  type="submit" 
                  label="Submit" 
                  class="form-submit mt-6" 
                />
              </FormKit>
            </div>

            <!-- Edit Mode -->
            <div v-else class="relative">
              <FormBuilderCanvas
                :form-components="formStore.formComponents"
                @select-component="handleSelectComponent"
                @move-component="handleMoveComponent"
                @delete-component="handleDeleteComponent"
                @update-component="handleUpdateComponent"
                @optimize-layout="handleOptimizeLayout"
              />
              
              <!-- Instruction Overlay when no component is selected -->
              <div 
                v-if="!isPreview && formStore.formComponents.length > 0 && !formStore.selectedComponent"
                class="absolute top-4 left-1/2 transform -translate-x-1/2 z-30"
              >
                <div class="instruction-tooltip">
                  <div class="flex items-center space-x-2">
                    <Icon name="heroicons:cursor-arrow-rays" class="w-5 h-5 text-blue-600" />
                    <span class="text-sm font-medium text-gray-700">Click any field to configure its settings</span>
                    <Icon name="heroicons:cog-6-tooth" class="w-4 h-4 text-gray-500" />
                  </div>
                  <div class="instruction-arrow"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Panel - Field Settings (Collapsible) -->
      <div
        v-if="!isPreview"
        class="field-settings-panel"
        :class="{
          'panel-expanded': showFieldSettingsPanel,
          'panel-collapsed': !showFieldSettingsPanel
        }"
      >

        <!-- Expanded Panel Content -->
        <div 
          v-if="showFieldSettingsPanel"
          class="panel-content"
        >
          <!-- Panel Header with Toggle -->
          <div class="panel-header">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <Icon name="heroicons:cog-6-tooth" class="w-5 h-5 text-gray-600" />
                <h3 class="text-sm font-semibold text-gray-800">Field Settings</h3>
              </div>
              <button
                @click="toggleFieldSettingsPanel"
                class="panel-header-toggle-btn"
                title="Collapse Settings Panel"
              >
                <Icon name="heroicons:chevron-right" class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Selected Component Info or Empty State -->
          <div class="panel-body">
            <div v-if="!formStore.selectedComponent" class="empty-state">
              <div class="text-center py-8">
                <Icon name="heroicons:cursor-arrow-rays" class="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h4 class="text-sm font-medium text-gray-600 mb-2">No Field Selected</h4>
                <p class="text-xs text-gray-500 leading-relaxed">
                  Click on any form field in the canvas to configure its settings here.
                </p>
              </div>
            </div>

            <div v-else class="component-settings">
              <!-- Component Header -->
              <div class="component-header">
                <div class="flex items-center space-x-3">
                  <div class="component-icon">
                    <Icon :name="getComponentIcon(formStore.selectedComponent.type)" class="w-6 h-6 text-blue-600" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <h4 class="text-sm font-semibold text-gray-900 truncate">
                      {{ getComponentTypeName(formStore.selectedComponent.type) }}
                    </h4>
                    <p class="text-xs text-gray-500 truncate">
                      {{ formStore.selectedComponent.props.label || formStore.selectedComponent.props.name || 'Untitled' }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Quick Actions -->
              <div class="quick-actions">
                <button
                  @click="openFullSettingsModal"
                  class="action-btn primary"
                  title="Open full settings modal"
                >
                  <Icon name="heroicons:adjustments-horizontal" class="w-4 h-4 mr-1.5" />
                  Full Settings
                </button>
                <button
                  @click="duplicateComponent"
                  class="action-btn secondary"
                  title="Duplicate this component"
                >
                  <Icon name="heroicons:document-duplicate" class="w-4 h-4 mr-1.5" />
                  Duplicate
                </button>
                <button
                  @click="deleteComponent"
                  class="action-btn danger"
                  title="Delete this component"
                >
                  <Icon name="heroicons:trash" class="w-4 h-4 mr-1.5" />
                  Delete
                </button>
              </div>

              <!-- Inline Quick Settings -->
              <div class="quick-settings">
                <h5 class="settings-section-title">Quick Settings</h5>
                
                <!-- Label Field -->
                <div v-if="showQuickField('label')" class="setting-item">
                  <label class="setting-label">
                    {{ formStore.selectedComponent.type === 'button' ? 'Button Text' : 'Field Label' }}
                  </label>
                  <FormKit
                    type="text"
                    v-model="quickSettings.label"
                    @input="updateQuickSetting('label', $event)"
                    :placeholder="getPlaceholder('label')"
                    :classes="{ outer: 'mb-0', input: 'text-sm' }"
                  />
                </div>

                <!-- Name Field -->
                <div v-if="showQuickField('name')" class="setting-item">
                  <label class="setting-label">Field Name</label>
                  <FormKit
                    type="text"
                    v-model="quickSettings.name"
                    @input="updateQuickSetting('name', $event)"
                    :placeholder="getPlaceholder('name')"
                    :classes="{ outer: 'mb-0', input: 'text-sm' }"
                  />
                </div>

                <!-- Width Setting -->
                <div v-if="showQuickField('width')" class="setting-item">
                  <label class="setting-label">Field Width</label>
                  <div class="width-selector-compact">
                    <button
                      v-for="option in compactWidthOptions"
                      :key="option.value"
                      @click="updateQuickSetting('width', option.value, option.gridColumns)"
                      class="width-btn"
                      :class="{ 'active': getComponentWidthPercent() === option.value }"
                      :title="option.description"
                    >
                      {{ option.name }}
                    </button>
                  </div>
                </div>

                <!-- Required Toggle -->
                <div v-if="showQuickField('required')" class="setting-item">
                  <label class="setting-toggle">
                    <input 
                      type="checkbox" 
                      v-model="quickSettings.required"
                      @change="updateQuickValidation('required', $event.target.checked)"
                      class="toggle-input"
                    />
                    <span class="toggle-slider"></span>
                    <span class="toggle-label">Required Field</span>
                  </label>
                </div>

                <!-- Placeholder -->
                <div v-if="showQuickField('placeholder')" class="setting-item">
                  <label class="setting-label">Placeholder Text</label>
                  <FormKit
                    type="text"
                    v-model="quickSettings.placeholder"
                    @input="updateQuickSetting('placeholder', $event)"
                    :placeholder="getPlaceholder('placeholder')"
                    :classes="{ outer: 'mb-0', input: 'text-sm' }"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Collapsed State -->
        <div 
          v-else
          class="collapsed-info"
        >
          <!-- Collapsed Header with Toggle -->
          <div class="collapsed-header">
            <button
              @click="toggleFieldSettingsPanel"
              class="collapsed-toggle-btn"
              title="Expand Settings Panel"
            >
              <Icon name="heroicons:chevron-left" class="w-4 h-4" />
            </button>
          </div>
          
          <!-- Collapsed Content -->
          <div class="collapsed-content">
            <!-- Selected Component Info -->
            <div v-if="formStore.selectedComponent" class="selected-component-collapsed">
              <div class="component-icon-collapsed">
                <Icon :name="getComponentIcon(formStore.selectedComponent.type)" class="w-4 h-4 text-blue-600" />
              </div>
              <div class="component-type-badge">
                {{ getComponentTypeShort(formStore.selectedComponent.type) }}
              </div>
            </div>
            
            <!-- No Selection State -->
            <div v-else class="no-selection-collapsed">
              <Icon name="heroicons:cursor-arrow-rays" class="w-4 h-4 text-gray-400 mb-2" />
              <div class="text-xs text-gray-400 text-center writing-mode-vertical">
                Select field
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    

    <!-- Form Settings Modal -->
    <RsModal v-model="showFormSettings" title="Form Settings & Scripts" size="xl" position="center">
      <div>
        <RsTab :tabs="settingsTabs" v-model="activeSettingsTab">
          <!-- Form Info Tab -->
          <template #info>
            <div class="p-4 space-y-4">
              <FormKit
                type="text"
                label="Form Name"
                v-model="formStore.formName"
                help="Name of your form"
                validation="required"
              />
              
              <FormKit
                type="textarea"
                label="Form Description"
                v-model="formStore.formDescription"
                help="Brief description of what this form is for"
                rows="3"
              />
            </div>
            </template>

          <!-- Custom JavaScript Tab -->
          <template #javascript>
            <div class="p-4">
              <div class="mb-4">
                <h3 class="text-lg font-medium mb-2">Custom JavaScript</h3>
                <p class="text-sm text-gray-600 mb-4">
                  Write custom JavaScript to add dynamic behavior to your form. Scripts run securely in a sandboxed environment with access to form fields and utility functions.
                </p>
                
                <!-- Helper Functions Reference -->
                <div class="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
                  <details>
                    <summary class="text-sm font-medium text-blue-800 cursor-pointer">📚 Core Functions</summary>
                    <div class="mt-2 text-xs text-blue-700 space-y-1">
                      <div><code>getField('name')</code> - Get field value</div>
                      <div><code>setField('name', value)</code> - Set field value and trigger events</div>
                      <div><code>hideField('name')</code> - Hide a field</div>
                      <div><code>showField('name')</code> - Show a field</div>
                      <div><code>disableField('name')</code> - Disable a field</div>
                      <div><code>enableField('name')</code> - Enable a field</div>
                      <div><code>validateField('name')</code> - Trigger field validation</div>
                      <div><code>getAllFieldValues()</code> - Get all form values as object</div>
                      <div><code>onFieldChange(['field1', 'field2'], callback)</code> - Listen for field changes</div>
                    </div>
                  </details>
                </div>
                
                <!-- User Interface Functions -->
                <div class="mb-4 p-3 bg-green-50 rounded border border-green-200">
                  <details>
                    <summary class="text-sm font-medium text-green-800 cursor-pointer">🎨 UI & Notifications</summary>
                    <div class="mt-2 text-xs text-green-700 space-y-1">
                      <div><code>showSuccess('message')</code> - Display success notification</div>
                      <div><code>showError('message')</code> - Display error notification</div>
                      <div><code>showInfo('message')</code> - Display info notification</div>
                      <div><code>querySelector('selector')</code> - Safe DOM querying within form</div>
                    </div>
                  </details>
                </div>
                
                <!-- Utility Functions -->
                <div class="mb-4 p-3 bg-purple-50 rounded border border-purple-200">
                  <details>
                    <summary class="text-sm font-medium text-purple-800 cursor-pointer">🛠️ Utilities</summary>
                    <div class="mt-2 text-xs text-purple-700 space-y-1">
                      <div><code>Math.*</code> - Mathematical functions (Math.round, Math.max, etc.)</div>
                      <div><code>Date</code> - Date object for date/time operations</div>
                      <div><code>Number()</code>, <code>String()</code>, <code>Array</code> - Type conversion</div>
                      <div><code>setTimeout()</code>, <code>setInterval()</code> - Timing functions</div>
                      <div><code>console.log()</code>, <code>console.warn()</code> - Debug logging</div>
                    </div>
                  </details>
                </div>
              </div>

              <RsCodeMirror
                v-model="formStore.formCustomScript"
                language="javascript"
                height="300px"
                placeholder="// Example: Hide/show fields based on selection
// onFieldChange('customer_type', (value) => {
//   if (value === 'business') {
//     showField('company_name');
//     showField('tax_id');
//     showInfo('Business information fields are now visible');
//   } else {
//     hideField('company_name');
//     hideField('tax_id');
//   }
// });

// Example: Real-time calculations
// onFieldChange(['quantity', 'price'], () => {
//   const qty = Number(getField('quantity')) || 0;
//   const price = Number(getField('price')) || 0;
//   const total = Math.round((qty * price) * 100) / 100;
//   setField('total', total);
//   
//   if (total > 1000) {
//     showSuccess('Discount applied for orders over $1000!');
//   }
// });

// Example: Conditional validation
// onFieldChange('email', (value) => {
//   if (value && !value.includes('@')) {
//     showError('Please enter a valid email address');
//   }
// });"
              />
            </div>
          </template>

          <!-- Custom CSS Tab -->
          <template #css>
            <div class="p-4">
              <div class="mb-4">
                <h3 class="text-lg font-medium mb-2">Custom CSS</h3>
                <p class="text-sm text-gray-600 mb-4">
                  Add custom styles to enhance your form appearance. Use <code class="bg-gray-100 px-1 rounded">.form-container</code> to target the form.
                </p>
                
                <!-- CSS Helper Reference -->
                <div class="mb-4 p-3 bg-green-50 rounded border border-green-200">
                  <details>
                    <summary class="text-sm font-medium text-green-800 cursor-pointer">🎨 CSS Selectors</summary>
                    <div class="mt-2 text-xs text-green-700 space-y-1">
                      <div><code>.form-container</code> - Main form wrapper</div>
                      <div><code>.form-field</code> - Individual form fields</div>
                      <div><code>.form-field[data-name="fieldName"]</code> - Specific field</div>
                      <div><code>.form-section</code> - Form sections</div>
                      <div><code>.form-submit</code> - Submit button</div>
                      <div><code>.info-display</code> - Info display components</div>
                    </div>
                  </details>
                </div>
              </div>

              <RsCodeMirror
                v-model="formStore.formCustomCSS"
                language="css"
                height="300px"
                placeholder="/* Example: Custom field styling */
/* .form-field[data-name='customer_name'] {
  background: #f0f9ff;
  border: 2px solid #0ea5e9;
}

/* Example: Hide field initially */
/* .form-field[data-name='hidden_field'] {
  display: none;
}

/* Example: Custom info display styling */
/* .info-display {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
} */"
              />
            </div>
          </template>

          <!-- Script Events Tab -->
          <template #events>
            <div class="p-4">
              <div class="mb-4">
                <h3 class="text-lg font-medium mb-2">Form Events</h3>
                <p class="text-sm text-gray-600 mb-4">
                  Configure when your custom scripts should run. Field change events are detected automatically in real-time when users interact with form fields.
                </p>
                
                <!-- Important Note -->
                <div class="mb-4 p-3 bg-amber-50 rounded border border-amber-200">
                  <div class="flex items-start">
                    <Icon name="material-symbols:info" class="w-4 h-4 text-amber-600 mr-2 mt-0.5" />
                    <div class="text-xs text-amber-700">
                      <strong>Note:</strong> The "On Field Change" event must be enabled for <code>onFieldChange()</code> callbacks to work in your scripts.
                    </div>
                  </div>
                </div>
              </div>

              <div class="space-y-4">
                <div class="border rounded p-4">
                  <h4 class="font-medium mb-2">Event Triggers</h4>
                  <div class="space-y-2">
                    <label class="flex items-center">
                      <input type="checkbox" v-model="formStore.formEvents.onLoad" class="mr-2">
                      <span class="text-sm">On Form Load</span>
                    </label>
                    <label class="flex items-center">
                      <input type="checkbox" v-model="formStore.formEvents.onFieldChange" class="mr-2">
                      <span class="text-sm">On Field Change</span>
                    </label>
                    <label class="flex items-center">
                      <input type="checkbox" v-model="formStore.formEvents.onSubmit" class="mr-2">
                      <span class="text-sm">Before Form Submit</span>
                    </label>
                    <label class="flex items-center">
                      <input type="checkbox" v-model="formStore.formEvents.onValidation" class="mr-2">
                      <span class="text-sm">On Field Validation</span>
                    </label>
                  </div>
                </div>

                <div class="border rounded p-4">
                  <h4 class="font-medium mb-2">Script Execution Mode</h4>
                  <div class="space-y-3">
                    <label class="flex items-start">
                      <input type="radio" v-model="formStore.scriptMode" value="safe" class="mr-2 mt-0.5">
                      <div>
                        <span class="text-sm font-medium text-green-700">Safe Mode (Recommended)</span>
                        <p class="text-xs text-gray-600 mt-1">Scripts run in a secure sandbox with access only to form functions. Best for most use cases.</p>
                      </div>
                    </label>
                    <label class="flex items-start">
                      <input type="radio" v-model="formStore.scriptMode" value="advanced" class="mr-2 mt-0.5">
                      <div>
                        <span class="text-sm font-medium text-orange-700">Advanced Mode</span>
                        <p class="text-xs text-gray-600 mt-1">Provides broader JavaScript access but with security restrictions. Use with caution.</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- JSON Tab -->
          <template #json>
            <div class="p-4">
              <div class="mb-4">
                <h3 class="text-lg font-medium mb-2">Form Configuration</h3>
                <p class="text-sm text-gray-600 mb-4">
                  This section displays the complete form configuration as JSON for developers.
                </p>
                
                <!-- Form metadata -->
                <div class="bg-gray-50 p-3 rounded border mb-4 text-sm">
                  <div class="grid grid-cols-2 gap-2">
                    <div>
                      <span class="font-medium">Component Count:</span> {{ formStore.formComponents.length }}
                    </div>
                    <div>
                      <span class="font-medium">Form ID:</span> {{ formStore.currentFormId || 'Not saved yet' }}
                    </div>
                    <div>
                      <span class="font-medium">Has Script:</span> {{ formStore.formCustomScript ? 'Yes' : 'No' }}
                    </div>
                    <div>
                      <span class="font-medium">Has Custom CSS:</span> {{ formStore.formCustomCSS ? 'Yes' : 'No' }}
                    </div>
                  </div>
                </div>
                
                <!-- Action buttons -->
                <div class="flex flex-wrap justify-between mb-2 gap-2">
                  <div>
                    <!-- Import button and hidden file input -->
                    <input 
                      type="file" 
                      ref="jsonFileInput" 
                      accept=".json" 
                      style="display: none"
                      @change="handleJsonImport"
                    />
                    <RsButton @click="$refs.jsonFileInput.click()" size="sm" variant="primary">
                      <Icon name="material-symbols:upload" class="mr-1" />
                      Import JSON
                    </RsButton>
                  </div>
                  
                  <div class="flex space-x-2">
                    <RsButton @click="toggleJsonEditMode" size="sm" :variant="isEditingJson ? 'primary' : 'secondary'">
                      <Icon :name="isEditingJson ? 'material-symbols:edit-off' : 'material-symbols:edit'" class="mr-1" />
                      {{ isEditingJson ? 'View Mode' : 'Edit Mode' }}
                    </RsButton>
                    <RsButton @click="downloadJsonFile" size="sm" variant="secondary">
                      <Icon name="material-symbols:download" class="mr-1" />
                      Download
                    </RsButton>
                    <RsButton @click="copyJsonToClipboard" size="sm" variant="secondary">
                      <Icon name="material-symbols:content-copy" class="mr-1" />
                      Copy
                    </RsButton>
                  </div>
                </div>
                
                <!-- Warning message when in edit mode -->
                <div v-if="isEditingJson" class="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded mb-4">
                  <div class="flex items-start">
                    <Icon name="material-symbols:warning" class="w-5 h-5 mr-2 mt-0.5" />
                    <div>
                      <h4 class="font-medium text-sm">Warning: Direct JSON Editing</h4>
                      <p class="text-xs mt-1">
                        Changes made to JSON directly will replace your form configuration when you click "Apply JSON Changes".
                        Ensure the JSON is valid before applying changes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <RsCodeMirror
                v-if="isEditingJson"
                v-model="editableJsonString"
                language="json"
                height="300px"
                :readonly="false"
              />
              <RsCodeMirror
                v-else
                :value="formJsonString"
                language="json"
                height="300px"
                :readonly="true"
              />
              
              <!-- Apply changes button only visible in edit mode -->
              <div v-if="isEditingJson" class="mt-4 flex justify-end">
                <RsButton @click="applyJsonChanges" variant="primary" size="md">
                  Apply JSON Changes
                </RsButton>
              </div>
            </div>
          </template>
        </RsTab>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <RsButton @click="showFormSettings = false" variant="tertiary">
            Cancel
          </RsButton>
          <RsButton @click="saveFormSettings" variant="primary">
            Save Settings
          </RsButton>
        </div>
      </template>
    </RsModal>

    <!-- Unsaved Changes Modal -->
    <RsModal v-model="showUnsavedChangesModal" title="Unsaved Changes" size="md" position="center">
      <div class="p-4">
        <div class="flex items-center mb-4">
          <Icon name="material-symbols:warning-outline" class="text-yellow-500 w-8 h-8 mr-3" />
          <div>
            <h3 class="font-medium text-lg">You have unsaved changes</h3>
            <p class="text-gray-600">Are you sure you want to leave? Your changes will be lost.</p>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <RsButton @click="cancelNavigation" variant="tertiary">
            Stay
          </RsButton>
          <RsButton @click="confirmNavigation" variant="danger">
            Leave
          </RsButton>
        </div>
      </template>
    </RsModal>

    <!-- Add Templates Modal -->
    <FormTemplatesModal 
      v-model="showTemplatesModal"
      @select-template="applyFormTemplate"
    />

    <!-- Field Settings Modal -->
    <FormBuilderFieldSettingsModal
      v-model="showFieldSettings"
      :component="formStore.selectedComponent"
      @update-component="handleUpdateComponent"
      @close="showFieldSettings = false"
    />

        </div>
  </template>

<script setup>
import { useFormBuilderStore } from "~/stores/formBuilder";
import { nextTick } from 'vue';
import FormBuilderHistory from "~/components/FormBuilderHistory.vue";
import FormTemplatesModal from '~/components/FormTemplatesModal.vue';
import FormBuilderFieldSettingsModal from '~/components/FormBuilderFieldSettingsModal.vue';
import FormScriptEngine from '~/components/FormScriptEngine.vue';
import ConditionalLogicEngine from '~/components/ConditionalLogicEngine.vue';

definePageMeta({
  title: "Form Builder",
  description: "Create dynamic forms with drag and drop",
  layout: "empty",
  middleware: ["auth"],
  requiresAuth: true,
});

const router = useRouter();
const formStore = useFormBuilderStore();
let toast;

// Try to use the toast composable if available
try {
  toast = useToast();
} catch (error) {
  // Create a simple toast object if composable is not available
  toast = {
    success: (msg) => console.log('Success:', msg),
    error: (msg) => console.error('Error:', msg),
    info: (msg) => console.info('Info:', msg),
    warning: (msg) => console.warn('Warning:', msg)
  };
}

const showPreview = ref(false);
const showUnsavedChangesModal = ref(false);
const pendingNavigation = ref(null);
const navigationTarget = ref(null);
const navigationConfirmed = ref(false);
const leftSidebarTab = ref('components');
const showFormSettings = ref(false);
const activeSettingsTab = ref('info');
const isPreview = ref(false);
const showDropdown = ref(false);
const showTemplatesModal = ref(false);
const showFieldSettings = ref(false);
const showFieldSettingsPanel = ref(false);
const previewForm = ref(null);
const formScriptEngine = ref(null);
const conditionalLogicEngine = ref(null);

// Settings tabs configuration
const settingsTabs = [
  { key: 'info', label: 'Form Info', icon: 'material-symbols:info-outline' },
  { key: 'javascript', label: 'JavaScript', icon: 'material-symbols:code' },
  { key: 'css', label: 'CSS', icon: 'material-symbols:palette-outline' },
  { key: 'events', label: 'Events', icon: 'material-symbols:event-outline' },
  { key: 'json', label: 'JSON', icon: 'material-symbols:data-object' }
];

// Computed property for form name with getter and setter
const formName = computed({
  get: () => formStore.formName,
  set: (value) => {
    if (value !== formStore.formName) {
      formStore.setFormName(value);
    }
  }
});

// Form JSON representation for developer view
const formJson = computed(() => {
  return {
    formName: formStore.formName,
    formDescription: formStore.formDescription,
    formId: formStore.currentFormId,
    components: formStore.formComponents.map(component => ({
      id: component.id,
      type: component.type,
      props: component.props
    })),
    customScript: formStore.formCustomScript,
    customCSS: formStore.formCustomCSS,
    formEvents: formStore.formEvents,
    scriptMode: formStore.scriptMode
  };
});

// Convert form JSON to formatted string
const formJsonString = computed(() => {
  return JSON.stringify(formJson.value, null, 2);
});

// JSON editing state
const isEditingJson = ref(false);
const editableJsonString = ref('');

// Toggle between read-only and edit mode for JSON
const toggleJsonEditMode = () => {
  if (!isEditingJson.value) {
    // Switching to edit mode - initialize the editable string
    editableJsonString.value = formJsonString.value;
  }
  isEditingJson.value = !isEditingJson.value;
};

// Apply changes from JSON editor
const applyJsonChanges = () => {
  try {
    const importedJson = JSON.parse(editableJsonString.value);
    
    // Validate imported JSON
    if (!importedJson.formName || !Array.isArray(importedJson.components)) {
      throw new Error('Invalid form JSON structure. Must include formName and components array.');
    }
    
    // Import form data
    formStore.setFormName(importedJson.formName);
    formStore.formDescription = importedJson.formDescription || '';
    formStore.formComponents = [];
    
    // Import components
    if (importedJson.components.length > 0) {
      importedJson.components.forEach((component, index) => {
        if (component.type && component.props) {
          // Process component properties based on type
          let processedProps = { ...component.props };
          
          // Ensure required grid properties
          if (!processedProps.width) {
            processedProps.width = '100%';
          }
          
          if (!processedProps.gridColumn) {
            processedProps.gridColumn = 'span 12';
          }
          
          // Handle special component types
          switch (component.type) {
            case 'image-preview':
              // Ensure all required image preview properties
              processedProps = {
                label: processedProps.label || 'Image Preview',
                name: processedProps.name || `image_preview_${index + 1}`,
                help: processedProps.help || '',
                imageUrl: processedProps.imageUrl || 'https://placehold.co/600x400',
                altText: processedProps.altText || 'Preview image',
                caption: processedProps.caption || '',
                showZoom: processedProps.showZoom !== undefined ? processedProps.showZoom : true,
                showCaption: processedProps.showCaption !== undefined ? processedProps.showCaption : true,
                maxWidth: processedProps.maxWidth || '100%',
                height: processedProps.height || 'auto',
                ...processedProps
              };
              break;
              
            case 'repeating-group':
              // Ensure all required repeating group properties
              processedProps = {
                label: processedProps.label || 'Repeating Group',
                name: processedProps.name || `repeating_group_${index + 1}`,
                help: processedProps.help || '',
                minItems: processedProps.minItems !== undefined ? processedProps.minItems : 1,
                maxItems: processedProps.maxItems !== undefined ? processedProps.maxItems : 10,
                buttonText: processedProps.buttonText || 'Add Item',
                removeText: processedProps.removeText || 'Remove',
                fields: processedProps.fields || [
                  { type: 'text', name: 'field_1', label: 'Field 1', placeholder: 'Enter value' }
                ],
                ...processedProps
              };
              break;
              
            case 'dynamic-list':
              // Ensure all required dynamic list properties
              processedProps = {
                label: processedProps.label || 'Dynamic List',
                name: processedProps.name || `dynamic_list_${index + 1}`,
                help: processedProps.help || '',
                placeholder: processedProps.placeholder || 'Enter item',
                buttonText: processedProps.buttonText || 'Add Item',
                minItems: processedProps.minItems !== undefined ? processedProps.minItems : 0,
                maxItems: processedProps.maxItems !== undefined ? processedProps.maxItems : 20,
                defaultItems: Array.isArray(processedProps.defaultItems) ? processedProps.defaultItems : ['Item 1', 'Item 2'],
                ...processedProps
              };
              break;
              
            case 'info-display':
              // Ensure all required info display properties
              processedProps = {
                title: processedProps.title || 'Information',
                name: processedProps.name || `info_display_${index + 1}`,
                help: processedProps.help || '',
                layout: processedProps.layout || 'vertical',
                showBorder: processedProps.showBorder !== undefined ? processedProps.showBorder : true,
                backgroundColor: processedProps.backgroundColor || '#f8fafc',
                fields: Array.isArray(processedProps.fields) ? processedProps.fields : [
                  { label: 'Info Item', value: 'Value', key: 'item_1' }
                ],
                ...processedProps
              };
              break;
              
            case 'file':
              // Ensure all required file upload properties
              processedProps = {
                label: processedProps.label || 'File Upload',
                name: processedProps.name || `file_upload_${index + 1}`,
                help: processedProps.help || 'Upload a file',
                accept: processedProps.accept || '.pdf,.doc,.docx,.jpg,.jpeg,.png',
                ...processedProps
              };
              break;
              
            case 'heading':
              // Ensure all required heading properties
              processedProps = {
                value: processedProps.value || 'Heading',
                level: processedProps.level || 2,
                ...processedProps
              };
              break;
              
            case 'paragraph':
              // Ensure all required paragraph properties
              processedProps = {
                value: processedProps.value || 'Paragraph text',
                ...processedProps
              };
              break;
              
            case 'select':
            case 'radio':
            case 'checkbox':
              // Ensure options array exists
              if (!Array.isArray(processedProps.options) || processedProps.options.length === 0) {
                processedProps.options = [
                  { label: 'Option 1', value: 'option_1' },
                  { label: 'Option 2', value: 'option_2' }
                ];
              }
              break;
              
            default:
              // Basic properties for all other component types
              if (!processedProps.label && !['heading', 'paragraph', 'divider'].includes(component.type)) {
                processedProps.label = component.type.charAt(0).toUpperCase() + component.type.slice(1) + ' ' + (index + 1);
              }
              
              if (!processedProps.name && !['heading', 'paragraph', 'divider'].includes(component.type)) {
                processedProps.name = `${component.type}_${index + 1}`;
              }
              break;
          }
          
          // Create component in expected format
          const formattedComponent = {
            type: component.type,
            name: processedProps.label || component.type,
            category: getDefaultCategory(component.type),
            icon: getDefaultIcon(component.type),
            defaultProps: processedProps
          };
          
          // Add component to form
          formStore.addComponent(formattedComponent);
        } else {
          console.warn('Skipping invalid component:', component);
        }
      });
    }
    
    // Import custom code if available
    if (importedJson.customScript !== undefined) {
      formStore.formCustomScript = importedJson.customScript;
    }
    
    if (importedJson.customCSS !== undefined) {
      formStore.formCustomCSS = importedJson.customCSS;
    }
    
    // Import events if available
    if (importedJson.formEvents) {
      formStore.formEvents = importedJson.formEvents;
    }
    
    if (importedJson.scriptMode) {
      formStore.scriptMode = importedJson.scriptMode;
    }
    
    // Mark as having unsaved changes
    formStore.hasUnsavedChanges = true;
    
    // Exit edit mode and update the editable JSON
    isEditingJson.value = false;
    
    toast.success('Form configuration updated from JSON');
  } catch (err) {
    console.error('Error applying JSON changes:', err);
    toast.error(`Failed to apply JSON changes: ${err.message}`);
  }
};

// Function to copy JSON to clipboard
const copyJsonToClipboard = () => {
  navigator.clipboard.writeText(formJsonString.value)
    .then(() => {
      toast.success('JSON copied to clipboard');
    })
    .catch(err => {
      console.error('Failed to copy JSON:', err);
      toast.error('Failed to copy JSON to clipboard');
    });
};

// Function to download JSON file
const downloadJsonFile = () => {
  try {
    const jsonBlob = new Blob([formJsonString.value], { type: 'application/json' });
    const url = URL.createObjectURL(jsonBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${formStore.formName.replace(/\s+/g, '-').toLowerCase()}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    toast.success('JSON file downloaded');
  } catch (err) {
    console.error('Error downloading JSON:', err);
    toast.error('Failed to download JSON file');
  }
};

// Reference to file input element
const jsonFileInput = ref(null);

// Function to handle JSON import
const handleJsonImport = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const importedJson = JSON.parse(e.target.result);
      
      // If in edit mode, just update the editable content
      if (isEditingJson.value) {
        editableJsonString.value = JSON.stringify(importedJson, null, 2);
        toast.success('JSON loaded into editor. Click "Apply JSON Changes" to update the form.');
      } else {
        // Confirm before replacing current form
        if (formStore.formComponents.length > 0) {
          if (!confirm("This will replace your current form content. Continue?")) {
            // Reset file input
            event.target.value = '';
            return;
          }
        }
        
        // Validate imported JSON
        if (!importedJson.formName || !Array.isArray(importedJson.components)) {
          throw new Error('Invalid form JSON structure');
        }
        
        // Import form data
        formStore.setFormName(importedJson.formName);
        formStore.formDescription = importedJson.formDescription || '';
        formStore.formComponents = [];
        
        // Import components
        if (importedJson.components.length > 0) {
          importedJson.components.forEach((component, index) => {
            if (component.type && component.props) {
              // Process component properties based on type
              let processedProps = { ...component.props };
              
              // Ensure required grid properties
              if (!processedProps.width) {
                processedProps.width = '100%';
              }
              
              if (!processedProps.gridColumn) {
                processedProps.gridColumn = 'span 12';
              }
              
              // Handle special component types
              switch (component.type) {
                case 'image-preview':
                  // Ensure all required image preview properties
                  processedProps = {
                    label: processedProps.label || 'Image Preview',
                    name: processedProps.name || `image_preview_${index + 1}`,
                    help: processedProps.help || '',
                    imageUrl: processedProps.imageUrl || 'https://placehold.co/600x400',
                    altText: processedProps.altText || 'Preview image',
                    caption: processedProps.caption || '',
                    showZoom: processedProps.showZoom !== undefined ? processedProps.showZoom : true,
                    showCaption: processedProps.showCaption !== undefined ? processedProps.showCaption : true,
                    maxWidth: processedProps.maxWidth || '100%',
                    height: processedProps.height || 'auto',
                    ...processedProps
                  };
                  break;
                  
                case 'repeating-group':
                  // Ensure all required repeating group properties
                  processedProps = {
                    label: processedProps.label || 'Repeating Group',
                    name: processedProps.name || `repeating_group_${index + 1}`,
                    help: processedProps.help || '',
                    minItems: processedProps.minItems !== undefined ? processedProps.minItems : 1,
                    maxItems: processedProps.maxItems !== undefined ? processedProps.maxItems : 10,
                    buttonText: processedProps.buttonText || 'Add Item',
                    removeText: processedProps.removeText || 'Remove',
                    fields: processedProps.fields || [
                      { type: 'text', name: 'field_1', label: 'Field 1', placeholder: 'Enter value' }
                    ],
                    ...processedProps
                  };
                  break;
                  
                case 'dynamic-list':
                  // Ensure all required dynamic list properties
                  processedProps = {
                    label: processedProps.label || 'Dynamic List',
                    name: processedProps.name || `dynamic_list_${index + 1}`,
                    help: processedProps.help || '',
                    placeholder: processedProps.placeholder || 'Enter item',
                    buttonText: processedProps.buttonText || 'Add Item',
                    minItems: processedProps.minItems !== undefined ? processedProps.minItems : 0,
                    maxItems: processedProps.maxItems !== undefined ? processedProps.maxItems : 20,
                    defaultItems: Array.isArray(processedProps.defaultItems) ? processedProps.defaultItems : ['Item 1', 'Item 2'],
                    ...processedProps
                  };
                  break;
                  
                case 'info-display':
                  // Ensure all required info display properties
                  processedProps = {
                    title: processedProps.title || 'Information',
                    name: processedProps.name || `info_display_${index + 1}`,
                    help: processedProps.help || '',
                    layout: processedProps.layout || 'vertical',
                    showBorder: processedProps.showBorder !== undefined ? processedProps.showBorder : true,
                    backgroundColor: processedProps.backgroundColor || '#f8fafc',
                    fields: Array.isArray(processedProps.fields) ? processedProps.fields : [
                      { label: 'Info Item', value: 'Value', key: 'item_1' }
                    ],
                    ...processedProps
                  };
                  break;
                  
                case 'file':
                  // Ensure all required file upload properties
                  processedProps = {
                    label: processedProps.label || 'File Upload',
                    name: processedProps.name || `file_upload_${index + 1}`,
                    help: processedProps.help || 'Upload a file',
                    accept: processedProps.accept || '.pdf,.doc,.docx,.jpg,.jpeg,.png',
                    ...processedProps
                  };
                  break;
                  
                case 'heading':
                  // Ensure all required heading properties
                  processedProps = {
                    value: processedProps.value || 'Heading',
                    level: processedProps.level || 2,
                    ...processedProps
                  };
                  break;
                  
                case 'paragraph':
                  // Ensure all required paragraph properties
                  processedProps = {
                    value: processedProps.value || 'Paragraph text',
                    ...processedProps
                  };
                  break;
                  
                case 'select':
                case 'radio':
                case 'checkbox':
                  // Ensure options array exists
                  if (!Array.isArray(processedProps.options) || processedProps.options.length === 0) {
                    processedProps.options = [
                      { label: 'Option 1', value: 'option_1' },
                      { label: 'Option 2', value: 'option_2' }
                    ];
                  }
                  break;
                  
                default:
                  // Basic properties for all other component types
                  if (!processedProps.label && !['heading', 'paragraph', 'divider'].includes(component.type)) {
                    processedProps.label = component.type.charAt(0).toUpperCase() + component.type.slice(1) + ' ' + (index + 1);
                  }
                  
                  if (!processedProps.name && !['heading', 'paragraph', 'divider'].includes(component.type)) {
                    processedProps.name = `${component.type}_${index + 1}`;
                  }
                  break;
              }
              
              // Create component in expected format
              const formattedComponent = {
                type: component.type,
                name: processedProps.label || component.type,
                category: getDefaultCategory(component.type),
                icon: getDefaultIcon(component.type),
                // Use the processed default props
                defaultProps: processedProps
              };
              
              console.log('Formatted component:', formattedComponent);
              
              // Add component to form
              formStore.addComponent(formattedComponent);
            } else {
              console.warn('Skipping invalid component:', component);
            }
          });
        }
        
        // Import custom code if available
        if (importedJson.customScript) {
          formStore.formCustomScript = importedJson.customScript;
        }
        
        if (importedJson.customCSS) {
          formStore.formCustomCSS = importedJson.customCSS;
        }
        
        // Import events if available
        if (importedJson.formEvents) {
          formStore.formEvents = importedJson.formEvents;
        }
        
        if (importedJson.scriptMode) {
          formStore.scriptMode = importedJson.scriptMode;
        }
        
        // Mark as having unsaved changes
        formStore.hasUnsavedChanges = true;
        
        toast.success('Form imported successfully');
      }
    } catch (err) {
      console.error('Error importing JSON:', err);
      toast.error(`Failed to import JSON: ${err.message}`);
    }
    
    // Reset file input
    event.target.value = '';
  };
  
  reader.onerror = () => {
    toast.error('Error reading file');
    // Reset file input
    event.target.value = '';
  };
  
  reader.readAsText(file);
};

// Initialize the form builder
onMounted(async () => {
  try {
    await formStore.loadSavedForms();
    
    // Check if there's a form ID in the URL query parameters
    const route = useRoute();
    const formId = route.query.id;
    
    if (formId) {
      try {
        await formStore.loadForm(formId);
        toast.success(`Form '${formStore.formName}' loaded successfully`);
      } catch (error) {
        console.error('Error loading form from ID:', error);
        toast.error(`Failed to load form: ${error.message || 'Unknown error'}`);
      }
    }
  } catch (error) {
    console.error('Error initializing form builder:', error);
    toast.error(`Initialization error: ${error.message || 'Unknown error'}`);
  }
  
  // Add the beforeunload event listener
  window.addEventListener('beforeunload', handleBeforeUnload);
  
  // Setup keyboard shortcuts
  window.addEventListener('keydown', handleKeyboardShortcuts);

  // Close dropdown when clicking outside
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  // Remove event listeners
  window.removeEventListener('beforeunload', handleBeforeUnload);
  window.removeEventListener('keydown', handleKeyboardShortcuts);
  document.removeEventListener('click', handleClickOutside);
});

// Show warning if there are unsaved changes
const handleBeforeUnload = (event) => {
  if (formStore.hasUnsavedChanges) {
    event.preventDefault();
    event.returnValue = '';
    return '';
  }
};

// Handle keyboard shortcuts
const handleKeyboardShortcuts = (event) => {
  // Undo: Ctrl+Z
  if (event.ctrlKey && event.key === 'z' && !event.shiftKey) {
    event.preventDefault();
    if (formStore.canUndo) {
      formStore.undo();
    }
  }
  
  // Redo: Ctrl+Y or Ctrl+Shift+Z
  if ((event.ctrlKey && event.key === 'y') || 
      (event.ctrlKey && event.shiftKey && event.key === 'z')) {
    event.preventDefault();
    if (formStore.currentHistoryIndex < formStore.actionHistory.length - 1) {
      formStore.redo();
    }
  }
};

// Navigation guards
// Add navigation guard
onBeforeRouteLeave((to, from, next) => {
  // If navigation was already confirmed or there are no unsaved changes, proceed
  if (navigationConfirmed.value || !formStore.hasUnsavedChanges) {
    next();
    return;
  }
  
  // Otherwise show the confirmation modal
  showUnsavedChangesModal.value = true;
  pendingNavigation.value = () => {
    navigationConfirmed.value = true;
    next();
  };
  next(false);
});

// Navigation handlers
const cancelNavigation = () => {
  showUnsavedChangesModal.value = false;
  pendingNavigation.value = null;
  navigationTarget.value = null;
  navigationConfirmed.value = false;
};

const confirmNavigation = () => {
  showUnsavedChangesModal.value = false;
  
  if (pendingNavigation.value) {
    pendingNavigation.value();
  } else if (navigationTarget.value) {
    navigationConfirmed.value = true; // Mark as confirmed before navigating
    router.push(navigationTarget.value);
  }
};

// Handler methods
const handleAddComponent = (component) => {
  formStore.addComponent(component);
};

const handleSelectComponent = (component) => {
  if (!component || !component.id) return;
  formStore.selectComponent(component.id);
};

const handleUpdateComponent = (updatedComponent) => {
  if (!updatedComponent || !updatedComponent.id) return;
  formStore.updateComponent(updatedComponent);
};

const handleMoveComponent = ({ oldIndex, newIndex }) => {
  formStore.moveComponent({ oldIndex, newIndex });
};

const handleDeleteComponent = (id) => {
  if (!id) return;
  formStore.deleteComponent(id);
};

const handleDragOver = (event) => {
  // Always prevent default to enable drop
  event.preventDefault();
  
  // Set visual feedback
  formStore.setDraggingOver(true);
  
  // Set the drop effect
  event.dataTransfer.dropEffect = 'copy';
};

const handleDragLeave = (event) => {
  // Check if we're really leaving the drop zone or just entering a child element
  const dropZone = document.getElementById('form-drop-zone');
  const relatedTarget = event.relatedTarget;
  
  if (!dropZone || !dropZone.contains(relatedTarget)) {
  formStore.setDraggingOver(false);
  }
  
  event.preventDefault();
};

const handleDrop = (event) => {
  // Always prevent default
  event.preventDefault();
  event.stopPropagation();
  
  // Reset drag over state
  formStore.setDraggingOver(false);
  
  try {
    // Get the data from all possible formats
    let componentData;
    const formats = event.dataTransfer.types;
    
    // Log available formats for debugging
    console.log('Available formats:', formats);
    
    // Try text/plain first (most compatible format)
    if (formats.includes('text/plain')) {
      const plainText = event.dataTransfer.getData('text/plain');
      if (plainText) {
        try {
          componentData = JSON.parse(plainText);
        } catch (e) {
          console.warn('Failed to parse text/plain data', e);
        }
      }
    }
    
    // If that failed, try the custom format
    if (!componentData && formats.includes('component')) {
      const componentText = event.dataTransfer.getData('component');
      if (componentText) {
        try {
          componentData = JSON.parse(componentText);
        } catch (e) {
          console.warn('Failed to parse component data', e);
        }
      }
    }
    
    // Safari fallback: if no data was received via dataTransfer, check global variable
    if (!componentData && window.__draggedComponentData) {
      console.log('Using fallback drag data for Safari');
      componentData = window.__draggedComponentData;
      // Clear the fallback data
      window.__draggedComponentData = null;
    }
    
    // If we have valid component data, add it
    if (componentData) {
  formStore.addComponent(componentData);
    } else {
      console.warn('No valid component data found in drop event');
    }
  } catch (error) {
    console.error('Error processing dropped component:', error);
  }
};

const handleSave = async () => {
  if (!formStore.formName.trim()) {
    toast.error("Please enter a form name");
    return;
  }

  if (formStore.formComponents.length === 0) {
    toast.error("Please add at least one component to the form");
    return;
  }

  try {
    const savedForm = await formStore.saveForm();
    toast.success("Form saved successfully");
    
    // Update URL to include the form ID without reloading the page
    const newPath = `/form-builder?id=${savedForm.formUUID}`;
    window.history.replaceState({}, '', newPath);
  } catch (error) {
    console.error("Error saving form:", error);
    toast.error(`Failed to save form: ${error.message || 'Unknown error'}`);
  }
};

const togglePreview = () => {
  if (!isPreview.value && formStore.formComponents.length === 0) {
    toast.error("Please add at least one component to the form");
    return;
  }

  isPreview.value = !isPreview.value;
};

const handlePreviewSubmit = (formData) => {
  console.log("Form submitted:", formData);
  toast.success("Form submitted successfully");
};

const saveFormSettings = () => {
  // Form settings are automatically saved through the store's reactive updates
  showFormSettings.value = false;
  toast.success("Form settings saved successfully");
};

// Preview form data for script interactions
const previewFormData = ref({});

// Initialize preview form data with default values
watchEffect(() => {
  console.log('[FormBuilder] watchEffect for previewFormData initialization. Current form components:', formStore.formComponents.length);
  const existingFormData = { ...previewFormData.value }; // Preserve current user inputs
  let newDefaults = {};
  let hasNewComponents = false;

  formStore.formComponents.forEach(component => {
    if (component.props.name) {
      // If field is not already in existingFormData, it's a new component or needs initialization
      if (!existingFormData.hasOwnProperty(component.props.name)) {
        hasNewComponents = true;
        // Set default values based on component type
        switch (component.type) {
          case 'checkbox':
            newDefaults[component.props.name] = [];
            break;
          case 'number':
          case 'range':
            newDefaults[component.props.name] = component.props.value || 0;
            break;
          case 'switch':
            newDefaults[component.props.name] = component.props.value !== undefined ? component.props.value : false;
            break;
          case 'color':
            newDefaults[component.props.name] = component.props.value || '#3b82f6';
            break;
          case 'hidden':
            newDefaults[component.props.name] = component.props.value || '';
            break;
          case 'repeating-group':
            const initialGroups = [];
            const minItems = component.props.minItems || 1;
            for (let i = 0; i < minItems; i++) {
              const group = {};
              if (Array.isArray(component.props.fields)) {
                component.props.fields.forEach(field => {
                  switch (field.type) {
                    case 'number': group[field.name] = 0; break;
                    case 'checkbox': group[field.name] = []; break;
                    case 'select':
                      const defaultOption = Array.isArray(field.options) && field.options.length > 0 ? field.options[0].value : '';
                      group[field.name] = field.value || defaultOption || '';
                      break;
                    default: group[field.name] = field.value || '';
                  }
                });
              }
              initialGroups.push(group);
            }
            newDefaults[component.props.name] = initialGroups;
            break;
          case 'dynamic-list':
            newDefaults[component.props.name] = Array.isArray(component.props.defaultItems) ? [...component.props.defaultItems] : [];
            break;
          case 'select':
          case 'radio':
            if (Array.isArray(component.props.options) && component.props.options.length > 0) {
              newDefaults[component.props.name] = component.props.value || component.props.options[0].value;
            } else {
              newDefaults[component.props.name] = '';
            }
            break;
          case 'date':
          case 'time':
          case 'datetime-local':
          case 'file': // file inputs are handled by FormKit, typically initialized to null or specific file objects
             newDefaults[component.props.name] = component.props.value || null;
            break;
          // image-preview, info-display, button don't usually hold data in previewFormData directly
          case 'image-preview':
          case 'info-display':
          case 'button':
            break;
          default:
            newDefaults[component.props.name] = component.props.value || '';
        }
      }
    }
  });

  // Only update previewFormData if it's the initial load (empty) or new components were added that need defaults
  // This prevents overwriting user input when existing components change their props (which also triggers this watchEffect)
  const isInitialLoad = Object.keys(previewFormData.value).length === 0 && Object.keys(newDefaults).length > 0;
  
  if (isInitialLoad || hasNewComponents) {
    console.log('[FormBuilder] Initializing/merging preview form data. Initial load:', isInitialLoad, 'Has new components:', hasNewComponents);
    previewFormData.value = { ...existingFormData, ...newDefaults };
    console.log('[FormBuilder] Preview form data after init/merge:', previewFormData.value);
  } else {
    console.log('[FormBuilder] Skipping full previewFormData re-initialization to preserve user input.');
  }
});

// Handle script-driven field changes
const handleScriptFieldChange = ({ fieldName, value }) => {
  console.log('[FormBuilder] Script field change:', fieldName, '=', value);
  
  // Update the reactive form data
  const newFormData = {
    ...previewFormData.value,
    [fieldName]: value
  };
  
  previewFormData.value = newFormData;
  
  // Make form data accessible to component previews
  formStore.updatePreviewFormData(newFormData);
  
  // Try to force FormKit form to update
  nextTick(() => {
    console.log('[FormBuilder] Updated form data:', newFormData);
    
    // Try to access the FormKit form node and update it directly
    if (previewForm.value && previewForm.value.node) {
      try {
        previewForm.value.node.input(newFormData);
        console.log('[FormBuilder] Force updated FormKit form');
      } catch (error) {
        console.warn('[FormBuilder] Could not force update FormKit form:', error);
      }
    }
  });
};

// Handle script-driven field validation
const handleScriptFieldValidate = ({ fieldName }) => {
  // Could integrate with FormKit validation here
  console.log(`Validating field: ${fieldName}`);
};

// Handle FormKit form input events
const handleFormKitInput = (formData, node) => {
  console.log('[FormBuilder] FormKit input event received!');
  console.log('[FormBuilder] FormKit formData:', JSON.parse(JSON.stringify(formData)));
  console.log('[FormBuilder] Current previewFormData before update:', JSON.parse(JSON.stringify(previewFormData.value)));
  
  // Update our reactive form data - this should trigger the FormScriptEngine watcher
  const oldPreviewData = { ...previewFormData.value };
  previewFormData.value = { ...formData };
  
  console.log('[FormBuilder] Updated previewFormData to:', JSON.parse(JSON.stringify(previewFormData.value)));
  console.log('[FormBuilder] Did previewFormData actually change?', JSON.stringify(oldPreviewData) !== JSON.stringify(previewFormData.value));
  
  // Make form data accessible to component previews
  formStore.updatePreviewFormData(previewFormData.value);
  
  console.log('[FormBuilder] FormStore preview data updated to:', JSON.parse(JSON.stringify(formStore.previewFormData)));
};

// Make form data accessible to component previews (for UI rendering, not for triggering script engine)
watchEffect(() => {
  if (formStore) { // Ensure formStore is available
    formStore.updatePreviewFormData(previewFormData.value);
  }
});

// Watch for changes in previewFormData to trigger FormScriptEngine
watch(() => previewFormData.value, (newData, oldData) => {
  if (!isPreview.value) return; // Only in preview mode
  
  console.log('[FormBuilder] previewFormData watcher triggered!');
  console.log('[FormBuilder] New data:', JSON.parse(JSON.stringify(newData)));
  console.log('[FormBuilder] Old data:', oldData ? JSON.parse(JSON.stringify(oldData)) : 'undefined');
  
  // Update form store
  formStore.updatePreviewFormData(newData);
  
  console.log('[FormBuilder] FormStore preview data updated to:', JSON.parse(JSON.stringify(formStore.previewFormData)));
}, { deep: true, immediate: false });

const navigateToManage = () => {
  // If already confirmed or no unsaved changes, navigate directly
  if (navigationConfirmed.value || !formStore.hasUnsavedChanges) {
    router.push("/form-builder/manage");
    return;
  }
  
  // Otherwise show confirmation modal
  showUnsavedChangesModal.value = true;
  navigationTarget.value = "/form-builder/manage";
};

const handleOptimizeLayout = () => {
  formStore.optimizeGridLayout();
};

// Add the new handler function
const handleDragEnter = (event) => {
  // Prevent default to allow drop
  event.preventDefault();
  // Set visual feedback
  formStore.setDraggingOver(true);
};

function handleClickOutside(event) {
  const dropdown = document.querySelector('.dropdown');
  if (dropdown && !dropdown.contains(event.target)) {
    showDropdown.value = false;
  }
}

// Handle applying a template
const applyFormTemplate = (template) => {
  // Confirm if there's already content in the form
  if (formStore.formComponents.length > 0) {
    if (!confirm("This will replace your current form content. Continue?")) {
      return;
    }
  }
  
  try {
    console.log('Applying template:', template.name);
    console.log('Template components:', template.components ? template.components.length : 0);
    
    // Set form name if it's a new form or user allows overwrite
    if (formStore.formName === 'New Form' || confirm("Update the form name to match the template?")) {
      formStore.setFormName(template.name);
    }
    
    // Reset the form components and form ID (to ensure this becomes a new form)
    formStore.formComponents = [];
    formStore.currentFormId = null; // Important: This ensures we create a new form instead of updating existing
    
    // Add the template components
    if (template.components && template.components.length > 0) {
      // Process each template component
      template.components.forEach((component, index) => {
        console.log(`Processing component ${index + 1}:`, component.type);
        
        // Handle special component types with specific properties
        let processedDefaultProps = {};
        
        if (component.defaultProps) {
          // Clone the default props to avoid reference issues
          processedDefaultProps = JSON.parse(JSON.stringify(component.defaultProps));
          
          // Ensure required grid properties are present
          if (!processedDefaultProps.width) {
            processedDefaultProps.width = '100%';
          }
          
          if (!processedDefaultProps.gridColumn) {
            processedDefaultProps.gridColumn = 'span 12';
          }
          
          // Ensure specific properties for each component type
          switch (component.type) {
            case 'image-preview':
              // Ensure all required image preview properties
              processedDefaultProps = {
                label: processedDefaultProps.label || 'Image Preview',
                name: processedDefaultProps.name || `image_preview_${index + 1}`,
                help: processedDefaultProps.help || '',
                imageUrl: processedDefaultProps.imageUrl || 'https://placehold.co/600x400',
                altText: processedDefaultProps.altText || 'Preview image',
                caption: processedDefaultProps.caption || '',
                showZoom: processedDefaultProps.showZoom !== undefined ? processedDefaultProps.showZoom : true,
                showCaption: processedDefaultProps.showCaption !== undefined ? processedDefaultProps.showCaption : true,
                maxWidth: processedDefaultProps.maxWidth || '100%',
                height: processedDefaultProps.height || 'auto',
                ...processedDefaultProps
              };
              break;
              
            case 'repeating-group':
              // Ensure all required repeating group properties
              processedDefaultProps = {
                label: processedDefaultProps.label || 'Repeating Group',
                name: processedDefaultProps.name || `repeating_group_${index + 1}`,
                help: processedDefaultProps.help || '',
                minItems: processedDefaultProps.minItems !== undefined ? processedDefaultProps.minItems : 1,
                maxItems: processedDefaultProps.maxItems !== undefined ? processedDefaultProps.maxItems : 10,
                buttonText: processedDefaultProps.buttonText || 'Add Item',
                removeText: processedDefaultProps.removeText || 'Remove',
                fields: processedDefaultProps.fields || [
                  { type: 'text', name: 'field_1', label: 'Field 1', placeholder: 'Enter value' }
                ],
                ...processedDefaultProps
              };
              break;
              
            case 'dynamic-list':
              // Ensure all required dynamic list properties
              processedDefaultProps = {
                label: processedDefaultProps.label || 'Dynamic List',
                name: processedDefaultProps.name || `dynamic_list_${index + 1}`,
                help: processedDefaultProps.help || '',
                placeholder: processedDefaultProps.placeholder || 'Enter item',
                buttonText: processedDefaultProps.buttonText || 'Add Item',
                minItems: processedDefaultProps.minItems !== undefined ? processedDefaultProps.minItems : 0,
                maxItems: processedDefaultProps.maxItems !== undefined ? processedDefaultProps.maxItems : 20,
                defaultItems: Array.isArray(processedDefaultProps.defaultItems) ? processedDefaultProps.defaultItems : ['Item 1', 'Item 2'],
                ...processedDefaultProps
              };
              break;
              
            case 'info-display':
              // Ensure all required info display properties
              processedDefaultProps = {
                title: processedDefaultProps.title || 'Information',
                name: processedDefaultProps.name || `info_display_${index + 1}`,
                help: processedDefaultProps.help || '',
                layout: processedDefaultProps.layout || 'vertical',
                showBorder: processedDefaultProps.showBorder !== undefined ? processedDefaultProps.showBorder : true,
                backgroundColor: processedDefaultProps.backgroundColor || '#f8fafc',
                fields: Array.isArray(processedDefaultProps.fields) ? processedDefaultProps.fields : [
                  { label: 'Info Item', value: 'Value', key: 'item_1' }
                ],
                ...processedDefaultProps
              };
              break;
              
            case 'file':
              // Ensure all required file upload properties
              processedDefaultProps = {
                label: processedDefaultProps.label || 'File Upload',
                name: processedDefaultProps.name || `file_upload_${index + 1}`,
                help: processedDefaultProps.help || 'Upload a file',
                accept: processedDefaultProps.accept || '.pdf,.doc,.docx,.jpg,.jpeg,.png',
                ...processedDefaultProps
              };
              break;
              
            case 'heading':
              // Ensure all required heading properties
              processedDefaultProps = {
                value: processedDefaultProps.value || 'Heading',
                level: processedDefaultProps.level || 2,
                ...processedDefaultProps
              };
              break;
              
            case 'paragraph':
              // Ensure all required paragraph properties
              processedDefaultProps = {
                value: processedDefaultProps.value || 'Paragraph text',
                ...processedDefaultProps
              };
              break;
              
            case 'select':
            case 'radio':
            case 'checkbox':
              // Ensure options array exists
              if (!Array.isArray(processedDefaultProps.options) || processedDefaultProps.options.length === 0) {
                processedDefaultProps.options = [
                  { label: 'Option 1', value: 'option_1' },
                  { label: 'Option 2', value: 'option_2' }
                ];
              }
              // Fall through for other basic properties
              
            default:
              // Basic properties for all other component types
              if (!processedDefaultProps.label && !['heading', 'paragraph', 'divider'].includes(component.type)) {
                processedDefaultProps.label = component.name || component.type.charAt(0).toUpperCase() + component.type.slice(1);
              }
              
              if (!processedDefaultProps.name && !['heading', 'paragraph', 'divider'].includes(component.type)) {
                processedDefaultProps.name = `${component.type}_${index + 1}`;
              }
              
              break;
          }
        }
        
        // Create a component in the expected format for addComponent
        const formattedComponent = {
          type: component.type,
          name: component.name || component.type,
          category: getDefaultCategory(component.type),
          icon: getDefaultIcon(component.type),
          // Use the processed default props
          defaultProps: processedDefaultProps
        };
        
        console.log('Formatted component:', formattedComponent);
        
        // Add the component to the form
        formStore.addComponent(formattedComponent);
      });
      
      console.log('Total components added:', formStore.formComponents.length);
    } else {
      console.warn('No components found in template');
    }
    
    // Set script and CSS if available
    if (template.script) {
      formStore.formCustomScript = template.script;
      console.log('Applied custom script');
    }
    
    if (template.css) {
      formStore.formCustomCSS = template.css;
      console.log('Applied custom CSS');
    }
    
    // Enable events if the template uses scripts
    if (template.hasScript) {
      formStore.formEvents = {
        onLoad: true,
        onFieldChange: true,
        onSubmit: template.script && template.script.includes('onSubmit'),
        onValidation: template.script && template.script.includes('onValidation')
      };
      console.log('Enabled form events');
    }
    
    // Mark as having unsaved changes
    formStore.hasUnsavedChanges = true;
    
    // Show success message
    toast.success(`Template "${template.name}" applied successfully`);
  } catch (error) {
    console.error('Error applying template:', error);
    toast.error('Failed to apply template: ' + error.message);
  }
};

// Helper function to get default category for component type
const getDefaultCategory = (type) => {
  const categories = {
    // Basic inputs
    'text': 'Basic Inputs',
    'textarea': 'Basic Inputs',
    'number': 'Basic Inputs',
    'email': 'Basic Inputs',
    'password': 'Basic Inputs',
    'url': 'Basic Inputs',
    'tel': 'Basic Inputs',
    'hidden': 'Basic Inputs',
    'date': 'Basic Inputs',
    'time': 'Basic Inputs',
    'datetime-local': 'Basic Inputs',
    
    // Selection inputs
    'select': 'Selection Inputs',
    'checkbox': 'Selection Inputs',
    'radio': 'Selection Inputs',
    'switch': 'Selection Inputs',
    'range': 'Selection Inputs',
    'color': 'Selection Inputs',
    
    // Layout elements
    'heading': 'Layout',
    'paragraph': 'Layout',
    'divider': 'Layout',
    'info-display': 'Layout',
    
    // Advanced inputs
    'file': 'Advanced',
    'button': 'Advanced',
    'image-preview': 'Advanced',
    'repeating-group': 'Advanced',
    'dynamic-list': 'Advanced'
  };
  
  return categories[type] || 'Basic Inputs';
};

// Helper function to get default icon for component type
const getDefaultIcon = (type) => {
  const icons = {
    // Basic inputs
    'text': 'material-symbols:text-fields',
    'textarea': 'material-symbols:article-outline',
    'number': 'material-symbols:counter-1-outline',
    'email': 'material-symbols:mail-outline',
    'password': 'material-symbols:password',
    'url': 'material-symbols:link',
    'tel': 'heroicons:device-phone-mobile',
    'hidden': 'material-symbols:visibility-off',
    'date': 'material-symbols:calendar-month-outline',
    'time': 'material-symbols:schedule-outline',
    'datetime-local': 'material-symbols:event-outline',
    
    // Selection inputs
    'select': 'material-symbols:arrow-drop-down-circle-outline',
    'checkbox': 'material-symbols:check-box-outline',
    'radio': 'material-symbols:radio-button-checked-outline',
    'switch': 'material-symbols:toggle-on',
    'range': 'material-symbols:linear-scale',
    'color': 'material-symbols:palette',
    
    // Layout elements
    'heading': 'material-symbols:title',
    'paragraph': 'material-symbols:text-snippet-outline',
    'divider': 'material-symbols:horizontal-rule',
    'info-display': 'material-symbols:info-outline',
    
    // Advanced inputs
    'file': 'material-symbols:upload-file-outline',
    'button': 'material-symbols:smart-button',
    'image-preview': 'material-symbols:image-outline',
    'repeating-group': 'material-symbols:playlist-add-outline',
    'dynamic-list': 'material-symbols:format-list-bulleted'
  };
  
  return icons[type] || 'material-symbols:add';
};

// Component icon and name helper functions (available to template)
const getComponentIcon = (type) => {
  const icons = {
    text: 'heroicons:document-text',
    textarea: 'heroicons:document-text',
    number: 'heroicons:hashtag',
    email: 'heroicons:envelope',
    password: 'heroicons:key',
    url: 'heroicons:link',
    tel: 'heroicons:device-phone-mobile',
    mask: 'heroicons:pencil-square',
    hidden: 'heroicons:eye-slash',
    select: 'heroicons:chevron-down',
    checkbox: 'heroicons:check-badge',
    radio: 'heroicons:radio',
    switch: 'material-symbols:toggle-on',
    date: 'heroicons:calendar-days',
    time: 'heroicons:clock',
    'datetime-local': 'heroicons:calendar',
    range: 'heroicons:adjustments-horizontal',
    color: 'heroicons:swatch',
    file: 'heroicons:document-arrow-up',
    otp: 'heroicons:key',
    dropzone: 'heroicons:cloud-arrow-up',
    button: 'heroicons:cursor-arrow-rays',
    heading: 'heroicons:h1',
    paragraph: 'heroicons:document-text',
    divider: 'heroicons:minus',
    'info-display': 'heroicons:information-circle'
  }
  return icons[type] || 'heroicons:square-3-stack-3d'
}

const getComponentTypeName = (type) => {
  const names = {
    text: 'Text Field',
    textarea: 'Text Area',
    number: 'Number Field',
    email: 'Email Field',
    password: 'Password Field',
    url: 'URL Field',
    tel: 'Phone Field',
    mask: 'Masked Input',
    hidden: 'Hidden Field',
    select: 'Dropdown Menu',
    checkbox: 'Checkboxes',
    radio: 'Radio Buttons',
    switch: 'Switch Toggle',
    date: 'Date Picker',
    time: 'Time Picker',
    'datetime-local': 'Date & Time',
    range: 'Range Slider',
    color: 'Color Picker',
    file: 'File Upload',
    otp: 'Verification Code',
    dropzone: 'File Drop Zone',
    button: 'Action Button',
    heading: 'Heading Text',
    paragraph: 'Paragraph Text',
    divider: 'Divider Line',
    'info-display': 'Information Display'
  }
  return names[type] || 'Form Field'
}

const getComponentTypeShort = (type) => {
  const shortNames = {
    text: 'TXT',
    textarea: 'TXT',
    number: 'NUM',
    email: 'EML',
    password: 'PWD',
    url: 'URL',
    tel: 'TEL',
    mask: 'MSK',
    hidden: 'HID',
    select: 'SEL',
    checkbox: 'CHK',
    radio: 'RAD',
    switch: 'SWT',
    date: 'DTE',
    time: 'TME',
    'datetime-local': 'DTM',
    range: 'RNG',
    color: 'CLR',
    file: 'FIL',
    otp: 'OTP',
    dropzone: 'DRP',
    button: 'BTN',
    heading: 'H' + (formStore.selectedComponent?.props?.level || '2'),
    paragraph: 'TXT',
    divider: 'DIV',
    'info-display': 'INF'
  }
  return shortNames[type] || 'FLD'
}

// Quick settings panel state and functions
const quickSettings = ref({});

// Compact width options for the sidebar
const compactWidthOptions = [
  { name: 'S', value: 25, gridColumns: 3, description: 'Small (25%)' },
  { name: 'M', value: 50, gridColumns: 6, description: 'Medium (50%)' },
  { name: 'L', value: 75, gridColumns: 9, description: 'Large (75%)' },
  { name: 'XL', value: 100, gridColumns: 12, description: 'Extra Large (100%)' }
];

// Watch for selected component changes to update quick settings
watch(() => formStore.selectedComponent, (newComponent) => {
  if (newComponent) {
    // Auto-open panel when component is selected
    showFieldSettingsPanel.value = true;
    
    // Initialize quick settings
    quickSettings.value = {
      label: newComponent.props.label || '',
      name: newComponent.props.name || '',
      placeholder: newComponent.props.placeholder || '',
      required: newComponent.props.validation?.includes('required') || false
    };
  }
}, { immediate: true });

// Toggle panel function
const toggleFieldSettingsPanel = () => {
  showFieldSettingsPanel.value = !showFieldSettingsPanel.value;
};

// Show/hide specific quick fields based on component type
const showQuickField = (fieldName) => {
  if (!formStore.selectedComponent) return false;
  
  const fieldConfig = {
    label: ['text', 'textarea', 'number', 'email', 'password', 'url', 'tel', 'mask', 'select', 'checkbox', 'radio', 'switch', 'date', 'time', 'datetime-local', 'range', 'color', 'file', 'otp', 'dropzone', 'button'],
    name: ['text', 'textarea', 'number', 'email', 'password', 'url', 'tel', 'mask', 'hidden', 'select', 'checkbox', 'radio', 'switch', 'date', 'time', 'datetime-local', 'range', 'color', 'file', 'otp', 'dropzone', 'button'],
    placeholder: ['text', 'textarea', 'number', 'email', 'password', 'url', 'tel', 'mask', 'select'],
    width: ['text', 'textarea', 'number', 'email', 'password', 'url', 'tel', 'mask', 'select', 'checkbox', 'radio', 'switch', 'date', 'time', 'datetime-local', 'range', 'color', 'file', 'otp', 'dropzone', 'button', 'heading', 'paragraph', 'info-display'],
    required: ['text', 'textarea', 'number', 'email', 'password', 'url', 'tel', 'mask', 'select', 'checkbox', 'radio', 'date', 'time', 'datetime-local', 'file', 'otp', 'dropzone']
  };
  
  return fieldConfig[fieldName]?.includes(formStore.selectedComponent.type) || false;
};

// Get placeholder text for different fields
const getPlaceholder = (fieldName) => {
  if (!formStore.selectedComponent) return '';
  
  const placeholders = {
    label: `Enter ${formStore.selectedComponent.type} label`,
    name: `${formStore.selectedComponent.type}_field`,
    placeholder: 'Enter placeholder text...'
  };
  
  return placeholders[fieldName] || '';
};

// Update quick setting and sync with component
const updateQuickSetting = (key, value, gridColumns = null) => {
  if (!formStore.selectedComponent) return;
  
  const updatedComponent = { ...formStore.selectedComponent };
  
  if (key === 'width') {
    updatedComponent.props.width = `${value}%`;
    if (gridColumns) {
      updatedComponent.props.gridColumn = `span ${gridColumns}`;
    }
  } else {
    updatedComponent.props[key] = value;
  }
  
  formStore.updateComponent(updatedComponent);
  quickSettings.value[key] = value;
};

// Update validation settings
const updateQuickValidation = (rule, enabled) => {
  if (!formStore.selectedComponent) return;
  
  const updatedComponent = { ...formStore.selectedComponent };
  let current = updatedComponent.props.validation || '';
  const rules = current.split('|').filter(r => r && r !== rule);
  
  if (enabled) {
    rules.push(rule);
  }
  
  updatedComponent.props.validation = rules.join('|');
  formStore.updateComponent(updatedComponent);
  quickSettings.value.required = enabled;
};

// Get current component width percentage
const getComponentWidthPercent = () => {
  if (!formStore.selectedComponent) return 100;
  const width = formStore.selectedComponent.props.width || '100%';
  return parseInt(width.replace('%', ''));
};

// Open full settings modal
const openFullSettingsModal = () => {
  showFieldSettings.value = true;
};

// Duplicate component
const duplicateComponent = () => {
  if (!formStore.selectedComponent) return;
  
  const originalComponent = formStore.selectedComponent;
  const duplicatedProps = { ...originalComponent.props };
  
  // Update name to avoid conflicts
  if (duplicatedProps.name) {
    duplicatedProps.name = duplicatedProps.name + '_copy';
  }
  
  // Update label to indicate it's a copy
  if (duplicatedProps.label) {
    duplicatedProps.label = duplicatedProps.label + ' (Copy)';
  }
  
  const componentToDuplicate = {
    type: originalComponent.type,
    name: getComponentTypeName(originalComponent.type) + ' (Copy)',
    category: getDefaultCategory(originalComponent.type),
    icon: getComponentIcon(originalComponent.type),
    defaultProps: duplicatedProps
  };
  
  formStore.addComponent(componentToDuplicate);
  toast.success('Component duplicated successfully');
};

// Delete component
const deleteComponent = () => {
  if (!formStore.selectedComponent) return;
  
  if (confirm('Are you sure you want to delete this component?')) {
    formStore.deleteComponent(formStore.selectedComponent.id);
    toast.success('Component deleted successfully');
  }
};

const handleConditionalLogicGenerated = (script) => {
  // Add the generated script to the form's custom script
  formStore.formCustomScript += `\n// Conditional Logic Script\n${script}`;
  toast.success('Conditional logic script added successfully');
};
</script>

<style scoped>
.form-name-input {
  width: 100%;
  max-width: 400px;
}

.form-name-input :deep(.formkit-inner) {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.form-name-input :deep(.formkit-inner:focus-within) {
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1);
}

.form-name-input :deep(input::placeholder) {
  color: rgba(255, 255, 255, 0.6);
}

.form-name-input :deep(.formkit-message) {
  color: rgba(255, 200, 200, 0.9);
  font-size: 0.7rem;
  position: absolute;
}

.grid-preview-container {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-auto-flow: row dense;
  column-gap: 16px;
  row-gap: 16px;
  width: 100%;
  box-sizing: border-box;
}

.form-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.form-submit {
  margin-top: 2rem;
  width: 100%;
}

/* Drop zone styling */
#form-drop-zone {
  transition: all 0.2s ease;
}

#form-drop-zone:not(.border-solid) {
  cursor: default;
}

#form-drop-zone.border-blue-400 {
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.3);
}

/* Preview mode styling */
.preview-mode {
  max-width: 1200px;
  margin: 0 auto;
  background-color: white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border-radius: 8px !important;
  border-color: #e5e7eb !important;
}

/* Floating Action Button */
.field-settings-fab {
  @apply w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.field-settings-fab:hover {
  transform: scale(1.05);
}

/* Instruction Tooltip */
.instruction-tooltip {
  @apply bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3 relative;
  animation: fadeInBounce 0.6s ease-out;
}

.instruction-arrow {
  @apply absolute top-full left-1/2 transform -translate-x-1/2;
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 8px solid #f3f4f6;
}

.instruction-arrow::before {
  content: '';
  position: absolute;
  top: -9px;
  left: -8px;
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 8px solid #d1d5db;
}

@keyframes fadeInBounce {
  0% {
    opacity: 0;
    transform: translateY(-10px);
  }
  60% {
    opacity: 1;
    transform: translateY(5px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Enhanced hover states for form components */
.hover\:bg-blue-25:hover {
  background-color: rgba(59, 130, 246, 0.04);
}

/* FAB Tooltip */
.fab-tooltip {
  @apply absolute bottom-full right-0 mb-2 opacity-0 pointer-events-none transition-opacity duration-300;
}

.tooltip-arrow {
  @apply absolute top-full right-4;
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 4px solid #1f2937;
}

/* Enhanced component selection feedback */
.form-component {
  position: relative;
}

.form-component::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, #3b82f6, #1d4ed8);
  border-radius: 8px;
  opacity: 0;
  z-index: -1;
  transition: opacity 0.3s ease;
}

.form-component.ring-2::before {
  opacity: 0.1;
}

/* Field Settings Panel */
.field-settings-panel {
  @apply relative bg-white border-l border-gray-200 flex flex-col overflow-hidden transition-all duration-300 ease-in-out;
}

.panel-expanded {
  @apply w-80;
}

.panel-collapsed {
  @apply w-12;
}

.panel-header-toggle-btn {
  @apply text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-100;
}

.collapsed-toggle-btn {
  @apply w-8 h-8 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 shadow-sm;
}

.panel-content {
  @apply flex-1 flex flex-col overflow-hidden;
}

.panel-header {
  @apply px-4 py-3 border-b border-gray-200 bg-gray-50;
}

.panel-body {
  @apply flex-1 overflow-y-auto;
}

.empty-state {
  @apply h-full flex items-center justify-center;
}

.component-settings {
  @apply p-4 space-y-4;
}

.component-header {
  @apply pb-3 border-b border-gray-100;
}

.component-icon {
  @apply w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0;
}

.quick-actions {
  @apply grid grid-cols-1 gap-2;
}

.action-btn {
  @apply flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200;
}

.action-btn.primary {
  @apply bg-blue-600 text-white hover:bg-blue-700;
}

.action-btn.secondary {
  @apply bg-gray-100 text-gray-700 hover:bg-gray-200;
}

.action-btn.danger {
  @apply bg-red-100 text-red-700 hover:bg-red-200;
}

.quick-settings {
  @apply space-y-3;
}

.settings-section-title {
  @apply text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3;
}

.setting-item {
  @apply space-y-1.5;
}

.setting-label {
  @apply block text-xs font-medium text-gray-700;
}

.width-selector-compact {
  @apply flex space-x-1;
}

.width-btn {
  @apply flex-1 px-2 py-1.5 text-xs font-medium text-center rounded-md border border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 transition-colors duration-200;
}

.width-btn.active {
  @apply border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-200;
}

.setting-toggle {
  @apply flex items-center cursor-pointer;
}

.toggle-input {
  @apply sr-only;
}

.toggle-slider {
  @apply relative inline-block w-8 h-4 mr-2 bg-gray-200 rounded-full transition-colors duration-200 ease-in-out;
}

.setting-toggle input:checked + .toggle-slider {
  @apply bg-blue-600;
}

.toggle-slider::before {
  @apply absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform duration-200 ease-in-out;
  content: '';
}

.setting-toggle input:checked + .toggle-slider::before {
  @apply transform translate-x-4;
}

.toggle-label {
  @apply text-xs font-medium text-gray-700;
}

.collapsed-info {
  @apply h-full flex flex-col px-2 py-3;
}

.collapsed-header {
  @apply mb-4 flex justify-center;
}

.collapsed-content {
  @apply text-center w-full flex-1 flex flex-col justify-center items-center;
}

.selected-component-collapsed {
  @apply flex flex-col items-center space-y-2;
}

.component-icon-collapsed {
  @apply w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center;
}

.component-type-badge {
  @apply text-xs font-bold text-blue-700 bg-blue-100 px-1.5 py-1 rounded whitespace-nowrap;
  writing-mode: vertical-rl;
  text-orientation: upright;
}

.no-selection-collapsed {
  @apply flex flex-col items-center space-y-2;
}

.writing-mode-vertical {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  transform: rotate(180deg);
}
</style>
