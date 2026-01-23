<script setup lang="ts">
definePageMeta({
  layout: 'defaultTwo',
});

const page = ref({
  "title": "FlopiDocentes: Planifica con IA",
  "description": "Plataforma para docentes uruguayos que simplifica la creación de planificaciones, secuencias y gestión de grupos usando inteligencia artificial.",
  "seo": {
    "title": "FlopiDocentes - Gestión Educativa con IA",
    "description": "Herramienta digital que ayuda a docentes a crear planificaciones y gestionar clases usando inteligencia artificial."
  },
  "navigation": false,
  "hero": {
    "links": [
      {
        "label": "Comenzar Gratis",
        "icon": "i-lucide-arrow-right",
        "trailing": true,
        "to": "/signup",
        "size": "xl"
      },
      {
        "label": "Ver Demo",
        "icon": "i-lucide-play-circle",
        "size": "xl",
        "color": "neutral",
        "variant": "subtle",
        "to": "/demo"
      }
    ]
  },
  "sections": [
    {
      "title": "Funcionalidades Principales",
      "description": "Todo lo esencial para organizar tu trabajo docente en un solo lugar.",
      "id": "features",
      "orientation": "horizontal",
      "features": [
        {
          "name": "Planificaciones",
          "description": "Genera planificaciones automáticas usando inteligencia artificial como asistente, adaptadas a tus necesidades.",
          "icon": "i-lucide-brain"
        },
        {
          "name": "Secuencias Didácticas",
          "description": "Organiza tus clases en secuencias lógicas y coherentes fácilmente e integra sus actividades en las planificaciones.",
          "icon": "i-lucide-list-ordered"
        },
        {
          "name": "Gestión de Grupos",
          "description": "Administra tus grupos de forma sencilla.",
          "icon": "i-lucide-users"
        },
        {
          "name": "Sincronización en Google Drive",
          "description": "Sincroniza tus documentos y planificaciones con Google Drive para un acceso fácil y rápido.",
          "icon": "tabler:brand-google-drive"
        }
      ]
    },
    {
      "title": "Optimizado para Docentes",
      "description": "Herramientas prácticas que realmente ahorran tiempo y esfuerzo.",
      "orientation": "horizontal",
      "reverse": true,
      "features": [
        {
          "name": "Ahorro de Tiempo",
          "description": "Reduce horas de trabajo administrativo con una herramienta extremadamente simple.",
          "icon": "i-lucide-clock"
        },
        {
          "name": "Fácil de Usar",
          "description": "Interfaz intuitiva diseñada para docentes, sin complicaciones técnicas.",
          "icon": "i-lucide-smile"
        },
        {
          "name": "Formatos Útiles",
          "description": "Exporta en formatos compatibles con los sistemas educativos.",
          "icon": "i-lucide-file-text"
        }
      ]
    }
  ],
  "features": {
    "title": "¿Por Qué FlopiDocentes?",
    "description": "Características clave que hacen la diferencia en tu día a día.",
    "items": [
      {
        "title": "Asistente de IA",
        "description": "Sugiere actividades y estructura clases basándose en tus objetivos.",
        "icon": "i-lucide-sparkles"
      },
      {
        "title": "Sincronización con Google Drive",
        "description": "Mantén tus documentos y planificaciones siempre actualizados y accesibles.",
        "icon": "tabler:brand-google-drive"
      },
      {
        "title": "Organización Visual",
        "description": "Vista clara de tus planificaciones, tramos y secuencias para una mejor gestión.",
        "icon": "i-lucide-calendar"
      },
      {
        "title": "Programa Curricular Integrado",
        "description": "Accede fácilmente a los contenidos oficiales de ANEP para planificar tus clases.",
        "icon": "i-lucide-book-open"
      },
    ]
  },
  "testimonials": {
    "headline": "Primeros Usuarios",
    "title": "Docentes que ya están probando",
    "description": "Experiencias iniciales de educadores que están descubriendo la plataforma.",
    "items": [
      {
        "quote": "La IA me ayuda a estructurar mejor mis clases. Ahorro tiempo valioso cada semana.",
        "user": {
          "name": "Docente de Primaria",
          "description": "Montevideo",
          "avatar": {
            "src": "https://i.pravatar.cc/120?img=1"
          }
        }
      },
      {
        "quote": "Me gusta lo simple que es crear secuencias didácticas. Todo está bien organizado.",
        "user": {
          "name": "Maestra de 3ro",
          "description": "Canelones",
          "avatar": {
            "src": "https://picsum.photos/seed/docente1/120/120"
          }
        }
      },
      {
        "quote": "Gestión de grupos muy práctica. Mantengo todo ordenado sin esfuerzo.",
        "user": {
          "name": "Docente Rural",
          "description": "Interior",
          "avatar": {
            "src": "https://picsum.photos/seed/docente2/120/120"
          }
        }
      }
    ]
  },
  "cta": {
    "title": "¿Listo para simplificar tu trabajo?",
    "description": "Únete gratis a FlopiDocentes y descubre cómo la IA puede ayudarte en tu labor docente.",
    "links": [
      {
        "label": "Registrarse Gratis",
        "to": "/signup",
        "trailingIcon": "i-lucide-arrow-right"
      },
      {
        "label": "Probar Demo",
        "to": "/demo",
        "variant": "subtle",
        "icon": "i-lucide-play"
      }
    ]
  }
});

const title = page.value?.seo?.title || page.value?.title
const description = page.value?.seo?.description || page.value?.description

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
      <template #top>
        <div class="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-yellow-500/10">
          <div class="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23CA8A04%22 fill-opacity=%220.05%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
        </div>
      </template>

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

      <div class="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-3xl p-8 mb-16 border border-yellow-200">
        <UPageSection
          id="testimonials"
          :headline="page.testimonials.headline"
          :title="page.testimonials.title"
          :description="page.testimonials.description"
        >
          <UPageColumns class="xl:columns-3 gap-6">
            <UPageCard
              v-for="(testimonial, index) in page.testimonials.items"
              :key="index"
              variant="subtle"
              :description="testimonial.quote"
              :ui="{ 
                description: 'before:content-[open-quote] after:content-[close-quote] text-gray-700',
                root: 'break-inside-avoid bg-white/80 backdrop-blur-sm border border-yellow-100 hover:bg-white transition-colors duration-300'
              }"
            >
              <template #footer>
                <UUser
                  v-bind="testimonial.user"
                  size="lg"
                  class="mt-4"
                />
              </template>
            </UPageCard>
          </UPageColumns>
        </UPageSection>
      </div>

      <USeparator class="my-16 border-yellow-200" />

      <div class="relative rounded-3xl overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-r from-yellow-100 to-yellow-200"></div>
        <div class="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%22100%22 height=%22100%22 viewBox=%220 0 100 100%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath d=%22M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z%22 fill=%22%23ffffff%22 fill-opacity=%220.15%22 fill-rule=%22evenodd%22/%3E%3C/svg%3E')] opacity-20"></div>
        <UPageCTA
          v-bind="page.cta"
          variant="naked"
          class="relative z-10 p-12 text-white"
        >
          <LazyStarsBg class="opacity-20" />
        </UPageCTA>
      </div>
    </div>
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