<script setup lang="ts">
import SecuenciaForm from "~/components/secuencias/SecuenciaForm.vue";
import type { Espacio } from "~/types/espacio";
import type { ListRequest } from "~/types/list-request";
import type { ListResponse } from "~/types/list-response";
import type { Secuencia } from "~/types/secuencia";
import type { UnidadCurricular } from "~/types/unidadCurricular";
import { HttpMethodEnum } from "~/utils/enums/HttpMethodEnum"
import { ModeEnum } from "~/utils/enums/ModeEnum";

let timeoutSearch: any = 0;

const defaultColumns = [
    {
        key: "nombre",
        label: "Nombre",
        sortable: true,
    },
    {
      key: 'grupo',
      label: 'Grupo'
    },

    {
      key: 'grados',
      label: 'Grados'
    },

    {
      key: 'espacio',
      label: 'Espacio'
    },

    {
      key: 'unidad-curricular',
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
const selectedGrupo = ref(null);
const selectedEspacio = ref<Espacio>(null);
const selectedUnidadCurricular = ref<UnidadCurricular>(null);

const unidadesCurriculares = computed<UnidadCurricular[]>(()=>{
    return selectedEspacio.value?.unidades_curriculares;
})
const filters = ref<{ search: string, grupo_id? : number, espacio_id?: number, unidad_curricular_id? : number }>(
    { 
        search : '',  
        espacio_id: null,
        grupo_id: null, 
        unidad_curricular_id: null,
    }
);

const toast = useToast();
const selectedColumns = ref(defaultColumns);

const { $apiRest } = useNuxtApp();

const input = ref<{ input: HTMLInputElement }>();

const secuencias = ref<Secuencia[]>([]);
const espacios = ref<Espacio[]>([]);

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


const { data: response, error, refresh } = await useAsyncData('secuencias', async () => {
  const [ secuencias, espacios ]= await  Promise.all([
      $apiRest<ListResponse<Secuencia[]>>(apiSecuenciasRoutes.getPaginate, HttpMethodEnum.POST, listReq.value),
      $apiRest<Espacio[]>(apiEspaciosRoutes.listAll, HttpMethodEnum.GET)
    ]);
  return { secuencias,  espacios };
});

secuencias.value = response.value.secuencias.list;
changeTotalRows(response.value.secuencias.totalCount);

espacios.value = response.value.espacios;

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
        selectedGrupo.value,
        selectedEspacio.value,
        selectedUnidadCurricular.value
    ],
    () => {
        filters.value.search = search.value;
        filters.value.grupo_id = selectedGrupo.value?.id
        filters.value.espacio_id = selectedEspacio.value?.id;
        filters.value.unidad_curricular_id = selectedUnidadCurricular.value?.id;

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
    selectedGrupo.value = null;
    onFilter();
}

const verSecuencia = async(row: Secuencia)=>{
    await navigateTo({
        path: appRoutes.secuenciaPage(row.slug)
    })
}

const onChangeEspacio = (espacio: Espacio) =>{
  selectedEspacio.value = espacio;
  selectedUnidadCurricular.value = null;
}

const onChangeUnidadCurricular = (unidadCurricular: UnidadCurricular)=>{
  selectedUnidadCurricular.value = unidadCurricular;
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

                       <div class="w-full flex gap-2">
                            <SelectGrupo v-model="selectedGrupo" 
                            class="flex-1 md:min-w-[350px]" ></SelectGrupo>
                        </div>

                        <div class="w-full flex gap-2">

                            <USelectMenu  :model-value="selectedEspacio" :options="espacios" option-attribute="id" class="flex-1  min-w-[350px]" @change="onChangeEspacio">
                                <template #label>
                                    <span v-if="selectedEspacio" :style="{ backgroundColor: selectedEspacio?.rgbColor }"
                                        :class="['inline-block h-2 w-2 flex-shrink-0 rounded-full']" aria-hidden="true" />

                                    <span class="truncate" v-if="selectedEspacio">{{ selectedEspacio?.nombre }}</span>
                                    <span v-else>Selecciona un espacio.</span>
                                </template>

                                <template #option="{ option: espacio }">
                                    <span :style="{ backgroundColor: espacio.rgbColor }"
                                        :class="['inline-block h-2 w-2 flex-shrink-0 rounded-full']" aria-hidden="true" />
                                    <span class="truncate">{{ espacio.nombre }}</span>
                                </template>
                            </USelectMenu>

                       </div>
                       <div class="w-full flex gap-2">
                            <USelectMenu :model-value="selectedUnidadCurricular" :options="unidadesCurriculares" option-attribute="id" class="flex-1  min-w-[350px]"
                        @change="onChangeUnidadCurricular">
                            <template #label>
                            <span v-if="selectedUnidadCurricular" :style="{ backgroundColor: selectedEspacio?.rgbColor }"
                                :class="['inline-block h-2 w-2 flex-shrink-0 rounded-full']" aria-hidden="true" />

                            <span class="truncate" v-if="selectedUnidadCurricular">{{ selectedUnidadCurricular?.nombre }}</span>
                                <span v-else> Selecciona una unidad curricular.</span>
                            </template>

                            <template #option="{ option:  unidadCurricular }">
                            <span :style="{ backgroundColor: selectedEspacio?.rgbColor }"
                                :class="['inline-block h-2 w-2 flex-shrink-0 rounded-full']" aria-hidden="true" />
                                <span class="truncate">{{ unidadCurricular?.nombre }}</span>
                            </template>
                            </USelectMenu>
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
                label: 'No hay secuencias creadas',
            }" no-results-text="Test" :rows="secuencias" :columns="columns"
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

                <template #espacio-data="{ row }">
                        <ul 
                        v-if="row.espacio">
                            <li><span :style="{ color: row.espacio.rgbColor }" class="mr-2">●</span>{{ row.espacio.nombre }}</li>
                        </ul>

                        <span v-else> Sin asignar</span>
                </template>

                <template #unidad-curricular-data="{ row }">
                     <ul 
                        v-if="row.unidad_curricular">
                            <li><span :style="{ color: row.espacio?.rgbColor }" class="mr-2">●</span>{{ row.unidad_curricular.nombre }}</li>
                    </ul>

                    <span v-else> Sin asignar</span>
                </template>

                <template #contenido-data="{ row }">
                    <ul 
                        v-if="row.contenido">
                            <li><span class="mr-2">●</span>{{ row.contenido.descripcion }}</li>
                    </ul>

                    <span v-else> Sin asignar</span>
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
                <SecuenciaForm  :espacios="espacios" @close="isSlideoverOpen = false" :mode="mode" :secuenciaSelected="secuenciaSelected"  @on:update="loadSecuencias"/>
          
          </UDashboardSlideover>
    </UDashboardPage>
</template>
