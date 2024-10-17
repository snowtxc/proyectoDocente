<script setup lang="ts">

import { useRoute } from '#app'
import GlobalSpinner from './components/GlobalSpinner/GlobalSpinner.vue';
import { useAuthStore } from './services/authService/authService';
import { useErrorStore } from './services/errorService/errorService';
import { useLoadingStore } from './services/loadingService/loadingService';
import { checkUserAuthentication } from './utils/user';

let timeout: any = 0;
const colorMode = useColorMode()
const route = useRoute()
const currentPathname = route?.path
const color = computed(() => colorMode.value === 'dark' ? '#111827' : 'white')
const authStore = useAuthStore()
const errorStore = useErrorStore()
const loadingStore = useLoadingStore()
const toast = useToast()
const isPublicPath = LIST_PUBLIC_ROUTES.includes(currentPathname);

onMounted(() => {
  if (LIST_PUBLIC_ROUTES.includes(currentPathname)) {
    authStore.getCsrf()
  }
});

const isCheckiing = await checkUserAuthentication(isPublicPath)


// set global alert error when API error
watch(
  () => errorStore.errorMessage,
  (newValue) => {
    if (newValue && newValue !== "") {
      toast.add({
        title: "Error",
        description: newValue,
        color: 'red',
      })
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        errorStore.clearError()
      }, 5000)
    }
  }
)

watch(
  () => loadingStore.loading,
  (newValue) => {
    console.log("loading", newValue)
  }
)

watch(
  () => [authStore.token, authStore.user],
  (newValue) => {
    if (handleGetSotredToken() && !authStore.user) {
      checkUserAuthentication(isPublicPath)
    }

  }
)


useHead({
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { key: 'theme-color', name: 'theme-color', content: color }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

const title = 'Nuxt UI Pro - Dashboard template'
const description = 'Nuxt UI Pro is a collection of premium Vue components built on top of Nuxt UI to create beautiful & responsive Nuxt applications in minutes.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: 'https://dashboard-template.nuxt.dev/social-card.png',
  twitterImage: 'https://dashboard-template.nuxt.dev/social-card.png',
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <div>
    <NuxtLoadingIndicator />

    <NuxtLayout>
      <GlobalSpinner v-if="loadingStore.loading || isCheckiing !== true" />
      <NuxtPage v-if="isCheckiing === true" />
    </NuxtLayout>

    <UNotifications />
    <UModals />
  </div>
</template>
