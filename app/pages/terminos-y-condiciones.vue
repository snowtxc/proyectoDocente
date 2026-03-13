<script setup lang="ts">

definePageMeta({
  layout: 'defaultTwo',
});

const page = ref({
  title: "Términos y Condiciones de FlopiDocentes",
  description: "Los presentes términos y condiciones regulan el uso de la plataforma FlopiDocentes, diseñada para docentes uruguayos. Al acceder o utilizar nuestros servicios, aceptas estar sujeto a estos términos.",
  seo: {
    title: "Términos y Condiciones - FlopiDocentes",
    description: "Conoce los términos y condiciones de uso de FlopiDocentes, la plataforma de gestión educativa para docentes uruguayos."
  },
  navigation: false,
  hero: {
    links: [
      {
        label: "Volver al inicio",
        icon: "i-lucide-arrow-left",
        trailing: false,
        to: "/",
        size: "lg",
        color: "neutral",
        variant: "subtle"
      }
    ]
  },
  lastUpdated: "15 de febrero de 2026",
  sections: [
    {
      title: "1. Aceptación de los Términos",
      content: "Al acceder o utilizar FlopiDocentes (\"la Plataforma\"), usted acepta estar legalmente vinculado por estos Términos y Condiciones, así como por nuestra Política de Privacidad. Si no está de acuerdo con alguna parte de estos términos, no podrá acceder ni utilizar nuestros servicios.\n\nFlopiDocentes es una plataforma diseñada específicamente para docentes en Uruguay, que integra el programa curricular de ANEP para facilitar la creación de planificaciones y secuencias didácticas."
    },
    {
      title: "2. Registro y Cuenta de Usuario",
      content: "Para utilizar FlopiDocentes, deberá crear una cuenta proporcionando información precisa, completa y actualizada. Eres responsable de mantener la confidencialidad de tus credenciales de acceso y de todas las actividades que ocurran en tu cuenta.\n\nNos reservamos el derecho de suspender o terminar cuentas que proporcionen información falsa, o que sean utilizadas de manera fraudulenta o en violación de estos términos."
    },
    {
      title: "3. Uso de Google Drive",
      features: [
        {
          name: "Sincronización automática",
          description: "FlopiDocentes se integra con Google Drive para almacenar y sincronizar tus planificaciones y documentos automáticamente."
        },
        {
          name: "Permisos necesarios",
          description: "Al conectar tu cuenta de Google, otorgas permiso a FlopiDocentes para crear, editar y organizar archivos en una carpeta específica dentro de tu Drive. Nunca accederemos a archivos fuera de esta carpeta."
        },
        {
          name: "Revocación de acceso",
          description: "Puedes revocar el acceso de FlopiDocentes a tu Google Drive en cualquier momento desde la configuración de tu cuenta de Google."
        }
      ]
    },
    {
      title: "4. Propiedad Intelectual",
      content: "El contenido generado por los usuarios (planificaciones, secuencias didácticas, etc.) es propiedad de cada docente. FlopiDocentes no reclama propiedad sobre el material educativo que crees en la plataforma.\n\nSin embargo, la plataforma en sí misma, incluyendo su código, diseño, logotipos, y funcionalidades, es propiedad exclusiva de FlopiDocentes y está protegida por leyes de propiedad intelectual."
    },
    {
      title: "5. Programa Curricular de ANEP",
      content: "FlopiDocentes incorpora el programa curricular oficial de ANEP (Administración Nacional de Educación Pública) como referencia para la creación de planificaciones. Este contenido es propiedad de ANEP y se utiliza con fines educativos.\n\nNos esforzamos por mantener este contenido actualizado, pero no garantizamos que refleje la versión más reciente en todo momento. Los docentes son responsables de verificar la vigencia del currículo con las autoridades educativas correspondientes."
    },
    {
      title: "6. Uso Permitido y Prohibido",
      features: [
        {
          name: "Usos permitidos",
          description: "✓ Crear planificaciones y secuencias didácticas para uso educativo.\n✓ Compartir materiales con colegas y estudiantes.\n✓ Acceder al programa curricular de ANEP integrado."
        },
        {
          name: "Usos prohibidos",
          description: "✗ Compartir credenciales de acceso.\n✓ Intentar vulnerar la seguridad de la plataforma.\n✗ Utilizar la plataforma para fines ilegales o no autorizados.\n✗ Reproducir, distribuir o modificar el código de la plataforma.\n✗ Subir contenido que infrinja derechos de autor o sea inapropiado."
        }
      ]
    },
    {
      title: "7. Suscripciones y Pagos",
      content: "FlopiDocentes ofrece un período de prueba gratuito de 3 meses. Posteriormente, la suscripción tiene un costo de $250 UYU (pesos uruguayos) por mes.\n\n• Los pagos se procesan de forma segura a través de nuestro proveedor de pagos.\n• Puedes cancelar tu suscripción en cualquier momento desde la configuración de tu cuenta.\n• No hay períodos de permanencia mínima.\n• Al cancelar, seguirás teniendo acceso hasta el final del período facturado.\n• No se realizan reembolsos por períodos parciales no utilizados."
    },
    {
      title: "8. Cancelación y Terminación",
      content: "Puedes cancelar tu cuenta en cualquier momento desde la configuración de la plataforma. Al cancelar, perderás acceso a todas las funcionalidades y contenido premium.\n\nFlopiDocentes se reserva el derecho de suspender o terminar cuentas que violen estos términos, sin derecho a reembolso.\n\nLos datos asociados a tu cuenta serán eliminados dentro de los 30 días posteriores a la cancelación, de acuerdo con nuestra Política de Privacidad."
    },
    {
      title: "9. Limitación de Responsabilidad",
      content: "FlopiDocentes se proporciona \"tal cual\", sin garantías de ningún tipo. No garantizamos que la plataforma esté libre de errores, interrupciones o vulnerabilidades de seguridad.\n\nEn la máxima medida permitida por la ley, FlopiDocentes no será responsable por daños indirectos, incidentales o consecuentes derivados del uso o la imposibilidad de usar la plataforma.\n\nLos docentes son responsables del contenido educativo que generan y de su aplicación en el aula. FlopiDocentes no asume responsabilidad por el uso pedagógico que se dé a las planificaciones creadas."
    },
    {
      title: "10. Modificaciones a los Términos",
      content: "Podemos actualizar estos términos periódicamente para reflejar cambios en nuestros servicios, requisitos legales o por otras razones operativas. Notificaremos cualquier cambio significativo a través de la plataforma o por correo electrónico.\n\nEl uso continuado de FlopiDocentes después de dichas modificaciones constituye tu aceptación de los nuevos términos."
    },
    {
      title: "11. Ley Aplicable y Jurisdicción",
      content: "Estos términos se rigen por las leyes de la República Oriental del Uruguay. Cualquier disputa relacionada con estos términos o con el uso de FlopiDocentes será resuelta por los tribunales competentes de Montevideo, Uruguay."
    },
    {
      title: "12. Contacto",
      content: "Si tienes preguntas sobre estos Términos y Condiciones, puedes contactarnos a través de:\n\n• Email: legal@flopidocentes.com.uy\n• Formulario de contacto: /contacto\n• Dirección: Montevideo, Uruguay"
    }
  ],
  disclaimer: {
    title: "Resumen importante",
    items: [
      {
        icon: "i-lucide-check-circle",
        text: "Al usar FlopiDocentes, aceptas estos términos en su totalidad."
      },
      {
        icon: "i-lucide-check-circle",
        text: "Eres responsable de la confidencialidad de tu cuenta."
      },
      {
        icon: "i-lucide-check-circle",
        text: "El contenido que creas te pertenece."
      },
      {
        icon: "i-lucide-check-circle",
        text: "La suscripción es de $250 UYU/mes después de 3 meses gratis."
      },
      {
        icon: "i-lucide-check-circle",
        text: "Puedes cancelar en cualquier momento sin permanencia."
      }
    ]
  }
});

const title = computed(() => page.value?.seo?.title || page.value?.title)
const description = computed(() => page.value?.seo?.description || page.value?.description)

useSeoMeta({
  titleTemplate: '',
  title,
  ogTitle: title,
  description,
  ogDescription: description
})
</script>

<template>
  <div v-if="page" class="min-h-screen bg-gradient-to-b from-yellow-50 to-white">
    <AppHeader />
    
    <UPageHero
      :title="page.title"
      :description="page.description"
      :links="page.hero.links"
      class="relative overflow-hidden my-10"
    >
      <template #title>
        <MDC
          :value="page.title"
          unwrap="p"
          class="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-600 to-yellow-700"
        />
      </template>

      <!-- Badge de última actualización -->
      <template #description>
        <div class="mt-4 flex items-center justify-center gap-2 text-sm text-amber-600">
          <UIcon name="i-lucide-calendar" class="w-4 h-4" />
          <span>Última actualización: {{ page.lastUpdated }}</span>
        </div>
      </template>
    </UPageHero>

    <div class="container mx-auto px-4 py-8 max-w-4xl">
      <!-- Resumen rápido (disclaimer) -->
      <div class="mb-12 relative">
        <div class="absolute -inset-4 bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-3xl blur-xl opacity-50"></div>
        <div class="relative bg-white rounded-2xl p-8 shadow-lg border border-yellow-100">
          <h2 class="text-2xl font-bold text-yellow-800 mb-4 flex items-center gap-2">
            <UIcon name="i-lucide-info" class="w-6 h-6" />
            {{ page.disclaimer.title }}
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div v-for="(item, index) in page.disclaimer.items" :key="index" 
                 class="flex items-start gap-2 text-gray-700">
              <UIcon :name="item.icon" class="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <span>{{ item.text }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Secciones de términos -->
      <div class="space-y-8">
        <div v-for="(section, index) in page.sections" :key="index"
             class="relative group">
          <!-- Efecto hover sutil -->
          <div class="absolute -inset-2 bg-gradient-to-r from-yellow-100/0 to-yellow-200/0 group-hover:from-yellow-100/30 group-hover:to-yellow-200/30 rounded-3xl blur-md transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
          
          <div class="relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-yellow-100 hover:shadow-xl transition-all duration-300">
            <h2 class="text-xl font-bold text-yellow-800 mb-3 flex items-center gap-2">
              <span class="w-1 h-6 bg-gradient-to-b from-yellow-500 to-amber-500 rounded-full"></span>
              {{ section.title }}
            </h2>
            
            <!-- Contenido de texto plano -->
            <div v-if="section.content" class="text-gray-600 whitespace-pre-line leading-relaxed">
              {{ section.content }}
            </div>
            
            <!-- Features grid para secciones con lista -->
            <div v-if="section.features" class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div v-for="(feature, fIndex) in section.features" :key="fIndex"
                   class="p-4 rounded-xl bg-yellow-50/50 border border-yellow-100">
                <h3 class="font-semibold text-yellow-700 mb-1 flex items-center gap-1">
                  <UIcon :name="feature.name.includes('Permitidos') ? 'i-lucide-check-circle' : 
                                 feature.name.includes('Prohibidos') ? 'i-lucide-x-circle' : 
                                 'i-lucide-file-text'" 
                         :class="feature.name.includes('Prohibidos') ? 'text-red-500' : 'text-yellow-600'"
                         class="w-4 h-4" />
                  {{ feature.name }}
                </h3>
                <p class="text-sm text-gray-600 whitespace-pre-line">{{ feature.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Separador decorativo -->
      <USeparator class="my-12 border-yellow-200" />

      <!-- Sección de aceptación -->
      <div class="relative rounded-3xl overflow-hidden bg-gradient-to-br from-yellow-400 to-amber-500 shadow-2xl mb-12">
        <!-- Patrón de fondo -->
        <div class="absolute inset-0 opacity-10">
          <div class="absolute inset-0" style="background-image: url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E'); background-repeat: repeat;"></div>
        </div>
        
        <!-- Círculos decorativos -->
        <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
        <div class="absolute bottom-0 left-0 w-48 h-48 bg-yellow-300/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
        
        <div class="relative z-10 px-8 py-12 text-center">
          <h2 class="text-2xl md:text-3xl font-bold text-white mb-4">
            Al usar FlopiDocentes, aceptas estos términos
          </h2>
          <p class="text-yellow-50/90 max-w-2xl mx-auto mb-8">
            Si tienes alguna pregunta, no dudes en contactarnos. Estamos aquí para ayudarte.
          </p>
          
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <UButton
              to="/signup"
              size="xl"
              class="bg-white text-amber-600 hover:bg-yellow-50 border-0 shadow-lg hover:shadow-xl px-8"
            >
              Crear cuenta gratis
            </UButton>
            <UButton
              to="/contacto"
              size="xl"
              color="neutral"
              variant="subtle"
              class="bg-transparent text-white border-2 border-white/30 hover:border-white/50 hover:bg-white/10"
            >
              Contactar soporte
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <AppFooter />
  </div>
</template>

<style scoped>
/* Mantener los mismos estilos que la página original */
:deep(.UPageHero) {
  padding-top: 4rem;
  padding-bottom: 2rem;
}

/* Animaciones sutiles para las secciones */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.space-y-8 > div {
  animation: fadeInUp 0.5s ease-out forwards;
  animation-delay: calc(var(--index, 0) * 0.1s);
}

/* Mejorar legibilidad del texto */
.text-gray-600 {
  line-height: 1.7;
}

/* Estilo para enlaces dentro del texto */
:deep(a) {
  color: #ca8a04;
  text-decoration: underline;
  text-decoration-color: #fbbf24;
  text-underline-offset: 2px;
  transition: all 0.2s;
}

:deep(a:hover) {
  color: #854d0e;
  text-decoration-color: #ca8a04;
}
</style>