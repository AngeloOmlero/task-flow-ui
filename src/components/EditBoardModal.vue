<template>
  <div v-if="uiStore.activeModal === 'editBoard'" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content animate-fade-in-up">
      <div class="modal-header">
        <h2>Edit Board</h2>
        <button @click="closeModal" class="modal-close-btn">&times;</button>
      </div>
      <div class="modal-body">
        <form v-if="boardStore.currentBoard" @submit.prevent="submitForm">
          <div class="form-group">
            <label for="board-title">Board Title</label>
            <input
              id="board-title"
              v-model="form.title"
              type="text"
              placeholder="e.g., Q4 Marketing Plan"
              required
            />
          </div>
          <div class="form-group">
            <label for="board-description">Description (optional)</label>
            <textarea
              id="board-description"
              v-model="form.description"
              rows="3"
              placeholder="Add a short description for your board"
            ></textarea>
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" @click="closeModal">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="uiStore.isLoading">
              <span v-if="uiStore.isLoading">Saving...</span>
              <span v-else>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useUiStore } from '../stores/ui'
import { useBoardStore } from '../stores/board'
import { boardService } from '../services'

const uiStore = useUiStore()
const boardStore = useBoardStore()

const form = ref({
  title: '',
  description: '',
})

// Watch for the modal opening and populate the form with the current board's data
watch(
  () => uiStore.activeModal,
  (modal) => {
    if (modal === 'editBoard' && boardStore.currentBoard) {
      form.value.title = boardStore.currentBoard.title
      form.value.description = boardStore.currentBoard.description || ''
    }
  },
)

const closeModal = () => {
  uiStore.closeModal()
}

const submitForm = async () => {
  if (!boardStore.currentBoardId) return

  try {
    uiStore.setLoading(true)
    const updatedBoard = await boardService.updateBoard(boardStore.currentBoardId, {
      title: form.value.title,
      description: form.value.description,
    })
    boardStore.updateBoard(updatedBoard) // Update the board in the store
    uiStore.showNotification('Board updated successfully', 'success')
    closeModal()
  } catch (error) {
    uiStore.showNotification('Failed to update board', 'error')
    console.error(error)
  } finally {
    uiStore.setLoading(false)
  }
}
</script>

<style scoped>
@import '../assets/css/modal.css';
</style>
