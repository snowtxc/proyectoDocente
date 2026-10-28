<script setup lang="ts">
import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum'
import { apiAuthRoutes, apiEstiloRoutes } from '~/utils/apiRoutes'
import { appRoutes } from '~/utils/appRoutes'
import { useAsistenteService } from '~/services/asistenteService/asistenteService'
import type { FormatoDescarga } from '~/types/asistente'
import type { CampoTramo, DisenoFormato, Disposicion, RecetaFormato } from '~/types/estilo'

// Editor del formato de descarga: el docente arma su diseño (dónde va cada campo, la letra, los
// títulos y los colores) mirando cómo queda. Se guarda como una receta, igual que el formato
// copiado, y el backend la limpia antes de usarla (RecetaFormato::normalizar).
useSeoMeta({ title: 'Diseñá tu formato · Flopi Docentes' })

const { $apiRest } = useNuxtApp()
const { descargarEjemploDiseno } = useAsistenteService()
const toast = useToast()
const pedirConfirmacion = useConfirmacion()
const authStore = useAuthStore()
// Desde la bienvenida (el paso obligatorio de elegir el formato), al guardar se sigue a Flopi.
const desdeBienvenida = useRoute().query.desde === 'bienvenida'

// Las que suelen estar en las computadoras con Word. En el PDF va una del mismo tipo.
const FUENTES: { familia: string, tipo: 'serif' | 'sans' }[] = [
  { familia: 'Arial', tipo: 'sans' },
  { familia: 'Calibri', tipo: 'sans' },
  { familia: 'Century Gothic', tipo: 'sans' },
  { familia: 'Comic Sans MS', tipo: 'sans' },
  { familia: 'Tahoma', tipo: 'sans' },
  { familia: 'Trebuchet MS', tipo: 'sans' },
  { familia: 'Verdana', tipo: 'sans' },
  { familia: 'Book Antiqua', tipo: 'serif' },
  { familia: 'Cambria', tipo: 'serif' },
  { familia: 'Garamond', tipo: 'serif' },
  { familia: 'Georgia', tipo: 'serif' },
  { familia: 'Times New Roman', tipo: 'serif' },
]

const VINETAS = ['●', '○', '•', '◦', '▪', '■', '□', '–', '-', '★', '◆', '✓']

const MARCADORES = {
  encabezado: [{ valor: '{TITULO}', nombre: 'título' }, { valor: '{GRUPO}', nombre: 'grupo' }, { valor: '{DOCENTE}', nombre: 'tu nombre' }],
  dia: [{ valor: '{DIA}', nombre: 'día' }, { valor: '{NUMERO}', nombre: 'número' }, { valor: '{MES}', nombre: 'mes' }],
  tramo: [{ valor: '{ORDINAL}', nombre: 'PRIMER, SEGUNDO…' }, { valor: '{ROMANO}', nombre: 'I, II…' }, { valor: '{NUMERO}', nombre: '1, 2…' }],
}

const pestanas = [
  { label: 'Campos', value: 'campos', icon: 'i-tabler-layout-grid' },
  { label: 'Letra y hoja', value: 'letra', icon: 'i-tabler-typography' },
  { label: 'Títulos', value: 'titulos', icon: 'i-tabler-heading' },
  { label: 'Estilo', value: 'estilo', icon: 'i-tabler-palette' },
]

const diseno = ref<DisenoFormato | null>(null)
const receta = ref<RecetaFormato | null>(null)
// La estructura se edita aparte: la cuadrícula, la lista (dos columnas o texto seguido) y el nombre de cada campo.
const filas = ref<CampoTramo[][][]>([])
const orden = ref<CampoTramo[]>([])
const nombres = ref<Record<string, string>>({})

const cargando = ref(true)
const error = ref('')
const guardando = ref(false)
const probando = ref<FormatoDescarga | null>(null)
const pestana = ref('campos')
// En el celular se edita o se mira la hoja.
const vista = ref<'editar' | 'ver'>('editar')
// La receta tal como se abrió o se guardó, para avisar si se sale sin guardar.
const guardada = ref('')

const mensajeDe = (e: any, porDefecto: string) => typeof e === 'string' ? e : (e?.message ?? porDefecto)
const copiar = <T>(valor: T): T => JSON.parse(JSON.stringify(valor))

const porDefecto = (campo: CampoTramo) => diseno.value?.campos.find(c => c.campo === campo)?.etiqueta ?? campo
const esObligatorio = (campo: CampoTramo) => !!diseno.value?.campos.find(c => c.campo === campo)?.obligatorio

// Cuadrícula a partir de una lista: los datos del programa de a dos por fila y la meta y el plan juntos al final.
const cuadriculaDesde = (lista: CampoTramo[]): CampoTramo[][][] => {
  const resto = lista.filter(c => !esObligatorio(c))
  const obligatorios = lista.filter(esObligatorio)
  const resultado: CampoTramo[][][] = []

  for (let i = 0; i < resto.length; i += 2) {
    resultado.push(resto.slice(i, i + 2).map(c => [c]))
  }

  if (obligatorios.length) resultado.push([obligatorios])

  return resultado
}

const empezarDesde = (base: RecetaFormato) => {
  const nueva = copiar(base)
  const visibles = Object.keys(nueva.etiquetas) as CampoTramo[]

  nombres.value = Object.fromEntries(diseno.value!.campos.map(c => [c.campo, nueva.etiquetas[c.campo] ?? c.etiqueta]))
  orden.value = visibles
  filas.value = nueva.disposicion === 'cuadricula' && nueva.filas.length ? nueva.filas : cuadriculaDesde(visibles)
  receta.value = nueva
}

// Al cambiar de disposición, los campos visibles pasan de la cuadrícula a la lista o al revés.
const disposicion = computed<Disposicion>({
  get: () => receta.value!.disposicion,
  set: (nueva) => {
    const anterior = receta.value!.disposicion
    if (nueva === anterior) return

    if (anterior === 'cuadricula') {
      orden.value = filas.value.flat(2)
    } else if (nueva === 'cuadricula') {
      // Vuelve la cuadrícula que había: sin los campos que se ocultaron y con los nuevos al final.
      const lista = orden.value
      const anteriores = filas.value
        .map(fila => fila.map(celda => celda.filter(c => lista.includes(c))))
        .filter(fila => fila.some(celda => celda.length))
      const usados = anteriores.flat(2)

      filas.value = [...anteriores, ...lista.filter(c => !usados.includes(c)).map(c => [[c]])]
    }

    receta.value!.disposicion = nueva
  },
})

// La receta que se manda: la estructura sale de la cuadrícula o de la lista.
const recetaFinal = computed<RecetaFormato | null>(() => {
  if (!receta.value) return null

  const cuadricula = receta.value.disposicion === 'cuadricula'
  const visibles = cuadricula ? filas.value.flat(2) : orden.value

  return {
    ...receta.value,
    filas: cuadricula ? filas.value.map(fila => fila.filter(celda => celda.length)).filter(fila => fila.length) : [],
    etiquetas: Object.fromEntries(visibles.map(c => [c, nombres.value[c]?.trim() || porDefecto(c)])),
  }
})

const sucio = computed(() => !!recetaFinal.value && JSON.stringify(recetaFinal.value) !== guardada.value)

// La letra: al elegir una de la lista se sabe si es con serifa o sin (el PDF usa una del mismo tipo).
const familia = computed({
  get: () => receta.value!.fuente.familia,
  set: (valor: string) => {
    receta.value!.fuente.familia = valor
    const conocida = FUENTES.find(f => f.familia === valor)
    if (conocida) receta.value!.fuente.tipo = conocida.tipo
  },
})

// Espacios con un color propio (vienen del formato copiado): ahí los nombres no usan el color elegido.
const coloresEspacio = computed(() => Object.entries(receta.value?.colores_espacio ?? {}))

const cambiarColorEspacio = (espacio: string, color: string) => {
  receta.value!.colores_espacio = { ...receta.value!.colores_espacio, [espacio]: color.slice(1).toUpperCase() }
}

const quitarColorEspacio = (espacio: string) => {
  receta.value!.colores_espacio = Object.fromEntries(coloresEspacio.value.filter(([nombre]) => nombre !== espacio))
}

const opcionesFuente = computed(() => {
  const conocidas = FUENTES.map(f => f.familia)
  const actual = receta.value?.fuente.familia

  return actual && !conocidas.includes(actual) ? [actual, ...conocidas] : conocidas
})

const reiniciar = async (base: RecetaFormato, nombre: string) => {
  if (!await pedirConfirmacion({ titulo: `¿Empezar de nuevo desde ${nombre}?`, mensaje: 'Se pierden los cambios que no guardaste.', aceptar: 'Empezar de nuevo', peligro: true })) return
  empezarDesde(base)
}

const probar = async (tipo: FormatoDescarga) => {
  probando.value = tipo

  try {
    await descargarEjemploDiseno(tipo, recetaFinal.value!)
  } catch (e: any) {
    toast.error({ title: 'No se pudo descargar', message: mensajeDe(e, 'Probá de nuevo.') })
  } finally {
    probando.value = null
  }
}

const guardar = async () => {
  guardando.value = true

  try {
    await $apiRest(apiEstiloRoutes.formatoDiseno, HttpMethodEnum.PUT, { receta: recetaFinal.value })
    guardada.value = JSON.stringify(recetaFinal.value)
    // Con el diseño guardado ya eligió su formato: el usuario al día deja pasar a todo Flopi.
    authStore.setUser(await $apiRest(apiAuthRoutes.user, HttpMethodEnum.GET))
    toast.success({
      title: '¡Listo!',
      message: desdeBienvenida ? 'Tus planificaciones van a salir con tu diseño. Ya podés empezar a planificar.' : 'Tus descargas van a salir con tu diseño.',
    })
    await navigateTo(desdeBienvenida ? appRoutes.asistente() : appRoutes.estilo())
  } catch (e: any) {
    toast.error({ title: 'No se pudo guardar', message: mensajeDe(e, 'Probá de nuevo.') })
  } finally {
    guardando.value = false
  }
}

onBeforeRouteLeave(async () => {
  if (sucio.value && !await pedirConfirmacion({ titulo: 'Tenés cambios sin guardar', mensaje: 'Si salís ahora, se pierden los cambios de tu formato.', aceptar: 'Salir sin guardar', cancelar: 'Seguir editando', peligro: true })) return false
})

useEventListener('beforeunload', (evento: BeforeUnloadEvent) => {
  if (sucio.value) evento.preventDefault()
})

onMounted(async () => {
  try {
    diseno.value = await $apiRest<DisenoFormato>(apiEstiloRoutes.formatoDiseno, HttpMethodEnum.GET)
    empezarDesde(diseno.value.receta)
    guardada.value = JSON.stringify(recetaFinal.value)
  } catch (e: any) {
    error.value = mensajeDe(e, 'No pudimos abrir el editor. Probá de nuevo.')
  } finally {
    cargando.value = false
  }
})
</script>

<template>
  <div class="min-h-full px-4 sm:px-6 py-5 sm:py-6">
    <div class="max-w-7xl mx-auto">
      <header class="flex flex-wrap items-end justify-between gap-4 mb-4">
        <div class="min-w-0">
          <NuxtLink :to="desdeBienvenida ? appRoutes.bienvenida() : appRoutes.estilo()" class="inline-flex items-center gap-1 text-sm font-bold text-mona-700 hover:text-mona-900">
            <UIcon name="i-tabler-arrow-left" class="w-4 h-4" />
            {{ desdeBienvenida ? 'Volver' : 'Mi estilo' }}
          </NuxtLink>
          <h1 class="font-display text-3xl sm:text-4xl font-bold text-mona-900 leading-none mt-1">Diseñá tu formato</h1>
          <p class="text-mona-800/75 mt-2 max-w-2xl">
            Ubicá los campos de cada tramo y elegí la letra, los títulos y los colores. Así van a salir tus planificaciones en Word y en PDF.
          </p>
        </div>

        <div v-if="receta" class="flex flex-wrap items-center gap-2">
          <button
            v-for="tipo in (['docx', 'pdf'] as FormatoDescarga[])"
            :key="tipo"
            type="button"
            class="boton-mona inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-sm"
            :disabled="probando !== null"
            :title="`Bajá una planificación de prueba en ${tipo === 'docx' ? 'Word' : 'PDF'} con este diseño, sin guardarlo`"
            @click="probar(tipo)"
          >
            <UIcon :name="probando === tipo ? 'i-tabler-loader-2' : 'i-tabler-download'" class="w-4 h-4" :class="{ 'animate-spin': probando === tipo }" />
            Probar en {{ tipo === 'docx' ? 'Word' : 'PDF' }}
          </button>
          <button
            type="button"
            class="boton-miel inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-display text-lg font-semibold"
            :disabled="guardando"
            @click="guardar"
          >
            <UIcon :name="guardando ? 'i-tabler-loader-2' : 'i-tabler-check'" class="w-5 h-5" :class="{ 'animate-spin': guardando }" />
            {{ guardando ? 'Guardando…' : 'Guardar y usar' }}
          </button>
        </div>
      </header>

      <p v-if="cargando" class="text-mona-800/75">Abriendo el editor…</p>
      <p v-else-if="error" class="rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ error }}</p>

      <template v-else-if="receta && diseno">
        <UTabs
          v-model="vista"
          :items="[{ label: 'Editar', value: 'editar', icon: 'i-tabler-adjustments' }, { label: 'Ver cómo queda', value: 'ver', icon: 'i-tabler-eye' }]"
          :content="false"
          class="lg:hidden mb-3 w-full"
        />

        <div class="grid gap-5 lg:grid-cols-[minmax(340px,430px)_1fr] items-start">
          <aside class="rounded-2xl border-2 border-mona-100 bg-white" :class="{ 'hidden lg:block': vista === 'ver' }">
            <UTabs v-model="pestana" :items="pestanas" :content="false" class="px-3 pt-3" size="sm" />

            <div class="p-4 sm:p-5">
              <!-- Campos: dónde va cada uno y cómo se llama -->
              <EstiloEditorEstructura
                v-if="pestana === 'campos'"
                v-model:disposicion="disposicion"
                v-model:filas="filas"
                v-model:orden="orden"
                v-model:nombres="nombres"
                :campos="diseno.campos"
              />

              <!-- Letra y hoja -->
              <div v-else-if="pestana === 'letra'" class="space-y-6">
                <section>
                  <h4 class="titulo">Letra</h4>
                  <div class="flex flex-wrap items-center gap-2">
                    <USelect v-model="familia" :items="opcionesFuente" class="flex-1 min-w-44" aria-label="Letra" />
                    <UInputNumber v-model="receta.fuente.tamano" :min="8" :max="16" :step="0.5" class="w-32" aria-label="Tamaño de la letra" />
                  </div>
                  <p class="text-xs text-mona-800/70 mt-1.5">En Word se usa esta letra. En el PDF, una parecida.</p>
                  <label class="interruptor">
                    <USwitch v-model="receta.justificado" />
                    Texto justificado (parejo a los dos lados)
                  </label>
                </section>

                <section>
                  <h4 class="titulo">Hoja</h4>
                  <div class="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Orientación de la hoja">
                    <button
                      v-for="opcion in [{ valor: 'vertical', nombre: 'Vertical', icono: 'i-tabler-rectangle-vertical' }, { valor: 'horizontal', nombre: 'Horizontal', icono: 'i-tabler-rectangle' }] as const"
                      :key="opcion.valor"
                      type="button"
                      role="radio"
                      class="opcion"
                      :class="{ elegida: receta.orientacion === opcion.valor }"
                      :aria-checked="receta.orientacion === opcion.valor"
                      @click="receta.orientacion = opcion.valor"
                    >
                      <UIcon :name="opcion.icono" class="w-5 h-5" />
                      {{ opcion.nombre }}
                    </button>
                  </div>
                </section>

                <section>
                  <h4 class="titulo">Viñetas</h4>
                  <div v-for="nivel in [0, 1]" :key="nivel" class="mb-2">
                    <p class="text-xs font-bold text-mona-800/80 mb-1">{{ nivel === 0 ? 'Pasos del plan' : 'Dentro de cada paso' }}</p>
                    <div class="flex flex-wrap gap-1" role="radiogroup" :aria-label="nivel === 0 ? 'Viñeta de los pasos' : 'Viñeta dentro de cada paso'">
                      <button
                        v-for="vineta in VINETAS"
                        :key="vineta"
                        type="button"
                        role="radio"
                        class="vineta"
                        :class="{ elegida: receta.vinetas[nivel] === vineta }"
                        :aria-checked="receta.vinetas[nivel] === vineta"
                        @click="receta.vinetas[nivel] = vineta"
                      >
                        {{ vineta }}
                      </button>
                    </div>
                  </div>
                  <label class="interruptor">
                    <USwitch v-model="receta.listas_en_vinetas" />
                    Contenidos, criterios y competencias como lista, si hay más de uno
                  </label>
                  <label v-if="receta.disposicion === 'secuencial'" class="interruptor">
                    <USwitch v-model="receta.espacio_entre_campos" />
                    Un renglón en blanco entre campo y campo
                  </label>
                </section>
              </div>

              <!-- Títulos: el del documento, el de cada día y el de cada tramo -->
              <div v-else-if="pestana === 'titulos'" class="space-y-6">
                <section>
                  <h4 class="titulo">Título del documento</h4>
                  <label class="interruptor !mt-0">
                    <USwitch v-model="receta.encabezado.mostrar" />
                    Poner un título al principio
                  </label>
                  <div v-if="receta.encabezado.mostrar" class="space-y-2 mt-2">
                    <EstiloEditorPlantillaTitulo v-model="receta.encabezado.plantilla" etiqueta="Título del documento" :marcadores="MARCADORES.encabezado" />
                    <EstiloEditorBarraTexto v-model="receta.encabezado" />
                  </div>
                </section>

                <section>
                  <h4 class="titulo">Cada día</h4>
                  <div class="space-y-2">
                    <EstiloEditorPlantillaTitulo v-model="receta.dia.plantilla" etiqueta="Título de cada día" :marcadores="MARCADORES.dia" />
                    <EstiloEditorBarraTexto v-model="receta.dia" />
                  </div>
                  <label class="interruptor">
                    <USwitch v-model="receta.dia.nueva_pagina" />
                    Cada día empieza en una hoja nueva
                  </label>
                </section>

                <section>
                  <h4 class="titulo">Cada tramo</h4>
                  <label class="interruptor !mt-0">
                    <USwitch v-model="receta.tramo.mostrar" />
                    Poner un título a cada tramo
                  </label>
                  <div v-if="receta.tramo.mostrar" class="space-y-2 mt-2">
                    <EstiloEditorPlantillaTitulo v-model="receta.tramo.plantilla" etiqueta="Título de cada tramo" :marcadores="MARCADORES.tramo" />
                    <EstiloEditorBarraTexto v-model="receta.tramo" />
                  </div>
                </section>
              </div>

              <!-- Estilo: los nombres de los campos y el cuadro -->
              <div v-else class="space-y-6">
                <section>
                  <h4 class="titulo">Nombres de los campos</h4>
                  <EstiloEditorBarraTexto v-model="receta.etiqueta" :con-tamano="false" :con-color="false" :con-alineacion="false" />
                  <p class="text-xs font-bold text-mona-800/80 mt-3 mb-1">Color</p>
                  <EstiloEditorSelectorColor v-model="receta.etiqueta.color" etiqueta="Color de los nombres de los campos" espacio />
                  <p v-if="receta.etiqueta.color === 'espacio'" class="text-xs text-mona-800/70 mt-1.5">
                    Cada espacio de conocimiento con su color: verde en Científico - Matemático, rosado en Comunicación…
                  </p>
                  <div v-if="coloresEspacio.length" class="mt-3 rounded-xl bg-mona-50 px-3 py-2.5">
                    <p class="text-xs font-bold text-mona-900">Espacios con su propio color</p>
                    <p class="text-xs text-mona-800/75 mt-0.5">Vienen de tu planificación copiada: en estos espacios los nombres no usan el color de arriba.</p>
                    <ul class="mt-2 space-y-1.5">
                      <li v-for="[espacio, color] in coloresEspacio" :key="espacio" class="flex items-center gap-2 text-sm text-mona-900">
                        <label class="color-espacio" :style="{ backgroundColor: `#${color}` }" :title="`Cambiar el color de ${espacio}`">
                          <input
                            type="color"
                            class="sr-only"
                            :value="`#${color}`"
                            @input="cambiarColorEspacio(espacio, ($event.target as HTMLInputElement).value)"
                          >
                          <span class="sr-only">Color de {{ espacio }}</span>
                        </label>
                        <span class="flex-1 min-w-0 leading-tight">{{ espacio }}</span>
                        <button type="button" class="flex-shrink-0 text-xs font-bold text-mona-700 hover:underline" @click="quitarColorEspacio(espacio)">
                          Usar el de arriba
                        </button>
                      </li>
                    </ul>
                  </div>
                  <label v-if="receta.disposicion !== 'tabla_etiquetas'" class="interruptor">
                    <USwitch v-model="receta.etiqueta.en_linea" />
                    El texto sigue en el mismo renglón que el nombre
                  </label>
                </section>

                <section v-if="receta.disposicion !== 'secuencial'">
                  <h4 class="titulo">Cuadro</h4>
                  <p class="text-xs font-bold text-mona-800/80 mb-1">Bordes</p>
                  <EstiloEditorSelectorColor v-model="receta.tabla.borde" etiqueta="Color de los bordes" />

                  <template v-if="receta.tramo.mostrar">
                    <p class="text-xs font-bold text-mona-800/80 mt-3 mb-1">Fondo del título del tramo</p>
                    <EstiloEditorSelectorColor v-model="receta.tabla.fondo_tramo" etiqueta="Fondo del título del tramo" ninguno claros />
                  </template>

                  <template v-if="receta.disposicion === 'tabla_etiquetas'">
                    <p class="text-xs font-bold text-mona-800/80 mt-3 mb-1">Fondo de la columna de nombres</p>
                    <EstiloEditorSelectorColor v-model="receta.tabla.fondo_etiqueta" etiqueta="Fondo de la columna de nombres" ninguno claros />
                    <p class="text-xs font-bold text-mona-800/80 mt-3 mb-1">Ancho de la columna de nombres: {{ receta.tabla.ancho_etiqueta }} %</p>
                    <USlider v-model="receta.tabla.ancho_etiqueta" :min="15" :max="50" :step="1" aria-label="Ancho de la columna de nombres" />
                  </template>
                </section>
              </div>
            </div>

            <footer class="border-t-2 border-mona-50 px-4 sm:px-5 py-3 text-xs text-mona-800/75 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>Empezar de nuevo desde:</span>
              <button type="button" class="font-bold text-mona-700 hover:underline" @click="reiniciar(diseno.flopi, 'el formato de Flopi')">
                el formato de Flopi
              </button>
              <template v-if="diseno.copiada">
                <span aria-hidden="true">·</span>
                <button type="button" class="font-bold text-mona-700 hover:underline" @click="reiniciar(diseno.copiada, 'tu formato copiado')">
                  tu formato copiado
                </button>
              </template>
            </footer>
          </aside>

          <section
            class="rounded-2xl border-2 border-mona-100 overflow-hidden bg-[#eceae4] h-[70vh] lg:h-[calc(100dvh-10rem)] lg:sticky lg:top-4"
            :class="{ 'hidden lg:block': vista === 'editar' }"
            aria-label="Vista previa"
          >
            <EstiloEditorVistaPrevia v-if="recetaFinal" :receta="recetaFinal" />
          </section>
        </div>

        <p class="text-xs text-mona-800/70 mt-3">
          La vista previa usa una planificación de muestra. "Probar" baja tu última planificación confirmada con este diseño, sin guardarlo.
        </p>
      </template>
    </div>
  </div>
</template>

<style scoped>
.titulo {
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--color-mona-900);
  margin-bottom: 0.5rem;
}

.interruptor {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  margin-top: 0.75rem;
  font-size: 0.85rem;
  color: var(--color-mona-900);
  cursor: pointer;
}

.opcion {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.5rem;
  border: 2px solid var(--color-mona-100);
  border-radius: 0.8rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-mona-900);
}

.opcion.elegida {
  border-color: var(--color-mona-500);
  background: var(--color-mona-50);
}

.vineta {
  width: 2rem;
  height: 2rem;
  border: 2px solid var(--color-mona-100);
  border-radius: 0.55rem;
  font-size: 1rem;
  color: var(--color-mona-900);
}

.vineta.elegida {
  border-color: var(--color-mona-500);
  background: var(--color-mona-50);
}

.color-espacio {
  width: 1.4rem;
  height: 1.4rem;
  flex-shrink: 0;
  border: 2px solid #fff;
  border-radius: 0.45rem;
  box-shadow: 0 0 0 1px var(--color-mona-200);
  cursor: pointer;
}
</style>
