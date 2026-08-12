<template>
  <div>
    <p v-if="store.error" class="error-message">{{ store.error }}</p>

    <TaskForm
      :editing-task="editingTask"
      @add="handleAdd"
      @update="handleUpdate"
      @cancel="handleCancel"
    />

    <p v-if="store.loading" class="loading-message">Carregando tarefas...</p>

    <template v-else>
      <section v-if="store.pendingTasks.length > 0">
        <h2 class="section-title">Pendentes ({{ store.pendingTasks.length }})</h2>
        <TaskItem
          v-for="task in store.pendingTasks"
          :key="task.id"
          :task="task"
          @toggle="handleToggle"
          @remove="handleRemove"
          @edit="handleEdit"
        />
      </section>

      <section v-if="store.completedTasks.length > 0">
        <h2 class="section-title">Concluídas ({{ store.completedTasks.length }})</h2>
        <TaskItem
          v-for="task in store.completedTasks"
          :key="task.id"
          :task="task"
          @toggle="handleToggle"
          @remove="handleRemove"
          @edit="handleEdit"
        />
      </section>

      <p v-if="store.tasks.length === 0" class="empty-message">
        Nenhuma tarefa cadastrada. Adicione uma acima.
      </p>
    </template>

    <InstallButton />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import TaskForm from '../components/TaskForm.vue'
import TaskItem from '../components/TaskItem.vue'
import InstallButton from '../components/InstallButton.vue'
import { useTasksStore } from '../stores/tasks.js'

const store = useTasksStore()
const editingTask = ref(null)

onMounted(() => {
  store.fetchTasks()
})

function handleAdd(payload) {
  store.addTask(payload);
}

function handleUpdate(id, payload) {
  store.updateTask(id, payload)
  editingTask.value = null
}

function handleCancel() {
  editingTask.value = null
}

function handleEdit(task) {
  editingTask.value = task
}

function handleToggle(id) {
  store.toggleTask(id)
}

function handleRemove(id) {
  if (editingTask.value?.id === id) editingTask.value = null
  store.removeTask(id)
}
</script>

<style scoped>
.section-title {
  display: flex;
  align-items: center;
  gap: 8px;

  margin-top: 26px;
  margin-bottom: 12px;

  font-size: 0.85rem;
  font-weight: 700;

  color: var(--text-secondary);

  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.empty-message {
  padding: 45px 20px;

  text-align: center;

  color: var(--text-muted);

  font-size: 0.9rem;

  background: rgba(255, 255, 255, 0.6);

  border: 1px dashed #d5dce5;
  border-radius: var(--radius-lg);
}

.error-message {
  margin-bottom: 14px;
  padding: 11px 14px;

  color: #b42318;

  background: var(--danger-light);

  border: 1px solid #f5c2c0;
  border-radius: var(--radius-md);

  font-size: 0.85rem;
}

.loading-message {
  padding: 20px;

  text-align: center;

  color: var(--text-secondary);

  font-size: 0.9rem;
}
</style>