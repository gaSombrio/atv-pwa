<template>
  <form class="task-form" @submit.prevent="handleSubmit">
    <div class="task-row">
      <input
        v-model="newTask"
        type="text"
        placeholder="Nova tarefa..."
        class="task-input"
      />

      <button
        type="submit"
        class="task-button"
        :disabled="uploading"
      >
        {{ editingTask ? 'Alterar' : 'Adicionar' }}
      </button>

      <button
        v-if="editingTask"
        type="button"
        class="task-button-cancel"
        @click="handleCancel"
      >
        Cancelar
      </button>
    </div>

    <div class="image-section">
      <img
        v-if="previewUrl || editingTask?.img_url"
        :src="previewUrl || editingTask?.img_url"
        class="image-preview"
        alt="Imagem da tarefa"
      />

      <label
        class="image-label"
        :class="{ disabled: uploading }"
      >
        <span v-if="uploading" class="upload-status">
          Enviando...
        </span>

        <span v-else>
          Adicionar imagem
        </span>

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          class="image-input"
          :disabled="uploading"
          @change="handleImageChange"
        />
      </label>

      <button
        type="button"
        class="task-button-secondary"
        :disabled="uploading"
        @click="toggleCamera"
      >
        {{
          showCameraCapture
            ? 'Fechar câmera'
            : 'Abrir câmera'
        }}
      </button>

      <CameraCapture
        v-if="showCameraCapture"
        @captured="handleCameraCapture"
      />
    </div>
  </form>
</template>

<script setup>
import {
  ref,
  watch,
  onBeforeUnmount,
} from 'vue'

import tasksApi from '../api/tasksApi.js'
import CameraCapture from './CameraCapture.vue'

const props = defineProps({
  editingTask: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits([
  'add',
  'update',
  'cancel',
])

const newTask = ref('')
const previewUrl = ref(null)
const imgAttachmentKey = ref(null)
const uploading = ref(false)
const showCameraCapture = ref(false)

watch(
  () => props.editingTask,
  (task) => {
    newTask.value = task ? task.title : ''

    clearPreview()

    imgAttachmentKey.value = null
    showCameraCapture.value = false
  },
  { immediate: true },
)

function toggleCamera() {
  if (uploading.value) {
    return
  }

  showCameraCapture.value =
    !showCameraCapture.value
}

function clearPreview() {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }

  previewUrl.value = null
}

async function handleImageChange(event) {
  const file = event.target.files?.[0]

  if (!file) {
    return
  }

  if (!file.type.startsWith('image/')) {
    console.error(
      'O arquivo selecionado não é uma imagem.',
    )

    event.target.value = ''
    return
  }

  showCameraCapture.value = false

  clearPreview()

  previewUrl.value =
    URL.createObjectURL(file)

  uploading.value = true

  try {
    const response =
      await tasksApi.uploadImage(file)

    imgAttachmentKey.value =
      response.data.attachment_key
  } catch (err) {
    console.error(
      'Erro ao fazer upload da imagem:',
      err,
    )

    clearPreview()

    imgAttachmentKey.value = null
  } finally {
    uploading.value = false
    event.target.value = ''
  }
}

async function handleCameraCapture(file) {
  if (!file) {
    return
  }

  clearPreview()

  previewUrl.value =
    URL.createObjectURL(file)

  uploading.value = true

  try {
    const response =
      await tasksApi.uploadImage(file)

    imgAttachmentKey.value =
      response.data.attachment_key
  } catch (err) {
    console.error(
      'Erro ao fazer upload da imagem capturada:',
      err,
    )

    clearPreview()

    imgAttachmentKey.value = null
  } finally {
    uploading.value = false
  }
}

function handleSubmit() {
  if (!newTask.value.trim()) {
    return
  }

  const payload = {
    title: newTask.value.trim(),
    imgAttachmentKey:
      imgAttachmentKey.value,
  }

  if (props.editingTask) {
    emit(
      'update',
      props.editingTask.id,
      payload,
    )
  } else {
    emit('add', payload)
  }

  newTask.value = ''

  clearPreview()

  imgAttachmentKey.value = null
  showCameraCapture.value = false
}

function handleCancel() {
  newTask.value = ''

  clearPreview()

  imgAttachmentKey.value = null
  showCameraCapture.value = false

  emit('cancel')
}

onBeforeUnmount(() => {
  clearPreview()
})
</script>

<style scoped>
.task-form {
  margin-bottom: 28px;
  padding: 18px;

  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);

  box-shadow: var(--shadow-sm);
}

.task-row {
  display: flex;
  gap: 10px;
  margin-bottom: 14px;
}

.task-input {
  flex: 1;

  min-width: 0;

  padding: 12px 14px;

  border: 1px solid var(--border);
  border-radius: var(--radius-md);

  background: #fafafa;
  color: var(--text);

  font-size: 0.95rem;

  outline: none;

  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
}

.task-input::placeholder {
  color: var(--text-muted);
}

.task-input:focus {
  background: white;
  border-color: var(--primary);

  box-shadow: 0 0 0 3px rgba(74, 144, 217, 0.12);
}

.task-button {
  padding: 11px 18px;

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

.task-button:hover:not(:disabled) {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

.task-button:active:not(:disabled) {
  transform: translateY(0);
}

.task-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.task-button-cancel {
  padding: 11px 15px;

  background: transparent;
  color: var(--text-secondary);

  border: 1px solid var(--border);
  border-radius: var(--radius-md);

  font-size: 0.9rem;
  font-weight: 500;

  cursor: pointer;

  transition:
    background 0.2s ease,
    border-color 0.2s ease;
}

.task-button-cancel:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.image-section {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;

  padding: 12px;

  background: #f8fafc;

  border: 1px dashed #d5dce5;
  border-radius: var(--radius-md);
}

.image-preview {
  width: 58px;
  height: 58px;

  object-fit: cover;

  border-radius: var(--radius-sm);
  border: 1px solid var(--border);

  flex-shrink: 0;
}

.image-label {
  display: inline-flex;
  align-items: center;

  padding: 8px 12px;

  background: white;
  color: var(--primary);

  border: 1px solid rgba(74, 144, 217, 0.5);
  border-radius: var(--radius-sm);

  font-size: 0.82rem;
  font-weight: 600;

  cursor: pointer;

  transition:
    background 0.2s ease,
    border-color 0.2s ease;
}

.image-label:hover:not(.disabled) {
  background: var(--primary-light);
  border-color: var(--primary);
}

.image-label.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.image-input {
  display: none;
}

.upload-status {
  color: var(--text-secondary);
}

.task-button-secondary {
  padding: 8px 12px;

  background: white;
  color: var(--text-secondary);

  border: 1px solid var(--border);
  border-radius: var(--radius-sm);

  font-size: 0.82rem;
  font-weight: 500;

  cursor: pointer;

  transition:
    color 0.2s ease,
    border-color 0.2s ease,
    background 0.2s ease;
}

.task-button-secondary:hover:not(:disabled) {
  color: var(--primary);
  border-color: var(--primary);
  background: var(--primary-light);
}

.task-button-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 560px) {
  .task-form {
    padding: 14px;
  }

  .task-row {
    display: grid;
    grid-template-columns: 1fr auto;
  }

  .task-input {
    width: 100%;
  }

  .task-button-cancel {
    grid-column: 1 / -1;
  }

  .image-section {
    align-items: stretch;
  }
}
</style>

