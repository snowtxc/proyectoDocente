<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '~/utils/authStore'
import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum'
import { apiAuthRoutes, apiPlanUsuarioRoutes } from '~/utils/apiRoutes' // FIX: Agregar apiPlanUsuarioRoutes
import FlopiBot from '~/components/flopi-bot/FlopiBot.vue'
import { PromptCategory } from '~/utils/enums/PromptCategory.enum'
import type { EstadoPlanUsuario } from '~/types/estadoPlanUsuario'

const { $apiRest } = useNuxtApp()
const authStore = useAuthStore()

const user = await $apiRest(apiAuthRoutes.user,HttpMethodEnum.GET);

authStore.setUser(user);

const { data: response, error, refresh } = await useAsyncData('planUsuarioEstado', async () => {
  const estadoPlan = await $apiRest<EstadoPlanUsuario>(apiPlanUsuarioRoutes.getEstadoPeriodoPrueba, HttpMethodEnum.GET);
  return { estadoPlan };
});

const flopiBotRef = ref(null);
const route = useRoute();

const estadoPlan = ref<EstadoPlanUsuario>(response.value.estadoPlan);

const links = [
  {
    id: 'home',
    label: 'Inicio',
    icon: 'i-tabler-home',
    to: '/home',
  },
  {
    id: 'grupos',
    label: 'Grupos',
    icon: 'i-tabler-users-group',
    to: '/grupos',
  },
  {
    id: 'planificaciones',
    label: 'Planificaciones',
    icon: 'i-tabler-calendar-event',
    to: '/planificaciones',
  },
  // {
  //   id: 'secuencias',
  //   label: 'Secuencias',
  //   icon: 'i-tabler-list-letters',
  //   to: '/secuencias',
  // },
  {
    id: 'asistentes',
    label: 'Asistentes virtuales',
    icon: 'i-tabler-message-chatbot',
    to: '/asistentes-virtuales',
  },
  // {
  //   id: 'flopi-bot',
  //   label: 'Flopi Bot',
  //   icon: 'i-tabler-robot',
  //   onSelect: () => {
  //     flopiBotRef.value?.openModal();
  //   },
  // },
]
</script>

<template>
  <div class="flex h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Sidebar -->
    <aside class="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div class="p-4 border-b border-gray-200 dark:border-gray-700">
       <NuxtLink to="/" class="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-sm">
          <UIcon name="i-lucide-notebook-text" class="w-5 h-5 text-white" />
        </div>
        <span class="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-yellow-600 to-amber-600">
          FlopiDocentes
        </span>
  </NuxtLink>
      </div>

      <nav class="flex-1 overflow-y-auto p-4 space-y-2">
        <NuxtLink
          v-for="link in links"
          :key="link.id"
          :to="link.to ? link.to : null"
          class="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          :class="{ 'bg-primary text-white font-bold hover:bg-primary': route.path === link.to }"
          @click="link.onSelect"
        >
          <UIcon :name="link.icon" class="w-5 h-5" />
          <span>{{ link.label }}</span>
        </NuxtLink>
      </nav>

      <div class="p-4 border-t border-gray-200 dark:border-gray-700">
        <UserDropdown v-if="user" />
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto">
      <!-- Plan Expired Overlay -->
      <PlanExpiredOverlay
        v-if="estadoPlan?.isExpired"
        :expiry-date="estadoPlan.vencimiento"
        :planes="estadoPlan.planes"
        :plan-name="estadoPlan.planNombre"
        :wpp-phone="estadoPlan.wppPhone"
      />

      <!-- Page Content -->
      <slot />
    
      <!-- Flopi Bot -->
      <FlopiBot
        ref="flopiBotRef"
        :params="{}"
        :hide-button="true"
        :hide-use-response="true"
        :categories="[PromptCategory.OTROS]"
      />
    </main>
  </div>
</template>