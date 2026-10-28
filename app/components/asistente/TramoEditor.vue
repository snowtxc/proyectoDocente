<script setup lang="ts">
import { useAsistenteService } from '~/services/asistenteService/asistenteService'
import SelectorPrograma from '~/components/asistente/SelectorPrograma.vue'
import PropuestaVista from '~/components/asistente/PropuestaVista.vue'
import HojaDocumento from '~/components/asistente/HojaDocumento.vue'
import type { ElegidoPrograma, PasoPlan, Propuesta, PropuestaCurricular, PropuestaPresentada, Referencia, TextosAjustados } from '~/types/asistente'
import type { RecetaFormato } from '~/types/estilo'
import { estiloBloque, fechaEnPalabras, numeroRomano, textoDia } from '~/utils/recetaFormato'

// Editor de un tramo (o de uno nuevo) a pantalla completa, fuera del chat: los datos del programa,
// que se eligen de la lista oficial y se pueden redactar a gusto, la meta y el plan. Al costado (o en
// otra pestaña, en pantallas chicas) se ve el tramo en la hoja, con el diseño de las descargas.
const props = defineProps<{
  planificacionId: number
  titulo: string
  fecha: string
  // Lugar del tramo en el día (1, 2…).
  posicion: number
  grados: string[]
  receta: RecetaFormato
  // El tramo como está guardado y como se muestra. Sin ellos, es un tramo nuevo.
  propuesta?: Propuesta | null
  presentada?: PropuestaPresentada | null
  guardando?: boolean
  errores?: string[]
}>()

const emit = defineEmits<{
  (e: 'guardar', propuesta: Propuesta): void
  (e: 'cancelar'): void
}>()

const { redactarTramo } = useAsistenteService()
const toast = useToast()
const pedirConfirmacion = useConfirmacion()

const romano = numeroRomano(props.posicion)
const dia = fechaEnPalabras(props.fecha)

// En pantallas grandes la hoja va al costado (se puede ocultar); en las chicas, en otra pestaña.
const pantallaGrande = useMediaQuery('(min-width: 1280px)')
const conHoja = ref(true)
const vista = ref<'editar' | 'ver'>('editar')

const nuevo = !props.propuesta
const guardada = props.propuesta?.tipo === 'curricular' ? props.propuesta : null
const referencias = props.presentada?.tipo === 'curricular' ? props.presentada.referencias : null

const tipo = ref<'curricular' | 'libre'>(props.propuesta?.tipo ?? 'curricular')
const actividad = ref(props.propuesta?.tipo === 'libre' ? props.propuesta.actividad : '')

// ---------------------------------------------------------------- Datos del programa

const elegidos = (lista?: Referencia[]): ElegidoPrograma[] => (lista ?? []).map(r => ({ id: r.id, oficial: r.oficial ?? r.texto, texto: r.texto }))

const unidad = ref<ElegidoPrograma[]>(guardada && referencias
  ? [{
      id: guardada.unidad_curricular_id,
      oficial: referencias.unidad_curricular_oficial ?? referencias.unidad_curricular,
      texto: referencias.unidad_curricular,
      espacio: referencias.espacio_oficial ?? referencias.espacio,
      color: referencias.color,
    }]
  : [])
const espacio = ref({ oficial: referencias?.espacio_oficial ?? referencias?.espacio ?? '', texto: referencias?.espacio ?? '' })
const editandoEspacio = ref(false)
const contenidos = ref(elegidos(referencias?.contenidos))
const criterios = ref(elegidos(referencias?.criterios_logro))
const generales = ref(elegidos(referencias?.competencias_generales))
const especificas = ref(elegidos(referencias?.competencias_especificas))

const unidadId = computed(() => unidad.value[0]?.id ?? null)
const contenidoIds = computed(() => contenidos.value.map(c => c.id))

// Otra unidad curricular trae su espacio; los contenidos y lo que depende de ellos se eligen de nuevo.
watch(unidadId, (nueva, anterior) => {
  const elegida = unidad.value[0]
  espacio.value = { oficial: elegida?.espacio ?? '', texto: elegida?.espacio ?? '' }

  if (anterior !== null && nueva !== anterior) {
    contenidos.value = []
    criterios.value = []
    especificas.value = []
  }
})

// ---------------------------------------------------------------- Meta y plan

const escapar = (texto: string) => texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// Los subtítulos del plan (en multigrado, uno por grado) van como títulos del editor.
const planComoHtml = (plan: PasoPlan[]) => {
  let html = ''
  let enLista = false

  for (const paso of plan) {
    if (paso.titulo) {
      if (enLista) html += '</ul>'
      enLista = false
      html += `<h3>${escapar(paso.texto)}</h3>`
      continue
    }

    if (!enLista) html += '<ul>'
    enLista = true
    html += `<li>${escapar(paso.texto)}</li>` + paso.subpasos.map(sub => `<li class="ql-indent-1">${escapar(sub)}</li>`).join('')
  }

  return enLista ? html + '</ul>' : html
}

const metaHtml = ref(guardada?.meta_html ?? (guardada?.meta_aprendizaje ? `<p>${escapar(guardada.meta_aprendizaje)}</p>` : ''))
const planHtml = ref(guardada?.plan_html ?? (guardada?.plan?.length ? planComoHtml(guardada.plan) : ''))

const textoDe = (html: string) => {
  const caja = document.createElement('div')
  caja.innerHTML = html
  return (caja.textContent ?? '').replace(/\s+/g, ' ').trim()
}

// ---------------------------------------------------------------- Resultado

const ajustes = (lista: ElegidoPrograma[]) =>
  Object.fromEntries(lista.filter(e => e.texto.trim() !== e.oficial.trim()).map(e => [String(e.id), e.texto.trim()]))

const textos = computed<TextosAjustados>(() => {
  const resultado: TextosAjustados = {}
  const elegida = unidad.value[0]

  if (elegida && elegida.texto.trim() !== elegida.oficial.trim()) resultado.unidad_curricular = elegida.texto.trim()
  if (espacio.value.texto.trim() && espacio.value.texto.trim() !== espacio.value.oficial.trim()) resultado.espacio = espacio.value.texto.trim()

  const listas = { contenidos, criterios_logro: criterios, competencias_generales: generales, competencias_especificas: especificas }

  for (const [campo, lista] of Object.entries(listas)) {
    const ajustados = ajustes(lista.value)
    if (Object.keys(ajustados).length) resultado[campo as keyof Omit<TextosAjustados, 'espacio' | 'unidad_curricular'>] = ajustados
  }

  return resultado
})

const propuesta = computed<Propuesta>(() => {
  if (tipo.value === 'libre') return { tipo: 'libre', actividad: actividad.value.trim() }

  const curricular: PropuestaCurricular = {
    tipo: 'curricular',
    unidad_curricular_id: unidadId.value ?? 0,
    contenido_ids: contenidoIds.value,
    criterio_logro_ids: criterios.value.map(c => c.id),
    competencia_general_ids: generales.value.map(c => c.id),
    competencia_especifica_ids: especificas.value.map(c => c.id),
    // El backend saca del HTML el texto de la meta y los pasos del plan.
    meta_aprendizaje: textoDe(metaHtml.value),
    plan: guardada?.plan ?? [],
    meta_html: metaHtml.value,
    plan_html: planHtml.value,
  }

  return Object.keys(textos.value).length ? { ...curricular, textos: textos.value } : curricular
})

// El tramo como se va a ver en la hoja.
const enVivo = computed<PropuestaPresentada>(() => {
  const actual = propuesta.value

  if (actual.tipo === 'libre') return { ...actual, actividad: actual.actividad || 'Actividad', numero: romano }

  const soloTexto = (lista: ElegidoPrograma[]) => lista.map(({ id, texto }) => ({ id, texto }))

  return {
    ...actual,
    numero: romano,
    referencias: {
      espacio: espacio.value.texto || espacio.value.oficial,
      espacio_oficial: espacio.value.oficial,
      unidad_curricular: unidad.value[0]?.texto ?? '',
      unidad_curricular_oficial: unidad.value[0]?.oficial,
      color: unidad.value[0]?.color ?? '#1d2a82',
      contenidos: soloTexto(contenidos.value),
      criterios_logro: soloTexto(criterios.value),
      competencias_generales: soloTexto(generales.value),
      competencias_especificas: soloTexto(especificas.value),
    },
  }
})

// Lo que falta antes de guardar, dicho como para el docente.
const faltan = computed(() => {
  if (tipo.value === 'libre') return actividad.value.trim().length < 3 ? ['Escribí qué actividad es (por ejemplo, "Educación Física a cargo del profesor").'] : []

  const lista: string[] = []
  const meta = textoDe(metaHtml.value)

  if (!unidad.value.length) lista.push('Elegí la unidad curricular.')
  if (!contenidos.value.length) lista.push('Elegí al menos un contenido.')
  if (!meta) lista.push('Escribí la meta de aprendizaje.')
  else if (!/^los estudiantes\b/i.test(meta)) lista.push('La meta de aprendizaje tiene que empezar con "Los estudiantes".')
  if (!textoDe(planHtml.value)) lista.push('Escribí al menos un paso del plan.')

  return lista
})

const intentado = ref(false)

const guardar = () => {
  intentado.value = true

  if (faltan.value.length === 0) {
    emit('guardar', propuesta.value)
  } else {
    vista.value = 'editar'
    nextTick(() => document.querySelector('.editor-tramo .avisos')?.scrollIntoView({ behavior: 'smooth', block: 'center' }))
  }
}

// Hay cambios si se tocó algo después de abrir (el editor de texto acomoda el HTML al cargar).
const cambios = ref(false)
let listo = false
onMounted(() => setTimeout(() => (listo = true), 800))
watch(propuesta, () => { if (listo) cambios.value = true }, { deep: true })

const cancelar = async () => {
  if (cambios.value && !await pedirConfirmacion({
    titulo: nuevo ? '¿Descartar este tramo?' : '¿Descartar los cambios?',
    mensaje: nuevo ? 'Todavía no lo agregaste a la planificación.' : 'Lo que cambiaste en este tramo no se guarda.',
    aceptar: 'Descartar',
    cancelar: 'Seguir editando',
    peligro: true,
  })) return

  emit('cancelar')
}

// ---------------------------------------------------------------- Flopi redacta

const idea = ref('')
const conIdea = ref(false)
const redactando = ref(false)
const puedeRedactar = computed(() => unidad.value.length > 0 && contenidos.value.length > 0)

const mensajeDe = (error: any) => typeof error === 'string'
  ? error
  : (error?.message ?? (Object.values(error ?? {}).flat().find(v => typeof v === 'string') as string | undefined) ?? 'Probá de nuevo.')

const redactar = async () => {
  if (!puedeRedactar.value) return
  if ((textoDe(metaHtml.value) || textoDe(planHtml.value)) && !await pedirConfirmacion({
    titulo: '¿Reemplazar la meta y el plan?',
    mensaje: 'Flopi va a escribir una meta y un plan nuevos en lugar de los que hay ahora.',
    aceptar: 'Que lo redacte Flopi',
  })) return

  redactando.value = true

  try {
    const redaccion = await redactarTramo(props.planificacionId, {
      fecha: props.fecha,
      unidad_curricular_id: unidadId.value,
      contenido_ids: contenidoIds.value,
      criterio_logro_ids: criterios.value.map(c => c.id),
      competencia_general_ids: generales.value.map(c => c.id),
      competencia_especifica_ids: especificas.value.map(c => c.id),
      idea: idea.value.trim(),
    })

    metaHtml.value = `<p>${escapar(redaccion.meta_aprendizaje)}</p>`
    planHtml.value = planComoHtml(redaccion.plan)
    toast.success({ title: 'Flopi redactó el tramo', message: 'Revisalo y cambiá lo que quieras antes de guardar.' })
  } catch (error: any) {
    toast.error({ title: 'No se pudo redactar', message: mensajeDe(error) })
  } finally {
    redactando.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <div class="editor-tramo fixed inset-0 z-40 flex flex-col bg-[#f4f5fb]" role="dialog" aria-modal="true" :aria-label="nuevo ? 'Nuevo tramo' : `Editar el Tramo ${romano}`">
      <!-- Encabezado -->
      <header class="flex items-center gap-3 px-3 sm:px-6 py-3 bg-white border-b-2 border-mona-100 flex-shrink-0">
        <button type="button" class="cerrar" title="Volver a la planificación" @click="cancelar">
          <UIcon name="i-tabler-arrow-left" class="w-5 h-5" />
          <span class="sr-only">Volver a la planificación</span>
        </button>
        <div class="min-w-0 flex-1">
          <p class="text-[11px] font-extrabold uppercase tracking-wide text-mona-600 truncate">{{ titulo }} · {{ dia }}</p>
          <h2 class="font-display text-xl sm:text-2xl font-bold text-mona-900 leading-tight truncate">
            {{ nuevo ? 'Nuevo tramo' : `Editar el Tramo ${romano}` }}
          </h2>
        </div>

        <button v-if="pantallaGrande" type="button" class="boton-hoja" :aria-pressed="conHoja" @click="conHoja = !conHoja">
          <UIcon :name="conHoja ? 'i-tabler-layout-sidebar-right-collapse' : 'i-tabler-layout-sidebar-right-expand'" class="w-5 h-5" />
          {{ conHoja ? 'Ocultar la hoja' : 'Ver la hoja' }}
        </button>
        <div class="hidden sm:flex items-center gap-2">
          <UButton color="neutral" variant="ghost" size="lg" :disabled="guardando" @click="cancelar">Cancelar</UButton>
          <button
            type="button"
            class="boton-miel inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-display text-lg font-semibold"
            :disabled="guardando || redactando"
            @click="guardar"
          >
            <UIcon :name="guardando ? 'i-tabler-loader-2' : 'i-tabler-check'" class="w-5 h-5" :class="{ 'animate-spin': guardando }" />
            {{ nuevo ? 'Agregar tramo' : 'Guardar cambios' }}
          </button>
        </div>
      </header>

      <UTabs
        v-if="!pantallaGrande"
        v-model="vista"
        :items="[{ label: 'Editar', value: 'editar', icon: 'i-tabler-pencil' }, { label: 'Ver cómo queda', value: 'ver', icon: 'i-tabler-eye' }]"
        :content="false"
        class="px-3 pt-2 flex-shrink-0"
      />

      <div class="flex-1 min-h-0 flex">
        <!-- El formulario -->
        <main v-show="pantallaGrande || vista === 'editar'" class="flex-1 min-w-0 overflow-y-auto">
          <div class="max-w-[880px] mx-auto px-4 sm:px-8 py-5 sm:py-7 space-y-5">
            <div
              v-if="(errores && errores.length) || (intentado && faltan.length)"
              class="avisos rounded-2xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              <p class="font-bold mb-1">Antes de guardar:</p>
              <ul class="list-disc pl-5 space-y-0.5">
                <li v-for="(error, i) in [...new Set([...(intentado ? faltan : []), ...(errores ?? [])])]" :key="i">{{ error }}</li>
              </ul>
            </div>

            <!-- Qué tipo de tramo es (solo al armar uno nuevo) -->
            <div v-if="nuevo" class="grid sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Tipo de tramo">
              <button
                v-for="opcion in [
                  { valor: 'curricular', nombre: 'Con el programa', detalle: 'Contenidos, criterios, meta y plan', icono: 'i-tabler-book-2' },
                  { valor: 'libre', nombre: 'Otra actividad', detalle: 'Educación Física, Inglés, una salida…', icono: 'i-tabler-ball-football' },
                ] as const"
                :key="opcion.valor"
                type="button"
                role="radio"
                class="tipo"
                :class="{ elegido: tipo === opcion.valor }"
                :aria-checked="tipo === opcion.valor"
                @click="tipo = opcion.valor"
              >
                <span class="icono-tipo"><UIcon :name="opcion.icono" class="w-5 h-5" /></span>
                <span class="min-w-0 text-left">
                  <span class="block font-bold text-mona-900">{{ opcion.nombre }}</span>
                  <span class="block text-sm text-mona-800/70">{{ opcion.detalle }}</span>
                </span>
              </button>
            </div>

            <!-- Actividad sin datos del programa -->
            <section v-if="tipo === 'libre'" class="tarjeta">
              <label class="block">
                <span class="etiqueta">Actividad</span>
                <UInput v-model="actividad" size="xl" class="w-full" maxlength="300" placeholder="Educación Física a cargo del profesor" autofocus />
              </label>
              <p class="ayuda">Para las clases que no planificás vos. En la planificación sale como "Actividad: …".</p>
            </section>

            <template v-else>
              <section class="tarjeta space-y-5">
                <div>
                  <h3 class="encabezado"><UIcon name="i-tabler-book-2" class="w-5 h-5" /> Datos del programa</h3>
                  <p class="text-sm text-mona-800/70 mt-1">
                    Del programa de {{ grados.join(' y ') || 'tu grupo' }}. Con el lápiz ajustás cómo queda escrito cada uno en la planificación.
                  </p>
                </div>

                <div class="grid gap-5 md:grid-cols-2">
                  <SelectorPrograma
                    v-model="unidad"
                    titulo="Unidad curricular"
                    lista="unidades"
                    :planificacion-id="planificacionId"
                    :multiple="false"
                    vacio="Todavía no elegiste la unidad curricular."
                  />

                  <div v-if="unidad.length">
                    <p class="titulo-campo">Espacio de conocimiento</p>
                    <div class="espacio">
                      <div v-if="editandoEspacio" class="flex items-center gap-2">
                        <UInput v-model="espacio.texto" class="flex-1" maxlength="200" autofocus aria-label="Espacio de conocimiento" @keydown.enter.prevent="editandoEspacio = false" />
                        <button type="button" class="text-sm font-bold text-mona-900 hover:underline" @click="editandoEspacio = false">Listo</button>
                      </div>
                      <div v-else class="flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" :style="{ backgroundColor: unidad[0]?.color }" aria-hidden="true" />
                        <p class="flex-1 text-[0.95rem] text-mona-950">{{ espacio.texto || espacio.oficial }}</p>
                        <button type="button" class="lapiz" title="Ajustar la redacción" @click="editandoEspacio = true">
                          <UIcon name="i-tabler-pencil" class="w-4 h-4" />
                          <span class="sr-only">Ajustar la redacción del espacio</span>
                        </button>
                      </div>
                      <button
                        v-if="espacio.texto && espacio.texto !== espacio.oficial"
                        type="button"
                        class="mt-1 text-xs font-bold text-mona-700 hover:underline"
                        @click="espacio.texto = espacio.oficial"
                      >
                        Volver al texto del programa
                      </button>
                    </div>
                  </div>
                </div>

                <SelectorPrograma
                  v-model="contenidos"
                  titulo="Contenidos"
                  lista="contenidos"
                  :planificacion-id="planificacionId"
                  :filtros="{ unidad_curricular_id: unidadId }"
                  :bloqueado="unidad.length ? null : 'Elegí primero la unidad curricular.'"
                  vacio="Todavía no elegiste contenidos."
                />
                <SelectorPrograma
                  v-model="criterios"
                  titulo="Criterios de logro"
                  lista="criterios"
                  :planificacion-id="planificacionId"
                  :filtros="{ unidad_curricular_id: unidadId, contenido_ids: contenidoIds }"
                  :bloqueado="contenidos.length ? null : 'Elegí primero los contenidos.'"
                />
                <div class="grid gap-5 lg:grid-cols-2">
                  <SelectorPrograma
                    v-model="generales"
                    titulo="Competencias generales"
                    lista="competencias_generales"
                    :planificacion-id="planificacionId"
                  />
                  <SelectorPrograma
                    v-model="especificas"
                    titulo="Competencias específicas"
                    lista="competencias_especificas"
                    :planificacion-id="planificacionId"
                    :filtros="{ contenido_ids: contenidoIds }"
                    :bloqueado="contenidos.length ? null : 'Elegí primero los contenidos.'"
                  />
                </div>
              </section>

              <section class="tarjeta space-y-5">
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 class="encabezado"><UIcon name="i-tabler-pencil" class="w-5 h-5" /> Meta y plan</h3>
                    <p class="text-sm text-mona-800/70 mt-1">Escribilos vos o pedile a Flopi que los redacte con los datos del programa.</p>
                  </div>
                  <button
                    type="button"
                    class="boton-flopi"
                    :disabled="!puedeRedactar || redactando"
                    :title="puedeRedactar ? 'Flopi escribe la meta y el plan con tu estilo' : 'Elegí la unidad curricular y los contenidos'"
                    @click="redactar"
                  >
                    <UIcon :name="redactando ? 'i-tabler-loader-2' : 'i-tabler-sparkles'" class="w-4 h-4" :class="{ 'animate-spin': redactando }" />
                    {{ redactando ? 'Flopi está escribiendo…' : 'Que lo redacte Flopi' }}
                  </button>
                </div>

                <div v-if="conIdea">
                  <UTextarea v-model="idea" :rows="2" autoresize :maxrows="5" maxlength="600" class="w-full" placeholder="Por ejemplo: un juego de compras en el almacén de la escuela" aria-label="Tu idea para la clase" />
                  <p class="ayuda">Flopi arma la meta y el plan a partir de tu idea.</p>
                </div>
                <button v-else-if="puedeRedactar" type="button" class="-mt-2 text-sm font-bold text-mona-700 hover:underline" @click="conIdea = true">
                  + Contale a Flopi tu idea para la clase (opcional)
                </button>

                <div>
                  <p class="etiqueta">Meta de aprendizaje</p>
                  <AsistenteEditorTexto v-model="metaHtml" :planificacion-id="planificacionId" :alto="110" placeholder="Los estudiantes…" />
                  <p class="ayuda">Empieza con "Los estudiantes" y lleva el verbo en futuro.</p>
                </div>

                <div>
                  <p class="etiqueta">Plan de aprendizaje y desarrollo de la intervención docente</p>
                  <AsistenteEditorTexto v-model="planHtml" :planificacion-id="planificacionId" :alto="380" placeholder="Los pasos de la clase…" />
                  <p class="ayuda">Listas, negrita, títulos e imágenes, como en Word. Tocá una imagen para cambiarle el tamaño.</p>
                </div>
              </section>
            </template>
          </div>
        </main>

        <!-- El tramo en la hoja, con el diseño de las descargas -->
        <aside
          v-if="pantallaGrande ? conHoja : vista === 'ver'"
          class="vista-hoja overflow-y-auto"
          :class="pantallaGrande ? 'al-costado' : 'flex-1'"
          aria-label="Cómo queda en la hoja"
        >
          <p class="text-xs font-extrabold uppercase tracking-wide text-mona-700/80 mb-3">Así queda en la planificación</p>
          <HojaDocumento :receta="receta">
            <h3 class="titulo" :style="estiloBloque(receta.dia)">{{ textoDia(receta, fecha) }}</h3>
            <PropuestaVista :propuesta="enVivo" :receta="receta" :numero="posicion" />
          </HojaDocumento>
        </aside>
      </div>

      <!-- En el celular, los botones van abajo -->
      <footer class="sm:hidden flex items-center gap-2 px-3 py-3 bg-white border-t-2 border-mona-100 flex-shrink-0">
        <UButton color="neutral" variant="ghost" :disabled="guardando" class="flex-1 justify-center" @click="cancelar">Cancelar</UButton>
        <button
          type="button"
          class="boton-miel flex-[2] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-display font-semibold"
          :disabled="guardando || redactando"
          @click="guardar"
        >
          <UIcon :name="guardando ? 'i-tabler-loader-2' : 'i-tabler-check'" class="w-5 h-5" :class="{ 'animate-spin': guardando }" />
          {{ nuevo ? 'Agregar tramo' : 'Guardar cambios' }}
        </button>
      </footer>
    </div>
  </Teleport>
</template>

<style scoped>
.cerrar {
  width: 2.6rem;
  height: 2.6rem;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.8rem;
  color: var(--color-mona-800);
}

.cerrar:hover {
  background: var(--color-mona-50);
}

.boton-hoja {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.8rem;
  border-radius: 0.8rem;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-mona-800);
}

.boton-hoja:hover {
  background: var(--color-mona-50);
}

.tarjeta {
  padding: 1.25rem 1.4rem;
  border: 2px solid var(--color-mona-100);
  border-radius: 1.25rem;
  background: #fff;
}

.encabezado {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-mona-900);
}

.etiqueta,
.titulo-campo {
  display: block;
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--color-mona-900);
  margin-bottom: 0.35rem;
}

.ayuda {
  font-size: 0.78rem;
  color: var(--color-mona-800);
  opacity: 0.7;
  margin-top: 0.35rem;
}

.tipo {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.9rem 1rem;
  border: 2px solid var(--color-mona-100);
  border-radius: 1.1rem;
  background: #fff;
}

.tipo.elegido {
  border-color: var(--color-mona-500);
  background: var(--color-mona-50);
}

.icono-tipo {
  width: 2.5rem;
  height: 2.5rem;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.8rem;
  background: var(--color-mona-100);
  color: var(--color-mona-700);
}

.espacio {
  padding: 0.6rem 0.75rem;
  border-radius: 0.8rem;
  background: var(--color-mona-50);
}

.lapiz {
  width: 1.7rem;
  height: 1.7rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.45rem;
  color: var(--color-mona-700);
}

.lapiz:hover {
  background: #fff;
}

.boton-flopi {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.95rem;
  border-radius: 0.8rem;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-mona-900);
  background: var(--color-miel-100);
  border: 1.5px solid var(--color-miel-300);
}

.boton-flopi:hover:not(:disabled) {
  background: var(--color-miel-200);
}

.boton-flopi:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.vista-hoja {
  padding: 1.5rem;
  background: #e9e8e3;
}

.vista-hoja.al-costado {
  width: min(42vw, 660px);
  flex-shrink: 0;
  border-left: 2px solid var(--color-mona-100);
}

.titulo {
  margin: 0 0 10px 0;
}
</style>
