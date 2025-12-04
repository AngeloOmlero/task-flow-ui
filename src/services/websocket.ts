import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import type { BoardWebSocketMessage, TaskWebSocketMessage, CommentUpdateMessage } from '@/types'

export class WebSocketService {
  private client: Client | null = null
  private subscriptions = new Map<string, StompSubscription>()
  private messageHandlers = new Map<string, (message: any) => void>()
  private isManuallyDisconnected = false

  connect(token: string, onConnect?: () => void, onError?: (error: string) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.client?.connected) return resolve()

      this.isManuallyDisconnected = false

      this.client = new Client({
        brokerURL: undefined,
        webSocketFactory: () => new SockJS(this.getWebSocketUrl()),
        connectHeaders: { Authorization: `Bearer ${token}`, 'X-Client-Version': '1.0' },
        debug: (msg) => console.log('[WebSocket]', msg),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: (frame) => {
          onConnect?.()
          resolve()
        },
        onStompError: (frame) => {
          const errorMessage = `WebSocket error: ${frame.headers['message']}`
          console.error(errorMessage)
          onError?.(errorMessage)
          reject(new Error(errorMessage))
        },
        onWebSocketClose: () => {
          console.log('WebSocket connection closed')
        },
      })

      this.client.activate()
    })
  }

  disconnect(): void {
    this.isManuallyDisconnected = true
    if (this.client?.connected) {
      this.unsubscribeAll()
      this.client.deactivate()
      this.client = null
    }
  }

  isConnected(): boolean {
    return this.client?.connected ?? false
  }

  subscribeToBoardUpdates(
    boardId: number | null,
    onMessage: (message: BoardWebSocketMessage) => void,
    isUserSpecific = false,
  ): string {
    const key = isUserSpecific ? 'user-boards' : `board-${boardId}`
    if (!this.client?.connected) return key

    const topic = isUserSpecific ? '/user/topic/boards' : `/topic/boards/${boardId}`
    const subscription = this.client.subscribe(topic, (frame: IMessage) => {
      try {
        const message = JSON.parse(frame.body) as BoardWebSocketMessage
        onMessage(message)
        this.messageHandlers.get(key)?.(message)
      } catch (e) {
        console.error('Error parsing board message:', e)
      }
    })

    this.subscriptions.set(key, subscription)
    return key
  }

  subscribeToTaskUpdates(
    taskId: number,
    onMessage: (message: TaskWebSocketMessage) => void,
  ): string {
    const key = `task-${taskId}`
    if (!this.client?.connected) return key

    const subscription = this.client.subscribe(`/topic/tasks/${taskId}`, (frame: IMessage) => {
      try {
        const message = JSON.parse(frame.body) as TaskWebSocketMessage
        onMessage(message)
        this.messageHandlers.get(key)?.(message)
      } catch (e) {
        console.error('Error parsing task message:', e)
      }
    })

    this.subscriptions.set(key, subscription)
    return key
  }

  subscribeToBoardTaskCreation(
    boardId: number,
    onMessage: (message: TaskWebSocketMessage) => void,
  ): string {
    const key = `board-tasks-${boardId}`
    if (!this.client?.connected) return key

    const subscription = this.client.subscribe(
      `/topic/boards/${boardId}/tasks`,
      (frame: IMessage) => {
        try {
          const message = JSON.parse(frame.body) as TaskWebSocketMessage
          onMessage(message)
          this.messageHandlers.get(key)?.(message)
        } catch (e) {
          console.error('Error parsing board task creation message:', e)
        }
      },
    )

    this.subscriptions.set(key, subscription)
    return key
  }

  subscribeToCommentUpdates(
    taskId: number,
    onMessage: (message: CommentUpdateMessage) => void,
  ): string {
    const key = `comment-${taskId}`
    if (!this.client?.connected) return key

    const subscription = this.client.subscribe(
      `/topic/tasks/${taskId}/comments`,
      (frame: IMessage) => {
        try {
          const message = JSON.parse(frame.body) as CommentUpdateMessage
          onMessage(message)
          this.messageHandlers.get(key)?.(message)
        } catch (e) {
          console.error('Error parsing comment message:', e)
        }
      },
    )

    this.subscriptions.set(key, subscription)
    return key
  }

  unsubscribe(key: string): void {
    const sub = this.subscriptions.get(key)
    if (!sub) return
    sub.unsubscribe()
    this.subscriptions.delete(key)
    this.messageHandlers.delete(key)
  }

  unsubscribeAll(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe())
    this.subscriptions.clear()
    this.messageHandlers.clear()
  }

  send(destination: string, message: any): void {
    if (!this.client?.connected) return
    this.client.publish({ destination, body: JSON.stringify(message) })
  }

  updateToken(token: string): void {
    if (this.client?.connected) {
      this.disconnect()
      setTimeout(() => this.connect(token), 1000)
    }
  }

  private getWebSocketUrl(): string {
    let url = import.meta.env.VITE_WS_URL ?? ''
    if (!url) {
      const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:'
      url = `${protocol}//${window.location.host}/ws`
    } else {
      url = url.replace(/^wss?:\/\//, protocolFor(url))
    }
    return url
  }

  registerMessageHandler(key: string, handler: (message: any) => void) {
    this.messageHandlers.set(key, handler)
  }

  getActiveSubscriptions(): string[] {
    return Array.from(this.subscriptions.keys())
  }
}

const protocolFor = (url: string) =>
  window.location.protocol === 'https:'
    ? url.replace('wss://', 'https://')
    : url.replace('ws://', 'http://')

export const webSocketService = new WebSocketService()
