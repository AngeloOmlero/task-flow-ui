<template>
  <div
    class="task-card"
    @click="openTaskDetails"
    draggable="true"
    @dragstart="dragStart"
    @dragend="dragEnd"
  >
    <div class="task-card__header">
      <h4 class="task-card__title">{{ task.title }}</h4>
      <div
        class="task-card__priority"
        v-if="task.priority"
        :data-priority="task.priority.toLowerCase()"
      >
        {{ task.priority }}
      </div>
    </div>

    <p v-if="task.description" class="task-card__description">
      {{ truncateText(task.description, 100) }}
    </p>

    <div v-if="task.dueDate" class="task-card__meta">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
      <span>{{ formatDate(task.dueDate) }}</span>
    </div>

    <div class="task-card__footer">
      <div v-if="task.assignees && task.assignees.length > 0" class="task-card__assignees">
        <div
          v-for="assignee in task.assignees.slice(0, 3)"
          :key="assignee.id"
          class="task-card__avatar"
        >
          <img
            :src="`https://ui-avatars.com/api/?name=${assignee.username}&size=24`"
            :alt="assignee.username"
            :title="assignee.username"
          />
        </div>
        <span v-if="task.assignees.length > 3" class="task-card__more"
          >+{{ task.assignees.length - 3 }}</span
        >
      </div>

      <div class="task-card__comments-count" v-if="task.comments && task.comments.length > 0">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span>{{ task.comments.length }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Task } from '../types'
import { useUiStore } from '../stores/ui'

interface Props {
  task: Task
}

const props = defineProps<Props>()
const uiStore = useUiStore()
const isDragging = ref(false)

const truncateText = (text: string, maxLength: number) => {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const dragStart = (event: DragEvent) => {
  isDragging.value = true
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('taskId', props.task.id.toString())
  }
}

const dragEnd = () => {
  isDragging.value = false
}

const openTaskDetails = () => {
  uiStore.setSelectedTaskId(props.task.id)
  uiStore.openModal('taskDetails')
}
</script>

<style scoped>
.task-card {
  background-color: var(--color-white);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  cursor: grab;
  transition: all var(--transition-fast);
  user-select: none;
}

.task-card:active {
  cursor: grabbing;
}

.task-card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--color-gray-300);
}

.task-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
}

.task-card__title {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-gray-900);
  margin: 0;
  line-height: 1.4;
  flex: 1;
}

.task-card__priority {
  flex-shrink: 0;
  font-size: var(--font-size-xs);
  font-weight: 600;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.task-card__priority[data-priority='low'] {
  background-color: #dcfce7;
  color: #166534;
}

.task-card__priority[data-priority='medium'] {
  background-color: #fef3c7;
  color: #92400e;
}

.task-card__priority[data-priority='high'] {
  background-color: #fed7aa;
  color: #9a3412;
}

.task-card__priority[data-priority='urgent'] {
  background-color: #fee2e2;
  color: #991b1b;
}

.task-card__description {
  font-size: var(--font-size-xs);
  color: var(--color-gray-600);
  margin: 0 0 var(--spacing-sm) 0;
  line-height: 1.4;
}

.task-card__meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-xs);
  color: var(--color-gray-500);
  margin-bottom: var(--spacing-sm);
}

.task-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
}

.task-card__assignees {
  display: flex;
  align-items: center;
  gap: -4px;
}

.task-card__avatar {
  width: 24px;
  height: 24px;
  border-radius: var(--radius-full);
  overflow: hidden;
  border: 2px solid var(--color-white);
  box-shadow: var(--shadow-sm);
  margin-left: -8px;
  flex-shrink: 0;
}

.task-card__avatar:first-child {
  margin-left: 0;
}

.task-card__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.task-card__more {
  font-size: var(--font-size-xs);
  color: var(--color-gray-600);
  margin-left: 4px;
  font-weight: 500;
}

.task-card__comments-count {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--font-size-xs);
  color: var(--color-gray-500);
}
</style>
