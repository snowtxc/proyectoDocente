<script setup lang="ts">


const links = [[{
  label: 'General',
  icon: 'i-heroicons-user-circle',
  to: '/configuracion/general',
  exact: true
}, {
  label: 'Google',
  icon: 'tabler:brand-google-drive',
  to: '/configuracion/drive'
}]]

</script>

<template>

  <UDashboardPanel grow>
    <UDashboardNavbar title="Settings" />

    <UDashboardToolbar class="py-0 px-1.5 overflow-x-auto">
      <UHorizontalNavigation :links="links" />
    </UDashboardToolbar>

    <NuxtPage />
  </UDashboardPanel>

</template>
