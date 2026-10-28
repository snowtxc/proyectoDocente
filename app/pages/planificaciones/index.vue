<script setup lang="ts">
import { useAsistenteService } from '~/services/asistenteService/asistenteService'
import CalendarioPlanificaciones from '~/components/planificaciones/CalendarioPlanificaciones.vue'
import { appRoutes } from '~/utils/appRoutes'
import type { FormatoDescarga, PlanificacionResumen } from '~/types/asistente'

useSeoMeta({ title: 'Mis planificaciones · Flopi Docentes' })

const { listarPlanificaciones, obtenerPlanificacion, eliminarPlanificacion, descargar } = useAsistenteService()
const toast = useToast()
const pedirConfirmacion = useConfirmacion()

const planificaciones = ref<PlanificacionResumen[]>([])
const total = ref(0)
const pagina = ref(1)
const porPagina = 9
const cargando = ref(true)

// Lista o calendario. Se recuerda en este navegador.
const vistas = [
  { label: 'Lista', value: 'lista', icon: 'i-tabler-layout-grid' },
  { label: 'Calendario', value: 'calendario', icon: 'i-tabler-calendar-month' },
]
const vista = ref<'lista' | 'calendario'>('lista')
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

const borrando = ref<number | null>(null)

const borrar = async (p: PlanificacionResumen) => {
  if (!await pedirConfirmacion({ titulo: `¿Borrar "${p.titulo}"?`, mensaje: 'Se borran la planificación y sus archivos. No se puede deshacer.', aceptar: 'Borrar', peligro: true })) return

  borrando.value = p.id

  try {
    await eliminarPlanificacion(p.id)
    toast.success({ title: 'Planificación borrada', message: p.titulo })

    // Si era la última de la página, se vuelve a la anterior (el watch recarga).
    if (planificaciones.value.length === 1 && pagina.value > 1) {
      pagina.value--
    } else {
      await cargar()
    }
  } catch (e: any) {
    toast.error({ title: 'No se pudo borrar', message: typeof e === 'string' ? e : (e?.message ?? 'Probá de nuevo.') })
  } finally {
    borrando.value = null
  }
}

const cargar = async () => {
  cargando.value = true

  try {
    const respuesta = await listarPlanificaciones(pagina.value, porPagina)
    planificaciones.value = respuesta.list
    total.value = respuesta.totalCount
  } catch (e: any) {
    toast.error({ title: 'No pudimos cargar tus planificaciones', message: typeof e === 'string' ? e : (e?.message ?? 'Probá de nuevo.') })
  } finally {
    cargando.value = false
  }
}

watch(pagina, cargar)

watch(vista, (valor) => {
  try { localStorage.setItem('flopi.planificaciones.vista', valor) } catch {}
})

onMounted(() => {
  try {
    const guardada = localStorage.getItem('flopi.planificaciones.vista')
    if (guardada === 'calendario' || guardada === 'lista') vista.value = guardada
  } catch {}

  cargar()
})
</script>

<template>
  <div class="min-h-full px-4 sm:px-8 py-6 sm:py-8">
    <div class="max-w-6xl mx-auto">
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

      <UTabs v-model="vista" :items="vistas" :content="false" class="mb-5 w-full sm:w-72" />

      <CalendarioPlanificaciones v-if="vista === 'calendario'" />

      <template v-else>
        <p v-if="cargando && planificaciones.length === 0" class="text-mona-800/75">Cargando…</p>

        <div v-else-if="total === 0" class="bg-white rounded-2xl border-2 border-mona-100 px-6 py-10 text-center">
          <p class="font-display text-xl font-semibold text-mona-900">Todavía no tenés planificaciones</p>
          <p class="text-mona-800/75 mt-1">Pedile una a Flopi y va a aparecer acá.</p>
        </div>

        <ul v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <li
            v-for="p in planificaciones"
            :key="p.id"
            class="bg-white rounded-2xl border-2 border-mona-100 p-5 flex flex-col aspect-square min-h-64 hover:border-mona-300 transition-colors"
          >
            <div class="flex items-start justify-between gap-2">
              <span
                class="inline-block px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap"
                :class="p.estado === 'confirmada' ? 'bg-green-100 text-green-900' : 'bg-miel-100 text-miel-900'"
              >
                {{ p.estado === 'confirmada' ? 'Confirmada' : 'Borrador' }}
              </span>
              <UIcon
                v-if="p.archivos_guardados"
                name="i-tabler-cloud-check"
                class="w-5 h-5 text-green-700"
                title="El PDF y el Word están guardados en la nube"
              />
            </div>

            <NuxtLink :to="appRoutes.planificacion(p.id)" class="mt-4 group flex-1">
              <span class="block font-display text-xl font-semibold leading-tight text-mona-950 group-hover:text-mona-700">{{ p.titulo }}</span>
              <span class="block mt-2 text-sm text-mona-800/80">{{ p.grupo ?? 'Sin grupo' }}</span>
              <span class="block text-sm text-mona-800/80">{{ rango(p) }}</span>
              <span class="block mt-3 font-display text-3xl font-bold text-mona-900">
                {{ p.total_propuestas }}
                <span class="text-base font-semibold text-mona-800/70">{{ p.total_propuestas === 1 ? 'tramo' : 'tramos' }}</span>
              </span>
            </NuxtLink>

            <div class="flex flex-wrap items-center gap-2 mt-4">
              <NuxtLink :to="appRoutes.planificacion(p.id)" class="boton-mona inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-sm">
                <UIcon name="i-tabler-pencil" class="w-4 h-4" />
                Abrir
              </NuxtLink>
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
                  {{ descargando === `${p.id}_${formato}` ? '…' : (formato === 'pdf' ? 'PDF' : 'Word') }}
                </button>
              </template>
              <button
                type="button"
                class="ml-auto p-2 rounded-xl text-mona-800/60 hover:text-red-700 hover:bg-red-50"
                :disabled="borrando !== null"
                :aria-label="`Borrar ${p.titulo}`"
                title="Borrar"
                @click="borrar(p)"
              >
                <UIcon :name="borrando === p.id ? 'i-tabler-loader-2' : 'i-tabler-trash'" class="w-5 h-5" :class="{ 'animate-spin': borrando === p.id }" />
              </button>
            </div>
          </li>
        </ul>

        <div v-if="total > porPagina" class="flex justify-center mt-6">
          <UPagination v-model:page="pagina" :items-per-page="porPagina" :total="total" />
        </div>
      </template>
    </div>
  </div>
</template>
