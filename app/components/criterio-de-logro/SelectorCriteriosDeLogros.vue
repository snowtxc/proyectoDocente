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

// ==================== FUNCIÓN PARA ENRIQUECER CRITERIOS (RELACIONES Y CHECKED) ====================
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
      // Placeholder para gradoId – se asignará más tarde según el grupo
      gradoId: -1,
    };
  }).sort((a, b) => {
    if (a.recomendado && a.nroRelaciones > b.nroRelaciones) return -1;
    if (b.recomendado && b.nroRelaciones > a.nroRelaciones) return 1;
    return 0;
  });
}

// ==================== ESTADO INTERNO: TODOS LOS CRITERIOS CON SU GRUPO ====================
// Usamos una única fuente de verdad: un array plano de criterios enriquecidos,
// cada uno con su gradoId (-1 para el grupo por defecto, o el id real para adicionales)
const criteriosInternos = ref<(CriterioDeLogroItemSelector & { gradoId: number })[]>([]);

// Función que reconstruye criteriosInternos a partir de los criterios base y los adicionales
function reconstruirCriterios() {
  const base = enrichCriterios(props.criteriosDeLogros).map(c => ({ ...c, gradoId: -1 }));

  const adicionales = criteriosXGradoAdiccionales.value.flatMap(item =>
    enrichCriterios(item.criterios).map(c => ({ ...c, gradoId: item.grado.id }))
  );

  criteriosInternos.value = [...base, ...adicionales];
}

// Inicializar y actualizar cuando cambien las props relevantes o los adicionales
watch(
  [
    () => props.criteriosDeLogros,
    () => props.modelValue,
    () => props.contenidoSelected,
    () => props.competenciasEspecificasSelected,
    criteriosXGradoAdiccionales, // cuando se agregan nuevos grupos
  ],
  () => {
    reconstruirCriterios();
  },
  { deep: true, immediate: true }
);

// ==================== AGRUPACIÓN PARA EL TEMPLATE ====================
interface ContentGroup {
  title: string;
  gradoId: number;
  contents: (CriterioDeLogroItemSelector & { gradoId: number })[];
  filteredContents: (CriterioDeLogroItemSelector & { gradoId: number })[];
}

const groups = computed<ContentGroup[]>(() => {
  const gruposMap = new Map<number, ContentGroup>();

  // Agrupar por gradoId
  for (const criterio of criteriosInternos.value) {
    if (!gruposMap.has(criterio.gradoId)) {
      const title = criterio.gradoId === -1
        ? `Criterios de logro de ${gradosText.value}`
        : `Criterios de logro de ${props.gradosEspecificos.find(g => g.id === criterio.gradoId)?.nombre ?? 'Otro grado'}`;
      gruposMap.set(criterio.gradoId, {
        title,
        gradoId: criterio.gradoId,
        contents: [],
        filteredContents: [],
      });
    }
    gruposMap.get(criterio.gradoId)!.contents.push(criterio);
  }

  // Convertir a array y ordenar: primero el grupo por defecto (-1), luego el resto por título
  const gruposArray = Array.from(gruposMap.values());
  gruposArray.sort((a, b) => {
    if (a.gradoId === -1) return -1;
    if (b.gradoId === -1) return 1;
    return a.title.localeCompare(b.title);
  });

  return gruposArray;
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

// ==================== SELECCIÓN MÚLTIPLE ====================
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

// ==================== CARGA DE CRITERIOS DE OTROS GRADOS ====================
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
    // Asume que existe apiCriteriosDeLogroRoutes.getPaginate (ajusta según tu rutas)
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
      <UCard class="flex flex-col flex-1 overflow-hidden min-w-0">
        <!-- HEADER: búsqueda y cerrar -->
        <template #header>
          <div class="flex gap-2 items-center mt-2">
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

        <!-- CUERPO SCROLLABLE CON GRUPOS -->
        <div class="flex-1 overflow-y-auto min-h-0 max-h-[60vh] px-2">
          <div
            v-if="emptyFiltered"
            class="flex flex-col justify-center items-center mt-5 text-center"
          >
            <UIcon name="tabler:search" class="w-8 h-8" />
            <span>No pudimos encontrar ningún criterio de logro.</span>
          </div>

          <div v-else v-for="group in filteredGroups" :key="group.gradoId" class="mb-6">
            <!-- Título del grupo con badge de cantidad -->
            <h3
              :id="`grado-group-${group.gradoId}`"
              class="text-lg font-semibold mb-2 flex items-center gap-2"
            >
              <span>{{ group.title }}</span>
              <UBadge
                v-if="group.contents.length > 0"
                color="primary"
                variant="soft"
                size="sm"
              >
                {{ group.contents.length }} criterio{{ group.contents.length !== 1 ? 's' : '' }}
              </UBadge>
            </h3>

            <!-- Lista de criterios del grupo -->
            <ul role="list" class="divide-y divide-gray-200 dark:divide-gray-800">
              <li
                v-for="criterio in group.filteredContents"
                :key="criterio.id"
                class="w-full flex items-center justify-between gap-3 py-3 px-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150"
              >
                <div
                  class="flex items-center gap-3 w-full hover:cursor-pointer"
                  @click="onToggleCriterio(criterio.id)"
                >
                  <div class="text-sm min-w-0 flex gap-2 items-center flex-1">
                    <UCheckbox
                      :model-value="criterio.checked"
                      @update:model-value="onToggleCriterio(criterio.id)"
                      color="primary"
                      variant="list"
                    />
                    <p class="text-gray-900 dark:text-white font-medium">
                      {{ criterio.descripcion }}
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-3">
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
                      <div class="p-4 flex flex-col gap-y-4 max-w-128">
                        <div v-if="criterio.contenidoRelacionado">
                          <span class="font-medium">
                            Se relaciona al contenido seleccionado:
                          </span>
                          <ul class="list-disc ml-4">
                            <li class="my-2">
                              {{ criterio.contenidoRelacionado.descripcion }}
                            </li>
                          </ul>
                        </div>

                        <USeparator v-if="criterio.contenidoRelacionado && criterio.competenciasEspecificasRelacionadas?.length" color="primary" type="solid" />

                        <div v-if="criterio.competenciasEspecificasRelacionadas?.length">
                          <span class="font-medium">
                            Se relaciona a las competencias específicas seleccionadas:
                          </span>
                          <ul class="list-disc ml-4">
                            <li
                              v-for="ce in criterio.competenciasEspecificasRelacionadas"
                              :key="ce.id"
                              class="my-2"
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

        <!-- BOTÓN PARA AGREGAR MÁS GRADOS (con indicador de carga) -->
        <div class="flex justify-center items-center py-4 gap-3">
          <ButtonSelectGradoPopup
            :gradosSelected="gradosSelected"
            :disabled="loadingGrados.size > 0"
            @onSelect="handleLoadCriteriosAnotherGrado"
           label="Usar criterios de logros de otro grado."
          />

          <div
            v-if="loadingGrados.size > 0"
            class="flex items-center gap-2 text-sm text-gray-500"
          >
            <UIcon name="tabler:loader-2" class="w-4 h-4 animate-spin" />
            <span>Cargando criterios...</span>
          </div>
        </div>

        <!-- FOOTER -->
        <template #footer>
          <div class="flex justify-end gap-3 py-4">
            <UButton
              label="Cancelar"
              color="neutral"
              variant="ghost"
              @click="isOpen = false"
            />
            <UButton
              type="button"
              label="Guardar"
              color="primary"
              :disabled="loadingGrados.size > 0"
              @click="onSave"
            />
          </div>
        </template>
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
</style>