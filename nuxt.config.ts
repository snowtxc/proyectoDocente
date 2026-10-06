export default defineNuxtConfig({
  srcDir: "app",
  plugins: ['~/plugins/apiRest.ts'],
  modules: [
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/ui',
    '@vueuse/nuxt',
    '@pinia/nuxt',
    'reka-ui/nuxt',
    'nuxt-vue3-google-signin',
    '@nuxtjs/i18n',
    'nuxt-toast',
    'pinia-plugin-persistedstate/nuxt'
  ],

  tiptap: {
    prefix: 'Tiptap', //prefix for Tiptap imports, composables not included
  },

  // Tipografías de la marca: Baloo 2 para títulos y Nunito Sans para el texto.
  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Nunito+Sans:opsz,wght@6..12,400;6..12,600;6..12,700;6..12,800&display=swap' }
      ]
    }
  },

  i18n: {
    locales: [
      { code: 'es', name: 'Español', iso: 'es-UY' } // Definir el idioma español
    ],
    defaultLocale: 'es' // Idioma por defecto
  },

  googleSignIn: {
       clientId: process.env.NUXT_PUBLIC_GOOGLE_CLIENT_ID,
       scope: 'openid email profile',
       prompt: 'consent',
       access_type: 'offline',
  },
  runtimeConfig: {
    public: {
      apiDomain : process.env.NUXT_PUBLIC_API_DOMAIN,
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL,
      DEFAULT_IMAGE_URL: process.env.NUXT_PUBLIC_DEFAULT_IMAGE,
      piniaPersist: true, // Activar persistencia
    },
  },
  
  ui: {
    safelistColors: ['primary', 'red', 'orange', 'green'],
    global: true,
    colorMode : false
  },
  colorMode: {
    disableTransition: true
  },

  ssr: true,
  routeRules: {
    // Temporary workaround for prerender regression. see https://github.com/nuxt/nuxt/issues/27490
    '/': { prerender: true }
  },
  devtools: {
    enabled: false
  },

  typescript: {
    strict: false
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  compatibilityDate: '2025-07-15',

  vite: {
    server: {
      watch: {
        usePolling: false,
        interval: 100
      }
    },
    optimizeDeps: {
      include: ['@vueuse/core', '@pinia/nuxt'],
    }
  },
  experimental: {
    payloadExtraction: true,
    watcher: 'chokidar'
  },

  css: ['~/assets/css/main.css'],

} as any)