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
 <UCard>
  <!-- Header mejorado -->
  <template #header>
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="p-2 rounded-lg bg-primary-50 dark:bg-primary-900/30">
          <UIcon 
            name="tabler:calendar-event" 
            class="w-5 h-5 text-primary-600 dark:text-primary-400"
          />
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Planificaciones recientes
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Accede rápidamente a tus últimas planificaciones
          </p>
        </div>
      </div>
      
      <!-- Contador -->
      <div 
        v-if="props.planificaciones.length > 0"
        class="px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-sm font-medium"
      >
        {{ props.planificaciones.length }} {{ props.planificaciones.length === 1 ? 'item' : 'items' }}
      </div>
    </div>
  </template>

  <!-- Contenido -->
  <div class="space-y-1">
    <!-- Estado vacío -->
    <div
      v-if="props.planificaciones.length === 0"
      class="flex flex-col items-center justify-center py-10 text-center rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30"
    >
      <div class="p-4 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
        <UIcon
          name="tabler:calendar-off"
          class="w-10 h-10 text-gray-400 dark:text-gray-500"
        />
      </div>
      <p class="text-gray-700 dark:text-gray-300 font-medium mb-1">
        No hay planificaciones recientes
      </p>
      <p class="text-gray-500 dark:text-gray-400 text-sm max-w-xs">
        Las planificaciones que consultes aparecerán aquí para acceso rápido
      </p>
    </div>

    <!-- Lista de planificaciones -->
    <div v-else class="space-y-2">
      <div
        v-for="(planificacion, index) in props.planificaciones"
        :key="index"
        class="group relative"
      >
        <!-- Elemento de lista mejorado -->
        <div
          class="px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-800 hover:bg-gradient-to-r hover:from-primary-50/50 hover:to-transparent dark:hover:from-primary-900/10 dark:hover:to-transparent transition-all duration-200 cursor-pointer flex items-center justify-between gap-3"
          @click="verPlanificacion(planificacion)"
        >
          <!-- Contenido principal -->
          <div class="flex items-start gap-3 flex-1 min-w-0">
            <!-- Indicador visual -->
            <div class="flex-shrink-0 mt-1">
              <div class="w-2 h-2 rounded-full bg-primary-500 group-hover:bg-primary-600 transition-colors"></div>
            </div>
            
            <!-- Información de la planificación -->
            <div class="flex-1 min-w-0">
              <!-- Nombre y fecha -->
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                <h4 class="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {{ planificacion.nombre }}
                </h4>
                <span class="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {{ formatFecha(planificacion.last_planning_access_at) }}
                </span>
              </div>
              
              <!-- Grupo y grados -->
              <div class="flex flex-wrap items-center gap-2">
                <!-- Grupo -->
                <div class="flex items-center gap-2">
                  <UAvatar 
                    :src="formattedImageUrlGrupo(planificacion.grupo?.url_image)" 
                    size="xs"
                    class="ring-2 ring-white dark:ring-gray-800"
                  />
                  <span class="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {{ planificacion.grupo?.nombre }}
                  </span>
                </div>
                
                <!-- Separador -->
                <div class="w-px h-3 bg-gray-300 dark:bg-gray-600"></div>
                
                <!-- Grados -->
                <div class="flex flex-wrap gap-1">
                  <BadgeGrado 
                    v-for="(grado, idx) in planificacion.grupo.grados" 
                    :key="idx" 
                    :grado="grado"
                    size="xs"
                    class="text-xs"
                  />
                </div>
              </div>
              
              <!-- Último acceso -->
              <div class="flex items-center gap-1.5 mt-2 text-xs text-gray-500 dark:text-gray-400">
                <UIcon name="tabler:clock" class="w-3.5 h-3.5 flex-shrink-0" />
                <span class="truncate">Último acceso: {{ formatFecha(planificacion.last_planning_access_at) }}</span>
              </div>
            </div>
          </div>
          
          <!-- Botón de acción -->
          <div class="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <UButton
              icon="tabler:arrow-right"
              size="sm"
              color="primary"
              variant="ghost"
              @click.stop="verPlanificacion(planificacion)"
            />
          </div>
        </div>
        
        <!-- Separador sutil -->
        <div 
          v-if="index < props.planificaciones.length - 1"
          class="h-px bg-gradient-to-r from-transparent via-gray-100 dark:via-gray-700 to-transparent mt-2"
        ></div>
      </div>
    </div>
  </div>
</UCard>
</template>