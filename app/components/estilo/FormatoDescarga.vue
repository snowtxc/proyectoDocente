<script setup lang="ts">
import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum'
import { apiEstiloRoutes } from '~/utils/apiRoutes'
import { useAsistenteService } from '~/services/asistenteService/asistenteService'
import type { FormatoExportacion } from '~/types/estilo'
import type { FormatoDescarga } from '~/types/asistente'

// Formato de descarga: Flopi copia el diseño de la última planificación que subió el docente
// (letra, títulos, etiquetas, colores, texto seguido o en cuadro) para todas sus descargas.
const props = defineProps<{ formato: FormatoExportacion }>()

const { $apiRest } = useNuxtApp()
const { descargarEjemploFormato } = useAsistenteService()
const toast = useToast()

const actual = ref<FormatoExportacion>(props.formato)
const cambiando = ref(false)
const probando = ref<FormatoDescarga | null>(null)

const mensajeDe = (error: any, porDefecto: string) => typeof error === 'string' ? error : (error?.message ?? porDefecto)

// El modelo tarda más de un minuto: se pregunta cada unos segundos hasta que termina.
let consulta: ReturnType<typeof setInterval> | undefined

const esperarAnalisis = () => {
  clearInterval(consulta)

  consulta = setInterval(async () => {
    try {
      const estado = await $apiRest<FormatoExportacion>(apiEstiloRoutes.formato, HttpMethodEnum.GET)
      if (estado.analizando) return

      clearInterval(consulta)
      actual.value = estado

      if (estado.error) {
        toast.error({ title: 'No se pudo copiar el diseño', message: estado.error })
      } else {
        toast.success({ title: '¡Diseño copiado!', message: 'Tus descargas van a salir con este formato. Probalo con los botones de abajo.' })
      }
    } catch {
      // Un corte de red no frena la espera: se vuelve a preguntar.
    }
  }, 3000)
}

watch(() => props.formato, (formato) => {
  actual.value = formato
  if (formato.analizando) esperarAnalisis()
}, { immediate: true })

onBeforeUnmount(() => clearInterval(consulta))

const activar = async (activo: boolean) => {
  cambiando.value = true

  try {
    actual.value = await $apiRest<FormatoExportacion>(apiEstiloRoutes.formato, HttpMethodEnum.PUT, { activo })
  } catch (error: any) {
    toast.error({ title: 'No se pudo cambiar', message: mensajeDe(error, 'Probá de nuevo.') })
  } finally {
    cambiando.value = false
  }
}

const quitar = async () => {
  if (!window.confirm('¿Quitar tu formato? Tus descargas van a volver al formato de Flopi.')) return

  cambiando.value = true

  try {
    actual.value = await $apiRest<FormatoExportacion>(apiEstiloRoutes.formato, HttpMethodEnum.DELETE)
  } catch (error: any) {
    toast.error({ title: 'No se pudo quitar', message: mensajeDe(error, 'Probá de nuevo.') })
  } finally {
    cambiando.value = false
  }
}

const probar = async (tipo: FormatoDescarga) => {
  probando.value = tipo

  try {
    await descargarEjemploFormato(tipo)
  } catch (error: any) {
    toast.error({ title: 'No se pudo descargar', message: mensajeDe(error, 'Probá de nuevo.') })
  } finally {
    probando.value = null
  }
}
</script>

<template>
  <section class="rounded-2xl border-2 border-mona-100 bg-white p-5">
    <h3 class="font-display text-xl font-semibold text-mona-900">Cómo se ven tus descargas</h3>
    <p class="text-sm text-mona-800/75 mt-1">
      Flopi copia el diseño de la última planificación que subiste: la letra, los títulos, las etiquetas y sus colores,
      en texto seguido o en cuadro.
    </p>

    <p v-if="actual.analizando" class="flex items-start gap-2 text-sm text-mona-800/80 mt-4">
      <UIcon name="i-tabler-loader-2" class="w-4 h-4 mt-0.5 animate-spin flex-shrink-0" />
      <span>
        Copiando el diseño de <strong>{{ actual.archivo_pendiente }}</strong>. Tarda uno o dos minutos: podés seguir usando Flopi y volver después.
      </span>
    </p>
    <p v-else-if="actual.error" class="text-sm text-red-700 mt-4">{{ actual.error }}</p>

    <div v-if="actual.tiene_formato" class="mt-4 border-t border-mona-50 pt-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2 min-w-0">
          <UIcon :name="actual.nombre?.toLowerCase().endsWith('.pdf') ? 'i-tabler-file-type-pdf' : 'i-tabler-file-type-docx'" class="w-5 h-5 text-mona-700 flex-shrink-0" />
          <span class="truncate text-mona-900">Copiado de <strong>{{ actual.nombre }}</strong></span>
        </div>
        <label class="inline-flex items-center gap-2 text-sm font-bold text-mona-900">
          <USwitch :model-value="actual.activo" :disabled="cambiando" @update:model-value="activar" />
          {{ actual.activo ? 'Usando mi formato' : 'Usando el formato de Flopi' }}
        </label>
      </div>

      <p v-if="actual.descripcion" class="text-sm text-mona-800/80 mt-3">{{ actual.descripcion }}</p>

      <dl class="mt-3 grid gap-x-6 gap-y-1.5 sm:grid-cols-2 text-sm">
        <div v-for="detalle in actual.detalles" :key="detalle.titulo" class="min-w-0">
          <dt class="inline font-bold text-mona-900 mr-1">{{ detalle.titulo }}:</dt>
          <dd class="inline text-mona-800/80">{{ detalle.texto }}</dd>
        </div>
      </dl>

      <div class="flex flex-wrap items-center justify-between gap-2 mt-4">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="tipo in (['docx', 'pdf'] as FormatoDescarga[])"
            :key="tipo"
            type="button"
            class="boton-mona inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-sm"
            :disabled="probando !== null"
            @click="probar(tipo)"
          >
            <UIcon :name="probando === tipo ? 'i-tabler-loader-2' : 'i-tabler-download'" class="w-4 h-4" :class="{ 'animate-spin': probando === tipo }" />
            Probar en {{ tipo === 'docx' ? 'Word' : 'PDF' }}
          </button>
        </div>
        <button type="button" class="text-sm font-bold text-mona-800/70 hover:text-red-700" :disabled="cambiando" @click="quitar">
          Quitar mi formato
        </button>
      </div>

      <p class="mt-3 text-xs text-mona-800/70">
        La prueba usa tu última planificación confirmada (o una de muestra). En el PDF la letra puede cambiar por una parecida; en Word se usa la tuya.
      </p>
    </div>

    <p v-else-if="!actual.analizando" class="mt-4 text-sm text-mona-800/70">
      Todavía no hay un diseño copiado: subí una planificación arriba. Mientras tanto, tus descargas usan el formato de Flopi.
    </p>
  </section>
</template>
