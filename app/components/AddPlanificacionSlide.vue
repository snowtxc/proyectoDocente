<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useGrupoService, useGrupoStore } from '~/services/grupoService/grupoService';
import { usePlanificacionService } from '~/services/planificacionService/planificacionService';
import type { CreatePlanificacionDTO } from '~/types/planificacion';

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ (e: 'update:open', value: boolean): void }>();

function closeSlideover() {
    emit('update:open', false);
}

const formData = ref({
    nombre: '',
    rangeDate: null,
    selectedGrupo: null,
});

const errors = ref({
    nombre: '',
    rangeDate: '',
    selectedGrupo: '',
});

const planificacionService = usePlanificacionService()

const grupoStore = useGrupoStore()
const loadingGrupos = computed(() => grupoStore.loading);
const grupos = computed(() => grupoStore.grupos);

const { createPlanificacion } = planificacionService;
const loadingCreatePlanificacion = ref(false);

const valComputed = computed(() => loadingCreatePlanificacion);

watch(
    () => props.open,
    async (newVal) => {
        if (newVal) {
            await grupoStore.getGrupos();
        }
    }
);

watch(
    () => planificacionService.loading,
    async (newVal) => {
        loadingCreatePlanificacion.value = newVal;
    }
);


const formattedImageUrl = computed(() => {
    return formattedImageUrlGrupo(formData.value.selectedGrupo?.image);
});

const validateForm = () => {
    let isValid = true;
    Object.keys(formData.value).forEach((key) => {
        if (!formData.value[key]) {
            errors.value[key] = 'Este campo es requerido.';
            isValid = false;
        } else {
            errors.value[key] = '';
        }
    });
    return isValid;
};

const handleSubmit = async () => {
    if (validateForm()) {
        const dataToCreatePlanificacion: CreatePlanificacionDTO = {
            groupId: formData?.value?.selectedGrupo?.key,
            name: formData?.value?.nombre,
            startDate: formData?.value?.rangeDate?.start,
            endDate: formData?.value?.rangeDate?.end,
        }
        const resp = await createPlanificacion(dataToCreatePlanificacion);
        if (resp?.ok) {
            closeSlideover();
        }
    } else {

    }
};
</script>

<template>
    <UDashboardSlideover :close-button="false" v-model="props.open">
        <template #title>
            <UButton color="gray" variant="ghost" size="sm" @click="closeSlideover"
                icon="i-heroicons-arrow-left-20-solid" />
            Crear planificacion
        </template>

        <div class="flex w-full flex-col items-center justify-start gap-5">
            <div class="w-full">
                <label for="name" class="block text-gray-700 mb-2">Nombre</label>
                <UInput id="name" v-model="formData.nombre" icon="i-heroicons-magnifying-glass"
                    placeholder="Ingresa un nombre" class="w-full" autofocus color="gray" />
                <p v-if="errors.nombre" class="text-red-500 text-sm mt-1">{{ errors.nombre }}</p>
            </div>

            <div class="w-full relative">
                <label for="date" class="block text-gray-700 mb-2">Fechas</label>
                <v-date-picker :focus="false" id="date" v-model="formData.rangeDate" is-range>
                    <template #default="{ inputValue, inputEvents }">
                        <UInput :autofocus="false" color="gray" icon="material-symbols-light:calendar-month-rounded"
                            placeholder="Selecciona el rango de tiempo" class="w-full"
                            :value="inputValue?.start ? (inputValue.start + '-' + inputValue.end) : ''"
                            v-on="inputEvents.start" />
                    </template>
                </v-date-picker>
                <p v-if="errors.rangeDate" class="text-red-500 text-sm mt-1">{{ errors.rangeDate }}</p>
            </div>

            <div class="w-full">
                <label for="date" class="block text-gray-700 mb-2">Grupo</label>
                <USelectMenu searchable v-model="formData.selectedGrupo"
                    :options="grupos?.map((grupo) => ({ key: grupo?.id, label: grupo?.nombre, image: grupo?.url_image }))"
                    placeholder="Seleccionar grupo">
                    <template #leading>
                        <UAvatar v-bind="{ src: formattedImageUrl }" size="2xs" />
                    </template>
                </USelectMenu>
                <p v-if="errors.selectedGrupo" class="text-red-500 text-sm mt-1">{{ errors.selectedGrupo }}</p>
            </div>

            <div class="flex w-full justify-end gap-3">
                <UButton label="Cancelar" color="gray" variant="ghost" @click="closeSlideover" />
                <UButton type="submit" @click="handleSubmit" label="Guardar" color="black"
                    :loading="loadingCreatePlanificacion || grupoStore.loading" />
            </div>
        </div>
    </UDashboardSlideover>
</template>
