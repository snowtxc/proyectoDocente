<script setup lang="ts">
import type { PropuestaPresentada } from '~/types/asistente'

// Vista de lectura de un tramo, con el mismo cuadro que el documento descargado.
defineProps<{
  propuesta: PropuestaPresentada
}>()

const conPunto = (texto: string) => (/[.!?…]$/.test(texto) ? texto : `${texto}.`)
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
        <p><span class="etiqueta">Meta de aprendizaje:</span> {{ propuesta.meta_aprendizaje }}</p>

        <p>
          <span class="etiqueta">Actividad:</span> {{ conPunto(propuesta.actividad) + ' ' }}
          <template v-if="propuesta.secuencia">
            <span class="etiqueta">Secuencia:</span> {{ conPunto(propuesta.secuencia) }}
          </template>
        </p>

        <p v-if="propuesta.antecedente || propuesta.proyeccion">
          <template v-if="propuesta.antecedente">
            <span class="etiqueta">Antecedente:</span> {{ conPunto(propuesta.antecedente) + ' ' }}
          </template>
          <template v-if="propuesta.proyeccion">
            <span class="etiqueta">Proyección:</span> {{ conPunto(propuesta.proyeccion) }}
          </template>
        </p>

        <div>
          <p><span class="etiqueta">Plan de aprendizaje y desarrollo de la intervención docente:</span></p>
          <ul class="plan">
            <li v-for="(paso, p) in propuesta.plan" :key="p">
              {{ paso.texto }}
              <ul v-if="paso.subpasos.length > 0">
                <li v-for="(subpaso, s) in paso.subpasos" :key="s">{{ subpaso }}</li>
              </ul>
            </li>
          </ul>
        </div>

        <div v-if="propuesta.adecuaciones.length > 0">
          <p><span class="etiqueta">Adecuación de acceso:</span></p>
          <ul class="plan">
            <li v-for="(adecuacion, a) in propuesta.adecuaciones" :key="a">{{ adecuacion }}</li>
          </ul>
        </div>
      </div>

      <div v-if="propuesta.recursos.length > 0" class="px-4 py-3 text-[15px] border-t-2 border-mona-200">
        <p><span class="etiqueta">Recursos:</span></p>
        <ul class="plan">
          <li v-for="(recurso, r) in propuesta.recursos" :key="r">{{ recurso }}</li>
        </ul>
      </div>
    </template>
  </div>
</template>

<style scoped>
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
