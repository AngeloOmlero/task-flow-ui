<template>
  <div class="toast-container">
    <TransitionGroup name="toast-list" tag="div">
      <div
        v-for="toast in uiStore.toasts"
        :key="toast.id"
        :class="['toast-item', `toast-item--${toast.type}`]"
      >
        <div class="toast-item__icon">
          <svg v-if="toast.type === 'success'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          <svg v-else-if="toast.type === 'error'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
          <svg v-else-if="toast.type === 'warning'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          <svg v-else-if="toast.type === 'info'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
        </div>
        <div class="toast-item__content">
          <p class="toast-item__message">{{ toast.message }}</p>
        </div>
        <button @click="uiStore.removeToast(toast.id)" class="toast-item__close-btn">&times;</button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'; // Import watch
import { useUiStore } from '../../stores/ui';

const uiStore = useUiStore();

// Add a watch to log changes in uiStore.toasts
watch(() => uiStore.toasts, (newToasts) => {
  console.log('ToastContainer: uiStore.toasts updated:', newToasts);
}, { deep: true }); // Use deep watch for array of objects
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: var(--spacing-lg);
  left: var(--spacing-lg);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  pointer-events: none; /* Allow clicks to pass through container */
}

.toast-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  background-color: var(--color-white);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  min-width: 250px;
  max-width: 350px;
  pointer-events: auto; /* Re-enable clicks for individual toasts */
  transition: all 0.3s ease-out;
}

.toast-item--success {
  border-left: 4px solid var(--color-green-500);
}
.toast-item--error {
  border-left: 4px solid var(--color-red-500);
}
.toast-item--info {
  border-left: 4px solid var(--color-blue-500);
}
.toast-item--warning {
  border-left: 4px solid var(--color-amber-500);
}

.toast-item__icon svg {
  color: var(--color-gray-600);
}
.toast-item--success .toast-item__icon svg {
  color: var(--color-green-500);
}
.toast-item--error .toast-item__icon svg {
  color: var(--color-red-500);
}
.toast-item--info .toast-item__icon svg {
  color: var(--color-blue-500);
}
.toast-item--warning .toast-item__icon svg {
  color: var(--color-amber-500);
}

.toast-item__content {
  flex-grow: 1;
}

.toast-item__message {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-gray-800);
}

.toast-item__close-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: var(--color-gray-400);
  cursor: pointer;
  transition: color 0.2s ease-in-out;
}

.toast-item__close-btn:hover {
  color: var(--color-gray-600);
}

/* TransitionGroup styles */
.toast-list-enter-from,
.toast-list-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}
.toast-list-leave-active {
  position: absolute; /* Ensures smooth removal */
}
</style>
