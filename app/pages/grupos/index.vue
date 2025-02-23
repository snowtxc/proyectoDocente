<script setup lang="ts">
import type { Grupo } from '~/types/grupo';
import { ModeEnum } from '~/utils/enums/ModeEnum';
import type { ListRequest } from '~/types/list-request';
import type { Grado } from '~/types/grado';
import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum';
import { apiGrupoRoutes } from '~/utils/apiRoutes';

const {  $apiRest  } = useNuxtApp();
const  { page, rowsPerPage, totalRows,changePage, changeTotalRows  }  = usePagination();

const grupos = ref<Grupo[]>([]);
const filters  =  ref<{ nombre: string, year?: number , grado?: Grado}>({ nombre: '', year: null, grado: null })
const searchTimeOut = ref(null);

const defaultColumns = [
  {
  key: 'nombre',
  label: 'Nombre',
  sortable: true
}, {
  key: 'grados',
  label: 'Grados',
}, {
  key: 'year',
  label: 'Año Escolar',
  sortable: true

}]

const isSlideoverOpen = ref(false);
const mode =  ref<ModeEnum>(null);
const grupoSelected = ref<Grupo>(null);
const titleModal = ref<string>('');

const selectedColumns = ref(defaultColumns)
const sort = ref({ column: 'id', direction: 'asc' as const })
const input = ref<{ input: HTMLInputElement }>()

const columns = computed(() => defaultColumns.filter(column => selectedColumns.value.includes(column)))

const isLoading = ref(false);

onMounted(async()=>{
  loadGrupos();
})

const loadGrupos = async()=>{
  isLoading.value = true;
  const listReq: ListRequest = {
    page: page.value,
    rowsPerPage: rowsPerPage.value,
    filters: filters.value
  }
  const listResponse  = await $apiRest(apiGrupoRoutes.getPaginate, HttpMethodEnum.POST, listReq);
  isLoading.value = false;
  grupos.value = listResponse.list;
  changeTotalRows(listResponse.totalCount);  
}

function onSelect(row: Grupo) {
  titleModal.value = "Editar Grupo";
  mode.value = ModeEnum.UPDATE;
  grupoSelected.value =  row;
  isSlideoverOpen.value = true;
}

defineShortcuts({
  '/': () => {
    input.value?.input?.focus()
  }
})

const handleUpdateSliderOver = (isOpen)=>{
   isSlideoverOpen.value = isOpen;
}

const openSlideOverNuevoGrupo = ()=>{
  isSlideoverOpen.value = true; 
  mode.value = ModeEnum.CREATE; 
  titleModal.value = 'Nuevo Grupo'
}

watch(()=> page.value, ()=>{
  loadGrupos();
})

const onFilter = ()=>{
  changePage(1);
  loadGrupos();
}

const onSearch = ()=>{
  if(searchTimeOut.value){
    clearTimeout(searchTimeOut.value);
  }
  searchTimeOut.value = setTimeout(()=>{
      onFilter();
  },400);
}

</script>

<template>
  <UDashboardPage>
    <UDashboardPanel grow>
      <UDashboardNavbar
        title="Grupos"
        :badge="totalRows"
      >
        <template #right>
          <UInput
            ref="input"
            v-model="filters.nombre"
            icon="i-heroicons-funnel"
            autocomplete="off"
            placeholder="Filtrar Grupos..."
            class="hidden lg:block"
            @input="onSearch"
            @keydown.esc="$event.target.blur()"
          >
            <template #trailing>
              <UKbd value="/" />
            </template>
          </UInput>

          <UButton
            label="Nuevo Grupo"
            trailing-icon="i-heroicons-plus"
            color="gray"
            @click="openSlideOverNuevoGrupo"
          />
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #default>
          <div class="w-full flex gap-2">
            <SelectYear v-model="filters.year" class="flex-1 max-w-72" @update:modelValue="onFilter"> </SelectYear>
        
            <SelectGrado
              v-model="filters.grado"
              @update:modelValue="onFilter"
              :multiple="false"
              class="w-full flex-1 max-w-72"
            />
          </div>
          
        </template>

        <template #header>
          <USelectMenu
            v-model="selectedColumns"
            icon="i-heroicons-adjustments-horizontal-solid"
            :options="defaultColumns"
            multiple
            class="hidden lg:block"
          >
            <template #label>
              Display
            </template>
          </USelectMenu>
        </template>
      </UDashboardToolbar>

      <UTable
        v-model:sort="sort"
        :rows="grupos"
        :columns="columns"
        :loading="isLoading"
        sort-mode="manual"
        class="w-full"
        :ui="{ divide: 'divide-gray-200 dark:divide-gray-800' }"
        :empty-state="{icon: 'tabler:butterfly-filled',label: 'No se encontró ningún grupo'}"
        @select="onSelect"
      >
        <template #nombre-data="{ row }">
          <div class="flex items-center gap-3">
            <UAvatar
              :src="row.url_image"
              :alt="row.nombre"
              size="xs"
            />
            <span class="text-gray-900 dark:text-white font-medium">{{ row.nombre }}</span>
          </div>
        </template>

        <template #grados-data="{ row }">
          <div class="flex flex-wrap items-center gap-2">
            <BadgeGrado
            v-for="grado in row.grados"
            :key="grado.id"
            :grado="grado">
          </BadgeGrado>
          </div>
          
        </template>
      </UTable>
      <div class="flex justify-end px-3 py-3.5 border-t border-gray-200 dark:border-gray-700">
        <UPagination v-model="page" :page-count="rowsPerPage" :total="totalRows" />
      </div>
    </UDashboardPanel>

    <!-- Slide over con formulario de grupo -->
    <UDashboardSlideover v-model="isSlideoverOpen" @update:modelValue="handleUpdateSliderOver">
      <template #title>
         {{ titleModal }}
      </template>
      <GruposForm @close="isSlideoverOpen = false" :mode="mode" :grupoSelected="grupoSelected" @on:update="loadGrupos"/>
    </UDashboardSlideover>
  </UDashboardPage>
</template>
