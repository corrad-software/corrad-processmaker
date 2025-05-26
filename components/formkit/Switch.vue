<script setup>
const props = defineProps({
  context: Object,
});

function handleChange(event) {
  props.context.node.input(event.target.checked);
}
</script>

<template>
  <div class="flex items-center justify-start">
    <div class="relative inline-block w-11 h-6">
      <input
        :id="context.id"
        type="checkbox"
        :checked="context._value"
        :disabled="context.disabled"
        @change="handleChange"
        class="sr-only peer"
      />
      <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
    </div>
  </div>
</template>

<style scoped>
/* Additional styles for better visual feedback */
.peer:checked + div {
  background-color: #3b82f6;
}

.peer:disabled + div {
  opacity: 0.5;
  cursor: not-allowed;
}

.peer:focus + div {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
</style> 