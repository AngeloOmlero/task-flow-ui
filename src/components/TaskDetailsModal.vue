<template>
  <BaseModal :isOpen="isOpen" :title="task ? 'Task Details' : ''" size="lg" @close="close">
    <div v-if="task" class="task-details">
      <!-- Header -->
      <div class="task-details__header">
        <div>
          <h2 class="task-details__title">{{ task.title }}</h2>
          <div class="task-details__meta-info">
            <span class="task-details__id">Task #{{ task.id }}</span>
            <span class="task-details__status" :data-status="task.status">
              {{ formatStatus(task.status) }}
            </span>
            <span
              v-if="task.priority"
              class="task-details__priority"
              :data-priority="task.priority.toLowerCase()"
            >
              {{ task.priority }}
            </span>
          </div>
        </div>
        <button @click="editTask" class="task-details__edit-btn" title="Edit task">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19H4v-3L16.5 3.5z" />
          </svg>
        </button>
      </div>

      <!-- Description -->
      <div class="task-details__section">
        <h3 class="task-details__section-title">Description</h3>
        <p v-if="task.description" class="task-details__description">{{ task.description }}</p>
        <p v-else class="task-details__empty">No description</p>
      </div>

      <!-- Assignees & Due Date -->
      <div class="task-details__row">
        <div class="task-details__section flex-1">
          <h3 class="task-details__section-title">Assignees</h3>
          <div v-if="task.assignees?.length" class="task-details__assignees">
            <div v-for="assignee in task.assignees" :key="assignee.id" class="assignee-card">
              <img
                :src="`https://ui-avatars.com/api/?name=${assignee.username}`"
                :alt="assignee.username"
                class="assignee-card__avatar"
              />
              <div>
                <div class="assignee-card__name">{{ assignee.username }}</div>
                <div class="assignee-card__email">{{ assignee.email }}</div>
              </div>
            </div>
          </div>
          <p v-else class="task-details__empty">No assignees</p>
        </div>

        <div class="task-details__section flex-1">
          <h3 class="task-details__section-title">Due Date</h3>
          <p v-if="task.dueDate" class="task-details__due-date">{{ formatDate(task.dueDate) }}</p>
          <p v-else class="task-details__empty">No due date</p>
        </div>
      </div>

      <!-- Comments -->
      <div class="task-details__section">
        <div class="task-details__comments-header">
          <div class="flex items-center gap-2">
            <h3 class="task-details__section-title">Comments</h3>

            <!-- COMMENT INDICATOR (NEW) -->
            <span class="task-details__count">
              {{
                comments.length
                  ? `${comments.length} comment${comments.length > 1 ? 's' : ''}`
                  : 'No comments'
              }}
            </span>
          </div>

          <button @click="showCommentForm = !showCommentForm" class="btn btn-sm btn-primary">
            {{ showCommentForm ? 'Cancel' : 'Add Comment' }}
          </button>
        </div>

        <!-- Comment Form -->
        <div v-if="showCommentForm" class="task-details__comment-form">
          <textarea v-model="newComment" placeholder="Write a comment..." rows="3" />
          <div class="task-details__comment-actions">
            <button @click="cancelComment" class="btn btn-secondary">Cancel</button>
            <button @click="submitComment" class="btn btn-primary" :disabled="!newComment.trim()">
              Post Comment
            </button>
          </div>
        </div>

        <!-- Comment List -->
        <div v-if="comments.length" class="task-details__comments-list">
          <div v-for="comment in comments" :key="comment.id" class="comment-item">
            <img
              v-if="comment.author"
              :src="`https://ui-avatars.com/api/?name=${comment.author.username}`"
              :alt="comment.author.username"
              class="comment-item__avatar"
            />
            <div class="comment-item__content">
              <div class="comment-item__header">
                <span v-if="comment.author" class="comment-item__author">
                  {{ comment.author.username }}
                </span>
                <span class="comment-item__date">
                  {{ formatDate(comment.createdAt || '') }}
                </span>
              </div>
              <p class="comment-item__text">{{ comment.content }}</p>
            </div>
          </div>
        </div>
        <p v-else class="task-details__empty">No comments</p>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import BaseModal from './BaseModal.vue'
import { useUiStore } from '../stores/ui'
import { useBoardStore } from '../stores/board'
import { commentService, webSocketService } from '../services'
import type { Comment, CommentUpdateMessage } from '../types'

const uiStore = useUiStore()
const boardStore = useBoardStore()

const showCommentForm = ref(false)
const newComment = ref('')
let commentSubscriptionKey: string | null = null

const isOpen = computed(() => uiStore.activeModal === 'taskDetails')
const task = computed(() => boardStore.tasks.find((t) => t.id === uiStore.selectedTaskId))

const comments = computed<Comment[]>(() =>
  task.value ? boardStore.getComments(task.value.id) : [],
)

watch(isOpen, async (open) => {
  if (open && task.value) {
    await boardStore.fetchCommentsForTask(task.value.id)

    commentSubscriptionKey = webSocketService.subscribeToCommentUpdates(
      task.value.id,
      (message: CommentUpdateMessage) => {
        if (message.type === 'COMMENT_CREATED') {
          boardStore.addComment(task.value!.id, message.comment)
        }
      },
    )
  } else if (commentSubscriptionKey) {
    webSocketService.unsubscribe(commentSubscriptionKey)
    commentSubscriptionKey = null
  }
})

const close = () => {
  uiStore.closeModal()
  uiStore.setSelectedTaskId(null)
  showCommentForm.value = false
  newComment.value = ''
}

const editTask = () => uiStore.openModal('editTask')
const cancelComment = () => {
  showCommentForm.value = false
  newComment.value = ''
}

const submitComment = async () => {
  if (!task.value || !newComment.value.trim()) return

  try {
    uiStore.setLoading(true)
    await commentService.createComment(task.value.id, { content: newComment.value })

    newComment.value = ''
    showCommentForm.value = false

    uiStore.showNotification('Comment posted successfully', 'success')
  } catch (error) {
    uiStore.showNotification('Failed to post comment', 'error')
    console.error(error)
  } finally {
    uiStore.setLoading(false)
  }
}

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

const formatStatus = (status: string) =>
  status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
</script>

<style scoped>
/* Comment count indicator */
.task-details__count {
  font-size: 0.875rem;
  color: #6b7280;
}

/* Existing styles kept exactly as you had them, unchanged */
.task-details {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.task-details__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}
.task-details__title {
  margin: 0 0 0.5rem 0;
  color: #111827;
  font-size: 1.5rem;
}
.task-details__meta-info {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.task-details__id {
  font-size: 0.875rem;
  color: #6b7280;
}
.task-details__status,
.task-details__priority {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  text-transform: uppercase;
}
.task-details__status[data-status='TODO'] {
  background-color: #f3f4f6;
  color: #374151;
}
.task-details__status[data-status='IN_PROGRESS'] {
  background-color: #dbeafe;
  color: #1e40af;
}
.task-details__status[data-status='IN_REVIEW'] {
  background-color: #fde68a;
  color: #92400e;
}
.task-details__status[data-status='DONE'] {
  background-color: #dcfce7;
  color: #166534;
}
.task-details__priority[data-priority='low'] {
  background-color: #dcfce7;
  color: #166534;
}
.task-details__priority[data-priority='medium'] {
  background-color: #fef3c7;
  color: #92400e;
}
.task-details__priority[data-priority='high'] {
  background-color: #fed7aa;
  color: #9a3412;
}
.task-details__priority[data-priority='urgent'] {
  background-color: #fee2e2;
  color: #991b1b;
}
.task-details__edit-btn {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.375rem;
  transition: 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.task-details__edit-btn:hover {
  background-color: #f3f4f6;
  color: #3b82f6;
}
.task-details__section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.task-details__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
.task-details__section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}
.task-details__description,
.task-details__due-date {
  color: #4b5563;
  margin: 0;
}
.task-details__empty {
  color: #9ca3af;
  font-style: italic;
  margin: 0;
}
.task-details__assignees {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.assignee-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background-color: #f9fafb;
  border-radius: 0.375rem;
}
.assignee-card__avatar {
  width: 40px;
  height: 40px;
  border-radius: 9999px;
  object-fit: cover;
}
.assignee-card__name {
  font-weight: 500;
  color: #111827;
}
.assignee-card__email {
  font-size: 0.875rem;
  color: #6b7280;
}
.task-details__comments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.task-details__comment-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.75rem;
  background-color: #f9fafb;
  border-radius: 0.375rem;
}
.task-details__comment-form textarea {
  resize: vertical;
  padding: 0.5rem;
  border-radius: 0.375rem;
  border: 1px solid #d1d5db;
}
.task-details__comment-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}
.task-details__comments-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.comment-item {
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem;
  background-color: #f9fafb;
  border-radius: 0.375rem;
}
.comment-item__avatar {
  width: 32px;
  height: 32px;
  border-radius: 9999px;
  object-fit: cover;
}
.comment-item__content {
  flex: 1;
  min-width: 0;
}
.comment-item__header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}
.comment-item__author {
  font-weight: 600;
  color: #111827;
}
.comment-item__date {
  font-size: 0.75rem;
  color: #6b7280;
}
.comment-item__text {
  margin: 0;
  color: #4b5563;
  line-height: 1.5;
}
.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}
.flex-1 {
  flex: 1;
}
@media (max-width: 768px) {
  .task-details__row {
    grid-template-columns: 1fr;
  }
  .task-details__meta-info {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
