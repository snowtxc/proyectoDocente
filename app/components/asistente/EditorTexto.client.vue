<script setup lang="ts">
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum'
import { apiPlanificacionesRoutes } from '~/utils/apiRoutes'

// Editor con formato, parecido a Word, para la meta y el plan de un tramo.
// Las imágenes se suben a la nube (no quedan pegadas dentro del texto).
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
const subiendo = ref(false)

const barra = [
  [{ header: [2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ indent: '-1' }, { indent: '+1' }],
  [{ align: [] }],
  ['blockquote', 'image'],
  ['clean'],
]

const subirImagen = () => {
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

      const quill = editor.value?.getQuill()
      const posicion = quill?.getSelection(true)?.index ?? quill?.getLength() ?? 0
      quill?.insertEmbed(posicion, 'image', url, 'user')
      quill?.setSelection(posicion + 1, 0)
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
</script>

<template>
  <div class="editor-texto" :style="{ '--alto-editor': `${alto ?? 140}px` }">
    <QuillEditor
      ref="editor"
      v-model:content="html"
      content-type="html"
      theme="snow"
      :options="opciones"
      :placeholder="placeholder"
    />
    <p v-if="subiendo" class="text-xs text-mona-800/70 mt-1">Subiendo imagen…</p>
  </div>
</template>

<style scoped>
.editor-texto :deep(.ql-toolbar) {
  border-radius: 0.75rem 0.75rem 0 0;
  border-color: var(--color-mona-200);
  background: var(--color-mona-50);
}

.editor-texto :deep(.ql-container) {
  border-radius: 0 0 0.75rem 0.75rem;
  border-color: var(--color-mona-200);
  font-family: inherit;
  font-size: 15px;
  background: white;
}

.editor-texto :deep(.ql-editor) {
  min-height: var(--alto-editor);
  line-height: 1.55;
}

.editor-texto :deep(.ql-editor img) {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
}
</style>
