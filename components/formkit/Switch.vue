<script setup>
const props = defineProps({
  context: Object,
});

function handleChange(event) {
  props.context.node.input(event.target.checked);
}
</script>

<template>
  <div class="switch-container">
    <div class="switch-wrapper">
      <input
        :id="context.id"
        :name="context.name"
        type="checkbox"
        :checked="context.value"
        :disabled="context.disabled"
        @change="handleChange"
        class="switch-input"
      />
      <label :for="context.id" class="switch-label">
        <span class="switch-track">
          <span class="switch-thumb"></span>
        </span>
      </label>
    </div>
  </div>
</template>

<style scoped>
.switch-container {
  @apply flex items-center justify-start;
}

.switch-wrapper {
  @apply relative;
}

.switch-input {
  @apply sr-only;
}

.switch-label {
  @apply cursor-pointer;
}

.switch-track {
  @apply relative inline-block w-11 h-6 bg-gray-200 rounded-full transition-colors duration-200 ease-in-out;
}

.switch-input:checked + .switch-label .switch-track {
  @apply bg-blue-600;
}

.switch-input:disabled + .switch-label .switch-track {
  @apply opacity-50 cursor-not-allowed;
}

.switch-input:disabled + .switch-label {
  @apply cursor-not-allowed;
}

.switch-thumb {
  @apply absolute top-[2px] left-[2px] w-5 h-5 bg-white border border-gray-300 rounded-full transition-transform duration-200 ease-in-out;
}

.switch-input:checked + .switch-label .switch-thumb {
  @apply transform translate-x-5 border-white;
}

.switch-input:focus + .switch-label .switch-track {
  @apply ring-4 ring-blue-300 ring-opacity-50;
}

/* Mac-specific fixes */
@media (prefers-reduced-motion: reduce) {
  .switch-track,
  .switch-thumb {
    transition: none;
  }
}

/* Force hardware acceleration on Mac for smoother animations */
.switch-thumb {
  transform: translateZ(0);
  will-change: transform;
}

.switch-input:checked + .switch-label .switch-thumb {
  transform: translateX(1.25rem) translateZ(0);
}
</style> 