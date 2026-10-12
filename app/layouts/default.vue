<script setup lang="ts">
import { useAuthStore } from '~/utils/authStore'
import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum'
import { apiAuthRoutes } from '~/utils/apiRoutes'
import { appRoutes } from '~/utils/appRoutes'
import { useSuscripcionStore } from '~/utils/suscripcionStore'
import { useSuscripcionService } from '~/services/suscripcionService/suscripcionService'

const { $apiRest } = useNuxtApp()
const authStore = useAuthStore()
const suscripcionStore = useSuscripcionStore()
const suscripcionService = useSuscripcionService()
const route = useRoute();

const user = await $apiRest(apiAuthRoutes.user,HttpMethodEnum.GET);

authStore.setUser(user);

// Mes gratis o período pago. Si venció, lo único disponible es la pantalla para renovar.
try {
  suscripcionStore.setEstado(await suscripcionService.obtenerEstado())
} catch (error) {
  console.error('No se pudo consultar la suscripción:', error)
}

if (suscripcionStore.vencida && route.path !== appRoutes.suscripcion()) {
  await navigateTo(appRoutes.suscripcion())
}

const secciones = [
  {
    id: 'asistente',
    label: 'Flopi',
    descripcion: 'Planificaciones y descripciones',
    icon: 'i-tabler-message-chatbot',
    to: appRoutes.asistente(),
  },
  {
    id: 'grupos',
    label: 'Mis grupos',
    descripcion: 'Tus clases y sus grados',
    icon: 'i-tabler-users-group',
    to: appRoutes.grupos(),
  },
]

// Con el período vencido no se muestran las secciones: no se puede entrar a ninguna.
const links = computed(() => suscripcionStore.vencida ? [] : secciones)

const avisoVencimiento = computed(() => {
  const estado = suscripcionStore.estado

  if (!estado?.avisar || route.path === appRoutes.suscripcion()) {
    return null
  }

  const dias = estado.dias_restantes
  const cuanto = dias <= 1 ? 'Te queda 1 día' : `Te quedan ${dias} días`

  return estado.en_prueba ? `${cuanto} de tu mes gratis.` : `${cuanto} de Flopi.`
})

const estaActivo = (to: string) => route.path === to || route.path.startsWith(`${to}/`)
</script>

<template>
  <div class="flex flex-col md:flex-row h-dvh bg-panal">
    <!-- Barra lateral (escritorio) -->
    <aside class="hidden md:flex w-64 flex-shrink-0 flex-col bg-panal-mona text-white">
      <div class="px-5 pt-6 pb-5">
        <FlopiLogo tono="claro" :to="appRoutes.asistente()" />
      </div>

      <nav class="flex-1 overflow-y-auto px-3 space-y-1.5" aria-label="Secciones">
        <NuxtLink
          v-for="link in links"
          :key="link.id"
          :to="link.to"
          class="group flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-colors"
          :class="estaActivo(link.to)
            ? 'bg-miel-400 text-mona-950 shadow-[0_4px_0_0_var(--color-miel-600)]'
            : 'text-mona-100 hover:bg-white/10'"
          :aria-current="estaActivo(link.to) ? 'page' : undefined"
        >
          <span
            class="w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center"
            :class="estaActivo(link.to) ? 'bg-white/45' : 'bg-white/10 group-hover:bg-white/15'"
          >
            <UIcon :name="link.icon" class="w-5 h-5" />
          </span>
          <span class="min-w-0">
            <span class="block font-display text-lg font-semibold leading-tight">{{ link.label }}</span>
            <span class="block text-xs leading-tight" :class="estaActivo(link.to) ? 'text-mona-900/80' : 'text-mona-200/80'">
              {{ link.descripcion }}
            </span>
          </span>
        </NuxtLink>
      </nav>

      <div class="p-3 border-t border-white/10">
        <UserDropdown v-if="user" />
      </div>
    </aside>

    <!-- Barra superior (celular) -->
    <header class="md:hidden flex items-center justify-between gap-2 px-3 py-2 bg-panal-mona text-white">
      <FlopiLogo tono="claro" :to="appRoutes.asistente()" />
      <nav class="flex items-center gap-1" aria-label="Secciones">
        <NuxtLink
          v-for="link in links"
          :key="link.id"
          :to="link.to"
          class="w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center"
          :class="estaActivo(link.to) ? 'bg-miel-400 text-mona-950' : 'text-mona-100 hover:bg-white/10'"
          :aria-label="link.label"
          :aria-current="estaActivo(link.to) ? 'page' : undefined"
        >
          <UIcon :name="link.icon" class="w-5 h-5" />
        </NuxtLink>
        <UserDropdown v-if="user" compacto />
      </nav>
    </header>

    <!-- Contenido -->
    <div class="flex-1 min-h-0 flex flex-col">
      <NuxtLink
        v-if="avisoVencimiento"
        :to="appRoutes.suscripcion()"
        class="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2 bg-miel-200 text-mona-950 text-sm border-b-2 border-miel-400 hover:bg-miel-300 transition-colors"
      >
        <span class="inline-flex items-center gap-1.5">
          <UIcon name="i-tabler-hourglass-low" class="w-4 h-4 flex-shrink-0" />
          {{ avisoVencimiento }}
        </span>
        <span class="font-bold underline underline-offset-2">Renovar ahora</span>
      </NuxtLink>

      <main class="flex-1 min-h-0 overflow-y-auto">
        <slot />
      </main>
    </div>
  </div>
</template>
