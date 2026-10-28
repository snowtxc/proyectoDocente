<script setup lang="ts">
import { es } from '@nuxt/ui/locale'

useSeoMeta({
  ogImage: '/logo.png',
})


const loading = ref(true)

onMounted(async () => {
  loading.value = false
})

const colorMode = useColorMode()

colorMode.value == 'light';
const color = computed(() => colorMode.value === 'dark' ? '#111827' : 'white')

useHead({
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { key: 'theme-color', name: 'theme-color', content: color }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'es'
  }
})

const title = 'Flopi Docentes'
const description = 'Flopi Docentes ayuda a maestros de Uruguay a planificar, organizar y gestionar sus planes de aprendizaje en un entorno digital intuitivo y eficiente.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: 'https://dashboard-template.nuxt.dev/social-card.png',
  twitterImage: 'https://dashboard-template.nuxt.dev/social-card.png',
  twitterCard: 'summary_large_image'
})


</script>

<template>
  <div>
    <NuxtLoadingIndicator />

      <!-- En castellano: los meses y días del calendario y los textos de los componentes. -->
      <UApp :locale="es">
         <NuxtLayout>
          <NuxtPage />
        </NuxtLayout>

      </UApp>
  </div>
</template>


<style>
.UDashboardSlideover {
  z-index: 5000; /* Ajusta según sea necesario */
}
</style>
