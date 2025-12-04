<script setup lang="ts">
import { ref, computed } from 'vue'
import BaseModal from './BaseModal.vue'
import MultiSelect from './common/MultiSelect.vue' // Import the new component
import { useUiStore } from '../stores/ui'
import { useBoardStore } from '../stores/board'
import { taskService } from '../services'
import type { CreateTaskDto } from '../types'

const uiStore = useUiStore()
const boardStore = useBoardStore()

const form = ref<CreateTaskDto>({
  title: '',
  description: '',
  priority: 'MEDIUM',
  dueDate: '',
  status: 'TODO',
  assigneeIds: [], // Ensure it's always an array
})

const isOpen = computed(() => uiStore.activeModal === 'createTask')

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

const close = () => {
  uiStore.closeModal()
  form.value = {
    title: '',
    description: '',
    priority: 'MEDIUM',
    dueDate: '',
    status: 'TODO',
    assigneeIds: [],
  }
}

const submit = async () => {
  if (!boardStore.currentBoardId) {
    uiStore.showNotification('Please select a board', 'error')
    return
  }

  try {
    uiStore.setLoading(true)
    // We no longer add the task directly to the store here.
    // It will be added via the WebSocket message received by Dashboard.vue.
    await taskService.createTask(boardStore.currentBoardId, form.value)
    uiStore.showNotification('Task created successfully', 'success')
    close()
  } catch (error) {
    uiStore.showNotification('Failed to create task', 'error')
    console.error(error)
  } finally {
    uiStore.setLoading(false)
  }
}
</script>

<template>
  <BaseModal :isOpen="isOpen" title="Create Task" size="lg" @close="close" show-footer>
    <form @submit.prevent="submit" class="form">
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
      <button @click="submit" class="btn btn-primary" :disabled="!form.title.trim()">
        Create Task
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
  grid-template-columns: 1fr 1fr;
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
</style>
