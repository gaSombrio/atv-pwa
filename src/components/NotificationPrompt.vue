<template>
  <Transition name="slide-up">
    <div v-if="visible" class="notification-prompt">
      <div class="prompt-content">
        <span class="prompt-icon">!</span>
        <div class="prompt-text">
          <strong>Ativar notificações?</strong>
          <p>Seja avisado quando tarefas forem criadas ou atualizadas em outros dispositivos.</p>
        </div>
      </div>
      <div class="prompt-actions">
        <button class="btn-allow" @click="allow">Ativar</button>
        <button class="btn-dismiss" @click="dismiss">Agora não</button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useAuthStore } from '../stores/auth'

const visible = ref(false)
const authStore = useAuthStore()

onMounted(() => {
  if (
    authStore.isAuthenticated &&
    'Notification' in window &&
    Notification.permission === 'default' && // 
    !localStorage.getItem('push_prompt_dismissed')
  ) {
    setTimeout(() => { visible.value = true }, 2000) // 
  }
})

async function allow() {
  visible.value = false
  const granted = await authStore.requestPermission()
  if (granted) {
    const reg = await navigator.serviceWorker.ready
    await authStore.subscribe(reg) // 
  }
}

function dismiss() {
  visible.value = false
  localStorage.setItem('push_prompt_dismissed', '1') // 
}
</script>

<style scoped>
.notification-prompt {
  position: fixed;

  left: 50%;
  bottom: 24px;

  transform: translateX(-50%);

  width: min(480px, calc(100vw - 32px));

  padding: 18px;

  background: var(--surface);

  border: 1px solid var(--border);
  border-radius: var(--radius-lg);

  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.14);

  z-index: 1000;

  display: flex;
  flex-direction: column;
  gap: 16px;
}

.prompt-content {
  display: flex;
  align-items: flex-start;

  gap: 12px;
}

.prompt-icon {
  width: 34px;
  height: 34px;

  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  background: var(--primary-light);
  color: var(--primary);

  border-radius: 50%;

  font-size: 0.9rem;
  font-weight: 700;
}

.prompt-text strong {
  display: block;

  color: var(--text);

  font-size: 0.95rem;
  font-weight: 700;
}

.prompt-text p {
  margin-top: 4px;

  color: var(--text-secondary);

  font-size: 0.82rem;
  line-height: 1.5;
}

.prompt-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.btn-allow,
.btn-dismiss {
  padding: 8px 14px;

  border-radius: var(--radius-sm);

  font-size: 0.82rem;
  font-weight: 600;

  cursor: pointer;

  transition:
    background 0.2s ease,
    border-color 0.2s ease;
}

.btn-allow {
  background: var(--primary);
  color: white;

  border: 1px solid var(--primary);
}

.btn-allow:hover {
  background: var(--primary-dark);
}

.btn-dismiss {
  background: transparent;
  color: var(--text-secondary);

  border: 1px solid var(--border);
}

.btn-dismiss:hover {
  background: #f8fafc;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;

  transform:
    translateX(-50%)
    translateY(15px);
}
</style>