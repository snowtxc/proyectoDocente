import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

// No es necesario usar usePinia aquí
export default defineNuxtPlugin((nuxtApp) => {
  const pinia:any = nuxtApp.$pinia
  pinia.use(piniaPluginPersistedstate)
})