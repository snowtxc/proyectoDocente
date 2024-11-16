<script setup lang="ts">
import { Vue3Lottie } from "vue3-lottie";
import lottieSpinner from "@/lotties/spinner.json";
</script>

<template>
  <Teleport to="body">
    <section id="spinnerGlobal"
      class="w-screen z-[9999] fixed top-0 left-0 h-screen flex items-center justify-center globalSpinner">
      <Vue3Lottie :animationData="lottieSpinner" :height="200" :width="200" />
    </section>
  </Teleport>

</template>

<style scoped>
.globalSpinner {
  position: fixed;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.459);
  z-index: 9999;
}
</style>
