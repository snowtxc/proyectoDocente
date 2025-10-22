<script setup lang="ts">

import { useAuthStore } from '~/utils/authStore';
import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum';
import { apiAuthRoutes } from "~/utils/apiRoutes";

import FlopiBot from '~/components/flopi-bot/FlopiBot.vue';
import { PromptCategory } from '~/utils/enums/PromptCategory.enum';

const { $apiRest } = useNuxtApp();

const authStore = useAuthStore();

const user = await $apiRest(apiAuthRoutes.user,HttpMethodEnum.GET);

authStore.setUser(user);

const flopiBotRef = ref(null);

const links = [{
  id: 'home',
  label: 'Inicio',
  icon: 'tabler:home',
  to: '/home',
  tooltip: {
    text: 'Inicio',
    shortcuts: []
  }
},
{
  id: 'grupos',
  label: 'Grupos',
  icon: 'tabler:users-group',
  to: '/grupos',
  tooltip: {
    text: 'Grupos',
    shortcuts: []
  }
},

{
  id: 'planificaciones',
  label: 'Planificaciones',
  icon: 'tabler:calendar-event',
  to: '/planificaciones',
  tooltip: {
    text: 'Planificaciones',
    shortcuts: []
  }
},
{
  id: 'secuencias',
  label: 'Secuencias',
  icon: 'tabler:list-letters',
  to: '/secuencias',
  tooltip: {
    text: 'Secuencias',
    shortcuts: []
  }
},
{
  id: 'flopi-bot',
  label: 'Flopi Bot',
  icon: 'tabler:robot',
  click: ()=>{
    flopiBotRef.value.openModal();
  },

  tooltip: {
    text: 'Flopi Bot',
    shortcuts: []
  }
}]


const groups = [{
  key: 'links',
  label: 'Ir a',
  commands: links.map(link => ({ ...link, shortcuts: link.tooltip?.shortcuts }))
}]

</script>

<template>
  <UDashboardLayout>
    <UDashboardPanel
      :width="250"
      :resizable="{ min: 200, max: 300 }"
      collapsible
    >
      <UDashboardNavbar
        class="!border-transparent"
        :ui="{ left: 'flex-1' }"
      >
        <template #left>
          <TeamsDropdown />
        </template>
      </UDashboardNavbar>

      <UDashboardSidebar>
        <template #header>
          <UDashboardSearchButton />
        </template>

        <UDashboardSidebarLinks :links="links" />

        <UDivider />

        <div class="flex-1" />

        <UDivider class="sticky bottom-0" />

        <template #footer>
          <!-- ~/components/UserDropdown.vue -->
          <UserDropdown />
        </template>
      </UDashboardSidebar>
    </UDashboardPanel>

    <slot />

    <!-- ~/components/HelpSlideover.vue -->
    <HelpSlideover />
    <!-- ~/components/NotificationsSlideover.vue -->
    <NotificationsSlideover />

    <ClientOnly>
      <LazyUDashboardSearch :groups="groups" />
    </ClientOnly>

    <FlopiBot :params="{}" ref="flopiBotRef" :hideButton="true" :hideUseResponse="true" :categories="[PromptCategory.OTROS]"></FlopiBot>
  </UDashboardLayout>
</template>
