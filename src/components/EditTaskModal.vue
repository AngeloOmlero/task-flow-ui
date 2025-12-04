<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import BaseModal from './BaseModal.vue'
import MultiSelect from './common/MultiSelect.vue'
import { useUiStore } from '../stores/ui'
import { useBoardStore } from '../stores/board'
import { taskService } from '../services'
import type { UpdateTaskDto } from '../types'

const uiStore = useUiStore()
const boardStore = useBoardStore()

const isLoading = ref(false)

const form = ref<UpdateTaskDto>({
  title: '',
  description: '',
  priority: '',
  dueDate: '',
  status: 'TODO',
  assigneeIds: [], // Ensure it's always an array
})

const isOpen = computed(() => uiStore.activeModal === 'editTask')

const task = computed(() => {
  if (!uiStore.selectedTaskId) return null
  return boardStore.tasks.find((t) => t.id === uiStore.selectedTaskId)
})

const boardMembers = computed(() => {
  if (!boardStore.currentBoard) return []
  const members = boardStore.currentBoard.members || []
  const owner = boardStore.currentBoard.owner
  if (owner && !members.some((m) => m.id === owner.id)) {
    return [owner, ...members]
  }
  return members
})

const memberOptions = computed(() =>
  boardMembers.value.map((member) => ({
    value: member.id,
    label: member.username,
  })),
)

// Watch task changes and populate form
watch(
  task,
  (newTask) => {
    if (newTask) {
      form.value = {
        title: newTask.title,
        description: newTask.description || '',
        priority: newTask.priority || '',
        dueDate: newTask.dueDate || '',
        status: newTask.status,
        assigneeIds: newTask.assignees?.map((a) => a.id) || [],
      }
    }
  },
  { immediate: true },
)

const close = () => {
  uiStore.closeModal()
}

const submit = async () => {
  if (!form.value.title?.trim()) {
    uiStore.showNotification('Title is required', 'error')
    return
  }

  if (!boardStore.currentBoardId || !task.value) {
    uiStore.showNotification('Unable to save task', 'error')
    return
  }

  try {
    isLoading.value = true
    const updatedTask = await taskService.updateTask(
      boardStore.currentBoardId,
      task.value.id,
      form.value,
    )
    boardStore.updateTask(updatedTask)
    uiStore.showNotification('Task updated successfully', 'success')
    close()
  } catch (error) {
    uiStore.showNotification('Failed to update task', 'error')
    console.error(error)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <BaseModal :isOpen="isOpen" title="Edit Task" size="lg" @close="close" show-footer>
    <form @submit.prevent="submit" class="form" v-if="task">
      <div class="form-group">
        <label for="task-title" class="form-label">Task Title</label>
        <input
          id="task-title"
          v-model="form.title"
          type="text"
          placeholder="e.g., Design login page"
          required
          maxlength="100"
        />
      </div>

      <div class="form-row">
        <div class="form-group flex-1">
          <label for="status" class="form-label">Status</label>
          <select id="status" v-model="form.status">
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="DONE">Done</option>
          </select>
        </div>

        <div class="form-group flex-1">
          <label for="priority" class="form-label">Priority</label>
          <select id="priority" v-model="form.priority">
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>

        <div class="form-group flex-1">
          <label for="dueDate" class="form-label">Due Date</label>
          <input id="dueDate" v-model="form.dueDate" type="date" />
        </div>
      </div>

      <div class="form-group">
        <label for="description" class="form-label">Description (Optional)</label>
        <textarea
          id="description"
          v-model="form.description"
          placeholder="Enter task description"
          rows="4"
          maxlength="1000"
        />
      </div>

      <div class="form-group">
        <label for="assignees" class="form-label">Assignees</label>
        <MultiSelect
          id="assignees"
          v-model="form.assigneeIds as (number | string)[]"
          :options="memberOptions"
          placeholder="Select assignees..."
        />
      </div>
    </form>

    <template #footer>
      <button @click="close" class="btn btn-secondary">Cancel</button>
      <button @click="submit" class="btn btn-primary" :disabled="!form.title?.trim() || isLoading">
        {{ isLoading ? 'Saving...' : 'Save Changes' }}
      </button>
    </template>
  </BaseModal>
</template>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: var(--spacing-lg);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.form-group.flex-1 {
  flex: 1;
}

.form-label {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-gray-700);
}

input,
select,
textarea {
  padding: var(--spacing-sm);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-family: inherit;
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
</style>
