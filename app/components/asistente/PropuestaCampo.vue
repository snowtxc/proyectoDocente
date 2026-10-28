<script setup lang="ts">
import type { StyleValue } from 'vue'
import type { PropuestaPresentada } from '~/types/asistente'
import type { CampoTramo, RecetaFormato } from '~/types/estilo'
import { textoEtiqueta } from '~/utils/recetaFormato'

// Un campo de un tramo curricular con el diseño de las descargas: "Etiqueta: texto", o solo el
// texto si la etiqueta va en otra celda. Igual que planificaciones/_campo.blade.php en el backend.
const props = defineProps<{
  propuesta: Extract<PropuestaPresentada, { tipo: 'curricular' }>
  receta: RecetaFormato
  campo: CampoTramo
  estiloEtiqueta: StyleValue
  conEtiqueta: boolean
}>()

const nombre = computed(() => textoEtiqueta(props.receta, props.campo))

const valores = computed(() => {
  const referencias = props.propuesta.referencias
  const campo = props.campo

  switch (campo) {
    case 'meta': return [props.propuesta.meta_aprendizaje ?? '']
    case 'plan': return []
    case 'espacio': return [referencias.espacio]
    case 'unidad_curricular': return [referencias.unidad_curricular]
    case 'contenido': return referencias.contenidos.map(r => r.texto)
    default: return referencias[campo].map(r => r.texto)
  }
})

const comoLista = computed(() => props.receta.listas_en_vinetas && valores.value.length > 1)
const enLinea = computed(() => props.receta.etiqueta.en_linea && !comoLista.value)
</script>

<template>
  <!-- La meta y el plan con formato llegan limpios del backend (HtmlTramo::limpiar). -->
  <template v-if="campo === 'meta' && propuesta.meta_html">
    <span v-if="conEtiqueta" :style="estiloEtiqueta">{{ nombre }}:</span>
    <div class="html-docente texto" v-html="propuesta.meta_html" />
  </template>

  <template v-else-if="campo === 'plan'">
    <span v-if="conEtiqueta" :style="estiloEtiqueta">{{ nombre }}:</span>
    <div v-if="propuesta.plan_html" class="html-docente texto" v-html="propuesta.plan_html" />
    <ul v-else class="vinetas texto">
      <template v-for="(paso, p) in propuesta.plan" :key="p">
        <!-- Subtítulo del plan (en multigrado, "Todos juntos" o el nombre de un grado). -->
        <li v-if="paso.titulo" class="subtitulo">{{ paso.texto }}</li>
        <li v-else>
          {{ receta.vinetas[0] }}&nbsp; {{ paso.texto }}
          <ul v-if="paso.subpasos.length > 0" class="vinetas">
            <li v-for="(subpaso, s) in paso.subpasos" :key="s">{{ receta.vinetas[1] }}&nbsp; {{ subpaso }}</li>
          </ul>
        </li>
      </template>
    </ul>
  </template>

  <template v-else-if="comoLista">
    <span v-if="conEtiqueta" :style="estiloEtiqueta">{{ nombre }}:</span>
    <ul class="vinetas texto">
      <li v-for="(valor, v) in valores" :key="v">{{ receta.vinetas[0] }}&nbsp; {{ valor }}</li>
    </ul>
  </template>

  <p v-else-if="!conEtiqueta" class="texto">{{ valores.join(' ') }}</p>

  <p v-else-if="enLinea" class="texto"><span :style="estiloEtiqueta">{{ nombre }}:</span> {{ valores.join(' ') }}</p>

  <template v-else>
    <p><span :style="estiloEtiqueta">{{ nombre }}:</span></p>
    <p class="texto">{{ valores.join(' ') }}</p>
  </template>
</template>

<style scoped>
/* Las mismas medidas que la plantilla del PDF. La hoja define la alineación y el espacio entre renglones. */
p { margin: 0 0 var(--separacion-parrafos, 6px) 0; }
.texto { text-align: var(--alineacion-texto, left); }

ul.vinetas { margin: 2px 0 6px 0; padding-left: 0; list-style: none; }
ul.vinetas li { margin: 0 0 1px 0; padding-left: 22px; text-indent: -14px; }
ul.vinetas ul.vinetas { margin: 0; }
ul.vinetas ul.vinetas li { padding-left: 44px; }
ul.vinetas li.subtitulo { padding-left: 11px; text-indent: 0; font-weight: bold; margin: 6px 0 2px 0; }

/* Texto con formato del editor: mismas clases que genera Quill. */
.html-docente :deep(p) { margin: 0 0 4px 0; }
.html-docente :deep(ul) { list-style: disc; padding-left: 1.4em; }
.html-docente :deep(ol) { list-style: decimal; padding-left: 1.4em; }
.html-docente :deep(li.ql-indent-1) { margin-left: 1.4em; list-style: circle; }
.html-docente :deep(li.ql-indent-2) { margin-left: 2.8em; list-style: square; }
.html-docente :deep(h2) { font-weight: bold; font-size: 1.15em; margin: 6px 0 2px 0; }
.html-docente :deep(h3) { font-weight: bold; font-size: 1.05em; margin: 6px 0 2px 0; }
.html-docente :deep(img) { max-width: 100%; height: auto; margin: 4px 0; }
.html-docente :deep(blockquote) { border-left: 3px solid #ccc; margin: 4px 0; padding-left: 8px; }
.html-docente :deep(.ql-align-center) { text-align: center; }
.html-docente :deep(.ql-align-right) { text-align: right; }
.html-docente :deep(.ql-align-justify) { text-align: justify; }
</style>
