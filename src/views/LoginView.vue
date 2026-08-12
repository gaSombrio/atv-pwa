<template>
  <div class="login-container">
    <form class="login-form" @submit.prevent="handleLogin">
      <h1>Entrar</h1>

      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

      <div class="field">
        <label for="email">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          placeholder="seu@email.com"
          required
          autocomplete="email"
        />
      </div>

      <div class="field">
        <label for="password">Senha</label>
        <input
          id="password"
          v-model="password"
          type="password"
          placeholder="••••••••"
          required
          autocomplete="current-password"
        />
      </div>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Entrando...' : 'Entrar' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const loading = ref(false);
const errorMessage = ref('');

async function handleLogin() {
  loading.value = true;
  errorMessage.value = '';
  try {
    await authStore.login(email.value, password.value);
    router.push('/');
  } catch (err) {
    errorMessage.value =
      err.response?.data?.detail ??
      'Erro ao entrar. Verifique suas credenciais.';
  } finally {
    loading.value = false;
  }
}
</script>
<style scoped>
.login-container {
  min-height: calc(100vh - 100px);

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 20px 0;
}

.login-form {
  width: 100%;
  max-width: 420px;

  padding: 30px;

  background: var(--surface);

  border: 1px solid var(--border);
  border-radius: var(--radius-lg);

  box-shadow: var(--shadow-md);
}

.login-form h1 {
  margin-bottom: 24px;

  color: var(--text);

  font-size: 1.5rem;
  font-weight: 700;
  text-align: center;
}

.field {
  display: flex;
  flex-direction: column;

  gap: 6px;

  margin-bottom: 16px;
}

.field label {
  color: var(--text);

  font-size: 0.85rem;
  font-weight: 600;
}

.field input {
  width: 100%;

  padding: 12px 13px;

  background: #fafafa;
  color: var(--text);

  border: 1px solid var(--border);
  border-radius: var(--radius-md);

  font-size: 0.9rem;

  outline: none;

  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
}

.field input:focus {
  background: white;

  border-color: var(--primary);

  box-shadow: 0 0 0 3px rgba(74, 144, 217, 0.12);
}

.login-form > button {
  width: 100%;

  padding: 12px;

  margin-top: 8px;

  background: var(--primary);
  color: white;

  border: none;
  border-radius: var(--radius-md);

  font-size: 0.9rem;
  font-weight: 600;

  cursor: pointer;

  transition:
    background 0.2s ease,
    transform 0.15s ease;
}

.login-form > button:hover:not(:disabled) {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

.login-form > button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  margin-bottom: 16px;
  padding: 10px 12px;

  color: #b42318;

  background: var(--danger-light);

  border: 1px solid #f5c2c0;
  border-radius: var(--radius-md);

  font-size: 0.85rem;
}

@media (max-width: 560px) {
  .login-container {
    align-items: flex-start;
    padding-top: 40px;
  }

  .login-form {
    padding: 24px 20px;
  }
}
</style>