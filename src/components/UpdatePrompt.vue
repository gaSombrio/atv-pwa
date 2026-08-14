<template>
  <div v-if="needRefresh" class="update-prompt">
    <p>Uma nova versão está disponível.</p>
    <div class="update-actions">
      <button class="update-button" @click="updateServiceWorker()">
        Atualizar agora
      </button>
      <button class="dismiss-button" @click="close()">Depois</button>
    </div>
  </div>
</template>

<script setup>
import { useRegisterSW } from 'virtual:pwa-register/vue';

const { needRefresh, updateServiceWorker } = useRegisterSW({
  onRegisteredSW(swUrl, registration) {
    // Verifica novas versões periodicamente (a cada hora)
    if (registration) {
      setInterval(
        () => {
          registration.update();
        },
        60 * 60 * 1000,
      );
    }
  },
  onRegisterError(error) {
    console.error('Erro ao registrar o Service Worker:', error);
  },
});

function close() {
  needRefresh.value = false;
}
</script>

<style scoped>
.update-prompt {
  position: fixed;

  left: 50%;
  bottom: 24px;

  transform: translateX(-50%);

  width: min(400px, calc(100vw - 32px));

  padding: 18px;

  background: #1f2937;
  color: white;

  border-radius: var(--radius-lg);

  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.25);

  z-index: 1500;
}

.update-prompt p {
  margin-bottom: 14px;

  font-size: 0.88rem;
  line-height: 1.4;
}

.update-actions {
  display: flex;
  justify-content: flex-end;

  gap: 8px;
}

.update-button,
.dismiss-button {
  padding: 8px 14px;

  border-radius: var(--radius-sm);

  font-size: 0.82rem;
  font-weight: 600;

  cursor: pointer;
}

.update-button {
  background: var(--primary);
  color: white;

  border: 1px solid var(--primary);
}

.update-button:hover {
  background: var(--primary-dark);
}

.dismiss-button {
  background: transparent;
  color: #d1d5db;

  border: 1px solid #4b5563;
}

.dismiss-button:hover {
  background: rgba(255, 255, 255, 0.08);
}
</style>