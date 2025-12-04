<template>
  <BaseModal :isOpen="isOpen" :title="task ? 'Task Details' : ''" size="lg" @close="close">
    <div v-if="task" class="task-details">
      <div class="task-details__header">
        <div>
          <h2 class="task-details__title">{{ task.title }}</h2>
          <div class="task-details__meta-info">
            <span class="task-details__id">Task #{{ task.id }}</span>
            <span class="task-details__status" :data-status="task.status">{{
              formatStatus(task.status)
            }}</span>
            <span
              v-if="task.priority"
              class="task-details__priority"
              :data-priority="task.priority.toLowerCase()"
              >{{ task.priority }}</span
            >
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

      <div class="task-details__section">
        <h3 class="task-details__section-title">Description</h3>
        <p v-if="task.description" class="task-details__description">{{ task.description }}</p>
        <p v-else class="task-details__empty">No description</p>
      </div>

      <div class="task-details__row">
        <div class="task-details__section flex-1">
          <h3 class="task-details__section-title">Assignees</h3>
          <div v-if="task.assignees && task.assignees.length > 0" class="task-details__assignees">
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

      <div class="task-details__section">
        <div class="task-details__comments-header">
          <h3 class="task-details__section-title">Comments</h3>
          <button @click="showCommentForm = !showCommentForm" class="btn btn-sm btn-primary">
            {{ showCommentForm ? 'Cancel' : 'Add Comment' }}
          </button>
        </div>

        <div v-if="showCommentForm" class="task-details__comment-form">
          <textarea v-model="newComment" placeholder="Write a comment..." rows="3" />
          <div class="task-details__comment-actions">
            <button @click="showCommentForm = false" class="btn btn-secondary">Cancel</button>
            <button @click="submitComment" class="btn btn-primary" :disabled="!newComment.trim()">
              Post Comment
            </button>
          </div>
        </div>

        <div v-if="comments.length > 0" class="task-details__comments-list">
          <div v-for="comment in comments" :key="comment.id" class="comment-item">
            <img
              v-if="comment.author"
              :src="`https://ui-avatars.com/api/?name=${comment.author.username}`"
              :alt="comment.author.username"
              class="comment-item__avatar"
            />
            <div class="comment-item__content">
              <div class="comment-item__header">
                <span v-if="comment.author" class="comment-item__author">{{
                  comment.author.username
                }}</span>
                <span class="comment-item__date">{{ formatDate(comment.createdAt || '') }}</span>
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
import { commentService, webSocketService } from '../services' // Direct import of service
import type { Comment, CommentUpdateMessage } from '../types' // Import CommentUpdateMessage

const uiStore = useUiStore()
const boardStore = useBoardStore()

const showCommentForm = ref(false)
const newComment = ref('')
let commentSubscriptionKey: string | null = null

const isOpen = computed(() => uiStore.activeModal === 'taskDetails')

const task = computed(() => {
  if (!uiStore.selectedTaskId) return null
  return boardStore.tasks.find((t) => t.id === uiStore.selectedTaskId)
})

const comments = computed<Comment[]>(() => {
  if (!uiStore.selectedTaskId) return []
  return boardStore.getComments(uiStore.selectedTaskId)
})

// Subscribe to comment updates when the modal is opened
watch(isOpen, (newIsOpen) => {
  if (newIsOpen && task.value) {
    commentSubscriptionKey = webSocketService.subscribeToCommentUpdates(
      task.value.id,
      (message: CommentUpdateMessage) => {
        if (message.type === 'COMMENT_CREATED') {
          boardStore.addComment(task.value!.id, message.comment)
        }
      },
    )
  } else if (commentSubscriptionKey) {
    // Unsubscribe when the modal is closed
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

const editTask = () => {
  uiStore.openModal('editTask')
}

const submitComment = async () => {
  if (!uiStore.selectedTaskId || !newComment.value.trim()) return

  try {
    uiStore.setLoading(true)
    // The backend will send a WebSocket message, which will be handled by the global subscription.
    // We don't need to manually add the comment to the store here.
    await commentService.createComment(uiStore.selectedTaskId, {
      content: newComment.value,
    })
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

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const formatStatus = (status: string) => {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}
</script>

<style scoped>
/* (Existing styles remain the same) */
.task-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}
.task-details__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-lg);
}
.task-details__title {
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--color-gray-900);
}
.task-details__meta-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}
.task-details__id {
  font-size: var(--font-size-sm);
  color: var(--color-gray-500);
}
.task-details__status,
.task-details__priority {
  font-size: var(--font-size-xs);
  font-weight: 600;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  text-transform: uppercase;
}
.task-details__status[data-status='TODO'] {
  background-color: var(--color-gray-100);
  color: var(--color-gray-700);
}
.task-details__status[data-status='IN_PROGRESS'] {
  background-color: var(--color-in-progress);
  color: #1e40af;
}
.task-details__status[data-status='IN_REVIEW'] {
  background-color: var(--color-in-review);
  color: #92400e;
}
.task-details__status[data-status='DONE'] {
  background-color: var(--color-done);
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
  color: var(--color-gray-400);
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}
.task-details__edit-btn:hover {
  background-color: var(--color-gray-100);
  color: var(--color-primary);
}
.task-details__section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}
.task-details__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
}
.task-details__section-title {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-gray-900);
  margin: 0;
}
.task-details__description {
  color: var(--color-gray-700);
  line-height: 1.6;
  margin: 0;
}
.task-details__due-date {
  color: var(--color-gray-700);
  margin: 0;
}
.task-details__empty {
  color: var(--color-gray-400);
  margin: 0;
  font-style: italic;
}
.task-details__assignees {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}
.assignee-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background-color: var(--color-gray-50);
  border-radius: var(--radius-md);
}
.assignee-card__avatar {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  object-fit: cover;
}
.assignee-card__name {
  font-weight: 500;
  color: var(--color-gray-900);
}
.assignee-card__email {
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
}
.task-details__comments-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.task-details__comment-form {
  padding: var(--spacing-md);
  background-color: var(--color-gray-50);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}
.task-details__comment-form textarea {
  resize: vertical;
}
.task-details__comment-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
}
.task-details__comments-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}
.comment-item {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background-color: var(--color-gray-50);
  border-radius: var(--radius-md);
}
.comment-item__avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  object-fit: cover;
  flex-shrink: 0;
}
.comment-item__content {
  flex: 1;
  min-width: 0;
}
.comment-item__header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xs);
}
.comment-item__author {
  font-weight: 600;
  color: var(--color-gray-900);
}
.comment-item__date {
  font-size: var(--font-size-xs);
  color: var(--color-gray-500);
}
.comment-item__text {
  margin: 0;
  color: var(--color-gray-700);
  line-height: 1.5;
}
.btn-sm {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-xs);
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
