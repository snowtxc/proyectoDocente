<script setup lang="ts">
import SelectStatus from "~/components/select/SelectStatus.vue";
import type { ListRequest } from "~/types/list-request";
import type { ListResponse } from "~/types/list-response";
import type { Planificacion } from "~/types/planificacion";
import { HttpMethodEnum } from "~/utils/enums/HttpMethodEnum"
import { ModeEnum } from "~/utils/enums/ModeEnum";
import { PlanificacionEstadoEnum } from "~/utils/enums/PlanificacionEstado.enum";

let timeoutSearch: any = 0;
const route = useRoute()


const defaultColumns = [
    {
        key: "nombre",
        label: "Nombre",
        sortable: true,
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
    {
        key: 'actions',
        label: 'Acciones'
    }
];

const mode =  ref<ModeEnum>(ModeEnum.CREATE);
const planificacionSelected = ref<Planificacion>(null);

const isLoading = ref(false);

const search = ref("");

const selectedStatus = ref(PlanificacionEstadoEnum.EN_CURSO);

const defaultGrupoSelected: any = route.query?.grupoId ?  {
    id: route.query?.grupoId,
    nombre: route.query.grupoNombre,
} : null;

const selectedGrupo = ref(defaultGrupoSelected);

const filters = ref<{query?: string, estado?: string , search : string, grupo_id?:number }>(
    { query: undefined, 
     estado: selectedStatus.value, 
     search : '',
     grupo_id : defaultGrupoSelected?.id
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

const listReq = ref<ListRequest>({
    page: page.value,
    rowsPerPage: rowsPerPage.value,
    filters: filters.value
});

const { data: response, error } = await useAsyncData('planificaciones', async() => { 
     return await  $apiRest<ListResponse<Planificacion[]>>(apiPlanificacionesRoutes.getPaginate, HttpMethodEnum.POST, listReq.value);
});

planificaciones.value = response.value.list;
changeTotalRows(response.value.totalCount);


const loadPlanificaciones = async () => {
    isLoading.value = true;
    try{
        const response = await $apiRest<ListResponse<Planificacion[]>>(apiPlanificacionesRoutes.getPaginate, HttpMethodEnum.POST , listReq.value);
        changeTotalRows(response.totalCount);
        planificaciones.value = response.list;  
        isLoading.value = false;

    }catch(message){
        toast.add({
            title: "Error",
            description: message,
            color: "red"
        });
        isLoading.value = false;
    }
};

const onFilter = () => {
    changePage(1);
    loadPlanificaciones();
};


watch(
    () => [
        selectedStatus.value,  
        search.value,
        selectedGrupo.value 
    ],
    () => {
        filters.value.search = search.value;
        filters.value.estado = selectedStatus.value;
        filters.value.grupo_id = selectedGrupo.value?.id

        clearTimeout(timeoutSearch);
        timeoutSearch = setTimeout(() => {
            onFilter();
        }, 400);
    }
);


watch(()=> page.value, ()=>{
  listReq.value.page = page.value;
  loadPlanificaciones();
});

function onSelect(row: Planificacion) {
  titleModal.value = "Editar Planificación";
  mode.value = ModeEnum.UPDATE;
  planificacionSelected.value =  row;
  isSlideoverOpen.value = true;
}

const onCreatePlanificacion = ()=>{
    isSlideoverOpen.value = true;
    mode.value = ModeEnum.CREATE;
    titleModal.value = "Nueva Planificación";
}

const clearFilters = ()=>{
    selectedStatus.value = null;
    selectedGrupo.value = null;
    onFilter();
}

const verPlanificacion = async(row: Planificacion)=>{
    await navigateTo({
        path: appRoutes.planificacionPage(row.slug)
    })
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

                        <div class="w-full flex gap-2">
                            <SelectGrupo v-model="selectedGrupo" 
                            class="flex-1 md:min-w-[350px]" ></SelectGrupo>
                        </div>
                        <UButton
                            icon="tabler:filter-x"
                            size="sm"
                            color="primary"
                            variant="outline"
                            @click="clearFilters"
                            />
                    </div>
                </template>
            </UDashboardToolbar>

    
            <UTable :empty-state="{
                icon: 'i-heroicons-circle-stack-20-solid',
                label: 'No hay planificaciones creadas',
            }" no-results-text="Test" v-model:sort="sort" :rows="planificaciones" :columns="columns"
                :loading="isLoading" sort-mode="manual" class="w-full"
                :ui="{ divide: 'divide-gray-200 dark:divide-gray-800' }">
                <template #nombre-data="{ row }">
                                <span class="text-gray-900 dark:text-white font-medium">{{ row.nombre }}</span>

                </template>

                <template #grupo-data="{ row }">
                    <div class="flex items-center gap-2">
                        <UAvatar :src="formattedImageUrlGrupo(row.grupo?.url_image)" size="2xs" />
                        <span>{{ row.grupo?.nombre }}</span>
                    </div>
                </template>

                <template #grados-data="{ row }">
                    <div class="flex items-center gap-2">
                        <BadgeGrado v-for="(grado,idx) in row.grupo.grados" :key="idx" :grado="grado"></BadgeGrado>
                    </div>
                </template>

                <template #estado-data="{ row }">
                    <UBadge :label="row.estado" :variant="'outline'" :color="(getColorsEstado(
                        row.estado ?? ''
                    ) as any)" />
                </template>

                <template #actions-data="{ row }">
                    <div class="flex flex-wrap items-center gap-2">
                        <UButton
                        icon="i-heroicons-pencil-square"
                        size="sm"
                        color="primary"
                        variant="outline"
                        @click="onSelect(row)"
                        />
                        <UButton
                        icon="tabler:eye"
                        size="sm"
                        color="primary"
                        variant="outline"
                        @click="verPlanificacion(row)"
                        />
                    </div>
                    
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
