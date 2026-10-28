<script setup lang="ts">
import { useAsistenteService } from '~/services/asistenteService/asistenteService'
import PlanificacionPreview from '~/components/asistente/PlanificacionPreview.vue'
import { appRoutes } from '~/utils/appRoutes'
import type { Planificacion } from '~/types/asistente'

// Una planificación guardada, fuera del chat: se edita tramo por tramo y se descarga.
const route = useRoute()
const { obtenerPlanificacion, eliminarPlanificacion } = useAsistenteService()
const toast = useToast()
const pedirConfirmacion = useConfirmacion()

const planificacion = ref<Planificacion | null>(null)
const noEncontrada = ref(false)
const borrando = ref(false)

useSeoMeta({ title: () => `${planificacion.value?.titulo ?? 'Planificación'} · Flopi Docentes` })

const cargar = async () => {
  try {
    planificacion.value = await obtenerPlanificacion(Number(route.params.id))
  } catch (e: any) {
    noEncontrada.value = true
    toast.error({ title: 'No pudimos abrir la planificación', message: typeof e === 'string' ? e : (e?.message ?? 'Probá de nuevo.') })
  }
}

const borrar = async () => {
  if (!planificacion.value || !await pedirConfirmacion({ titulo: `¿Borrar "${planificacion.value.titulo}"?`, mensaje: 'Se borran la planificación y sus archivos. No se puede deshacer.', aceptar: 'Borrar', peligro: true })) return

  borrando.value = true

  try {
    await eliminarPlanificacion(planificacion.value.id)
    toast.success({ title: 'Planificación borrada', message: planificacion.value.titulo })
    await navigateTo(appRoutes.planificaciones())
  } catch (e: any) {
    toast.error({ title: 'No se pudo borrar', message: typeof e === 'string' ? e : (e?.message ?? 'Probá de nuevo.') })
  } finally {
    borrando.value = false
  }
}

onMounted(cargar)
</script>

<template>
  <div class="h-full flex flex-col min-h-0">
    <div class="px-4 sm:px-6 py-3 border-b-2 border-miel-200 bg-white flex items-center gap-3">
      <NuxtLink :to="appRoutes.planificaciones()" class="inline-flex items-center gap-1.5 text-sm font-bold text-mona-700 hover:text-mona-900">
        <UIcon name="i-tabler-arrow-left" class="w-4 h-4" />
        Mis planificaciones
      </NuxtLink>
      <button
        v-if="planificacion"
        type="button"
        class="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold text-mona-800/70 hover:text-red-700 hover:bg-red-50"
        :disabled="borrando"
        @click="borrar"
      >
        <UIcon :name="borrando ? 'i-tabler-loader-2' : 'i-tabler-trash'" class="w-4 h-4" :class="{ 'animate-spin': borrando }" />
        Borrar
      </button>
    </div>

    <div v-if="planificacion" class="flex-1 min-h-0">
      <PlanificacionPreview
        :planificacion="planificacion"
        @actualizada="(nueva) => (planificacion = nueva)"
        @confirmada="cargar"
      />
    </div>
    <p v-else-if="noEncontrada" class="px-6 py-10 text-center text-mona-800/75">Esta planificación no existe o no es tuya.</p>
    <p v-else class="px-6 py-10 text-mona-800/75">Cargando…</p>
  </div>
</template>
