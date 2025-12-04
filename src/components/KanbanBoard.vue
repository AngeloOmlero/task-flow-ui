<template>
  <div class="kanban-board">
    <div v-if="!boardStore.currentBoard" class="kanban-board__empty">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="64"
        height="64"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="3" x2="9" y2="21" />
      </svg>
      <h2>No board selected</h2>
      <p>Select a board from the sidebar or create a new one</p>
      <button @click="uiStore.openModal('createBoard')" class="btn btn-primary">
        Create Board
      </button>
    </div>

    <div v-else class="kanban-board__container">
      <div class="kanban-board__header">
        <div class="kanban-board__title-section">
          <h2>{{ boardStore.currentBoard.title }}</h2>
          <p v-if="boardStore.currentBoard.description" class="kanban-board__description">
            {{ boardStore.currentBoard.description }}
          </p>
        </div>
        <div class="kanban-board__actions">
          <button
            v-if="isOwner"
            @click="uiStore.openModal('editBoard')"
            class="btn btn-secondary"
            title="Edit this board"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit Board
          </button>
          <button
            v-if="isOwner"
            @click="deleteBoard"
            class="btn btn-danger"
            title="Delete this board"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polyline points="3 6 5 6 21 6" />
              <path
                d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
              />
            </svg>
            Delete Board
          </button>
          <button @click="uiStore.openModal('createTask')" class="btn btn-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Task
          </button>
        </div>
      </div>

      <div class="kanban-board__columns">
        <div
          v-for="status in statuses"
          :key="status.id"
          class="kanban-column"
          @dragover="allowDrop"
          @drop="dropTask($event, status.id)"
        >
          <div class="kanban-column__header">
            <div class="kanban-column__title-wrapper">
              <div class="kanban-column__dot" :style="{ backgroundColor: status.color }" />
              <h3 class="kanban-column__title">{{ status.name }}</h3>
              <div class="kanban-column__count">
                {{ boardStore.tasksByStatus.get(status.id)?.length || 0 }}
              </div>
            </div>
          </div>

          <div class="kanban-column__tasks">
            <transition-group name="tasks" tag="div">
              <TaskCard
                v-for="task in boardStore.tasksByStatus.get(status.id)"
                :key="task.id"
                :task="task"
              />
            </transition-group>

            <div
              v-if="!boardStore.tasksByStatus.get(status.id)?.length"
              class="kanban-column__empty"
            >
              <p>No tasks</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useBoardStore } from '../stores/board'
import { useUiStore } from '../stores/ui'
import TaskCard from './TaskCard.vue'
import { boardService, taskService } from '../services'

defineProps<{
  isOwner: boolean
}>()

const boardStore = useBoardStore()
const uiStore = useUiStore()

interface Status {
  id: string
  name: string
  color: string
}

const statuses = computed<Status[]>(() => [
  { id: 'TODO', name: 'To Do', color: '#f3f4f6' },
  { id: 'IN_PROGRESS', name: 'In Progress', color: '#3b82f6' },
  { id: 'IN_REVIEW', name: 'In Review', color: '#f59e0b' },
  { id: 'DONE', name: 'Done', color: '#10b981' },
])

const allowDrop = (event: DragEvent) => {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

const dropTask = async (event: DragEvent, newStatus: string) => {
  event.preventDefault()

  if (!event.dataTransfer) return

  const taskId = parseInt(event.dataTransfer.getData('taskId'))
  const task = boardStore.tasks.find((t) => t.id === taskId)
  const boardId = boardStore.currentBoardId

  if (task && task.status !== newStatus && boardId) {
    try {
      boardStore.moveTask(taskId, newStatus, boardId) // Pass boardId here
      await taskService.updateTask(boardId, taskId, { status: newStatus })
    } catch (error) {
      uiStore.showNotification('Failed to update task status', 'error')
      console.error(error)
      // Revert the change in the store if the API call fails
      boardStore.moveTask(taskId, task.status, boardId) // Pass boardId here
    }
  }
}

const deleteBoard = async () => {
  if (!boardStore.currentBoardId) return
  if (confirm('Are you sure you want to delete this board? This action cannot be undone.')) {
    try {
      await boardService.deleteBoard(boardStore.currentBoardId)
      uiStore.showNotification('Board deleted successfully', 'success')
      // The boardStore will be updated via WebSocket message
    } catch (error) {
      uiStore.showNotification('Failed to delete board', 'error')
      console.error(error)
    }
  }
}
</script>

<style scoped>
.kanban-board {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--color-gray-50);
  overflow-y: auto;
}

.kanban-board__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  text-align: center;
  color: var(--color-gray-500);
}

.kanban-board__empty svg {
  color: var(--color-gray-300);
  margin-bottom: var(--spacing-lg);
}

.kanban-board__empty h2 {
  color: var(--color-gray-700);
  margin-bottom: var(--spacing-md);
}

.kanban-board__empty p {
  margin-bottom: var(--spacing-lg);
}

.kanban-board__container {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
}

.kanban-board__header {
  padding: var(--spacing-lg);
  background-color: var(--color-white);
  border-bottom: 1px solid var(--color-gray-200);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-lg);
}

.kanban-board__title-section h2 {
  margin: 0 0 var(--spacing-xs) 0;
  color: var(--color-gray-900);
}

.kanban-board__description {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
}

.kanban-board__actions {
  display: flex;
  gap: var(--spacing-md);
}

.kanban-board__actions .btn {
  display: flex;
  align-items: center;
  gap: 10px;
}

.kanban-board__columns {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  overflow-y: auto;
  flex: 1;
}

.kanban-column {
  background-color: var(--color-gray-100);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  min-height: 500px;
  transition: background-color var(--transition-fast);
  overflow-y: auto;
}

.kanban-column:hover {
  background-color: var(--color-gray-200);
}

.kanban-column__header {
  margin-bottom: var(--spacing-md);
}

.kanban-column__title-wrapper {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.kanban-column__dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

.kanban-column__title {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-gray-900);
  margin: 0;
  flex: 1;
}

.kanban-column__count {
  font-size: var(--font-size-sm);
  color: var(--color-gray-500);
  font-weight: 500;
  background-color: var(--color-white);
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

.kanban-column__tasks {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.kanban-column__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: var(--color-gray-400);
  font-size: var(--font-size-sm);
}

.kanban-column__empty p {
  margin: 0;
}

/* Transitions */
.tasks-enter-active,
.tasks-leave-active {
  transition: all var(--transition-base) ease;
}

.tasks-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.tasks-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@media (max-width: 1024px) {
  .kanban-board__columns {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }

  .kanban-column {
    min-height: 400px;
  }
}

@media (max-width: 768px) {
  .kanban-board__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .kanban-board__actions {
    width: 100%;
  }

  .kanban-board__actions .btn {
    width: 100%;
  }
}
</style>
