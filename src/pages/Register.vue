<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-header">
        <h1>Join TaskBoard</h1>
        <p>Create your account</p>
      </div>

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <label for="username">Username</label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            placeholder="Choose a username"
            required
            :disabled="isLoading"
          />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            placeholder="Create a password"
            required
            :disabled="isLoading"
          />
        </div>

        <button type="submit" class="btn btn-primary" style="width: 100%" :disabled="isLoading">
          {{ isLoading ? 'Creating Account...' : 'Create Account' }}
        </button>
      </form>

      <p class="auth-footer">
        Already have an account?
        <router-link to="/login">Sign in</router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useUiStore } from '../stores/ui'

const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUiStore()

const form = ref({
  username: '',
  password: '',
})

const isLoading = ref(false)
const errorMessage = ref('')

const handleRegister = async () => {
  // Validate form
  if (!form.value.username.trim() || !form.value.password.trim()) {
    errorMessage.value = 'Please fill in all fields'
    return
  }

  // Password validation
  if (form.value.password.length < 6) {
    errorMessage.value = 'Password must be at least 6 characters'
    return
  }

  try {
    isLoading.value = true
    errorMessage.value = ''

    // Call auth store register (backend returns token; store will fetch user)
    const response = await authStore.register({
      username: form.value.username,
      password: form.value.password,
    })

    // If register returned a token and user was fetched by store, navigate home
    uiStore.showNotification('Account created successfully!', 'success')
    router.push('/login')
  } catch (error: any) {
    console.error('Registration failed:', error)

    // Handle different error types
    if (error.response?.status === 400) {
      errorMessage.value = error.response.data?.message || 'Invalid input'
    } else if (error.response?.status === 409) {
      errorMessage.value = 'Username  already exists'
    } else if (error.message === 'Network Error') {
      errorMessage.value = 'Cannot reach server. Check your connection and API URL.'
    } else {
      errorMessage.value = 'Registration failed. Please try again.'
    }

    uiStore.showNotification(errorMessage.value, 'error')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
  padding: var(--spacing-lg);
}

.auth-card {
  background-color: var(--color-white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  padding: var(--spacing-2xl);
  max-width: 400px;
  width: 100%;
}

.auth-header {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
}

.auth-header h1 {
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--color-gray-900);
}

.auth-header p {
  margin: 0;
  color: var(--color-gray-600);
}

.error-message {
  background-color: var(--color-error-light, #fee2e2);
  border: 1px solid var(--color-error, #dc2626);
  color: var(--color-error-dark, #991b1b);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-lg);
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.form-group label {
  font-weight: 500;
  color: var(--color-gray-700);
  font-size: var(--font-size-sm);
}

.auth-footer {
  text-align: center;
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
  margin: 0;
}

.auth-footer a {
  color: var(--color-primary);
  font-weight: 600;
}
</style>
