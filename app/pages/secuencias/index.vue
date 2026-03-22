<script setup lang="ts">
import SecuenciaForm from "~/components/secuencias/SecuenciaForm.vue";
import SelectGrupo from "~/components/select/SelectGrupo.vue";
import BadgeGrado from "~/components/badge/BadgeGrado.vue";
import type { Espacio } from "~/types/espacio";
import type { ListRequest } from "~/types/list-request";
import type { ListResponse } from "~/types/list-response";
import type { Secuencia } from "~/types/secuencia";
import type { UnidadCurricular } from "~/types/unidadCurricular";
import { HttpMethodEnum } from "~/utils/enums/HttpMethodEnum"
import { ModeEnum } from "~/utils/enums/ModeEnum";
import { apiSecuenciasRoutes, apiEspaciosRoutes } from "~/utils/apiRoutes";
import { appRoutes } from "~/utils/appRoutes";
import { formattedImageUrlGrupo } from "~/utils/planificacion";

let timeoutSearch: any = 0;

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
      id: 'espacio',
      accessorKey: 'espacio',
      header: 'Espacio',
      key: 'espacio',
      label: 'Espacio'
    },

    {
      id: 'unidad-curricular',
      accessorKey: 'unidad-curricular',
      header: 'Unidad curricular',
      key: 'unidad-curricular',
      label: 'Unidad curricular'
    },
    
    {
      id: 'contenido',
      accessorKey: 'contenido',
      header: 'Contenido',
      key: 'contenido',
      label: 'Contenido'
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
const secuenciaSelected = ref<Secuencia | null>(null);

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

const secuencias = ref<Secuencia[]>([]);
const espacios = ref<Espacio[]>([]);

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


const { data: response, error, refresh } = await useAsyncData('secuencias', async () => {
  const [ secuencias, espacios ]= await  Promise.all([
      $apiRest<ListResponse<Secuencia[]>>(apiSecuenciasRoutes.getPaginate, HttpMethodEnum.POST, listReq.value),
      $apiRest<Espacio[]>(apiEspaciosRoutes.listAll, HttpMethodEnum.GET)
    ]);
  return { secuencias,  espacios };
});

if (error.value) {
    console.error('Error loading secuencias:', error.value);
}

if (response.value) {
    secuencias.value = response.value.secuencias.list;
    changeTotalRows(response.value.secuencias.totalCount);
    espacios.value = response.value.espacios;
}

const loadSecuencias = async () => {
    isLoading.value = true;
    try{
        const response = await $apiRest<ListResponse<Secuencia[]>>(apiSecuenciasRoutes.getPaginate, HttpMethodEnum.POST , listReq.value);
        changeTotalRows(response.totalCount);
        secuencias.value = response.list;  
        isLoading.value = false;

    }catch(message){
        toast.error({
            title: "Error",
            message,
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
    selectedEspacio.value = null;
    selectedUnidadCurricular.value = null;
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

const descargarSecuencia = async (row: Secuencia) => {
    window.open(row.url, "_blank");
};

</script>

<template>
    <UDashboardPage>
        <UDashboardPanel grow>
            <UDashboardNavbar title="Secuencias">
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

                    <UButton label="Crear secuencia" trailing-icon="i-heroicons-plus" color="primary"
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

                            <USelectMenu  :model-value="selectedEspacio" :items="espacios" option-attribute="id" class="flex-1  min-w-[350px]" @update:model-value="onChangeEspacio">
                                <template #leading="{ modelValue, ui }">
                                    <span v-if="selectedEspacio" :style="{ backgroundColor: selectedEspacio?.rgbColor }"
                                    :class="['inline-block h-2 w-2 flex-shrink-0 rounded-full mr-2']" aria-hidden="true" />

                                    <span class="truncate" v-if="selectedEspacio">{{ selectedEspacio?.nombre }}</span>
                                    <span v-else>Selecciona un espacio.</span>
                                </template>

                                <template #item-leading="{ item }">
                                    <div class="flex items-center">
                                    <span :style="{ backgroundColor: item.rgbColor }"
                                        :class="['inline-block h-2 w-2 flex-shrink-0 rounded-full mr-2']" aria-hidden="true" />
                                    <span class="truncate">{{ item.nombre }}</span>
                                    </div>
                                </template>
                            </USelectMenu>

                       </div>
                       <div class="w-full flex gap-2">
                            <USelectMenu 
                            :model-value="selectedUnidadCurricular" 
                            :items="unidadesCurriculares" 
                            option-attribute="id" 
                            class="flex-1  min-w-[350px]"
                            @update:model-value="onChangeUnidadCurricular">
                               <template #leading="{ modelValue, ui }">
                                    <span v-if="selectedUnidadCurricular" :style="{ backgroundColor: selectedEspacio?.rgbColor }"
                                    :class="['inline-block h-2 w-2 flex-shrink-0 rounded-full mr-2']" aria-hidden="true" />

                                    <span class="truncate" v-if="selectedUnidadCurricular">{{ selectedUnidadCurricular?.nombre }}</span>
                                    <span v-else>Selecciona un espacio.</span>
                                </template>

                                <template #item-leading="{ item }">
                                    <div class="flex items-center">
                                    <span :style="{ backgroundColor: selectedEspacio?.rgbColor }"
                                        :class="['inline-block h-2 w-2 flex-shrink-0 rounded-full mr-2']" aria-hidden="true" />
                                    <span class="truncate">{{ item.nombre }}</span>
                                    </div>
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
            }" no-results-text="Test" 
                :data="secuencias" 
                :columns="columns"
                :loading="isLoading" sort-mode="manual" class="w-full"
                 empty="No hay secuencias creadas.">
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

                <template #espacio-cell="{ row }">
                        <ul 
                        v-if="row.original.espacio">
                            <li><span :style="{ color: row.original.espacio.rgbColor }" class="mr-2">●</span>{{ row.original.espacio.nombre }}</li>
                        </ul>

                        <span v-else> Sin asignar</span>
                </template>

                <template #unidad-curricular-cell="{ row }">
                     <ul 
                        v-if="row.original.unidad_curricular">
                            <li><span :style="{ color: row.original.espacio?.rgbColor }" class="mr-2">●</span>{{ row.original.unidad_curricular.nombre }}</li>
                    </ul>

                    <span v-else> Sin asignar</span>
                </template>

                <template #contenido-cell="{ row }">
                    <ul 
                        v-if="row.original.contenido">
                            <li><span class="mr-2">●</span>{{ row.original.contenido.descripcion }}</li>
                    </ul>

                    <span v-else> Sin asignar</span>
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
                        @click="verSecuencia(row.original)"
                        />

                         <UTooltip
                        text="La secuencia aún no ha sido generada. Para descargarla, primero debes ingresar a la secuencia y exportarla."
                        :disabled="row.original.url !== null"
                        >
                        <span>
                            <UButton
                            icon="tabler:book-download"
                            size="sm"
                            color="primary"
                            variant="outline"
                            :disabled="!row.original.url"
                            @click="descargarSecuencia(row.original)"
                            />
                        </span>
                        </UTooltip>
                    </div>
                    
                    </template>
                
            </UTable>
            <div class="flex justify-end px-3 py-3.5 border-t border-gray-200 dark:border-gray-700">
                <UPagination 
                v-model:page="page" 
                :items-per-page="rowsPerPage" 
                :total="totalRows" />
            </div>
        </UDashboardPanel>

        <USlideover v-model:open="isSlideoverOpen" :title="titleModal">
            <template #body>
                <SecuenciaForm  :espacios="espacios" @close="isSlideoverOpen = false" :mode="mode" :secuenciaSelected="secuenciaSelected"  @on:update="loadSecuencias"/>
            </template>
        </USlideover>
    </UDashboardPage>
</template>
