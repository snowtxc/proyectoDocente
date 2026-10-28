<script setup lang="ts">
import { useAsistenteService } from '~/services/asistenteService/asistenteService'
import { parseDate, type CalendarDate } from '@internationalized/date'
import type { BorradorTramo, ContenidoPlanificacion, DiaPresentado, FormatoDescarga, Planificacion, Propuesta } from '~/types/asistente'
import HojaDocumento from '~/components/asistente/HojaDocumento.vue'
import PropuestaVista from '~/components/asistente/PropuestaVista.vue'
import TramoEditor from '~/components/asistente/TramoEditor.vue'
import { estiloBloque, fechaEnPalabras, textoDia, textoEncabezado } from '~/utils/recetaFormato'

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
const pedirConfirmacion = useConfirmacion()

const formatos = [
  { id: 'pdf', nombre: 'PDF', icono: 'i-tabler-file-type-pdf', color: 'text-red-600' },
  { id: 'docx', nombre: 'Word', icono: 'i-tabler-file-type-docx', color: 'text-mona-600' },
] as const

const MAX_DIAS = 15
const MAX_TRAMOS_POR_DIA = 12

// Tramo que se edita a pantalla completa (indice) o que se arma (indice null).
const edicion = ref<{ fecha: string, indice: number | null } | null>(null)
const guardando = ref(false)
const confirmando = ref(false)
const descargando = ref<FormatoDescarga | null>(null)
const errores = ref<string[]>([])

const confirmada = computed(() => props.planificacion.estado === 'confirmada')
const vacia = computed(() => props.planificacion.total_propuestas === 0)
const bloqueado = computed(() => !!props.ocupado || guardando.value || edicion.value !== null)

const clave = (fecha: string, indice: number) => `${fecha}_${indice}`

// El documento se ve con el diseño de sus descargas (Mi estilo), igual que el archivo.
const receta = computed(() => props.planificacion.receta)

const encabezado = computed(() => textoEncabezado(receta.value, {
  titulo: props.planificacion.titulo,
  grupo: props.planificacion.grupo.nombre ?? '',
  docente: [authStore.user?.nombre1, authStore.user?.apellido1].filter(Boolean).join(' '),
}))

// Si cada día empieza en una hoja nueva, una hoja por día; si no, todos en la misma. Los días sin
// tramos se ven (con un aviso) para poder completarlos, aunque en el archivo no salen.
const hojas = computed(() => receta.value.dia.nueva_pagina && props.planificacion.dias.length > 0
  ? props.planificacion.dias.map(dia => [dia])
  : [props.planificacion.dias])


// Cuando llega un borrador nuevo, la hoja se desplaza hasta él.
const tarjetaBorrador = ref<HTMLElement[] | HTMLElement | null>(null)

watch(() => props.borrador, async (borrador) => {
  if (!borrador) return

  await nextTick()
  const tarjeta = Array.isArray(tarjetaBorrador.value) ? tarjetaBorrador.value[0] : tarjetaBorrador.value
  tarjeta?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}, { immediate: true })

// Si el asistente cambia el documento mientras se edita, se cierra el editor.
watch(() => props.planificacion.contenido, () => {
  if (!guardando.value) cerrarEdicion()
})

const abrirEdicion = (fecha: string, indice: number | null) => {
  errores.value = []
  edicion.value = { fecha, indice }
}

const cerrarEdicion = () => {
  edicion.value = null
  errores.value = []
}

const diaDeEdicion = computed(() => props.planificacion.dias.find(dia => dia.fecha === edicion.value?.fecha) ?? null)

const guardarDocumento = async (contenido: ContenidoPlanificacion, mensaje: string): Promise<boolean> => {
  guardando.value = true
  errores.value = []

  try {
    const actualizada = await guardarPlanificacion(props.planificacion.id, contenido)
    cerrarEdicion()
    emit('actualizada', actualizada)
    toast.success({ title: mensaje })
    return true
  } catch (e: any) {
    // El backend devuelve la lista de problemas del documento.
    errores.value = Array.isArray(e?.contenido)
      ? e.contenido.map(traducirError)
      : ['No se pudieron guardar los cambios. Probá de nuevo.']

    if (edicion.value === null) {
      toast.error({ title: 'No se pudo guardar', message: errores.value[0] })
    }
    return false
  } finally {
    guardando.value = false
  }
}

const copiaDelDocumento = (): ContenidoPlanificacion => JSON.parse(JSON.stringify(props.planificacion.contenido))

// Las fechas de la planificación van del primer al último día.
const acomodarFechas = (contenido: ContenidoPlanificacion) => {
  contenido.dias.sort((a, b) => a.fecha.localeCompare(b.fecha))
  contenido.fecha_desde = contenido.dias[0]?.fecha ?? contenido.fecha_desde
  contenido.fecha_hasta = contenido.dias.at(-1)?.fecha ?? contenido.fecha_hasta
}

const guardarTramo = (propuesta: Propuesta) => {
  const actual = edicion.value
  if (!actual) return

  const contenido = copiaDelDocumento()
  const dia = contenido.dias.find(d => d.fecha === actual.fecha)
  if (!dia) return

  if (actual.indice === null) dia.propuestas.push(propuesta)
  else dia.propuestas[actual.indice] = propuesta

  guardarDocumento(contenido, actual.indice === null ? 'Tramo agregado' : 'Cambios guardados')
}

const quitarPropuesta = async (fecha: string, indice: number, numero: string) => {
  if (!await pedirConfirmacion({ titulo: `¿Quitar el Tramo ${numero}?`, mensaje: `Se quita del ${fechaEnPalabras(fecha).toLowerCase()}. No se puede deshacer.`, aceptar: 'Quitar', peligro: true })) return

  const contenido = copiaDelDocumento()
  const dia = contenido.dias.find(d => d.fecha === fecha)
  if (!dia) return

  dia.propuestas.splice(indice, 1)
  guardarDocumento(contenido, 'Tramo quitado')
}

// ---------------------------------------------------------------- Días

const agregandoDia = ref(false)
const nuevaFecha = ref('')
const errorDia = ref('')
const calendarioAbierto = ref(false)

// El calendario trabaja con fechas de @internationalized/date; la planificación, con "YYYY-MM-DD".
const fechaCalendario = computed<CalendarDate | undefined>({
  get: () => nuevaFecha.value ? parseDate(nuevaFecha.value) : undefined,
  set: (valor) => {
    nuevaFecha.value = valor ? valor.toString() : ''
    calendarioAbierto.value = false
  },
})

// Los días que ya están en la planificación no se pueden elegir.
const diaOcupado = (fecha: { toString: () => string }) => props.planificacion.dias.some(dia => dia.fecha === fecha.toString())

// Propone el día de clase que sigue al último (sin sábados ni domingos).
const siguienteDiaDeClase = () => {
  const ultimo = props.planificacion.dias.at(-1)?.fecha ?? props.planificacion.contenido.fecha_hasta
  const [anio = 2026, mes = 1, numero = 1] = ultimo.split('-').map(Number)
  const dia = new Date(anio, mes - 1, numero)

  do dia.setDate(dia.getDate() + 1)
  while (dia.getDay() === 0 || dia.getDay() === 6)

  return `${dia.getFullYear()}-${String(dia.getMonth() + 1).padStart(2, '0')}-${String(dia.getDate()).padStart(2, '0')}`
}

const empezarDia = () => {
  errorDia.value = ''
  nuevaFecha.value = siguienteDiaDeClase()
  agregandoDia.value = true
}

const agregarDia = async () => {
  const fecha = nuevaFecha.value
  errorDia.value = ''

  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    errorDia.value = 'Elegí una fecha.'
    return
  }

  const contenido = copiaDelDocumento()

  if (contenido.dias.some(dia => dia.fecha === fecha)) {
    errorDia.value = 'Ese día ya está en la planificación.'
    return
  }

  if (contenido.dias.length >= MAX_DIAS) {
    errorDia.value = `Una planificación puede tener hasta ${MAX_DIAS} días.`
    return
  }

  contenido.dias.push({ fecha, propuestas: [] })
  acomodarFechas(contenido)

  if (await guardarDocumento(contenido, 'Día agregado')) {
    agregandoDia.value = false
    // Lo que sigue es armar el primer tramo del día.
    await nextTick()
    abrirEdicion(fecha, null)
  }
}

const quitarDia = async (dia: DiaPresentado) => {
  if (!await pedirConfirmacion({ titulo: `¿Quitar el ${dia.dia}?`, mensaje: 'El día sale de la planificación.', aceptar: 'Quitar el día', peligro: true })) return

  const contenido = copiaDelDocumento()
  contenido.dias = contenido.dias.filter(d => d.fecha !== dia.fecha)
  acomodarFechas(contenido)
  guardarDocumento(contenido, 'Día quitado')
}

// Pasa los errores técnicos de validación a un texto claro para el docente.
const traducirError = (error: string): string => {
  if (error.includes('meta_aprendizaje') && error.includes('Los estudiantes')) return 'La meta de aprendizaje tiene que empezar con "Los estudiantes".'
  if (error.includes('meta_aprendizaje')) return 'La meta de aprendizaje es muy corta o muy larga.'
  if (error.includes('actividad')) return 'El nombre de la actividad tiene que tener entre 3 y 300 letras.'
  if (error.includes('contenido_ids') && error.includes('al menos')) return 'Elegí al menos un contenido.'
  if (error.includes('unidad_curricular_id')) return 'Elegí una unidad curricular del grado del grupo.'
  if (error.includes('IDs que no existen')) return 'Hay datos del programa que no son de los grados del grupo.'
  if (error.includes('fuera del rango') || error.includes('repetida')) return 'Revisá las fechas de los días.'
  if (error.startsWith('dias debe tener')) return `Una planificación puede tener hasta ${MAX_DIAS} días.`
  if (error.includes('propuestas debe ser una lista')) return `Un día puede tener hasta ${MAX_TRAMOS_POR_DIA} tramos.`
  if (error.includes('subpasos')) return 'Revisá las preguntas o ítems de los pasos: cada uno puede tener hasta 400 letras.'
  if (error.includes('plan')) return 'El plan tiene que tener al menos un paso, y cada paso un texto de hasta 700 letras.'
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
        :disabled="ocupado || confirmando || vacia || edicion !== null || !!borrador"
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

    <div class="flex-1 min-h-0 flex relative">
      <!-- El documento, con el diseño de sus descargas: una hoja por día si cada día empieza en una hoja nueva -->
      <div class="flex-1 min-w-0 overflow-y-auto px-3 sm:px-6 py-5">
        <div class="mx-auto space-y-6" :class="receta.orientacion === 'horizontal' ? 'max-w-5xl' : 'max-w-3xl'">
          <HojaDocumento v-for="(hoja, h) in hojas" :key="h" :receta="receta">
            <div v-if="h === 0 && receta.encabezado.mostrar" class="titulo" :style="estiloBloque(receta.encabezado)">{{ encabezado }}</div>

            <section v-for="(dia, d) in hoja" :key="dia.fecha" :aria-label="dia.dia" :class="{ separado: d > 0 }">
              <h3 class="titulo" :style="estiloBloque(receta.dia)">{{ textoDia(receta, dia.fecha) }}</h3>

              <!-- Día sin tramos: no sale en el archivo hasta que tenga alguno -->
              <div
                v-if="dia.propuestas.length === 0 && borrador?.fecha !== dia.fecha"
                class="interfaz dia-vacio"
              >
                <p class="text-sm text-mona-800/70">
                  {{ confirmada ? 'Este día todavía no tiene tramos: no sale en la descarga.' : 'Este día todavía no tiene tramos.' }}
                </p>
                <div class="flex flex-wrap items-center justify-center gap-2 mt-2">
                  <button type="button" class="boton-agregar" :disabled="bloqueado" @click="abrirEdicion(dia.fecha, null)">
                    <UIcon name="i-tabler-plus" class="w-4 h-4" /> Agregar tramo
                  </button>
                  <button
                    v-if="planificacion.dias.length > 1"
                    type="button"
                    class="accion quitar"
                    :disabled="bloqueado"
                    @click="quitarDia(dia)"
                  >
                    <UIcon name="i-tabler-calendar-minus" class="w-4 h-4" /> Quitar día
                  </button>
                </div>
              </div>

              <div v-for="(propuesta, i) in dia.propuestas" :key="clave(dia.fecha, i)" class="aparecer">
                <div class="interfaz acciones">
                  <button
                    type="button"
                    class="accion"
                    :aria-label="`Editar el Tramo ${propuesta.numero} del ${dia.dia}`"
                    :disabled="bloqueado"
                    @click="abrirEdicion(dia.fecha, i)"
                  >
                    <UIcon name="i-tabler-pencil" class="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    type="button"
                    class="accion quitar"
                    :aria-label="`Quitar el Tramo ${propuesta.numero} del ${dia.dia}`"
                    :disabled="bloqueado"
                    @click="quitarPropuesta(dia.fecha, i, propuesta.numero)"
                  >
                    <UIcon name="i-tabler-trash" class="w-4 h-4" />
                    Quitar
                  </button>
                </div>
                <PropuestaVista :propuesta="propuesta" :receta="receta" :numero="i + 1" />
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

              <div
                v-if="dia.propuestas.length > 0 && dia.propuestas.length < MAX_TRAMOS_POR_DIA"
                class="interfaz mas-tramos"
              >
                <button type="button" class="boton-agregar" :disabled="bloqueado || !!borrador" @click="abrirEdicion(dia.fecha, null)">
                  <UIcon name="i-tabler-plus" class="w-4 h-4" /> Agregar tramo
                </button>
              </div>
            </section>
          </HojaDocumento>

          <!-- Otro día para la planificación -->
          <div class="interfaz agregar-dia">
            <button v-if="!agregandoDia" type="button" class="boton-dia" :disabled="bloqueado || planificacion.dias.length >= MAX_DIAS" @click="empezarDia">
              <UIcon name="i-tabler-calendar-plus" class="w-5 h-5" />
              Agregar un día
            </button>
            <form v-else class="flex flex-wrap items-center justify-center gap-2" @submit.prevent="agregarDia">
              <span class="text-sm font-bold text-mona-900">Día</span>
              <UPopover v-model:open="calendarioAbierto" :content="{ side: 'top', align: 'center' }">
                <button type="button" class="fecha" aria-label="Elegir el día">
                  <UIcon name="i-tabler-calendar" class="w-5 h-5 text-mona-600" />
                  {{ nuevaFecha ? fechaEnPalabras(nuevaFecha) : 'Elegí el día' }}
                  <UIcon name="i-tabler-chevron-down" class="w-4 h-4 text-mona-500" />
                </button>
                <template #content>
                  <UCalendar v-model="fechaCalendario" :week-starts-on="1" :is-date-unavailable="diaOcupado" class="p-2" />
                </template>
              </UPopover>
              <button type="submit" class="boton-miel inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-display font-semibold" :disabled="guardando">
                <UIcon :name="guardando ? 'i-tabler-loader-2' : 'i-tabler-check'" class="w-5 h-5" :class="{ 'animate-spin': guardando }" />
                Agregar
              </button>
              <UButton color="neutral" variant="ghost" :disabled="guardando" @click="agregandoDia = false">Cancelar</UButton>
            </form>
            <p v-if="errorDia" class="text-sm text-red-700 mt-2">{{ errorDia }}</p>
            <p v-else-if="agregandoDia" class="text-xs text-mona-800/70 mt-2">Si queda fuera de las fechas, la planificación se extiende hasta ese día.</p>
          </div>
        </div>
      </div>

      <!-- Editor de un tramo, a pantalla completa -->
      <TramoEditor
        v-if="edicion && diaDeEdicion"
        :key="`${edicion.fecha}_${edicion.indice ?? 'nuevo'}`"
        :planificacion-id="planificacion.id"
        :titulo="planificacion.titulo"
        :fecha="edicion.fecha"
        :posicion="edicion.indice === null ? diaDeEdicion.propuestas.length + 1 : edicion.indice + 1"
        :grados="planificacion.grupo.grados"
        :receta="receta"
        :propuesta="edicion.indice === null ? null : planificacion.contenido.dias.find(dc => dc.fecha === edicion!.fecha)?.propuestas[edicion.indice] ?? null"
        :presentada="edicion.indice === null ? null : diaDeEdicion.propuestas[edicion.indice] ?? null"
        :guardando="guardando"
        :errores="errores"
        @guardar="guardarTramo"
        @cancelar="cerrarEdicion"
      />
    </div>
  </div>
</template>

<style scoped>

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




.boton-agregar {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.35rem 0.8rem;
  border: 1.5px dashed var(--color-mona-300);
  border-radius: 0.7rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-mona-700);
}

.boton-agregar:hover:not(:disabled) {
  border-style: solid;
  background: var(--color-mona-50);
  color: var(--color-mona-900);
}

.boton-agregar:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.mas-tramos {
  display: flex;
  justify-content: center;
  margin: -4px 0 14px;
}

.dia-vacio {
  margin-bottom: 16px;
  padding: 1rem;
  border: 2px dashed var(--color-mona-200);
  border-radius: 1rem;
  text-align: center;
}

.agregar-dia {
  text-align: center;
  padding-bottom: 1rem;
}

.boton-dia {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.7rem 1.2rem;
  border: 2px dashed var(--color-mona-300);
  border-radius: 1rem;
  font-weight: 700;
  color: var(--color-mona-800);
  background: rgb(255 255 255 / 0.6);
}

.boton-dia:hover:not(:disabled) {
  border-style: solid;
  background: #fff;
  color: var(--color-mona-900);
}

.boton-dia:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.fecha {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 15rem;
  padding: 0.5rem 0.8rem;
  border: 2px solid var(--color-mona-200);
  border-radius: 0.8rem;
  background: #fff;
  color: var(--color-mona-950);
  font-weight: 700;
}

.fecha:hover {
  border-color: var(--color-mona-400);
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
