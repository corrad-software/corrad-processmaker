<template>
  <div>
    <!-- Custom CSS Injection - Remove scoped to allow global styling -->
    <component :is="'style'" v-if="customCSS">
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
const previousFormData = ref({});

// Create safe execution context
const createScriptContext = () => {
  const context = {
    getField: (fieldName) => {
      return props.formData[fieldName];
    },
    
    setField: (fieldName, value) => {
      // Try to find the FormKit input element and update it directly
      const fieldElement = document.querySelector(`[data-name="${fieldName}"] input, [data-name="${fieldName}"] select, [data-name="${fieldName}"] textarea`);
      if (fieldElement) {
        fieldElement.value = value;
        
        // Trigger input event to notify FormKit of the change
        const inputEvent = new Event('input', { bubbles: true });
        fieldElement.dispatchEvent(inputEvent);
        
        // Also trigger change event
        const changeEvent = new Event('change', { bubbles: true });
        fieldElement.dispatchEvent(changeEvent);
      }
      
      // Also emit the event for the parent component
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
    
    // Add missing helper functions
    showSuccess: (message) => {
      // Create a simple success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
      notification.textContent = message;
      document.body.appendChild(notification);
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 3000);
    },
    
    showError: (message) => {
      // Create a simple error notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50';
      notification.textContent = message;
      document.body.appendChild(notification);
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 5000);
    },
    
    showInfo: (message) => {
      // Create a simple info notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded shadow-lg z-50';
      notification.textContent = message;
      document.body.appendChild(notification);
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 3000);
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
    Number: Number,
    
    // Additional utility functions
    setTimeout: setTimeout,
    setInterval: setInterval,
    clearTimeout: clearTimeout,
    clearInterval: clearInterval
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
    console.error('[FormScriptEngine] Script execution error:', error);
    // Show error to user if showError function is available
    if (context.showError) {
      context.showError(`Script Error: ${error.message}`);
    }
  }
};

// Initialize script engine
const initializeScript = () => {
  fieldChangeHandlers.value.clear();
  
  // Create script context
  scriptContext.value = createScriptContext();
  
  // Store initial form data
  previousFormData.value = { ...props.formData };
  
  // Execute onLoad script if enabled
  if (props.formEvents.onLoad && props.customScript) {
    executeScript(props.customScript, scriptContext.value);
  }
  
  isScriptInitialized.value = true;
};

// Handle field changes
const handleFieldChange = (fieldName, newValue, oldValue) => {
  if (!fieldChangeHandlers.value.has(fieldName)) {
    return;
  }
  
  const handlers = fieldChangeHandlers.value.get(fieldName);
  handlers.forEach((handler, index) => {
    try {
      if (typeof handler === 'function') {
        handler.call(scriptContext.value, newValue, oldValue);
      }
    } catch (error) {
      console.error(`[FormScriptEngine] Error in onFieldChange handler for "${fieldName}":`, error);
      if (scriptContext.value?.showError) {
        scriptContext.value.showError(`Field change handler error for ${fieldName}: ${error.message}`);
      }
    }
  });
};

// Watch for script changes and reinitialize
watch(() => props.customScript, (newScript, oldScript) => {
  if (newScript !== oldScript) {
    isScriptInitialized.value = false;
    initializeScript();
  }
});

// Watch for form data changes - the elegant, performant way
watch(() => props.formData, (newData, oldData) => {
  if (!isScriptInitialized.value || !props.formEvents.onFieldChange) {
    return;
  }
  
  // Compare with our stored previousFormData to detect changes
  Object.keys(newData).forEach(fieldName => {
    const newValue = newData[fieldName];
    const oldValue = previousFormData.value[fieldName];
    
    if (newValue !== oldValue) {
      handleFieldChange(fieldName, newValue, oldValue);
    }
  });
  
  // Update previousFormData for next comparison
  previousFormData.value = { ...newData };
}, { deep: true, immediate: false });

// Watch for CSS changes and update
watch(() => props.customCSS, () => {
  // CSS will be automatically updated by the template reactivity
});

// Lifecycle hooks
onMounted(() => {
  setTimeout(() => {
    initializeScript();
  }, 500); // Delay to ensure parent DOM and initial props are settled
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
    initializeScript(); 
  }
});
</script>

<style>
/* Component doesn't render visible content */
</style> 