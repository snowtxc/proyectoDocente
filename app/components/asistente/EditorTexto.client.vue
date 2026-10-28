<script setup lang="ts">
import { Quill, QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum'
import { apiPlanificacionesRoutes } from '~/utils/apiRoutes'

// Editor con formato, parecido a Word, para la meta y el plan de un tramo.
// Las imágenes se suben a la nube (no quedan pegadas dentro del texto) y se pueden agrandar o
// achicar: el ancho queda en la imagen y el Word y el PDF lo respetan.
const props = defineProps<{
  planificacionId: number
  placeholder?: string
  // Altura mínima del área de escritura, en píxeles.
  alto?: number
}>()

const html = defineModel<string>({ default: '' })

const { $apiRest } = useNuxtApp()
const toast = useToast()
const editor = ref<InstanceType<typeof QuillEditor> | null>(null)
const marcoEditor = ref<HTMLElement>()
const subiendo = ref(false)

// Ancho útil de la hoja en píxeles (el Word y el PDF usan la misma medida).
const ANCHO_HOJA = 640
const TAMANOS = [
  { nombre: 'Chica', ancho: 160 },
  { nombre: 'Mediana', ancho: 320 },
  { nombre: 'Grande', ancho: 480 },
  { nombre: 'Toda la hoja', ancho: ANCHO_HOJA },
]

const barra = [
  [{ header: [2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ indent: '-1' }, { indent: '+1' }],
  [{ align: [] }],
  ['blockquote', 'image'],
  ['clean'],
]

const AYUDAS: Record<string, string> = {
  '.ql-bold': 'Negrita',
  '.ql-italic': 'Cursiva',
  '.ql-underline': 'Subrayado',
  '.ql-strike': 'Tachado',
  '.ql-list[value="ordered"]': 'Lista numerada',
  '.ql-list[value="bullet"]': 'Lista con viñetas',
  '.ql-indent[value="-1"]': 'Menos sangría',
  '.ql-indent[value="+1"]': 'Más sangría',
  '.ql-align': 'Alineación',
  '.ql-blockquote': 'Cita',
  '.ql-image': 'Agregar una imagen',
  '.ql-clean': 'Quitar el formato',
  '.ql-header': 'Tipo de texto',
}

const quill = () => editor.value?.getQuill()

// ---------------------------------------------------------------- Imágenes

const elegida = ref<HTMLImageElement | null>(null)
const marco = ref({ top: 0, left: 0, width: 0, height: 0 })
const anchoElegida = ref(0)

const anchoDe = (imagen: HTMLImageElement) => Number(imagen.getAttribute('width')) || Math.min(imagen.naturalWidth || ANCHO_HOJA, ANCHO_HOJA)
const porcentaje = computed(() => Math.round(anchoElegida.value / ANCHO_HOJA * 100))

const ubicarMarco = () => {
  const imagen = elegida.value
  if (!imagen || !marcoEditor.value) return

  const caja = imagen.getBoundingClientRect()
  const base = marcoEditor.value.getBoundingClientRect()
  marco.value = { top: caja.top - base.top, left: caja.left - base.left, width: caja.width, height: caja.height }
  anchoElegida.value = anchoDe(imagen)
}

const elegir = (imagen: HTMLImageElement | null) => {
  elegida.value = imagen
  nextTick(ubicarMarco)
}

// El ancho va en la imagen; Quill ve el cambio y avisa que el texto cambió.
const fijarAncho = (imagen: HTMLImageElement, ancho: number) => {
  imagen.setAttribute('width', String(Math.round(Math.min(ANCHO_HOJA, Math.max(40, ancho)))))
  imagen.removeAttribute('height')
  quill()?.update('user')
  nextTick(ubicarMarco)
}

const quitarImagen = () => {
  const imagen = elegida.value
  const editorQuill = quill()
  if (!imagen || !editorQuill) return

  const blot = Quill.find(imagen)
  if (blot) editorQuill.deleteText(editorQuill.getIndex(blot), 1, 'user')
  elegir(null)
}

// Tirando de la esquina: el ancho sigue al mouse o al dedo, en la medida de la hoja.
let arrastre: { x: number, ancho: number, escala: number } | null = null

const empezarArrastre = (evento: PointerEvent) => {
  const imagen = elegida.value
  if (!imagen) return

  const visible = imagen.getBoundingClientRect().width || 1
  arrastre = { x: evento.clientX, ancho: anchoDe(imagen), escala: anchoDe(imagen) / visible }
  ;(evento.target as HTMLElement).setPointerCapture(evento.pointerId)
}

const arrastrar = (evento: PointerEvent) => {
  if (!arrastre || !elegida.value) return

  const ancho = Math.round(Math.min(ANCHO_HOJA, Math.max(40, arrastre.ancho + (evento.clientX - arrastre.x) * arrastre.escala)))
  elegida.value.setAttribute('width', String(ancho))
  elegida.value.removeAttribute('height')
  ubicarMarco()
}

const terminarArrastre = () => {
  if (!arrastre || !elegida.value) return

  arrastre = null
  fijarAncho(elegida.value, anchoDe(elegida.value))
}

const alHacerClic = (evento: MouseEvent) => {
  const objetivo = evento.target as HTMLElement
  elegir(objetivo.tagName === 'IMG' && objetivo.closest('.ql-editor') ? objetivo as HTMLImageElement : null)
}

const alTocarTecla = (evento: KeyboardEvent) => {
  if (!elegida.value) return

  if (evento.key === 'Delete' || evento.key === 'Backspace') {
    evento.preventDefault()
    quitarImagen()
  } else if (evento.key === 'Escape') {
    elegir(null)
  }
}

// Ancho natural de una imagen antes de ponerla, para no agrandar las chicas.
const anchoNatural = (url: string) => new Promise<number>((resolver) => {
  const imagen = new Image()
  imagen.onload = () => resolver(imagen.naturalWidth)
  imagen.onerror = () => resolver(0)
  imagen.src = url
})

const subirImagen = () => {
  // Dónde estaba el cursor: mientras se elige el archivo, el editor lo pierde.
  const cursor = quill()?.getSelection()?.index ?? null
  const entrada = document.createElement('input')
  entrada.type = 'file'
  entrada.accept = 'image/png,image/jpeg,image/gif,image/webp'

  entrada.onchange = async () => {
    const archivo = entrada.files?.[0]
    if (!archivo) return

    if (archivo.size > 5 * 1024 * 1024) {
      toast.error({ title: 'Imagen muy pesada', message: 'Puede pesar hasta 5 MB.' })
      return
    }

    subiendo.value = true

    try {
      const datos = new FormData()
      datos.append('imagen', archivo)
      const { url } = await $apiRest<{ url: string }>(apiPlanificacionesRoutes.imagen(props.planificacionId), HttpMethodEnum.POST, datos)
      const ancho = await anchoNatural(url)

      const editorQuill = quill()
      if (!editorQuill) return

      // La imagen va en su propio renglón: en el Word y el PDF no se encima con el texto.
      let posicion = cursor ?? editorQuill.getLength() - 1
      if (posicion > 0 && editorQuill.getText(posicion - 1, 1) !== '\n') {
        editorQuill.insertText(posicion, '\n', 'user')
        posicion += 1
      }
      editorQuill.insertEmbed(posicion, 'image', url, 'user')
      if (editorQuill.getText(posicion + 1, 1) !== '\n') editorQuill.insertText(posicion + 1, '\n', 'user')
      editorQuill.setSelection(posicion + 2, 0)

      // Entra mediana (o de su tamaño, si es más chica); después se agranda o achica.
      const nueva = [...editorQuill.root.querySelectorAll<HTMLImageElement>('img')].find(img => img.getAttribute('src') === url && !img.getAttribute('width'))
      if (nueva) fijarAncho(nueva, Math.min(ancho || 320, 320))
    } catch (error: any) {
      const detalle = error?.errors?.imagen?.[0]
      toast.error({ title: 'No se pudo subir la imagen', message: detalle ?? (typeof error === 'string' ? error : 'Probá de nuevo.') })
    } finally {
      subiendo.value = false
    }
  }

  entrada.click()
}

// La barra y el manejo de imágenes van en options (la prop modules de vue-quill registra módulos nuevos).
const opciones = {
  modules: {
    toolbar: {
      container: barra,
      handlers: { image: subirImagen },
    },
  },
}

const alEstarListo = () => {
  const raiz = marcoEditor.value
  if (!raiz) return

  for (const [selector, ayuda] of Object.entries(AYUDAS)) {
    raiz.querySelectorAll<HTMLElement>(`.ql-toolbar ${selector}`).forEach(boton => boton.setAttribute('title', ayuda))
  }
}

// Si el texto cambia por otro lado (o se escribe), el marco de la imagen se acomoda o se va.
watch(html, () => {
  if (elegida.value && !elegida.value.isConnected) elegir(null)
  else nextTick(ubicarMarco)
})

useEventListener('resize', ubicarMarco)
</script>

<template>
  <div
    ref="marcoEditor"
    class="editor-texto"
    :style="{ '--alto-editor': `${alto ?? 140}px` }"
    @click="alHacerClic"
    @keydown.capture="alTocarTecla"
  >
    <QuillEditor
      ref="editor"
      v-model:content="html"
      content-type="html"
      theme="snow"
      :options="opciones"
      :placeholder="placeholder"
      @ready="alEstarListo"
    />

    <!-- Imagen elegida: tamaños rápidos y una esquina para tirar -->
    <template v-if="elegida">
      <div class="marco-imagen" :style="{ top: `${marco.top}px`, left: `${marco.left}px`, width: `${marco.width}px`, height: `${marco.height}px` }">
        <span
          class="tirador"
          title="Tirá para agrandar o achicar"
          @click.stop
          @pointerdown.prevent="empezarArrastre"
          @pointermove="arrastrar"
          @pointerup="terminarArrastre"
          @pointercancel="terminarArrastre"
        />
        <span class="medida">{{ porcentaje }} % de la hoja</span>
      </div>
      <div class="barra-imagen" :style="{ top: `${marco.top + 8}px`, left: `${marco.left + 8}px` }" @click.stop>
        <button
          v-for="tamano in TAMANOS"
          :key="tamano.ancho"
          type="button"
          :class="{ activo: Math.abs(anchoElegida - tamano.ancho) < 4 }"
          @click="fijarAncho(elegida, tamano.ancho)"
        >
          {{ tamano.nombre }}
        </button>
        <span class="separador" aria-hidden="true" />
        <button type="button" class="quitar" title="Quitar la imagen" @click="quitarImagen">
          <UIcon name="i-tabler-trash" class="w-4 h-4" />
          <span class="sr-only">Quitar la imagen</span>
        </button>
      </div>
    </template>

    <p v-if="subiendo" class="flex items-center gap-1.5 text-xs text-mona-800/70 mt-1">
      <UIcon name="i-tabler-loader-2" class="w-3.5 h-3.5 animate-spin" />
      Subiendo imagen…
    </p>
  </div>
</template>

<style scoped>
.editor-texto {
  position: relative;
}

/* La barra queda a mano al bajar por un plan largo. */
.editor-texto :deep(.ql-toolbar) {
  position: sticky;
  top: 0;
  z-index: 3;
  border-radius: 0.75rem 0.75rem 0 0;
  border-color: var(--color-mona-200);
  background: var(--color-mona-50);
  padding: 6px 8px;
}

.editor-texto :deep(.ql-toolbar button:hover),
.editor-texto :deep(.ql-toolbar button.ql-active) {
  background: #fff;
  border-radius: 0.4rem;
}

.editor-texto :deep(.ql-container) {
  border-radius: 0 0 0.75rem 0.75rem;
  border-color: var(--color-mona-200);
  font-family: inherit;
  font-size: 15px;
  background: white;
}

.editor-texto:focus-within :deep(.ql-container),
.editor-texto:focus-within :deep(.ql-toolbar) {
  border-color: var(--color-mona-400);
}

.editor-texto :deep(.ql-editor) {
  min-height: var(--alto-editor);
  line-height: 1.55;
  padding: 14px 16px;
}

.editor-texto :deep(.ql-editor.ql-blank::before) {
  font-style: normal;
  color: var(--color-mona-800);
  opacity: 0.45;
}

.editor-texto :deep(.ql-editor img) {
  max-width: 100%;
  height: auto;
  cursor: pointer;
}

/* El tipo de texto, en castellano. */
.editor-texto :deep(.ql-picker.ql-header .ql-picker-label::before),
.editor-texto :deep(.ql-picker.ql-header .ql-picker-item::before) {
  content: 'Texto';
}

.editor-texto :deep(.ql-picker.ql-header .ql-picker-label[data-value="2"]::before),
.editor-texto :deep(.ql-picker.ql-header .ql-picker-item[data-value="2"]::before) {
  content: 'Título';
}

.editor-texto :deep(.ql-picker.ql-header .ql-picker-label[data-value="3"]::before),
.editor-texto :deep(.ql-picker.ql-header .ql-picker-item[data-value="3"]::before) {
  content: 'Subtítulo';
}

.marco-imagen {
  position: absolute;
  z-index: 2;
  outline: 2px solid var(--color-mona-500);
  outline-offset: 1px;
  pointer-events: none;
}

.tirador {
  position: absolute;
  right: -9px;
  bottom: -9px;
  width: 18px;
  height: 18px;
  border-radius: 9999px;
  background: var(--color-mona-600);
  border: 3px solid #fff;
  box-shadow: 0 1px 4px rgb(0 0 0 / 0.3);
  cursor: nwse-resize;
  pointer-events: auto;
  touch-action: none;
}

.medida {
  position: absolute;
  left: 6px;
  bottom: 6px;
  padding: 1px 8px;
  border-radius: 9999px;
  background: rgb(23 28 76 / 0.8);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
}

.barra-imagen {
  position: absolute;
  z-index: 4;
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 3px;
  border-radius: 0.7rem;
  background: #fff;
  border: 1px solid var(--color-mona-200);
  box-shadow: 0 4px 14px rgb(0 0 0 / 0.12);
}

.barra-imagen button {
  display: inline-flex;
  align-items: center;
  padding: 4px 9px;
  border-radius: 0.5rem;
  font-size: 12px;
  font-weight: 700;
  color: var(--color-mona-800);
  white-space: nowrap;
}

.barra-imagen button:hover {
  background: var(--color-mona-50);
}

.barra-imagen button.activo {
  background: var(--color-mona-100);
  color: var(--color-mona-900);
}

.barra-imagen button.quitar:hover {
  background: #fef2f2;
  color: #b91c1c;
}

.barra-imagen .separador {
  width: 1px;
  align-self: stretch;
  margin: 2px 2px;
  background: var(--color-mona-100);
}
</style>
