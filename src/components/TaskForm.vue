<template>
  <form
    class="task-form"
    @submit.prevent="handleSubmit"
  >
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
        {{
          editingTask
            ? 'Alterar'
            : 'Adicionar'
        }}
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
        v-if="
          previewUrl ||
          editingTask?.img_url
        "
        :src="
          previewUrl ||
          editingTask?.img_url
        "
        class="image-preview"
        alt="Imagem da tarefa"
      />

      <label
        class="image-label"
        :class="{ disabled: uploading }"
      >
        <span
          v-if="uploading"
          class="upload-status"
        >
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

    <div class="location-section">
      <div class="location-header">
        <div>
          <h3>
            Localização
          </h3>

          <p>
            A localização será associada a esta tarefa.
          </p>
        </div>

        <button
          type="button"
          class="location-button"
          :disabled="
            loadingLocation ||
            !isSupported
          "
          @click="handleGetLocation"
        >
          {{
            loadingLocation
              ? 'Obtendo localização...'
              : 'Usar localização atual'
          }}
        </button>
      </div>

      <p
        v-if="!isSupported"
        class="location-error"
      >
        Geolocalização não suportada neste dispositivo.
      </p>

      <p
        v-if="locationError"
        class="location-error"
      >
        {{ locationError }}
      </p>

      <div
        v-if="location"
        class="location-info"
      >
        <p>
          <strong>Latitude:</strong>
          {{ location.latitude }}
        </p>

        <p>
          <strong>Longitude:</strong>
          {{ location.longitude }}
        </p>

        <p
          v-if="
            location.accuracy != null
          "
        >
          <strong>Precisão:</strong>
          {{ Math.round(location.accuracy) }}
          metros
        </p>

        <p
          v-if="location.label"
        >
          <strong>Endereço aproximado:</strong>
          {{ location.label }}
        </p>

        <TaskLocationMap
          :location="location"
        />

        <button
          type="button"
          class="remove-location-button"
          @click="handleRemoveLocation"
        >
          Remover localização
        </button>
      </div>
    </div>
  </form>
</template>

<script setup>
import {
  ref,
  watch,
  onBeforeUnmount,
  onMounted,
} from 'vue'

import tasksApi from '../api/tasksApi.js'

import geocodingApi from '../api/geocodingApi.js'

import {
  buildLocationPayload,
} from '../utils/location.js'

import {
  useGeolocation,
} from '../composables/useGeolocation.js'

import CameraCapture from './CameraCapture.vue'

import TaskLocationMap from './TaskLocationMap.vue'

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

const {
  isSupported,
  loadingLocation,
  locationError,
  location,
  readPermissionState,
  setLocationFromTask,
  clearLocation,
  setLocationLabel,
  requestCurrentLocation,
} = useGeolocation()

onMounted(() => {
  readPermissionState()
})

watch(
  () => props.editingTask,
  (task) => {
    newTask.value =
      task
        ? task.title
        : ''

    clearPreview()

    imgAttachmentKey.value = null

    showCameraCapture.value = false

    setLocationFromTask(task)
  },
  {
    immediate: true,
  },
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
    URL.revokeObjectURL(
      previewUrl.value,
    )
  }

  previewUrl.value = null
}

async function handleImageChange(event) {
  const file =
    event.target.files?.[0]

  if (!file) {
    return
  }

  if (
    !file.type.startsWith(
      'image/',
    )
  ) {
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

async function handleGetLocation() {
  const captured =
    await requestCurrentLocation()

  if (!captured) {
    return
  }

  try {
    const address =
      await geocodingApi.reverse(
        captured.latitude,
        captured.longitude,
      )

    setLocationLabel(
      address?.label,
    )
  } catch {
    locationError.value =
      'Localização obtida, mas não foi possível identificar a rua.'
  }
}

function handleRemoveLocation() {
  clearLocation()
}

function handleSubmit() {
  if (!newTask.value.trim()) {
    return
  }

  const payload = {
    title:
      newTask.value.trim(),

    imgAttachmentKey:
      imgAttachmentKey.value,

    ...buildLocationPayload(
      location.value,
    ),
  }

  if (props.editingTask) {
    emit(
      'update',
      props.editingTask.id,
      payload,
    )
  } else {
    emit(
      'add',
      payload,
    )
  }

  newTask.value = ''

  clearPreview()

  imgAttachmentKey.value = null

  showCameraCapture.value = false

  clearLocation()
}

function handleCancel() {
  newTask.value = ''

  clearPreview()

  imgAttachmentKey.value = null

  showCameraCapture.value = false

  clearLocation()

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
}

.task-input:focus {
  background: white;

  border-color: var(--primary);

  box-shadow:
    0 0 0 3px
    rgba(74, 144, 217, 0.12);
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

  cursor: pointer;
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

  border: 1px solid
    rgba(74, 144, 217, 0.5);

  border-radius: var(--radius-sm);

  font-size: 0.82rem;

  font-weight: 600;

  cursor: pointer;
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

  cursor: pointer;
}

.task-button-secondary:disabled {
  opacity: 0.5;

  cursor: not-allowed;
}

.location-section {
  margin-top: 16px;

  padding: 14px;

  background: #f8fafc;

  border: 1px solid var(--border);

  border-radius: var(--radius-md);
}

.location-header {
  display: flex;

  justify-content: space-between;

  align-items: center;

  gap: 16px;
}

.location-header h3 {
  margin: 0 0 4px;

  font-size: 0.95rem;

  color: var(--text);
}

.location-header p {
  margin: 0;

  font-size: 0.8rem;

  color: var(--text-muted);
}

.location-button {
  flex-shrink: 0;

  padding: 9px 12px;

  background: var(--primary);

  color: white;

  border: none;

  border-radius: var(--radius-sm);

  font-size: 0.82rem;

  font-weight: 600;

  cursor: pointer;
}

.location-button:disabled {
  opacity: 0.55;

  cursor: not-allowed;
}

.location-error {
  margin: 12px 0 0;

  padding: 10px;

  color: #b42318;

  background: var(--danger-light);

  border-radius: var(--radius-sm);

  font-size: 0.82rem;
}

.location-info {
  margin-top: 14px;

  padding-top: 14px;

  border-top: 1px solid var(--border);
}

.location-info p {
  margin: 6px 0;

  font-size: 0.84rem;

  color: var(--text-secondary);
}

.remove-location-button {
  margin-top: 12px;

  padding: 8px 12px;

  background: transparent;

  color: var(--danger);

  border: 1px solid var(--danger);

  border-radius: var(--radius-sm);

  font-size: 0.82rem;

  font-weight: 600;

  cursor: pointer;
}

@media (max-width: 560px) {
  .task-form {
    padding: 14px;
  }

  .task-row {
    display: grid;

    grid-template-columns:
      1fr auto;
  }

  .task-button-cancel {
    grid-column: 1 / -1;
  }

  .image-section {
    align-items: stretch;
  }

  .location-header {
    flex-direction: column;

    align-items: stretch;
  }

  .location-button {
    width: 100%;
  }
}
</style>