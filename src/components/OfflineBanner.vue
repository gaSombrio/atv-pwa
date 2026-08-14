<template>
  <div v-if="!isOnline" class="offline-banner">
    Você está offline. Algumas funcionalidades podem estar indisponíveis.
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const isOnline = ref(navigator.onLine);

function updateOnlineStatus() {
  isOnline.value = navigator.onLine;
}

onMounted(() => {
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
});

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus);
  window.removeEventListener('offline', updateOnlineStatus);
});
</script>

<style scoped>
.offline-banner {
  position: fixed;

  top: 0;
  left: 0;
  right: 0;

  z-index: 2000;

  padding: 8px 16px;

  background: #b42318;
  color: white;

  text-align: center;

  font-size: 0.8rem;
  font-weight: 600;

  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
</style>