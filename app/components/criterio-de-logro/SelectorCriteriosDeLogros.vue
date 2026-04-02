<script setup lang="ts">
import type { CompetenciaEspecifica } from '~/types/competenciaEspecifica';
import type { Contenido } from '~/types/contenido';
import type { CriterioDeLogro, CriterioDeLogroItemSelector } from '~/types/criterioDeLogro';
import type { Grado } from '~/types/grado';
import type { UnidadCurricular } from '~/types/unidadCurricular';
import type { ListRequest } from '~/types/list-request';
import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum';
import ButtonSelectGradoPopup from '../grados/ButtonSelectGradoPopup.vue';

interface Props {
  modelValue: CriterioDeLogro[],
  criteriosDeLogros: CriterioDeLogro[],
  contenidoSelected?: Contenido;
  competenciasEspecificasSelected?: CompetenciaEspecifica[]
  color: string
  disabled?: boolean
  gradosEspecificos: Grado[]
  unidadCurricular: UnidadCurricular
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
});

const emit = defineEmits(['update:model-value']);

const { $apiRest } = useNuxtApp();

// Texto para el título del grupo principal
const gradosText = computed<string>(() => {
  return props.gradosEspecificos.map(g => g.nombre).join(', ');
});

// ==================== ESTADO PARA GRUPOS ADICIONALES ====================
const gradosSelected = ref<Grado[]>([...props.gradosEspecificos]);
const criteriosXGradoAdiccionales = ref<{ grado: Grado, criterios: CriterioDeLogro[] }[]>([]);
const loadingGrados = ref<Set<number>>(new Set()); // IDs de grados que están cargando
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
const scrollToNewGroup = (gradoId: number) => {
  setTimeout(() => {
    const element = document.getElementById(`grado-group-${gradoId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 100);
};

// ==================== FUNCIÓN PARA ENRIQUECER CRITERIOS ====================
function enrichCriterios(criterios: CriterioDeLogro[]): (CriterioDeLogroItemSelector & { gradoId: number })[] {
  const modelIds = new Set(props.modelValue.map(c => c.id));

  return criterios.map(criterio => {
    let recomendado = false;
    let contenidoRelacionado: Contenido | null = null;
    let competenciasEspecificasRelacionadas: CompetenciaEspecifica[] = [];
    let nroRelaciones = 0;

    if (props.contenidoSelected) {
      contenidoRelacionado = criterio.contenidos.find(c => c.id === props.contenidoSelected!.id) || null;
      if (contenidoRelacionado) {
        recomendado = true;
        nroRelaciones += 1;
      }
    }

    if (props.competenciasEspecificasSelected) {
      competenciasEspecificasRelacionadas = criterio.competencias_especificas.filter(ce =>
        props.competenciasEspecificasSelected!.some(sel => sel.id === ce.id)
      );
      if (competenciasEspecificasRelacionadas.length > 0) {
        recomendado = true;
        nroRelaciones += competenciasEspecificasRelacionadas.length;
      }
    }

    return {
      ...criterio,
      checked: modelIds.has(criterio.id),
      recomendado,
      contenidoRelacionado,
      competenciasEspecificasRelacionadas,
      nroRelaciones,
      gradoId: -1, // temporal, se reasigna después
    };
  }).sort((a, b) => {
    if (a.recomendado && a.nroRelaciones > b.nroRelaciones) return -1;
    if (b.recomendado && b.nroRelaciones > a.nroRelaciones) return 1;
    return 0;
  });
}

// ==================== ESTADO INTERNO ====================
const criteriosInternos = ref<(CriterioDeLogroItemSelector & { gradoId: number })[]>([]);

function reconstruirCriterios() {
  const base = enrichCriterios(props.criteriosDeLogros).map(c => ({ ...c, gradoId: -1 }));
  const adicionales = criteriosXGradoAdiccionales.value.flatMap(item =>
    enrichCriterios(item.criterios).map(c => ({ ...c, gradoId: item.grado.id }))
  );
  criteriosInternos.value = [...base, ...adicionales];
}

watch(
  [
    () => props.criteriosDeLogros,
    () => props.modelValue,
    () => props.contenidoSelected,
    () => props.competenciasEspecificasSelected,
    criteriosXGradoAdiccionales,
  ],
  () => {
    reconstruirCriterios();
  },
  { deep: true, immediate: true }
);

// ==================== AGRUPACIÓN ====================
interface ContentGroup {
  title: string;
  gradoId: number;
  contents: (CriterioDeLogroItemSelector & { gradoId: number })[];
  filteredContents: (CriterioDeLogroItemSelector & { gradoId: number })[];
}

const groups = computed<ContentGroup[]>(() => {
  const gruposMap = new Map<number, ContentGroup>();

  for (const criterio of criteriosInternos.value) {
    if (!gruposMap.has(criterio.gradoId)) {
      let title = '';
      if (criterio.gradoId === -1) {
        title = `Criterios de logro de ${gradosText.value}`;
      } else {
        const gradoEncontrado = props.gradosEspecificos.find(g => g.id === criterio.gradoId) ||
                                criteriosXGradoAdiccionales.value.find(c => c.grado.id === criterio.gradoId)?.grado;
        title = gradoEncontrado ? `Criterios de logro de ${gradoEncontrado.nombre}` : 'Criterios de logro';
      }
      gruposMap.set(criterio.gradoId, {
        title,
        gradoId: criterio.gradoId,
        contents: [],
        filteredContents: [],
      });
    }
    gruposMap.get(criterio.gradoId)!.contents.push(criterio);
  }

  return Array.from(gruposMap.values()).sort((a, b) => {
    if (a.gradoId === -1) return -1;
    if (b.gradoId === -1) return 1;
    return a.title.localeCompare(b.title);
  });
});

// Filtrado por búsqueda
const q = ref('');

const filteredGroups = computed(() => {
  return groups.value.map(group => ({
    ...group,
    filteredContents: group.contents.filter(c =>
      q.value.trim() ? c.descripcion.toLowerCase().includes(q.value.toLowerCase()) : true
    ),
  }));
});

const emptyFiltered = computed(() => filteredGroups.value.every(g => g.filteredContents.length === 0));

// ==================== SELECCIÓN ====================
const onToggleCriterio = (criterioId: number) => {
  const index = criteriosInternos.value.findIndex(c => c.id === criterioId);
  if (index !== -1) {
    criteriosInternos.value[index].checked = !criteriosInternos.value[index].checked;
  }
};

// ==================== GUARDAR ====================
const isOpen = ref(false);

const onSave = () => {
  const selected = criteriosInternos.value.filter(c => c.checked);
  emit('update:model-value', selected);
  isOpen.value = false;
};

// ==================== CARGA DE OTROS GRADOS ====================
const handleLoadCriteriosAnotherGrado = async (grado: Grado) => {
  if (gradosSelected.value.some(g => g.id === grado.id)) {
    showTemporalMessage(`⚠️ El grado ${grado.nombre} ya está cargado`, 2000);
    return;
  }

  loadingGrados.value.add(grado.id);
  gradosSelected.value.push(grado);

  const filters = {
    grados_ids: [grado.id],
    unidad_curricular_id: props.unidadCurricular.id,
  };

  const listReq: ListRequest = {
    page: -1,
    rowsPerPage: 1,
    filters,
  };

  try {
    const response = await $apiRest(apiCriteriosDeLogrosRoutes.getPaginate, HttpMethodEnum.POST, listReq);
    const nuevosCriterios = response.list || [];

    criteriosXGradoAdiccionales.value.push({
      grado,
      criterios: nuevosCriterios,
    });

    if (nuevosCriterios.length === 0) {
      showTemporalMessage(`📭 El grado ${grado.nombre} no tiene criterios de logro`, 3000);
    } else {
      showTemporalMessage(`✅ ${nuevosCriterios.length} criterio${nuevosCriterios.length !== 1 ? 's' : ''} cargado${nuevosCriterios.length !== 1 ? 's' : ''} de ${grado.nombre}`, 3000);
      scrollToNewGroup(grado.id);
    }
  } catch (error) {
    console.error('Error al cargar criterios del grado', error);
    showTemporalMessage(`❌ Error al cargar criterios de ${grado.nombre}`, 4000);
  } finally {
    loadingGrados.value.delete(grado.id);
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
        <!-- HEADER -->
        <template #header>
          <div class="flex gap-2 items-center">
            <UInput
              v-model="q"
              icon="i-heroicons-magnifying-glass"
              placeholder="Buscar criterio de logro"
              autofocus
              class="flex-1"
            />
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

        <!-- MENSAJE FLOTANTE -->
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

        <!-- CONTENIDO PRINCIPAL (altura dinámica) -->
        <div class="contenido-scrollable overflow-y-auto p-4 space-y-6">
          <div
            v-if="emptyFiltered"
            class="flex flex-col justify-center items-center py-10 text-gray-500"
          >
            <UIcon name="tabler:search" class="w-10 h-10 mb-2 opacity-20" />
            <p>No se encontraron criterios de logro.</p>
          </div>

          <div v-else v-for="group in filteredGroups" :key="group.gradoId" class="mb-6">
            <!-- Título sticky con badge -->
            <h3
              :id="`grado-group-${group.gradoId}`"
              class="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3 sticky top-0 bg-white dark:bg-gray-900 py-1 z-10"
            >
              {{ group.title }}
              <UBadge v-if="group.contents.length > 0" size="xs" variant="subtle" class="ml-2">
                {{ group.contents.length }}
              </UBadge>
            </h3>

            <!-- Lista de criterios -->
            <ul class="divide-y divide-gray-100 dark:divide-gray-800  border border-primary rounded-lg overflow-hidden">
              <li
                v-for="criterio in group.filteredContents"
                :key="criterio.id"
                @click="onToggleCriterio(criterio.id)"
                class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                :class="{'bg-primary-50/50 dark:bg-primary-900/10': criterio.checked}"
              >
                <div class="flex items-start gap-3 flex-1">
                  <UCheckbox
                    :model-value="criterio.checked"
                    @click.stop
                    color="primary"
                    class="mt-1"
                  />
                  <p class="text-sm font-medium leading-snug">
                    {{ criterio.descripcion }}
                  </p>
                </div>

                <div class="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <UPopover
                    v-if="criterio.recomendado"
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
                      <div class="p-4 flex flex-col gap-y-4 max-w-96">
                        <div v-if="criterio.contenidoRelacionado">
                          <span class="font-medium">
                            Se relaciona al contenido seleccionado:
                          </span>
                          <ul class="list-disc ml-4 mt-1">
                            <li>{{ criterio.contenidoRelacionado.descripcion }}</li>
                          </ul>
                        </div>

                        <USeparator v-if="criterio.contenidoRelacionado && criterio.competenciasEspecificasRelacionadas?.length" color="primary" />

                        <div v-if="criterio.competenciasEspecificasRelacionadas?.length">
                          <span class="font-medium">
                            Se relaciona a las competencias específicas seleccionadas:
                          </span>
                          <ul class="list-disc ml-4 mt-1">
                            <li
                              v-for="ce in criterio.competenciasEspecificasRelacionadas"
                              :key="ce.id"
                            >
                              {{ ce.codificacion }} {{ ce.descripcion }}
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

        <!-- FOOTER UNIFICADO -->
        <div class="border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
          <!-- Sección de cargar más grados -->
          <div class="p-4 bg-gray-50 dark:bg-gray-800/30">
            <div class="flex flex-wrap items-center justify-center gap-4">
              <ButtonSelectGradoPopup
                :gradosSelected="gradosSelected"
                :disabled="loadingGrados.size > 0"
                @onSelect="handleLoadCriteriosAnotherGrado"
                label="Usar criterios de logro de otro grado"
              />
              <div
                v-if="loadingGrados.size > 0"
                class="flex items-center gap-2 text-xs text-primary-500"
              >
                <UIcon name="tabler:loader-2" class="w-4 h-4 animate-spin" />
                <span>Cargando criterios...</span>
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
              :disabled="loadingGrados.size > 0"
              @click="onSave"
            />
          </div>
        </div>
      </UCard>
    </template>
  </UModal>
</template>

<style scoped>
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
        height: 70svh;
    }
}

@media (min-height: 600px) and (max-height: 699px) {
    .contenido-scrollable {
        height: 70svh;
    }
}

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
</style>