<script setup lang="ts">
import type { Grupo } from '~/types/grupo'
import { DEFAULT_GRUPO_LOGO, grupoImagen } from '~/utils/grupo'
import BadgeGrado from '~/components/badge/BadgeGrado.vue'
import { appRoutes } from '~/utils/appRoutes'

const props = defineProps<{
  grupo: Grupo
}>()

const emit = defineEmits<{
  (e: 'editar', grupo: Grupo): void
}>()

const imagen = computed(() => grupoImagen(props.grupo))

// Sin imagen propia (o si no carga) se muestra la inicial del grupo.
const imagenRota = ref(false)
const img = ref<HTMLImageElement | null>(null)

const tieneImagen = computed(() => imagen.value !== DEFAULT_GRUPO_LOGO && !imagenRota.value)
const inicial = computed(() => props.grupo.nombre.trim().charAt(0).toUpperCase() || '?')

onMounted(() => {
  // Si la imagen falló antes de que la página estuviera lista, el evento de error ya pasó.
  if (img.value?.complete && img.value.naturalWidth === 0) {
    imagenRota.value = true
  }
})
</script>

<template>
  <article class="tarjeta-grupo flex flex-col bg-white rounded-3xl border-2 border-mona-100 overflow-hidden">
    <!-- Franja de panal con el año -->
    <div class="franja relative h-20">
      <span class="absolute top-3 right-3 font-display text-lg font-bold text-mona-900 bg-white/85 rounded-xl px-3 py-0.5">
        {{ grupo.year }}
      </span>
    </div>

    <div class="relative px-5 -mt-9">
      <img
        v-if="tieneImagen"
        ref="img"
        :src="imagen"
        alt=""
        class="w-[4.5rem] h-[4.5rem] rounded-2xl border-4 border-white object-cover bg-miel-50 shadow-sm"
        @error="imagenRota = true"
      >
      <span
        v-else
        class="w-[4.5rem] h-[4.5rem] rounded-2xl border-4 border-white bg-mona-800 text-miel-300 shadow-sm flex items-center justify-center font-display text-4xl font-bold"
        aria-hidden="true"
      >
        {{ inicial }}
      </span>
    </div>

    <div class="px-5 pt-3 flex-1">
      <h3 class="font-display text-2xl font-bold text-mona-900 leading-tight break-words">
        {{ grupo.nombre }}
      </h3>

      <div class="mt-2.5 flex flex-wrap items-center gap-1.5">
        <BadgeGrado v-for="grado in grupo.grados" :key="grado.id" :grado="grado" />
        <span v-if="grupo.esMultiGrado" class="text-[11px] font-extrabold uppercase tracking-wide text-mona-700 bg-mona-50 rounded-full px-2.5 py-1">
          Multigrado
        </span>
        <span v-if="!grupo.grados?.length" class="text-sm text-red-700">
          Falta asignarle un grado
        </span>
      </div>
    </div>

    <div class="flex items-center gap-2 px-5 py-4">
      <NuxtLink
        :to="appRoutes.asistente()"
        class="boton-miel flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl font-display font-semibold"
      >
        <UIcon name="i-tabler-message-chatbot" class="w-5 h-5" />
        Planificar con Flopi
      </NuxtLink>
      <button
        type="button"
        class="boton-mona w-11 h-11 flex-shrink-0 rounded-2xl flex items-center justify-center"
        :aria-label="`Editar ${grupo.nombre}`"
        @click="emit('editar', grupo)"
      >
        <UIcon name="i-tabler-pencil" class="w-5 h-5" />
      </button>
    </div>
  </article>
</template>

<style scoped>
.tarjeta-grupo {
  box-shadow: 0 5px 0 0 var(--color-mona-100);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.tarjeta-grupo:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 0 0 var(--color-miel-200);
}

.franja {
  background-color: var(--color-miel-300);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='97' viewBox='0 0 56 97'%3E%3Cpath d='M28 1 55 16.5v31L28 63 1 47.5v-31z M28 63v33 M1 47.5 -26 63 M55 47.5 82 63' fill='none' stroke='%23d07c00' stroke-opacity='.35' stroke-width='2'/%3E%3C/svg%3E");
  background-size: 42px 73px;
}

@media (prefers-reduced-motion: reduce) {
  .tarjeta-grupo { transition: none; }
  .tarjeta-grupo:hover { transform: none; }
}
</style>
