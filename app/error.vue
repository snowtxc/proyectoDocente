<script setup lang="ts">
import type { NuxtError } from '#app'

useSeoMeta({
  title: 'Página no encontrada',
  description: 'Lo sentimos, pero esta página no pudo ser encontrada.'
})

defineProps({
  error: {
    type: Object as PropType<NuxtError>,
    required: true
  }
})

useHead({
  htmlAttrs: {
    lang: 'es'
  }
})
</script>

<template>
  <div>
      <div class="w-full flex flex-col items-center justify-center text-center gap-4">
        <UError  
        :clear="{
          label: 'Volver al inicio',
          color: 'primary',
          size: 'xl',
          icon: 'tabler:home',
          class: 'rounded-full'
        }"
        :error="error" />
      </div>

    <UNotifications />
  </div>
</template>
