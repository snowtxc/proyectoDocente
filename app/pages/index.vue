<script setup lang="ts">
definePageMeta({
  layout: 'defaultTwo',
});

const page = ref({
  title: "FlopiDocentes: Planificaciones en minutos",
  description: "La herramienta que centraliza el programa curricular de ANEP y te ayuda a crear planificaciones y secuencias didácticas en tiempo récord. Olvídate del papeleo y dedícate a lo que importa: enseñar.",
  seo: {
    title: "FlopiDocentes - Gestión Educativa para Docentes Uruguayos",
    description: "Crea planificaciones, gestiona grupos y accede al programa curricular de ANEP en un solo lugar. Ahorra horas de trabajo administrativo."
  },
  navigation: false,
  hero: {
    links: [
      {
        label: "Comenzar gratis",
        icon: "i-lucide-arrow-right",
        trailing: true,
        to: "/signup",
        size: "xl"
      },
      {
        label: "Ver demo",
        icon: "i-lucide-play-circle",
        size: "xl",
        color: "neutral",
        variant: "subtle",
        to: "/demo"
      }
    ]
  },
  sections: [
    {
      title: "Todo lo que necesitas para planificar",
      description: "Olvídate de las plantillas en Word y los archivos desordenados. FlopiDocentes te ofrece un entorno integrado con el programa curricular oficial.",
      id: "features",
      orientation: "horizontal",
      features: [
        {
          name: "Planificaciones automáticas",
          description: "Genera planificaciones completas en minutos con base en el programa de ANEP. Solo eliges el grado, la unidad y el contenido, y obtienes una estructura lista para usar.",
          icon: "i-lucide-file-text"
        },
        {
          name: "Secuencias didácticas",
          description: "Organiza tus clases en secuencias lógicas, asocia actividades y lleva un seguimiento de cada grupo. Todo interconectado con tus planificaciones.",
          icon: "i-lucide-list-ordered"
        },
        {
          name: "Programa curricular de ANEP integrado",
          description: "Accede directamente a todos los contenidos, criterios de logro y competencias del programa oficial. Ya no necesitas buscar en PDFs.",
          icon: "i-lucide-book-open"
        },
        {
          name: "Sincronización con Google Drive",
          description: "Tus documentos y planificaciones se guardan automáticamente en tu Drive. Puedes acceder desde cualquier lugar y compartirlos fácilmente.",
          icon: "tabler:brand-google-drive"
        }
      ]
    },
    {
      title: "Diseñado para ahorrar tiempo",
      description: "Herramientas prácticas que simplifican tu rutina docente.",
      orientation: "horizontal",
      reverse: true,
      features: [
        {
          name: "Menos papeleo, más enseñanza",
          description: "Reduce horas de trabajo administrativo. Con FlopiDocentes, todo está a unos pocos clics.",
          icon: "i-lucide-clock"
        },
        {
          name: "Interfaz intuitiva",
          description: "Sin complicaciones técnicas. Creada por y para docentes, con la experiencia de usuario en primer lugar.",
          icon: "i-lucide-smile"
        },
        {
          name: "Exportación flexible",
          description: "Descarga tus planificaciones en formatos compatibles con los requerimientos de tu institución.",
          icon: "i-lucide-file-text"
        }
      ]
    }
  ],
  features: {
    title: "¿Por qué elegir FlopiDocentes?",
    description: "Características clave que marcan la diferencia en tu día a día.",
    items: [
      {
        title: "Programa ANEP siempre actualizado",
        description: "Los contenidos curriculares se actualizan automáticamente, así que siempre trabajas con la versión oficial vigente.",
        icon: "i-lucide-calendar"
      },
      {
        title: "Ahorro de tiempo real",
        description: "Crea una planificación completa en menos de 10 minutos. Prueba y verás.",
        icon: "i-lucide-clock"
      },
      {
        title: "Acceso desde cualquier dispositivo",
        description: "Al sincronizar con Google Drive, puedes trabajar desde tu computadora, tablet o celular.",
        icon: "i-lucide-smartphone"
      },
      {
        title: "Pensado para el aula uruguaya",
        description: "Diseñado específicamente para el sistema educativo de Uruguay, con todas las particularidades de nuestro currículo.",
        icon: "i-lucide-map-pin"
      },
    ]
  },
  pricing: {
    title: "Precio pensado para docentes",
    description: "Queremos que pruebes la herramienta sin compromiso. Por eso, los primeros 3 meses son completamente gratis. Luego, solo $250 UYU por mes.",
    note: "Sin permanencia. Puedes cancelar cuando quieras.",
    links: [
      {
        label: "Empieza gratis",
        to: "/signup",
        trailingIcon: "i-lucide-arrow-right",
        size: "lg"
      }
    ]
  },
  cta: {
    title: "¿Listo para recuperar tu tiempo?",
    description: "Únete gratis a FlopiDocentes y descubre lo fácil que es planificar con el programa de ANEP integrado.",
    links: [
      {
        label: "Registrarse gratis",
        to: "/signup",
        trailingIcon: "i-lucide-arrow-right"
      },
      {
        label: "Ver demo",
        to: "/demo",
        variant: "subtle",
        icon: "i-lucide-play"
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
  <div v-if="page" class="min-h-screen bg-white font-sans text-gray-900">
    <AppHeader />
    
    <UPageHero
      :title="page.title"
      :description="page.description"
      :links="page.hero.links"
      class="relative overflow-hidden py-20 md:py-32 bg-gray-50 border-b border-gray-100"
    >
      <template #title>
        <MDC
          :value="page.title"
          unwrap="p"
          class="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-950 leading-tight"
        />
      </template>

      <template #description>
        <p class="mt-6 text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
          {{ page.description }}
        </p>
      </template>

      <div class="mt-16 relative z-10 max-w-5xl mx-auto group">
        <div class="absolute -inset-4 bg-gradient-to-r from-yellow-100 to-amber-100 rounded-3xl blur-2xl opacity-70 group-hover:opacity-100 transition duration-500"></div>
        
        <div class="relative bg-white rounded-3xl p-3 shadow-2xl border border-gray-100 transform group-hover:scale-[1.01] transition duration-500 overflow-hidden aspect-[16/9] flex items-center justify-center">
          <video 
            autoplay 
            loop 
            muted 
            playsinline 
            class="w-full h-full object-cover rounded-2xl shadow-inner"
          >
            <source src="http://googleusercontent.com/video_gen_chip/0" type="video/mp4">
            Tu navegador no soporta la reproducción de video.
          </video>
          
          <div class="absolute inset-3 rounded-2xl border border-white/10 pointer-events-none"></div>
        </div>
      </div>
    </UPageHero>

    <div class="container mx-auto px-6 py-24 md:py-32 space-y-32">
      <UPageSection
        v-for="(section, index) in page.sections"
        :key="index"
        :title="section.title"
        :description="section.description"
        :orientation="section.orientation"
        :reverse="section.reverse"
        :features="section.features"
        class="gap-16 items-center"
      >
        <template #title>
          <h2 class="text-4xl md:text-5xl font-bold tracking-tight text-gray-950 leading-tight">
            {{ section.title }}
          </h2>
        </template>
        
        <template #description>
          <p class="mt-4 text-lg text-gray-700 leading-relaxed">
            {{ section.description }}
          </p>
        </template>

        <div class="relative group">
          <div class="absolute -inset-6 bg-gradient-to-r from-yellow-50 to-amber-100 rounded-3xl blur-2xl opacity-50 group-hover:opacity-80 transition duration-500"></div>
          <div class="relative bg-white rounded-2xl p-6 shadow-xl border border-gray-100 overflow-hidden transform group-hover:-translate-y-1 transition duration-500 aspect-square flex items-center justify-center">
             <UIcon 
               :name="index === 0 ? 'i-lucide-layers-3' : 'i-lucide-zap'" 
               class="w-32 h-32 text-amber-400 opacity-90"
             />
             <div class="absolute inset-0 bg-gradient-to-t from-white via-transparent to-white/50"></div>
          </div>
        </div>
      </UPageSection>

      <UPageSection
        :title="page.features.title"
        :description="page.features.description"
        class="bg-gray-50 rounded-3xl p-12 md:p-20 border border-gray-100"
      >
        <template #title>
          <h2 class="text-4xl md:text-5xl font-bold tracking-tight text-gray-950 text-center leading-tight">
            {{ page.features.title }}
          </h2>
        </template>
        
        <template #description>
          <p class="mt-4 text-xl text-gray-700 text-center max-w-2xl mx-auto leading-relaxed mb-16">
            {{ page.features.description }}
          </p>
        </template>

        <UPageGrid class="gap-8">
          <UPageCard
            v-for="(item, index) in page.features.items"
            :key="index"
            v-bind="item"
            spotlight
            class="p-8 bg-white border border-gray-100 hover:shadow-2xl hover:border-amber-200 transition-all duration-300 hover:-translate-y-2 group rounded-2xl"
          >
            <template #icon>
              <div class="mb-6 inline-flex p-4 rounded-xl bg-amber-50 group-hover:bg-amber-100 transition duration-300">
                <UIcon :name="item.icon" class="w-8 h-8 text-amber-600" />
              </div>
            </template>
            <template #title>
              <h3 class="text-2xl font-semibold text-gray-950 group-hover:text-amber-900 transition duration-300">
                {{ item.title }}
              </h3>
            </template>
            <template #description>
              <p class="mt-3 text-base text-gray-700 leading-relaxed">
                {{ item.description }}
              </p>
            </template>
          </UPageCard>
        </UPageGrid>
      </UPageSection>

      <div id="pricing" class="relative rounded-3xl overflow-hidden bg-gray-950 shadow-2xl border border-gray-800 p-12 md:p-20 flex flex-col md:flex-row items-center gap-16">
        <div class="absolute inset-0 opacity-[0.03]">
          <div class="absolute inset-0" style="background-image: url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E'); background-repeat: repeat;"></div>
        </div>
        
        <div class="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
        <div class="absolute bottom-0 left-0 w-80 h-80 bg-yellow-400/5 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3"></div>
        
        <div class="relative z-10 flex-1 text-center md:text-left">
          <div class="mb-6 inline-flex items-center gap-2.5 text-sm font-semibold text-amber-400 bg-amber-950 px-5 py-2.5 rounded-full border border-amber-900 shadow-inner">
            <UIcon name="i-lucide-star" class="w-5 h-5 fill-amber-400 text-amber-950" />
            {{ page.pricing.title }}
          </div>

          <h2 class="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Inversión mínima para tu tranquilidad.
          </h2>
          
          <p class="mt-6 text-xl text-gray-300 max-w-2xl leading-relaxed">
            {{ page.pricing.description }}
          </p>
          
          <p class="mt-6 text-base text-gray-500 italic">
            {{ page.pricing.note }}
          </p>

          <div class="mt-10 flex flex-wrap gap-x-6 gap-y-3 justify-center md:justify-start items-center text-sm text-gray-400 border-t border-gray-800 pt-8">
            <span class="flex items-center gap-2.5">
              <UIcon name="i-lucide-credit-card" class="w-5 h-5 text-amber-500" />
              Pago local seguro (MercadoPago)
            </span>
            <span class="flex items-center gap-2.5">
              <UIcon name="i-lucide-calendar-days" class="w-5 h-5 text-amber-500" />
              Cancela cuando quieras
            </span>
            <span class="flex items-center gap-2.5">
              <UIcon name="i-lucide-shield-check" class="w-5 h-5 text-amber-500" />
              Sin permanencia ni líos
            </span>
          </div>
        </div>

        <div class="relative z-10 w-full max-w-sm flex-shrink-0 group">
          <div class="absolute -inset-1 bg-gradient-to-b from-amber-400 to-yellow-600 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
          
          <div class="relative bg-white rounded-3xl p-10 shadow-xl border border-gray-100 transform group-hover:-translate-y-2 transition duration-500">
            <div class="text-gray-950 mb-8 border-b border-gray-100 pb-8 text-center">
              <span class="text-sm uppercase tracking-widest font-bold text-amber-700 bg-amber-50 px-4 py-1.5 rounded-full">Suscripción Mensual</span>
              <div class="flex items-end justify-center gap-2.5 mt-6">
                <span class="text-7xl font-extrabold tracking-tighter text-gray-950">$250</span>
                <span class="text-2xl text-gray-600 font-medium mb-1.5">UYU /mes</span>
              </div>
            </div>
            
            <ul class="space-y-5 text-gray-800 text-left mb-10 text-lg">
              <li class="flex items-start gap-3.5 leading-tight">
                <UIcon name="i-lucide-check-circle" class="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
                <span><strong class="font-semibold text-gray-950">3 meses GRATIS</strong> (prueba total)</span>
              </li>
              <li class="flex items-start gap-3.5 leading-tight">
                <UIcon name="i-lucide-check-circle" class="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>Programa curricular <strong class="font-semibold text-gray-950">ANEP</strong> integrado</span>
              </li>
              <li class="flex items-start gap-3.5 leading-tight">
                <UIcon name="i-lucide-check-circle" class="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>Planificaciones y secuencias <strong class="font-semibold text-gray-950">ilimitadas</strong></span>
              </li>
              <li class="flex items-start gap-3.5 leading-tight">
                <UIcon name="i-lucide-check-circle" class="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>Sincronización nativa con <strong class="font-semibold text-gray-950">Google Drive</strong></span>
              </li>
              <li class="flex items-start gap-3.5 leading-tight">
                <UIcon name="i-lucide-check-circle" class="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>Gestión de grupos y estudiantes</span>
              </li>
            </ul>

            <UButton
              v-for="(link, idx) in page.pricing.links"
              :key="idx"
              v-bind="link"
              size="xl"
              block
              class="bg-gray-950 text-white hover:bg-gray-800 border-0 shadow-lg hover:shadow-amber-500/20 transition-all duration-300 font-bold py-4 rounded-xl text-lg"
            />
          </div>
        </div>
      </div>

      <USeparator class="border-gray-100" />

      <div class="relative rounded-[2rem] overflow-hidden bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 shadow-xl p-16 md:p-24 text-center border border-amber-300 group">
        <div class="absolute inset-0 opacity-[0.08]">
          <div class="absolute inset-0" style="background-image: url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\' Thorntons=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E'); background-repeat: repeat;"></div>
        </div>
        
        <div class="absolute top-0 right-0 w-80 h-80 bg-white/20 rounded-fullblur-3xl translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition duration-700"></div>
        <div class="absolute bottom-0 left-0 w-64 h-64 bg-amber-100/30 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2 group-hover:scale-110 transition duration-700"></div>
        
        <div class="relative z-10 max-w-3xl mx-auto">
          <h2 class="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-950 tracking-tight leading-tight">
            {{ page.cta.title }}
          </h2>
          
          <p class="mt-6 text-xl text-amber-950 max-w-2xl mx-auto leading-relaxed mb-12 opacity-90">
            {{ page.cta.description }}
          </p>
          
          <div class="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <UButton
              v-for="(link, index) in page.cta.links"
              :key="index"
              :label="link.label"
              :to="link.to"
              :icon="link.icon"
              :trailing="link.trailingIcon ? true : false"
              size="xl"
              :class="[
                index === 0 
                  ? 'bg-gray-950 text-white hover:bg-gray-800 border-0 shadow-2xl hover:shadow-amber-950/20 transition-all duration-300 px-10 py-4 rounded-xl text-lg font-bold'
                  : 'bg-white/10 text-gray-950 border-2 border-amber-300 hover:border-amber-400 hover:bg-white/20 backdrop-blur-sm transition-all duration-300 px-10 py-4 rounded-xl text-lg font-bold'
              ]"
            />
          </div>
          
          <div class="mt-10">
            <span class="inline-flex items-center gap-2.5 text-sm text-amber-950 font-medium bg-white/20 px-5 py-2.5 rounded-full border border-amber-300 shadow-inner backdrop-blur-sm">
              <UIcon name="i-lucide-check-circle" class="w-5 h-5" />
              Empieza gratis hoy. Cancela cuando quieras.
            </span>
          </div>
        </div>
      </div>
    </div>

    <AppFooter class="border-t border-gray-100 bg-gray-50 mt-24"></AppFooter>
  </div>
</template>

<style>
/* Estilos adicionales para mejorar la apariencia */
:deep(.UPageCard) {
  border-radius: 1.5rem;
}

:deep(.UPageSection) {
  scroll-margin-top: 4rem;
}

:deep(.UPageHero) {
  padding-top: 8rem;
  padding-bottom: 8rem;
}

:deep(.UPageGrid) {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
}

/* Animaciones sutiles */
@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
  }
}

.floating {
  animation: float 4s ease-in-out infinite;
}

/* Color dorado para iconos y títulos */
:deep(.UPageCard .icon) {
  color: #ca8a04;
}

:deep(.UPageCard .title) {
  color: #111827; /* Gray-950 */
}

:deep(.UPageCard .description) {
  color: #374151; /* Gray-700 */
}

/* Tipografía profesional */
body {
  font-feature-settings: "ss01", "ss03", "cv01", "cv03", "cv04";
}
</style>