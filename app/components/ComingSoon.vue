<script setup>
import beeWithFlowerAnimation from "@/lotties/cute bee with flower.json";

const props = defineProps({
  title: {
    type: String,
    default: '¡Próximamente!'
  },
  description: {
    type: String,
    default: 'Estamos trabajando en esta sección.'
  }
})

</script>

<template>
  <div class="w-full flex min-h-[calc(100vh-120px)] flex-col items-center justify-center text-center gap-4">
    <LottieAnimation :animationData="beeWithFlowerAnimation"></LottieAnimation>

    <h2 class="text-3xl font-semibold text-gray-900 dark:text-gray-100">
      {{ title }}
    </h2>

    <p class="text-xl max-w-sm text-gray-600 dark:text-gray-400">
      {{ description }}
    </p>
  </div>
</template>
