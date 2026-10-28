<script setup lang="ts">
import type { RecetaFormato } from '~/types/estilo'
import { familiaDe, tamanoEnPantalla } from '~/utils/recetaFormato'

// Una hoja del documento con el diseño de las descargas: la letra, su tamaño y cómo se alinea el texto.
const props = defineProps<{ receta: RecetaFormato }>()

const estilo = computed(() => ({
  fontFamily: familiaDe(props.receta),
  fontSize: tamanoEnPantalla(props.receta.fuente.tamano),
  '--alineacion-texto': props.receta.justificado ? 'justify' : 'left',
  '--separacion-parrafos': props.receta.disposicion === 'secuencial' ? '1px' : '6px',
}))
</script>

<template>
  <div class="hoja" :style="estilo">
    <slot />
  </div>
</template>

<style scoped>
.hoja {
  container-type: inline-size;
  background: #fff;
  color: #000;
  line-height: 1.3;
  padding: clamp(1rem, 6%, 3rem);
  box-shadow: 0 1px 6px rgb(0 0 0 / 0.12);
}
</style>
