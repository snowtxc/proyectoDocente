<template>
  <div v-if="showOverlay" class="fixed inset-0 z-[9999]">
    <!-- Fondo con blur -->
    <div 
      class="absolute inset-0 bg-transparent backdrop-blur-md"
      @click="preventClose"
    />
    
    <!-- Modal -->
    <div class="relative h-full flex items-center justify-center p-4">
      <div class="bg-transparent rounded-2xl shadow-2xl border border-gray-200 max-w-4xl w-full overflow-hidden animate-fade-in-up">
        <!-- Header -->
        <div class="bg-gradient-to-r from-red-500 to-red-600 p-6">
          <div class="flex items-center justify-center gap-3">
            <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            <h2 class="text-2xl font-bold text-white">Acceso Restringido</h2>
          </div>
        </div>

        <!-- Contenido -->
        <div class="p-6 md:p-8">
          <!-- Información del plan -->
          <div class="mb-6 text-center">
            <div class="inline-flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 mb-4">
              <span class="text-gray-600">Plan:</span>
              <span class="text-red-600 font-semibold">{{ planName }}</span>
            </div>
            
            <div class="space-y-3">
              <p class="text-gray-700">
                <span class="text-gray-600">Vencimiento:</span>
                <span class="ml-2 text-gray-900 font-medium">{{ formattedExpiryDate }}</span>
              </p>
              
              <div class="bg-red-50 border border-red-200 rounded-lg p-3">
                <p class="text-red-600 text-sm">
                  <span class="font-semibold">⚠️ Atención:</span> 
                  Tu acceso ha sido suspendido temporalmente.
                </p>
              </div>
            </div>
          </div>

          <!-- Detalles del pago -->
           <div class="flex items-center gap-2">
            <div class="bg-gray-50 rounded-xl p-5 mb-6 border border-gray-200 flex-1" 
          v-for="plan in props.planes" :key="plan.id">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Renovación del Plan</h3>
            
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-gray-600">Precio regular:</span>
                <span class="text-lg font-bold text-gray-900">UYU {{ plan.costo }}</span>
              </div>
              
              <div class="flex justify-between items-center">
                <span class="text-gray-600">Período:</span>
                <span class="text-gray-900 font-medium">{{ plan.plazoDias }} Días</span>
              </div>
                
              <div class="flex justify-between items-center pt-3 border-t border-gray-200">
                <span class="text-lg font-semibold text-gray-900">Total a pagar:</span>
                <span class="text-2xl font-bold text-green-600">UYU {{ plan.costo}}</span>
              </div>

               <button
              @click="handlePayment(plan.linkMercadoPago)"
              class="w-full bg-primary from-primary-500 to-primary-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 group"
            >
              <svg class="w-6 h-6 group-hover:rotate-12 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span>Pagar UYU {{ plan.costo }} </span>
            </button>
            </div>
          </div>
           </div>
          

           <div class="mb-4 rounded-lg bg-primary-50 border border-blue-300 p-3 text-sm text-blue-800 flex gap-2 items-start">
            <UIcon name="i-tabler-info-circle" class="mt-0.5" />
            <span>
              <strong>Importante:</strong> luego de realizar el pago, escribinos por WhatsApp para que podamos actualizar el estado de tu plan.
            </span>
</div>
          <!-- Botones de acción -->
          <div class="space-y-4">
    
            <button
            @click="handleWhatsapp(wppPhone)"
            class="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <svg class="w-5 h-5" viewBox="0 0 32 32" fill="currentColor">
              <path d="M19.11 17.52c-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.14-.61.14-.18.27-.7.88-.86 1.06-.16.18-.32.2-.59.07-.27-.14-1.14-.42-2.17-1.34-.8-.71-1.34-1.6-1.5-1.87-.16-.27-.02-.41.12-.55.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.46-.16 0-.34-.02-.52-.02s-.48.07-.73.34c-.25.27-.95.93-.95 2.27s.98 2.63 1.11 2.82c.14.18 1.93 2.95 4.68 4.13.65.28 1.15.45 1.55.58.65.21 1.25.18 1.72.11.53-.08 1.6-.65 1.83-1.27.23-.61.23-1.14.16-1.27-.07-.13-.25-.2-.52-.34z"/>
              <path d="M16.04 3C9.39 3 4 8.39 4 15.04c0 2.65.86 5.09 2.32 7.06L4 29l7.1-2.28a12 12 0 005.94 1.51h.01c6.65 0 12.04-5.39 12.04-12.04C29.09 8.39 22.7 3 16.04 3zm0 21.9c-2.26 0-4.36-.66-6.14-1.8l-.44-.28-4.21 1.35 1.37-4.1-.29-.42a9.88 9.88 0 01-1.56-5.31c0-5.45 4.44-9.89 9.89-9.89 5.45 0 9.89 4.44 9.89 9.89 0 5.45-4.44 9.89-9.89 9.89z"/>
            </svg>
              Contactar por WhatsApp
          </button>

          </div>

          <!-- Info adicional -->
          <div class="mt-6 pt-6 border-t border-gray-200">
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div class="text-center">
              <div class="text-gray-600 mb-1">Funcionalidades</div>
              <ul class="text-gray-700 text-xs space-y-1">
                <li>✓ Sincronización con Google Drive</li>
                <li>✓ Planificaciones ilimitadas</li>
                <li>✓ Secuencias ilimitadas</li>
                <li>✓ Asistentes virtuales</li>
              </ul>
            </div>

            <div class="text-center">
              <div class="text-gray-600 mb-1">Ideal para</div>
              <ul class="text-gray-700 text-xs space-y-1">
                <li>✓ Organización docente</li>
                <li>✓ Seguimiento pedagógico</li>
                <li>✓ Trabajo colaborativo</li>
                <li>✓ Ahorro de tiempo</li>
              </ul>
            </div>
          </div>
        </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  expiryDate: {
    type: [String, Date],
    required: true
  },

  planes : {
    type: [Array],
    required: true
  },
  planPeriod: {
    type: String,
  },
  planName: {
    type: String,
  },

  wppPhone : {
    type: String,
    required: true
  }
})

const showOverlay = computed(() => {
  if (!props.expiryDate) return false
  const expiry = new Date(props.expiryDate)
  const now = new Date()
  return expiry < now
})

const formattedExpiryDate = computed(() => {
  if (!props.expiryDate) return ''
  const date = new Date(props.expiryDate)
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
})

const preventClose = (e) => {
  e.preventDefault()
  e.stopPropagation()
}

const handlePayment = (linkMercadoPago) => {
  window.open(linkMercadoPago, "_blank");
}

const handleWhatsapp = (wppPhone) => {

  const message = `Hola, necesito ayuda con la renovación de mi plan ${props.planName}.`
  const url = `https://wa.me/${wppPhone}?text=${encodeURIComponent(message)}`
  window.open(url, '_blank')
}

</script>

<style>
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.5s ease-out;
}
</style>