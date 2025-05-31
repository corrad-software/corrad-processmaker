<template>
  <RsModal 
    v-model="isOpen" 
    :title="modalTitle" 
    size="xl" 
    position="center"
    @close="handleClose"
  >
    <template #body>
      <div v-if="component" class="field-settings-modal">
        <!-- Component Info Header -->
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div class="flex items-center space-x-3">
            <div class="flex-shrink-0">
              <Icon :name="getComponentIcon(component.type)" class="w-8 h-8 text-blue-600" />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-lg font-medium text-gray-900">
                {{ getComponentTypeName(component.type) }}
              </h3>
              <p class="text-sm text-gray-600">
                {{ getComponentDescription(component.type) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Settings Tabs -->
        <div class="border-b border-gray-200 mb-6">
          <nav class="-mb-px flex space-x-8">
            <button
              v-for="tab in availableTabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              class="py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap"
              :class="activeTab === tab.id 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            >
              <Icon :name="tab.icon" class="w-4 h-4 inline mr-2" />
              {{ tab.label }}
            </button>
          </nav>
        </div>

        <!-- Tab Content -->
        <div class="tab-content">
          <!-- Basic Settings Tab -->
          <div v-if="activeTab === 'basic'" class="space-y-6">
            <!-- Essential Settings Section -->
            <div class="settings-section">
              <div class="section-header">
                <h4 class="section-title">
                  <Icon name="heroicons:identification" class="w-5 h-5 mr-2" />
                  Essential Settings
                </h4>
                <p class="section-description">Basic information and identification for this field</p>
              </div>
              
              <div class="section-content">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormKit
                    v-if="showField('label') && component.type !== 'button'"
                    type="text"
                    label="Field Label"
                    name="label"
                    v-model="configModel.label"
                    help="What users will see above this field"
                    :classes="{ outer: 'field-wrapper' }"
                    placeholder="e.g., Full Name, Email Address"
                  />
                  
                  <!-- Button Text (instead of label for buttons) -->
                  <FormKit
                    v-if="component.type === 'button'"
                    type="text"
                    label="Button Text"
                    name="label"
                    v-model="configModel.label"
                    help="Text displayed on the button"
                    :classes="{ outer: 'field-wrapper' }"
                    placeholder="e.g., Submit, Save, Continue"
                  />
                  
                  <FormKit
                    v-if="showField('name')"
                    type="text"
                    label="Field Name (Internal)"
                    name="name"
                    v-model="configModel.name"
                    help="Used internally to identify this field"
                    validation="required|alpha_numeric"
                    :classes="{ outer: 'field-wrapper' }"
                    placeholder="e.g., full_name, email_address"
                  />
                </div>

                <FormKit
                  v-if="showField('placeholder')"
                  type="text"
                  label="Placeholder Text"
                  name="placeholder"
                  v-model="configModel.placeholder"
                  help="Hint text shown inside the empty field"
                  :classes="{ outer: 'field-wrapper' }"
                  placeholder="e.g., Enter your email address..."
                />
                
                <FormKit
                  v-if="showField('help')"
                  type="textarea"
                  label="Help Text"
                  name="help"
                  v-model="configModel.help"
                  help="Additional instructions or guidance for users"
                  :classes="{ outer: 'field-wrapper' }"
                  placeholder="e.g., We'll use this to send you updates about your order"
                  rows="2"
                />
              </div>
            </div>

            <!-- Layout & Appearance Section -->
            <div v-if="showField('width')" class="settings-section">
              <div class="section-header">
                <h4 class="section-title">
                  <Icon name="heroicons:squares-2x2" class="w-5 h-5 mr-2" />
                  Layout & Size
                </h4>
                <p class="section-description">Control how this field appears in your form</p>
              </div>
              
              <div class="section-content">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-3">Field Width</label>
                  
                  <!-- Width Options with Visual Grid Preview -->
                  <div class="width-selector">
                    <div 
                      v-for="option in widthOptions" 
                      :key="option.value"
                      @click="setComponentWidth(option.value, option.gridColumns)"
                      class="width-option"
                      :class="{
                        'selected': getComponentWidthPercent() === option.value,
                        'recommended': isRecommendedWidth(option.type)
                      }"
                    >
                      <!-- Visual Grid Preview -->
                      <div class="grid-preview">
                        <div class="grid-container-mini">
                          <div 
                            v-for="i in 12" 
                            :key="i"
                            class="grid-cell"
                            :class="{
                              'active': i <= option.gridColumns,
                              'inactive': i > option.gridColumns
                            }"
                          ></div>
                        </div>
                      </div>
                      
                      <!-- Option Info -->
                      <div class="option-info">
                        <div class="option-name">
                          {{ option.name }}
                          <span v-if="isRecommendedWidth(option.type)" class="recommended-badge">
                            Recommended
                          </span>
                        </div>
                        <div class="option-description">{{ option.description }}</div>
                        <div class="option-use-case">{{ option.useCase }}</div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Current Selection Feedback -->
                  <div class="current-selection-feedback">
                    <div class="feedback-row">
                      <span class="feedback-label">Current width:</span>
                      <span class="feedback-value">{{ getCurrentWidthOption()?.name || 'Custom' }}</span>
                    </div>
                    <div class="feedback-row">
                      <span class="feedback-label">Grid columns:</span>
                      <span class="feedback-value">{{ getCurrentGridColumns() }} of 12</span>
                    </div>
                    
                    <!-- Visual representation -->
                    <div class="current-width-visual">
                      <div class="visual-grid">
                        <div 
                          v-for="i in 12" 
                          :key="i"
                          class="visual-cell"
                          :class="{
                            'filled': i <= getCurrentGridColumns(),
                            'empty': i > getCurrentGridColumns()
                          }"
                        ></div>
                      </div>
                      <div class="visual-label">
                        {{ getCurrentGridColumns() }}/12 columns ({{ configModel.width || '100%' }})
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Component-Specific Settings -->
            <div v-if="hasSpecificSettings" class="settings-section">
              <div class="section-header">
                <h4 class="section-title">
                  <Icon name="heroicons:cog-6-tooth" class="w-5 h-5 mr-2" />
                  {{ getComponentTypeName(component.type) }} Settings
                </h4>
                <p class="section-description">Settings specific to this type of field</p>
              </div>
              
              <div class="section-content">
                <!-- Text Input Specific -->
                <template v-if="component.type === 'mask'">
                  <FormKit
                    type="text"
                    label="Input Mask Pattern"
                    name="mask"
                    v-model="configModel.mask"
                    help="Pattern for formatting input (e.g., ###-###-#### for phone)"
                    :classes="{ outer: 'field-wrapper' }"
                    placeholder="###-###-####"
                  />
                  <div class="mask-examples">
                    <p class="text-sm font-medium text-gray-700 mb-2">Common patterns:</p>
                    <div class="grid grid-cols-2 gap-2 text-xs">
                      <RsButton @click="configModel.mask = '###-###-####'" variant="secondary-outline" size="sm">
                        Phone: ###-###-####
                      </RsButton>
                      <RsButton @click="configModel.mask = '##/##/####'" variant="secondary-outline" size="sm">
                        Date: ##/##/####
                      </RsButton>
                      <RsButton @click="configModel.mask = 'AA-####'" variant="secondary-outline" size="sm">
                        Code: AA-####
                      </RsButton>
                      <RsButton @click="configModel.mask = '#### #### #### ####'" variant="secondary-outline" size="sm">
                        Credit Card: #### #### #### ####
                      </RsButton>
                    </div>
                  </div>
                </template>

                <!-- OTP Specific -->
                <template v-if="component.type === 'otp'">
                  <FormKit
                    type="range"
                    label="Number of Digits"
                    name="digits"
                    v-model="configModel.digits"
                    help="How many digits for the verification code"
                    :min="4"
                    :max="8"
                    :step="1"
                    :classes="{ outer: 'field-wrapper' }"
                  />
                  <div class="text-center mt-2">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {{ configModel.digits || 6 }} digits
                    </span>
                  </div>
                </template>

                <!-- File Upload Specific -->
                <template v-if="component.type === 'dropzone'">
                  <div class="grid grid-cols-2 gap-4">
                    <FormKit
                      type="text"
                      label="Accepted File Types"
                      name="accept"
                      v-model="configModel.accept"
                      help="File types allowed (e.g., image/*, .pdf)"
                      :classes="{ outer: 'field-wrapper' }"
                      placeholder="image/*,.pdf,.doc"
                    />
                    
                    <FormKit
                      type="number"
                      label="Max File Size (MB)"
                      name="maxSize"
                      v-model="configModel.maxSizeMB"
                      help="Maximum size per file in megabytes"
                      :classes="{ outer: 'field-wrapper' }"
                      placeholder="5"
                    />
                  </div>
                  
                  <div class="grid grid-cols-2 gap-4">
                    <FormKit
                      type="number"
                      label="Max Number of Files"
                      name="maxFiles"
                      v-model="configModel.maxFiles"
                      help="Maximum number of files allowed"
                      :classes="{ outer: 'field-wrapper' }"
                      :min="1"
                      placeholder="5"
                    />
                    
                    <FormKit
                      type="switch"
                      label="Allow Multiple Files"
                      name="multiple"
                      v-model="configModel.multiple"
                      help="Enable uploading multiple files at once"
                      :classes="{ outer: 'field-wrapper' }"
                    />
                  </div>
                </template>

                <!-- Range Slider Specific -->
                <template v-if="component.type === 'range'">
                  <div class="grid grid-cols-3 gap-4">
                    <FormKit
                      type="number"
                      label="Minimum Value"
                      name="min"
                      v-model="configModel.min"
                      help="Lowest value allowed"
                      :classes="{ outer: 'field-wrapper' }"
                    />
                    
                    <FormKit
                      type="number"
                      label="Maximum Value"
                      name="max"
                      v-model="configModel.max"
                      help="Highest value allowed"
                      :classes="{ outer: 'field-wrapper' }"
                    />
                    
                    <FormKit
                      type="number"
                      label="Step Size"
                      name="step"
                      v-model="configModel.step"
                      help="Increment between values"
                      :classes="{ outer: 'field-wrapper' }"
                      :min="0.01"
                      :step="0.01"
                    />
                  </div>
                </template>

                <!-- Heading Level -->
                <template v-if="component.type === 'heading'">
                  <FormKit
                    type="select"
                    label="Heading Size"
                    name="level"
                    v-model="configModel.level"
                    :options="[
                      { label: '🔵 Heading 1 (Largest)', value: 1 },
                      { label: '🟡 Heading 2 (Large)', value: 2 },
                      { label: '🟠 Heading 3 (Medium)', value: 3 },
                      { label: '🔴 Heading 4 (Small)', value: 4 }
                    ]"
                    help="Choose the size and importance of this heading"
                    :classes="{ outer: 'field-wrapper' }"
                  />
                </template>

                <!-- Button Configuration -->
                <template v-if="component.type === 'button'">
                  <div class="grid grid-cols-2 gap-4">
                    <FormKit
                      type="select"
                      label="Button Type"
                      name="buttonType"
                      v-model="configModel.buttonType"
                      :options="[
                        { label: '🔵 Button (Regular)', value: 'button' },
                        { label: '✅ Submit (Form Submit)', value: 'submit' },
                        { label: '🔄 Reset (Clear Form)', value: 'reset' }
                      ]"
                      help="Choose the button behavior"
                      :classes="{ outer: 'field-wrapper' }"
                    />
                    
                    <FormKit
                      type="select"
                      label="Button Style"
                      name="variant"
                      v-model="configModel.variant"
                      :options="[
                        { label: 'Primary (Blue)', value: 'primary' },
                        { label: 'Secondary (Gray)', value: 'secondary' },
                        { label: 'Success (Green)', value: 'success' },
                        { label: 'Danger (Red)', value: 'danger' },
                        { label: 'Warning (Orange)', value: 'warning' }
                      ]"
                      help="Visual appearance of the button"
                      :classes="{ outer: 'field-wrapper' }"
                    />
                  </div>
                  
                  <FormKit
                    type="select"
                    label="Button Size"
                    name="size"
                    v-model="configModel.size"
                    :options="[
                      { label: 'Small', value: 'sm' },
                      { label: 'Medium', value: 'md' },
                      { label: 'Large', value: 'lg' }
                    ]"
                    help="Size of the button"
                    :classes="{ outer: 'field-wrapper' }"
                  />
                </template>

                <!-- Dynamic List Configuration -->
                <template v-if="component.type === 'dynamic-list'">
                  <div class="space-y-6">
                    <!-- Basic List Settings -->
                    <div class="grid grid-cols-2 gap-4">
                      <FormKit
                        type="text"
                        label="Add Button Text"
                        name="buttonText"
                        v-model="configModel.buttonText"
                        help="Text for the add item button"
                        :classes="{ outer: 'field-wrapper' }"
                        placeholder="Add Item"
                      />
                      
                      <FormKit
                        type="select"
                        label="Item Type"
                        name="itemType"
                        v-model="configModel.itemType"
                        :options="[
                          { label: 'Text', value: 'text' },
                          { label: 'Number', value: 'number' },
                          { label: 'Email', value: 'email' },
                          { label: 'URL', value: 'url' }
                        ]"
                        help="Type of data for list items"
                        :classes="{ outer: 'field-wrapper' }"
                      />
                    </div>

                    <!-- Item Limits -->
                    <div class="grid grid-cols-2 gap-4">
                      <FormKit
                        type="number"
                        label="Minimum Items"
                        name="minItems"
                        v-model="configModel.minItems"
                        help="Minimum number of items required"
                        :classes="{ outer: 'field-wrapper' }"
                        :min="0"
                        placeholder="0"
                      />
                      
                      <FormKit
                        type="number"
                        label="Maximum Items"
                        name="maxItems"
                        v-model="configModel.maxItems"
                        help="Maximum number of items allowed"
                        :classes="{ outer: 'field-wrapper' }"
                        :min="1"
                        placeholder="10"
                      />
                    </div>

                    <!-- Item Validation -->
                    <FormKit
                      type="text"
                      label="Item Validation Rules"
                      name="itemValidation"
                      v-model="configModel.itemValidation"
                      help="Validation rules for individual items (e.g., 'required|min:3|max:50')"
                      :classes="{ outer: 'field-wrapper' }"
                      placeholder="required|min:3"
                    />

                    <!-- Behavior Settings -->
                    <div class="space-y-4">
                      <h5 class="text-sm font-medium text-gray-700 border-b pb-2">Behavior Settings</h5>
                      
                      <div class="grid grid-cols-2 gap-4">
                        <FormKit
                          type="switch"
                          label="Allow Duplicates"
                          name="allowDuplicates"
                          v-model="configModel.allowDuplicates"
                          help="Allow duplicate items in the list"
                          :classes="{ outer: 'field-wrapper' }"
                        />

                        <FormKit
                          type="switch"
                          label="Enable Sorting"
                          name="enableSorting"
                          v-model="configModel.enableSorting"
                          help="Allow drag & drop reordering"
                          :classes="{ outer: 'field-wrapper' }"
                        />

                        <FormKit
                          type="switch"
                          label="Enable Search"
                          name="enableSearch"
                          v-model="configModel.enableSearch"
                          help="Add search/filter functionality"
                          :classes="{ outer: 'field-wrapper' }"
                        />

                        <FormKit
                          type="switch"
                          label="Show Item Counter"
                          name="showItemCounter"
                          v-model="configModel.showItemCounter"
                          help="Display current item count"
                          :classes="{ outer: 'field-wrapper' }"
                        />

                        <FormKit
                          type="switch"
                          label="Confirm Delete"
                          name="confirmDelete"
                          v-model="configModel.confirmDelete"
                          help="Require confirmation before deleting"
                          :classes="{ outer: 'field-wrapper' }"
                        />

                        <FormKit
                          type="switch"
                          label="Bulk Operations"
                          name="bulkOperations"
                          v-model="configModel.bulkOperations"
                          help="Enable bulk select/delete operations"
                          :classes="{ outer: 'field-wrapper' }"
                        />
                      </div>
                    </div>

                    <!-- Import/Export Settings -->
                    <div class="space-y-4">
                      <h5 class="text-sm font-medium text-gray-700 border-b pb-2">Import/Export Settings</h5>
                      
                      <div class="grid grid-cols-2 gap-4">
                        <FormKit
                          type="switch"
                          label="Enable Import"
                          name="importEnabled"
                          v-model="configModel.importEnabled"
                          help="Allow importing items from files"
                          :classes="{ outer: 'field-wrapper' }"
                        />

                        <FormKit
                          type="select"
                          label="Export Format"
                          name="exportFormat"
                          v-model="configModel.exportFormat"
                          :options="[
                            { label: 'JSON', value: 'json' },
                            { label: 'CSV', value: 'csv' },
                            { label: 'Text', value: 'txt' }
                          ]"
                          help="Default format for exporting items"
                          :classes="{ outer: 'field-wrapper' }"
                        />
                      </div>
                    </div>

                    <!-- Default Items -->
                    <div class="space-y-4">
                      <h5 class="text-sm font-medium text-gray-700 border-b pb-2">Default Items</h5>
                      
                      <div class="border rounded-md p-3 bg-gray-50 space-y-2">
                        <div v-for="(item, index) in (configModel.defaultItems || [])" :key="index" class="flex items-center">
                          <input
                            type="text"
                            v-model="configModel.defaultItems[index]"
                            class="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                            placeholder="Enter default item"
                          />
                          <button 
                            @click="removeDefaultItem(index)"
                            class="ml-2 text-red-500 hover:text-red-700"
                            type="button"
                          >
                            <Icon name="material-symbols:delete-outline" class="w-4 h-4" />
                          </button>
                        </div>
                        <button 
                          @click="addDefaultItem"
                          class="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                          type="button"
                        >
                          <Icon name="material-symbols:add-circle-outline" class="w-4 h-4 mr-1" />
                          Add Default Item
                        </button>
                      </div>
                    </div>
                  </div>
                </template>

                <!-- Repeating Table Configuration -->
                <template v-if="component.type === 'repeating-table'">
                  <div class="space-y-6">
                    <!-- Basic Table Settings -->
                    <div class="grid grid-cols-2 gap-4">
                      <FormKit
                        type="text"
                        label="Add Button Text"
                        name="buttonText"
                        v-model="configModel.buttonText"
                        help="Text for the add record button"
                        :classes="{ outer: 'field-wrapper' }"
                        placeholder="Add Record"
                      />
                      
                      <FormKit
                        type="text"
                        label="Edit Button Text"
                        name="editText"
                        v-model="configModel.editText"
                        help="Text for the edit record button"
                        :classes="{ outer: 'field-wrapper' }"
                        placeholder="Edit"
                      />
                    </div>

                    <!-- Record Limits -->
                    <div class="grid grid-cols-2 gap-4">
                      <FormKit
                        type="number"
                        label="Minimum Records"
                        name="minRecords"
                        v-model="configModel.minRecords"
                        help="Minimum number of records required"
                        :classes="{ outer: 'field-wrapper' }"
                        :min="0"
                        placeholder="0"
                      />
                      
                      <FormKit
                        type="number"
                        label="Maximum Records"
                        name="maxRecords"
                        v-model="configModel.maxRecords"
                        help="Maximum number of records allowed"
                        :classes="{ outer: 'field-wrapper' }"
                        :min="1"
                        placeholder="50"
                      />
                    </div>

                    <!-- Display Settings -->
                    <div class="space-y-4">
                      <h5 class="text-sm font-medium text-gray-700 border-b pb-2">Display Settings</h5>
                      
                      <div class="grid grid-cols-2 gap-4">
                        <FormKit
                          type="switch"
                          label="Show Row Numbers"
                          name="showRowNumbers"
                          v-model="configModel.showRowNumbers"
                          help="Display row numbers in the table"
                          :classes="{ outer: 'field-wrapper' }"
                        />

                        <FormKit
                          type="switch"
                          label="Enable Search"
                          name="enableSearch"
                          v-model="configModel.enableSearch"
                          help="Add search functionality to the table"
                          :classes="{ outer: 'field-wrapper' }"
                        />

                        <FormKit
                          type="switch"
                          label="Allow Edit"
                          name="allowEdit"
                          v-model="configModel.allowEdit"
                          help="Allow users to edit existing records"
                          :classes="{ outer: 'field-wrapper' }"
                        />

                        <FormKit
                          type="switch"
                          label="Allow Delete"
                          name="allowDelete"
                          v-model="configModel.allowDelete"
                          help="Allow users to delete records"
                          :classes="{ outer: 'field-wrapper' }"
                        />

                        <FormKit
                          type="switch"
                          label="Confirm Delete"
                          name="confirmDelete"
                          v-model="configModel.confirmDelete"
                          help="Require confirmation before deleting"
                          :classes="{ outer: 'field-wrapper' }"
                        />
                      </div>
                    </div>

                    <!-- Table Columns Configuration -->
                    <div class="space-y-4">
                      <h5 class="text-sm font-medium text-gray-700 border-b pb-2">Table Columns</h5>
                      
                      <div v-if="configModel.columns && configModel.columns.length > 0" class="space-y-4">
                        <div 
                          v-for="(column, index) in configModel.columns" 
                          :key="index"
                          class="border rounded-lg p-4 bg-gray-50"
                        >
                          <div class="flex justify-between items-center mb-3">
                            <h6 class="text-sm font-medium text-gray-800">Column {{ index + 1 }}</h6>
                            <button 
                              @click="removeTableColumn(index)"
                              class="text-red-500 hover:text-red-700 text-sm"
                              type="button"
                            >
                              <Icon name="material-symbols:delete-outline" class="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div class="grid grid-cols-2 gap-3">
                            <FormKit
                              type="text"
                              label="Column Name"
                              v-model="column.name"
                              placeholder="field_name"
                              help="Internal field name (no spaces)"
                              :classes="{ outer: 'field-wrapper mb-0' }"
                            />
                            
                            <FormKit
                              type="text"
                              label="Display Label"
                              v-model="column.label"
                              placeholder="Display Name"
                              help="What users will see"
                              :classes="{ outer: 'field-wrapper mb-0' }"
                            />
                            
                            <FormKit
                              type="select"
                              label="Field Type"
                              v-model="column.type"
                              :options="[
                                { label: 'Text', value: 'text' },
                                { label: 'Number', value: 'number' },
                                { label: 'Email', value: 'email' },
                                { label: 'Phone', value: 'tel' },
                                { label: 'Date', value: 'date' },
                                { label: 'Dropdown', value: 'select' },
                                { label: 'Text Area', value: 'textarea' }
                              ]"
                              :classes="{ outer: 'field-wrapper mb-0' }"
                            />
                            
                            <FormKit
                              type="text"
                              label="Placeholder"
                              v-model="column.placeholder"
                              placeholder="Enter value..."
                              help="Hint text for the input"
                              :classes="{ outer: 'field-wrapper mb-0' }"
                            />
                          </div>
                          
                          <div class="mt-3 grid grid-cols-2 gap-3">
                            <FormKit
                              type="switch"
                              label="Required Field"
                              v-model="column.required"
                              help="Make this field mandatory"
                              :classes="{ outer: 'field-wrapper mb-0' }"
                            />
                            
                            <FormKit
                              type="text"
                              label="Validation Rules"
                              v-model="column.validation"
                              placeholder="required|email"
                              help="Validation rules (e.g., required, email)"
                              :classes="{ outer: 'field-wrapper mb-0' }"
                            />
                          </div>
                          
                          <div v-if="column.type === 'select'" class="mt-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Options</label>
                            <div v-if="column.options && column.options.length > 0" class="space-y-2">
                              <div 
                                v-for="(option, optionIndex) in column.options" 
                                :key="optionIndex"
                                class="flex items-center space-x-2"
                              >
                                <input
                                  type="text"
                                  v-model="option.label"
                                  placeholder="Option label"
                                  class="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                                />
                                <input
                                  type="text"
                                  v-model="option.value"
                                  placeholder="Option value"
                                  class="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                                />
                                <button 
                                  @click="removeColumnOption(index, optionIndex)"
                                  class="text-red-500 hover:text-red-700"
                                  type="button"
                                >
                                  <Icon name="material-symbols:delete-outline" class="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            <button 
                              @click="addColumnOption(index)"
                              class="text-sm text-blue-600 hover:text-blue-800 flex items-center mt-2"
                              type="button"
                            >
                              <Icon name="material-symbols:add-circle-outline" class="w-4 h-4 mr-1" />
                              Add Option
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div v-else class="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                        <Icon name="heroicons:table-cells" class="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p class="text-sm mb-3">No columns defined yet</p>
                      </div>
                      
                      <button 
                        @click="addTableColumn"
                        class="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                        type="button"
                      >
                        <Icon name="material-symbols:add-circle-outline" class="w-4 h-4 mr-1" />
                        Add Column
                      </button>
                    </div>
                  </div>
                </template>

                <!-- Content for Text Components -->
                <template v-if="showField('value')">
                  <FormKit
                    type="textarea"
                    label="Text Content"
                    name="value"
                    v-model="configModel.value"
                    help="The text that will be displayed"
                    :classes="{ outer: 'field-wrapper' }"
                    rows="3"
                  />
                </template>
              </div>
            </div>
          </div>

          <!-- Options Tab (for select, radio, checkbox) -->
          <div v-if="activeTab === 'options'" class="space-y-6">
            <div class="settings-section">
              <div class="section-header">
                <h4 class="section-title">
                  <Icon name="heroicons:list-bullet" class="w-5 h-5 mr-2" />
                  Choice Options
                </h4>
                <p class="section-description">Configure the options users can choose from</p>
              </div>
              
              <div class="section-content">
                <div class="options-manager">
                  <div class="options-header">
                    <span class="text-sm font-medium text-gray-700">Options List</span>
                    <button @click="addOption" class="add-option-btn">
                      <Icon name="heroicons:plus-circle" class="w-4 h-4 mr-1" />
                      Add Option
                    </button>
                  </div>
                  
                  <div v-if="configModel.options && configModel.options.length > 0" class="options-list">
                    <div 
                      v-for="(option, index) in configModel.options" 
                      :key="index"
                      class="option-item"
                    >
                      <div class="option-drag-handle">
                        <Icon name="heroicons:bars-3" class="w-4 h-4 text-gray-400" />
                      </div>
                      
                      <div class="option-content">
                        <FormKit
                          type="text"
                          placeholder="What users will see"
                          v-model="option.label"
                          :classes="{ outer: 'option-field', input: 'option-input' }"
                        />
                        <FormKit
                          type="text"
                          placeholder="Internal value"
                          v-model="option.value"
                          :classes="{ outer: 'option-field', input: 'option-input' }"
                        />
                      </div>
                      
                      <button 
                        @click="removeOption(index)"
                        class="option-remove-btn"
                        title="Remove this option"
                      >
                        <Icon name="heroicons:trash" class="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div v-else class="empty-options">
                    <Icon name="heroicons:list-bullet" class="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p class="text-sm text-gray-500 text-center mb-3">No options added yet</p>
                    <button @click="addOption" class="empty-add-btn">
                      Add First Option
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Validation Tab -->
          <div v-if="activeTab === 'validation'" class="space-y-6">
            <div class="settings-section">
              <div class="section-header">
                <h4 class="section-title">
                  <Icon name="heroicons:shield-check" class="w-5 h-5 mr-2" />
                  Field Validation
                </h4>
                <p class="section-description">Set rules to ensure users enter valid information</p>
              </div>
              
              <div class="section-content">
                <div class="validation-options">
                  <!-- Required Field -->
                  <div class="validation-item">
                    <label class="validation-toggle" @click.stop>
                      <input type="checkbox" v-model="isRequired" />
                      <span class="toggle-slider"></span>
                      <div class="validation-info">
                        <span class="validation-title">Required Field</span>
                        <span class="validation-desc">Users must fill this field before submitting</span>
                      </div>
                    </label>
                  </div>

                  <!-- Email Validation -->
                  <div v-if="component.type === 'email' || component.type === 'text'" class="validation-item">
                    <label class="validation-toggle" @click.stop>
                      <input type="checkbox" v-model="isEmailValidation" />
                      <span class="toggle-slider"></span>
                      <div class="validation-info">
                        <span class="validation-title">Email Format</span>
                        <span class="validation-desc">Must be a valid email address</span>
                      </div>
                    </label>
                  </div>

                  <!-- URL Validation -->
                  <div v-if="component.type === 'url' || component.type === 'text'" class="validation-item">
                    <label class="validation-toggle" @click.stop>
                      <input type="checkbox" v-model="isUrlValidation" />
                      <span class="toggle-slider"></span>
                      <div class="validation-info">
                        <span class="validation-title">URL Format</span>
                        <span class="validation-desc">Must be a valid website address</span>
                      </div>
                    </label>
                  </div>

                  <!-- Length Validation -->
                  <div v-if="isTextBasedField" class="validation-item">
                    <label class="validation-toggle" @click.stop>
                      <input type="checkbox" v-model="hasLengthValidation" />
                      <span class="toggle-slider"></span>
                      <div class="validation-info">
                        <span class="validation-title">Text Length Limits</span>
                        <span class="validation-desc">Set minimum and maximum text length</span>
                      </div>
                    </label>
                    
                    <div v-if="hasLengthValidation" class="validation-details">
                      <div class="grid grid-cols-2 gap-4">
                        <FormKit
                          type="number"
                          label="Minimum Length"
                          v-model="minLength"
                          :min="0"
                          :classes="{ outer: 'field-wrapper' }"
                        />
                        <FormKit
                          type="number"
                          label="Maximum Length"
                          v-model="maxLength"
                          :min="1"
                          :classes="{ outer: 'field-wrapper' }"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- Number Range Validation -->
                  <div v-if="component.type === 'number'" class="validation-item">
                    <label class="validation-toggle" @click.stop>
                      <input type="checkbox" v-model="hasNumberValidation" />
                      <span class="toggle-slider"></span>
                      <div class="validation-info">
                        <span class="validation-title">Number Range</span>
                        <span class="validation-desc">Set minimum and maximum values</span>
                      </div>
                    </label>
                    
                    <div v-if="hasNumberValidation" class="validation-details">
                      <div class="grid grid-cols-2 gap-4">
                        <FormKit
                          type="number"
                          label="Minimum Value"
                          v-model="minNumber"
                          :classes="{ outer: 'field-wrapper' }"
                        />
                        <FormKit
                          type="number"
                          label="Maximum Value"
                          v-model="maxNumber"
                          :classes="{ outer: 'field-wrapper' }"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Custom Validation -->
                <div class="mt-6">
                  <FormKit
                    type="text"
                    label="Custom Validation Rules"
                    name="validation"
                    v-model="configModel.validation"
                    help="Advanced: Enter custom validation rules using the format below"
                    :classes="{ outer: 'field-wrapper' }"
                    placeholder="e.g., required|email|length:3,50"
                  />
                  
                  <!-- Validation Rules Guide -->
                  <div class="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h5 class="text-sm font-medium text-blue-800 mb-3 flex items-center">
                      <Icon name="heroicons:information-circle" class="w-4 h-4 mr-2" />
                      Validation Rules Guide
                    </h5>
                    
                    <div class="space-y-4 text-sm">
                      <!-- Basic Rules -->
                      <div>
                        <h6 class="font-medium text-blue-700 mb-2">Basic Rules</h6>
                        <div class="grid grid-cols-2 gap-2 text-xs">
                          <div class="validation-rule">
                            <code class="rule-code">required</code>
                            <span class="rule-desc">Field must be filled</span>
                          </div>
                          <div class="validation-rule">
                            <code class="rule-code">email</code>
                            <span class="rule-desc">Must be valid email</span>
                          </div>
                          <div class="validation-rule">
                            <code class="rule-code">url</code>
                            <span class="rule-desc">Must be valid URL</span>
                          </div>
                          <div class="validation-rule">
                            <code class="rule-code">number</code>
                            <span class="rule-desc">Must be numeric</span>
                          </div>
                        </div>
                      </div>
                      
                      <!-- Length Rules -->
                      <div>
                        <h6 class="font-medium text-blue-700 mb-2">Length Rules</h6>
                        <div class="grid grid-cols-2 gap-2 text-xs">
                          <div class="validation-rule">
                            <code class="rule-code">length:5</code>
                            <span class="rule-desc">Exactly 5 characters</span>
                          </div>
                          <div class="validation-rule">
                            <code class="rule-code">length:3,20</code>
                            <span class="rule-desc">Between 3-20 characters</span>
                          </div>
                          <div class="validation-rule">
                            <code class="rule-code">min:3</code>
                            <span class="rule-desc">Minimum 3 characters</span>
                          </div>
                          <div class="validation-rule">
                            <code class="rule-code">max:50</code>
                            <span class="rule-desc">Maximum 50 characters</span>
                          </div>
                        </div>
                      </div>
                      
                      <!-- Number Rules -->
                      <div>
                        <h6 class="font-medium text-blue-700 mb-2">Number Rules</h6>
                        <div class="grid grid-cols-2 gap-2 text-xs">
                          <div class="validation-rule">
                            <code class="rule-code">between:1,100</code>
                            <span class="rule-desc">Between 1 and 100</span>
                          </div>
                          <div class="validation-rule">
                            <code class="rule-code">min_value:0</code>
                            <span class="rule-desc">Minimum value 0</span>
                          </div>
                          <div class="validation-rule">
                            <code class="rule-code">max_value:999</code>
                            <span class="rule-desc">Maximum value 999</span>
                          </div>
                          <div class="validation-rule">
                            <code class="rule-code">integer</code>
                            <span class="rule-desc">Must be whole number</span>
                          </div>
                        </div>
                      </div>
                      
                      <!-- Pattern Rules -->
                      <div>
                        <h6 class="font-medium text-blue-700 mb-2">Pattern Rules</h6>
                        <div class="grid grid-cols-1 gap-2 text-xs">
                          <div class="validation-rule">
                            <code class="rule-code">alpha</code>
                            <span class="rule-desc">Only letters (A-Z, a-z)</span>
                          </div>
                          <div class="validation-rule">
                            <code class="rule-code">alpha_numeric</code>
                            <span class="rule-desc">Letters and numbers only</span>
                          </div>
                          <div class="validation-rule">
                            <code class="rule-code">alpha_spaces</code>
                            <span class="rule-desc">Letters and spaces only</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Examples Section -->
                    <div class="mt-4 pt-4 border-t border-blue-200">
                      <h6 class="font-medium text-blue-700 mb-2">Examples</h6>
                      <div class="space-y-2 text-xs">
                        <div class="example-item">
                          <code class="example-code">required|email</code>
                          <span class="example-desc">Required email field</span>
                        </div>
                        <div class="example-item">
                          <code class="example-code">required|length:3,50</code>
                          <span class="example-desc">Required text, 3-50 characters</span>
                        </div>
                        <div class="example-item">
                          <code class="example-code">number|between:1,100</code>
                          <span class="example-desc">Number between 1-100</span>
                        </div>
                        <div class="example-item">
                          <code class="example-code">required|alpha_numeric|min:5</code>
                          <span class="example-desc">Required alphanumeric, min 5 chars</span>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Quick Tips -->
                    <div class="mt-3 pt-3 border-t border-blue-200">
                      <p class="text-xs text-blue-600">
                        <strong>💡 Tips:</strong> Separate rules with | (pipe) • Order doesn't matter • Leave empty for no validation
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Conditional Logic Section -->
        <div v-if="showField('conditionalLogic')" class="section-container mt-6">
          <div class="section">
            <div class="section-wrapper">
              <div class="section-header">
                <h4 class="section-title">
                  <Icon name="heroicons:adjustments-horizontal" class="w-5 h-5 mr-2" />
                  Conditional Logic
                </h4>
                <p class="section-description">Show, hide, or disable this field based on other field values</p>
              </div>
              
              <div class="section-content">
                <!-- Enable Conditional Logic -->
                <FormKit
                  type="switch"
                  label="Enable Conditional Logic"
                  name="conditionalLogicEnabled"
                  v-model="configModel.conditionalLogic.enabled"
                  help="Show or hide this field based on other fields"
                  :classes="{ outer: 'field-wrapper' }"
                />

                <!-- Conditional Logic Configuration -->
                <div v-if="configModel.conditionalLogic.enabled" class="mt-4 space-y-4">
                  <!-- Action Selection -->
                  <FormKit
                    type="select"
                    label="Action"
                    name="conditionalAction"
                    v-model="configModel.conditionalLogic.action"
                    :options="[
                      { label: 'Show this field', value: 'show' },
                      { label: 'Hide this field', value: 'hide' },
                      { label: 'Enable this field', value: 'enable' },
                      { label: 'Disable this field', value: 'disable' }
                    ]"
                    help="What should happen when conditions are met"
                    :classes="{ outer: 'field-wrapper' }"
                  />

                  <!-- Operator Selection (when multiple conditions) -->
                  <FormKit
                    v-if="configModel.conditionalLogic.conditions.length > 1"
                    type="select"
                    label="Logic Operator"
                    name="conditionalOperator"
                    v-model="configModel.conditionalLogic.operator"
                    :options="[
                      { label: 'All conditions must be true (AND)', value: 'and' },
                      { label: 'Any condition can be true (OR)', value: 'or' }
                    ]"
                    help="How multiple conditions should be evaluated"
                    :classes="{ outer: 'field-wrapper' }"
                  />

                  <!-- Conditions -->
                  <div class="conditions-section">
                    <h5 class="text-sm font-medium text-gray-700 mb-3">Conditions</h5>
                    
                    <div v-if="configModel.conditionalLogic.conditions.length === 0" class="text-center py-4 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                      <Icon name="heroicons:plus-circle" class="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p class="text-sm">No conditions set. Add a condition to get started.</p>
                    </div>

                    <div v-else class="space-y-3">
                      <div 
                        v-for="(condition, index) in configModel.conditionalLogic.conditions" 
                        :key="index"
                        class="condition-item bg-gray-50 p-4 rounded-lg border"
                      >
                        <div class="grid grid-cols-3 gap-3">
                          <FormKit
                            type="text"
                            label="Field Name"
                            :name="`condition_field_${index}`"
                            v-model="condition.field"
                            placeholder="field_name"
                            help="Name of the field to check"
                            :classes="{ outer: 'field-wrapper' }"
                          />
                          
                          <FormKit
                            type="select"
                            label="Operator"
                            :name="`condition_operator_${index}`"
                            v-model="condition.operator"
                            :options="[
                              { label: 'Equals', value: 'equals' },
                              { label: 'Not equals', value: 'not_equals' },
                              { label: 'Contains', value: 'contains' },
                              { label: 'Does not contain', value: 'not_contains' },
                              { label: 'Is empty', value: 'is_empty' },
                              { label: 'Is not empty', value: 'is_not_empty' },
                              { label: 'Greater than', value: 'greater_than' },
                              { label: 'Less than', value: 'less_than' }
                            ]"
                            :classes="{ outer: 'field-wrapper' }"
                          />
                          
                          <FormKit
                            type="text"
                            label="Value"
                            :name="`condition_value_${index}`"
                            v-model="condition.value"
                            placeholder="Value to compare"
                            help="Leave empty for 'is empty' conditions"
                            :classes="{ outer: 'field-wrapper' }"
                          />
                        </div>
                        
                        <div class="flex justify-end mt-3">
                          <button
                            @click="removeCondition(index)"
                            type="button"
                            class="text-red-600 hover:text-red-800 text-sm flex items-center"
                          >
                            <Icon name="heroicons:trash" class="w-4 h-4 mr-1" />
                            Remove Condition
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      @click="addCondition"
                      type="button"
                      class="mt-3 inline-flex items-center px-3 py-2 border border-blue-600 text-blue-600 bg-white hover:bg-blue-50 rounded text-sm"
                    >
                      <Icon name="heroicons:plus" class="w-4 h-4 mr-1" />
                      Add Condition
                    </button>
                  </div>

                  <!-- Preview JavaScript Code -->
                  <div v-if="configModel.conditionalLogic.conditions.length > 0" class="mt-4">
                    <h5 class="text-sm font-medium text-gray-700 mb-2">Generated Code Preview</h5>
                    <div class="bg-gray-900 text-green-400 p-3 rounded text-xs font-mono">
                      {{ generateConditionalLogicCode() }}
                    </div>
                    <p class="text-xs text-gray-500 mt-1">This JavaScript will be automatically executed to handle the conditional logic</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-between items-center">
        <RsButton
          @click="handleClose"
          variant="secondary-outline"
        >
          Cancel
        </RsButton>
        
        <div class="flex space-x-3">
          <RsButton
            @click="handleReset"
            variant="warning-outline"
          >
            <Icon name="heroicons:arrow-path" class="w-4 h-4 mr-1" />
            Reset to Default
          </RsButton>
          
          <RsButton
            @click="handleSave"
            variant="primary"
          >
            <Icon name="heroicons:check" class="w-4 h-4 mr-1" />
            Apply Changes
          </RsButton>
        </div>
      </div>
    </template>
  </RsModal>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  component: Object
})

const emit = defineEmits(['update:modelValue', 'update-component', 'close'])

// Modal state
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const activeTab = ref('basic')
const configModel = ref({
  conditionalLogic: {
    enabled: false,
    conditions: [],
    action: 'show',
    operator: 'and'
  }
})

// Component info helpers
const modalTitle = computed(() => {
  if (!props.component) return 'Field Settings'
  return `Configure ${getComponentTypeName(props.component.type)}`
})

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
    'info-display': 'heroicons:information-circle',
    'dynamic-list': 'heroicons:list-bullet',
    'repeating-table': 'heroicons:table-cells'
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
    'info-display': 'Information Display',
    'dynamic-list': 'Dynamic List',
    'repeating-table': 'Data Table'
  }
  return names[type] || 'Form Field'
}

const getComponentDescription = (type) => {
  const descriptions = {
    text: 'Single line text input for names, titles, and short text',
    textarea: 'Multi-line text area for longer content and descriptions',
    number: 'Numeric input with validation for quantities, prices, and counts',
    email: 'Email address input with format validation',
    password: 'Secure password input with hidden characters',
    url: 'Website URL input with link validation',
    tel: 'Phone number input for contact information',
    mask: 'Formatted text input with custom patterns like phone numbers',
    hidden: 'Hidden field for storing data not visible to users',
    select: 'Dropdown menu for choosing one option from a list',
    checkbox: 'Multiple checkboxes for selecting multiple options',
    radio: 'Radio buttons for choosing one option from a group',
    switch: 'Toggle switch for enabling/disabling options',
    date: 'Date picker for selecting dates',
    time: 'Time picker for selecting times',
    'datetime-local': 'Combined date and time selection',
    range: 'Slider for selecting values within a range',
    color: 'Color picker for selecting colors',
    file: 'Standard file upload button',
    otp: 'One-time password input for verification codes',
    dropzone: 'Drag and drop file upload area',
    button: 'Action button for forms and interactions',
    heading: 'Section heading to organize form content',
    paragraph: 'Text content for instructions and descriptions',
    divider: 'Visual separator to organize form sections',
    'info-display': 'Read-only information display in organized format',
    'dynamic-list': 'Dynamic list for displaying and managing items',
    'repeating-table': 'Structured table for collecting multiple records with forms'
  }
  return descriptions[type] || 'Configure this form field'
}

// Tab management
const availableTabs = computed(() => {
  const tabs = [
    { id: 'basic', label: 'Basic Settings', icon: 'heroicons:cog-6-tooth' }
  ]
  
  if (hasOptions.value) {
    tabs.push({ id: 'options', label: 'Options', icon: 'heroicons:list-bullet' })
  }
  
  tabs.push({ id: 'validation', label: 'Validation', icon: 'heroicons:shield-check' })
  
  return tabs
})

// Field visibility helpers
const showField = (fieldName) => {
  if (!props.component) return false
  
  const fieldConfig = {
    label: ['text', 'textarea', 'number', 'email', 'password', 'url', 'tel', 'mask', 'select', 'checkbox', 'radio', 'switch', 'date', 'time', 'datetime-local', 'range', 'color', 'file', 'otp', 'dropzone', 'button', 'dynamic-list', 'repeating-table'],
    name: ['text', 'textarea', 'number', 'email', 'password', 'url', 'tel', 'mask', 'hidden', 'select', 'checkbox', 'radio', 'switch', 'date', 'time', 'datetime-local', 'range', 'color', 'file', 'otp', 'dropzone', 'button', 'dynamic-list', 'repeating-table'],
    placeholder: ['text', 'textarea', 'number', 'email', 'password', 'url', 'tel', 'mask', 'select', 'dynamic-list'],
    help: ['text', 'textarea', 'number', 'email', 'password', 'url', 'tel', 'mask', 'hidden', 'select', 'checkbox', 'radio', 'switch', 'date', 'time', 'datetime-local', 'range', 'color', 'file', 'otp', 'dropzone', 'button', 'dynamic-list', 'repeating-table'],
    value: ['heading', 'paragraph', 'hidden'],
    width: ['text', 'textarea', 'number', 'email', 'password', 'url', 'tel', 'mask', 'select', 'checkbox', 'radio', 'switch', 'date', 'time', 'datetime-local', 'range', 'color', 'file', 'otp', 'dropzone', 'button', 'heading', 'paragraph', 'info-display', 'dynamic-list', 'repeating-table'],
    options: ['select', 'checkbox', 'radio'],
    conditionalLogic: ['text', 'textarea', 'number', 'email', 'password', 'url', 'tel', 'select', 'checkbox', 'radio', 'switch', 'date', 'time', 'datetime-local', 'range', 'color', 'file', 'dynamic-list', 'repeating-table']
  }
  
  return fieldConfig[fieldName]?.includes(props.component.type) || false
}

const hasOptions = computed(() => showField('options'))
const hasSpecificSettings = computed(() => {
  if (!props.component) return false
  const specificTypes = ['mask', 'otp', 'dropzone', 'range', 'heading', 'paragraph', 'button', 'dynamic-list', 'repeating-table']
  return specificTypes.includes(props.component.type)
})

// Validation helpers
const isRequired = computed({
  get: () => configModel.value.validation?.includes('required') || false,
  set: (value) => updateValidation('required', value)
})

const isEmailValidation = computed({
  get: () => configModel.value.validation?.includes('email') || false,
  set: (value) => updateValidation('email', value)
})

const isUrlValidation = computed({
  get: () => configModel.value.validation?.includes('url') || false,
  set: (value) => updateValidation('url', value)
})

const hasLengthValidation = ref(false)
const minLength = ref(null)
const maxLength = ref(null)

const hasNumberValidation = ref(false)
const minNumber = ref(null)
const maxNumber = ref(null)

const isTextBasedField = computed(() => {
  return ['text', 'textarea', 'email', 'password', 'url', 'tel'].includes(props.component?.type)
})

// File size helper
const configModelMaxSizeMB = computed({
  get: () => configModel.value.maxSize ? Math.round(configModel.value.maxSize / (1024 * 1024)) : 5,
  set: (value) => {
    configModel.value.maxSize = value * 1024 * 1024
  }
})

// Width options with smart recommendations
const widthOptions = [
  {
    name: 'Narrow',
    value: 25,
    gridColumns: 3,
    type: 'narrow',
    description: 'Quarter width',
    useCase: 'Small inputs like age, zip code, or short codes'
  },
  {
    name: 'Small',
    value: 33,
    gridColumns: 4,
    type: 'small',
    description: 'One-third width',
    useCase: 'Short text fields, city names, or grouped inputs'
  },
  {
    name: 'Medium',
    value: 50,
    gridColumns: 6,
    type: 'medium',
    description: 'Half width',
    useCase: 'Names, phone numbers, or paired inputs'
  },
  {
    name: 'Wide',
    value: 75,
    gridColumns: 9,
    type: 'wide',
    description: 'Three-quarter width',
    useCase: 'Addresses, longer text, or prominent fields'
  },
  {
    name: 'Full',
    value: 100,
    gridColumns: 12,
    type: 'full',
    description: 'Full width',
    useCase: 'Long text, paragraphs, or single-column layout'
  }
]

// Smart recommendations based on field type
const getRecommendedWidth = (fieldType) => {
  const recommendations = {
    // Narrow fields (25% - 3 columns)
    'number': 'narrow',
    'date': 'narrow',
    'time': 'narrow',
    'color': 'narrow',
    'otp': 'narrow',
    
    // Small fields (33% - 4 columns)
    'text': 'small',
    
    // Medium fields (50% - 6 columns)
    'email': 'medium',
    'tel': 'medium',
    'password': 'medium',
    'mask': 'medium',
    'select': 'medium',
    'datetime-local': 'medium',
    
    // Wide fields (75% - 9 columns)
    'url': 'wide',
    'file': 'wide',
    'dropzone': 'wide',
    
    // Full width fields (100% - 12 columns)
    'textarea': 'full',
    'heading': 'full',
    'paragraph': 'full',
    'checkbox': 'full',
    'radio': 'full',
    'range': 'full',
    'switch': 'full',
    'button': 'full',
    'info-display': 'full',
    'dynamic-list': 'full',
    'repeating-table': 'full'
  }
  
  return recommendations[fieldType] || 'full'
}

const isRecommendedWidth = (widthType) => {
  return getRecommendedWidth(props.component?.type) === widthType
}

const getCurrentWidthOption = () => {
  const currentPercent = getComponentWidthPercent()
  return widthOptions.find(option => option.value === currentPercent)
}

const getCurrentGridColumns = () => {
  const currentPercent = getComponentWidthPercent()
  const option = widthOptions.find(opt => opt.value === currentPercent)
  return option ? option.gridColumns : 12
}

// Watch for component changes
watch(() => props.component, (newComponent) => {
  if (newComponent) {
    configModel.value = { 
      ...newComponent.props,
      // Ensure conditionalLogic is properly initialized
      conditionalLogic: newComponent.props.conditionalLogic || {
        enabled: false,
        conditions: [],
        action: 'show',
        operator: 'and'
      }
    }
    activeTab.value = 'basic'
    resetValidationState()
  }
}, { immediate: true })

// Methods
const updateValidation = (rule, enabled) => {
  let current = configModel.value.validation || ''
  const rules = current.split('|').filter(r => r && r !== rule)
  
  if (enabled) {
    rules.push(rule)
  }
  
  configModel.value.validation = rules.join('|')
}

const resetValidationState = () => {
  hasLengthValidation.value = false
  hasNumberValidation.value = false
  minLength.value = null
  maxLength.value = null
  minNumber.value = null
  maxNumber.value = null
}

const setComponentWidth = (percentage, gridColumns) => {
  configModel.value.width = `${percentage}%`
  configModel.value.gridColumn = `span ${gridColumns}`
}

const getComponentWidthPercent = () => {
  const width = configModel.value.width || '100%'
  return parseInt(width.replace('%', ''))
}

const addOption = () => {
  if (!configModel.value.options) {
    configModel.value.options = []
  }
  configModel.value.options.push({ 
    label: `Option ${configModel.value.options.length + 1}`, 
    value: `option_${configModel.value.options.length + 1}` 
  })
}

const removeOption = (index) => {
  if (configModel.value.options && configModel.value.options.length > index) {
    configModel.value.options.splice(index, 1)
  }
}

// Default items management for dynamic-list
const addDefaultItem = () => {
  if (!configModel.value.defaultItems) {
    configModel.value.defaultItems = []
  }
  configModel.value.defaultItems.push('')
}

const removeDefaultItem = (index) => {
  if (configModel.value.defaultItems) {
    configModel.value.defaultItems.splice(index, 1)
  }
}

// Conditional logic management
const addCondition = () => {
  if (!configModel.value.conditionalLogic) {
    configModel.value.conditionalLogic = {
      enabled: true,
      conditions: [],
      action: 'show',
      operator: 'and'
    }
  }
  
  if (!configModel.value.conditionalLogic.conditions) {
    configModel.value.conditionalLogic.conditions = []
  }
  
  configModel.value.conditionalLogic.conditions.push({
    field: '',
    operator: 'equals',
    value: ''
  })
}

const removeCondition = (index) => {
  if (configModel.value.conditionalLogic?.conditions) {
    configModel.value.conditionalLogic.conditions.splice(index, 1)
  }
}

const generateConditionalLogicCode = () => {
  if (!configModel.value.conditionalLogic || !configModel.value.conditionalLogic.conditions.length) {
    return '// No conditions defined'
  }
  
  const { conditions, action, operator } = configModel.value.conditionalLogic
  const fieldName = configModel.value.name || 'this_field'
  
  // Generate condition checks
  const conditionChecks = conditions.map(condition => {
    const { field, operator: condOp, value } = condition
    
    switch (condOp) {
      case 'equals':
        return `getField('${field}') === '${value}'`
      case 'not_equals':
        return `getField('${field}') !== '${value}'`
      case 'contains':
        return `String(getField('${field}')).includes('${value}')`
      case 'not_contains':
        return `!String(getField('${field}')).includes('${value}')`
      case 'is_empty':
        return `!getField('${field}') || getField('${field}') === ''`
      case 'is_not_empty':
        return `getField('${field}') && getField('${field}') !== ''`
      case 'greater_than':
        return `Number(getField('${field}')) > ${Number(value) || 0}`
      case 'less_than':
        return `Number(getField('${field}')) < ${Number(value) || 0}`
      default:
        return `getField('${field}') === '${value}'`
    }
  }).join(` ${operator} `)
  
  // Generate action
  const actionCode = action === 'show' ? `showField('${fieldName}')` :
                    action === 'hide' ? `hideField('${fieldName}')` :
                    action === 'enable' ? `enableField('${fieldName}')` :
                    action === 'disable' ? `disableField('${fieldName}')` :
                    `showField('${fieldName}')`
  
  // Generate field change listeners
  const watchedFields = [...new Set(conditions.map(c => c.field).filter(Boolean))]
  const listenerCode = watchedFields.map(field => 
    `onFieldChange('${field}', function() {
  if (${conditionChecks}) {
    ${actionCode};
  } else {
    ${action === 'show' ? `hideField('${fieldName}')` : 
      action === 'hide' ? `showField('${fieldName}')` :
      action === 'enable' ? `disableField('${fieldName}')` :
      action === 'disable' ? `enableField('${fieldName}')` :
      `hideField('${fieldName}')`};
  }
});`
  ).join('\n\n')
  
  return listenerCode || '// Invalid configuration'
}

const handleSave = () => {
  emit('update-component', { ...props.component, props: configModel.value })
  handleClose()
}

const handleReset = () => {
  if (props.component) {
    // Reset to default props from the component definition
    const defaultComponent = {
      ...props.component,
      props: props.component.defaultProps || {}
    }
    configModel.value = { 
      ...defaultComponent.props,
      // Ensure conditionalLogic is properly initialized
      conditionalLogic: defaultComponent.props.conditionalLogic || {
        enabled: false,
        conditions: [],
        action: 'show',
        operator: 'and'
      }
    }
  }
}

const handleClose = () => {
  isOpen.value = false
  emit('close')
}

// Table column management for repeating-table
const addTableColumn = () => {
  if (!configModel.value.columns) {
    configModel.value.columns = []
  }
  configModel.value.columns.push({
    name: `column_${configModel.value.columns.length + 1}`,
    label: `Column ${configModel.value.columns.length + 1}`,
    type: 'text',
    required: false,
    placeholder: 'Enter value...',
    validation: '',
    width: '200px',
    options: []
  })
}

const removeTableColumn = (index) => {
  if (configModel.value.columns) {
    configModel.value.columns.splice(index, 1)
  }
}

const addColumnOption = (columnIndex) => {
  if (!configModel.value.columns[columnIndex].options) {
    configModel.value.columns[columnIndex].options = []
  }
  configModel.value.columns[columnIndex].options.push({
    label: `Option ${configModel.value.columns[columnIndex].options.length + 1}`,
    value: `option_${configModel.value.columns[columnIndex].options.length + 1}`
  })
}

const removeColumnOption = (columnIndex, optionIndex) => {
  if (configModel.value.columns[columnIndex].options) {
    configModel.value.columns[columnIndex].options.splice(optionIndex, 1)
  }
}
</script>

<style scoped>
.field-settings-modal {
  max-height: 80vh;
  overflow-y: auto;
}

/* Section Styling */
.settings-section {
  @apply border border-gray-200 rounded-lg overflow-hidden;
}

.section-header {
  @apply bg-gray-50 px-4 py-3 border-b border-gray-200;
}

.section-title {
  @apply text-sm font-semibold text-gray-800 flex items-center;
}

.section-description {
  @apply text-xs text-gray-600 mt-1;
}

.section-content {
  @apply p-4 space-y-4;
}

/* Width Selection */
.width-selector {
  @apply space-y-2;
}

.width-option {
  @apply border border-gray-200 rounded-lg p-4 transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer flex items-center space-x-4;
}

.width-option.selected {
  @apply border-blue-500 bg-blue-50 ring-2 ring-blue-200;
}

.width-option.recommended {
  @apply ring-2 ring-green-200 border-green-300;
}

.width-option.selected.recommended {
  @apply border-green-500 bg-green-50 ring-2 ring-green-200;
}

.grid-preview {
  @apply flex-shrink-0;
}

.grid-container-mini {
  @apply grid grid-cols-12 gap-1 w-32;
}

.grid-cell {
  @apply h-2 rounded-sm transition-colors duration-200;
}

.grid-cell.active {
  @apply bg-blue-500;
}

.grid-cell.inactive {
  @apply bg-gray-200;
}

.option-info {
  @apply flex-1 text-left min-w-0;
}

.option-name {
  @apply text-base font-semibold text-gray-800 mb-1 flex items-center;
}

.option-description {
  @apply text-sm text-gray-600 mb-1;
}

.option-use-case {
  @apply text-xs text-gray-500 italic;
}

.recommended-badge {
  @apply inline-flex items-center px-2 py-0.5 text-xs font-medium text-green-800 bg-green-100 rounded-full ml-2;
}

.current-selection-feedback {
  @apply mt-4 p-3 bg-gray-50 rounded-lg border;
}

.feedback-row {
  @apply flex justify-between items-center py-1;
}

.feedback-label {
  @apply text-sm font-medium text-gray-600;
}

.feedback-value {
  @apply text-sm font-semibold text-gray-800;
}

.current-width-visual {
  @apply mt-3 pt-3 border-t border-gray-200;
}

.visual-grid {
  @apply grid grid-cols-12 gap-1 w-full mb-2;
}

.visual-cell {
  @apply h-2 rounded-sm transition-colors duration-200;
}

.visual-cell.filled {
  @apply bg-blue-500;
}

.visual-cell.empty {
  @apply bg-gray-200;
}

.visual-label {
  @apply text-center text-xs text-gray-600;
}

/* Options Management */
.options-manager {
  @apply border border-gray-200 rounded-lg;
}

.options-header {
  @apply flex justify-between items-center p-3 bg-gray-50 border-b border-gray-200;
}

.add-option-btn {
  @apply inline-flex items-center px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors;
}

.options-list {
  @apply divide-y divide-gray-200;
}

.option-item {
  @apply flex items-center p-3 hover:bg-gray-50;
}

.option-drag-handle {
  @apply mr-3 cursor-move;
}

.option-content {
  @apply flex-1 grid grid-cols-2 gap-3;
}

.option-field {
  @apply mb-0;
}

.option-input {
  @apply text-sm;
}

.option-remove-btn {
  @apply ml-3 p-1 text-red-400 hover:text-red-600 rounded transition-colors;
}

.empty-options {
  @apply text-center py-8;
}

.empty-add-btn {
  @apply inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors;
}

/* Validation Styling */
.validation-options {
  @apply space-y-4;
}

.validation-item {
  @apply border border-gray-200 rounded-lg p-4;
}

.validation-toggle {
  @apply flex items-center cursor-pointer;
}

.validation-toggle input[type="checkbox"] {
  @apply sr-only;
}

.toggle-slider {
  @apply relative inline-block w-10 h-6 mr-3 bg-gray-200 rounded-full transition-colors duration-200 ease-in-out;
}

.validation-toggle input:checked + .toggle-slider {
  @apply bg-blue-600;
}

.toggle-slider::before {
  @apply absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out;
  content: '';
}

.validation-toggle input:checked + .toggle-slider::before {
  @apply transform translate-x-4;
}

.validation-info {
  @apply flex-1;
}

.validation-title {
  @apply block text-sm font-medium text-gray-900;
}

.validation-desc {
  @apply block text-xs text-gray-500 mt-1;
}

.validation-details {
  @apply mt-4 pt-4 border-t border-gray-200;
}

/* Toggle Switch */
.toggle-switch {
  @apply flex items-center;
}

.toggle-switch input[type="checkbox"] {
  @apply sr-only;
}

.toggle-switch .toggle-slider {
  @apply relative inline-block w-10 h-6 mr-3 bg-gray-200 rounded-full transition-colors duration-200 ease-in-out;
}

.toggle-switch input:checked + .toggle-slider {
  @apply bg-green-600;
}

.toggle-switch .toggle-slider::before {
  @apply absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out;
  content: '';
}

.toggle-switch input:checked + .toggle-slider::before {
  @apply transform translate-x-4;
}

.toggle-label {
  @apply text-sm font-medium text-gray-700;
}

/* Button Styling */
.cancel-btn {
  @apply px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors;
}

.reset-btn {
  @apply inline-flex items-center px-4 py-2 text-sm font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded-md hover:bg-orange-100 transition-colors;
}

.save-btn {
  @apply inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors;
}

/* Field Wrapper */
.field-wrapper {
  @apply mb-0;
}

/* Mask Examples */
.mask-examples {
  @apply mt-3 p-3 bg-gray-50 rounded-lg;
}

.example-button {
  @apply text-left p-2 text-xs bg-white border border-gray-200 rounded hover:border-blue-300 hover:bg-blue-50 transition-colors;
}

/* Validation Guide Styles */
.validation-rule {
  @apply flex flex-col space-y-1 p-2 bg-white rounded border border-blue-100;
}

.rule-code {
  @apply font-mono text-xs font-semibold text-blue-800 bg-blue-100 px-2 py-1 rounded;
}

.rule-desc {
  @apply text-gray-600;
}

.example-item {
  @apply flex flex-col space-y-1 p-2 bg-white rounded border border-blue-100;
}

.example-code {
  @apply font-mono text-xs font-semibold text-green-800 bg-green-100 px-2 py-1 rounded;
}

.example-desc {
  @apply text-gray-600;
}
</style> 