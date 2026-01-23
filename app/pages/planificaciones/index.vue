<script setup lang="ts">
import SelectStatus from "~/components/select/SelectStatus.vue";
import SelectGrupo from "~/components/select/SelectGrupo.vue";
import BadgeGrado from "~/components/badge/BadgeGrado.vue";
import PlanificacionesForm from "~/components/planificaciones/PlanificacionesForm.vue";
import type { ListRequest } from "~/types/list-request";
import type { ListResponse } from "~/types/list-response";
import type { Planificacion } from "~/types/planificacion";
import { HttpMethodEnum } from "~/utils/enums/HttpMethodEnum"
import { ModeEnum } from "~/utils/enums/ModeEnum";
import { PlanificacionEstadoEnum } from "~/utils/enums/PlanificacionEstado.enum";
import { apiPlanificacionesRoutes } from "~/utils/apiRoutes";
import { appRoutes } from "~/utils/appRoutes";
import { formattedImageUrlGrupo, getColorsEstado } from "~/utils/planificacion";

let timeoutSearch: any = 0;
const route = useRoute()


const defaultColumns = [
    {
        id: 'nombre',
        accessorKey: 'nombre',
        header: 'Nombre',
        key: "nombre",
        label: "Nombre",
        sortable: true,
    },
    {
        id: 'grupo',
        accessorKey: 'grupo',
        header: 'Grupo',
        key: "grupo",
        label: "Grupo",
    },
    
    {
        id: 'grados',
        accessorKey: 'grados',
        header: 'Grados',
        key: "grados",
        label: "Grados",
    },
    {
        id: 'estado',
        accessorKey: 'estado',
        header: 'Estado',
        key: "estado",
        label: "Estado",
    },
    {
        id: 'actions',
        accessorKey: 'actions',
        header: 'Acciones',
        key: 'actions',
        label: 'Acciones'
    }
];

const mode =  ref<ModeEnum>(ModeEnum.CREATE);
const planificacionSelected = ref<Planificacion | null>(null);

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

const planificaciones = ref<Planificacion[]>([]);

const columns = computed(() =>
    defaultColumns.filter((column) => selectedColumns.value.includes(column))
);

const titleModal = ref<string>('');

const { page, rowsPerPage, totalRows, changePage, changeTotalRows } = usePagination();


const isSlideoverOpen = ref(false);

const listReq = ref<ListRequest>({
    page: page.value,
    rowsPerPage: rowsPerPage.value,
    filters: filters.value
});

const { data: response, error } = await useAsyncData('planificaciones', async() => { 
     return await  $apiRest<ListResponse<Planificacion[]>>(apiPlanificacionesRoutes.getPaginate, HttpMethodEnum.POST, listReq.value);
});

if (error.value) {
    console.error('Error loading planificaciones:', error.value);
}

if (response.value) {
    planificaciones.value = response.value.list;
    changeTotalRows(response.value.totalCount);
}


const loadPlanificaciones = async () => {
    isLoading.value = true;
    try{
        const response = await $apiRest<ListResponse<Planificacion[]>>(apiPlanificacionesRoutes.getPaginate, HttpMethodEnum.POST , listReq.value);
        changeTotalRows(response.totalCount);
        planificaciones.value = response.list;  
        isLoading.value = false;

    }catch(message){
        toast.error({
            title: "Error",
            message: message,
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
            <UDashboardNavbar title="Planificaciones">

                 <template #trailing>
                    <UBadge :label="totalRows" variant="subtle" />
                </template>
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

                    <UButton label="Crear planificación" trailing-icon="i-heroicons-plus" color="primary"
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

    
            <UTable 
                empty="No hay planificaciones creadas."
                v-model:sort="sort" 
                :data="planificaciones" 
                :columns="columns"
                :loading="isLoading" 
                sort-mode="manual"
                 class="w-full">
                <template #nombre-cell="{ row }">
                    <span class="text-gray-900 dark:text-white font-medium">{{ row.original.nombre }}</span>

                </template>

                <template #grupo-cell="{ row }">
                    <div class="flex items-center gap-2">
                        <UAvatar :src="formattedImageUrlGrupo(row.original.grupo?.url_image)" size="2xs" />
                        <span>{{ row.original.grupo?.nombre }}</span>
                    </div>
                </template>

                <template #grados-cell="{ row }">
                    <div class="flex items-center gap-2">
                        <BadgeGrado v-for="(grado,idx) in row.original.grupo.grados" :key="idx" :grado="grado"></BadgeGrado>
                    </div>
                </template>

                <template #estado-cell="{ row }">
                    <UBadge :label="row.original.estado" :variant="'outline'" :color="(getColorsEstado(
                        row.original.estado ?? null
                    ) as any)" />
                </template>

                <template #actions-cell="{ row }">
                    <div class="flex flex-wrap items-center gap-2">
                        <UButton
                        icon="i-heroicons-pencil-square"
                        size="sm"
                        color="primary"
                        variant="outline"
                        @click="onSelect(row.original)"
                        />
                        <UButton
                        icon="tabler:eye"
                        size="sm"
                        color="primary"
                        variant="outline"
                        @click="verPlanificacion(row.original)"
                        />
                    </div>
                    
                    </template>
                
            </UTable>
            <div class="flex justify-end px-3 py-3.5 border-t border-gray-200 dark:border-gray-700">
                <UPagination v-model:page="page" :page-count="rowsPerPage" :total="totalRows" />
            </div>
        </UDashboardPanel>

        <USlideover v-model:open="isSlideoverOpen" :title="titleModal">
            <template #body>
                <PlanificacionesForm @close="isSlideoverOpen = false" :mode="mode" :planificacionSelected="planificacionSelected" @on:update="loadPlanificaciones"/>
            </template>
        </USlideover>
    </UDashboardPage>
</template>
