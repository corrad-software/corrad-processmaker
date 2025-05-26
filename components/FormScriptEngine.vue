<template>
  <div>
    <!-- Custom CSS Injection -->
    <component :is="'style'" v-if="customCSS" scoped>
      {{ customCSS }}
    </component>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';

const props = defineProps({
  formData: {
    type: Object,
    required: true
  },
  customScript: {
    type: String,
    default: ''
  },
  customCSS: {
    type: String,
    default: ''
  },
  formEvents: {
    type: Object,
    default: () => ({
      onLoad: true,
      onFieldChange: true,
      onSubmit: false,
      onValidation: false
    })
  },
  scriptMode: {
    type: String,
    default: 'safe' // 'safe' or 'advanced'
  }
});

const emit = defineEmits(['field-change', 'form-submit', 'field-validate']);

// Internal state
const scriptContext = ref(null);
const fieldChangeHandlers = ref(new Map());
const isScriptInitialized = ref(false);

// Create safe execution context
const createScriptContext = () => {
  const context = {
    // Form field interaction methods
    getField: (fieldName) => {
      return props.formData[fieldName];
    },
    
    setField: (fieldName, value) => {
      emit('field-change', { fieldName, value });
    },
    
    hideField: (fieldName) => {
      const fieldElement = document.querySelector(`[data-name="${fieldName}"]`);
      if (fieldElement) {
        fieldElement.style.display = 'none';
        fieldElement.setAttribute('data-hidden', 'true');
      }
    },
    
    showField: (fieldName) => {
      const fieldElement = document.querySelector(`[data-name="${fieldName}"]`);
      if (fieldElement) {
        fieldElement.style.display = '';
        fieldElement.removeAttribute('data-hidden');
      }
    },
    
    disableField: (fieldName) => {
      const fieldElement = document.querySelector(`[data-name="${fieldName}"] input, [data-name="${fieldName}"] select, [data-name="${fieldName}"] textarea`);
      if (fieldElement) {
        fieldElement.disabled = true;
        fieldElement.closest('[data-name]')?.setAttribute('data-disabled', 'true');
      }
    },
    
    enableField: (fieldName) => {
      const fieldElement = document.querySelector(`[data-name="${fieldName}"] input, [data-name="${fieldName}"] select, [data-name="${fieldName}"] textarea`);
      if (fieldElement) {
        fieldElement.disabled = false;
        fieldElement.closest('[data-name]')?.removeAttribute('data-disabled');
      }
    },
    
    validateField: (fieldName) => {
      emit('field-validate', { fieldName });
    },
    
    getAllFieldValues: () => {
      return { ...props.formData };
    },
    
    onFieldChange: (fieldNames, callback) => {
      const fields = Array.isArray(fieldNames) ? fieldNames : [fieldNames];
      fields.forEach(fieldName => {
        if (!fieldChangeHandlers.value.has(fieldName)) {
          fieldChangeHandlers.value.set(fieldName, []);
        }
        fieldChangeHandlers.value.get(fieldName).push(callback);
      });
    },
    
    // Utility functions
    console: {
      log: (...args) => console.log('[Form Script]', ...args),
      warn: (...args) => console.warn('[Form Script]', ...args),
      error: (...args) => console.error('[Form Script]', ...args)
    },
    
    // Math utilities
    Math: Math,
    
    // Date utilities
    Date: Date,
    
    // Safe DOM manipulation (limited)
    querySelector: (selector) => {
      // Only allow querying within form container
      const formContainer = document.querySelector('.form-container');
      return formContainer ? formContainer.querySelector(selector) : null;
    },
    
    // Array utilities
    Array: Array,
    
    // String utilities
    String: String,
    
    // Number utilities
    Number: Number
  };
  
  return context;
};

// Safe script execution
const executeScript = (script, context) => {
  if (!script || !script.trim()) return;
  
  try {
    if (props.scriptMode === 'safe') {
      // Create a safe execution environment
      const allowedGlobals = Object.keys(context);
      const globalProxy = new Proxy({}, {
        get(target, prop) {
          if (allowedGlobals.includes(prop)) {
            return context[prop];
          }
          throw new Error(`Access to '${prop}' is not allowed in safe mode`);
        },
        set() {
          throw new Error('Setting global variables is not allowed in safe mode');
        }
      });
      
      // Create function with limited scope
      const scriptFunction = new Function(
        ...allowedGlobals,
        `
          "use strict";
          ${script}
        `
      );
      
      // Execute with only allowed context
      scriptFunction.apply(globalProxy, allowedGlobals.map(key => context[key]));
    } else {
      // Advanced mode - more permissive but still sandboxed
      const scriptFunction = new Function('context', `
        "use strict";
        with(context) {
          ${script}
        }
      `);
      
      scriptFunction.call(null, context);
    }
  } catch (error) {
    console.error('Script execution error:', error);
    // Could emit an error event here for user feedback
  }
};

// Initialize script engine
const initializeScript = async () => {
  if (!props.customScript || isScriptInitialized.value) return;
  
  await nextTick(); // Ensure DOM is ready
  
  scriptContext.value = createScriptContext();
  
  if (props.formEvents.onLoad) {
    executeScript(props.customScript, scriptContext.value);
  }
  
  isScriptInitialized.value = true;
};

// Handle field changes
const handleFieldChange = (fieldName, newValue, oldValue) => {
  if (!fieldChangeHandlers.value.has(fieldName)) return;
  
  const handlers = fieldChangeHandlers.value.get(fieldName);
  handlers.forEach(handler => {
    try {
      if (typeof handler === 'function') {
        handler.call(scriptContext.value, newValue, oldValue);
      }
    } catch (error) {
      console.error(`Error in field change handler for '${fieldName}':`, error);
    }
  });
};

// Watch for form data changes
watch(() => props.formData, (newData, oldData) => {
  if (!isScriptInitialized.value || !props.formEvents.onFieldChange) return;
  
  // Compare and trigger handlers for changed fields
  Object.keys(newData).forEach(fieldName => {
    if (newData[fieldName] !== oldData?.[fieldName]) {
      handleFieldChange(fieldName, newData[fieldName], oldData?.[fieldName]);
    }
  });
}, { deep: true });

// Watch for script changes and reinitialize
watch(() => props.customScript, () => {
  if (isScriptInitialized.value) {
    isScriptInitialized.value = false;
    fieldChangeHandlers.value.clear();
    initializeScript();
  }
});

// Lifecycle hooks
onMounted(() => {
  initializeScript();
});

onUnmounted(() => {
  fieldChangeHandlers.value.clear();
  isScriptInitialized.value = false;
});

// Expose methods for parent component
defineExpose({
  executeScript: (script) => {
    if (scriptContext.value) {
      executeScript(script, scriptContext.value);
    }
  },
  getContext: () => scriptContext.value,
  reinitialize: () => {
    isScriptInitialized.value = false;
    fieldChangeHandlers.value.clear();
    initializeScript();
  }
});
</script>

<style scoped>
/* Component doesn't render visible content */
</style> 