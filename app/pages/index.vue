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
  <div v-if="page" class="min-h-screen bg-gradient-to-b from-yellow-50 to-white">
    <AppHeader />
    
    <UPageHero
      :title="page.title"
      :description="page.description"
      :links="page.hero.links"
      class="relative overflow-hidden my-10"
    >
      <!-- ... fondo igual ... -->
      <template #title>
        <MDC
          :value="page.title"
          unwrap="p"
          class="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-600 to-yellow-700"
        />
      </template>

      <div class="mt-8 relative z-10">
        <div class="w-full max-w-4xl mx-auto bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-yellow-100">
          <PromotionalVideo />
        </div>
      </div>
    </UPageHero>

    <div class="container mx-auto px-4 py-16">
      <UPageSection
        v-for="(section, index) in page.sections"
        :key="index"
        :title="section.title"
        :description="section.description"
        :orientation="section.orientation"
        :reverse="section.reverse"
        :features="section.features"
        class="mb-16"
      >
        <div class="relative">
          <div class="absolute -inset-4 bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-3xl blur-xl opacity-50"></div>
          <div class="relative bg-white rounded-2xl p-8 shadow-lg border border-yellow-100">
            <ImagePlaceholder />
          </div>
        </div>
      </UPageSection>

      <UPageSection
        :title="page.features.title"
        :description="page.features.description"
        class="mb-16"
      >
        <UPageGrid class="gap-6">
          <UPageCard
            v-for="(item, index) in page.features.items"
            :key="index"
            v-bind="item"
            spotlight
            class="bg-white/90 backdrop-blur-sm border border-yellow-100 hover:shadow-xl hover:border-yellow-300 transition-all duration-300 hover:-translate-y-1"
          />
        </UPageGrid>
      </UPageSection>

      <!-- Sección de precios -->
     <div class="relative rounded-3xl overflow-hidden mb-16 bg-gradient-to-br from-yellow-400 to-amber-500 shadow-2xl">
  <!-- Patrón de fondo sutil -->
  <div class="absolute inset-0 opacity-10">
    <div class="absolute inset-0" style="background-image: url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E'); background-repeat: repeat;"></div>
  </div>
  
  <!-- Círculos decorativos -->
  <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
  <div class="absolute bottom-0 left-0 w-48 h-48 bg-yellow-300/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
  
  <div class="relative z-10 px-8 py-16 md:px-12 md:py-20 lg:px-16 text-center">
    <!-- Badge "Lanzamiento" -->
    <div class="mb-6">
      <span class="inline-flex items-center gap-2 text-sm font-medium text-amber-600 bg-white px-4 py-2 rounded-full shadow-md">
        <UIcon name="i-lucide-gift" class="w-4 h-4" />
        Oferta de lanzamiento
      </span>
    </div>

    <!-- Título -->
    <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
      {{ page.pricing.title }}
    </h2>
    
    <!-- Descripción -->
    <p class="text-lg md:text-xl text-yellow-50/90 max-w-2xl mx-auto mb-8">
      {{ page.pricing.description }}
    </p>

    <!-- Tarjeta de precio -->
    <div class="max-w-md mx-auto mb-10">
      <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
        <div class="text-white mb-4">
          <span class="text-sm uppercase tracking-wider opacity-80">Precio especial</span>
          <div class="flex items-end justify-center gap-2 mt-2">
            <span class="text-5xl font-bold">$250</span>
            <span class="text-xl opacity-80 mb-1">/mes</span>
          </div>
        </div>
        
        <!-- Lista de beneficios -->
        <ul class="space-y-3 text-white/90 text-left mb-8">
          <li class="flex items-center gap-2">
            <UIcon name="i-lucide-check-circle" class="w-5 h-5 text-yellow-300 flex-shrink-0" />
            <span>3 meses <span class="font-bold text-white">completamente gratis</span></span>
          </li>
          <li class="flex items-center gap-2">
            <UIcon name="i-lucide-check-circle" class="w-5 h-5 text-yellow-300 flex-shrink-0" />
            <span>Programa curricular ANEP integrado</span>
          </li>
          <li class="flex items-center gap-2">
            <UIcon name="i-lucide-check-circle" class="w-5 h-5 text-yellow-300 flex-shrink-0" />
            <span>Planificaciones ilimitadas</span>
          </li>
          <li class="flex items-center gap-2">
            <UIcon name="i-lucide-check-circle" class="w-5 h-5 text-yellow-300 flex-shrink-0" />
            <span>Sincronización con Google Drive</span>
          </li>
          <li class="flex items-center gap-2">
            <UIcon name="i-lucide-check-circle" class="w-5 h-5 text-yellow-300 flex-shrink-0" />
            <span>Gestión de grupos incluida</span>
          </li>
        </ul>

        <!-- Botón principal -->
        <UButton
          v-for="(link, idx) in page.pricing.links"
          :key="idx"
          v-bind="link"
          size="xl"
          block
          class="bg-white text-amber-600 hover:bg-yellow-50 hover:text-amber-700 border-0 shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
        />
      </div>
    </div>

    <!-- Nota adicional -->
    <p class="text-sm text-yellow-50/80 max-w-2xl mx-auto">
      {{ page.pricing.note }}
    </p>
    
    <!-- Badge de confianza -->
    <div class="mt-6 flex flex-wrap gap-4 justify-center items-center text-sm text-yellow-50/70">
      <span class="flex items-center gap-1">
        <UIcon name="i-lucide-credit-card" class="w-4 h-4" />
        Pago seguro
      </span>
      <span class="flex items-center gap-1">
        <UIcon name="i-lucide-calendar" class="w-4 h-4" />
        Cancela cuando quieras
      </span>
      <span class="flex items-center gap-1">
        <UIcon name="i-lucide-shield" class="w-4 h-4" />
        Sin permanencia
      </span>
    </div>
  </div>
</div>

      <USeparator class="my-16 border-yellow-200" />

      <div class="relative rounded-3xl overflow-hidden bg-gradient-to-br from-yellow-400 to-amber-500 shadow-2xl">
  <!-- Patrón de fondo sutil -->
  <div class="absolute inset-0 opacity-10">
    <div class="absolute inset-0" style="background-image: url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E'); background-repeat: repeat;"></div>
  </div>
  
  <!-- Círculos decorativos -->
  <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
  <div class="absolute bottom-0 left-0 w-48 h-48 bg-yellow-300/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
  
  <div class="relative z-10 px-8 py-16 md:px-12 md:py-20 lg:px-16 text-center">
    <!-- Título -->
    <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
      {{ page.cta.title }}
    </h2>
    
    <!-- Descripción -->
    <p class="text-lg md:text-xl text-yellow-50/90 max-w-2xl mx-auto mb-10">
      {{ page.cta.description }}
    </p>
    
    <!-- Botones -->
    <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
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
            ? 'bg-white text-amber-600 hover:bg-yellow-50 hover:text-amber-700 border-0 shadow-lg hover:shadow-xl transition-all duration-200 px-8'
            : 'bg-transparent text-white border-2 border-white/30 hover:border-white/50 hover:bg-white/10 backdrop-blur-sm transition-all duration-200'
        ]"
      />
    </div>
    
    <!-- Badge opcional de "Sin permanencia" -->
    <div class="mt-6">
      <span class="inline-flex items-center gap-2 text-sm text-yellow-50/80 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
        <UIcon name="i-lucide-check-circle" class="w-4 h-4" />
        Sin permanencia. Cancela cuando quieras.
      </span>
    </div>
  </div>
</div>
    </div>

    <AppFooter></AppFooter>
  </div>
</template>

<style>
/* Estilos adicionales para mejorar la apariencia */
:deep(.UPageCard) {
  border-radius: 1rem;
}

:deep(.UPageSection) {
  scroll-margin-top: 2rem;
}

:deep(.UPageHero) {
  padding-top: 6rem;
  padding-bottom: 6rem;
}

:deep(.UPageGrid) {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

/* Animaciones sutiles */
@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.floating {
  animation: float 3s ease-in-out infinite;
}

/* Color dorado para iconos y títulos */
:deep(.UPageCard .icon) {
  color: #ca8a04;
}

:deep(.UPageCard .title) {
  color: #854d0e;
}

:deep(.UPageCard .description) {
  color: #57534e;
}
</style>