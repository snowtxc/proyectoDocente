<script setup lang="ts">
withDefaults(defineProps<{
  // 'claro' para fondos oscuros, 'oscuro' para fondos claros.
  tono?: 'claro' | 'oscuro'
  to?: string
}>(), {
  tono: 'oscuro',
  to: '/',
})
</script>

<template>
  <NuxtLink :to="to" class="inline-flex items-center gap-2 rounded-xl" aria-label="Flopi Docentes, ir al inicio">
    <FlopiBee :size="38" fija :calco="tono === 'claro'" />
    <span class="font-display text-2xl font-bold leading-none" :class="tono === 'claro' ? 'text-white' : 'text-mona-900'">
      Flopi<span :class="tono === 'claro' ? 'text-miel-300' : 'text-miel-600'">Docentes</span>
    </span>
  </NuxtLink>
</template>
