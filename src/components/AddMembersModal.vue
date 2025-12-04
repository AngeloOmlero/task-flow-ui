<template>
  <BaseModal :isOpen="isOpen" title="Manage Board Members" size="md" @close="close">
    <div class="add-members-modal">
      <!-- Current Members -->
      <div class="members-section">
        <h4>Current Members ({{ boardMembers.length }})</h4>
        <div class="members-list">
          <div v-for="member in boardMembers" :key="member.id" class="member-badge">
            <img
              :src="`https://ui-avatars.com/api/?name=${member.username}&background=random`"
              :alt="member.username"
              class="member-avatar"
            />
            <span class="member-name">{{ member.username }}</span>
            <span v-if="member.id === currentBoard?.owner?.id" class="owner-tag">Owner</span>
            <button
              v-if="member.id !== currentBoard?.owner?.id"
              @click="removeMember(member.id)"
              class="remove-member-btn"
              title="Remove member"
            >
              &times;
            </button>
          </div>
        </div>
      </div>

      <!-- Search Input -->
      <div class="search-section">
        <div class="form-group">
          <label for="userSearch" class="form-label">Add New Members</label>
          <input
            id="userSearch"
            v-model="searchQuery"
            type="text"
            placeholder="Search by username..."
            @input="handleSearch"
            class="search-input"
          />
        </div>
      </div>

      <!-- Search Results -->
      <div class="results-section">
        <div v-if="loading" class="loading">
          <p>Searching...</p>
        </div>
        <div v-else-if="filteredSearchResults.length === 0 && searchQuery" class="no-results">
          <p>No users found</p>
        </div>
        <div v-else-if="filteredSearchResults.length > 0" class="user-list">
          <div v-for="user in filteredSearchResults" :key="user.id" class="user-item">
            <div class="user-info">
              <p class="user-name">{{ user.username }}</p>
              <p class="user-email">{{ user.email }}</p>
            </div>
            <button @click="addMember(user.id)" :disabled="isAdding" class="btn btn-sm btn-primary">
              Add
            </button>
          </div>
        </div>
        <div v-else class="hint">
          <p>Start typing to search for users to add</p>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <template #footer>
      <button @click="close" class="btn btn-secondary">Done</button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import BaseModal from './BaseModal.vue'
import { useUiStore } from '../stores/ui'
import { useBoardStore } from '../stores/board'
import { boardService } from '../services'
import { userService } from '../services/user'
import type { User } from '../types'

const uiStore = useUiStore()
const boardStore = useBoardStore()

const searchQuery = ref('')
const searchResults = ref<User[]>([])
const loading = ref(false)
const isAdding = ref(false)
let searchTimeout: ReturnType<typeof setTimeout> | null = null

const isOpen = computed(() => uiStore.activeModal === 'addMembers')
const currentBoard = computed(() => boardStore.currentBoard)

// Create a unique list of all board members, including the owner
const boardMembers = computed(() => {
  if (!currentBoard.value) return []
  const members = currentBoard.value.members || []
  const owner = currentBoard.value.owner
  if (owner && !members.some((m) => m.id === owner.id)) {
    return [owner, ...members]
  }
  return members
})

// Filter search results to exclude users who are already members
const filteredSearchResults = computed(() => {
  const memberIds = new Set(boardMembers.value.map((m) => m.id))
  return searchResults.value.filter((user) => !memberIds.has(user.id))
})

const handleSearch = async () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }
  searchTimeout = setTimeout(async () => {
    try {
      loading.value = true
      searchResults.value = await userService.searchUsers(searchQuery.value)
    } catch (error) {
      uiStore.showNotification('Failed to search users', 'error')
    } finally {
      loading.value = false
    }
  }, 300)
}

const addMember = async (userId: number) => {
  if (!currentBoard.value) return
  try {
    isAdding.value = true
    const updatedBoard = await boardService.addMember(currentBoard.value.id, { userId })
    boardStore.updateBoard(updatedBoard)
    uiStore.showNotification('Member added successfully', 'success')
  } catch (error) {
    uiStore.showNotification('Failed to add member', 'error')
  } finally {
    isAdding.value = false
  }
}

const removeMember = async (userId: number) => {
  if (!currentBoard.value) return
  if (confirm('Are you sure you want to remove this member?')) {
    try {
      const updatedBoard = await boardService.removeMember(currentBoard.value.id, userId)
      boardStore.updateBoard(updatedBoard)
      uiStore.showNotification('Member removed successfully', 'success')
    } catch (error) {
      uiStore.showNotification('Failed to remove member', 'error')
    }
  }
}

const close = () => {
  uiStore.closeModal()
  searchQuery.value = ''
  searchResults.value = []
}
</script>

<style scoped>
/* (Existing styles remain the same) */
.add-members-modal {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}
.search-section,
.members-section {
  padding: var(--spacing-md);
  background-color: var(--color-gray-50);
  border-radius: var(--radius-md);
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
.search-input {
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-sm);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-md);
  transition: border-color var(--transition-fast);
}
.search-input:focus {
  outline: none;
  border-color: var(--color-blue-500);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
.results-section {
  min-height: 150px;
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
}
.loading,
.no-results,
.hint {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--color-gray-500);
  text-align: center;
}
.user-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}
.user-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md);
  background-color: var(--color-gray-50);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-gray-200);
  transition: all var(--transition-fast);
}
.user-item:hover {
  background-color: var(--color-gray-100);
  border-color: var(--color-gray-300);
}
.user-info {
  flex: 1;
}
.user-name {
  margin: 0;
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-gray-900);
}
.user-email {
  margin: var(--spacing-xs) 0 0 0;
  font-size: var(--font-size-xs);
  color: var(--color-gray-600);
}
.btn-sm {
  padding: var(--spacing-xs) var(--spacing-md);
  font-size: var(--font-size-xs);
  white-space: nowrap;
}
.members-section h4 {
  margin: 0 0 var(--spacing-md) 0;
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-gray-700);
}
.members-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
}
.member-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs) var(--spacing-md);
  background-color: var(--color-gray-100);
  border: 1px solid var(--color-gray-200);
  color: var(--color-gray-800);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 500;
}
.member-avatar {
  width: 20px;
  height: 20px;
  border-radius: var(--radius-full);
}
.owner-tag {
  background-color: var(--color-amber-100);
  color: var(--color-amber-800);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  font-weight: 600;
}
.remove-member-btn {
  background: none;
  border: none;
  color: var(--color-gray-400);
  cursor: pointer;
  font-size: 1.2rem;
  line-height: 1;
  padding: 0 0 0 var(--spacing-xs);
  transition: color var(--transition-fast);
}
.remove-member-btn:hover {
  color: var(--color-error);
}
</style>
