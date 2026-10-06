<script setup lang="ts">
import type { Opciones, OpcionItem } from '~/types/asistente'

const props = defineProps<{
  opciones: Opciones
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'elegir', ids: (number | string)[], textoVisible?: string): void
}>()

const seleccionados = ref<(number | string)[]>([])

// Fechas elegidas con el calendario.
const desde = ref('')
const hasta = ref('')

// Si llegan opciones nuevas se empieza de cero.
watch(() => props.opciones, () => {
  seleccionados.value = []
  desde.value = ''
  hasta.value = ''
})

const maximoAlcanzado = computed(() =>
  !!props.opciones.maximo && seleccionados.value.length >= props.opciones.maximo
)

const estaElegido = (item: OpcionItem) => seleccionados.value.includes(item.id)

const alternar = (item: OpcionItem) => {
  if (estaElegido(item)) {
    seleccionados.value = seleccionados.value.filter(id => id !== item.id)
  } else if (!maximoAlcanzado.value) {
    seleccionados.value = [...seleccionados.value, item.id]
  }
}

const puedeContinuar = computed(() => seleccionados.value.length > 0 || !!props.opciones.opcional)

const confirmar = () => {
  if (seleccionados.value.length > 0) {
    emit('elegir', seleccionados.value)
  } else if (props.opciones.opcional) {
    emit('elegir', ['ninguno'], 'Sigo sin elegir')
  }
}

const fechasValidas = computed(() => desde.value !== '' && (hasta.value === '' || hasta.value >= desde.value))

const fechaLarga = (fecha: string) =>
  new Date(`${fecha}T12:00:00`).toLocaleDateString('es-UY', { weekday: 'long', day: 'numeric', month: 'long' })

const confirmarFechas = () => {
  if (!fechasValidas.value) return

  const fin = hasta.value || desde.value

  emit(
    'elegir',
    [desde.value, fin],
    fin === desde.value ? `Solo el ${fechaLarga(desde.value)}` : `Del ${fechaLarga(desde.value)} al ${fechaLarga(fin)}`
  )
}
</script>

<template>
  <!-- Fechas: atajos y calendario -->
  <div v-if="opciones.tipo === 'fechas'" class="aparecer space-y-3">
    <div class="flex flex-wrap gap-2.5">
      <button
        v-for="item in opciones.items"
        :key="item.id"
        type="button"
        :disabled="disabled"
        class="opcion text-left px-4 py-2.5 rounded-2xl border-2 border-miel-400 bg-miel-50 hover:bg-miel-100 disabled:opacity-50 disabled:cursor-not-allowed"
        @click="emit('elegir', [item.id], item.detalle ?? item.texto)"
      >
        <span class="block font-display text-base font-semibold text-mona-950 leading-snug">{{ item.texto }}</span>
        <span v-if="item.detalle" class="block text-xs text-mona-800/70 mt-0.5">{{ item.detalle }}</span>
      </button>
    </div>

    <div class="p-4 bg-white rounded-2xl border-2 border-mona-100">
      <p class="font-display text-base font-semibold text-mona-900 mb-2.5">O elegí las fechas</p>
      <div class="flex flex-wrap items-end gap-3">
        <label class="flex-1 min-w-36 text-xs font-extrabold uppercase tracking-wide text-mona-700">
          Desde
          <input
            v-model="desde"
            type="date"
            :disabled="disabled"
            class="campo-fecha mt-1 block w-full"
          >
        </label>
        <label class="flex-1 min-w-36 text-xs font-extrabold uppercase tracking-wide text-mona-700">
          Hasta
          <input
            v-model="hasta"
            type="date"
            :min="desde || undefined"
            :disabled="disabled"
            class="campo-fecha mt-1 block w-full"
          >
        </label>
        <button
          type="button"
          :disabled="disabled || !fechasValidas"
          class="boton-miel inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-display text-base font-semibold"
          @click="confirmarFechas"
        >
          Continuar
          <UIcon name="i-tabler-arrow-right" class="w-5 h-5" />
        </button>
      </div>
      <p class="text-xs text-mona-800/60 mt-2.5">
        Para un solo día alcanza con "Desde". Los sábados y domingos se saltean.
      </p>
    </div>
  </div>

  <!-- Selección simple: un clic y se envía -->
  <div v-else-if="opciones.tipo === 'simple'" class="aparecer flex flex-wrap gap-2.5">
    <button
      v-for="item in opciones.items"
      :key="item.id"
      type="button"
      :disabled="disabled"
      class="opcion text-left px-4 py-2.5 rounded-2xl border-2 border-miel-400 bg-miel-50 hover:bg-miel-100 disabled:opacity-50 disabled:cursor-not-allowed"
      @click="emit('elegir', [item.id])"
    >
      <span class="block font-display text-base font-semibold text-mona-950 leading-snug">{{ item.texto }}</span>
      <span v-if="item.detalle" class="block text-xs text-mona-800/70 mt-0.5">{{ item.detalle }}</span>
    </button>
  </div>

  <!-- Selección múltiple: se marcan varias y se confirma -->
  <div v-else class="aparecer space-y-3">
    <div class="space-y-2 max-h-[22rem] overflow-y-auto pr-1 pb-1">
      <button
        v-for="item in opciones.items"
        :key="item.id"
        type="button"
        role="checkbox"
        :aria-checked="estaElegido(item)"
        :disabled="disabled || (!estaElegido(item) && maximoAlcanzado)"
        class="opcion w-full flex items-start gap-3 text-left px-4 py-3 rounded-2xl border-2 disabled:opacity-45 disabled:cursor-not-allowed"
        :class="estaElegido(item)
          ? 'border-miel-500 bg-miel-100'
          : 'border-mona-100 bg-white hover:border-miel-300'"
        @click="alternar(item)"
      >
        <span
          class="mt-0.5 w-6 h-6 flex-shrink-0 rounded-lg border-2 flex items-center justify-center transition-colors"
          :class="estaElegido(item) ? 'bg-miel-500 border-miel-600' : 'bg-white border-mona-200'"
        >
          <UIcon v-if="estaElegido(item)" name="i-tabler-check" class="w-4 h-4 text-white" />
        </span>
        <span class="min-w-0">
          <span class="block text-[15px] text-mona-950 leading-snug">{{ item.texto }}</span>
          <span v-if="item.detalle" class="block text-xs text-mona-800/60 mt-1">{{ item.detalle }}</span>
        </span>
      </button>
    </div>

    <div class="flex items-center justify-between gap-3">
      <p class="text-sm text-mona-800/70">
        <strong class="text-mona-900">{{ seleccionados.length }}</strong>
        elegido{{ seleccionados.length === 1 ? '' : 's' }}
        <template v-if="opciones.maximo"> de {{ opciones.maximo }} como máximo</template>
      </p>
      <button
        type="button"
        :disabled="disabled || !puedeContinuar"
        class="boton-miel inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-display text-base font-semibold"
        @click="confirmar"
      >
        {{ seleccionados.length === 0 && opciones.opcional ? 'Seguir sin elegir' : 'Continuar' }}
        <UIcon name="i-tabler-arrow-right" class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.opcion {
  transition: transform 0.12s ease, background-color 0.12s ease, border-color 0.12s ease;
}

.opcion:not(:disabled):hover {
  transform: translateY(-1px);
}

.opcion:not(:disabled):active {
  transform: translateY(1px);
}

.campo-fecha {
  font-family: var(--font-sans);
  font-size: 0.95rem;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0;
  color: var(--color-mona-950);
  background-color: #fff;
  border: 2px solid var(--color-mona-200);
  border-radius: 0.85rem;
  padding: 0.5rem 0.75rem;
}

.campo-fecha:focus {
  outline: none;
  border-color: var(--color-mona-500);
}

@media (prefers-reduced-motion: reduce) {
  .opcion { transition: none; }
  .opcion:not(:disabled):hover,
  .opcion:not(:disabled):active { transform: none; }
}
</style>
