<script setup lang="ts">
import type { CompetenciaEspecifica, CompetenciaEspecificaItemSelector, CompetenciaGeneral } from '~/types/competenciaEspecifica';
import type { Contenido } from '~/types/contenido';
import type { CriterioDeLogro } from '~/types/criterioDeLogro';
import type { CicloGrado } from '~/types/cicloGrado';
import type { UnidadCurricular } from '~/types/unidadCurricular';
import type { ListRequest } from '~/types/list-request';
import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum';
import ButtonSelectCicloGradoPopup from '../ciclo-grados/ButtonSelectCicloGradoPopup.vue';
import { FormsCompetenciasGenerales } from '#components';

interface Props {
  modelValue: CompetenciaEspecifica[],
  competenciasEspecificas: CompetenciaEspecifica[],
  competenciasGenerales: CompetenciaGeneral[],
  competenciasGeneralesSelected?: CompetenciaGeneral[],
  contenidoSelected?: Contenido,
  criteriosDeLogrosSelected?: CriterioDeLogro[]
  color?: string
  disabled?: boolean
  ciclosGradosEspecificos: CicloGrado[]
  unidadCurricular?: UnidadCurricular | null
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
});

const emit = defineEmits(['update:model-value']);
const { $apiRest } = useNuxtApp();

// --- Lógica de Filtros y Estado ---
const filters = ref<{ competenciasGenerales: CompetenciaGeneral[] }>({ competenciasGenerales: [] });
const ciclosGradosTexto = computed(() => `${props.ciclosGradosEspecificos.map(cg => `${cg.nombre} `).join(', ')}`);
const ciclosGradosSelected = ref<CicloGrado[]>([...props.ciclosGradosEspecificos]);
const competenciasPorCicloGrado = ref<{ cicloGrado: CicloGrado; competencias: CompetenciaEspecifica[] }[]>([]);
const loadingCiclosGrados = ref<Set<number>>(new Set());
const showSuccessMessage = ref(false);
const successMessage = ref('');

const showTemporalMessage = (message: string, duration = 3000) => {
  successMessage.value = message;
  showSuccessMessage.value = true;
  setTimeout(() => { showSuccessMessage.value = false; }, duration);
};

const scrollToNewGroup = (cicloGradoId: number) => {
  setTimeout(() => {
    const element = document.getElementById(`ciclGrado-group-${cicloGradoId}`);
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
};

// --- Enriquecimiento y Agrupación ---
function enrichCompetencias(list: CompetenciaEspecifica[], cicloGradoId: number): (CompetenciaEspecificaItemSelector & { cicloGradoId: number })[] {
  const modelIds = new Set(props.modelValue?.map(c => c.id) || []);
  return list.map(ce => {
    let recomendado = false;
    let nroRelaciones = 0;
    let competenciasGeneralesRelacionadas = ce.competencias_generales.filter(cg => props.competenciasGeneralesSelected?.some(sel => sel.id === cg.id));
    if (competenciasGeneralesRelacionadas.length) { recomendado = true; nroRelaciones += competenciasGeneralesRelacionadas.length; }
    
    const contenidoRelacionado = ce.contenidos.find(c => c.id === props.contenidoSelected?.id) || null;
    if (contenidoRelacionado) { recomendado = true; nroRelaciones += 1; }

    const criteriosDeLogrosRelacionados = ce.criterios_de_logros.filter(cdl => props.criteriosDeLogrosSelected?.some(sel => sel.id === cdl.id));
    if (criteriosDeLogrosRelacionados.length) { recomendado = true; nroRelaciones += criteriosDeLogrosRelacionados.length; }

    return { ...ce, checked: modelIds.has(ce.id), recomendado, contenidoRelacionado, competenciasGeneralesRelacionadas, criteriosDeLogrosRelacionados, nroRelaciones, cicloGradoId };
  }).sort((a, b) => (b.recomendado ? b.nroRelaciones : 0) - (a.recomendado ? a.nroRelaciones : 0));
}

const competenciasInternas = ref<(CompetenciaEspecificaItemSelector & { cicloGradoId: number })[]>([]);
function reconstruirCompetencias() {
  const base = enrichCompetencias(props.competenciasEspecificas, -1);
  const adicionales = competenciasPorCicloGrado.value.flatMap(item => enrichCompetencias(item.competencias, item.cicloGrado.id));
  competenciasInternas.value = [...base, ...adicionales];
}

watch([() => props.competenciasEspecificas, () => props.modelValue, () => props.contenidoSelected, () => props.criteriosDeLogrosSelected, () => props.competenciasGeneralesSelected, competenciasPorCicloGrado], reconstruirCompetencias, { deep: true, immediate: true });

const groups = computed(() => {
  const map = new Map<number, any>();
  for (const item of competenciasInternas.value) {
    if (!map.has(item.cicloGradoId)) {
      const title = item.cicloGradoId === -1 ? `Competencias de ${ciclosGradosTexto.value}` : (props.ciclosGradosEspecificos.find(cg => cg.id === item.cicloGradoId)?.nombre || 'Competencias');
      map.set(item.cicloGradoId, { title, cicloGradoId: item.cicloGradoId, contents: [] });
    }
    map.get(item.cicloGradoId).contents.push(item);
  }
  return Array.from(map.values()).sort((a, b) => a.cicloGradoId === -1 ? -1 : 1);
});

const q = ref('');
const filteredGroups = computed(() => groups.value.map(g => ({
  ...g,
  filteredContents: g.contents.filter(item => {
    if (q.value.trim() && !item.descripcion.toLowerCase().includes(q.value.toLowerCase())) return false;
    if (filters.value.competenciasGenerales.length && !filters.value.competenciasGenerales.every(cg => item.competencias_generales.some(x => x.id === cg.id))) return false;
    return true;
  })
})));

const emptyFiltered = computed(() => filteredGroups.value.every(g => g.filteredContents.length === 0));
const onToggleCompetenciaEspecifica = (item: any) => {
  const index = competenciasInternas.value.findIndex(c => c.id === item.id);
  if (index !== -1) competenciasInternas.value[index].checked = !competenciasInternas.value[index].checked;
};

const isOpen = ref(false);
const onSave = () => {
  emit('update:model-value', competenciasInternas.value.filter(c => c.checked));
  isOpen.value = false;
};

const handleLoadCompetenciasAnotherCicloGrado = async (cicloGrado: CicloGrado) => {
  if (ciclosGradosSelected.value.some(cg => cg.id === cicloGrado.id)) return showTemporalMessage(`⚠️ Ya cargado`, 2000);
  loadingCiclosGrados.value.add(cicloGrado.id);
  ciclosGradosSelected.value.push(cicloGrado);
  try {
    const response = await $apiRest(apiCompetenciasEspecificasRoutes.getPaginate, HttpMethodEnum.POST, { page: -1, rowsPerPage: 1, filters: { ciclos_grados_ids: [cicloGrado.id], unidad_curricular_id: props.unidadCurricular?.id } });
    competenciasPorCicloGrado.value.push({ cicloGrado, competencias: response.list || [] });
    showTemporalMessage(`✅ Cargado`, 3000);
    scrollToNewGroup(cicloGrado.id);
  } finally { loadingCiclosGrados.value.delete(cicloGrado.id); }
};
</script>

<template>
  <div class="w-full space-y-2">
    <!-- ETIQUETA -->
    <div class="flex items-center justify-between px-1">
      <span class="text-[10px] uppercase font-black text-gray-400 tracking-widest italic">Competencias Específicas</span>
      <UBadge v-if="props.modelValue.length > 0" size="xs" variant="subtle" color="primary">{{ props.modelValue.length }} Seleccionadas</UBadge>
    </div>

    <!-- ESTADO: SELECCIONADO (Tarjetas completas) -->
    <div 
      v-if="props.modelValue.length > 0" 
      @click="isOpen = true"
      class="group relative flex flex-col gap-3 p-4 rounded-xl border-primary border-1  bg-white dark:bg-gray-900 shadow-sm cursor-pointer transition-all hover:shadow-md"
    >
      <div 
        v-for="ce in props.modelValue" 
        :key="ce.id"
        class="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
      >
        <div class="flex-shrink-0 w-6 h-6 rounded bg-primary-500 text-white flex items-center justify-center text-[10px] font-bold mt-0.5">
           {{ ce.codificacion.split(' ')[0] }}
        </div>
        <div class="flex-1">
          <p class="text-xs font-semibold text-gray-900 dark:text-gray-100 leading-normal">
            {{ ce.descripcion }}
          </p>
        </div>
      </div>

      <div class="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <UButton icon="tabler:pencil" size="xs" color="primary" variant="ghost" />
      </div>
    </div>

    <!-- ESTADO: VACÍO -->
    <button
      v-else
      type="button"
      class="w-full group flex flex-col items-center justify-center py-10 px-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl bg-gray-50/30 dark:bg-gray-800/10 hover:border-primary-400 hover:bg-primary-50/20 transition-all"
      :disabled="props.disabled"
      @click="isOpen = true"
    >
      <div class="relative mb-4">
        <div class="absolute inset-0 bg-primary-400 blur-2xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
        <div class="relative w-14 h-14 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform text-gray-400 group-hover:text-primary-500">
          <UIcon name="tabler:target-arrow" class="w-7 h-7" />
        </div>
        <div class="absolute -right-2 -bottom-2 w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center border-2 border-white dark:border-gray-900 shadow-md">
          <UIcon name="tabler:plus" class="w-4 h-4" />
        </div>
      </div>
      <div class="text-center">
        <p class="text-sm font-black text-gray-700 dark:text-gray-200 uppercase tracking-tight group-hover:text-primary-600 transition-colors">Vincular Competencias</p>
        <p class="text-xs text-gray-400 mt-1">Definidas para el tramo: <span class="font-bold">{{ ciclosGradosTexto }}</span></p>
      </div>
    </button>
  </div>

  <!-- MODAL DE SELECCIÓN (Sin cambios significativos en la lógica de selección, solo visuales) -->
  <UModal v-model:open="isOpen" fullscreen>
    <template #content>
      <UCard class="flex flex-col h-screen overflow-hidden">
        <template #header>
          <div class="flex gap-2 items-center">
            <UInput v-model="q" icon="i-heroicons-magnifying-glass" placeholder="Buscar competencia específica" autofocus class="flex-1" />
            <UPopover :popper="{ placement: 'bottom-start' }" mode="click">
              <UButton size="sm" color="primary" square variant="outline">
                <div class="relative">
                  <div v-if="filters.competenciasGenerales.length > 0" class="w-2 h-2 rounded-full bg-green-500 absolute -top-1 -right-1" />
                  <UIcon name="tabler:filter-cog" class="size-5" />
                </div>
              </UButton>
              <template #content>
                <div class="p-4 max-w-64"><FormsCompetenciasGenerales v-model="filters.competenciasGenerales" :competenciasGenerales="props.competenciasGenerales" /></div>
              </template>
            </UPopover>
            <UButton icon="tabler:x" size="sm" color="primary" square @click="isOpen = false" />
          </div>
        </template>

        <div class="contenido-scrollable overflow-y-auto p-4 space-y-6">
          <div v-if="emptyFiltered" class="flex flex-col justify-center items-center mt-10">
            <UIcon name="tabler:search" class="w-8 h-8 opacity-20" />
            <span class="text-gray-400">No se encontraron competencias.</span>
          </div>
          <div v-else v-for="group in filteredGroups" :key="group.cicloGradoId">
            <h3 :id="`ciclGrado-group-${group.cicloGradoId}`" class="text-sm font-bold uppercase text-gray-500 mb-3 sticky top-0 bg-white dark:bg-gray-900 py-2 z-10">
              {{ group.title }} <UBadge size="xs" color="primary" variant="soft" class="ml-2">{{ group.contents.length }}</UBadge>
            </h3>
            <ul class="divide-y divide-gray-100 dark:divide-gray-800 border border-primary/20 rounded-xl overflow-hidden shadow-sm">
              <li v-for="item in group.filteredContents" :key="item.id" @click="onToggleCompetenciaEspecifica(item)"
                class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                :class="{'bg-primary-50/50 dark:bg-primary-900/10': item.checked}">
                
                <div class="flex items-start gap-4 flex-1">
                  <UCheckbox size="xl" :model-value="item.checked" @update:model-value="onToggleCompetenciaEspecifica(item)" class="mt-1" />
                  <div class="flex-1">
                    <span class="text-[10px] font-bold text-primary-500 uppercase block mb-1">{{ item.codificacion }}</span>
                    <p class="text-sm font-medium leading-relaxed text-gray-800 dark:text-gray-100 italic">
                      "{{ item.descripcion }}"
                    </p>
                  </div>
                </div>
                
                <div v-if="item.recomendado" class="shrink-0">
                   <UBadge label="Recomendado" icon="tabler:butterfly-filled" color="primary" variant="subtle" size="sm" />
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div class="border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div class="p-4 bg-gray-50 dark:bg-gray-800/30 flex justify-center">
            <ButtonSelectCicloGradoPopup :ciclosGradosSelected="ciclosGradosSelected" :disabled="loadingCiclosGrados.size > 0" @onSelect="handleLoadCompetenciasAnotherCicloGrado" label="Usar otros tramos" />
          </div>
          <div class="p-4 flex justify-end gap-3">
            <UButton label="Cancelar" color="neutral" variant="ghost" @click="isOpen = false" />
            <UButton label="Guardar Selección" color="primary" class="px-8" @click="onSave" />
          </div>
        </div>
      </UCard>
    </template>
  </UModal>
</template>

<style scoped>
@media (min-height: 1200px) {
    .contenido-scrollable {
        height: 70svh;
    }
}

@media (min-height: 900px) and (max-height: 1199px) {
    .contenido-scrollable {
        height: 70svh;
    }
}

@media (min-height: 700px) and (max-height: 899px) {
    .contenido-scrollable {
        height: 70svh;
    }
}

@media (min-height: 600px) and (max-height: 699px) {
    .contenido-scrollable {
        height: 60svh;
    }
}

@media (max-height: 599px) {
    .contenido-scrollable {
        height: 50svh;
    }
}
</style>