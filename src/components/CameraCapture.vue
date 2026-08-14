<template>
  <div class="camera-capture">
    <video
      ref="videoRef"
      autoplay
      playsinline
      class="camera-preview"
      :class="{ hidden: captured }"
    ></video>

    <img
      v-if="capturedUrl"
      :src="capturedUrl"
      class="camera-result"
      alt="Foto capturada"
    />

    <div class="camera-actions">
      <button
        v-if="!streamActive"
        type="button"
        class="camera-btn"
        @click="startCamera"
      >
        Abrir câmera
      </button>

      <button
        v-if="streamActive && !captured"
        type="button"
        class="camera-btn"
        @click="capturePhoto"
      >
        Fotografar
      </button>

      <button
        v-if="captured"
        type="button"
        class="camera-btn secondary"
        @click="retake"
      >
        Refazer
      </button>

      <button
        v-if="streamActive"
        type="button"
        class="camera-btn danger"
        @click="stopCamera"
      >
        Fechar câmera
      </button>
    </div>

    <p
      v-if="error"
      class="camera-error"
    >
      {{ error }}
    </p>
  </div>
</template>

<script setup>
import {
  ref,
  onMounted,
  onBeforeUnmount,
} from 'vue'

const emit = defineEmits([
  'captured',
])

const videoRef = ref(null)

const captured = ref(false)
const capturedUrl = ref(null)
const capturedFile = ref(null)
const streamActive = ref(false)
const error = ref(null)

let stream = null

async function startCamera() {
  error.value = null

  try {
    if (stream) {
      return
    }

    if (
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      error.value =
        'Seu navegador não suporta acesso à câmera.'

      return
    }

    stream =
      await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: {
            ideal: 'environment',
          },
          width: {
            ideal: 1280,
          },
          height: {
            ideal: 720,
          },
        },
        audio: false,
      })

    if (!videoRef.value) {
      stopCamera()
      return
    }

    videoRef.value.srcObject = stream

    streamActive.value = true
    captured.value = false

  } catch (err) {
    console.error(
      'Erro ao acessar a câmera:',
      err,
    )

    if (
      err.name === 'NotAllowedError'
    ) {
      error.value =
        'Permissão de câmera negada.'
    } else if (
      err.name === 'NotFoundError'
    ) {
      error.value =
        'Nenhuma câmera encontrada.'
    } else if (
      err.name === 'NotReadableError'
    ) {
      error.value =
        'A câmera está sendo usada por outro aplicativo.'
    } else {
      error.value =
        'Erro ao acessar a câmera.'
    }

    stream = null
    streamActive.value = false
  }
}

function capturePhoto() {
  const video = videoRef.value

  if (
    !video ||
    !streamActive.value
  ) {
    return
  }

  if (
    video.videoWidth === 0 ||
    video.videoHeight === 0
  ) {
    error.value =
      'A câmera ainda não está pronta.'

    return
  }

  const canvas =
    document.createElement('canvas')

  canvas.width = video.videoWidth
  canvas.height = video.videoHeight

  const ctx =
    canvas.getContext('2d')

  if (!ctx) {
    error.value =
      'Não foi possível capturar a imagem.'

    return
  }

  ctx.drawImage(
    video,
    0,
    0,
    canvas.width,
    canvas.height,
  )

  canvas.toBlob(
    (blob) => {
      if (!blob) {
        error.value =
          'Não foi possível gerar a imagem.'

        return
      }

      if (capturedUrl.value) {
        URL.revokeObjectURL(
          capturedUrl.value,
        )
      }

      const file = new File(
        [blob],
        `camera-capture-${Date.now()}.jpg`,
        {
          type: 'image/jpeg',
        },
      )

      capturedUrl.value =
        URL.createObjectURL(blob)

      capturedFile.value = file
      captured.value = true

      emit('captured', file)
    },
    'image/jpeg',
    0.9,
  )
}

function retake() {
  if (capturedUrl.value) {
    URL.revokeObjectURL(
      capturedUrl.value,
    )
  }

  capturedUrl.value = null
  capturedFile.value = null
  captured.value = false
  error.value = null
}

function stopCamera() {
  if (stream) {
    stream
      .getTracks()
      .forEach((track) => {
        track.stop()
      })

    stream = null
  }

  streamActive.value = false

  if (videoRef.value) {
    videoRef.value.srcObject = null
  }

  if (capturedUrl.value) {
    URL.revokeObjectURL(
      capturedUrl.value,
    )
  }

  capturedUrl.value = null
  capturedFile.value = null
  captured.value = false
}

onMounted(() => {
  startCamera()
})

onBeforeUnmount(() => {
  stopCamera()
})
</script>

<style scoped>
.camera-capture {
  display: flex;
  flex-direction: column;
  gap: 12px;

  width: 100%;
  flex-basis: 100%;

  padding: 12px;

  background: #111827;

  border-radius: var(--radius-md);
}

.camera-preview {
  width: 100%;
  max-height: 320px;

  object-fit: contain;

  background: #000;

  border-radius: var(--radius-sm);
}

.camera-preview.hidden {
  display: none;
}

.camera-result {
  width: 100%;
  max-height: 320px;

  object-fit: contain;

  background: #000;

  border-radius: var(--radius-sm);

  border: 1px solid rgba(255, 255, 255, 0.15);
}

.camera-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.camera-btn {
  padding: 8px 14px;

  border: none;
  border-radius: var(--radius-sm);

  font-size: 0.82rem;
  font-weight: 600;

  cursor: pointer;

  background: var(--primary);
  color: white;

  transition:
    opacity 0.2s ease,
    transform 0.15s ease;
}

.camera-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.camera-btn.secondary {
  background: #64748b;
}

.camera-btn.danger {
  background: var(--danger);
}

.camera-error {
  margin: 0;

  color: #fca5a5;

  font-size: 0.82rem;
}
</style>

