<template>
  <div class="about">
    <h2>Sobre o aplicativo</h2>
    <p>
      Este é um gerenciador de tarefas desenvolvido como Progressive Web App
      (PWA) utilizando Vue.js 3 e Vite.
    </p>
    <p>
      O aplicativo funciona offline, pode ser instalado no seu dispositivo e
      carrega rapidamente mesmo em conexões lentas.
    </p>

    <h3>Tecnologias utilizadas</h3>
    <ul>
      <li>Vue.js 3 com Composition API</li>
      <li>Vite como ferramenta de build</li>
      <li>Vue Router para navegação</li>
      <li>vite-plugin-pwa para suporte a PWA</li>
      <li>Workbox para gerenciamento de cache</li>
    </ul>
  </div>
</template>

<style scoped>
.about {
  padding: 22px;

  background: var(--surface);

  border: 1px solid var(--border);
  border-radius: var(--radius-lg);

  box-shadow: var(--shadow-sm);

  line-height: 1.6;
}

.about h2 {
  margin-bottom: 16px;

  color: var(--primary);

  font-size: 1.3rem;
  font-weight: 700;
}

.about h3 {
  margin-top: 24px;
  margin-bottom: 10px;

  font-size: 1rem;
  font-weight: 700;
}

.about p {
  margin-bottom: 12px;

  color: var(--text-secondary);

  font-size: 0.9rem;
}

.about ul {
  padding-left: 20px;
}

.about li {
  margin-bottom: 7px;

  color: var(--text-secondary);

  font-size: 0.9rem;
}
</style>