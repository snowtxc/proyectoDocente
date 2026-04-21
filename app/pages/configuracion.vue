<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const links = [[{
  label: 'General',
  icon: 'i-lucide-user',
  to: '/configuracion',
  exact: true
}, {
  label: 'Parámetros de Planificación',
  icon: 'i-lucide-sliders-horizontal',
  to: '/configuracion/parametros-planificacion'
}]] satisfies NavigationMenuItem[][]
</script>

<template>
  <UDashboardPanel id="configuracion" :ui="{ body: 'lg:py-12' }">
    <template #header>
      <UDashboardNavbar title="Configuracion">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <!-- NOTE: The `-mx-1` class is used to align with the `DashboardSidebarCollapse` button here. -->
        <UNavigationMenu :items="links" highlight class="-mx-1 flex-1" />
      </UDashboardToolbar>
    </template>

    <template #body>
      <div class="flex flex-col gap-4 sm:gap-6 lg:gap-12 w-full lg:max-w-2xl mx-auto">
        <NuxtPage />
      </div>
    </template>
  </UDashboardPanel>
</template>
