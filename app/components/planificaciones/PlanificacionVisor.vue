<script setup lang="ts">
import type { Planificacion } from '~/types/planificacion';
import type { PlanificacionFecha } from '~/types/planificacionFecha';
import { useClipboard } from '@vueuse/core';
import { Vue3Lottie } from 'vue3-lottie';
import flyingBeeAnimation from '@/lotties/Flying bee-2.json';
import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum';
import type { ListRequest } from '~/types/list-request';

const props = defineProps<{
  planificacion: Planificacion
}>();

const { copy } = useClipboard();
const toast = useToast();
const { $apiRest } = useNuxtApp();

const planificacionFechas = ref<PlanificacionFecha[]>([]);
const loading = ref(true);

const fetchPlanificacionCompleta = async () => {
  try {
    loading.value = true;
    const filters = { planificacion_id: props.planificacion.id };
    const listReq: ListRequest = { page: -1, rowsPerPage: 1, filters };

    const response = await $apiRest<any>(
      apiPlanificacionesFechaRoutes.getPaginate, 
      HttpMethodEnum.POST, 
      listReq
    );

    planificacionFechas.value = response.list.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
  } catch (error) {
    console.error('Error:', error);
    toast.error({ title: 'Error', message: 'No se pudo cargar la planificación' });
  } finally {
    loading.value = false;
  }
};

onMounted(() => fetchPlanificacionCompleta());

const handleCopy = async (text: string | undefined, label: string) => {
  if (!text) return;
  // Limpiar HTML si es necesario
  const cleanText = text.replace(/<[^>]*>?/gm, '').trim();
  await copy(cleanText);
  toast.success({
    title: 'Copiado',
    message: `${label} al portapapeles`,
    color: 'primary',
    icon: 'i-tabler-copy-check'
  });
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('es-UY', { weekday: 'long', day: 'numeric', month: 'long' });
};
</script>

<template>
  <div class="space-y-10 p-4 max-w-5xl mx-auto selection:bg-primary-100 selection:text-primary-900">
    
    <div v-if="loading" class="flex flex-col items-center justify-center py-24">
      <Vue3Lottie :animation-data="flyingBeeAnimation" :height="180" :width="180" />
      <p class="text-sm text-primary-500 font-bold animate-pulse mt-4 uppercase tracking-tighter">Preparando visor interactivo...</p>
    </div>

    <template v-else>
      <header class="relative p-8 rounded-3xl bg-primary-50 dark:bg-primary-900/10 border-2 border-primary-100 dark:border-primary-800/30 overflow-hidden">
        <div class="relative z-10">
          <UBadge color="primary" variant="subtle" class="mb-3 uppercase font-black tracking-widest">Planificación Consolidada</UBadge>
          <h1 class="text-4xl font-black text-gray-900 dark:text-white tracking-tight">{{ props.planificacion.nombre }}</h1>
          <div class="mt-4 flex flex-wrap gap-4 text-sm font-medium">
            <span class="flex items-center gap-1.5 text-primary-700 dark:text-primary-400">
              <UIcon name="tabler:users-group" /> {{ props.planificacion.grupo?.nombre }}
            </span>
            <span class="flex items-center gap-1.5 text-gray-500">
              <UIcon name="tabler:calendar-stats" /> {{ planificacionFechas.length }} Sesiones
            </span>
          </div>
        </div>
        <UIcon name="tabler:school" class="absolute -right-6 -bottom-6 size-48 text-primary-200/40 dark:text-primary-800/20 -rotate-12" />
      </header>

      <div v-for="dia in planificacionFechas" :key="dia.id" class="space-y-8">
        <div class="sticky top-0 z-20 flex items-center justify-between py-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b-2 border-primary-100 dark:border-primary-900/30">
          <div class="flex items-center gap-4">
            <div class="p-2.5 bg-primary-600 rounded-xl text-white shadow-lg shadow-primary-200 dark:shadow-none">
              <UIcon name="tabler:calendar-due" class="size-6" />
            </div>
            <h2 class="text-2xl font-black text-gray-800 dark:text-gray-100 capitalize tracking-tight">{{ formatDate(dia.fecha) }}</h2>
          </div>
        </div>

        <div v-for="tramo in dia.tramos" :key="tramo.id" class="ml-4 pl-8 border-l-4 border-primary-100 dark:border-primary-900/40 pb-12 last:pb-4 relative">
          <div class="absolute -left-[14px] top-0 size-6 rounded-full border-4 border-white dark:border-gray-900 shadow-md ring-2 ring-primary-50 dark:ring-primary-900/20"
            :style="{ backgroundColor: tramo.espacio?.rgbColor || 'var(--color-primary-500)' }">
          </div>

          <div class="space-y-8">
            <div class="flex items-start justify-between">
              <div>
                <div class="flex items-center gap-3 mb-1">
                  <h3 class="text-xl font-black text-primary-600 dark:text-primary-400">Tramo {{ tramo.orden }}</h3>
                  <span v-if="tramo.noSeDesarrolla" class="px-3 py-1 bg-red-50 text-red-600 border border-red-100 rounded-lg text-[10px] font-black uppercase tracking-widest">No se desarrolla</span>
                </div>
                
                <div class="flex flex-wrap items-center gap-2">
                  <UButton variant="ghost" color="neutral" size="xs" class="hover:bg-primary-50" @click="handleCopy(tramo.espacio?.nombre, 'Espacio')">
                    <span class="size-2 rounded-full mr-1" :style="{ backgroundColor: tramo.espacio?.rgbColor }"></span>
                    <span class="font-bold text-gray-700 dark:text-gray-300 underline decoration-primary-200 decoration-2 underline-offset-4">{{ tramo.espacio?.nombre }}</span>
                  </UButton>
                  <UIcon name="tabler:chevron-right" class="text-gray-300" />
                  <UButton variant="ghost" color="neutral" size="xs" class="hover:bg-primary-50" @click="handleCopy(tramo.unidad_curricular?.nombre, 'Unidad Curricular')">
                    <span class="font-bold text-primary-600 dark:text-primary-400 underline decoration-primary-200 decoration-2 underline-offset-4">{{ tramo.unidad_curricular?.nombre }}</span>
                  </UButton>
                </div>
              </div>
            </div>

            <div v-if="tramo.noSeDesarrolla" class="p-5 rounded-2xl bg-red-50/30 dark:bg-red-900/10 border-2 border-dashed border-red-100 dark:border-red-900/20">
               <p class="text-sm italic text-red-700 dark:text-red-400 font-medium">Motivo: {{ tramo.motivoNoSeDesarrolla || 'Sin especificar' }}</p>
            </div>

            <template v-else>
              <div v-if="tramo.contenido" class="bg-gray-50/80 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 group relative">
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center gap-2">
                    <UIcon name="tabler:bookmarks" class="text-primary-500 size-5" />
                    <span class="text-[10px] font-black uppercase text-gray-400 tracking-tighter">Contenido</span>
                  </div>
                  <UButton icon="tabler:copy" color="primary" variant="soft" size="xs" @click="handleCopy(tramo.contenido.descripcion, 'Contenido')" />
                </div>
                <p class="text-sm font-bold text-gray-800 dark:text-gray-200 leading-relaxed">{{ tramo.contenido.descripcion }}</p>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div v-if="tramo.competencias_generales?.length" class="space-y-4">
                  <span class="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                    <UIcon name="tabler:award" class="text-primary-400" /> Competencias Generales
                  </span>
                  <div class="flex flex-wrap gap-2">
                    <UButton v-for="cg in tramo.competencias_generales" :key="cg.id" 
                      variant="subtle" color="primary" size="xs" class="rounded-lg font-bold"
                      @click="handleCopy(cg.nombre, 'Comp. General')">
                      {{ cg.nombre }}
                    </UButton>
                  </div>
                </div>

                <div v-if="tramo.competencias_especificas?.length" class="space-y-4">
                  <span class="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                    <UIcon name="tabler:bolt" class="text-primary-400" /> Competencias Específicas
                  </span>
                  <div class="space-y-3">
                    <div v-for="ce in tramo.competencias_especificas" :key="ce.id" 
                      class="p-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl hover:border-primary-200 transition-colors group relative">
                      <UButton icon="tabler:copy" color="primary" variant="ghost" size="xs" class="absolute top-2 right-2 opacity-0 group-hover:opacity-100" @click="handleCopy(ce.descripcion, 'Comp. Específica')" />
                      <p class="text-[11px] leading-relaxed pr-8">
                        <span class="font-black text-primary-600 dark:text-primary-400">{{ ce.codificacion }}:</span>
                        {{ ce.descripcion }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="tramo.criterios_de_logros?.length" class="space-y-4">
                <span class="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2 pl-2">
                  <UIcon name="tabler:checkbox" class="text-primary-400" /> Criterios de Logro
                </span>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div v-for="cl in tramo.criterios_de_logros" :key="cl.id" 
                    class="p-4 bg-primary-50/30 dark:bg-primary-950/10 border border-primary-100/50 dark:border-primary-900/20 rounded-2xl group relative">
                    <UButton icon="tabler:copy" color="primary" variant="ghost" size="xs" class="absolute top-2 right-2 opacity-0 group-hover:opacity-100" @click="handleCopy(cl.descripcion, 'Criterio')" />
                    <p class="text-xs italic font-medium text-gray-600 dark:text-gray-400 pr-6">"{{ cl.descripcion }}"</p>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-1 gap-6 pt-4">
                <div v-if="tramo.actividad?.meta_aprendizaje_html_content" 
                  class="relative group bg-white dark:bg-gray-950 p-6 rounded-3xl border-2 border-dashed border-orange-200 dark:border-orange-900/30 ring-8 ring-orange-50/50 dark:ring-orange-900/5">
                  <div class="flex justify-between items-center mb-5">
                    <div class="flex items-center gap-3">
                      <div class="p-2 bg-orange-500 rounded-xl text-white">
                        <UIcon name="tabler:target-arrow" class="size-5" />
                      </div>
                      <span class="text-xs font-black uppercase text-orange-600 tracking-tighter">Meta de Aprendizaje</span>
                    </div>
                    <UButton icon="tabler:copy" color="primary" variant="soft" size="sm" class="rounded-xl" @click="handleCopy(tramo.actividad.meta_aprendizaje_html_content, 'Meta')" />
                  </div>
                  <div class="prose prose-sm dark:prose-invert max-w-none prose-orange font-medium" v-html="tramo.actividad.meta_aprendizaje_html_content"></div>
                </div>

                <div v-if="tramo.actividad?.plan_aprendizaje_html_content" 
                  class="relative group bg-white dark:bg-gray-950 p-6 rounded-3xl border-2 border-dashed border-primary-200 dark:border-primary-900/30 ring-8 ring-primary-50/50 dark:ring-primary-900/5">
                  <div class="flex justify-between items-center mb-5">
                    <div class="flex items-center gap-3">
                      <div class="p-2 bg-primary-600 rounded-xl text-white">
                        <UIcon name="tabler:map-2" class="size-5" />
                      </div>
                      <span class="text-xs font-black uppercase text-primary-600 tracking-tighter">Plan de Aprendizaje</span>
                    </div>
                    <UButton icon="tabler:copy" color="primary" variant="soft" size="sm" class="rounded-xl" @click="handleCopy(tramo.actividad.plan_aprendizaje_html_content, 'Plan')" />
                  </div>
                  <div class="prose prose-sm dark:prose-invert max-w-none prose-primary font-medium" v-html="tramo.actividad.plan_aprendizaje_html_content"></div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
:deep(.prose) {
  font-size: 0.875rem;
  line-height: 1.7;
  color: var(--tw-prose-body);
}
:deep(.prose strong) {
  color: var(--color-primary-600);
  font-weight: 800;
}
:deep(.prose ul) {
  list-style-type: none;
  padding-left: 0;
}
:deep(.prose li) {
  position: relative;
  padding-left: 1.5rem;
  margin-bottom: 0.5rem;
}
:deep(.prose li::before) {
  content: "→";
  position: absolute;
  left: 0;
  color: var(--color-primary-400);
  font-weight: bold;
}

/* Hover effects para interactividad */
.group:hover .group-hover\:opacity-100 {
  opacity: 1;
}

/* Custom Scrollbar para el sticky */
.backdrop-blur-xl {
  transition: all 0.3s ease;
}
</style>