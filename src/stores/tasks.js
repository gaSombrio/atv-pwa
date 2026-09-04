import {
  computed,
  ref,
} from 'vue'

import {
  defineStore,
} from 'pinia'

import tasksApi from '../api/tasksApi.js'

export const useTasksStore =
  defineStore(
    'tasks',
    () => {
      const tasks = ref([])

      const loading =
        ref(false)

      const error =
        ref(null)

      const pendingTasks =
        computed(() =>
          tasks.value.filter(
            (t) => !t.done,
          ),
        )

      const completedTasks =
        computed(() =>
          tasks.value.filter(
            (t) => t.done,
          ),
        )

      async function fetchTasks() {
        loading.value = true

        error.value = null

        try {
          const response =
            await tasksApi.getAll()

          tasks.value =
            response.data
        } catch (err) {
          error.value =
            'Erro ao carregar tarefas.'

          console.error(err)
        } finally {
          loading.value = false
        }
      }

      async function addTask(data) {
        if (
          !data.title?.trim()
        ) {
          return
        }

        error.value = null

        const payload = {
          title:
            data.title.trim(),

          latitude:
            data.latitude ?? null,

          longitude:
            data.longitude ?? null,

          geolocation_accuracy:
            data.geolocation_accuracy ?? null,

          geolocation_timestamp:
            data.geolocation_timestamp ?? null,

          location_label:
            data.location_label ?? null,
        }

        if (
          data.imgAttachmentKey != null
        ) {
          payload.img_attachment_key =
            data.imgAttachmentKey
        }

        try {
          const response =
            await tasksApi.create(
              payload,
            )

          tasks.value.push(
            response.data,
          )
        } catch (err) {
          error.value =
            'Erro ao adicionar tarefa.'

          console.error(err)
        }
      }

      async function toggleTask(id) {
        const task =
          tasks.value.find(
            (t) =>
              t.id === id,
          )

        if (!task) {
          return
        }

        error.value = null

        try {
          const response =
            await tasksApi.update(
              id,
              {
                done:
                  !task.done,
              },
            )

          const index =
            tasks.value.findIndex(
              (t) =>
                t.id === id,
            )

          if (index !== -1) {
            tasks.value[index] =
              response.data
          }
        } catch (err) {
          error.value =
            'Erro ao atualizar tarefa.'

          console.error(err)
        }
      }

      async function removeTask(id) {
        error.value = null

        try {
          await tasksApi.remove(id)

          tasks.value =
            tasks.value.filter(
              (t) =>
                t.id !== id,
            )
        } catch (err) {
          error.value =
            'Erro ao remover tarefa.'

          console.error(err)
        }
      }

      async function updateTask(
        id,
        data = {},
      ) {
        if (
          data.title !== undefined &&
          !data.title.trim()
        ) {
          return
        }

        error.value = null

        const payload = {}

        if (
          data.title !== undefined
        ) {
          payload.title =
            data.title.trim()
        }

        if (
          data.imgAttachmentKey != null
        ) {
          payload.img_attachment_key =
            data.imgAttachmentKey
        }

        if (
          data.latitude !== undefined
        ) {
          payload.latitude =
            data.latitude
        }

        if (
          data.longitude !== undefined
        ) {
          payload.longitude =
            data.longitude
        }

        if (
          data.geolocation_accuracy !==
          undefined
        ) {
          payload.geolocation_accuracy =
            data.geolocation_accuracy
        }

        if (
          data.geolocation_timestamp !==
          undefined
        ) {
          payload.geolocation_timestamp =
            data.geolocation_timestamp
        }

        if (
          data.location_label !==
          undefined
        ) {
          payload.location_label =
            data.location_label
        }

        try {
          const response =
            await tasksApi.update(
              id,
              payload,
            )

          const index =
            tasks.value.findIndex(
              (t) =>
                t.id === id,
            )

          if (index !== -1) {
            tasks.value[index] =
              response.data
          }
        } catch (err) {
          error.value =
            'Erro ao editar tarefa.'

          console.error(err)
        }
      }

      return {
        tasks,
        loading,
        error,
        pendingTasks,
        completedTasks,
        fetchTasks,
        addTask,
        toggleTask,
        removeTask,
        updateTask,
      }
    },
  )