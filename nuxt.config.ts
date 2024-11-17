// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  extends: ['@nuxt/ui-pro'],
  srcDir: "app",
  plugins: ['~/plugins/axios.ts', '~/plugins/v-calendar.ts'],
  modules: ['@nuxt/content', '@nuxt/eslint', '@nuxt/fonts', '@nuxt/ui', '@vueuse/nuxt', '@pinia/nuxt', '@pinia/nuxt'],
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL,
      DEFAULT_GRUPO_IMAGE_URL: process.env.NUXT_DEFAULT_GRUPO_IMAGE_URL //definimos la variable de entorno con la url de la imagen por defecto del grupo
    },
  },


  ui: {
    safelistColors: ['primary', 'red', 'orange', 'green']
  },
  colorMode: {
    disableTransition: true
  },

  ssr: false,
  routeRules: {
    // Temporary workaround for prerender regression. see https://github.com/nuxt/nuxt/issues/27490
    '/': { prerender: true }
  },
  router: {
    middleware: 'userAuth',
  },
  devtools: {
    enabled: true
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
    }
  },

  compatibilityDate: '2024-07-11'
} as any)