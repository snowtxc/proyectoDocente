<script setup lang="ts">
import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum'
import { apiAdminRoutes } from '~/utils/apiRoutes'
import { appRoutes } from '~/utils/appRoutes'
import { useAuthStore } from '~/utils/authStore'
import type { ReporteAdmin } from '~/types/reporte'

useSeoMeta({ title: 'Reportes · Flopi Docentes' })

const { $apiRest } = useNuxtApp()
const toast = useToast()
const authStore = useAuthStore()

// Solo el superadmin. El backend lo exige igual en cada pedido.
if (authStore.user?.rol !== 'superadmin') {
  await navigateTo(appRoutes.asistente())
}

const reportes = ref<ReporteAdmin[]>([])
const total = ref(0)
const nuevos = ref(0)
const pagina = ref(1)
const porPagina = 20
const cargando = ref(false)
const tipo = ref<'' | 'problema' | 'funcionalidad'>('')
const estado = ref<'' | 'nuevo' | 'visto' | 'resuelto'>('nuevo')
const guardando = ref<number | null>(null)

const filtrosTipo = [
  { value: '', label: 'Todos' },
  { value: 'problema', label: 'Problemas' },
  { value: 'funcionalidad', label: 'Ideas' },
]
const filtrosEstado = [
  { value: 'nuevo', label: 'Nuevos' },
  { value: 'visto', label: 'Vistos' },
  { value: 'resuelto', label: 'Resueltos' },
  { value: '', label: 'Todos' },
]

const fecha = (iso: string) => new Date(iso).toLocaleString('es-UY', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'America/Montevideo' })

const cargar = async () => {
  cargando.value = true

  try {
    const respuesta = await $apiRest<{ list: ReporteAdmin[], totalCount: number, nuevos: number }>(apiAdminRoutes.reportes(pagina.value, porPagina, tipo.value, estado.value), HttpMethodEnum.GET)
    reportes.value = respuesta.list
    total.value = respuesta.totalCount
    nuevos.value = respuesta.nuevos
  } catch (error: any) {
    toast.error({ title: 'No pudimos cargar los reportes', message: typeof error === 'string' ? error : (error?.message ?? 'Probá de nuevo.') })
  } finally {
    cargando.value = false
  }
}

const cambiarEstado = async (reporte: ReporteAdmin, nuevo: ReporteAdmin['estado']) => {
  guardando.value = reporte.id

  try {
    await $apiRest<ReporteAdmin>(apiAdminRoutes.reporte(reporte.id), HttpMethodEnum.PUT, { estado: nuevo })
    await cargar()
  } catch (error: any) {
    toast.error({ title: 'No se pudo actualizar', message: typeof error === 'string' ? error : (error?.message ?? 'Probá de nuevo.') })
  } finally {
    guardando.value = null
  }
}

watch([tipo, estado], () => {
  pagina.value = 1
  cargar()
})
watch(pagina, cargar)

onMounted(() => {
  if (authStore.user?.rol === 'superadmin') cargar()
})
</script>

<template>
  <div class="min-h-full px-4 sm:px-8 py-6 sm:py-8">
    <div class="max-w-5xl mx-auto">
      <header class="mb-6">
        <h1 class="font-display text-4xl font-bold text-mona-900 leading-none">Reportes</h1>
        <p class="text-mona-800/75 mt-2">
          Problemas e ideas que mandan los usuarios.
          <strong v-if="nuevos > 0" class="text-mona-900">{{ nuevos }} {{ nuevos === 1 ? 'nuevo' : 'nuevos' }}.</strong>
        </p>
      </header>

      <div class="flex flex-wrap gap-3 mb-5">
        <UTabs v-model="estado" :items="filtrosEstado" :content="false" size="sm" />
        <UTabs v-model="tipo" :items="filtrosTipo" :content="false" size="sm" />
      </div>

      <p v-if="cargando && reportes.length === 0" class="text-mona-800/75">Cargando…</p>
      <div v-else-if="reportes.length === 0" class="bg-white rounded-2xl border-2 border-mona-100 px-6 py-10 text-center text-mona-800/75">
        No hay reportes con estos filtros.
      </div>

      <ul v-else class="flex flex-col gap-3">
        <li v-for="reporte in reportes" :key="reporte.id" class="bg-white rounded-2xl border-2 border-mona-100 px-5 py-4">
          <div class="flex flex-wrap items-center gap-2 text-sm">
            <span
              class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
              :class="reporte.tipo === 'problema' ? 'bg-red-100 text-red-900' : 'bg-mona-100 text-mona-900'"
            >
              <UIcon :name="reporte.tipo === 'problema' ? 'i-tabler-bug' : 'i-tabler-bulb'" class="w-3.5 h-3.5" />
              {{ reporte.tipo === 'problema' ? 'Problema' : 'Idea' }}
            </span>
            <span class="font-bold text-mona-950">{{ reporte.usuario?.nombre ?? 'Usuario eliminado' }}</span>
            <span class="text-mona-800/70">{{ reporte.usuario?.email }}</span>
            <span class="text-mona-800/60 ml-auto">{{ fecha(reporte.fecha) }}</span>
          </div>

          <p class="mt-3 text-mona-950 whitespace-pre-line">{{ reporte.mensaje }}</p>
          <p v-if="reporte.pagina" class="mt-2 text-xs text-mona-800/60">Desde: <span class="font-mono">{{ reporte.pagina }}</span></p>

          <div class="flex flex-wrap gap-2 mt-3">
            <button
              v-for="opcion in (['nuevo', 'visto', 'resuelto'] as const)"
              :key="opcion"
              type="button"
              class="px-3 py-1.5 rounded-xl text-sm font-bold border-2 transition-colors"
              :class="reporte.estado === opcion ? 'border-miel-500 bg-miel-50 text-mona-950' : 'border-mona-100 text-mona-800 hover:border-mona-300'"
              :disabled="guardando === reporte.id || reporte.estado === opcion"
              @click="cambiarEstado(reporte, opcion)"
            >
              {{ opcion === 'nuevo' ? 'Nuevo' : opcion === 'visto' ? 'Visto' : 'Resuelto' }}
            </button>
          </div>
        </li>
      </ul>

      <div v-if="total > porPagina" class="flex justify-center mt-6">
        <UPagination v-model:page="pagina" :items-per-page="porPagina" :total="total" />
      </div>
    </div>
  </div>
</template>
