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

const loadingGrados = ref<Set<number>>(new Set());
const successMessage = ref('');
const showSuccessMessage = ref(false);

const showTemporalMessage = (message: string, duration = 3000) => {
    successMessage.value = message;
    showSuccessMessage.value = true;
    setTimeout(() => {
        showSuccessMessage.value = false;
    }, duration);
};

const scrollToNewGroup = (gradoId: number) => {
    setTimeout(() => {
        const element = document.getElementById(`grado-group-${gradoId}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 100);
};

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
            if (competenciasEspecificasRelacionadas.length > 0) recomendado = true;
        }

        if (props.criteriosDeLogrosSelected) {
            criteriosDeLogrosRelacionados = contenido.criterios_de_logros.filter(cdl => {
                const result = props.criteriosDeLogrosSelected!.some(sel => sel.id == cdl.id);
                if (result) nroRelaciones += 1;
                return result;
            });
            if (criteriosDeLogrosRelacionados.length > 0) recomendado = true;
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

const defaultContents = computed(() => enrichContents(props.contenidos));

interface ContentGroup {
    title: string;
    gradoId: number;
    contents: ContenidoItemSelector[];
    filteredContents: ContenidoItemSelector[];
}

const groups = computed<ContentGroup[]>(() => {
    const groupsArray: ContentGroup[] = [];
    if (props.gradosEspecificos.length > 0) {
        groupsArray.push({
            title: `Contenidos de ${gradosText.value}`,
            gradoId: -1,
            contents: defaultContents.value,
            filteredContents: defaultContents.value
        });
    }
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
    if (gradosSelected.value.some(g => g.id === grado.id)) {
        showTemporalMessage(`⚠️ El grado ${grado.nombre} ya está cargado`, 2000);
        return;
    }
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
        contenidosXGradoAdiccionales.value.push({ grado, contenidosXGrado: nuevosContenidos });
        if (nuevosContenidos.length === 0) {
            showTemporalMessage(`📭 El grado ${grado.nombre} no tiene contenidos`, 3000);
        } else {
            showTemporalMessage(`✅ Contenidos cargados de ${grado.nombre}`, 3000);
            scrollToNewGroup(grado.id);
        }
    } catch (error) {
        showTemporalMessage(`❌ Error al cargar contenidos de ${grado.nombre}`, 4000);
    } finally {
        loadingGrados.value.delete(grado.id);
    }
};

watch(
    [() => props.modelValue, () => props.criteriosDeLogrosSelected, () => props.competenciasEspecificasSelected],
    () => {
        contenidoIdSelected.value = props.modelValue?.id ?? null;
    }
);
</script>

<template>
    <div class="w-full space-y-2">
        <div class="flex items-center justify-between px-1">
             <span class="text-[10px] uppercase font-black text-gray-400 tracking-widest italic">CONTENIDO</span>
            <UBadge v-if="props.modelValue" size="xs" variant="subtle" color="primary" class="animate-pulse">Seleccionado</UBadge>
        </div>

        <div 
            v-if="props.modelValue" 
            @click="isOpen = true"
            class="group relative flex items-start gap-4 p-4 rounded-xl border-primary border-1  bg-white dark:bg-gray-900 shadow-sm cursor-pointer transition-all hover:shadow-md"
        >
            <div class="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-primary-50 dark:bg-primary-950/30">
                <UIcon name="tabler:notebook" class="w-6 h-6 text-primary" />
            </div>

            <div class="flex-1 min-w-0 pr-6">
                <p class="text-sm font-bold text-gray-800 dark:text-gray-100 leading-tight line-clamp-3">
                    {{ props.modelValue.descripcion }}
                </p>
                <div class="mt-2 flex items-center gap-2">
                    <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 uppercase">
                        {{ props.modelValue.contenido_estructurante?.titulo }}
                    </span>
                </div>
            </div>

            <div class="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <UButton icon="tabler:pencil" size="xs" color="primary" variant="ghost" />
            </div>
        </div>

        <!-- ESTADO: VACÍO (Placeholder Intuitivo) -->
        <button
            v-else
            type="button"
            class="w-full group flex flex-col items-center justify-center py-10 px-6 border-2 
            
            border-gray-300 dark:border-gray-700 rounded-2xl bg-gray-50/30 dark:bg-gray-800/10 hover:border-primary hover:bg-primary-50/20 transition-all"
            :disabled="props.disabled"
            @click="isOpen = true"
        >
            <div class="relative mb-4">
                <div class="absolute inset-0 bg-primary-400 blur-2xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
                <div class="relative w-14 h-14 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform">
                    <UIcon name="tabler:search" class="w-7 h-7 text-gray-400 group-hover:text-primary-500" />
                </div>
                <div class="absolute -right-2 -bottom-2 w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center border-2 border-white dark:border-gray-900 shadow-md">
                    <UIcon name="tabler:plus" class="w-4 h-4" />
                </div>
            </div>

            <div class="text-center">
                <p class="text-sm font-black text-gray-700 dark:text-gray-200 uppercase tracking-tight group-hover:text-primary-600 transition-colors">
                    Seleccionar Contenido
                </p>
                <p class="text-xs text-gray-400 mt-1">
                    Buscando en: <span class="font-bold">{{ props.unidadCurricular?.nombre }}</span>
                </p>
            </div>
        </button>
    </div>

    <UModal v-model:open="isOpen" fullscreen>
        <template #content>
            <UCard class="flex flex-col h-screen overflow-hidden">
                <template #header>
                    <div class="flex gap-2 items-center">
                        <UInput v-model="q" icon="i-heroicons-magnifying-glass" placeholder="Buscar Contenido..." autofocus class="flex-1" />
                        <UButton icon="tabler:x" size="sm" color="neutral" variant="ghost" @click="isOpen = false" />
                    </div>
                </template>

                <div class="flex-1 overflow-y-auto p-4 space-y-6 contenido-scrollable">
                    <div v-if="emptyFiltered" class="flex flex-col justify-center items-center py-10 text-gray-500">
                        <UIcon name="tabler:search" class="w-10 h-10 mb-2 opacity-20" />
                        <p>No se encontraron contenidos.</p>
                    </div>

                    <div v-else v-for="(group, idx) in filteredGroups" :key="idx">
                        <h3 :id="`grado-group-${group.gradoId}`" class="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3 sticky top-0 bg-white dark:bg-gray-900 py-1 z-10">
                            {{ group.title }}
                            <UBadge v-if="group.contents.length > 0" size="xs" variant="subtle" class="ml-2">{{ group.contents.length }}</UBadge>
                        </h3>

                        <ul class="divide-y divide-gray-100 dark:divide-gray-800 border border-primary rounded-xl overflow-hidden shadow-sm">
                            <li
                                v-for="contenido in group.filteredContents"
                                :key="contenido.id"
                                @click="handleCheckboxChange(contenido.id)"
                                class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                                :class="{'bg-primary-50/50 dark:bg-primary-900/10': contenidoIdSelected === contenido.id}"
                            >
                                <div class="flex items-start gap-3 flex-1">
                                    <UCheckbox :model-value="contenidoIdSelected === contenido.id" @click.stop="handleCheckboxChange(contenido.id)" color="primary" class="mt-1" />
                                    <p class="text-sm font-medium leading-snug">{{ contenido.descripcion }}</p>
                                </div>
                                <div class="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                    <div class="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 uppercase">{{ contenido.contenido_estructurante.titulo }}</div>
                                    <UPopover v-if="contenido.recomendado" mode="hover">
                                        <UIcon name="tabler:butterfly-filled" class="text-orange-500 w-5 h-5" />
                                        <template #content><div class="p-3 text-xs max-w-xs">Contenido recomendado</div></template>
                                    </UPopover>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                <div class="p-4 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800 shrink-0">
                    <div class="flex flex-wrap items-center justify-center gap-4">
                        <ButtonSelectGradoPopup :gradosSelected="gradosSelected" :disabled="loadingGrados.size > 0" @onSelect="handleLoadContenidosAnotherGrado" label="Usar otro grado" />
                        <div v-if="loadingGrados.size > 0" class="flex items-center gap-2 text-xs text-primary-500">
                            <UIcon name="tabler:loader-2" class="animate-spin w-4 h-4" />
                            Cargando contenidos...
                        </div>
                    </div>
                </div>

                <template #footer>
                    <div class="flex justify-end gap-3 w-full">
                        <UButton label="Cancelar" color="neutral" variant="ghost" @click="isOpen = false" />
                        <UButton label="Confirmar Selección" color="primary" icon="tabler:check" class="px-8" :disabled="contenidoIdSelected == null || loadingGrados.size > 0" @click="onSelectContenido" />
                    </div>
                </template>
            </UCard>
        </template>
    </UModal>
</template>

<style scoped>
@keyframes slideIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

.contenido-scrollable {
    scrollbar-width: thin;
    scrollbar-color: #e5e7eb transparent;
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

@media (max-height: 599px) {
    .contenido-scrollable {
        height: 70svh;
    }
}
</style>