<template>
  <header class="top-nav">
    <div class="top-nav__container">
      <button class="top-nav__menu-btn" @click="uiStore.toggleSidebar">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      <div class="top-nav__title">
        <h1 class="app-title">TaskFlow</h1>
      </div>

      <div class="top-nav__actions">
        <button
          v-if="isOwner"
          class="top-nav__invite-btn"
          title="Invite Member"
          @click="uiStore.openModal('addMembers')"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="8.5" cy="7" r="4" />
            <line x1="20" y1="8" x2="20" y2="14" />
            <line x1="17" y1="11" x2="23" y2="11" />
          </svg>
          <span class="top-nav__invite-text">Invite Member</span>
        </button>

        <button class="top-nav__icon-btn" title="Notifications">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </button>

        <div class="top-nav__profile">
          <img
            v-if="authStore.user?.username"
            :src="`https://ui-avatars.com/api/?name=${authStore.user.username}&background=random`"
            :alt="authStore.user.username"
            class="top-nav__profile-avatar"
          />
          <button @click="showProfileMenu = !showProfileMenu" class="top-nav__profile-btn">
            <span class="top-nav__username">{{ authStore.user?.username || 'User' }}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          <div v-if="showProfileMenu" class="top-nav__profile-menu animate-slideIn">
            <a href="#" class="top-nav__profile-item">Profile Settings</a>
            <a href="#" class="top-nav__profile-item">Preferences</a>
            <div class="top-nav__profile-divider" />
            <button @click="logout" class="top-nav__profile-item top-nav__profile-item--logout">
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useUiStore } from '../stores/ui'
import { useRouter } from 'vue-router'

defineProps<{
  isOwner: boolean
}>()

const authStore = useAuthStore()
const uiStore = useUiStore()
const router = useRouter()
const showProfileMenu = ref(false)

const logout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.top-nav {
  background-color: var(--color-white);
  border-bottom: 1px solid var(--color-gray-200);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 40;
}

.top-nav__container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-lg);
  gap: var(--spacing-lg);
  max-width: 100%;
}

.top-nav__menu-btn {
  display: none;
  background: none;
  border: none;
  color: var(--color-gray-700);
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.top-nav__menu-btn:hover {
  background-color: var(--color-gray-100);
  color: var(--color-gray-900);
}

.top-nav__title {
  display: flex;
  align-items: center;
}

.app-title {
  font-size: 1.4rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: #1e293b; /* slate-800 vibe */
}

.top-nav__actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.top-nav__invite-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  background-color: var(--color-primary);
  color: var(--color-white);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
  transition: background-color var(--transition-fast);
  border: none;
}

.top-nav__invite-btn:hover {
  background-color: #4f46e5; /* Darker primary */
}

.top-nav__invite-text {
  display: none;
}

@media (min-width: 768px) {
  .top-nav__invite-text {
    display: inline;
  }
}

.top-nav__icon-btn {
  background: none;
  border: none;
  color: var(--color-gray-600);
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.top-nav__icon-btn:hover {
  background-color: var(--color-gray-100);
  color: var(--color-gray-900);
}

.top-nav__profile {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  position: relative;
}

.top-nav__profile-avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  object-fit: cover;
}

.top-nav__profile-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  background: none;
  border: none;
  color: var(--color-gray-700);
  cursor: pointer;
  font-size: var(--font-size-sm);
  font-weight: 500;
  padding: 0;
  transition: color var(--transition-fast);
}

.top-nav__profile-btn:hover {
  color: var(--color-primary);
}

.top-nav__profile-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: var(--color-white);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  min-width: 200px;
  margin-top: var(--spacing-sm);
  overflow: hidden;
}

.top-nav__profile-item {
  display: block;
  width: 100%;
  padding: var(--spacing-md) var(--spacing-lg);
  background: none;
  border: none;
  text-align: left;
  color: var(--color-gray-700);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.top-nav__profile-item:hover {
  background-color: var(--color-gray-50);
  color: var(--color-primary);
}

.top-nav__profile-item--logout:hover {
  background-color: #fee2e2;
  color: var(--color-error);
}

.top-nav__profile-divider {
  height: 1px;
  background-color: var(--color-gray-200);
  margin: var(--spacing-sm) 0;
}

.top-nav__username {
  font-weight: 500;
  color: var(--color-gray-900);
}

@media (max-width: 768px) {
  .top-nav__menu-btn {
    display: flex;
  }

  .top-nav__search {
    max-width: none;
    flex: 1;
  }

  .top-nav__username {
    display: none;
  }
}
</style>
