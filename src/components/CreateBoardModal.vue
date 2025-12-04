<template>
  <BaseModal :isOpen="isOpen" title="Create Board" size="md" @close="close" show-footer>
    <form @submit.prevent="submit" class="form">
      <div class="form-group">
        <label for="title" class="form-label">Board Title</label>
        <input
          id="title"
          v-model="form.title"
          type="text"
          placeholder="e.g., Website Redesign"
          required
          maxlength="100"
        />
      </div>

      <div class="form-group">
        <label for="description" class="form-label">Description (Optional)</label>
        <textarea
          id="description"
          v-model="form.description"
          placeholder="Enter board description"
          rows="4"
          maxlength="500"
        />
        <span class="form-help">{{ (form.description || '').length }}/500</span>
      </div>
    </form>

    <template #footer>
      <button @click="close" class="btn btn-secondary">Cancel</button>
      <button @click="submit" class="btn btn-primary" :disabled="!form.title.trim()">
        Create Board
      </button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import BaseModal from './BaseModal.vue'
import { useUiStore } from '../stores/ui'
import { useBoardStore } from '../stores/board'
import { boardService } from '../services'
import type { CreateBoardDto } from '../types'

const uiStore = useUiStore()
const boardStore = useBoardStore()

const form = ref<CreateBoardDto>({
  title: '',
  description: '',
})

const isOpen = computed(() => uiStore.activeModal === 'createBoard')

const close = () => {
  uiStore.closeModal()
  form.value = { title: '', description: '' }
}

const submit = async () => {
  try {
    uiStore.setLoading(true)
    const newBoard = await boardService.createBoard(form.value)
    boardStore.addBoard(newBoard)
    boardStore.setCurrentBoard(newBoard.id)
    uiStore.showNotification('Board created successfully', 'success')
    close()
  } catch (error) {
    uiStore.showNotification('Failed to create board', 'error')
    console.error(error)
  } finally {
    uiStore.setLoading(false)
  }
}
</script>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.form-label {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-gray-700);
}

.form-help {
  font-size: var(--font-size-xs);
  color: var(--color-gray-500);
}

input,
textarea {
  font-size: var(--font-size-sm);
}
</style>
