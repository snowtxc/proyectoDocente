<script setup lang="ts">
import type { NavItem } from '@nuxt/content'

const navigation = inject<Ref<NavItem[]>>('navigation', ref([]))

const links = [{
  label: 'Características',
  to: '/#features'
}, {
  label: 'Cómo funciona',
  to: '/como-funciona'
}, {
  label: 'Precios',
  to: '/precios'
}, {
  label: 'Blog',
  to: '/blog'
}]

// Detectar scroll para cambiar estilos
const isScrolled = ref(false)

const handleScroll = () => {
  isScrolled.value = window.scrollY > 10
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <UHeader
    :links="links"
    :ui="{
      root: 'fixed top-0 w-full z-50 transition-all duration-300',
      container: 'px-4 sm:px-6 lg:px-8',
    }"
    :class="[
      isScrolled
        ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-yellow-200/50'
        : 'bg-white/80 backdrop-blur-sm border-b border-transparent'
    ]"
  >
    <template #left>
       <NuxtLink to="/" class="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-sm">
          <UIcon name="i-lucide-notebook-text" class="w-5 h-5 text-white" />
        </div>
        <span class="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-yellow-600 to-amber-600">
          FlopiDocentes
        </span>
  </NuxtLink>


    </template>

    <template #right>
      <div class="flex items-center gap-2">
        <UButton
          label="Ingresar"
          variant="ghost"
          color="neutral"
          to="/login"
          class="hover:bg-yellow-50 hidden sm:inline-flex"
        />
        <UButton
          label="Comenzar gratis"
          icon="i-lucide-sparkles"
          trailing
          to="/signup"
          class="hidden lg:inline-flex bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200"
        />
      </div>
    </template>

    <!-- Versión móvil del botón "Comenzar gratis" -->
    <template #body>
      <div class="lg:hidden p-4 border-t border-yellow-100 bg-yellow-50/50">
        <UButton
          label="Comenzar gratis"
          icon="i-lucide-sparkles"
          trailing
          to="/signup"
          block
          class="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white border-0 shadow-md"
        />
      </div>
    </template>
  </UHeader>
</template>