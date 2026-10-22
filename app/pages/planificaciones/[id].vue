<script setup lang="ts">
import PlanificacionPreview from '~/components/asistente/PlanificacionPreview.vue'
import { appRoutes } from '~/utils/appRoutes'
import type { Planificacion } from '~/types/asistente'

// Una planificación guardada, fuera del chat: se edita tramo por tramo y se descarga.
const route = useRoute()
const { obtenerPlanificacion } = useAsistenteService()
const toast = useToast()

const planificacion = ref<Planificacion | null>(null)
const noEncontrada = ref(false)

useSeoMeta({ title: () => `${planificacion.value?.titulo ?? 'Planificación'} · Flopi Docentes` })

const cargar = async () => {
  try {
    planificacion.value = await obtenerPlanificacion(Number(route.params.id))
  } catch (e: any) {
    noEncontrada.value = true
    toast.error({ title: 'No pudimos abrir la planificación', message: typeof e === 'string' ? e : (e?.message ?? 'Probá de nuevo.') })
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
