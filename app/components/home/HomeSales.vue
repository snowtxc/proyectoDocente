<script setup lang="ts">
import type { Planificacion } from '~/types/planificacion';

interface Props {
  planificaciones: Planificacion[]
}

const props = withDefaults(defineProps<Props>(), { })

const verPlanificacion = async(row: Planificacion)=>{
    await navigateTo({
        path: appRoutes.planificacionPage(row.slug)
    })
}

const formatFecha = (fecha: string | Date) => {
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
  
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false // Para formato 24h, quita esto si quieres AM/PM
  });
}

const formattedImageUrlGrupo = (url: string) => {
  // Tu lógica para formatear la URL
  return url;
}
</script>

<template>
  <UDashboardCard
    title="Planificaciones recientes"
    icon="tabler:calendar-event"
  >
    <!-- Mostrar mensaje cuando no hay planificaciones -->
    <div
      v-if="props.planificaciones.length === 0"
      class="flex flex-col items-center justify-center py-8 text-center"
    >
      <UIcon
        name="tabler:calendar-off"
        class="w-12 h-12 text-gray-400 dark:text-gray-500 mb-3"
      />
      <p class="text-gray-500 dark:text-gray-400 font-medium">
        No se ha accedido a planificaciones aún
      </p>
      <p class="text-gray-400 dark:text-gray-500 text-sm mt-1">
        Las planificaciones que consultes aparecerán aquí
      </p>
    </div>

    <!-- Mostrar lista de planificaciones cuando hay elementos -->

    <div
     v-else
    v-for="(planificacion, index) in props.planificaciones"
    :key="index">
      <div
        class="px-3 py-2 -mx-2 last:-mb-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer flex items-center gap-3 relative"
        @click="verPlanificacion(planificacion)"
      >
        <div class="text-sm flex-1">
          <div>
            <p class="text-gray-900 dark:text-white font-medium">
              {{ planificacion.nombre }}
            </p>

            <div class="mt-2 flex flex-col md:flex-row gap-2 items-center"> 
              <div class="flex items-center gap-2">
                <UAvatar :src="formattedImageUrlGrupo(planificacion.grupo?.url_image)" size="2xs" />
                <span>{{ planificacion.grupo?.nombre }}</span>
              </div>
              <div class="flex items-center gap-2">
                <BadgeGrado v-for="(grado,idx) in planificacion.grupo.grados" :key="idx" :grado="grado" />
              </div>
            </div>

            <!-- Fecha de último acceso -->
            <div class="mt-1 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <UIcon name="tabler:clock" class="w-3 h-3" />
              <span>Últ. acceso: {{ formatFecha(planificacion.last_planning_access_at) }}</span>
            </div>
          </div>
        </div>

        <UButton
          icon="tabler:eye"
          size="sm"
          color="primary"
          variant="outline"
          @click.stop="verPlanificacion(planificacion)"
        />
        
      </div>
      
      <UDivider class="my-2"></UDivider>
    </div>
    
  </UDashboardCard>
</template>