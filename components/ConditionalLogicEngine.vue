<template>
  <div class="conditional-logic-engine">
    <!-- This component handles conditional logic execution -->
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'

const props = defineProps({
  formComponents: {
    type: Array,
    required: true
  },
  formData: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['script-generated'])

// Internal state
const generatedScript = ref('')
const isInitialized = ref(false)

// Generate conditional logic script from form components
const generateConditionalLogicScript = () => {
  const scriptsArray = []
  
  // Process each component that has conditional logic enabled
  props.formComponents.forEach(component => {
    const conditionalLogic = component.props.conditionalLogic
    
    if (!conditionalLogic || !conditionalLogic.enabled || !conditionalLogic.conditions.length) {
      return
    }
    
    const { conditions, action, operator } = conditionalLogic
    const fieldName = component.props.name
    
    if (!fieldName) return
    
    // Generate condition checks
    const conditionChecks = conditions.map(condition => {
      const { field, operator: condOp, value } = condition
      
      switch (condOp) {
        case 'equals':
          return `getField('${field}') === '${value}'`
        case 'not_equals':
          return `getField('${field}') !== '${value}'`
        case 'contains':
          return `String(getField('${field}') || '').toLowerCase().includes('${value}'.toLowerCase())`
        case 'not_contains':
          return `!String(getField('${field}') || '').toLowerCase().includes('${value}'.toLowerCase())`
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
    
    // Generate action functions
    const actionCode = action === 'show' ? `showField('${fieldName}')` :
                      action === 'hide' ? `hideField('${fieldName}')` :
                      action === 'enable' ? `enableField('${fieldName}')` :
                      action === 'disable' ? `disableField('${fieldName}')` :
                      `showField('${fieldName}')`
    
    const inverseActionCode = action === 'show' ? `hideField('${fieldName}')` :
                             action === 'hide' ? `showField('${fieldName}')` :
                             action === 'enable' ? `disableField('${fieldName}')` :
                             action === 'disable' ? `enableField('${fieldName}')` :
                             `hideField('${fieldName}')`
    
    // Generate field change listeners
    const watchedFields = [...new Set(conditions.map(c => c.field).filter(Boolean))]
    
    watchedFields.forEach(watchField => {
      const script = `
// Conditional logic for field: ${fieldName}
onFieldChange('${watchField}', function() {
  if (${conditionChecks}) {
    ${actionCode};
  } else {
    ${inverseActionCode};
  }
});`
      scriptsArray.push(script)
    })
    
    // Also add initial evaluation
    const initialScript = `
// Initial evaluation for field: ${fieldName}
(function() {
  if (${conditionChecks}) {
    ${actionCode};
  } else {
    ${inverseActionCode};
  }
})();`
    scriptsArray.push(initialScript)
  })
  
  return scriptsArray.join('\n\n')
}

// Update generated script when components change
watch(() => props.formComponents, () => {
  if (isInitialized.value) {
    updateConditionalLogic()
  }
}, { deep: true })

// Update conditional logic
const updateConditionalLogic = () => {
  const newScript = generateConditionalLogicScript()
  generatedScript.value = newScript
  
  // Emit the generated script to parent component
  emit('script-generated', newScript)
}

// Initialize on mount
onMounted(() => {
  nextTick(() => {
    updateConditionalLogic()
    isInitialized.value = true
  })
})

// Expose the generated script for debugging
defineExpose({
  generatedScript,
  updateConditionalLogic
})
</script>

<style scoped>
.conditional-logic-engine {
  display: none; /* This component is purely functional */
}
</style> 