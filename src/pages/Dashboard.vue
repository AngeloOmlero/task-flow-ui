<template>
  <div class="dashboard">
    <TopNavBar :is-owner="isOwner" />
    <div class="dashboard__container">
      <Sidebar />
      <KanbanBoard :is-owner="isOwner" />
    </div>

    <!-- Modals -->
    <CreateBoardModal />
    <EditBoardModal v-if="isOwner" />
    <CreateTaskModal />
    <EditTaskModal />
    <TaskDetailsModal />
    <AddMembersModal v-if="isOwner" />

    <!-- Overlay for loading -->
    <div v-if="uiStore.isLoading" class="loading-overlay">
      <div class="loading-spinner" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watch, computed } from 'vue'
import TopNavBar from '../components/TopNavBar.vue'
import Sidebar from '../components/Sidebar.vue'
import KanbanBoard from '../components/KanbanBoard.vue'
import CreateBoardModal from '../components/CreateBoardModal.vue'
import EditBoardModal from '../components/EditBoardModal.vue'
import EditTaskModal from '../components/EditTaskModal.vue'
import CreateTaskModal from '../components/CreateTaskModal.vue'
import TaskDetailsModal from '../components/TaskDetailsModal.vue'
import AddMembersModal from '../components/AddMembersModal.vue'
import { useUiStore } from '../stores/ui'
import { useBoardStore } from '../stores/board'
import { useAuthStore } from '../stores/auth'
import { taskService, boardService } from '../services'

import { webSocketService } from '../services/websocket'
import type { BoardWebSocketMessage, TaskWebSocketMessage, BoardUpdateMessage, TaskUpdateMessage } from '@/types' // Import union types

const uiStore = useUiStore()
const boardStore = useBoardStore()
const authStore = useAuthStore()

// Computed property to check if the current user is the owner of the board
const isOwner = computed(() => {
  if (!authStore.user || !boardStore.currentBoard) {
    return false;
  }
  return authStore.user.id === boardStore.currentBoard.owner?.id;
});

let boardSubscriptionKey: string | null = null
let boardTasksSubscriptionKey: string | null = null
let taskSubscriptionKeys: Map<number, string> = new Map()

/**
 * Subscribe to a single task's updates
 */
const subscribeToTask = (taskId: number) => {
  if (taskSubscriptionKeys.has(taskId)) {
    return // Already subscribed
  }

  const taskKey = webSocketService.subscribeToTaskUpdates(taskId, (message: TaskWebSocketMessage) => { // Use TaskWebSocketMessage
    console.log('Task update received:', message)

    if (message.type === 'TASK_DELETED') {
      boardStore.deleteTask(message.deletedTaskId, message.boardId!) // Pass boardId
    } else {
      // For TASK_UPDATED, TASK_MOVED, TASK_ASSIGNED
      boardStore.updateTask(message.task)
      if (message.type === 'TASK_UPDATED') {
        uiStore.showNotification(`Task updated: ${message.task.title}`, 'info')
      } else if (message.type === 'TASK_MOVED') {
        uiStore.showNotification(`Task moved: ${message.task.title}`, 'info')
      } else if (message.type === 'TASK_ASSIGNED') {
        uiStore.showNotification(`Task assigned: ${message.task.title}`, 'info')
      }
    }
  })
  taskSubscriptionKeys.set(taskId, taskKey)
}

/**
 * Setup WebSocket subscriptions for the current board
 */
const setupBoardSubscriptions = () => {
  const currentBoardId = boardStore.currentBoardId
  if (!currentBoardId || !authStore.wsConnected) return

  // Subscribe to board updates (BOARD_UPDATED, MEMBER_ADDED, MEMBER_REMOVED, BOARD_DELETED)
  boardSubscriptionKey = webSocketService.subscribeToBoardUpdates(
    currentBoardId,
    (message: BoardWebSocketMessage) => { // Use BoardWebSocketMessage
      console.log('Board update received:', message)

      if (message.type === 'BOARD_DELETED') {
        boardStore.deleteBoard(message.deletedBoardId)
        uiStore.showNotification('Board deleted', 'info')
      } else if (message.type === 'BOARD_CREATED') {
        // This is handled by the user-specific topic, so we can ignore it here
      }
      else {
        // For BOARD_UPDATED, MEMBER_ADDED, MEMBER_REMOVED
        boardStore.updateBoard(message.board)
        if (message.type === 'MEMBER_ADDED') {
          // This notification is now handled by the user-specific topic
        } else if (message.type === 'BOARD_UPDATED') {
          uiStore.showNotification('Board updated', 'info')
        } else if (message.type === 'MEMBER_REMOVED') {
          uiStore.showNotification('Member removed', 'info')
        }
      }
    },
  )

  // Subscribe to task updates for all tasks in current board
  // This part needs to be dynamic based on tasks loaded
  // The watch on boardStore.allTasks below will handle subscribing to individual tasks
  if (boardStore.allTasks.get(currentBoardId)) { // Check allTasks map
    boardStore.allTasks.get(currentBoardId)?.forEach((task) => {
      subscribeToTask(task.id)
    })
  }

  // Subscribe to board-level task creation/deletion/update events
  boardTasksSubscriptionKey = webSocketService.subscribeToBoardTaskCreation(
    currentBoardId,
    (message: TaskWebSocketMessage) => { // Use TaskWebSocketMessage
      console.log('Board task creation/update received:', message)

      if (message.type === 'TASK_DELETED') {
        boardStore.deleteTask(message.deletedTaskId, message.boardId!) // Pass boardId
      } else if (message.type === 'TASK_CREATED') { // Correctly handle TASK_CREATED
        boardStore.addTask(message.task)
        subscribeToTask(message.task.id) // Subscribe to the new task's updates
        uiStore.showNotification(`New task created: ${message.task.title}`, 'success')
      } else {
        // For TASK_UPDATED, TASK_MOVED, TASK_ASSIGNED
        boardStore.updateTask(message.task)
        if (message.type === 'TASK_UPDATED') {
          uiStore.showNotification(`Task updated: ${message.task.title}`, 'info')
        } else if (message.type === 'TASK_MOVED') {
          uiStore.showNotification(`Task moved: ${message.task.title}`, 'info')
        } else if (message.type === 'TASK_ASSIGNED') {
          uiStore.showNotification(`Task assigned: ${message.task.title}`, 'info')
        }
      }
    },
  )
}

/**
 * Watch for new tasks being added to the board (globally)
 * This ensures new tasks get their individual subscriptions
 */
watch(
  () => boardStore.allTasks, // Watch the global allTasks map
  (newAllTasks) => {
    // Iterate over all tasks in all boards
    newAllTasks.forEach(tasksInBoard => {
      tasksInBoard.forEach((task) => {
        if (!taskSubscriptionKeys.has(task.id)) {
          subscribeToTask(task.id)
        }
      })
    })
  },
  { deep: true }, // Deep watch the map
)

/**
 * Clean up WebSocket subscriptions
 */
const cleanupSubscriptions = () => {
  if (boardSubscriptionKey) {
    webSocketService.unsubscribe(boardSubscriptionKey)
    boardSubscriptionKey = null
  }
  if (boardTasksSubscriptionKey) {
    webSocketService.unsubscribe(boardTasksSubscriptionKey)
    boardTasksSubscriptionKey = null
  }
  taskSubscriptionKeys.forEach((key) => {
    webSocketService.unsubscribe(key)
  })
  taskSubscriptionKeys.clear()
}

onMounted(async () => {
  try {
    uiStore.setLoading(true)
    const boards = await boardService.getAllBoards()
    boardStore.setBoards(boards)

    const storedBoardId = boardStore.currentBoardId
    if (storedBoardId && boards.some((b) => b.id === storedBoardId)) {
      boardStore.setCurrentBoard(storedBoardId)
    } else if (boards.length > 0 && boards[0]) {
      boardStore.setCurrentBoard(boards[0].id)
    }
  } catch (error) {
    uiStore.showNotification('Failed to load boards', 'error')
    console.error(error)
  } finally {
    uiStore.setLoading(false)
  }
})

/**
 * Watch for WebSocket connection and current board changes
 */
watch(
  () => authStore.wsConnected,
  (connected) => {
    if (connected) {
      // Re-setup subscriptions when connection is established/re-established
      cleanupSubscriptions(); // Clean up any old ones first
      setupBoardSubscriptions();
    } else {
      cleanupSubscriptions(); // Clean up on disconnect
    }
  },
)

watch(
  () => boardStore.currentBoardId,
  async (newBoardId) => {
    if (newBoardId) {
      try {
        uiStore.setLoading(true)
        const tasks = await taskService.getTasksByBoardId(newBoardId)
        boardStore.setTasksForBoard(newBoardId, tasks)
      } catch (error) {
        uiStore.showNotification('Failed to load tasks', 'error')
        console.error(error)
      } finally {
        uiStore.setLoading(false)
      }
    }
    // Re-setup subscriptions whenever currentBoardId changes
    // This ensures we subscribe to the newly selected board's topics
    if (authStore.wsConnected) {
      cleanupSubscriptions(); // Clean up old subscriptions
      setupBoardSubscriptions(); // Setup new ones for the current board
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  cleanupSubscriptions()
})
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  background-color: var(--color-gray-50);
}

.dashboard__container {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid var(--color-white);
  border-radius: var(--radius-full);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
