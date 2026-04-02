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
        let contenidoRelacionado: Contenido | null = null;
        let competenciasEspecificasRelacionadas: CompetenciaEspecifica[] = [];
        let nroRelaciones = 0;

        if (props.competenciasEspecificasSelected) {
            // Tu lógica original intacta
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
            if (!nombreLowerCase.includes(qLowerCase))
                return false;
        }
        return true;
    });
});

const emptyFiltered = computed(() => {
    return competenciasGeneralesFiltered.value.length == 0;
});

const onSave = () => {
    const competenciasGeneralesSelected = competenciasGenerales.value.filter(cdl => cdl.checked);
    emit('update:model-value', competenciasGeneralesSelected);
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
                            placeholder="Buscar competencia general"
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

                <!-- BODY CON ALTURA DINÁMICA (media queries) -->
                <div class="contenido-scrollable overflow-y-auto p-4 space-y-6">
                    <div v-if="emptyFiltered"
                        class="flex flex-col justify-center items-center py-10 text-gray-500">
                        <UIcon name="tabler:search" class="w-10 h-10 mb-2 opacity-20" />
                        <p>No se encontraron competencias generales.</p>
                    </div>

                    <ul v-else role="list"
                        class="divide-y divide-gray-200 dark:divide-gray-800 border border-primary rounded-lg overflow-hidden">
                        <li
                            v-for="competenciaGeneral in competenciasGeneralesFiltered"
                            :key="competenciaGeneral.id"
                            @click="onToggle(competenciaGeneral)"
                            class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                            :class="{'bg-primary-50/50 dark:bg-primary-900/10': competenciaGeneral.checked}"
                        >
                            <div class="flex items-start gap-3 flex-1">
                                <UCheckbox
                                    size="xl"
                                    :model-value="competenciaGeneral.checked"
                                    @update:model-value="onToggle(competenciaGeneral)"
                                    class="mt-1"
                                />
                                <p class="text-sm font-medium leading-snug text-gray-900 dark:text-white">
                                    {{ competenciaGeneral.nombre }}
                                </p>
                            </div>

                            <div class="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                <UAvatar
                                    :src="competenciaGeneral.url_image"
                                    size="sm"
                                    class="bg-gray-100 dark:bg-gray-800"
                                />

                                <UPopover mode="hover" v-if="competenciaGeneral.recomendado">
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
                                            <div v-if="competenciaGeneral.competenciasEspecificasRelacionadas?.length > 0">
                                                <span class="font-medium">
                                                    Se relaciona a las siguientes competencias específicas:
                                                </span>
                                                <ul class="list-disc ml-4 mt-2">
                                                    <li
                                                        v-for="(competenciaEspecifica, idx) in competenciaGeneral.competenciasEspecificasRelacionadas"
                                                        :key="idx"
                                                        class="text-sm"
                                                    >
                                                        {{ competenciaEspecifica.descripcion }}
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

                <!-- FOOTER UNIFICADO (solo botones, pero consistente) -->
                <div class="border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
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
                            @click="onSave"
                        />
                    </div>
                </div>
            </UCard>
        </template>
    </UModal>
</template>

<style scoped>

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