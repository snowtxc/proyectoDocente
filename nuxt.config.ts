import { excludes } from "valibot";

export default defineNuxtConfig({
  srcDir: "app",
  plugins: ['~/plugins/apiRest.ts','~/plugins/v-calendar.ts'],
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

  i18n: {
    locales: [
      { code: 'es', name: 'Español', iso: 'es-UY' } // Definir el idioma español
    ],
    defaultLocale: 'es' // Idioma por defecto
  },

  googleSignIn: {
       clientId: process.env.NUXT_PUBLIC_GOOGLE_CLIENT_ID,
       scope: 'openid email profile https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.file',
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
      include: ['@vueuse/core', '@pinia/nuxt', 'v-calendar'],
    }
  },
  experimental: {
    payloadExtraction: true,
    watcher: 'chokidar'
  },

  css: ['~/assets/css/main.css'],

} as any)