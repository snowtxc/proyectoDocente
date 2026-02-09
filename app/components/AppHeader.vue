<script setup lang="ts">
import type { NavItem } from '@nuxt/content'

const navigation = inject<Ref<NavItem[]>>('navigation', ref([]))

const links = [{
  label: 'Funcionalidades',
  to: '/#features'
}, {
  label: 'Cómo Funciona',
  to: '/como-funciona'
}, {
  label: 'Precios',
  to: '/precios'
}, {
  label: 'Blog',
  to: '/blog'
}]
</script>

<template>
  <UHeader :links="links" title="FlopiDocentes">
    <template #logo>
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-500 flex items-center justify-center">
          <UIcon name="i-lucide-book-open" class="w-5 h-5 text-white" />
        </div>
        <span class="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-yellow-600">
          FlopiDocentes
        </span>
      </div>
    </template>

    <template #right>
      <UButton
        label="Ingresar"
        variant="ghost"
        color="primary"
        to="/login"
        class="hover:bg-yellow-50"
        icon
      />
      <UButton
        label="Probar Gratis"
        icon="i-lucide-sparkles"
        trailing
        color="warning"
        to="/signup"
        class="hidden lg:flex shadow-md hover:shadow-lg transition-shadow"
      />
    </template>
  </UHeader>
</template>

<style>
/* Estilos personalizados para el header */
:deep(.UHeader) {
  border-bottom: 1px solid rgb(250 204 21 / 0.3);
  backdrop-filter: blur(8px);
  background-color: rgba(255, 255, 255, 0.95);
}

:deep(.UHeader .UButton) {
  &.color-yellow {
    background: linear-gradient(135deg, #fbbf24, #f59e0b);
    color: white;
    border: none;
  }
  
  &.color-yellow:hover {
    background: linear-gradient(135deg, #f59e0b, #d97706);
    transform: translateY(-1px);
  }
}
</style>