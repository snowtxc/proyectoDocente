<script setup lang="ts">
import type { PropuestaPresentada } from '~/types/asistente'
import type { RecetaFormato } from '~/types/estilo'
import PropuestaCampo from '~/components/asistente/PropuestaCampo.vue'
import { camposVisibles, colorEtiqueta, estiloBloque, estiloEtiqueta, textoEtiqueta, textoTramo } from '~/utils/recetaFormato'

// Vista de lectura de un tramo con el diseño de las descargas: el mismo cuadro (o texto seguido)
// que arma la plantilla del PDF en el backend (planificaciones/pdf.blade.php).
const props = defineProps<{
  propuesta: PropuestaPresentada
  receta: RecetaFormato
  // Lugar del tramo en el día (1, 2…), para su título.
  numero: number
}>()

const campos = computed(() => camposVisibles(props.receta))
const columnas = computed(() => props.receta.disposicion === 'cuadricula' ? Math.max(1, ...props.receta.filas.map(fila => fila.length)) : 2)
const titulo = computed(() => textoTramo(props.receta, props.numero, props.propuesta.numero))

// Las etiquetas van del color del espacio de conocimiento o del que eligió el docente; en una actividad, negras.
const etiqueta = computed(() => estiloEtiqueta(props.receta, props.propuesta.tipo === 'curricular'
  ? colorEtiqueta(props.receta, props.propuesta.referencias.espacio_oficial ?? props.propuesta.referencias.espacio, props.propuesta.referencias.color)
  : '000000'))

const fondo = (color: string | null) => color ? `#${color}` : undefined

// En la cuadrícula, la última celda de cada fila ocupa las columnas que sobran.
const ocupa = (celdas: number, k: number) => k === celdas - 1 ? columnas.value - celdas + 1 : 1
</script>

<template>
  <!-- Texto seguido, sin cuadro -->
  <div v-if="receta.disposicion === 'secuencial'" class="tramo-secuencial">
    <div v-if="receta.tramo.mostrar" class="titulo" :style="estiloBloque(receta.tramo)">{{ titulo }}</div>

    <p v-if="propuesta.tipo === 'libre'"><span :style="etiqueta">Actividad:</span> {{ propuesta.actividad }}</p>
    <template v-else>
      <template v-for="(campo, j) in campos" :key="campo">
        <div v-if="j > 0 && receta.espacio_entre_campos" class="separador" />
        <PropuestaCampo :propuesta="propuesta" :receta="receta" :campo="campo" :estilo-etiqueta="etiqueta" con-etiqueta />
      </template>
    </template>
  </div>

  <!-- Un cuadro por tramo -->
  <table v-else class="cuadro" :style="{ '--borde': `#${receta.tabla.borde}` }">
    <tbody>
      <tr v-if="receta.tramo.mostrar">
        <td :colspan="columnas" :style="[estiloBloque(receta.tramo), { backgroundColor: fondo(receta.tabla.fondo_tramo) }]">{{ titulo }}</td>
      </tr>

      <tr v-if="propuesta.tipo === 'libre'">
        <td :colspan="columnas"><span :style="etiqueta">Actividad:</span> {{ propuesta.actividad }}</td>
      </tr>

      <template v-else-if="receta.disposicion === 'tabla_etiquetas'">
        <tr v-for="campo in campos" :key="campo">
          <td :style="{ width: `${receta.tabla.ancho_etiqueta}%`, backgroundColor: fondo(receta.tabla.fondo_etiqueta) }">
            <span :style="etiqueta">{{ textoEtiqueta(receta, campo) }}</span>
          </td>
          <td>
            <PropuestaCampo :propuesta="propuesta" :receta="receta" :campo="campo" :estilo-etiqueta="etiqueta" :con-etiqueta="false" />
          </td>
        </tr>
      </template>

      <template v-else>
        <tr v-for="(fila, f) in receta.filas" :key="f">
          <td
            v-for="(celda, k) in fila"
            :key="k"
            :colspan="ocupa(fila.length, k)"
            :style="{ width: `${Math.round(100 / columnas * ocupa(fila.length, k))}%` }"
          >
            <template v-for="(campo, m) in celda" :key="campo">
              <div v-if="m > 0" class="separador" />
              <PropuestaCampo :propuesta="propuesta" :receta="receta" :campo="campo" :estilo-etiqueta="etiqueta" con-etiqueta />
            </template>
          </td>
        </tr>
      </template>
    </tbody>
  </table>
</template>

<style scoped>
/* Las mismas medidas que la plantilla del PDF. */
.titulo { margin: 0 0 10px 0; }
.tramo-secuencial { margin-bottom: 16px; }
.separador { height: 8px; }

/* Preflight de Tailwind deja los párrafos sin margen: el de los cuadros lo pone la hoja. */
p { margin: 0 0 var(--separacion-parrafos, 6px) 0; }

.cuadro {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 16px;
}

.cuadro td {
  border: 1px solid var(--borde);
  padding: 5px 8px;
  vertical-align: top;
}

/* En una pantalla angosta (el celular) las celdas van una abajo de la otra. */
@container (max-width: 30rem) {
  .cuadro,
  .cuadro tbody,
  .cuadro tr,
  .cuadro td {
    display: block;
    width: auto !important;
  }

  .cuadro tr + tr td,
  .cuadro td + td {
    border-top: 0;
  }
}
</style>
