<script setup lang="ts">
import flyingBeeAnimation from '@/lotties/Flying bee-2.json'
import type { DashboardData } from '~/types/dashboard';
import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum';

const authStore = useAuthStore();
const user = computed(() => authStore.user);

const { $apiRest } = useNuxtApp();

const { data: dashboardData, error, refresh } = await useAsyncData('dashboardData', async () => {
  return await  $apiRest<DashboardData>(apiDashboardRoutes.getDashboard, HttpMethodEnum.GET);
});

const planificaciones = computed(() => 
  dashboardData.value?.ultimasPlanificacionesAccedidas ?? []
)

console.log('Dashboard Data:', dashboardData.value);

</script>

<template>
  <UDashboardPage>
    <UDashboardPanel grow>
      <UDashboardNavbar title="Home">
    
      </UDashboardNavbar>

      <UDashboardPanelContent class="p-10">
        <!-- ~/components/home/HomeChart.vue -->
        <WelcomeSection
        :userName="user.nombre1"
        />

        <LottieAnimation :animationData="flyingBeeAnimation" class="w-1/2 m-auto"></LottieAnimation>

        <div class="grid lg:items-start gap-8 mt-8">
          <HomeSales :planificaciones="planificaciones" />
        </div>
      </UDashboardPanelContent>
    </UDashboardPanel>
  </UDashboardPage>
</template>
