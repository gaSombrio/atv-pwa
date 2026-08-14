<template>
  <button v-if="showInstallButton" class="install-button" @click="installApp">
    Instalar aplicativo
  </button>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const showInstallButton = ref(false);
let deferredPrompt = null;

onMounted(() => {
  window.addEventListener('beforeinstallprompt', (event) => {
    // Impede o banner automático do navegador
    event.preventDefault();
    // Armazena o evento para usar depois
    deferredPrompt = event;
    // Mostra o botão customizado
    showInstallButton.value = true;
  });

  window.addEventListener('appinstalled', () => {
    // Esconde o botão quando o app for instalado
    showInstallButton.value = false;
    deferredPrompt = null;
  });
});

async function installApp() {
  if (!deferredPrompt) return;

  // Mostra o prompt de instalação do navegador
  deferredPrompt.prompt();

  // Aguarda a resposta do usuário
  const { outcome } = await deferredPrompt.userChoice;

  if (outcome === 'accepted') {
    showInstallButton.value = false;
  }

  deferredPrompt = null;
}
</script>

<style scoped>
.install-button {
  display: block;

  width: 100%;

  padding: 12px 16px;

  margin-top: 24px;
  margin-bottom: 30px;

  background: var(--success);
  color: white;

  border: none;
  border-radius: var(--radius-md);

  font-size: 0.9rem;
  font-weight: 600;

  cursor: pointer;

  box-shadow: var(--shadow-sm);

  transition:
    background 0.2s ease,
    transform 0.15s ease,
    box-shadow 0.2s ease;
}

.install-button:hover {
  background: var(--success-dark);

  transform: translateY(-1px);

  box-shadow: var(--shadow-md);
}

.install-button:active {
  transform: translateY(0);
}
</style>