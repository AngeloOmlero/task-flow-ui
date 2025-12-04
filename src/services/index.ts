import apiClient from './api'
import type {
  Board,
  Task,
  Comment,
  User,
  CreateBoardDto,
  UpdateBoardDto,
  CreateTaskDto,
  UpdateTaskDto,
  CreateCommentDto,
  AddMemberDto,
} from '@/types'
export { webSocketService } from './websocket' // Export the WebSocket service

export const boardService = {
  getAllBoards: async (): Promise<Board[]> => {
    const response = await apiClient.get('/boards')
    return response.data
  },

  createBoard: async (createBoardDto: CreateBoardDto): Promise<Board> => {
    const response = await apiClient.post('/boards', createBoardDto)
    return response.data
  },

  updateBoard: async (boardId: number, updateBoardDto: UpdateBoardDto): Promise<Board> => {
    const response = await apiClient.put(`/boards/${boardId}`, updateBoardDto)
    return response.data
  },

  deleteBoard: async (boardId: number): Promise<void> => {
    await apiClient.delete(`/boards/${boardId}`)
  },

  addMember: async (boardId: number, addMemberDto: AddMemberDto): Promise<Board> => {
    const response = await apiClient.post(`/boards/${boardId}/members`, addMemberDto)
    return response.data
  },

  removeMember: async (boardId: number, memberId: number): Promise<Board> => {
    const response = await apiClient.delete(`/boards/${boardId}/members/${memberId}`)
    return response.data
  },
}

export const taskService = {
  getTasksByBoardId: async (boardId: number): Promise<Task[]> => {
    const response = await apiClient.get(`/boards/${boardId}/tasks`)
    return response.data
  },

  createTask: async (boardId: number, createTaskDto: CreateTaskDto): Promise<Task> => {
    const response = await apiClient.post(`/boards/${boardId}/tasks`, createTaskDto)
    return response.data
  },

  updateTask: async (
    boardId: number,
    taskId: number,
    updateTaskDto: UpdateTaskDto,
  ): Promise<Task> => {
    const response = await apiClient.put(`/boards/${boardId}/tasks/${taskId}`, updateTaskDto)
    return response.data
  },

  deleteTask: async (boardId: number, taskId: number): Promise<void> => {
    await apiClient.delete(`/boards/${boardId}/tasks/${taskId}`)
  },
}

export const commentService = {
  createComment: async (taskId: number, createCommentDto: CreateCommentDto): Promise<Comment> => {
    const response = await apiClient.post(`/tasks/${taskId}/comments`, createCommentDto)
    return response.data
  },
  getCommentByTaskId: async (taskId: number): Promise<Comment[]> => {
    const response = await apiClient.get(`/tasks/${taskId}/comments`)
    return response.data
  },
}
