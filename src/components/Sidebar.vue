<template>
  <div>
    <!-- Sidebar -->
    <aside :class="['sidebar', { 'sidebar--open': uiStore.sidebarOpen }]">
      <div class="sidebar__header">
        <div class="sidebar__logo">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
          <span class="sidebar__title">Boards</span>
        </div>
      </div>

      <div class="sidebar__content">
        <div class="sidebar__section">
          <div class="sidebar__section-header">
            <h3>Add board</h3>
            <button
              @click="uiStore.openModal('createBoard')"
              class="sidebar__add-btn"
              title="Create new board"
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
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>

          <div class="sidebar__boards">
            <button
              v-for="board in boardStore.boards"
              :key="board.id"
              @click="
                () => {
                  selectBoard(board.id)
                  closeSidebarOnMobile()
                }
              "
              :class="[
                'sidebar__board-item',
                { 'sidebar__board-item--active': boardStore.currentBoardId === board.id },
              ]"
            >
              <div class="sidebar__board-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
              </div>
              <span class="sidebar__board-name">{{ board.title }}</span>
            </button>

            <div v-if="boardStore.boards.length === 0" class="sidebar__empty">
              <p>No boards yet</p>
              <button @click="uiStore.openModal('createBoard')" class="sidebar__create-first">
                Create one
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <!-- Overlay for mobile -->
    <div
      class="sidebar-overlay"
      :class="{ hidden: !uiStore.sidebarOpen }"
      @click="uiStore.sidebarOpen = false"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useBoardStore } from '../stores/board'
import { useUiStore } from '../stores/ui'

const boardStore = useBoardStore()
const uiStore = useUiStore()

const selectBoard = (boardId: number) => {
  boardStore.setCurrentBoard(boardId)
}

/**
 * Close sidebar automatically on mobile after selecting a board
 */
const closeSidebarOnMobile = () => {
  if (window.innerWidth <= 1024) {
    uiStore.sidebarOpen = false
  }
}

// Debugging watch
watch(
  () => boardStore.boards,
  (newBoards) => {
    console.log('Sidebar: boardStore.boards updated:', newBoards)
  },
  { deep: true },
)
</script>

<style scoped>
/* Sidebar desktop */
.sidebar {
  width: 260px;
  background-color: var(--color-white);
  border-right: 1px solid var(--color-gray-200);
  display: flex;
  flex-direction: column;
  height: 100vh;
  transition: all 0.3s ease;
  overflow-y: auto;
  position: relative;
  z-index: 30;
}

.sidebar__header {
  padding: var(--spacing-lg) var(--spacing-md);
  border-bottom: 1px solid var(--color-gray-200);
}

.sidebar__logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  color: var(--color-primary);
  font-weight: 700;
  font-size: var(--font-size-lg);
}

.sidebar__title {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 1.6rem;
}

.sidebar__content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-md) 0;
}

.sidebar__section {
  margin-bottom: var(--spacing-lg);
}

.sidebar__section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.sidebar__add-btn {
  background: none;
  border: 1px solid var(--color-gray-300);
  color: var(--color-gray-400);
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.sidebar__add-btn:hover {
  background-color: var(--color-gray-100);
  color: var(--color-primary);
}

.sidebar__boards {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  padding: 0 var(--spacing-sm);
}

.sidebar__board-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  background: none;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  color: var(--color-gray-700);
  font-size: var(--font-size-sm);
  transition: all 0.2s ease;
  text-align: left;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar__board-item:hover {
  background-color: var(--color-gray-100);
  color: var(--color-primary);
}

.sidebar__board-item--active {
  background-color: var(--color-primary);
  color: var(--color-white);
}

.sidebar__board-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.sidebar__board-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sidebar__empty {
  padding: var(--spacing-md) var(--spacing-md);
  text-align: center;
}

.sidebar__create-first {
  background: none;
  border: none;
  color: var(--color-primary);
  cursor: pointer;
  font-size: var(--font-size-sm);
  font-weight: 500;
  transition: color 0.2s ease;
}

.sidebar__create-first:hover {
  color: var(--color-primary-dark);
}

/* Mobile & tablet */
@media (max-width: 1024px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    transform: translateX(-100%);
    z-index: 50;
    box-shadow: var(--shadow-lg);
  }

  .sidebar.sidebar--open {
    transform: translateX(0);
  }

  .sidebar-overlay {
    display: block;
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.3);
    z-index: 40;
  }

  .sidebar-overlay.hidden {
    display: none;
  }
}
</style>
