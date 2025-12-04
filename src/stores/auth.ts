import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User, AuthResponseDto, AuthRequestDto, CreateUserDto, BoardWebSocketMessage } from '../types' // Import BoardWebSocketMessage
import * as authService from '../services/auth'
import { webSocketService } from '../services/websocket' // Direct import of service
import { useBoardStore } from './board' // Import useBoardStore
import { useUiStore } from './ui' // Import useUiStore

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<User | null>(null)

  // WebSocket connection state managed directly here
  const wsConnecting = ref(false)
  const wsConnected = ref(false)
  const wsError = ref<string | null>(null)

  let userBoardSubscriptionKey: string | null = null // To store the subscription key

  const boardStore = useBoardStore() // Initialize board store
  const uiStore = useUiStore() // Initialize ui store

  const isAuthenticated = () => !!token.value

  const login = async (payload: AuthRequestDto): Promise<AuthResponseDto> => {
    const response = await authService.login(payload)
    token.value = response.token
    localStorage.setItem('token', response.token)
    await fetchCurrentUser()
    // Connect websocket if available
    try {
      await connectWebSocket(response.token)
    } catch (e) {
      // ignore - ws errors will be exposed via wsError
    }
    return response
  }

  const register = async (payload: CreateUserDto) => {
    const response = await authService.register(payload)
    // if backend returns token on register, persist and fetch user
    if (response?.token) {
      token.value = response.token
      localStorage.setItem('token', response.token)
      await fetchCurrentUser()
      try {
        await connectWebSocket(response.token)
      } catch (e) {
        // ignore
      }
    }
    return response
  }

  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    // Disconnect websocket if connected
    disconnectWebSocket()
    // Unsubscribe from user-specific board updates
    if (userBoardSubscriptionKey) {
      webSocketService.unsubscribe(userBoardSubscriptionKey);
      userBoardSubscriptionKey = null;
    }
    // Redirect to login page
    window.location.href = '/login'
  }

  const fetchCurrentUser = async () => {
    if (!token.value) {
      console.warn('No token found, cannot fetch user')
      return null
    }
    const currentUser = await authService.getCurrentUser(token.value)
    user.value = currentUser
    // After fetching user, subscribe to user-specific board updates
    if (currentUser) {
      subscribeToUserBoardUpdates(currentUser.username);
    }
    return currentUser
  }

  // WebSocket lifecycle helpers
  const connectWebSocket = async (authToken: string) => {
    if (!authToken) return
    wsConnecting.value = true
    wsError.value = null
    try {
      await webSocketService.connect(
        authToken,
        () => {
          wsConnected.value = true
          wsConnecting.value = false
          // Re-subscribe to user-specific board updates on successful reconnect
          if (user.value) {
            subscribeToUserBoardUpdates(user.value.username);
          }
        },
        (err: string) => {
          wsError.value = err
          wsConnecting.value = false
        },
      )
    } catch (e: any) {
      wsError.value = e?.message || 'WebSocket connection failed'
      wsConnecting.value = false
      throw e
    }
  }

  const disconnectWebSocket = () => {
    webSocketService.disconnect()
    wsConnected.value = false
    wsConnecting.value = false
    // Unsubscribe from user-specific board updates
    if (userBoardSubscriptionKey) {
      webSocketService.unsubscribe(userBoardSubscriptionKey);
      userBoardSubscriptionKey = null;
    }
  }

  // Subscribe to user-specific board updates
  const subscribeToUserBoardUpdates = (username: string) => {
    if (userBoardSubscriptionKey) {
      webSocketService.unsubscribe(userBoardSubscriptionKey);
    }
    userBoardSubscriptionKey = webSocketService.subscribeToBoardUpdates(
      null, // Use null as a dummy boardId for the user-specific topic
      (message: BoardWebSocketMessage) => {
        console.log('Received user-specific board update:', message);
        if (message.type === 'BOARD_CREATED') {
          console.log('User added to board:', message.board.title);
          boardStore.addBoard(message.board);
          uiStore.showNotification(`You have been added to a new board: ${message.board.title}`, 'success');
        } else if (message.type === 'BOARD_DELETED') {
          console.log('User removed from board:', message.deletedBoardId);
          boardStore.deleteBoard(message.deletedBoardId);
          uiStore.showNotification(`You have been removed from a board`, 'info');
        }
      },
      true // Explicitly set isUserSpecific to true
    );
  };

  return {
    token,
    user,
    isAuthenticated,
    wsConnecting,
    wsConnected,
    wsError,
    login,
    register,
    logout,
    fetchCurrentUser,
    connectWebSocket,
    disconnectWebSocket,
  }
})
