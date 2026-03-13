<script setup lang="ts">
import type { CompetenciaEspecifica } from '~/types/competenciaEspecifica';
import type { Contenido, ContenidoItemSelector } from '~/types/contenido';
import type { CriterioDeLogro } from '~/types/criterioDeLogro';

interface Props {
    modelValue: Contenido,
    contenidos: Contenido[],
    competenciasEspecificasSelected?: CompetenciaEspecifica[],
    criteriosDeLogrosSelected?: CriterioDeLogro[]
    color: string
    disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: null,
});

const emit = defineEmits(['update:model-value']);

const getLista = (): ContenidoItemSelector[] => {
    return props.contenidos.map(contenido => {
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
        }
    }).sort((a, b) => {
        if (a.recomendado && (a.nroRelaciones > b.nroRelaciones))
            return -1;
        return 1;
    });
};

const contenidos = ref<ContenidoItemSelector[]>(getLista());
const contenidoIdSelected = ref<number | null>(props.modelValue ? props.modelValue.id : null);
const isOpen = ref(false);
const q = ref('');

const contenidosFiltered = computed(() => {
    return contenidos.value.filter(contenido => {
        if (q.value.trim().length > 0) {
            return contenido.descripcion
                .toLowerCase()
                .includes(q.value.toLowerCase());
        }
        return true;
    });
});

const emptyFiltered = computed(() => contenidosFiltered.value.length === 0);

const onChangeContenido = (contenido: Contenido) => {
    contenidoIdSelected.value =
        contenidoIdSelected.value !== contenido.id
            ? contenido.id
            : null;
};

const onSelectContenido = () => {
    isOpen.value = false;
    const contenido = props.contenidos.find(c => c.id == contenidoIdSelected.value);
    emit('update:model-value', contenido);
};

const handleCheckboxChange = (contenidoId: number) => {
    contenidoIdSelected.value =
        contenidoIdSelected.value === contenidoId
            ? null
            : contenidoId;
};

watch([
    () => props.modelValue,
    () => props.contenidos,
    () => props.criteriosDeLogrosSelected,
    () => props.competenciasEspecificasSelected
], () => {
    contenidoIdSelected.value = props.modelValue?.id ?? null;
    contenidos.value = getLista();
});
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

    <UModal v-model:open="isOpen">
        <template #content>
            <!-- CARD FLEX COLUMN -->
            <UCard class="min-w-0 flex flex-col max-h-[90vh]">

                <!-- HEADER -->
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

                <!-- BODY SCROLLABLE -->
                <div class="flex-1 overflow-y-auto max-h-[60vh] overflow-y-auto">
                    <div
                        v-if="emptyFiltered"
                        class="flex flex-col justify-center items-center mt-5 text-center px-2"
                    >
                        <UIcon name="tabler:search" class="w-8 h-8" />
                        <span>No pudimos encontrar ningún contenido.</span>
                    </div>

                    <ul
                        v-else
                        role="list"
                        class="divide-y divide-gray-200 dark:divide-gray-800"
                    >
                        <li
                            v-for="contenido in contenidosFiltered"
                            :key="contenido.id"
                            class="w-full flex items-center justify-between gap-3 py-3 px-4 sm:px-6"
                        >
                            <div
                                class="flex items-center gap-3 w-full hover:cursor-pointer"
                                @click="onChangeContenido(contenido)"
                            >
                                <div class="text-sm min-w-0 flex gap-2 items-center">
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
                                <UPopover
                                    :popper="{ placement: 'bottom-start' }"
                                    mode="hover"
                                    v-if="contenido.recomendado"
                                >
                                    <UTooltip>
                                        <UButton
                                            label="Recomendado"
                                            icon="tabler:butterfly-filled"
                                            :color="getColorBadgeComponente(props.color)"
                                            variant="outline"
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
                                                        v-for="(ce, idx) in contenido.competenciasEspecificasRelacionadas"
                                                        :key="idx"
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
                                                        v-for="(cdl, idx) in contenido.criteriosDeLogrosRelacionados"
                                                        :key="idx"
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

                <!-- FOOTER SIEMPRE VISIBLE -->
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
                            :disabled="contenidoIdSelected == null"
                            @click="onSelectContenido"
                        />
                    </div>
                </template>

            </UCard>
        </template>
    </UModal>
</template>
