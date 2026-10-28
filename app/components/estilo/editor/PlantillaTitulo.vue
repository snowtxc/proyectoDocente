<script setup lang="ts">
// Texto de un título del formato con datos que cambian en cada planificación: {DIA}, {GRUPO}…
// Los botones agregan el dato donde está el cursor.
const props = defineProps<{
  etiqueta: string
  marcadores: { valor: string, nombre: string }[]
}>()

const plantilla = defineModel<string>({ required: true })
const entrada = ref<HTMLInputElement>()

const agregar = async (marcador: string) => {
  const inicio = entrada.value?.selectionStart ?? plantilla.value.length
  const fin = entrada.value?.selectionEnd ?? inicio
  const antes = plantilla.value.slice(0, inicio)
  const separado = antes && !antes.endsWith(' ') ? `${antes} ${marcador}` : `${antes}${marcador}`

  plantilla.value = (separado + plantilla.value.slice(fin)).slice(0, 80)

  await nextTick()
  entrada.value?.focus()
  entrada.value?.setSelectionRange(separado.length, separado.length)
}

// Sin ningún dato el título sería siempre igual: el backend usa el de Flopi.
const sinDatos = computed(() => !props.marcadores.some(m => plantilla.value.includes(m.valor)))
</script>

<template>
  <div>
    <input
      ref="entrada"
      v-model="plantilla"
      type="text"
      maxlength="80"
      class="entrada"
      :aria-label="etiqueta"
    >
    <div class="flex flex-wrap items-center gap-1.5 mt-1.5">
      <span class="text-xs text-mona-800/70">Agregar:</span>
      <button v-for="marcador in marcadores" :key="marcador.valor" type="button" class="marcador" @click="agregar(marcador.valor)">
        + {{ marcador.nombre }}
      </button>
    </div>
    <p v-if="sinDatos" class="text-xs text-miel-700 mt-1">
      Agregá al menos un dato (por ejemplo, {{ marcadores[0]?.nombre }}). Si no, se usa el título de Flopi.
    </p>
  </div>
</template>

<style scoped>
.entrada {
  width: 100%;
  border: 2px solid var(--color-mona-100);
  border-radius: 0.6rem;
  padding: 0.35rem 0.65rem;
  font-size: 0.9rem;
  color: var(--color-mona-950);
  background: #fff;
  outline: none;
}

.entrada:focus {
  border-color: var(--color-mona-400);
}

.marcador {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-mona-700);
  background: var(--color-mona-50);
  border-radius: 9999px;
  padding: 0.1rem 0.55rem;
}

.marcador:hover {
  background: var(--color-mona-100);
}
</style>
