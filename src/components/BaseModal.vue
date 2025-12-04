<template>
  <teleport to="body">
    <transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click="closeIfClickedOutside">
        <div class="modal" :class="`modal--${size}`" @click.stop>
          <div class="modal__header">
            <h2 class="modal__title">{{ title }}</h2>
            <button @click="close" class="modal__close-btn">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div class="modal__content">
            <slot />
          </div>

          <div v-if="showFooter" class="modal__footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

interface Props {
  isOpen: boolean
  title: string
  size?: 'sm' | 'md' | 'lg'
  closeOnClickOutside?: boolean
  showFooter?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  closeOnClickOutside: true,
  showFooter: false,
})

const emit = defineEmits<{
  close: []
}>()

const closeIfClickedOutside = () => {
  if (props.closeOnClickOutside) {
    emit('close')
  }
}

const close = () => {
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  animation: fadeIn var(--transition-base) ease-out;
}

.modal {
  background-color: var(--color-white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  animation: slideIn var(--transition-base) ease-out;
}

.modal--sm {
  width: 90%;
  max-width: 400px;
}

.modal--md {
  width: 90%;
  max-width: 600px;
}

.modal--lg {
  width: 90%;
  max-width: 900px;
}

.modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-gray-200);
}

.modal__title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--color-gray-900);
  margin: 0;
}

.modal__close-btn {
  background: none;
  border: none;
  color: var(--color-gray-400);
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal__close-btn:hover {
  background-color: var(--color-gray-100);
  color: var(--color-gray-700);
}

.modal__content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-lg);
}

.modal__footer {
  padding: var(--spacing-lg);
  border-top: 1px solid var(--color-gray-200);
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
}

/* Animations */
.modal-enter-active,
.modal-leave-active {
  transition: opacity var(--transition-base) ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .modal {
    max-height: 95vh;
  }

  .modal--sm,
  .modal--md,
  .modal--lg {
    width: 95%;
    max-width: none;
  }
}
</style>
