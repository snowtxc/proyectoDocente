<template>
  <footer class="bg-panal-mona text-mona-100">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <FlopiLogo tono="claro" />
        <p class="mt-2 text-sm text-mona-200 max-w-sm">
          Un asistente para que docentes de inicial y primaria de Uruguay armen sus planificaciones conversando.
        </p>
      </div>

      <nav class="flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold" aria-label="Enlaces legales">
        <NuxtLink to="/terminos-y-condiciones" class="hover:text-white underline underline-offset-4">Términos y condiciones</NuxtLink>
        <NuxtLink to="/politica-de-privacidad" class="hover:text-white underline underline-offset-4">Política de privacidad</NuxtLink>
        <NuxtLink to="/login" class="hover:text-white underline underline-offset-4">Entrar</NuxtLink>
      </nav>
    </div>
    <div class="border-t border-white/10">
      <p class="max-w-6xl mx-auto px-4 sm:px-6 py-4 text-xs text-mona-200">
        © {{ new Date().getFullYear() }} Flopi Docentes · Hecho en Uruguay
      </p>
    </div>
  </footer>
</template>
