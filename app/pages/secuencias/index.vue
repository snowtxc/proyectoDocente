<script setup lang="ts">
import SecuenciaForm from "~/components/secuencias/SecuenciaForm.vue";
import type { ListRequest } from "~/types/list-request";
import type { ListResponse } from "~/types/list-response";
import type { Secuencia } from "~/types/secuencia";
import { HttpMethodEnum } from "~/utils/enums/HttpMethodEnum"
import { ModeEnum } from "~/utils/enums/ModeEnum";

let timeoutSearch: any = 0;
const route = useRoute()

const defaultColumns = [
    {
        key: "nombre",
        label: "Nombre",
        sortable: true,
    },
    {
      key: 'unidad_curricular',
      label: 'Unidad curricular'
    },
    {
      key: 'contenido',
      label: 'Contenido'
    },
    {
        key: 'actions',
        label: 'Acciones'
    }
];

const mode =  ref<ModeEnum>(ModeEnum.CREATE);
const secuenciaSelected = ref<Secuencia>(null);

const isLoading = ref(false);

const search = ref("");


const filters = ref<{ search: string,espacio_id?: number, unidad_curricular_id? : number , contenido_id?: number }>(
    { 
    search : '',  
    espacio_id: null, 
    unidad_curricular_id: null,
    contenido_id : null
    }
);

const toast = useToast();
const selectedColumns = ref(defaultColumns);

const { $apiRest } = useNuxtApp();

const input = ref<{ input: HTMLInputElement }>();

const secuencias = ref<Secuencia[]>([]);

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

const { data: response, error } = await useAsyncData('secuencias', async() => { 
     return await  $apiRest<ListResponse<Secuencia[]>>(apiSecuenciasRoutes.getPaginate, HttpMethodEnum.POST, listReq.value);
});

secuencias.value = response.value.list;
changeTotalRows(response.value.totalCount);

const loadSecuencias = async () => {
    isLoading.value = true;
    try{
        const response = await $apiRest<ListResponse<Secuencia[]>>(apiSecuenciasRoutes.getPaginate, HttpMethodEnum.POST , listReq.value);
        changeTotalRows(response.totalCount);
        secuencias.value = response.list;  
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
    loadSecuencias();
};


watch(
    () => [
        search.value,
    ],
    () => {
        filters.value.search = search.value;
        clearTimeout(timeoutSearch);
        timeoutSearch = setTimeout(() => {
            onFilter();
        }, 400);
    }
);


watch(()=> page.value, ()=>{
  listReq.value.page = page.value;
  loadSecuencias();
});

function onSelect(row: Secuencia) {
  titleModal.value = "Editar Secuencia";
  mode.value = ModeEnum.UPDATE;
  secuenciaSelected.value =  row;
  isSlideoverOpen.value = true;
}

const onCreateSecuencia = ()=>{
    isSlideoverOpen.value = true;
    mode.value = ModeEnum.CREATE;
    titleModal.value = "Nueva Secuencia";
}

const clearFilters = ()=>{
    // selectedStatus.value = null;
    // selectedGrupo.value = null;
    onFilter();
}

const verSecuencia = async(row: Secuencia)=>{
    await navigateTo({
        path: appRoutes.secuenciaPage(row.slug)
    })
}

</script>

<template>
    <UDashboardPage>
        <UDashboardPanel grow>
            <UDashboardNavbar title="Secuencias" :badge="secuencias.length">
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

                    <UButton label="Crear secuencia" trailing-icon="i-heroicons-plus" color="gray"
                        @click="onCreateSecuencia" />
                </template>
            </UDashboardNavbar>

            <UDashboardToolbar>
                <template #default>
                    <div class="w-auto flex md:flex-row flex-col items-center justify-start gap-4">
                        <!-- <div class="w-full flex gap-2">
                            <SelectStatus v-model="selectedStatus" @update:modelValue="() => null" :multiple="false"
                                class="flex-1 md:w-[200px]" />
                        </div>

                        <div class="w-full flex gap-2">
                            <SelectGrupo v-model="selectedGrupo" 
                            class="flex-1 md:min-w-[350px]" ></SelectGrupo>
                        </div> -->
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
                label: 'No hay secuencias creadas',
            }" no-results-text="Test" :rows="secuencias" :columns="columns"
                :loading="isLoading" sort-mode="manual" class="w-full"
                :ui="{ divide: 'divide-gray-200 dark:divide-gray-800' }">
                <template #nombre-data="{ row }">
                      <span class="text-gray-900 dark:text-white font-medium">{{ row.nombre }}</span>
                </template>

                <template #unidad-curricular-data="{ row }">
                    <div class="flex items-center gap-2">
                        <span>Probandoo..</span>
                    </div>
                </template>

                <template #contenido-data="{ row }">
                    <div class="flex items-center gap-2">
                      Probandooo
                        <!-- <BadgeGrado v-for="(grado,idx) in row.grupo.grados" :key="idx" :grado="grado"></BadgeGrado> -->
                    </div>
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
                        @click="verSecuencia(row)"
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
                <SecuenciaForm @close="isSlideoverOpen = false" :mode="mode"  @on:update="loadSecuencias"/>
          
          </UDashboardSlideover>
    </UDashboardPage>
</template>
