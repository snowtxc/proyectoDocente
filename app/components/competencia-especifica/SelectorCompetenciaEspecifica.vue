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
  ciclosGradosEspecificos: CicloGrado[]       // CiclosGrados del contexto actual
  unidadCurricular?: UnidadCurricular | null
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
});

const emit = defineEmits(['update:model-value']);

const { $apiRest } = useNuxtApp();

// Filtro por competencias generales
const filters = ref<{ competenciasGenerales: CompetenciaGeneral[] }>({
  competenciasGenerales: []
});

// ==================== ESTADO PARA CICLOS GRADO ADICIONALES ====================
const ciclosGradosTexto = computed(() => 
  `${props.ciclosGradosEspecificos.map(cg =>  `${cg.nombre} `).join(', ')}`
);

const ciclosGradosSelected = ref<CicloGrado[]>([...props.ciclosGradosEspecificos]);
const competenciasPorCicloGrado = ref<{ cicloGrado: CicloGrado; competencias: CompetenciaEspecifica[] }[]>([]);
const loadingCiclosGrados = ref<Set<number>>(new Set()); // IDs de ciclos grados que están cargando
const showSuccessMessage = ref(false);
const successMessage = ref('');

// Mensaje flotante temporal
const showTemporalMessage = (message: string, duration = 3000) => {
  successMessage.value = message;
  showSuccessMessage.value = true;
  setTimeout(() => {
    showSuccessMessage.value = false;
  }, duration);
};

// Scroll automático al nuevo grupo
const scrollToNewGroup = (cicloGradoId: number) => {
  setTimeout(() => {
    const element = document.getElementById(`ciclGrado-group-${cicloGradoId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 100);
};

// ==================== FUNCIÓN PARA ENRIQUECER COMPETENCIAS ====================
function enrichCompetencias(
  list: CompetenciaEspecifica[],
  cicloGradoId: number
): (CompetenciaEspecificaItemSelector & { cicloGradoId: number })[] {
  const modelIds = new Set(props.modelValue?.map(c => c.id) || []);

  return list.map(ce => {
    let recomendado = false;
    let contenidoRelacionado: Contenido | null = null;
    let competenciasGeneralesRelacionadas: CompetenciaGeneral[] = [];
    let criteriosDeLogrosRelacionados: CriterioDeLogro[] = [];
    let nroRelaciones = 0;

    if (props.competenciasGeneralesSelected?.length) {
      competenciasGeneralesRelacionadas = ce.competencias_generales.filter(cg =>
        props.competenciasGeneralesSelected!.some(sel => sel.id === cg.id)
      );
      if (competenciasGeneralesRelacionadas.length) {
        recomendado = true;
        nroRelaciones += competenciasGeneralesRelacionadas.length;
      }
    }

    if (props.contenidoSelected) {
      contenidoRelacionado = ce.contenidos.find(c => c.id === props.contenidoSelected!.id) || null;
      if (contenidoRelacionado) {
        recomendado = true;
        nroRelaciones += 1;
      }
    }

    if (props.criteriosDeLogrosSelected) {
      criteriosDeLogrosRelacionados = ce.criterios_de_logros.filter(cdl =>
        props.criteriosDeLogrosSelected!.some(sel => sel.id === cdl.id)
      );
      if (criteriosDeLogrosRelacionados.length) {
        recomendado = true;
        nroRelaciones += criteriosDeLogrosRelacionados.length;
      }
    }

    return {
      ...ce,
      checked: modelIds.has(ce.id),
      recomendado,
      contenidoRelacionado,
      competenciasGeneralesRelacionadas,
      criteriosDeLogrosRelacionados,
      nroRelaciones,
      cicloGradoId,
    };
  }).sort((a, b) => {
    if (a.recomendado && a.nroRelaciones > b.nroRelaciones) return -1;
    if (b.recomendado && b.nroRelaciones > a.nroRelaciones) return 1;
    return 0;
  });
}

// ==================== ESTADO INTERNO: TODAS LAS COMPETENCIAS ====================
const competenciasInternas = ref<(CompetenciaEspecificaItemSelector & { cicloGradoId: number })[]>([]);

function reconstruirCompetencias() {
  const base = enrichCompetencias(props.competenciasEspecificas, -1); // -1 representa el grupo base (sin ciclo específico)
  const adicionales = competenciasPorCicloGrado.value.flatMap(item =>
    enrichCompetencias(item.competencias, item.cicloGrado.id)
  );
  competenciasInternas.value = [...base, ...adicionales];
}

watch(
  [
    () => props.competenciasEspecificas,
    () => props.modelValue,
    () => props.contenidoSelected,
    () => props.criteriosDeLogrosSelected,
    () => props.competenciasGeneralesSelected,
    competenciasPorCicloGrado,
  ],
  () => {
    reconstruirCompetencias();
  },
  { deep: true, immediate: true }
);

// ==================== AGRUPACIÓN PARA EL TEMPLATE ====================
interface Group {
  title: string;
  cicloGradoId: number;
  contents: (CompetenciaEspecificaItemSelector & { cicloGradoId: number })[];
  filteredContents: (CompetenciaEspecificaItemSelector & { cicloGradoId: number })[];
}

const groups = computed<Group[]>(() => {
  const map = new Map<number, Group>();

  for (const item of competenciasInternas.value) {
    if (!map.has(item.cicloGradoId)) {
      let title = '';
      if (item.cicloGradoId === -1) {
        title = `Competencias específicas de ${ciclosGradosTexto.value}`;
      } else {
        const ciclo = props.ciclosGradosEspecificos.find(cg => cg.id === item.cicloGradoId) ||
                      competenciasPorCicloGrado.value.find(c => c.cicloGrado.id === item.cicloGradoId)?.cicloGrado;
        title = ciclo ? `Competencias específicas de ${ciclo.nombre} (${ciclo.grados.map(g => g.nombre).join(', ')})` : 'Competencias específicas';
      }
      map.set(item.cicloGradoId, {
        title,
        cicloGradoId: item.cicloGradoId,
        contents: [],
        filteredContents: [],
      });
    }
    map.get(item.cicloGradoId)!.contents.push(item);
  }

  // Ordenar: primero el grupo por defecto (-1), luego el resto por título
  return Array.from(map.values()).sort((a, b) => {
    if (a.cicloGradoId === -1) return -1;
    if (b.cicloGradoId === -1) return 1;
    return a.title.localeCompare(b.title);
  });
});

// ==================== FILTROS ====================
const q = ref('');

const filteredGroups = computed(() => {
  return groups.value.map(group => ({
    ...group,
    filteredContents: group.contents.filter(item => {
      // Filtro de búsqueda
      if (q.value.trim() && !item.descripcion.toLowerCase().includes(q.value.toLowerCase())) {
        return false;
      }
      // Filtro por competencias generales seleccionadas
      if (filters.value.competenciasGenerales.length) {
        const incluye = filters.value.competenciasGenerales.every(cg =>
          item.competencias_generales.some(x => x.id === cg.id)
        );
        if (!incluye) return false;
      }
      return true;
    })
  }));
});

const emptyFiltered = computed(() => filteredGroups.value.every(g => g.filteredContents.length === 0));

// ==================== SELECCIÓN ====================
const onToggleCompetenciaEspecifica = (item: CompetenciaEspecificaItemSelector & { cicloGradoId: number }) => {
  const index = competenciasInternas.value.findIndex(c => c.id === item.id);
  if (index !== -1) {
    competenciasInternas.value[index].checked = !competenciasInternas.value[index].checked;
  }
};

// ==================== GUARDAR ====================
const isOpen = ref(false);

const onSave = () => {
  const selected = competenciasInternas.value.filter(c => c.checked);
  emit('update:model-value', selected);
  isOpen.value = false;
};

// ==================== CARGA DE COMPETENCIAS DE OTRO CICLO GRADO ====================
const handleLoadCompetenciasAnotherCicloGrado = async (cicloGrado: CicloGrado) => {
  // Evitar duplicados
  if (ciclosGradosSelected.value.some(cg => cg.id === cicloGrado.id)) {
    showTemporalMessage(`⚠️ El tramo ${cicloGrado.nombre} ya está cargado`, 2000);
    return;
  }

  loadingCiclosGrados.value.add(cicloGrado.id);
  ciclosGradosSelected.value.push(cicloGrado);

  const filterParams = {
    ciclos_grados_ids: [cicloGrado.id],
    unidad_curricular_id: props.unidadCurricular.id,
  };

  const listReq: ListRequest = {
    page: -1,
    rowsPerPage: 1,
    filters: filterParams,
  };

  try {
    const response = await $apiRest(apiCompetenciasEspecificasRoutes.getPaginate, HttpMethodEnum.POST, listReq);
    const nuevasCompetencias = response.list || [];

    competenciasPorCicloGrado.value.push({
      cicloGrado,
      competencias: nuevasCompetencias,
    });

    if (nuevasCompetencias.length === 0) {
      showTemporalMessage(`📭 El tramo ${cicloGrado.nombre} no tiene competencias específicas`, 3000);
    } else {
      showTemporalMessage(`✅ ${nuevasCompetencias.length} competencia${nuevasCompetencias.length !== 1 ? 's' : ''} cargada${nuevasCompetencias.length !== 1 ? 's' : ''} de ${cicloGrado.nombre}`, 3000);
      scrollToNewGroup(cicloGrado.id);
    }
  } catch (error) {
    console.error('Error al cargar competencias del tramo', error);
    showTemporalMessage(`❌ Error al cargar competencias de ${cicloGrado.nombre}`, 4000);
  } finally {
    loadingCiclosGrados.value.delete(cicloGrado.id);
  }
};
</script>

<template>
  <UButton
    icon="tabler:pencil"
    size="sm"
    color="primary"
    variant="outline"
    @click="isOpen = true"
    :disabled="props.disabled"
  />

  <UModal v-model:open="isOpen" fullscreen>
    <template #content>
      <UCard class="flex flex-col h-screen overflow-hidden">
        <!-- ================= HEADER ================= -->
        <template #header>
          <div class="flex gap-2 items-center">
            <UInput
              v-model="q"
              icon="i-heroicons-magnifying-glass"
              placeholder="Buscar competencia específica"
              autofocus
              class="flex-1"
            />

            <UPopover :popper="{ placement: 'bottom-start' }" mode="click">
              <UTooltip>
                <UButton
                  size="sm"
                  color="primary"
                  square
                  variant="outline"
                >
                  <div class="relative flex">
                    <div
                      v-if="filters.competenciasGenerales.length > 0"
                      class="w-2 h-2 rounded-full bg-green-500 absolute -top-1 -right-1"
                    />
                    <UIcon name="tabler:filter-cog" class="size-5" />
                  </div>
                </UButton>
              </UTooltip>

              <template #content>
                <div class="p-4 flex flex-col gap-y-4 max-w-64">
                  <FormsCompetenciasGenerales
                    v-model="filters.competenciasGenerales"
                    :competenciasGenerales="props.competenciasGenerales"
                  />
                </div>
              </template>
            </UPopover>

            <UButton
              icon="tabler:x"
              size="sm"
              color="primary"
              square
              variant="solid"
              @click="isOpen = false"
            />
          </div>
        </template>

        <!-- MENSAJE FLOTANTE DE FEEDBACK -->
        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="transform -translate-y-2 opacity-0"
          enter-to-class="transform translate-y-0 opacity-100"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="transform translate-y-0 opacity-100"
          leave-to-class="transform -translate-y-2 opacity-0"
        >
          <div
            v-if="showSuccessMessage"
            class="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 bg-primary-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2"
          >
            <UIcon name="tabler:info-circle" class="w-5 h-5" />
            <span>{{ successMessage }}</span>
          </div>
        </Transition>

        <!-- ================= BODY CON GRUPOS (altura dinámica por media queries) ================= -->
        <div class="contenido-scrollable overflow-y-auto p-4 space-y-6">
          <div
            v-if="emptyFiltered"
            class="flex flex-col justify-center items-center mt-10 text-center"
          >
            <UIcon name="tabler:search" class="w-8 h-8" />
            <span>No pudimos encontrar ninguna competencia específica.</span>
          </div>

          <div v-else v-for="group in filteredGroups" :key="group.cicloGradoId" class="mb-6">
            <!-- Título del grupo con badge de cantidad -->
            <h3
              :id="`ciclGrado-group-${group.cicloGradoId}`"
              class="text-lg font-semibold mb-2 flex items-center gap-2 sticky top-0 bg-white dark:bg-gray-900 py-1 z-10"
            >
              <span>{{ group.title }}</span>
              <UBadge
                v-if="group.contents.length > 0"
                color="primary"
                variant="soft"
                size="sm"
              >
                {{ group.contents.length }} competencia{{ group.contents.length !== 1 ? 's' : '' }}
              </UBadge>
            </h3>

            <!-- Lista de competencias del grupo -->
            <ul role="list" class="divide-y divide-gray-200 dark:divide-gray-800 border border-primary rounded-lg overflow-hidden">
              <li
                v-for="item in group.filteredContents"
                :key="item.id"
                @click="onToggleCompetenciaEspecifica(item)"
                class="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150"
                :class="{'bg-primary-50/50 dark:bg-primary-900/10': item.checked}"
              >
                <div class="flex items-start gap-3 flex-1">
                  <UCheckbox
                    size="xl"
                    :model-value="item.checked"
                    @update:model-value="onToggleCompetenciaEspecifica(item)"
                    class="mt-1"
                  />
                  <p class="text-sm font-medium leading-snug text-gray-900 dark:text-white">
                    {{ item.codificacion }} {{ item.descripcion }}
                  </p>
                </div>

                <div class="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <UPopover
                    v-if="item.recomendado"
                    :popper="{ placement: 'bottom-start' }"
                    mode="hover"
                  >
                    <UTooltip>
                      <UButton
                        label="Recomendado"
                        icon="tabler:butterfly-filled"
                        :color="getColorBadgeComponente(props.color)"
                        variant="outline"
                        size="sm"
                      />
                    </UTooltip>

                    <template #content>
                      <div class="p-4 flex flex-col gap-y-4 max-w-64">
                        <div v-if="item.contenidoRelacionado">
                          <span class="font-medium">
                            Se relaciona al contenido seleccionado:
                          </span>
                          <ul class="list-disc ml-4">
                            <li>{{ item.contenidoRelacionado.descripcion }}</li>
                          </ul>
                        </div>

                        <div v-if="item.competenciasGeneralesRelacionadas?.length">
                          <USeparator v-if="item.contenidoRelacionado" color="primary" />
                          <span class="font-medium">
                            Competencias generales relacionadas:
                          </span>
                          <ul class="list-disc ml-4">
                            <li
                              v-for="cg in item.competenciasGeneralesRelacionadas"
                              :key="cg.id"
                            >
                              {{ cg.nombre }}
                            </li>
                          </ul>
                        </div>

                        <div v-if="item.criteriosDeLogrosRelacionados?.length">
                          <USeparator
                            v-if="item.contenidoRelacionado || item.competenciasGeneralesRelacionadas?.length"
                            color="primary"
                          />
                          <span class="font-medium">
                            Criterios de logro relacionados:
                          </span>
                          <ul class="list-disc ml-4">
                            <li
                              v-for="cdl in item.criteriosDeLogrosRelacionados"
                              :key="cdl.id"
                            >
                              {{ cdl.descripcion }}
                            </li>
                          </ul>
                        </div>
                      </div>
                    </template>
                  </UPopover>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- ================= FOOTER UNIFICADO (cargar más tramos + botones) ================= -->
        <div class="border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
          <!-- Sección de cargar más tramos -->
          <div class="p-4 bg-gray-50 dark:bg-gray-800/30">
            <div class="flex flex-wrap items-center justify-center gap-4">
              <ButtonSelectCicloGradoPopup
                :ciclosGradosSelected="ciclosGradosSelected"
                :disabled="loadingCiclosGrados.size > 0"
                @onSelect="handleLoadCompetenciasAnotherCicloGrado"
                label="Usar competencias específicas de otros tramos"
              />

              <div
                v-if="loadingCiclosGrados.size > 0"
                class="flex items-center gap-2 text-xs text-primary-500"
              >
                <UIcon name="tabler:loader-2" class="w-4 h-4 animate-spin" />
                <span>Cargando competencias...</span>
              </div>
            </div>
          </div>

          <!-- Botones de acción -->
          <div class="p-4 flex flex-col-reverse sm:flex-row justify-end gap-3">
            <UButton
              label="Cancelar"
              color="neutral"
              variant="ghost"
              class="w-full sm:w-auto"
              @click="isOpen = false"
            />
            <UButton
              label="Guardar"
              color="primary"
              class="w-full sm:w-auto px-8"
              :disabled="loadingCiclosGrados.size > 0"
              @click="onSave"
            />
          </div>
        </div>
      </UCard>
    </template>
  </UModal>
</template>

<style scoped>
/* Animación para nuevos grupos */
.mb-6 {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ================= MEDIA QUERIES PARA ALTURA DINÁMICA ================= */
.contenido-scrollable {
  height: 70svh; /* valor base */
}

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
        height: 65svh;
    }
}

@media (min-height: 600px) and (max-height: 699px) {
    .contenido-scrollable {
        height: 65svh;
    }
}

@media (max-height: 599px) {
    .contenido-scrollable {
        height: 50svh;
    }
}
</style>