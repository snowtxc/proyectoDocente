<script setup lang="ts">
// Marco compartido de las pantallas de acceso: Flopi a la izquierda, el formulario a la derecha.
defineProps<{
  // Lo que dice Flopi en el globo.
  saludo: string
  detalle: string
}>()
</script>

<template>
  <div class="min-h-dvh grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] bg-panal">
    <!-- Flopi -->
    <aside class="relative hidden lg:flex flex-col justify-between overflow-hidden bg-panal-mona text-white p-10 xl:p-14">
      <FlopiLogo tono="claro" />

      <div class="relative">
        <!-- Globo de diálogo -->
        <div class="globo relative max-w-md bg-white text-mona-950 rounded-[2rem] rounded-bl-lg px-7 py-6 shadow-[0_8px_0_0_var(--color-mona-950)]">
          <p class="font-display text-4xl xl:text-5xl font-bold leading-[1.05] text-mona-900">{{ saludo }}</p>
          <p class="mt-3 text-lg text-mona-800/85 leading-snug">{{ detalle }}</p>
        </div>
        <FlopiBee :size="190" calco class="mt-5 ml-2" />
      </div>

      <p class="relative text-sm text-mona-200">Hecho en Uruguay, para docentes de inicial y primaria.</p>

      <!-- Celdas de miel decorativas -->
      <svg class="absolute -right-16 -bottom-14 w-72 text-miel-400" viewBox="0 0 200 220" aria-hidden="true">
        <path d="M100 6 180 52v92l-80 46-80-46V52z" fill="currentColor" />
        <path d="M100 40 150 69v58l-50 29-50-29V69z" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="5" />
      </svg>
      <svg class="absolute right-40 bottom-40 w-24 text-miel-300/80" viewBox="0 0 200 220" aria-hidden="true">
        <path d="M100 6 180 52v92l-80 46-80-46V52z" fill="currentColor" />
      </svg>
      <svg class="absolute -right-6 top-16 w-28 text-white/10" viewBox="0 0 200 220" aria-hidden="true">
        <path d="M100 6 180 52v92l-80 46-80-46V52z" fill="currentColor" />
      </svg>
    </aside>

    <!-- Formulario -->
    <main class="flex flex-col items-center justify-center px-5 py-10">
      <div class="w-full max-w-md">
        <div class="lg:hidden flex flex-col items-center text-center mb-6">
          <FlopiBee :size="96" />
          <p class="font-display text-2xl font-bold text-mona-900 mt-2">{{ saludo }}</p>
        </div>

        <div class="bg-white rounded-[2rem] border-2 border-mona-100 shadow-[0_8px_0_0_var(--color-mona-100)] px-6 sm:px-9 py-8">
          <slot />
        </div>

        <p class="mt-6 text-center text-sm text-mona-800/60">
          © {{ new Date().getFullYear() }} Flopi Docentes
        </p>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Colita del globo apuntando a Flopi. */
.globo::after {
  content: '';
  position: absolute;
  left: 2.5rem;
  bottom: -1.1rem;
  width: 1.6rem;
  height: 1.6rem;
  background-color: #fff;
  clip-path: polygon(0 0, 100% 0, 15% 100%);
}
</style>
