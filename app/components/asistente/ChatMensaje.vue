<script setup lang="ts">
import type { MensajeChat } from '~/types/asistente'

defineProps<{
  mensaje: MensajeChat
}>()
</script>

<template>
  <div class="aparecer flex items-end gap-2.5" :class="mensaje.rol === 'docente' ? 'justify-end' : 'justify-start'">
    <FlopiBee v-if="mensaje.rol === 'asistente'" :size="40" fija class="mb-1" />

    <div
      class="max-w-[85%] px-4 py-3 text-[15px] leading-relaxed whitespace-pre-line break-words"
      :class="mensaje.rol === 'docente'
        ? 'bg-mona-700 text-white rounded-3xl rounded-br-lg shadow-[0_3px_0_0_var(--color-mona-900)]'
        : 'bg-white text-mona-950 rounded-3xl rounded-bl-lg border-2 border-miel-200 shadow-[0_3px_0_0_var(--color-miel-200)]'"
    >
      {{ mensaje.contenido }}
    </div>
  </div>
</template>
