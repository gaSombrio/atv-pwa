<template>
  <OfflineBanner />
  <AppHeader />
  <main>
    <router-view />
  </main>
  <NotificationPrompt />
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import AppHeader from './components/AppHeader.vue'
import OfflineBanner from './components/OfflineBanner.vue'
import NotificationPrompt from './components/NotificationPrompt.vue'
import { useTasksStore } from './stores/tasks'
import { useAuthStore } from './stores/auth'

const tasksStore = useTasksStore()
const authStore = useAuthStore()

// Re-fetch automático quando o usuário clica em uma notificação e foca o app
function onSwMessage(event) {
  if (event.data?.type === 'PUSH_NOTIFICATION_CLICKED') {
    tasksStore.fetchTasks() // 
  }
}

onMounted(async () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', onSwMessage)
  }

  // Se autenticado + permissão granted + sem endpoint local → re-subscribe silenciosamente
  if (
    authStore.isAuthenticated &&
    'serviceWorker' in navigator &&
    'Notification' in window &&
    Notification.permission === 'granted' &&
    !localStorage.getItem('push_endpoint') // 
  ) {
    navigator.serviceWorker.ready
      .then((reg) => authStore.subscribe(reg))
      .catch(() => {})
  }
})

onUnmounted(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.removeEventListener('message', onSwMessage)
  }
})
</script>

<style scoped>
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 20px 0;
  margin-bottom: 28px;

  border-bottom: 1px solid var(--border);
}

.app-header h1 {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary);
  letter-spacing: -0.3px;
}

nav {
  display: flex;
  align-items: center;
  gap: 18px;
}

nav a {
  position: relative;

  text-decoration: none;
  color: var(--text-secondary);

  font-size: 0.9rem;
  font-weight: 600;

  transition:
    color 0.2s ease,
    transform 0.2s ease;
}

nav a:hover {
  color: var(--primary);
}

nav a.router-link-active {
  color: var(--primary);
}

nav a.router-link-active::after {
  content: "";

  position: absolute;
  left: 0;
  right: 0;
  bottom: -7px;

  height: 2px;

  background: var(--primary);
  border-radius: 2px;
}

.logout-btn {
  border: none;
  background: transparent;

  color: var(--danger);

  font-size: 0.9rem;
  font-weight: 600;

  cursor: pointer;

  padding: 6px 0;

  transition:
    color 0.2s ease,
    transform 0.2s ease;
}

.logout-btn:hover {
  color: #c0392b;
  transform: translateY(-1px);
}

@media (max-width: 560px) {
  .app-header {
    align-items: flex-start;
    gap: 16px;
  }

  .app-header h1 {
    font-size: 1.05rem;
  }

  nav {
    gap: 12px;
  }

  nav a,
  .logout-btn {
    font-size: 0.82rem;
  }
}
</style>