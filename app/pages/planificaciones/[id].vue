<script setup lang="ts">
import { usePlanificacionStore } from "~/services/planificacionService/planificacionService";

const route = useRoute();
const id = route.params.id;
const planificacionStore = usePlanificacionStore();

const loadedPlanificacion = computed(() => planificacionStore.loadedPlanificacion)
const errorPage = ref({ ok: false, message: "" });

onMounted(async () => {
    if (id) {
        await planificacionStore.getPlanificacion(id as string, (msg: string) => {
            errorPage.value = {
                ok: true,
                message: msg,
            };
        });
    } else {
        errorPage.value = {
            ok: true,
            message: 'La planificacion indicada no existe',
        };
    }
});
</script>

<template>
    <div class="flex w-full flex-grow items-center justify-center h-full" v-if="errorPage.ok">
        <UPageError :message="errorPage.message || 'Error'" />
    </div>

    <UDashboardPage v-if="loadedPlanificacion?.id">
        <UDashboardPanel grow>
            <UDashboardNavbar :badge="loadedPlanificacion?.nombre" title="Detalle planificacion">
                <template #right>
                    <UButton label="Duplicar" icon-class="w-4" trailing-icon="i-heroicons-document-duplicate"
                        color="gray" />
                    <UButton label="Editar" trailing-icon="i-heroicons-pencil" color="gray" />
                    <UButton label="Exportar PDF" trailing-icon="i-heroicons-document-arrow-down" color="gray" />
                </template>
            </UDashboardNavbar>
            <div class="w-full h-auto px-5 py-4 flex flex-col items-start justify-center gap-5">
                <InfoRows :rows="[{
                    key: 'Nombre',
                    value: loadedPlanificacion?.nombre
                },
                {
                    key: 'Rango de tiempos',
                    value: 'Nombre',
                    slotName: `rangoTiempos-slot`
                },
                {
                    key: 'Estado',
                    value: loadedPlanificacion?.estado,
                    slotName: 'estado-slot',
                },
                {
                    key: 'Grupo',
                    value: loadedPlanificacion?.grupo,
                    slotName: 'grupo-slot'
                },
                {
                    key: 'Grados',
                    value: loadedPlanificacion?.grados,
                    slotName: 'grado-slot',

                }]">
                    <template #estado-slot>
                        <UBadge size="lg" :label="loadedPlanificacion.estado" :variant="'outline'"
                            :ui="{ rounded: 'rounded-full', backgroundColor: '#111111' }"
                            :class="getColorsEstado(loadedPlanificacion.estado ?? '')" />
                    </template>
                    <template #grupo-slot>
                        <div class="w-auto flex flex-row items-center justify-start gap-2">
                            <UAvatar :src="formattedImageUrlGrupo(loadedPlanificacion?.grupo?.url_image)"
                                alt="Avatar" />
                            <span class="text-neutral-800 font-medium text-sm">{{ loadedPlanificacion?.grupo?.nombre
                                }}</span>
                        </div>
                    </template>
                    <template #rangoTiempos-slot>
                    <div class="flex items-center gap-2">
                        <UIcon name="i-heroicons-calendar" class="w-5 h-5" />
                        <span class="font-medium text-sm">{{ loadedPlanificacion?.fechaDesde }} - {{ loadedPlanificacion?.fechaHasta }}</span>
                    </div>
                </template>
                <template #grado-slot>
                    <div class="flex items-center gap-2">
                       <span class="font-medium text-neutral-700">{{  loadedPlanificacion?.grados?.map((grado) => grado?.nombre).join(", ")  }}</span>
                    </div>
                </template>
                </InfoRows>
            </div>

        </UDashboardPanel>

    </UDashboardPage>
</template>
