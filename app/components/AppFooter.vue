<template>
  <footer class="bg-white border-t border-yellow-100">
    <div class="container mx-auto px-4 py-12 md:py-16">
      <!-- Grid principal -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
        <!-- Columna 1: Logo y descripción -->
        <div class="lg:col-span-4 space-y-4">
  <NuxtLink to="/" class="flex items-center gap-2 hover:opacity-80 transition-opacity">
    <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-sm">
      <UIcon name="i-lucide-notebook-text" class="w-5 h-5 text-white" />
    </div>
    <span class="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-yellow-600 to-amber-600">
      FlopiDocentes
    </span>
  </NuxtLink>
  <p class="text-gray-600 text-sm leading-relaxed max-w-xs">
    La herramienta que simplifica la planificación docente en Uruguay. Todo lo que necesitas en un solo lugar.
  </p>
  <div class="flex items-center gap-3 pt-2">
    <UButton
      v-for="social in socialLinks"
      :key="social.label"
      :icon="social.icon"
      :to="social.to"
      variant="ghost"
      color="neutral"
      class="hover:bg-yellow-50 hover:text-yellow-600"
      :aria-label="social.label"
      target="_blank"
    />
  </div>
</div>

        <!-- Columna 2: Producto -->
        <div class="lg:col-span-2">
          <h3 class="font-semibold text-gray-900 mb-4">Producto</h3>
          <ul class="space-y-3">
            <li v-for="link in productLinks" :key="link.label">
              <NuxtLink
                :to="link.to"
                class="text-gray-600 hover:text-yellow-600 text-sm transition-colors"
              >
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Columna 3: Recursos -->
        <div class="lg:col-span-2">
          <h3 class="font-semibold text-gray-900 mb-4">Recursos</h3>
          <ul class="space-y-3">
            <li v-for="link in resourceLinks" :key="link.label">
              <NuxtLink
                :to="link.to"
                class="text-gray-600 hover:text-yellow-600 text-sm transition-colors"
              >
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Columna 4: Legal y contacto -->
        <div class="lg:col-span-2">
          <h3 class="font-semibold text-gray-900 mb-4">Legal</h3>
          <ul class="space-y-3">
            <li v-for="link in legalLinks" :key="link.label">
              <NuxtLink
                :to="link.to"
                class="text-gray-600 hover:text-yellow-600 text-sm transition-colors"
              >
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Columna 5: Contacto -->
        <div class="lg:col-span-2">
          <h3 class="font-semibold text-gray-900 mb-4">Contacto</h3>
          <ul class="space-y-3">
            <li>
              <a
                href="rodrigocastro.v24@gmail.com"
                class="text-gray-600 hover:text-yellow-600 text-sm transition-colors flex items-center gap-2"
              >
                <UIcon name="i-lucide-mail" class="w-4 h-4" />
                rodrigocastro.v24@gmail.com
              </a>
            </li>
            <li>
              <a
                href="#"
                class="text-gray-600 hover:text-yellow-600 text-sm transition-colors flex items-center gap-2"
              >
                <UIcon name="i-lucide-message-circle" class="w-4 h-4" />
                WhatsApp
              </a>
            </li>
            <li class="pt-2">
              <span class="text-sm text-gray-500 block">Soporte:</span>
              <span class="text-sm text-gray-600">Lun a Vie 9:00 - 18:00</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Separador -->
      <div class="border-t border-yellow-100 my-8"></div>

      <!-- Bottom bar -->
      <div class="flex flex-col md:flex-row justify-between items-center gap-4">
        <p class="text-sm text-gray-500">
          © {{ new Date().getFullYear() }} FlopiDocentes. Todos los derechos reservados.
        </p>
        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-500 flex items-center gap-1">
            <UIcon name="i-lucide-map-pin" class="w-4 h-4" />
            Montevideo, Uruguay
          </span>
          <span class="text-sm text-gray-500 flex items-center gap-1">
            <UIcon name="i-lucide-shield" class="w-4 h-4" />
            Datos seguros
          </span>
        </div>
      </div>

      <!-- Badge ANEP (opcional, si aplica) -->
      <div class="mt-6 flex justify-center md:justify-start">
        <div class="inline-flex items-center gap-2 bg-yellow-50 px-3 py-1.5 rounded-full">
          <UIcon name="i-lucide-book-check" class="w-4 h-4 text-yellow-600" />
          <span class="text-xs text-yellow-700">Programa curricular ANEP integrado</span>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
// Redes sociales
const socialLinks = [
  { icon: 'i-lucide-instagram', to: 'https://instagram.com/flopidocentes', label: 'Instagram' },
]

// Enlaces de producto
const productLinks = [
  { label: 'Características', to: '/#features' },
  { label: 'Cómo funciona', to: '/como-funciona' },
  { label: 'Precios', to: '/precios' },
  { label: 'Para instituciones', to: '/instituciones' }
]

// Enlaces de recursos
const resourceLinks = [
  { label: 'Blog', to: '/blog' },
  { label: 'Guías y tutoriales', to: '/guias' },
  { label: 'Preguntas frecuentes', to: '/faq' },
  { label: 'Actualizaciones', to: '/actualizaciones' }
]

// Enlaces legales
const legalLinks = [
  { label: 'Términos y condiciones', to: '/terminos-y-condiciones' },
  { label: 'Política de privacidad', to: '/politica-de-privacidad' },
  { label: 'Términos de pago', to: '/pago' }
]
</script>

<style scoped>
/* Transiciones suaves para los links */
a {
  transition: color 0.2s ease;
}

/* Efecto hover en iconos sociales */
:deep(.UButton.variant-ghost) {
  transition: all 0.2s ease;
}
</style>
