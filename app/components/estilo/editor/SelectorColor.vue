<script setup lang="ts">
// Color de un elemento del formato: hex sin "#" (como en la receta). Según el uso también puede
// ser "ninguno" (null, para los fondos) o "espacio" (cada espacio de conocimiento con su color).
const props = withDefaults(defineProps<{
  etiqueta: string
  ninguno?: boolean
  espacio?: boolean
  // Para los fondos: tonos claros, para que el texto se siga leyendo.
  claros?: boolean
}>(), { ninguno: false, espacio: false, claros: false })

const color = defineModel<string | null>({ required: true })

const OSCUROS = ['000000', '444444', '1D2A82', '2E7D32', 'C62828', '6A1B9A', 'E65100', '00838F']
const CLAROS = ['F2F2F2', 'FFF1C6', 'DBE5FF', 'E3F2E5', 'FDE2EF', 'EDE3F7', 'FFE4CC', 'D9F2F2']

const muestras = computed(() => props.claros ? CLAROS : OSCUROS)
const esHex = computed(() => !!color.value && /^[0-9A-F]{6}$/i.test(color.value))
</script>

<template>
  <div class="flex flex-wrap items-center gap-1.5" role="group" :aria-label="etiqueta">
    <button
      v-if="espacio"
      type="button"
      class="muestra muestra-espacio"
      :class="{ elegida: color === 'espacio' }"
      :aria-pressed="color === 'espacio'"
      title="El color de cada espacio de conocimiento"
      @click="color = 'espacio'"
    >
      <span class="sr-only">El color de cada espacio</span>
    </button>
    <button
      v-if="ninguno"
      type="button"
      class="muestra muestra-ninguno"
      :class="{ elegida: color === null }"
      :aria-pressed="color === null"
      title="Sin color"
      @click="color = null"
    >
      <span class="sr-only">Sin color</span>
    </button>
    <button
      v-for="muestra in muestras"
      :key="muestra"
      type="button"
      class="muestra"
      :class="{ elegida: color?.toUpperCase() === muestra }"
      :style="{ backgroundColor: `#${muestra}` }"
      :aria-pressed="color?.toUpperCase() === muestra"
      :title="`#${muestra}`"
      @click="color = muestra"
    >
      <span class="sr-only">#{{ muestra }}</span>
    </button>
    <!-- Cualquier otro color con el selector del sistema. -->
    <label
      class="muestra muestra-otro"
      :class="{ elegida: esHex && !muestras.includes(color!.toUpperCase()) }"
      :style="esHex && !muestras.includes(color!.toUpperCase()) ? { backgroundColor: `#${color}` } : {}"
      title="Otro color"
    >
      <input
        type="color"
        class="sr-only"
        :value="esHex ? `#${color}` : '#000000'"
        @input="color = ($event.target as HTMLInputElement).value.slice(1).toUpperCase()"
      >
      <UIcon v-if="!(esHex && !muestras.includes(color!.toUpperCase()))" name="i-tabler-plus" class="w-3.5 h-3.5 text-mona-700" />
      <span class="sr-only">Otro color</span>
    </label>
  </div>
</template>

<style scoped>
.muestra {
  width: 1.6rem;
  height: 1.6rem;
  border-radius: 9999px;
  border: 2px solid rgba(23, 32, 97, 0.15);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.1s ease;
}

.muestra:hover {
  transform: scale(1.08);
}

.muestra.elegida {
  outline: 2px solid var(--color-mona-600);
  outline-offset: 2px;
}

.muestra-espacio {
  background: conic-gradient(#8bc63e 0 25%, #ed028c 0 50%, #00aeef 0 75%, #f7941d 0);
}

.muestra-ninguno {
  background: linear-gradient(135deg, #fff 45%, #c62828 45% 55%, #fff 55%);
}

.muestra-otro {
  background: #fff;
  border-style: dashed;
}
</style>
