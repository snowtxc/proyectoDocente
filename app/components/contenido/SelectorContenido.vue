<script setup lang="ts">
import type { CompetenciaEspecifica } from '~/types/competenciaEspecifica';
import type { Contenido, ContenidoFilter, ContenidoItemSelector } from '~/types/contenido';
import type { CriterioDeLogro } from '~/types/criterioDeLogro';
import ButtonSelectGradoPopup from '../grados/ButtonSelectGradoPopup.vue';
import type { Grado } from '~/types/grado';
import type { UnidadCurricular } from '~/types/unidadCurricular';
import type { ListRequest } from '~/types/list-request';
import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum';

interface Props {
    modelValue: Contenido,
    contenidos: Contenido[],
    competenciasEspecificasSelected?: CompetenciaEspecifica[],
    criteriosDeLogrosSelected?: CriterioDeLogro[]
    color: string
    disabled?: boolean
    gradosEspecificos: Grado[]
    unidadCurricular: UnidadCurricular
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: null,
});

const gradosText = computed<string>(()=>{
  return props.gradosEspecificos.map(g => g.nombre).join(', ');
});

const { $apiRest } = useNuxtApp();

const gradosSelected = ref<Grado[]>([...props.gradosEspecificos]);
const contenidosXGradoAdiccionales = ref<{ grado: Grado, contenidosXGrado: Contenido[] }[]>([]);
const emit = defineEmits(['update:model-value']);
const isOpen = ref(false);
const q = ref('');
const contenidoIdSelected = ref<number | null>(props.modelValue ? props.modelValue.id : null);

// Estados para feedback visual
const loadingGrados = ref<Set<number>>(new Set()); // IDs de grados que están cargando
const showSuccessMessage = ref(false);
const successMessage = ref('');

// Función para mostrar mensaje temporal
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

// Función que enriquece un array de Contenido con los campos calculados
function enrichContents(contents: Contenido[]): ContenidoItemSelector[] {
    return contents.map(contenido => {
        let recomendado = false;
        let competenciasEspecificasRelacionadas: CompetenciaEspecifica[] = [];
        let criteriosDeLogrosRelacionados: CriterioDeLogro[] = [];
        let nroRelaciones = 0;

        if (props.competenciasEspecificasSelected) {
            competenciasEspecificasRelacionadas = contenido.competencias_especificas.filter(ce => {
                const result = props.competenciasEspecificasSelected!.some(sel => sel.id == ce.id);
                if (result) nroRelaciones += 1;
                return result;
            });

            if (competenciasEspecificasRelacionadas.length > 0)
                recomendado = true;
        }

        if (props.criteriosDeLogrosSelected) {
            criteriosDeLogrosRelacionados = contenido.criterios_de_logros.filter(cdl => {
                const result = props.criteriosDeLogrosSelected!.some(sel => sel.id == cdl.id);
                if (result) nroRelaciones += 1;
                return result;
            });

            if (criteriosDeLogrosRelacionados.length > 0)
                recomendado = true;
        }

        return {
            ...contenido,
            recomendado,
            competenciasEspecificasRelacionadas,
            criteriosDeLogrosRelacionados,
            nroRelaciones
        };
    }).sort((a, b) => {
        if (a.recomendado && a.nroRelaciones > b.nroRelaciones) return -1;
        return 1;
    });
}

// Contenidos del grupo por defecto (gradosEspecificos)
const defaultContents = computed(() => enrichContents(props.contenidos));

// Interfaz para los grupos
interface ContentGroup {
    title: string;
    gradoId: number;
    contents: ContenidoItemSelector[];
    filteredContents: ContenidoItemSelector[];
}

// Grupos completos: primero el grupo por defecto, luego los adicionales
const groups = computed<ContentGroup[]>(() => {
    const groupsArray: ContentGroup[] = [];

    // Grupo por defecto (todos los grados especificados juntos)
    if (props.gradosEspecificos.length > 0) {
        groupsArray.push({
            title: `Contenidos de ${gradosText.value}`,
            gradoId: -1, // ID especial para el grupo por defecto
            contents: defaultContents.value,
            filteredContents: defaultContents.value
        });
    }

    // Grupos adicionales (cada grado individual)
    contenidosXGradoAdiccionales.value.forEach(item => {
        const enrichedContents = enrichContents(item.contenidosXGrado);
        groupsArray.push({
            title: `Contenidos de ${item.grado.nombre}`,
            gradoId: item.grado.id,
            contents: enrichedContents,
            filteredContents: enrichedContents
        });
    });

    return groupsArray;
});

// Grupos filtrados por búsqueda
const filteredGroups = computed(() => {
    return groups.value.map(group => ({
        ...group,
        filteredContents: group.contents.filter(c => {
            if (q.value.trim()) {
                return c.descripcion.toLowerCase().includes(q.value.toLowerCase());
            }
            return true;
        })
    }));
});

const emptyFiltered = computed(() => filteredGroups.value.every(g => g.filteredContents.length === 0));

// Todos los contenidos combinados (para encontrar el seleccionado)
const allContents = computed(() => groups.value.flatMap(g => g.contents));

const handleCheckboxChange = (contenidoId: number) => {
    contenidoIdSelected.value = contenidoIdSelected.value === contenidoId ? null : contenidoId;
};

const onSelectContenido = () => {
    isOpen.value = false;
    const contenido = allContents.value.find(c => c.id == contenidoIdSelected.value);
    emit('update:model-value', contenido);
};

const handleLoadContenidosAnotherGrado = async (grado: Grado) => {
    // Evitar cargar el mismo grado dos veces
    if (gradosSelected.value.some(g => g.id === grado.id)) {
        showTemporalMessage(`⚠️ El grado ${grado.nombre} ya está cargado`, 2000);
        return;
    }
    
    // Marcar como cargando
    loadingGrados.value.add(grado.id);
    gradosSelected.value.push(grado);

    const filtersContenidos: ContenidoFilter = {
        grados_ids: [grado.id],
        unidad_curricular_id: props.unidadCurricular.id
    };

    const listReqContenidos: ListRequest = {
        page: -1,
        rowsPerPage: 1,
        filters: filtersContenidos
    };

    try {
        const response = await $apiRest(apiContenidosRoutes.getPaginate, HttpMethodEnum.POST, listReqContenidos);
        const nuevosContenidos = response.list|| [];
        
        contenidosXGradoAdiccionales.value.push({
            grado,
            contenidosXGrado: nuevosContenidos
        });

        // Feedback visual según resultado
        if (nuevosContenidos.length === 0) {
            showTemporalMessage(`📭 El grado ${grado.nombre} no tiene contenidos`, 3000);
        } else {
            showTemporalMessage(`✅ ${nuevosContenidos.length} contenido${nuevosContenidos.length !== 1 ? 's' : ''} cargado${nuevosContenidos.length !== 1 ? 's' : ''} de ${grado.nombre}`, 3000);
            scrollToNewGroup(grado.id);
        }
    } catch (error) {
        console.error("Error al cargar contenidos del grado", error);
        showTemporalMessage(`❌ Error al cargar contenidos de ${grado.nombre}`, 4000);
    } finally {
        // Quitar marcador de cargando
        loadingGrados.value.delete(grado.id);
    }
};

// Sincronizar ID seleccionado cuando cambia el modelo externo
watch(
    [() => props.modelValue, () => props.criteriosDeLogrosSelected, () => props.competenciasEspecificasSelected],
    () => {
        contenidoIdSelected.value = props.modelValue?.id ?? null;
    }
);
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
            <UCard class="min-w-1/2 flex flex-col max-h-[90vh]">
                <!-- HEADER: búsqueda y botón cerrar -->
                <template #header>
                    <div class="flex gap-2 items-center mt-2">
                        <UInput
                            v-model="q"
                            icon="i-heroicons-magnifying-glass"
                            placeholder="Buscar Contenido"
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
<div class="flex-1 overflow-y-auto max-h-[60vh] px-2">
    <div
        v-if="emptyFiltered"
        class="flex flex-col justify-center items-center mt-5 text-center"
    >
        <UIcon name="tabler:search" class="w-8 h-8" />
        <span>No pudimos encontrar ningún contenido.</span>
    </div>

    <div v-else v-for="(group, idx) in filteredGroups" :key="idx" class="mb-6">
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
                {{ group.contents.length }} contenido{{ group.contents.length !== 1 ? 's' : '' }}
            </UBadge>
        </h3>

        <!-- Lista de contenidos del grupo -->
        <ul role="list" class="divide-y divide-gray-200 dark:divide-gray-800">
            <li
                v-for="contenido in group.filteredContents"
                :key="contenido.id"
                class="w-full flex items-center justify-between gap-3 py-3 px-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150"
            >
                <div
                    class="flex items-center gap-3 w-full hover:cursor-pointer"
                    @click="handleCheckboxChange(contenido.id)"
                >
                    <div class="text-sm min-w-0 flex gap-2 items-center flex-1">
                        <UCheckbox
                            :model-value="contenidoIdSelected === contenido.id"
                            @update:model-value="handleCheckboxChange(contenido.id)"
                            color="primary"
                            variant="list"
                        />
                        <p class="text-gray-900 dark:text-white font-medium">
                            {{ contenido.descripcion }}
                        </p>
                    </div>
                </div>

                <div class="flex items-center gap-3">
                    <!-- Contenido estructurante con diseño mejorado -->
                    <div 
                        class="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 rounded-lg border border-primary-200 dark:border-primary-800"
                    >
                        <UIcon 
                            name="tabler:building-arch" 
                            class="w-4 h-4 text-primary-600 dark:text-primary-400"
                        />
                        <span class="text-sm font-medium text-primary-700 dark:text-primary-300">
                            {{ contenido.contenido_estructurante.titulo }}
                        </span>
                    </div>

                    <UPopover
                        v-if="contenido.recomendado"
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
                                class="ml-1"
                            />
                        </UTooltip>

                        <template #content>
                            <div class="p-4 flex flex-col gap-y-4 max-w-128">
                                <div v-if="contenido.competenciasEspecificasRelacionadas?.length">
                                    <span class="font-medium">
                                        Se relaciona a las competencias específicas seleccionadas:
                                    </span>
                                    <ul class="list-disc ml-4">
                                        <li
                                            v-for="ce in contenido.competenciasEspecificasRelacionadas"
                                            :key="ce.id"
                                            class="my-1"
                                        >
                                            {{ ce.codificacion }} {{ ce.descripcion }}
                                        </li>
                                    </ul>
                                </div>

                                <USeparator color="primary" type="solid" />

                                <div v-if="contenido.criteriosDeLogrosRelacionados?.length">
                                    <span class="font-medium">
                                        Se relaciona a los criterios de logros seleccionados:
                                    </span>
                                    <ul class="list-disc ml-4">
                                        <li
                                            v-for="cdl in contenido.criteriosDeLogrosRelacionados"
                                            :key="cdl.id"
                                            class="my-1"
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

                <!-- BOTÓN PARA AGREGAR MÁS GRADOS (con indicador de carga) -->
                <div class="flex justify-center items-center py-4 gap-3">
                    <ButtonSelectGradoPopup
                        :gradosSelected="gradosSelected"
                        :disabled="loadingGrados.size > 0"
                        @onSelect="handleLoadContenidosAnotherGrado"
                        label="Usar contenido de otro grado."
                    />
                    
                    <!-- Indicador de carga mientras se procesa -->
                    <div 
                        v-if="loadingGrados.size > 0"
                        class="flex items-center gap-2 text-sm text-gray-500"
                    >
                        <UIcon name="tabler:loader-2" class="w-4 h-4 animate-spin" />
                        <span>Cargando contenidos...</span>
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
                            :disabled="contenidoIdSelected == null || loadingGrados.size > 0"
                            @click="onSelectContenido"
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