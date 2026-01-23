<script setup>
import lottie from 'lottie-web'

const props = defineProps({
  animationData: Object,
  loop: { type: Boolean, default: true },
  autoplay: { type: Boolean, default: true }
})

const container = ref(null)
let animation = null

onMounted(() => {
  animation = lottie.loadAnimation({
    container: container.value,
    renderer: 'svg',
    loop: props.loop,
    autoplay: props.autoplay,
    animationData: props.animationData
  })
})

onBeforeUnmount(() => {
  animation?.destroy()
})
</script>

<template>
  <div ref="container" />
</template>
