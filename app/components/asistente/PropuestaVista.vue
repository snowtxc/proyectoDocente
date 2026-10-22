<script setup lang="ts">
import type { PropuestaPresentada } from '~/types/asistente'

// Vista de lectura de un tramo, con el mismo cuadro que el documento descargado.
defineProps<{
  propuesta: PropuestaPresentada
}>()

const unir = (items: { texto: string }[]) => items.map(i => i.texto).join(' ')
</script>

<template>
  <div :style="{ '--color-espacio': propuesta.tipo === 'curricular' ? propuesta.referencias.color : 'var(--color-mona-800)' }">
    <!-- Actividad sin datos del programa -->
    <p v-if="propuesta.tipo === 'libre'" class="px-4 py-3 text-[15px]">
      <span class="etiqueta">Actividad:</span> {{ propuesta.actividad }}
    </p>

    <!-- Propuesta con contenidos del programa -->
    <template v-else>
      <div class="grid sm:grid-cols-2 datos">
        <p><span class="etiqueta">Espacio de Conocimiento:</span> {{ propuesta.referencias.espacio }}</p>
        <p><span class="etiqueta">Competencia general:</span> {{ unir(propuesta.referencias.competencias_generales) }}</p>
        <p><span class="etiqueta">Unidad Curricular:</span> {{ propuesta.referencias.unidad_curricular }}</p>
        <p><span class="etiqueta">Competencia específica:</span> {{ unir(propuesta.referencias.competencias_especificas) }}</p>
        <p><span class="etiqueta">Contenido:</span> {{ unir(propuesta.referencias.contenidos) }}</p>
        <p><span class="etiqueta">Criterio de logro:</span> {{ unir(propuesta.referencias.criterios_logro) }}</p>
      </div>

      <div class="px-4 py-3 space-y-3 text-[15px] leading-relaxed border-t-2 border-mona-200">
        <!-- El HTML del editor llega limpio del backend (HtmlTramo::limpiar). -->
        <div v-if="propuesta.meta_html">
          <p><span class="etiqueta">Meta de aprendizaje:</span></p>
          <div class="html-docente" v-html="propuesta.meta_html" />
        </div>
        <p v-else><span class="etiqueta">Meta de aprendizaje:</span> {{ propuesta.meta_aprendizaje }}</p>

        <div>
          <p><span class="etiqueta">Plan de aprendizaje y desarrollo de la intervención docente:</span></p>
          <div v-if="propuesta.plan_html" class="html-docente" v-html="propuesta.plan_html" />
          <ul v-else class="plan">
            <li v-for="(paso, p) in propuesta.plan" :key="p">
              {{ paso.texto }}
              <ul v-if="paso.subpasos.length > 0">
                <li v-for="(subpaso, s) in paso.subpasos" :key="s">{{ subpaso }}</li>
              </ul>
            </li>
          </ul>
        </div>

      </div>
    </template>
  </div>
</template>

<style scoped>
/* Texto con formato del editor: mismas clases que genera Quill. */
.html-docente :deep(p) { margin: 0.15rem 0; }
.html-docente :deep(ul) { list-style: disc; padding-left: 1.4rem; }
.html-docente :deep(ol) { list-style: decimal; padding-left: 1.4rem; }
.html-docente :deep(li.ql-indent-1) { margin-left: 1.4rem; list-style: circle; }
.html-docente :deep(li.ql-indent-2) { margin-left: 2.8rem; list-style: square; }
.html-docente :deep(h2) { font-weight: 800; font-size: 1.1rem; margin-top: 0.5rem; }
.html-docente :deep(h3) { font-weight: 800; margin-top: 0.4rem; }
.html-docente :deep(img) { max-width: 100%; height: auto; border-radius: 0.5rem; margin: 0.4rem 0; }
.html-docente :deep(blockquote) { border-left: 3px solid var(--color-mona-200); padding-left: 0.75rem; color: var(--color-mona-800); }
.html-docente :deep(.ql-align-center) { text-align: center; }
.html-docente :deep(.ql-align-right) { text-align: right; }
.html-docente :deep(.ql-align-justify) { text-align: justify; }

/* Etiquetas en negrita subrayada, con el color del espacio de conocimiento (como en el documento). */
.etiqueta {
  font-weight: 800;
  text-decoration: underline;
  text-underline-offset: 2px;
  color: var(--color-espacio);
}

/* Datos del programa: cuadrícula de dos columnas con líneas, como la tabla del documento. */
.datos > p {
  padding: 0.6rem 1rem;
  font-size: 0.94rem;
  line-height: 1.5;
  border-bottom: 2px solid var(--color-mona-200);
}

.datos > p:nth-last-child(-n + 2) {
  border-bottom: 0;
}

@media (min-width: 640px) {
  .datos > p:nth-child(odd) {
    border-right: 2px solid var(--color-mona-200);
  }
}

@media (max-width: 639px) {
  .datos > p:nth-last-child(2) {
    border-bottom: 2px solid var(--color-mona-200);
  }
}

.plan {
  list-style: disc;
  padding-left: 1.4rem;
  margin-top: 0.25rem;
}

.plan li {
  margin-bottom: 0.2rem;
}

.plan ul {
  list-style: circle;
  padding-left: 1.4rem;
  margin-top: 0.2rem;
}
</style>
