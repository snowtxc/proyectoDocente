<script setup lang="ts">
import type { CompetenciaEspecifica, CompetenciaGeneral, CompetenciaGeneralItemSelector } from '~/types/competenciaEspecifica';
import type { Contenido } from '~/types/contenido';

interface Props {
    modelValue: CompetenciaGeneral[],
    competenciasGenerales: CompetenciaGeneral[],
    competenciasEspecificasSelected: CompetenciaEspecifica[]
    disabled?: boolean;
    color?: string
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: () => [],
});

const emit = defineEmits(['update:model-value']);

const getLista = (): CompetenciaGeneralItemSelector[] => {
    return props.competenciasGenerales.map(competenciaGeneral => {
        let recomendado: boolean = false;
        let competenciasEspecificasRelacionadas: CompetenciaEspecifica[] = [];
        let nroRelaciones = 0;

        if (props.competenciasEspecificasSelected) {
            competenciasEspecificasRelacionadas = competenciaGeneral.competencias_especificas?.filter(ce =>
                props.competenciasEspecificasSelected.some(sel => sel.id === ce.id)
            ) || [];
            if (competenciasEspecificasRelacionadas.length) {
                recomendado = true;
                nroRelaciones += competenciasEspecificasRelacionadas.length;
            }
        }

        return {
            ...competenciaGeneral,
            checked: props.modelValue?.some(ce => ce.id === competenciaGeneral.id) || false,
            recomendado,
            competenciasEspecificasRelacionadas,
            nroRelaciones
        };
    }).sort((a, b) => {
        if (a.recomendado && a.nroRelaciones > b.nroRelaciones) return -1;
        if (b.recomendado && b.nroRelaciones > a.nroRelaciones) return 1;
        return 0;
    });
};

const competenciasGenerales = ref(getLista());
const isOpen = ref<boolean>(false);
const q = ref<string>('');

const competenciasGeneralesFiltered = computed(() => {
    return competenciasGenerales.value.filter(competenciaGeneral => {
        const { nombre } = competenciaGeneral;
        const nombreLowerCase = nombre.toLowerCase();
        if (q.value.trim().length > 0) {
            const qLowerCase = q.value.toLocaleLowerCase();
            if (!nombreLowerCase.includes(qLowerCase)) return false;
        }
        return true;
    });
});

const emptyFiltered = computed(() => competenciasGeneralesFiltered.value.length == 0);

const onSave = () => {
    const seleccionadas = competenciasGenerales.value.filter(cdl => cdl.checked);
    emit('update:model-value', seleccionadas);
    isOpen.value = false;
};

const onToggle = (competenciaGeneral: CompetenciaGeneralItemSelector) => {
    competenciaGeneral.checked = !competenciaGeneral.checked;
};

watch([() => props.modelValue, () => props.competenciasEspecificasSelected], () => {
    competenciasGenerales.value = getLista();
}, { deep: true });
</script>

<template>
    <div class="w-full space-y-2">
        <!-- CABECERA -->
        <div class="flex items-center justify-between px-1">
            <span class="text-[10px] uppercase font-black text-gray-400 tracking-widest italic">Competencias Generales (MCN)</span>
            <UBadge v-if="props.modelValue.length > 0" size="xs" variant="subtle" color="primary">
                {{ props.modelValue.length }} Activas
            </UBadge>
        </div>

        <!-- ESTADO: SELECCIONADO (Lista Completa) -->
        <div 
            v-if="props.modelValue.length > 0" 
            @click="isOpen = true"
            class="group relative flex flex-col gap-2 p-4 rounded-xl border-primary border-1 bg-white dark:bg-gray-900 shadow-sm cursor-pointer transition-all hover:shadow-md"
        >
            <div 
                v-for="cg in props.modelValue" 
                :key="cg.id"
                class="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
            >
                <UAvatar
                    :src="cg.url_image"
                    size="xs"
                    class="bg-white dark:bg-gray-700 shadow-sm shrink-0"
                />
                <span class="text-xs font-bold text-gray-700 dark:text-gray-200">
                    {{ cg.nombre }}
                </span>
            </div>

            <!-- Icono flotante de edición -->
            <div class="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <UButton icon="tabler:pencil" size="xs" color="primary" variant="ghost" />
            </div>
        </div>

        <!-- ESTADO: VACÍO (Placeholder) -->
        <button
            v-else
            type="button"
            class="w-full group flex flex-col items-center justify-center py-10 px-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl bg-gray-50/30 dark:bg-gray-800/10 hover:border-primary-400 hover:bg-primary-50/20 transition-all"
            :disabled="props.disabled"
            @click="isOpen = true"
        >
            <div class="relative mb-4">
                <div class="absolute inset-0 bg-primary-400 blur-2xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
                <div class="relative w-14 h-14 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform text-gray-400 group-hover:text-primary-500">
                    <UIcon name="tabler:apps" class="w-7 h-7" />
                </div>
                <div class="absolute -right-2 -bottom-2 w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center border-2 border-white dark:border-gray-900 shadow-md">
                    <UIcon name="tabler:plus" class="w-4 h-4" />
                </div>
            </div>
            <div class="text-center">
                <p class="text-sm font-black text-gray-700 dark:text-gray-200 uppercase tracking-tight group-hover:text-primary-600 transition-colors">Seleccionar Competencias Generales</p>
                <p class="text-xs text-gray-400 mt-1 italic">Hacer clic para abrir el catálogo</p>
            </div>
        </button>
    </div>

    <!-- MODAL -->
    <UModal v-model:open="isOpen" fullscreen>
        <template #content>
            <UCard class="flex flex-col h-screen overflow-hidden">
                <template #header>
                    <div class="flex gap-2 items-center">
                        <UInput v-model="q" icon="i-heroicons-magnifying-glass" placeholder="Buscar competencia general..." autofocus class="flex-1" />
                        <UButton icon="tabler:x" size="sm" color="primary" square variant="solid" @click="isOpen = false" />
                    </div>
                </template>

                <div class="contenido-scrollable overflow-y-auto p-4 space-y-6">
                    <div v-if="emptyFiltered" class="flex flex-col justify-center items-center py-10 text-gray-500">
                        <UIcon name="tabler:search" class="w-10 h-10 mb-2 opacity-20" />
                        <p>No se encontraron competencias generales.</p>
                    </div>

                    <ul v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <li
                            v-for="cg in competenciasGeneralesFiltered"
                            :key="cg.id"
                            @click="onToggle(cg)"
                            class="flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer relative"
                            :class="cg.checked ? 'border-primary bg-primary-50/30 dark:bg-primary-900/10 shadow-sm' : 'border-gray-100 dark:border-gray-800 hover:border-primary-200 bg-white dark:bg-gray-900'"
                        >
                            <UCheckbox :model-value="cg.checked" @update:model-value="onToggle(cg)" class="shrink-0" />
                            
                            <UAvatar :src="cg.url_image" size="md" class="bg-gray-50 dark:bg-gray-800 shrink-0" />
                            
                            <div class="flex-1 min-w-0">
                                <p class="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                                    {{ cg.nombre }}
                                </p>
                            </div>

                            <div v-if="cg.recomendado" class="absolute top-2 right-2">
                                <UPopover mode="hover">
                                    <UIcon name="tabler:butterfly-filled" class="text-orange-500 w-5 h-5" />
                                    <template #content>
                                        <div class="p-3 text-xs max-w-xs">
                                            <p class="font-bold mb-1">Recomendado por relación con:</p>
                                            <ul class="list-disc ml-3 space-y-1">
                                                <li v-for="(ce, idx) in cg.competenciasEspecificasRelacionadas" :key="idx">
                                                    {{ ce.descripcion }}
                                                </li>
                                            </ul>
                                        </div>
                                    </template>
                                </UPopover>
                            </div>
                        </li>
                    </ul>
                </div>

                <template #footer>
                    <div class="flex flex-col-reverse sm:flex-row justify-end gap-3 w-full">
                        <UButton label="Cancelar" color="neutral" variant="ghost" @click="isOpen = false" />
                        <UButton label="Guardar Selección" color="primary" class="px-8 shadow-lg" @click="onSave" />
                    </div>
                </template>
            </UCard>
        </template>
    </UModal>
</template>

<style scoped>
.contenido-scrollable {
  height: 75svh;
  scrollbar-width: thin;
}
</style>