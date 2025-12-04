export interface User {
  id: number
  username: string
  email: string
}

export interface Board {
  id: number
  title: string
  description?: string
  owner?: User
  members?: User[]
  tasks?: Task[]
  createdAt?: string
  updatedAt?: string
}

export interface TaskStatus {
  id: string
  name: string
  color: string
}

export interface Task {
  id: number
  title: string
  description?: string
  status: string
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  assignees?: User[]
  dueDate?: string
  comments?: Comment[]
  boardId: number
  createdAt?: string
  updatedAt?: string
}

export interface Comment {
  id: number
  content: string
  author?: User
  taskId: number
  createdAt?: string
  updatedAt?: string
}

export interface CreateBoardDto {
  title: string
  description?: string
}

export interface UpdateBoardDto {
  title?: string
  description?: string
}

export interface CreateTaskDto {
  title: string
  description?: string
  status?: string
  priority?: string
  dueDate?: string
  assigneeIds?: number[]
}

export interface UpdateTaskDto {
  title?: string
  description?: string
  status?: string
  priority?: string
  dueDate?: string
  assigneeIds?: number[]
}

export interface CreateCommentDto {
  content: string
}

export interface AddMemberDto {
  userId: number
}

export interface AuthRequestDto {
  username: string
  password: string
}

export interface AuthResponseDto {
  token: string
  // Backend returns token only; user is fetched separately via GET /auth/me
}

export interface CreateUserDto {
  username: string
  password: string
  // Backend does not accept email in registration DTO
}

export interface UserDto {
  id: number
  username: string
}

// WebSocket Message Types
export interface BoardUpdateMessage {
  type: 'BOARD_CREATED' | 'BOARD_UPDATED' | 'MEMBER_ADDED' | 'MEMBER_REMOVED'
  board: Board
  timestamp?: string
}

// For board deletion, the backend sends a map with "deletedBoardId"
export interface BoardDeleteMessage {
  type: 'BOARD_DELETED'
  deletedBoardId: number
  timestamp?: string
}

export type BoardWebSocketMessage = BoardUpdateMessage | BoardDeleteMessage;


export interface TaskUpdateMessage {
  type: 'TASK_CREATED' | 'TASK_UPDATED' | 'TASK_MOVED' | 'TASK_ASSIGNED'
  task: Task
  boardId?: number
  timestamp?: string
}

export interface TaskDeleteMessage {
  type: 'TASK_DELETED'
  deletedTaskId: number
  boardId?: number
  timestamp?: string
}

export type TaskWebSocketMessage = TaskUpdateMessage | TaskDeleteMessage;


export interface CommentUpdateMessage {
  type: 'COMMENT_CREATED' | 'COMMENT_UPDATED' | 'COMMENT_DELETED'
  comment: Comment
  taskId?: number
  boardId?: number
  timestamp?: string
}

export interface WebSocketNotification {
  id: string
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR'
  message: string
  timestamp: string
}
