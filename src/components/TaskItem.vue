<template>
  <div class="task-item" :class="{ done: task.done }">
    <img
      v-if="task.img_url"
      :src="task.img_url"
      class="task-thumbnail"
      alt="Imagem da tarefa"
    />
    <label class="task-label">
      <input type="checkbox" :checked="task.done" @change="$emit('toggle', task.id)" />
      <span class="task-title">{{ task.title }}</span>
    </label>
    <div class="task-actions">
      <button class="task-edit" @click="$emit('edit', task)">Editar</button>
      <button class="task-remove" @click="$emit('remove', task.id)">Remover</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  task: {
    type: Object,
    required: true,
  },
})

defineEmits(['toggle', 'remove', 'edit'])
</script>

<style scoped>
.task-item {
  display: flex;
  align-items: center;
  gap: 12px;

  padding: 14px 16px;
  margin-bottom: 10px;

  background: var(--surface);

  border: 1px solid var(--border);
  border-radius: var(--radius-md);

  box-shadow: var(--shadow-sm);

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease,
    opacity 0.2s ease;
}

.task-item:hover {
  transform: translateY(-1px);

  border-color: #d5dce5;

  box-shadow: var(--shadow-md);
}

.task-thumbnail {
  width: 48px;
  height: 48px;

  object-fit: cover;

  border-radius: var(--radius-sm);
  border: 1px solid var(--border);

  flex-shrink: 0;
}

.task-item.done {
  opacity: 0.62;
  background: #fafafa;
}

.task-label {
  display: flex;
  align-items: center;
  gap: 12px;

  min-width: 0;
  flex: 1;

  cursor: pointer;
}

.task-label input[type="checkbox"] {
  appearance: none;

  width: 20px;
  height: 20px;

  border: 2px solid #cbd5e1;
  border-radius: 50%;

  flex-shrink: 0;

  cursor: pointer;

  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    transform 0.15s ease;
}

.task-label input[type="checkbox"]:hover {
  border-color: var(--primary);
}

.task-label input[type="checkbox"]:checked {
  background: var(--primary);
  border-color: var(--primary);

  position: relative;
}

.task-label input[type="checkbox"]:checked::after {
  content: "";

  position: absolute;

  width: 5px;
  height: 9px;

  left: 6px;
  top: 3px;

  border: solid white;
  border-width: 0 2px 2px 0;

  transform: rotate(45deg);
}

.task-title {
  min-width: 0;

  overflow: hidden;
  text-overflow: ellipsis;

  font-size: 0.95rem;
  font-weight: 500;

  color: var(--text);

  transition: color 0.2s ease;
}

.task-item.done .task-title {
  color: var(--text-muted);
  text-decoration: line-through;
}

.task-actions {
  display: flex;
  align-items: center;
  gap: 4px;

  flex-shrink: 0;
}

.task-edit,
.task-remove {
  border: none;
  background: transparent;

  padding: 6px 8px;

  font-size: 0.8rem;
  font-weight: 600;

  cursor: pointer;

  border-radius: 5px;

  transition:
    background 0.2s ease,
    color 0.2s ease;
}

.task-edit {
  color: var(--primary);
}

.task-edit:hover {
  background: var(--primary-light);
}

.task-remove {
  color: var(--danger);
}

.task-remove:hover {
  background: var(--danger-light);
}

@media (max-width: 560px) {
  .task-item {
    padding: 12px;
    gap: 9px;
  }

  .task-thumbnail {
    width: 42px;
    height: 42px;
  }

  .task-label {
    gap: 8px;
  }

  .task-actions {
    flex-direction: column;
  }

  .task-edit,
  .task-remove {
    padding: 4px 6px;
    font-size: 0.75rem;
  }
}
</style>