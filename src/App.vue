<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { webSocketService } from './services/websocket' // Direct import of service
import ToastContainer from './components/common/ToastContainer.vue'; // Import ToastContainer

const router = useRouter()
const authStore = useAuthStore()

onMounted(async () => {
  // Check if user is already authenticated from localStorage
  if (authStore.token) {
    try {
      if (!authStore.user) {
        await authStore.fetchCurrentUser()
      }
      // Connect WebSocket via the service
      await authStore.connectWebSocket(authStore.token)
    } catch (error) {
      console.error('Failed to restore session:', error)
      authStore.logout()
      return
    }
  }

  // Redirect to login if not authenticated
  if (
    !authStore.isAuthenticated() &&
    router.currentRoute.value.path !== '/login' &&
    router.currentRoute.value.path !== '/register'
  ) {
    router.push('/login')
  }
})

// Watch for changes in authStore.token to manage WebSocket connection
watch(
  () => authStore.token,
  (newToken) => {
    if (newToken) {
      // If token becomes available, connect WebSocket
      authStore.connectWebSocket(newToken)
    } else {
      // If token becomes null, disconnect WebSocket
      authStore.disconnectWebSocket()
    }
  },
)
</script>

<template>
  <router-view />
  <ToastContainer /> <!-- Add ToastContainer here -->
</template>

<style>
@import '@/assets/global.css';
</style>
