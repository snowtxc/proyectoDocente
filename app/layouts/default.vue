<script setup lang="ts">

import { useAuthStore } from '~/utils/authStore';
import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum';
import { apiAuthRoutes } from "~/utils/apiRoutes";

const { $apiRest } = useNuxtApp();

const authStore = useAuthStore();

const user = await $apiRest(apiAuthRoutes.user,HttpMethodEnum.GET);

authStore.setUser(user);


const links = [{
  id: 'home',
  label: 'Inicio',
  icon: 'i-heroicons-home',
  to: '/home',
  tooltip: {
    text: 'Inicio',
    shortcuts: []
  }
},
{
  id: 'grupos',
  label: 'Grupos',
  icon: 'healthicons:i-groups-perspective-crowd-outline',
  to: '/grupos',
  tooltip: {
    text: 'Grupos',
    shortcuts: []
  }
},

{
  id: 'planificaciones',
  label: 'Planificaciones',
  icon: 'i-heroicons-home',
  to: '/planificaciones',
  tooltip: {
    text: 'Planificaciones',
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
  </UDashboardLayout>
</template>
