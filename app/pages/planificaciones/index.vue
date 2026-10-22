<script setup lang="ts">
import { useAsistenteService } from '~/services/asistenteService/asistenteService'
import { appRoutes } from '~/utils/appRoutes'
import type { FormatoDescarga, PlanificacionResumen } from '~/types/asistente'

useSeoMeta({ title: 'Mis planificaciones · Flopi Docentes' })

const { listarPlanificaciones, obtenerPlanificacion, descargar } = useAsistenteService()
const toast = useToast()

const planificaciones = ref<PlanificacionResumen[]>([])
const cargando = ref(true)
// "id_formato" que se está descargando.
const descargando = ref<string | null>(null)

const fecha = (iso: string | null) => iso
  ? new Date(iso.length === 10 ? `${iso}T12:00:00` : iso).toLocaleDateString('es-UY', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'America/Montevideo' })
  : '—'

const rango = (p: PlanificacionResumen) => p.desde && p.hasta
  ? (p.desde === p.hasta ? fecha(p.desde) : `${fecha(p.desde)} al ${fecha(p.hasta)}`)
  : ''

const bajar = async (p: PlanificacionResumen, formato: FormatoDescarga) => {
  descargando.value = `${p.id}_${formato}`

  try {
    await descargar(await obtenerPlanificacion(p.id), formato)
  } catch (e: any) {
    toast.error({ title: 'No se pudo descargar', message: e?.message ?? 'Probá de nuevo.' })
  } finally {
    descargando.value = null
  }
}

onMounted(async () => {
  try {
    planificaciones.value = await listarPlanificaciones()
  } catch (e: any) {
    toast.error({ title: 'No pudimos cargar tus planificaciones', message: typeof e === 'string' ? e : (e?.message ?? 'Probá de nuevo.') })
  } finally {
    cargando.value = false
  }
})
</script>

<template>
  <div class="min-h-full px-4 sm:px-8 py-6 sm:py-8">
    <div class="max-w-5xl mx-auto">
      <header class="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 class="font-display text-4xl font-bold text-mona-900 leading-none">Mis planificaciones</h1>
          <p class="text-mona-800/75 mt-2">
            Todo lo que armaste con Flopi queda guardado. Abrí una para editarla tramo por tramo o descargala en PDF o Word.
          </p>
        </div>
        <NuxtLink :to="appRoutes.asistente()" class="boton-miel inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-display text-lg font-semibold">
          <UIcon name="i-tabler-plus" class="w-5 h-5" />
          Nueva planificación
        </NuxtLink>
      </header>

      <p v-if="cargando" class="text-mona-800/75">Cargando…</p>

      <div v-else-if="planificaciones.length === 0" class="bg-white rounded-2xl border-2 border-mona-100 px-6 py-10 text-center">
        <p class="font-display text-xl font-semibold text-mona-900">Todavía no tenés planificaciones</p>
        <p class="text-mona-800/75 mt-1">Pedile una a Flopi y va a aparecer acá.</p>
      </div>

      <ul v-else class="flex flex-col gap-3">
        <li
          v-for="p in planificaciones"
          :key="p.id"
          class="bg-white rounded-2xl border-2 border-mona-100 px-4 sm:px-5 py-4 flex flex-wrap items-center gap-x-4 gap-y-3"
        >
          <NuxtLink :to="appRoutes.planificacion(p.id)" class="flex-1 min-w-60 group">
            <span class="block font-display text-lg font-semibold text-mona-950 group-hover:text-mona-700">{{ p.titulo }}</span>
            <span class="block text-sm text-mona-800/75">
              {{ p.grupo ?? 'Sin grupo' }} · {{ rango(p) }} · {{ p.total_propuestas }} {{ p.total_propuestas === 1 ? 'tramo' : 'tramos' }}
            </span>
          </NuxtLink>

          <span
            class="inline-block px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap"
            :class="p.estado === 'confirmada' ? 'bg-green-100 text-green-900' : 'bg-miel-100 text-miel-900'"
          >
            {{ p.estado === 'confirmada' ? 'Confirmada' : 'Borrador' }}
          </span>

          <div class="flex items-center gap-2">
            <template v-if="p.estado === 'confirmada'">
              <button
                v-for="formato in (['pdf', 'docx'] as const)"
                :key="formato"
                type="button"
                class="boton-mona inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-sm"
                :disabled="descargando !== null"
                :title="p.archivos_guardados ? 'Guardado en la nube' : 'Se genera al descargar'"
                @click="bajar(p, formato)"
              >
                <UIcon :name="formato === 'pdf' ? 'i-tabler-file-type-pdf' : 'i-tabler-file-type-docx'" class="w-4 h-4" />
                {{ descargando === `${p.id}_${formato}` ? 'Bajando…' : (formato === 'pdf' ? 'PDF' : 'Word') }}
              </button>
            </template>
            <NuxtLink :to="appRoutes.planificacion(p.id)" class="boton-mona inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-sm">
              <UIcon name="i-tabler-pencil" class="w-4 h-4" />
              Abrir
            </NuxtLink>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
