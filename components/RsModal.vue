<script setup>
const emits = defineEmits(["update:modelValue"]);
const props = defineProps({
  title: {
    type: String,
    default: "",
  },
  size: {
    type: String,
    default: "md",
  },
  dialogClass: {
    type: String,
    default: "",
  },
  modelValue: {
    type: Boolean,
    default: false,
  },
  position: {
    type: String,
    default: "top",
  },
  hideOverlay: {
    type: Boolean,
    default: false,
  },
  okOnly: {
    type: Boolean,
    default: false,
  },
  okTitle: {
    type: String,
    default: "OK",
  },
  cancelOnly: {
    type: Boolean,
    default: false,
  },
  cancelTitle: {
    type: String,
    default: "Cancel",
  },
  okCallback: {
    type: Function,
    default: () => {},
  },
  cancelCallback: {
    type: Function,
    default: () => {},
  },
  hideFooter: {
    type: Boolean,
    default: false,
  },
  overlayClose: {
    type: Boolean,
    default: true,
  },
  height: {
    type: String,
    default: "70vh",
  },
});

const closeModal = () => {
  emits("update:modelValue", false);
};

const validateCancelCallback = () => {
  if (props.cancelCallback == "() => {}") closeModal();
  else props.cancelCallback();
};

watch(
  () => props.modelValue,
  (val) => {
    if (val) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
  }
);
</script>

<template>
  <Teleport to="body">
    <transition-group name="fade">
      <div
        v-if="modelValue"
        @click.self="overlayClose ? closeModal() : ''"
        class="modal"
        style="z-index: 1000"
        :class="{
          'modal-top': position == 'top',
          'modal-center': position == 'center',
          'modal-end': position == 'bottom',
          'modal-hide-overlay': hideOverlay,
        }"
      >
        <div
          v-show="modelValue"
          class="modal-dialog"
          :class="dialogClass"
          :style="{
            width: size == 'sm' ? '300px' : size == 'md' ? '500px' : '800px',
          }"
        >
          <div class="modal-content">
            <div class="modal-header">
              <h4 v-if="!$slots.header">
                {{ title }}
              </h4>
              <slot name="header"></slot>
              <Icon
                @click="closeModal"
                class="hover:text-gray-800 cursor-pointer"
                name="ic:round-close"
              ></Icon>
            </div>
            <div class="modal-body">
                <slot name="body"></slot>
                <slot v-if="!$slots.body"></slot>
            </div>
            <div v-if="!hideFooter" class="modal-footer">
              <slot name="footer"></slot>
              <rs-button
                v-if="!$slots.footer && !okOnly"
                @click="validateCancelCallback"
                variant="primary-text"
              >
                {{ cancelTitle }}</rs-button
              >
              <rs-button
                v-if="!$slots.footer && !cancelOnly"
                @click="okCallback"
                >{{ okTitle }}</rs-button
              >
            </div>
          </div>
        </div>
      </div>
    </transition-group>
  </Teleport>
</template>

<style scoped>
.modal {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  padding: 1.5rem;
  box-sizing: border-box;
  overflow-y: auto; /* Allow the overlay to scroll */
}

.modal-dialog {
  position: relative;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin: 1.5rem auto;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 3rem);
  width: 100%;
}

.modal-top {
  align-items: flex-start;
  padding-top: 2rem;
}

.modal-center {
  align-items: center;
}

.modal-end {
  align-items: flex-end;
  padding-bottom: 2rem;
}

.modal-hide-overlay {
  background-color: transparent;
}

.modal-content {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  background-color: white;
}

.modal-body {
  padding: 1rem;
  flex-grow: 1;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  background-color: white;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
