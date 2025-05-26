<script setup>
import { ref, provide, useSlots, onMounted, watch } from 'vue';

const props = defineProps({
  variant: {
    type: String,
    default: "primary",
  },
  type: {
    type: String,
    default: "default",
  },
  vertical: {
    type: Boolean,
    default: false,
  },
  fill: {
    type: Boolean,
    default: false,
  },
  justify: {
    type: String,
    default: "left",
  },
  tabs: {
    type: Array,
    default: null,
  },
  modelValue: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(['update:modelValue']);

// Slots
const slots = useSlots();

// Handle cases where slots.default might not exist or not be a function
const tabs = ref([]);
const selectedTitle = ref('');

// Initialize tabs from slots or props
onMounted(() => {
  if (props.tabs) {
    // If tabs are provided via props (new pattern)
    tabs.value = props.tabs;
    selectedTitle.value = props.modelValue || props.tabs[0]?.key || props.tabs[0]?.label || '';
  } else if (slots.default && typeof slots.default === 'function') {
    // If tabs are provided via slots (original pattern)
    try {
      const slotContent = slots.default();
      if (slotContent && Array.isArray(slotContent)) {
        tabs.value = slotContent.map((tab) => tab.props).filter(Boolean);
        selectedTitle.value = tabs.value[0]?.title || '';
        
        // Check for active tab
        tabs.value.forEach((tab) => {
          if (typeof tab.active !== "undefined") {
            selectedTitle.value = tab.title;
          }
        });
      }
    } catch (error) {
      console.warn('Error processing tab slots:', error);
      tabs.value = [];
    }
  }
});

// Watch for changes in modelValue
watch(() => props.modelValue, (newValue) => {
  if (newValue && newValue !== selectedTitle.value) {
    selectedTitle.value = newValue;
  }
});

// Watch for changes in selectedTitle and emit update
watch(selectedTitle, (newValue) => {
  if (props.modelValue !== undefined) {
    emit('update:modelValue', newValue);
  }
});

// Helper function to get the correct key/title from tab object
const getTabKey = (tab) => {
  return tab.key || tab.title || tab.label || '';
};

const getTabLabel = (tab) => {
  return tab.label || tab.title || tab.key || '';
};

provide("selectedTitle", selectedTitle);
</script>

<template>
  <client-only>
    <div
      class="tab"
      :class="{
        vertical: vertical,
        'tab-card': type === 'card' && !vertical,
        'card-vertical': type === 'card' && vertical,
        'card-primary': type === 'card' && variant === 'primary',
        'card-secondary': type === 'card' && variant === 'secondary',
        'card-success': type === 'card' && variant === 'success',
        'card-danger': type === 'card' && variant === 'danger',
        'card-warning': type === 'card' && variant === 'warning',
        'card-info': type === 'card' && variant === 'info',
      }"
    >
      <ul
        class="tab-nav"
        :class="{
          'tab-nav-card': type === 'card' && !vertical,
          'tab-nav-card card-vertical': type === 'card' && vertical,
          vertical: vertical,
          'vertical-fill': vertical && fill,
        }"
      >
        <li
          class="tab-item"
          :class="{
            fill: fill,
            border: type === 'border',
            'border-horizontal': type === 'border' && !vertical,
            'border-horizontal-active':
              selectedTitle === getTabKey(val) && type === 'border' && !vertical,
            'border-vertical': type === 'border' && vertical,
            'border-vertical-active':
              selectedTitle === getTabKey(val) && type === 'border' && vertical,

            // Variant Color for Border Type
            'border-hover-primary': type === 'border' && variant == 'primary',
            'border-hover-secondary':
              type === 'border' && variant == 'secondary',
            'border-hover-info': type === 'border' && variant == 'info',
            'border-hover-success': type === 'border' && variant == 'success',
            'border-hover-warning': type === 'border' && variant == 'warning',
            'border-hover-danger': type === 'border' && variant == 'danger',

            // Variant Color for Border Type Active
            'border-active-primary':
              selectedTitle === getTabKey(val) &&
              type === 'border' &&
              variant == 'primary',
            'border-active-secondary':
              selectedTitle === getTabKey(val) &&
              type === 'border' &&
              variant == 'secondary',
            'border-active-info':
              selectedTitle === getTabKey(val) &&
              type === 'border' &&
              variant == 'info',
            'border-active-success':
              selectedTitle === getTabKey(val) &&
              type === 'border' &&
              variant == 'success',
            'border-active-warning':
              selectedTitle === getTabKey(val) &&
              type === 'border' &&
              variant == 'warning',
            'border-active-danger':
              selectedTitle === getTabKey(val) &&
              type === 'border' &&
              variant == 'danger',
          }"
          role="presentation"
          v-for="(val, index) in tabs"
          :key="index"
          @click="selectedTitle = getTabKey(val)"
        >
          <a
            class="tab-item-link"
            :class="{
              default: type === 'default' && !vertical,
              'default-vertical': type === 'default' && vertical,
              'default-active':
                selectedTitle === getTabKey(val) && type === 'default' && !vertical,
              'default-vertical-active':
                selectedTitle === getTabKey(val) && type === 'default' && vertical,

              // Variant hover for default type
              'default-hover-primary':
                type === 'default' && variant == 'primary',
              'default-hover-secondary':
                type === 'default' && variant == 'secondary',
              'default-hover-info': type === 'default' && variant == 'info',
              'default-hover-success':
                type === 'default' && variant == 'success',
              'default-hover-warning':
                type === 'default' && variant == 'warning',
              'default-hover-danger': type === 'default' && variant == 'danger',

              // Variant Color for default type Active
              'default-primary':
                selectedTitle === getTabKey(val) &&
                type === 'default' &&
                variant == 'primary',
              'default-secondary':
                selectedTitle === getTabKey(val) &&
                type === 'default' &&
                variant == 'secondary',
              'default-info':
                selectedTitle === getTabKey(val) &&
                type === 'default' &&
                variant == 'info',
              'default-success':
                selectedTitle === getTabKey(val) &&
                type === 'default' &&
                variant == 'success',
              'default-warning':
                selectedTitle === getTabKey(val) &&
                type === 'default' &&
                variant == 'warning',
              'default-danger':
                selectedTitle === getTabKey(val) &&
                type === 'default' &&
                variant == 'danger',

              'link-card': type === 'card' && !vertical,
              'link-card-vertical': type === 'card' && vertical,

              // Variant Color for card type
              'link-card-primary': type === 'card' && variant == 'primary',
              'link-card-secondary': type === 'card' && variant == 'secondary',
              'link-card-info': type === 'card' && variant == 'info',
              'link-card-success': type === 'card' && variant == 'success',
              'link-card-warning': type === 'card' && variant == 'warning',
              'link-card-danger': type === 'card' && variant == 'danger',

              // Variant Color for card type Active
              'link-card-primary-active':
                selectedTitle === getTabKey(val) &&
                type === 'card' &&
                variant == 'primary',
              'link-card-secondary-active':
                selectedTitle === getTabKey(val) &&
                type === 'card' &&
                variant == 'secondary',
              'link-card-info-active':
                selectedTitle === getTabKey(val) &&
                type === 'card' &&
                variant == 'info',
              'link-card-success-active':
                selectedTitle === getTabKey(val) &&
                type === 'card' &&
                variant == 'success',
              'link-card-warning-active':
                selectedTitle === getTabKey(val) &&
                type === 'card' &&
                variant == 'warning',
              'link-card-danger-active':
                selectedTitle === getTabKey(val) &&
                type === 'card' &&
                variant == 'danger',

              'link-justify-left': justify == 'left',
              'link-justify-center': justify == 'center',
              'link-justify-right': justify == 'right',
            }"
            >{{ getTabLabel(val) }}</a
          >
        </li>
      </ul>
      <div
        class="tab-content"
        :class="{
          'content-vertical': vertical && !fill,
          'content-vertical-fill': vertical && fill,
          'content-border': type === 'border' && !vertical,
          'content-border-vertical': type === 'border' && vertical,
          'content-border-primary': type === 'border' && variant === 'primary',
          'content-border-secondary':
            type === 'border' && variant === 'secondary',
          'content-border-info': type === 'border' && variant === 'info',
          'content-border-success': type === 'border' && variant === 'success',
          'content-border-warning': type === 'border' && variant === 'warning',
          'content-border-danger': type === 'border' && variant === 'danger',
        }"
      >
        <!-- New pattern: Named slots for each tab -->
        <template v-if="props.tabs">
          <div v-for="tab in props.tabs" :key="tab.key" v-show="selectedTitle === tab.key">
            <slot :name="tab.key"></slot>
          </div>
        </template>
        
        <!-- Old pattern: Default slot with RsTabItem components -->
        <template v-else>
          <slot></slot>
        </template>
      </div>
    </div>
  </client-only>
</template>
