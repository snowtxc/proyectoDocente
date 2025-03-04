<script setup lang="ts">
import { format,parseISO } from "date-fns";
import SelectStatus from "~/components/select/SelectStatus.vue";
import type { ListRequest } from "~/types/list-request";
import type { ListResponse } from "~/types/list-response";
import type { Planificacion } from "~/types/planificacion";
import { HttpMethodEnum } from "~/utils/enums/HttpMethodEnum"
import { ModeEnum } from "~/utils/enums/ModeEnum";
import { PlanificacionEstadoEnum } from "~/utils/enums/PlanificacionEstado.enum";


let timeoutSearch: any = 0;

const defaultColumns = [
    {
        key: "nombre",
        label: "Nombre",
        sortable: true,
    },
    {
        key: "rangoTiempos",
        label: "Fechas",
    },
    {
        key: "grupo",
        label: "Grupo",
    },
    {
        key: "grados",
        label: "Grados",
    },
    {
        key: "estado",
        label: "Estado",
    },
];

const mode =  ref<ModeEnum>(ModeEnum.CREATE);
const planificacionSelected = ref<Planificacion>(null);

const isLoading = ref(false);

const search = ref("");

const today = new Date();

const defaultRangeDate = ref<{ start: Date, end: Date }>({ start:  new Date(today.getFullYear(), 0, 1) , end: new Date(today.getFullYear(), 11, 31) });
const selectedStatus = ref(PlanificacionEstadoEnum.EN_CURSO);

const filters = ref<{query?: string, estado?: string, rangeDates: { fechaDesde?: string, fechaHasta?: string } , search : string }>(
    { query: undefined, 
     estado: selectedStatus.value, 
     rangeDates: { fechaDesde: format(defaultRangeDate.value.start, 'yyyy-MM-dd'), fechaHasta: format(defaultRangeDate.value.end, 'yyyy-MM-dd')},
     search : ''
    }
);

const toast = useToast();
const selectedColumns = ref(defaultColumns);

const { $apiRest } = useNuxtApp();

const sort = ref({ column: "id", direction: "asc" as const });
const input = ref<{ input: HTMLInputElement }>();

const planificaciones = ref<Planificacion[]>([]);

const columns = computed(() =>
    defaultColumns.filter((column) => selectedColumns.value.includes(column))
);

const titleModal = ref<string>('');

const { page, rowsPerPage, totalRows, changePage, changeTotalRows } = usePagination();


const isSlideoverOpen = ref(false);

const handleUpdateSliderOver = (isOpen)=>{
   isSlideoverOpen.value = isOpen;
}

const loadPlanificaciones = async () => {

    const listReq: ListRequest = {
        page: page.value,
        rowsPerPage: rowsPerPage.value,
        filters: filters.value
    }

    try{
        const response = await $apiRest<ListResponse<Planificacion[]>>(apiPlanificacionesRoutes.getPaginate, HttpMethodEnum.POST , listReq);
        changeTotalRows(response.totalCount);
        planificaciones.value = response.list;  

    }catch(message){
        toast.add({
            title: "Error",
            description: message,
            color: "red"
        });
    }
};

const onFilter = () => {
    changePage(1);
    loadPlanificaciones();
};


watch(
    () => [
        defaultRangeDate.value,  
        selectedStatus.value,  
        search.value
    ],
    () => {
        filters.value.search = search.value;
        filters.value.estado = selectedStatus.value;
        filters.value.rangeDates.fechaDesde =  format(defaultRangeDate.value.start, 'yyyy-MM-dd');
        filters.value.rangeDates.fechaHasta =  format(defaultRangeDate.value.end, 'yyyy-MM-dd');

        clearTimeout(timeoutSearch);
        timeoutSearch = setTimeout(() => {
            onFilter();
        }, 400);
    }
);

onMounted(async () => {
    loadPlanificaciones();
});

watch(()=> page.value, ()=>{
  loadPlanificaciones();
});

function onSelect(row: Planificacion) {
  titleModal.value = "Editar Planificación";
  mode.value = ModeEnum.UPDATE;
  planificacionSelected.value =  row;
  isSlideoverOpen.value = true;
}

defineShortcuts({
    "/": () => {
        input.value?.input?.focus();
    },
});


const onCreatePlanificacion = ()=>{
    isSlideoverOpen.value = true;
    mode.value = ModeEnum.CREATE;
    titleModal.value = "Nueva Planificación";
}

</script>

<template>
    <UDashboardPage>
        <UDashboardPanel grow>
            <UDashboardNavbar title="Planificaciones" :badge="planificaciones.length">
                <template #right>
                    <UInput 
                        ref="input" 
                        v-model="search" 
                        icon="i-heroicons-funnel" autocomplete="off"
                        placeholder="Buscar..." class="hidden lg:block"
                        @keydown.esc="$event.target.blur()">
                        <template #trailing>
                            <UKbd value="/" />
                        </template>
                    </UInput>

                    <UButton label="Crear planificación" trailing-icon="i-heroicons-plus" color="gray"
                        @click="onCreatePlanificacion" />
                </template>
            </UDashboardNavbar>

            <UDashboardToolbar>
                <template #default>
                    <div class="w-auto flex md:flex-row flex-col items-center justify-start gap-4">
                        <div class="w-full flex gap-2">
                            <SelectStatus v-model="selectedStatus" @update:modelValue="() => null" :multiple="false"
                                class="flex-1 md:w-[200px]" />
                        </div>

                        <PickerDateRange v-model="defaultRangeDate"></PickerDateRange>
                    </div>
                </template>

                <template #right>
                    <USelectMenu v-model="selectedColumns" icon="i-heroicons-adjustments-horizontal-solid"
                        :options="defaultColumns" multiple class="hidden lg:block">
                        <template #label> Mostrar columnas </template>
                    </USelectMenu>
                </template>
            </UDashboardToolbar>

    
            <UTable :empty-state="{
                icon: 'i-heroicons-circle-stack-20-solid',
                label: 'No hay planificaciones creadas',
            }" no-results-text="Test" v-model:sort="sort" :rows="planificaciones" :columns="columns"
                :loading="isLoading" sort-mode="manual" class="w-full"
                :ui="{ divide: 'divide-gray-200 dark:divide-gray-800' }"
                 @select="onSelect">
                <template #nombre-data="{ row }">
                    <ULink :to="appRoutes.planificacionPage(row.slug)" active-class=""
                        class="text-green-500 underline dark:text-green-400 hover:text-green-700 dark:hover:text-green-200">
                        {{ row?.nombre }}
                    </ULink>
                </template>

                <template #rangoTiempos-data="{ row }">
                    <div class="flex items-center gap-2">
                        <UIcon name="i-heroicons-calendar" class="w-5 h-5" />
                        <span>{{ format(parseISO(row?.fechaDesde), 'dd/MM/yyyy') }} - {{ format(parseISO(row?.fechaHasta), 'dd/MM/yyyy') }}</span>
                    </div>
                </template>

                <template #grupo-data="{ row }">
                    <div class="flex items-center gap-2">
                        <UAvatar :src="formattedImageUrlGrupo(row.grupo?.url_image)" size="2xs" />
                        <span>{{ row.grupo?.nombre }}</span>
                    </div>
                </template>

                <template #grados-data="{ row }">
                    <div class="flex items-center gap-2">
                        <span>{{
                            row.grupo.grados.map((grado) => grado?.nombre)?.join(", ")
                        }}</span>
                    </div>
                </template>

                <template #estado-data="{ row }">
                    <UBadge :label="row.estado" :variant="'outline'" :color="(getColorsEstado(
                        row.estado ?? ''
                    ) as any)" />
                </template>
                
            </UTable>
            <div class="flex justify-end px-3 py-3.5 border-t border-gray-200 dark:border-gray-700">
                <UPagination v-model="page" :page-count="rowsPerPage" :total="totalRows" />
            </div>
        </UDashboardPanel>

        <UDashboardSlideover v-model="isSlideoverOpen" @update:modelValue="handleUpdateSliderOver">
            <template #title>
               {{ titleModal }}
            </template>
            <PlanificacionesForm @close="isSlideoverOpen = false" :mode="mode" :planificacionSelected="planificacionSelected" @on:update="loadPlanificaciones"/>
          </UDashboardSlideover>
    </UDashboardPage>
</template>
