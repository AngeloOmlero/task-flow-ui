import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Board, Task, Comment } from '@/types'
import { commentService } from '@/services'

export const useBoardStore = defineStore('board', () => {
  const boards = ref<Board[]>([])
  const currentBoardId = ref<number | null>(
    localStorage.getItem('currentBoardId')
      ? parseInt(localStorage.getItem('currentBoardId')!)
      : null,
  )
  // Store all tasks the user has access to, keyed by boardId
  const allTasks = ref<Map<number, Task[]>>(new Map())
  // Store all comments, keyed by taskId
  const allComments = ref<Map<number, Comment[]>>(new Map())

  const currentBoard = computed(() => boards.value.find((b) => b.id === currentBoardId.value))

  // Get tasks for the current board
  const tasks = computed<Task[]>(() => {
    if (!currentBoardId.value) return []
    return allTasks.value.get(currentBoardId.value) || []
  })

  // Group tasks for the current board by status for Kanban view
  const tasksByStatus = computed(() => {
    const grouped = new Map<string, Task[]>()
    const statuses = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']

    statuses.forEach((status) => {
      grouped.set(
        status,
        tasks.value.filter((t) => t.status === status),
      )
    })

    return grouped
  })

  function setBoards(newBoards: Board[]) {
    boards.value = newBoards
  }

  function addBoard(board: Board) {
    boards.value.push(board)
  }

  function updateBoard(updatedBoard: Board) {
    const index = boards.value.findIndex((b) => b.id === updatedBoard.id)
    if (index !== -1) {
      boards.value[index] = updatedBoard
    }
  }

  function deleteBoard(boardId: number) {
    boards.value = boards.value.filter((b) => b.id !== boardId)
    allTasks.value.delete(boardId) // Also remove tasks associated with the deleted board
    if (currentBoardId.value === boardId) {
      currentBoardId.value = boards.value[0]?.id || null
      localStorage.removeItem('currentBoardId')
    }
  }

  function setCurrentBoard(boardId: number) {
    currentBoardId.value = boardId
    localStorage.setItem('currentBoardId', boardId.toString())
  }

  // --- Task Management ---
  function setTasksForBoard(boardId: number, newTasks: Task[]) {
    allTasks.value.set(boardId, newTasks)
  }

  function addTask(task: Task) {
    const boardTasks = allTasks.value.get(task.boardId) || []
    // Ensure reactivity by creating a new array
    allTasks.value.set(task.boardId, [...boardTasks, task])
  }

  function updateTask(updatedTask: Task) {
    const boardTasks = allTasks.value.get(updatedTask.boardId)
    if (boardTasks) {
      const index = boardTasks.findIndex((t) => t.id === updatedTask.id)
      if (index !== -1) {
        // Ensure reactivity by creating a new array
        const newBoardTasks = [...boardTasks]
        newBoardTasks[index] = updatedTask
        allTasks.value.set(updatedTask.boardId, newBoardTasks)
      }
    }
  }

  function deleteTask(taskId: number, boardId: number) {
    const boardTasks = allTasks.value.get(boardId)
    if (boardTasks) {
      allTasks.value.set(
        boardId,
        boardTasks.filter((t) => t.id !== taskId),
      )
    }
    allComments.value.delete(taskId) // Also remove comments associated with the deleted task
  }

  function moveTask(taskId: number, newStatus: string, boardId: number) {
    const boardTasks = allTasks.value.get(boardId)
    if (boardTasks) {
      const task = boardTasks.find((t) => t.id === taskId)
      if (task) {
        task.status = newStatus
      }
      // Ensure reactivity by creating a new array
      allTasks.value.set(boardId, [...boardTasks])
    }
  }

  // --- Comment Management ---
  function setCommentsForTask(taskId: number, newComments: Comment[]) {
    allComments.value.set(taskId, newComments)
  }

  function addComment(taskId: number, comment: Comment) {
    const taskComments = allComments.value.get(taskId) || []
    allComments.value.set(taskId, [...taskComments, comment])
  }

  function getComments(taskId: number): Comment[] {
    return allComments.value.get(taskId) || []
  }

  function fetchCommentsForTask(taskId: number) {
    return commentService.getCommentByTaskId(taskId).then((comments) => {
      setCommentsForTask(taskId, comments) // Update Pinia store
      return comments
    })
  }

  return {
    boards,
    currentBoardId,
    currentBoard,
    tasks, // Tasks for the current board
    tasksByStatus,
    allTasks, // All tasks globally
    allComments, // All comments globally
    setBoards,
    addBoard,
    updateBoard,
    deleteBoard,
    setCurrentBoard,
    setTasksForBoard,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    setCommentsForTask,
    addComment,
    getComments,
    fetchCommentsForTask,
  }
})
