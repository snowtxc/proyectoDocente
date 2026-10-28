<script setup lang="ts">
import type { Alineacion } from '~/types/estilo'

// Barra de estilo de un texto del formato, como la de Word: negrita, cursiva, subrayado,
// mayúsculas, tamaño, color y alineación. Muestra solo lo que ese texto admite.
const props = withDefaults(defineProps<{
  min?: number
  max?: number
  conTamano?: boolean
  conColor?: boolean
  conAlineacion?: boolean
}>(), { min: 8, max: 36, conTamano: true, conColor: true, conAlineacion: true })

const estilo = defineModel<{
  negrita: boolean
  cursiva: boolean
  subrayado: boolean
  mayusculas: boolean
  tamano?: number
  color?: string
  alineacion?: Alineacion
}>({ required: true })

const marcas = [
  { clave: 'negrita', icono: 'i-tabler-bold', nombre: 'Negrita' },
  { clave: 'cursiva', icono: 'i-tabler-italic', nombre: 'Cursiva' },
  { clave: 'subrayado', icono: 'i-tabler-underline', nombre: 'Subrayado' },
  { clave: 'mayusculas', icono: 'i-tabler-letter-case-upper', nombre: 'Todo en mayúsculas' },
] as const

const alineaciones: { valor: Alineacion, icono: string, nombre: string }[] = [
  { valor: 'izquierda', icono: 'i-tabler-align-left', nombre: 'A la izquierda' },
  { valor: 'centro', icono: 'i-tabler-align-center', nombre: 'Centrado' },
  { valor: 'derecha', icono: 'i-tabler-align-right', nombre: 'A la derecha' },
]

const cambiarTamano = (paso: number) => {
  estilo.value.tamano = Math.min(props.max, Math.max(props.min, (estilo.value.tamano ?? 12) + paso))
}

const color = computed({
  get: () => estilo.value.color ?? '000000',
  set: (valor) => { estilo.value.color = valor ?? '000000' },
})
</script>

<template>
  <div class="space-y-2">
    <div class="flex flex-wrap items-center gap-1.5">
      <div class="grupo" role="group" aria-label="Estilo de la letra">
        <button
          v-for="marca in marcas"
          :key="marca.clave"
          type="button"
          class="boton-estilo"
          :class="{ activo: estilo[marca.clave] }"
          :aria-pressed="estilo[marca.clave]"
          :title="marca.nombre"
          @click="estilo[marca.clave] = !estilo[marca.clave]"
        >
          <UIcon :name="marca.icono" class="w-4 h-4" />
          <span class="sr-only">{{ marca.nombre }}</span>
        </button>
      </div>

      <div v-if="conTamano" class="grupo" role="group" aria-label="Tamaño de la letra">
        <button type="button" class="boton-estilo" title="Más chica" :disabled="(estilo.tamano ?? 12) <= min" @click="cambiarTamano(-1)">
          <UIcon name="i-tabler-minus" class="w-3.5 h-3.5" />
          <span class="sr-only">Más chica</span>
        </button>
        <span class="tamano" aria-live="polite">{{ estilo.tamano }} pt</span>
        <button type="button" class="boton-estilo" title="Más grande" :disabled="(estilo.tamano ?? 12) >= max" @click="cambiarTamano(1)">
          <UIcon name="i-tabler-plus" class="w-3.5 h-3.5" />
          <span class="sr-only">Más grande</span>
        </button>
      </div>

      <div v-if="conAlineacion" class="grupo" role="group" aria-label="Alineación">
        <button
          v-for="alineacion in alineaciones"
          :key="alineacion.valor"
          type="button"
          class="boton-estilo"
          :class="{ activo: estilo.alineacion === alineacion.valor }"
          :aria-pressed="estilo.alineacion === alineacion.valor"
          :title="alineacion.nombre"
          @click="estilo.alineacion = alineacion.valor"
        >
          <UIcon :name="alineacion.icono" class="w-4 h-4" />
          <span class="sr-only">{{ alineacion.nombre }}</span>
        </button>
      </div>
    </div>

    <EstiloEditorSelectorColor v-if="conColor" v-model="color" etiqueta="Color del texto" />
  </div>
</template>

<style scoped>
.grupo {
  display: inline-flex;
  align-items: center;
  border: 2px solid var(--color-mona-100);
  border-radius: 0.75rem;
  padding: 2px;
  background: #fff;
}

.boton-estilo {
  width: 1.9rem;
  height: 1.9rem;
  border-radius: 0.55rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-mona-800);
}

.boton-estilo:not(:disabled):hover {
  background: var(--color-mona-50);
}

.boton-estilo.activo {
  background: var(--color-mona-600);
  color: #fff;
}

.boton-estilo:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.tamano {
  min-width: 3rem;
  text-align: center;
  font-size: 0.8rem;
  font-weight: 800;
  color: var(--color-mona-900);
}
</style>
