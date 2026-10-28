<script setup lang="ts">
import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum'
import { apiEstiloRoutes } from '~/utils/apiRoutes'
import { appRoutes } from '~/utils/appRoutes'
import { useAsistenteService } from '~/services/asistenteService/asistenteService'
import type { FormatoExportacion, UsoFormato } from '~/types/estilo'
import type { FormatoDescarga } from '~/types/asistente'

// Formato de las descargas: el de Flopi, el que Flopi copia de la última planificación que subió
// el docente o el que diseñó en el editor. El docente elige cuál usan sus descargas.
const props = defineProps<{ formato: FormatoExportacion }>()

const { $apiRest } = useNuxtApp()
const { descargarEjemploFormato } = useAsistenteService()
const toast = useToast()

const actual = ref<FormatoExportacion>(props.formato)
const cambiando = ref(false)
const probando = ref<FormatoDescarga | null>(null)

const mensajeDe = (error: any, porDefecto: string) => typeof error === 'string' ? error : (error?.message ?? porDefecto)

// La copia tarda más de un minuto: se pregunta cada unos segundos hasta que termina.
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
      } else if (estado.en_uso === 'disenado') {
        toast.success({ title: 'Diseño copiado', message: 'Tus descargas siguen con el formato que diseñaste. Si querés usar el copiado, elegilo abajo.' })
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

const cambiar = async (accion: () => Promise<FormatoExportacion>, error: string) => {
  cambiando.value = true

  try {
    actual.value = await accion()
  } catch (e: any) {
    toast.error({ title: error, message: mensajeDe(e, 'Probá de nuevo.') })
  } finally {
    cambiando.value = false
  }
}

const usar = (cual: UsoFormato) => {
  if (cual === actual.value.en_uso) return
  cambiar(() => $apiRest<FormatoExportacion>(apiEstiloRoutes.formato, HttpMethodEnum.PUT, { usar: cual }), 'No se pudo cambiar')
}

const quitarCopiado = () => {
  if (!window.confirm('¿Quitar el formato copiado? Si lo estás usando, tus descargas vuelven al formato de Flopi.')) return
  cambiar(() => $apiRest<FormatoExportacion>(apiEstiloRoutes.formato, HttpMethodEnum.DELETE), 'No se pudo quitar')
}

const borrarDiseno = () => {
  if (!window.confirm('¿Borrar tu diseño? Si lo estás usando, tus descargas vuelven al formato de Flopi.')) return
  cambiar(() => $apiRest<FormatoExportacion>(apiEstiloRoutes.formatoDiseno, HttpMethodEnum.DELETE), 'No se pudo borrar')
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

const detallesEnUso = computed(() => actual.value[actual.value.en_uso]?.detalles ?? [])
</script>

<template>
  <section class="rounded-2xl border-2 border-mona-100 bg-white p-5">
    <h3 class="font-display text-xl font-semibold text-mona-900">Cómo se ven tus descargas</h3>
    <p class="text-sm text-mona-800/75 mt-1">Elegí con qué formato se descargan tus planificaciones en Word y en PDF.</p>

    <div class="mt-4 grid gap-2.5" role="radiogroup" aria-label="Formato de las descargas">
      <!-- El de Flopi -->
      <div class="opcion" :class="{ elegida: actual.en_uso === 'flopi' }">
        <button type="button" role="radio" class="eleccion" :aria-checked="actual.en_uso === 'flopi'" :disabled="cambiando" @click="usar('flopi')">
          <span class="punto" aria-hidden="true" />
          <span class="min-w-0">
            <span class="block font-bold text-mona-900">Formato de Flopi</span>
            <span class="block text-sm text-mona-800/75">Un cuadro por tramo con los datos del programa arriba y la meta y el plan abajo.</span>
          </span>
        </button>
      </div>

      <!-- El copiado de su planificación -->
      <div class="opcion" :class="{ elegida: actual.en_uso === 'copiado', apagada: !actual.copiado }">
        <button type="button" role="radio" class="eleccion" :aria-checked="actual.en_uso === 'copiado'" :disabled="cambiando || !actual.copiado" @click="usar('copiado')">
          <span class="punto" aria-hidden="true" />
          <span class="min-w-0">
            <span class="block font-bold text-mona-900">Copiado de tu planificación</span>
            <span v-if="actual.copiado" class="block text-sm text-mona-800/75">
              De <strong>{{ actual.copiado.nombre }}</strong>.
              {{ actual.copiado.descripcion }}
            </span>
            <span v-else-if="!actual.analizando" class="block text-sm text-mona-800/75">
              Subí una planificación arriba y Flopi copia su diseño: la letra, los títulos, las etiquetas y sus colores.
            </span>
          </span>
        </button>
        <p v-if="actual.analizando" class="flex items-start gap-2 text-sm text-mona-800/80 mt-2 ml-8">
          <UIcon name="i-tabler-loader-2" class="w-4 h-4 mt-0.5 animate-spin flex-shrink-0" />
          <span>
            Copiando el diseño de <strong>{{ actual.archivo_pendiente }}</strong>. Tarda uno o dos minutos: podés seguir usando Flopi y volver después.
          </span>
        </p>
        <p v-else-if="actual.error" class="text-sm text-red-700 mt-2 ml-8">{{ actual.error }}</p>
        <div v-if="actual.copiado" class="mt-2 ml-8">
          <button type="button" class="text-sm font-bold text-mona-800/70 hover:text-red-700" :disabled="cambiando" @click="quitarCopiado">
            Quitar
          </button>
        </div>
      </div>

      <!-- El que diseñó en el editor -->
      <div class="opcion" :class="{ elegida: actual.en_uso === 'disenado' }">
        <button
          v-if="actual.disenado"
          type="button"
          role="radio"
          class="eleccion"
          :aria-checked="actual.en_uso === 'disenado'"
          :disabled="cambiando"
          @click="usar('disenado')"
        >
          <span class="punto" aria-hidden="true" />
          <span class="min-w-0">
            <span class="block font-bold text-mona-900">Diseñado por vos</span>
            <span class="block text-sm text-mona-800/75">Lo armaste en el editor: dónde va cada campo, la letra, los títulos y los colores.</span>
          </span>
        </button>
        <div v-else class="eleccion cursor-default">
          <UIcon name="i-tabler-layout-dashboard" class="w-5 h-5 mt-0.5 text-mona-600 flex-shrink-0" />
          <span class="min-w-0">
            <span class="block font-bold text-mona-900">Diseñá tu propio formato</span>
            <span class="block text-sm text-mona-800/75">
              Ubicá los campos de cada tramo como quieras y elegí la letra, los títulos y los colores, mirando cómo queda.
            </span>
          </span>
        </div>
        <div class="flex flex-wrap items-center gap-3 mt-3 ml-8">
          <NuxtLink
            :to="appRoutes.disenarFormato()"
            class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-sm"
            :class="actual.disenado ? 'boton-mona' : 'boton-miel'"
          >
            <UIcon :name="actual.disenado ? 'i-tabler-pencil' : 'i-tabler-sparkles'" class="w-4 h-4" />
            {{ actual.disenado ? 'Editar mi diseño' : 'Diseñar mi formato' }}
          </NuxtLink>
          <button v-if="actual.disenado" type="button" class="text-sm font-bold text-mona-800/70 hover:text-red-700" :disabled="cambiando" @click="borrarDiseno">
            Borrar
          </button>
        </div>
      </div>
    </div>

    <div class="mt-5 border-t border-mona-50 pt-4">
      <dl class="grid gap-x-6 gap-y-1.5 sm:grid-cols-2 text-sm">
        <div v-for="detalle in detallesEnUso" :key="detalle.titulo" class="min-w-0">
          <dt class="inline font-bold text-mona-900 mr-1">{{ detalle.titulo }}:</dt>
          <dd class="inline text-mona-800/80">{{ detalle.texto }}</dd>
        </div>
      </dl>

      <div class="flex flex-wrap gap-2 mt-4">
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

      <p class="mt-3 text-xs text-mona-800/70">
        La prueba usa el formato elegido y tu última planificación confirmada (o una de muestra). En el PDF la letra puede cambiar por una parecida; en Word se usa la tuya.
      </p>
    </div>
  </section>
</template>

<style scoped>
.opcion {
  border: 2px solid var(--color-mona-100);
  border-radius: 1rem;
  padding: 0.85rem 1rem;
  transition: border-color 0.15s ease, background-color 0.15s ease;
}

.opcion.elegida {
  border-color: var(--color-mona-500);
  background: var(--color-mona-50);
}

.eleccion {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  width: 100%;
  text-align: left;
}

.opcion.apagada .eleccion {
  cursor: default;
}

.punto {
  width: 1.15rem;
  height: 1.15rem;
  margin-top: 0.15rem;
  flex-shrink: 0;
  border-radius: 9999px;
  border: 2px solid var(--color-mona-300);
  background: #fff;
}

.opcion.elegida .punto {
  border-color: var(--color-mona-600);
  background: radial-gradient(circle, var(--color-mona-600) 0 40%, #fff 45%);
}

.opcion.apagada .punto {
  opacity: 0.4;
}
</style>
