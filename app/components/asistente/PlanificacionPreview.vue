<script setup lang="ts">
import { useAsistenteService } from '~/services/asistenteService/asistenteService'
import type { BorradorTramo, ContenidoPlanificacion, FormatoDescarga, Planificacion, Propuesta } from '~/types/asistente'
import PropuestaEditor from '~/components/asistente/PropuestaEditor.vue'
import PropuestaVista from '~/components/asistente/PropuestaVista.vue'
import { estiloBloque, familiaDe, tamanoEnPantalla, textoDia, textoEncabezado } from '~/utils/recetaFormato'

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
const authStore = useAuthStore()

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

// El documento se ve con el diseño de sus descargas (Mi estilo), igual que el archivo.
const receta = computed(() => props.planificacion.receta)

const encabezado = computed(() => textoEncabezado(receta.value, {
  titulo: props.planificacion.titulo,
  grupo: props.planificacion.grupo.nombre ?? '',
  docente: [authStore.user?.nombre1, authStore.user?.apellido1].filter(Boolean).join(' '),
}))

// Como en el archivo, los días sin tramos no salen; mientras se arma, se ven para saber qué falta.
const diasVisibles = computed(() => confirmada.value
  ? props.planificacion.dias.filter(dia => dia.propuestas.length > 0)
  : props.planificacion.dias)

// Si cada día empieza en una hoja nueva, una hoja por día; si no, todos en la misma.
const hojas = computed(() => receta.value.dia.nueva_pagina && diasVisibles.value.length > 0
  ? diasVisibles.value.map(dia => [dia])
  : [diasVisibles.value])

const estiloHoja = computed(() => ({
  fontFamily: familiaDe(receta.value),
  fontSize: tamanoEnPantalla(receta.value.fuente.tamano),
  '--alineacion-texto': receta.value.justificado ? 'justify' : 'left',
  '--separacion-parrafos': receta.value.disposicion === 'secuencial' ? '1px' : '6px',
}))

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
  if (error.includes('actividad')) return 'El nombre de la actividad tiene que tener entre 3 y 300 letras.'
  if (error.includes('subpasos')) return 'Revisá las preguntas o ítems de los pasos: cada uno puede tener hasta 400 letras.'
  if (error.includes('plan')) return 'El plan tiene que tener al menos un paso, y cada paso un texto de hasta 700 letras.'
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

    <!-- El documento, con el diseño de sus descargas: una hoja por día si cada día empieza en una hoja nueva -->
    <div class="flex-1 overflow-y-auto px-3 sm:px-6 py-5">
      <div class="mx-auto space-y-6" :class="receta.orientacion === 'horizontal' ? 'max-w-5xl' : 'max-w-3xl'">
        <div v-for="(hoja, h) in hojas" :key="h" class="hoja" :style="estiloHoja">
          <div v-if="h === 0 && receta.encabezado.mostrar" class="titulo" :style="estiloBloque(receta.encabezado)">{{ encabezado }}</div>

          <section v-for="(dia, d) in hoja" :key="dia.fecha" :aria-label="dia.dia" :class="{ separado: d > 0 }">
            <h3 class="titulo" :style="estiloBloque(receta.dia)">{{ textoDia(receta, dia.fecha) }}</h3>

            <p
              v-if="dia.propuestas.length === 0 && borrador?.fecha !== dia.fecha"
              class="interfaz mb-4 text-center text-sm text-mona-800/60 border-2 border-dashed border-mona-200 rounded-2xl py-5"
            >
              Todavía no tiene tramos. Agregalos desde el chat.
            </p>

            <div v-for="(propuesta, i) in dia.propuestas" :key="clave(dia.fecha, i)" class="aparecer">
              <!-- Edición -->
              <div v-if="editando === clave(dia.fecha, i)" class="interfaz editor">
                <p class="px-4 sm:px-5 pt-3 font-display text-lg font-bold text-mona-900">Editando el Tramo {{ propuesta.numero }}</p>
                <PropuestaEditor
                  :planificacion-id="planificacion.id"
                  :propuesta="planificacion.contenido.dias.find(dc => dc.fecha === dia.fecha)!.propuestas[i]!"
                  :guardando="guardando"
                  :errores="errores"
                  @guardar="guardarPropuesta(dia.fecha, i, $event)"
                  @cancelar="editando = null"
                />
              </div>

              <template v-else>
                <div class="interfaz acciones">
                  <button
                    type="button"
                    class="accion"
                    :aria-label="`Editar el Tramo ${propuesta.numero} del ${dia.dia}`"
                    :disabled="ocupado || guardando || editando !== null"
                    @click="empezarEdicion(dia.fecha, i)"
                  >
                    <UIcon name="i-tabler-pencil" class="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    type="button"
                    class="accion quitar"
                    :aria-label="`Quitar el Tramo ${propuesta.numero} del ${dia.dia}`"
                    :disabled="ocupado || guardando || editando !== null"
                    @click="quitarPropuesta(dia.fecha, i, propuesta.numero)"
                  >
                    <UIcon name="i-tabler-trash" class="w-4 h-4" />
                    Quitar
                  </button>
                </div>
                <PropuestaVista :propuesta="propuesta" :receta="receta" :numero="i + 1" />
              </template>
            </div>

            <!-- Tramo redactado que todavía no se agregó: se confirma desde el chat -->
            <div v-if="borrador && borrador.fecha === dia.fecha" ref="tarjetaBorrador" class="borrador aparecer">
              <p class="interfaz acciones">
                <span class="text-xs font-extrabold uppercase tracking-wide text-miel-800 bg-miel-100 rounded-full px-2.5 py-0.5">
                  Borrador · confirmalo en el chat
                </span>
              </p>
              <PropuestaVista :propuesta="borrador.propuesta" :receta="receta" :numero="dia.propuestas.length + 1" />
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Una hoja del documento: la letra, el tamaño y los títulos salen del diseño (estiloHoja). */
.hoja {
  container-type: inline-size;
  background: #fff;
  color: #000;
  line-height: 1.3;
  padding: clamp(1rem, 6%, 3rem);
  box-shadow: 0 1px 6px rgb(0 0 0 / 0.12);
}

.titulo { margin: 0 0 10px 0; }
.separado { margin-top: 18px; }

/* Lo que no es parte del documento (botones, avisos, el formulario) va con la letra de Flopi. */
.interfaz {
  font-family: var(--font-sans);
  font-size: 1rem;
  line-height: 1.5;
  color: var(--color-mona-950);
}

.acciones {
  display: flex;
  justify-content: flex-end;
  gap: 0.25rem;
  margin-bottom: 4px;
}

.accion {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.15rem 0.55rem;
  border-radius: 0.6rem;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--color-mona-700);
}

.accion:hover:not(:disabled) {
  background: var(--color-mona-50);
  color: var(--color-mona-900);
}

.accion.quitar:hover:not(:disabled) {
  background: #fef2f2;
  color: #b91c1c;
}

.accion:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.editor {
  margin-bottom: 16px;
  border: 2px solid var(--color-mona-200);
  border-radius: 1rem;
  background: #fff;
}

/* El tramo que todavía no se agregó, con borde punteado y del mismo ancho que los otros. */
.borrador {
  margin: 0 -10px 16px;
  padding: 6px 8px 8px;
  border: 2px dashed var(--color-miel-500);
  border-radius: 0.75rem;
}

.borrador :deep(.cuadro),
.borrador :deep(.tramo-secuencial) {
  margin-bottom: 0;
}
</style>
