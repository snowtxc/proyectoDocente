<script setup lang="ts">
const links = [
  { label: 'Cómo funciona', to: '/#como-funciona' },
  { label: 'El programa', to: '/#programa' },
  { label: 'El documento', to: '/#documento' },
]
</script>

<template>
  <header class="sticky top-0 z-40 bg-white/90 backdrop-blur border-b-2 border-miel-200">
    <div class="max-w-6xl mx-auto flex items-center justify-between gap-4 px-4 sm:px-6 py-3">
      <FlopiLogo />

      <nav class="hidden md:flex items-center gap-1" aria-label="Secciones de la página">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="px-3 py-2 rounded-xl text-[15px] font-bold text-mona-800 hover:bg-mona-50"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>

      <div class="flex items-center gap-2">
        <NuxtLink to="/login" class="px-3 py-2 rounded-xl text-[15px] font-bold text-mona-800 hover:bg-mona-50">
          Entrar
        </NuxtLink>
        <NuxtLink to="/signup" class="boton-miel px-4 py-2 rounded-xl font-display font-semibold">
          Crear cuenta
        </NuxtLink>
      </div>
    </div>
  </header>
</template>
