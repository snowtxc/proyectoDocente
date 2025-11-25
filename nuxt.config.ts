// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  extends: ['@nuxt/ui-pro'],
  srcDir: "app",
  plugins: ['~/plugins/apiRest.ts','~/plugins/v-calendar.ts' ],
  modules: [
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/ui',
    '@vueuse/nuxt',
    '@pinia/nuxt',
    'reka-ui/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    'nuxt-vue3-google-signin',
    '@nuxtjs/i18n',
    'nuxt-tiptap-editor'
  ],

  tiptap: {
    prefix: 'Tiptap', //prefix for Tiptap imports, composables not included
  },

  i18n: {
    locales: [
      { code: 'es', name: 'Español', iso: 'es-UY' } // Definir el idioma español
    ],
    defaultLocale: 'es' // Idioma por defecto
  },
  
  googleSignIn: {
      clientId: process.env.NUXT_GOOGLE_CLIENT_ID,
       scope: 'openid email profile https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.file',
       prompt: 'consent',
       access_type: 'offline',
  },
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL,
      DEFAULT_GRUPO_IMAGE_URL: process.env.NUXT_DEFAULT_GRUPO_IMAGE_URL,
      piniaPersist: true, // Activar persistencia
    },
  },
  
  ui: {
    safelistColors: ['primary', 'red', 'orange', 'green']
  },
  colorMode: {
    disableTransition: true
  },

  ssr: true,
  routeRules: {
    // Temporary workaround for prerender regression. see https://github.com/nuxt/nuxt/issues/27490
    '/': { prerender: true }
  },
  router: {
    middleware: 'userAuth',
  },
  devtools: {
    enabled: false
  },

  typescript: {
    strict: false
  },

  future: {
    compatibilityVersion: 4
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    },
    vite: {
      optimizeDeps: {
        include: ['@vueuse/core', '@pinia/nuxt', 'v-calendar']
      }
    }
  },

  compatibilityDate: '2024-07-11',

  vite: {
    server: {
      watch: {
        usePolling: false,
        interval: 100
      }
    }
  },
  experimental: {
    payloadExtraction: true,
    watcher: 'chokidar'
  }
  
} as any)