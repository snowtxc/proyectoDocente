<script setup lang="ts">
// Un campo del tramo en el editor: se arrastra para ubicarlo, se renombra con el lápiz y se
// oculta o se muestra con un toque (en el celular arrastrar es más difícil).
defineProps<{
  porDefecto: string
  obligatorio: boolean
  oculto?: boolean
}>()

const emit = defineEmits<{ (e: 'ocultar'): void, (e: 'mostrar'): void }>()

const nombre = defineModel<string>({ required: true })
const editando = ref(false)
const entrada = ref<HTMLInputElement>()

const editar = async () => {
  editando.value = true
  await nextTick()
  entrada.value?.select()
}

const terminar = () => {
  editando.value = false
  nombre.value = nombre.value.trim()
}
</script>

<template>
  <div class="chip" :class="{ oculto }">
    <UIcon name="i-tabler-grip-vertical" class="w-3.5 h-3.5 flex-shrink-0 text-mona-400" aria-hidden="true" />

    <input
      v-if="editando"
      ref="entrada"
      v-model="nombre"
      type="text"
      maxlength="80"
      class="no-arrastrar flex-1 min-w-0 bg-transparent outline-none border-b-2 border-mona-400 text-sm font-bold"
      :placeholder="porDefecto"
      :aria-label="`Nombre de ${porDefecto}`"
      @blur="terminar"
      @keydown.enter.prevent="terminar"
      @keydown.esc.prevent="terminar"
    >
    <span v-else class="flex-1 min-w-0 text-sm font-bold leading-tight break-words hyphens-auto" lang="es" :title="nombre || porDefecto">
      {{ nombre || porDefecto }}
      <span v-if="obligatorio" class="sr-only">(no se puede ocultar)</span>
    </span>

    <button v-if="!oculto && !editando" type="button" class="no-arrastrar accion" title="Cambiar el nombre" @click="editar">
      <UIcon name="i-tabler-pencil" class="w-3 h-3" />
      <span class="sr-only">Cambiar el nombre de {{ nombre || porDefecto }}</span>
    </button>
    <button v-if="oculto" type="button" class="no-arrastrar accion" title="Mostrar" @click="emit('mostrar')">
      <UIcon name="i-tabler-eye" class="w-3 h-3" />
      <span class="sr-only">Mostrar {{ nombre || porDefecto }}</span>
    </button>
    <button v-else-if="!obligatorio && !editando" type="button" class="no-arrastrar accion" title="Ocultar" @click="emit('ocultar')">
      <UIcon name="i-tabler-eye-off" class="w-3 h-3" />
      <span class="sr-only">Ocultar {{ nombre || porDefecto }}</span>
    </button>
  </div>
</template>

<style scoped>
.chip {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  min-height: 2.1rem;
  padding: 0.25rem 0.2rem 0.25rem 0.2rem;
  border-radius: 0.65rem;
  background: #fff;
  border: 2px solid var(--color-mona-200);
  color: var(--color-mona-900);
  cursor: grab;
  touch-action: manipulation;
}

.chip:active {
  cursor: grabbing;
}

.chip.oculto {
  background: var(--color-mona-50);
  border-style: dashed;
  color: var(--color-mona-800);
}

.accion {
  width: 1.4rem;
  height: 1.4rem;
  flex-shrink: 0;
  border-radius: 0.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-mona-700);
}

.accion:hover {
  background: var(--color-mona-50);
}
</style>
