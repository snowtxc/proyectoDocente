<script setup lang="ts">

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
},
{
  id: 'secuencias',
  label: 'Secuencias',
  icon: 'i-heroicons-home',
  to: '/secuencias',
  tooltip: {
    text: 'Secuencias',
    shortcuts: [],
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
