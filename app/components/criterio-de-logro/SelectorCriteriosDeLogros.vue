<script setup lang="ts">
import type { CriterioDeLogro, CriterioDeLogroItemSelector, CriterioDeLogroFilter } from '~/types/criterioDeLogro';
import type { CompetenciaEspecifica } from '~/types/competenciaEspecifica';
import type { Contenido } from '~/types/contenido';
import type { Grado } from '~/types/grado';
import type { UnidadCurricular } from '~/types/unidadCurricular';
import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum';
// Importamos el componente de selección de grados (ajusta la ruta según tu proyecto)
import ButtonSelectGradoPopup from '../grados/ButtonSelectGradoPopup.vue';
import { rows } from '@unovis/ts/components/timeline/style';

interface Props {
    modelValue: CriterioDeLogro[],
    criteriosDeLogro: CriterioDeLogro[],
    competenciasEspecificasSelected: CompetenciaEspecifica[],
    contenidoSelected?: Contenido,
    disabled?: boolean;
    color?: string;
    gradosEspecificos: Grado[];
    unidadCurricular: UnidadCurricular;
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: () => [],
    criteriosDeLogro: () => []
});

const emit = defineEmits(['update:model-value']);
const { $apiRest } = useNuxtApp();

// --- ESTADOS ---
const gradosSelected = ref<Grado[]>([...props.gradosEspecificos]);
const criteriosAdicionales = ref<{ grado: Grado, criterios: CriterioDeLogro[] }[]>([]);
const loadingGrados = ref<Set<number>>(new Set());
const showSuccessMessage = ref(false);
const successMessage = ref('');

const showTemporalMessage = (message: string, duration = 3000) => {
    successMessage.value = message;
    showSuccessMessage.value = true;
    setTimeout(() => { showSuccessMessage.value = false; }, duration);
};

const scrollToNewGroup = (gradoId: number) => {
    setTimeout(() => {
        const element = document.getElementById(`grado-group-${gradoId}`);
        if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
};

// --- LÓGICA DE ENRIQUECIMIENTO ---
function enrichCriterios(lista: CriterioDeLogro[], gradoId: number): (CriterioDeLogroItemSelector & { gradoId: number })[] {
    const modelIds = new Set(props.modelValue?.map(c => c.id) || []);
    
    return lista.map(criterio => {
        let recomendado = false;
        let nroRelaciones = 0;

        if (props.competenciasEspecificasSelected?.length) {
            const rel = criterio.competencias_especificas?.filter(ce =>
                props.competenciasEspecificasSelected.some(sel => sel.id === ce.id)
            ) || [];
            if (rel.length) { recomendado = true; nroRelaciones += rel.length; }
        }

        if (props.contenidoSelected && criterio.contenidos?.some(c => c.id === props.contenidoSelected?.id)) {
            recomendado = true;
            nroRelaciones += 1;
        }

        return {
            ...criterio,
            checked: modelIds.has(criterio.id),
            recomendado,
            nroRelaciones,
            gradoId
        };
    }).sort((a, b) => (b.recomendado ? b.nroRelaciones : 0) - (a.recomendado ? a.nroRelaciones : 0));
}

const criteriosInternos = ref<(CriterioDeLogroItemSelector & { gradoId: number })[]>([]);

function reconstruirCriterios() {
    const base = enrichCriterios(props.criteriosDeLogro, -1);
    const adicionales = criteriosAdicionales.value.flatMap(item => enrichCriterios(item.criterios, item.grado.id));
    criteriosInternos.value = [...base, ...adicionales];
}

watch([() => props.criteriosDeLogro, () => props.modelValue, () => props.competenciasEspecificasSelected, () => props.contenidoSelected, criteriosAdicionales], reconstruirCriterios, { deep: true, immediate: true });

// --- AGRUPACIÓN ---
const groups = computed(() => {
    const map = new Map<number, any>();
    for (const item of criteriosInternos.value) {
        if (!map.has(item.gradoId)) {
            const gradoObj = item.gradoId === -1 ? props.gradosEspecificos[0] : gradosSelected.value.find(g => g.id === item.gradoId);
            map.set(item.gradoId, { 
                title: item.gradoId === -1 ? `Criterios Base (${gradoObj?.nombre})` : `Criterios de ${gradoObj?.nombre}`, 
                gradoId: item.gradoId, 
                contents: [] 
            });
        }
        map.get(item.gradoId).contents.push(item);
    }
    return Array.from(map.values()).sort((a, b) => a.gradoId === -1 ? -1 : 1);
});

const q = ref('');
const filteredGroups = computed(() => groups.value.map(g => ({
    ...g,
    filteredContents: g.contents.filter(item => !q.value.trim() || item.descripcion?.toLowerCase().includes(q.value.toLowerCase()))
})).filter(g => g.filteredContents.length > 0));

// --- ACCIONES ---
const isOpen = ref(false);
const onToggle = (item: any) => {
    const index = criteriosInternos.value.findIndex(c => c.id === item.id);
    if (index !== -1) criteriosInternos.value[index].checked = !criteriosInternos.value[index].checked;
};

const onSave = () => {
    emit('update:model-value', criteriosInternos.value.filter(c => c.checked));
    isOpen.value = false;
};

const handleLoadAnotherGrado = async (grado: Grado) => {
    if (gradosSelected.value.some(g => g.id === grado.id)) return showTemporalMessage(`⚠️ El grado ${grado.nombre} ya está cargado`, 2000);
    
    loadingGrados.value.add(grado.id);
    gradosSelected.value.push(grado);

    try {
        const response = await $apiRest(apiCriteriosDeLogrosRoutes.getPaginate, HttpMethodEnum.POST, {
            page: -1,
            rowsPerPage: 1,
            filters: { grados_ids: [grado.id], unidad_curricular_id: props.unidadCurricular.id }
        });
        criteriosAdicionales.value.push({ grado, criterios: response.list || [] });
        showTemporalMessage(`✅ Cargado: ${grado.nombre}`, 3000);
        scrollToNewGroup(grado.id);
    } catch (error) {
        console.error("Error cargando criterios extra:", error);
    } finally {
        loadingGrados.value.delete(grado.id);
    }
};
</script>

<template>
    <div class="w-full space-y-2">
        <!-- ETIQUETA -->
        <div class="flex items-center justify-between px-1">
            <span class="text-[10px] uppercase font-black text-gray-400 tracking-widest italic">Criterios de Logro</span>
            <UBadge v-if="modelValue.length > 0" size="xs" variant="subtle" color="primary">{{ modelValue.length }} Seleccionados</UBadge>
        </div>

        <!-- VISTA SELECCIONADOS -->
        <div v-if="modelValue.length > 0" @click="isOpen = true" class="group relative flex flex-col gap-3 p-4 rounded-xl border-primary border-1 bg-white dark:bg-gray-900 shadow-sm cursor-pointer hover:shadow-md transition-all">
            <div v-for="criterio in modelValue" :key="criterio.id" class="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                <div class="flex-shrink-0 w-5 h-5 rounded-full bg-primary-500 text-white flex items-center justify-center mt-0.5"><UIcon name="tabler:check" class="w-3.5 h-3.5" /></div>
                <p class="text-xs font-medium text-gray-700 dark:text-gray-200 leading-relaxed italic">"{{ criterio.descripcion }}"</p>
            </div>
            <div class="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity"><UButton icon="tabler:pencil" size="xs" color="primary" variant="ghost" /></div>
        </div>

        <button v-else type="button" class="w-full group flex flex-col items-center justify-center py-10 px-6 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50/30 hover:border-primary-400 hover:bg-primary-50/20 transition-all" @click="isOpen = true" :disabled="disabled">
            <div class="relative mb-4">
                <div class="w-14 h-14 rounded-2xl bg-white border border-gray-200 flex items-center justify-center shadow-sm text-gray-400 group-hover:text-primary-500 transition-colors"><UIcon name="tabler:list-check" class="w-7 h-7" /></div>
                <div class="absolute -right-2 -bottom-2 w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center border-2 border-white shadow-md"><UIcon name="tabler:plus" class="w-4 h-4" /></div>
            </div>
            <p class="text-sm font-black text-gray-700 uppercase tracking-tight group-hover:text-primary-600 transition-colors">Vincular Criterios</p>
        </button>
    </div>

    <UModal v-model:open="isOpen" fullscreen>
        <template #content>
            <UCard class="flex flex-col h-screen overflow-hidden">
                <template #header>
                    <div class="flex gap-2 items-center">
                        <UInput v-model="q" icon="i-heroicons-magnifying-glass" placeholder="Filtrar criterios..." autofocus class="flex-1" />
                        <UButton icon="tabler:x" size="sm" color="primary" square @click="isOpen = false" />
                    </div>
                </template>

                <div class="contenido-scrollable overflow-y-auto p-4 space-y-6 bg-gray-50/50 dark:bg-gray-950">
                    <Transition name="fade">
                        <div v-if="showSuccessMessage" class="sticky top-0 z-50 flex justify-center"><UBadge color="success" variant="solid" class="shadow-lg px-4 py-1">{{ successMessage }}</UBadge></div>
                    </Transition>

                    <div v-for="group in filteredGroups" :key="group.gradoId" :id="`grado-group-${group.gradoId}`" class="space-y-3">
                        <h3 class="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2 border-l-4 border-primary py-1">{{ group.title }}</h3>
                        <ul class="divide-y divide-gray-100 border border-primary/10 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-gray-900">
                            <li v-for="item in group.filteredContents" :key="item.id" @click="onToggle(item)" class="flex items-start gap-4 p-5 hover:bg-gray-50 cursor-pointer transition-all" :class="{'bg-primary-50/30': item.checked}">
                                <UCheckbox :model-value="item.checked" @update:model-value="onToggle(item)" size="xl" class="mt-1" />
                                <div class="flex-1">
                                    <p class="text-sm font-medium text-gray-800 dark:text-gray-100 leading-relaxed italic">"{{ item.descripcion }}"</p>
                                    <div v-if="item.recomendado" class="mt-3 flex items-center gap-2"><UBadge size="xs" color="primary" variant="subtle" icon="tabler:butterfly-filled">Sugerido</UBadge></div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                <div class="border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                    <div class="p-4 bg-gray-50 dark:bg-gray-800/30 flex flex-col items-center gap-2">
                        <ButtonSelectGradoPopup 
                            :gradosSelected="gradosSelected" 
                            :disabled="loadingGrados.size > 0" 
                            @onSelect="handleLoadAnotherGrado" 
                            label="Usar criterios de otro grado" 
                        />
                        
                        <div v-if="loadingGrados.size > 0" class="flex items-center gap-2 text-[10px] text-primary-500 font-bold uppercase animate-pulse">
                            <UIcon name="tabler:loader-2" class="animate-spin" />
                            Cargando repositorio...
                        </div>
                    </div>
                    
                    <div class="p-4 flex justify-end gap-3">
                        <UButton label="Cancelar" color="neutral" variant="ghost" @click="isOpen = false" />
                        <UButton label="Confirmar Selección" color="primary" class="px-10 font-bold shadow-md" @click="onSave" />
                    </div>
                </div>
            </UCard>
        </template>
    </UModal>
</template>

<style scoped>
.contenido-scrollable { height: 70svh; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

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