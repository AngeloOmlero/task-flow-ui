<template>
  <div
    class="task-card"
    @click="openTaskDetails"
    draggable="true"
    @dragstart="dragStart"
    @dragend="dragEnd"
  >
    <!-- Header -->
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

    <!-- Description -->
    <p v-if="task.description" class="task-card__description">
      {{ truncateText(task.description, 100) }}
    </p>

    <!-- Meta: Due Date & Comment Indicator -->
    <div class="task-card__meta">
      <!-- Due Date -->
      <div v-if="task.dueDate" class="task-card__meta-item">
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

      <!-- Comment Indicator -->
      <div v-if="commentCount > 0" class="task-card__meta-item">
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
        <span>{{ commentCount }}</span>
      </div>
    </div>

    <!-- Footer: Assignees -->
    <div class="task-card__footer">
      <div v-if="task.assignees?.length" class="task-card__assignees">
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Task, Comment } from '../types'
import { useUiStore } from '../stores/ui'

interface Props {
  task: Task
  comments?: Comment[]
}

const props = defineProps<Props>()
const uiStore = useUiStore()
const isDragging = ref(false)

// Compute comment count safely
const commentCount = computed(() => props.comments?.length || 0)

// Utilities
const truncateText = (text: string, maxLength: number) =>
  text.length > maxLength ? text.substring(0, maxLength) + '...' : text

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

// Drag handlers
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

// Open task details modal
const openTaskDetails = () => {
  uiStore.setSelectedTaskId(props.task.id)
  uiStore.openModal('taskDetails')
}
</script>

<style scoped>
.task-card {
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  cursor: grab;
  transition: all 0.2s;
  user-select: none;
}

.task-card:active {
  cursor: grabbing;
}

.task-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-color: #d1d5db;
}

.task-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
  gap: 0.5rem;
}

.task-card__title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
  line-height: 1.4;
  flex: 1;
}

.task-card__priority {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 0.25rem;
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
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
}

.task-card__meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.task-card__meta-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.task-card__meta-item span {
  font-size: 0.75rem;
}

.task-card__footer {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.5rem;
}

.task-card__assignees {
  display: flex;
  align-items: center;
}

.task-card__avatar {
  width: 24px;
  height: 24px;
  border-radius: 9999px;
  overflow: hidden;
  border: 2px solid #ffffff;
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
  font-size: 0.75rem;
  color: #6b7280;
  margin-left: 4px;
  font-weight: 500;
}
</style>
