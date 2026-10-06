<script setup lang="ts">
import { useAsistenteService } from '~/services/asistenteService/asistenteService'
import type { BorradorTramo, ContenidoPlanificacion, FormatoDescarga, Planificacion, Propuesta } from '~/types/asistente'
import PropuestaEditor from '~/components/asistente/PropuestaEditor.vue'
import PropuestaVista from '~/components/asistente/PropuestaVista.vue'

const props = defineProps<{
  planificacion: Planificacion
  // Mientras el asistente está trabajando no se puede editar ni confirmar.
  ocupado?: boolean
  // Tramo redactado que el docente todavía no agregó al día.
  borrador?: BorradorTramo | null
}>()

const emit = defineEmits<{
  (e: 'actualizada', planificacion: Planificacion): void
  (e: 'confirmada'): void
}>()

const { guardarPlanificacion, confirmarPlanificacion, descargar } = useAsistenteService()
const toast = useToast()

const formatos = [
  { id: 'pdf', nombre: 'PDF', icono: 'i-tabler-file-type-pdf', color: 'text-red-600' },
  { id: 'docx', nombre: 'Word', icono: 'i-tabler-file-type-docx', color: 'text-mona-600' },
] as const

// Propuesta que se está editando: "fecha_indice".
const editando = ref<string | null>(null)
const guardando = ref(false)
const confirmando = ref(false)
const descargando = ref<FormatoDescarga | null>(null)
const errores = ref<string[]>([])

const confirmada = computed(() => props.planificacion.estado === 'confirmada')
const vacia = computed(() => props.planificacion.total_propuestas === 0)

const clave = (fecha: string, indice: number) => `${fecha}_${indice}`

// Cuando llega un borrador nuevo, la hoja se desplaza hasta él.
const tarjetaBorrador = ref<HTMLElement[] | HTMLElement | null>(null)

watch(() => props.borrador, async (borrador) => {
  if (!borrador) return

  await nextTick()
  const tarjeta = Array.isArray(tarjetaBorrador.value) ? tarjetaBorrador.value[0] : tarjetaBorrador.value
  tarjeta?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}, { immediate: true })

// Si el asistente cambia el documento mientras se edita, se cierra el formulario.
watch(() => props.planificacion.contenido, () => {
  if (!guardando.value) {
    editando.value = null
    errores.value = []
  }
})

const empezarEdicion = (fecha: string, indice: number) => {
  errores.value = []
  editando.value = clave(fecha, indice)
}

const guardarDocumento = async (contenido: ContenidoPlanificacion, mensaje: string) => {
  guardando.value = true
  errores.value = []

  try {
    const actualizada = await guardarPlanificacion(props.planificacion.id, contenido)
    editando.value = null
    emit('actualizada', actualizada)
    toast.success({ title: mensaje })
  } catch (e: any) {
    // El backend devuelve la lista de problemas del documento.
    errores.value = Array.isArray(e?.contenido)
      ? e.contenido.map(traducirError)
      : ['No se pudieron guardar los cambios. Probá de nuevo.']

    if (editando.value === null) {
      toast.error({ title: 'No se pudo guardar', message: errores.value[0] })
    }
  } finally {
    guardando.value = false
  }
}

const copiaDelDocumento = (): ContenidoPlanificacion => JSON.parse(JSON.stringify(props.planificacion.contenido))

const guardarPropuesta = (fecha: string, indice: number, propuesta: Propuesta) => {
  const contenido = copiaDelDocumento()
  const dia = contenido.dias.find(d => d.fecha === fecha)
  if (!dia) return

  dia.propuestas[indice] = propuesta
  guardarDocumento(contenido, 'Cambios guardados')
}

const quitarPropuesta = (fecha: string, indice: number, numero: string) => {
  if (!window.confirm(`¿Quitar el Tramo ${numero} de este día? No se puede deshacer.`)) return

  const contenido = copiaDelDocumento()
  const dia = contenido.dias.find(d => d.fecha === fecha)
  if (!dia) return

  dia.propuestas.splice(indice, 1)
  guardarDocumento(contenido, 'Tramo quitado')
}

// Pasa los errores técnicos de validación a un texto claro para el docente.
const traducirError = (error: string): string => {
  if (error.includes('meta_aprendizaje') && error.includes('Los estudiantes')) return 'La meta de aprendizaje tiene que empezar con "Los estudiantes".'
  if (error.includes('meta_aprendizaje')) return 'La meta de aprendizaje es muy corta o muy larga.'
  if (error.includes('actividad')) return 'El nombre de la actividad tiene que tener entre 3 y 200 letras.'
  if (error.includes('subpasos')) return 'Revisá las preguntas o ítems de los pasos: cada uno puede tener hasta 400 letras.'
  if (error.includes('plan')) return 'El plan tiene que tener al menos un paso, y cada paso un texto de hasta 700 letras.'
  if (error.includes('adecuaciones')) return 'Revisá las adecuaciones: hasta 10, de no más de 300 letras cada una.'
  if (error.includes('recursos')) return 'Revisá los recursos: hasta 15, de no más de 200 letras cada uno.'
  if (error.includes('datos del programa')) return 'No se pueden cambiar los datos del programa de un tramo.'
  return 'Revisá los datos del tramo.'
}

const confirmar = async () => {
  confirmando.value = true
  try {
    await confirmarPlanificacion(props.planificacion.id)
    emit('confirmada')
  } catch (message: any) {
    toast.error({ title: 'No se pudo confirmar', message: String(message) })
  } finally {
    confirmando.value = false
  }
}

const bajar = async (formato: FormatoDescarga) => {
  descargando.value = formato
  try {
    await descargar(props.planificacion, formato)
  } catch (e: any) {
    toast.error({ title: 'No se pudo descargar', message: e?.message ?? '' })
  } finally {
    descargando.value = null
  }
}

</script>

<template>
  <div class="flex flex-col h-full bg-mona-50/60">
    <!-- Encabezado y acciones -->
    <div class="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-white/80 backdrop-blur border-b-2 border-miel-200">
      <div class="flex items-center gap-2.5 min-w-0">
        <span class="w-10 h-10 flex-shrink-0 rounded-xl bg-mona-100 text-mona-700 flex items-center justify-center">
          <UIcon name="i-tabler-notebook" class="w-5 h-5" />
        </span>
        <div class="min-w-0">
          <h2 class="font-display text-xl font-bold text-mona-900 leading-tight truncate">{{ planificacion.titulo }}</h2>
          <p class="text-xs font-bold truncate" :class="confirmada ? 'text-emerald-700' : 'text-miel-700'">
            {{ planificacion.grupo.nombre }} ·
            {{ confirmada ? 'Confirmada, lista para descargar' : 'Borrador, todavía la podés cambiar' }}
          </p>
        </div>
      </div>

      <button
        v-if="!confirmada"
        type="button"
        class="boton-miel inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-display font-semibold flex-shrink-0"
        :disabled="ocupado || confirmando || vacia || editando !== null || !!borrador"
        :title="vacia ? 'Agregá al menos un tramo' : undefined"
        @click="confirmar"
      >
        <UIcon :name="confirmando ? 'i-tabler-loader-2' : 'i-tabler-check'" class="w-5 h-5" :class="{ 'animate-spin': confirmando }" />
        Confirmar
      </button>
    </div>

    <!-- Descargas -->
    <div v-if="confirmada" class="flex items-center gap-2.5 flex-wrap px-4 sm:px-6 py-3 bg-miel-100 border-b-2 border-miel-200">
      <span class="font-display text-base font-semibold text-mona-900 mr-1">Descargala:</span>
      <button
        v-for="formato in formatos"
        :key="formato.id"
        type="button"
        class="boton-mona inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold"
        :disabled="descargando !== null"
        @click="bajar(formato.id)"
      >
        <UIcon
          :name="descargando === formato.id ? 'i-tabler-loader-2' : formato.icono"
          class="w-5 h-5"
          :class="[formato.color, { 'animate-spin': descargando === formato.id }]"
        />
        {{ formato.nombre }}
      </button>
    </div>

    <!-- El documento: un bloque por día, un cuadro por tramo -->
    <div class="flex-1 overflow-y-auto px-3 sm:px-6 py-5">
      <div class="max-w-3xl mx-auto space-y-8">
        <section v-for="dia in planificacion.dias" :key="dia.fecha" :aria-label="dia.dia">
          <h3 class="font-display text-2xl font-bold text-mona-900 text-center tracking-wide">
            {{ dia.encabezado }}
          </h3>
          <p v-if="dia.propuestas.length > 0" class="text-center text-xs font-extrabold uppercase tracking-wide text-mona-700 mt-0.5">
            {{ dia.propuestas.length }} {{ dia.propuestas.length === 1 ? 'tramo' : 'tramos' }}
          </p>

          <p
            v-if="dia.propuestas.length === 0"
            class="mt-3 text-center text-sm text-mona-800/60 border-2 border-dashed border-mona-200 rounded-2xl py-5"
          >
            Todavía no tiene tramos. Agregalos desde el chat.
          </p>

          <article
            v-for="(propuesta, i) in dia.propuestas"
            :key="clave(dia.fecha, i)"
            class="propuesta aparecer mt-4 bg-white rounded-2xl border-2 border-mona-200 overflow-hidden"
          >
            <header class="flex items-center justify-between gap-2 px-4 py-2 bg-mona-50 border-b-2 border-mona-200">
              <span class="w-16" />
              <h4 class="font-display text-lg font-bold italic text-mona-900">TRAMO {{ propuesta.numero }}</h4>
              <div class="w-16 flex justify-end gap-0.5">
                <UButton
                  icon="i-tabler-pencil"
                  color="neutral"
                  variant="ghost"
                  size="sm"
                  :aria-label="`Editar el Tramo ${propuesta.numero} del ${dia.dia}`"
                  :disabled="ocupado || guardando || editando !== null"
                  @click="empezarEdicion(dia.fecha, i)"
                />
                <UButton
                  icon="i-tabler-trash"
                  color="neutral"
                  variant="ghost"
                  size="sm"
                  :aria-label="`Quitar el Tramo ${propuesta.numero} del ${dia.dia}`"
                  :disabled="ocupado || guardando || editando !== null"
                  @click="quitarPropuesta(dia.fecha, i, propuesta.numero)"
                />
              </div>
            </header>

            <!-- Edición -->
            <PropuestaEditor
              v-if="editando === clave(dia.fecha, i)"
              :propuesta="planificacion.contenido.dias.find(d => d.fecha === dia.fecha)!.propuestas[i]!"
              :guardando="guardando"
              :errores="errores"
              @guardar="guardarPropuesta(dia.fecha, i, $event)"
              @cancelar="editando = null"
            />

            <PropuestaVista v-else :propuesta="propuesta" />
          </article>

          <!-- Tramo redactado que todavía no se agregó: se confirma desde el chat -->
          <article
            v-if="borrador && borrador.fecha === dia.fecha"
            ref="tarjetaBorrador"
            class="aparecer mt-4 bg-white rounded-2xl border-2 border-dashed border-miel-500 overflow-hidden"
          >
            <header class="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2 bg-miel-100 border-b-2 border-dashed border-miel-500">
              <h4 class="font-display text-lg font-bold italic text-mona-900">TRAMO {{ borrador.propuesta.numero }}</h4>
              <span class="text-xs font-extrabold uppercase tracking-wide text-miel-800 bg-white rounded-full px-2.5 py-0.5">
                Borrador · confirmalo en el chat
              </span>
            </header>
            <PropuestaVista :propuesta="borrador.propuesta" />
          </article>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.propuesta {
  box-shadow: 0 5px 0 0 var(--color-mona-100);
}
</style>
