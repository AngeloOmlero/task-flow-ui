<template>
  <div class="not-found">
    <div class="not-found__content">
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you're looking for doesn't exist.</p>
      <router-link to="/dashboard" class="btn btn-primary">Go Home</router-link>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: var(--color-gray-50);
}

.not-found__content {
  text-align: center;
}

.not-found__content h1 {
  font-size: 4rem;
  color: var(--color-primary);
  margin: 0;
}

.not-found__content h2 {
  color: var(--color-gray-900);
  margin: var(--spacing-md) 0;
}

.not-found__content p {
  color: var(--color-gray-600);
  margin: var(--spacing-lg) 0;
}
</style>
