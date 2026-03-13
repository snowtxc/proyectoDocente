<script setup lang="ts">
definePageMeta({
  layout: 'defaultTwo',
});

const page = ref({
  title: "Política de Privacidad de FlopiDocentes",
  description: "En FlopiDocentes nos tomamos muy en serio la privacidad de tus datos. Esta política explica cómo recopilamos, usamos y protegemos tu información personal, en cumplimiento con la Ley N° 18.331 de Protección de Datos Personales de Uruguay.",
  seo: {
    title: "Política de Privacidad - FlopiDocentes",
    description: "Conoce cómo protegemos tus datos personales en FlopiDocentes, la plataforma de gestión educativa para docentes uruguayos."
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
      title: "1. Responsable del Tratamiento",
      content: "FlopiDocentes es responsable del tratamiento de tus datos personales. Si tienes alguna pregunta sobre esta política de privacidad, puedes contactarnos a través de:\n\n• Email: privacidad@flopidocentes.com.uy\n• Formulario de contacto: /contacto\n• Dirección: Montevideo, Uruguay"
    },
    {
      title: "2. Datos que Recopilamos",
      features: [
        {
          name: "Datos de registro",
          description: "• Nombre completo\n• Correo electrónico\n• Contraseña (encriptada)\n• Rol docente (maestro, profesor, etc.)\n• Institución educativa (opcional)\n• Grados que enseñas (opcional)"
        },
        {
          name: "Datos de uso",
          description: "• Planificaciones y secuencias didácticas que creas\n• Configuración de la cuenta\n• Preferencias de la plataforma\n• Fecha y hora de acceso\n• Páginas visitadas dentro de la plataforma"
        },
        {
          name: "Datos de Google Drive",
          description: "Cuando conectas tu cuenta de Google Drive, recopilamos:\n• Tokens de acceso (para sincronización)\n• Metadatos de los archivos que creas en la carpeta de FlopiDocentes\n• NO accedemos ni recopilamos archivos fuera de esta carpeta"
        },
        {
          name: "Datos de pago",
          description: "• Historial de suscripciones\n• Fecha de inicio y renovación\n• Método de pago (procesado por terceros, NO almacenamos datos de tarjetas)"
        }
      ]
    },
    {
      title: "3. Finalidad del Tratamiento",
      content: "Utilizamos tus datos para las siguientes finalidades:",
      list: [
        "✓ Proveer y mantener la plataforma FlopiDocentes",
        "✓ Sincronizar tus planificaciones con Google Drive (cuando lo autorizas)",
        "✓ Gestionar tu suscripción y pagos",
        "✓ Mejorar y personalizar tu experiencia",
        "✓ Enviarte comunicaciones relacionadas con el servicio (actualizaciones, cambios en términos, etc.)",
        "✓ Atender tus consultas y solicitudes de soporte",
        "✓ Cumplir con obligaciones legales"
      ]
    },
    {
      title: "4. Base Legal para el Tratamiento",
      content: "Tratamos tus datos personales basándonos en las siguientes bases legales:\n\n• **Ejecución de un contrato:** Para proveer el servicio de FlopiDocentes que solicitaste.\n• **Consentimiento:** Para la sincronización con Google Drive y comunicaciones de marketing.\n• **Cumplimiento de obligaciones legales:** Para cumplir con leyes aplicables en Uruguay.\n• **Interés legítimo:** Para mejorar nuestros servicios y prevenir fraudes."
    },
    {
      title: "5. Integración con Google Drive",
      features: [
        {
          name: "¿Qué permisos solicitamos?",
          description: "Al conectar Google Drive, solicitamos permisos específicos para:\n• Crear una carpeta 'FlopiDocentes' en tu Drive\n• Leer, escribir y organizar archivos dentro de esa carpeta\n• Ver los metadatos de los archivos que creamos\n\nNO solicitamos acceso a otros archivos fuera de esta carpeta."
        },
        {
          name: "¿Cómo usamos estos permisos?",
          description: "Utilizamos estos permisos exclusivamente para:\n• Guardar automáticamente tus planificaciones\n• Sincronizar cambios entre dispositivos\n• Permitirte acceder a tus documentos desde cualquier lugar\n\nNunca compartimos, vendemos o utilizamos tus archivos para otros fines."
        },
        {
          name: "¿Cómo revocar el acceso?",
          description: "Puedes revocar el acceso de FlopiDocentes a tu Google Drive en cualquier momento:\n1. Ve a tu cuenta de Google\n2. Accede a 'Seguridad' > 'Tus conexiones con aplicaciones de terceros'\n3. Busca FlopiDocentes y selecciona 'Eliminar acceso'\n\nAl revocar el acceso, perderás la sincronización automática."
        }
      ]
    },
    {
      title: "6. Conservación de Datos",
      content: "Conservamos tus datos personales mientras mantengas una cuenta activa en FlopiDocentes. Una vez que cancelas tu cuenta:\n\n• Los datos asociados a tu cuenta se eliminan dentro de los 30 días posteriores a la cancelación.\n• Las planificaciones almacenadas en Google Drive permanecen en tu Drive (son tuyas).\n• Podemos conservar cierta información por obligaciones legales (ej: registros de pago por 5 años según normativa fiscal uruguaya)."
    },
    {
      title: "7. Compartición de Datos con Terceros",
      features: [
        {
          name: "Google (Google Drive / Google Cloud)",
          description: "Para la sincronización de archivos y alojamiento de la plataforma. Los datos se almacenan en servidores de Google, que pueden estar fuera de Uruguay pero cumplen con estándares internacionales de seguridad."
        },
        {
          name: "Proveedores de pago",
          description: "Para procesar tus pagos de suscripción. NO almacenamos datos de tarjetas de crédito. Los pagos se procesan a través de proveedores seguros que cumplen con PCI DSS."
        },
        {
          name: "ANEP (Administración Nacional de Educación Pública)",
          description: "Compartimos datos anónimos y agregados sobre el uso del programa curricular para mejorar la herramienta. No compartimos datos personales identificables."
        }
      ]
    },
    {
      title: "8. Transferencias Internacionales",
      content: "Al utilizar servicios como Google Drive y nuestros proveedores de alojamiento, tus datos pueden ser transferidos y procesados fuera de Uruguay. Estos proveedores cumplen con estándares internacionales de protección de datos (GDPR, Privacy Shield, etc.) y garantizan un nivel adecuado de protección."
    },
    {
      title: "9. Derechos de los Usuarios",
      content: "Según la Ley N° 18.331 de Protección de Datos Personales de Uruguay, tienes los siguientes derechos:",
      list: [
        "✓ **Acceso:** Saber qué datos personales tenemos sobre ti.",
        "✓ **Rectificación:** Solicitar la corrección de datos inexactos o incompletos.",
        "✓ **Cancelación:** Solicitar la eliminación de tus datos cuando ya no sean necesarios.",
        "✓ **Oposición:** Oponerte al tratamiento de tus datos para ciertas finalidades.",
        "✓ **Revocación del consentimiento:** Retirar tu consentimiento en cualquier momento."
      ],
      note: "Para ejercer estos derechos, envía un email a privacidad@flopidocentes.com.uy con el asunto 'DERECHOS ARCO' y tu documento de identidad. Responderemos dentro de los 20 días hábiles."
    },
    {
      title: "10. Cookies y Tecnologías Similares",
      content: "Utilizamos cookies y tecnologías similares para:",
      list: [
        "✓ Mantener tu sesión iniciada",
        "✓ Recordar tus preferencias",
        "✓ Analizar el uso de la plataforma (Google Analytics)",
        "✓ Mejorar la experiencia del usuario"
      ],
      extra: "Puedes configurar tu navegador para rechazar todas las cookies, aunque algunas funcionalidades de la plataforma podrían verse afectadas.\n\nUtilizamos:\n• **Cookies esenciales:** Necesarias para el funcionamiento básico.\n• **Cookies de análisis:** Para entender cómo usas la plataforma.\n• **Cookies de preferencias:** Para recordar tus configuraciones."
    },
    {
      title: "11. Seguridad de los Datos",
      content: "Implementamos medidas de seguridad técnicas y organizativas para proteger tus datos:\n\n• Encriptación SSL/TLS para toda la comunicación\n• Almacenamiento de contraseñas con hash y sal\n• Acceso restringido a datos personales (solo personal autorizado)\n• Monitoreo continuo de actividad sospechosa\n• Copias de seguridad periódicas\n\nSin embargo, ninguna transmisión por Internet es 100% segura. Te recomendamos usar contraseñas fuertes y no compartir tus credenciales."
    },
    {
      title: "12. Menores de Edad",
      content: "FlopiDocentes está dirigido a docentes y profesionales de la educación. No recopilamos intencionalmente datos de menores de 18 años. Si eres padre o tutor y descubres que tu hijo nos ha proporcionado datos personales sin tu consentimiento, contáctanos para eliminar esa información."
    },
    {
      title: "13. Cambios en la Política de Privacidad",
      content: "Podemos actualizar esta política periódicamente para reflejar cambios en nuestras prácticas o por requisitos legales. Notificaremos cambios significativos a través de la plataforma o por correo electrónico.\n\nTe recomendamos revisar esta página regularmente para mantenerte informado. El uso continuado de FlopiDocentes después de los cambios constituye tu aceptación de la política actualizada."
    },
    {
      title: "14. Ley Aplicable y Jurisdicción",
      content: "Esta Política de Privacidad se rige por la Ley N° 18.331 de Protección de Datos Personales de Uruguay y su decreto reglamentario. Cualquier controversia será resuelta por los tribunales de Montevideo, Uruguay."
    },
    {
      title: "15. Contacto con la Autoridad de Control",
      content: "Si consideras que tus derechos de protección de datos han sido vulnerados, puedes presentar una denuncia ante la Unidad Reguladora y de Control de Datos Personales (URCDP) de Uruguay:\n\n• Web: https://www.gub.uy/unidad-reguladora-control-datos-personales\n• Teléfono: 2901 2121\n• Dirección: Andes 1365, piso 8, Montevideo"
    }
  ],
  summary: {
    title: "Resumen de tu Privacidad en FlopiDocentes",
    items: [
      {
        icon: "i-lucide-shield",
        text: "Tus planificaciones te pertenecen. Solo las usamos para sincronizarlas con tu Google Drive."
      },
      {
        icon: "i-lucide-lock",
        text: "Tus datos están encriptados y protegidos con los más altos estándares."
      },
      {
        icon: "i-lucide-key",
        text: "Puedes revocar el acceso a Google Drive en cualquier momento."
      },
      {
        icon: "i-lucide-eye-off",
        text: "No compartimos ni vendemos tus datos personales a terceros."
      },
      {
        icon: "i-lucide-trash-2",
        text: "Puedes solicitar la eliminación de tus datos cuando lo desees."
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
      <!-- Resumen rápido con iconos -->
      <div class="mb-12 relative">
        <div class="absolute -inset-4 bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-3xl blur-xl opacity-50"></div>
        <div class="relative bg-white rounded-2xl p-8 shadow-lg border border-yellow-100">
          <h2 class="text-2xl font-bold text-yellow-800 mb-6 flex items-center gap-2">
            <UIcon name="i-lucide-shield-check" class="w-6 h-6" />
            {{ page.summary.title }}
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="(item, index) in page.summary.items" :key="index" 
                 class="flex items-start gap-3 p-3 rounded-xl bg-yellow-50/50 border border-yellow-100">
              <UIcon :name="item.icon" class="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <span class="text-sm text-gray-700">{{ item.text }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Secciones de privacidad -->
      <div class="space-y-8">
        <div v-for="(section, index) in page.sections" :key="index"
             class="relative group"
             :style="{ '--index': index }">
          <!-- Efecto hover -->
          <div class="absolute -inset-2 bg-gradient-to-r from-yellow-100/0 to-yellow-200/0 group-hover:from-yellow-100/30 group-hover:to-yellow-200/30 rounded-3xl blur-md transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
          
          <div class="relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-yellow-100 hover:shadow-xl transition-all duration-300">
            <h2 class="text-xl font-bold text-yellow-800 mb-3 flex items-center gap-2">
              <span class="w-1 h-6 bg-gradient-to-b from-yellow-500 to-amber-500 rounded-full"></span>
              {{ section.title }}
            </h2>
            
            <!-- Contenido de texto plano -->
            <div v-if="section.content" class="text-gray-600 whitespace-pre-line leading-relaxed mb-3">
              {{ section.content }}
            </div>
            
            <!-- Lista con viñetas -->
            <div v-if="section.list" class="mt-2 space-y-2">
              <div v-for="(item, lIndex) in section.list" :key="lIndex" 
                   class="flex items-start gap-2 text-gray-600">
                <span class="text-yellow-600 font-bold">{{ item.includes('✓') ? '✓' : '•' }}</span>
                <span>{{ item.replace('✓ ', '') }}</span>
              </div>
            </div>

            <!-- Nota adicional -->
            <p v-if="section.note" class="mt-3 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
              <UIcon name="i-lucide-info" class="w-4 h-4 inline mr-1" />
              {{ section.note }}
            </p>

            <!-- Texto extra -->
            <p v-if="section.extra" class="mt-3 text-gray-600 whitespace-pre-line">
              {{ section.extra }}
            </p>
            
            <!-- Features grid para secciones con lista de características -->
            <div v-if="section.features" class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div v-for="(feature, fIndex) in section.features" :key="fIndex"
                   class="p-4 rounded-xl bg-yellow-50/50 border border-yellow-100">
                <h3 class="font-semibold text-yellow-700 mb-2 flex items-center gap-1">
                  <UIcon :name="feature.name.includes('¿Qué') ? 'i-lucide-help-circle' : 
                                 feature.name.includes('¿Cómo') ? 'i-lucide-settings' : 
                                 'i-lucide-shield'" 
                         class="w-4 h-4 text-yellow-600" />
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

      <!-- Sección de confianza y contacto -->
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
            Tus datos están seguros con nosotros
          </h2>
          <p class="text-yellow-50/90 max-w-2xl mx-auto mb-8">
            En FlopiDocentes cumplimos con la Ley N° 18.331 de Protección de Datos Personales de Uruguay. Si tienes alguna duda sobre tu privacidad, estamos aquí para ayudarte.
          </p>
          
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <UButton
              to="/contacto"
              size="xl"
              class="bg-white text-amber-600 hover:bg-yellow-50 border-0 shadow-lg hover:shadow-xl px-8"
            >
              Contactar Delegado de Privacidad
            </UButton>
            <UButton
              to="/terminos-y-condiciones"
              size="xl"
              color="neutral"
              variant="subtle"
              class="bg-transparent text-white border-2 border-white/30 hover:border-white/50 hover:bg-white/10"
            >
              Ver Términos y Condiciones
            </UButton>
          </div>

          <!-- Sellos de confianza -->
          <div class="mt-8 flex flex-wrap gap-4 justify-center items-center text-sm text-yellow-50/80">
            <span class="flex items-center gap-1">
              <UIcon name="i-lucide-check-circle" class="w-4 h-4" />
              Ley Uruguaya N° 18.331
            </span>
            <span class="flex items-center gap-1">
              <UIcon name="i-lucide-check-circle" class="w-4 h-4" />
              Datos encriptados
            </span>
            <span class="flex items-center gap-1">
              <UIcon name="i-lucide-check-circle" class="w-4 h-4" />
              Google Drive seguro
            </span>
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

/* Animaciones */
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

/* Estilo para enlaces */
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

/* Mejorar legibilidad */
.text-gray-600 {
  line-height: 1.7;
}

/* Estilo para las listas */
.space-y-2 {
  line-height: 1.6;
}
</style>