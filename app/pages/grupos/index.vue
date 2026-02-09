<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import type { Grupo } from '~/types/grupo'
import type { Grado } from '~/types/grado'
import { ModeEnum } from '~/utils/enums/ModeEnum'
import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum'
import { apiGrupoRoutes, apiGradoRoutes } from '~/utils/apiRoutes'
import type { ListResponse } from '~/types/list-response'

const { $apiRest } = useNuxtApp()
const toast = useToast()
const router = useRouter()

// Paginación
const page = ref(1)
const rowsPerPage = ref(10)
const totalRows = ref(0)

const changePage = (newPage: number) => {
  page.value = newPage
}

const changeTotalRows = (count: number) => {
  totalRows.value = count
}

// Filtros
const filters = ref({
  nombre: '',
  year: null as number | null,
  grado: null as Grado | null,
})
const searchTimeOut = ref<NodeJS.Timeout | null>(null)

// Columnas de la tabla
const defaultColumns = [
  {
    id: 'nombre',
    accessorKey: 'nombre',
    header: 'Nombre',
    key: 'nombre',
    label: 'Nombre',
    sortable: true,
  },
  {  
    id: 'grados',
    key: 'grados',
    accessorKey: 'Grados',
    header: 'Grados',
    label: 'Grados',
  },
  {
    id: 'year',
    key: 'year',
    label: 'Año Escolar',
    accessorKey: 'Año Escolar',
    sortable: true,
  },
  {
    accessorKey: 'Acciones',
    id: 'actions',
    key: 'actions',
    label: 'Acciones',
  },
]

const selectedColumns = ref(defaultColumns.map(col => col.key))
const columns = computed(() => {
  return defaultColumns.filter(column => 
    selectedColumns.value.includes(column.key)
  )
})

// Estados del modal
const isSlideoverOpen = ref(false)
const mode = ref<ModeEnum | null>(null)
const grupoSelected = ref<Grupo | null>(null)
const titleModal = ref<string>('')

// Datos
const grupos = ref<Grupo[]>([])
const grados = ref<Grado[]>([])
const isLoading = ref(false)
const input = ref<HTMLInputElement>()

// Helper para tipar las filas
const asGrupo = (row: unknown): Grupo => {
  return row as Grupo
}

// Request para la API
const listReq = computed(() => ({
  page: page.value,
  rowsPerPage: rowsPerPage.value,
  filters: {
    nombre: filters.value.nombre,
    year: filters.value.year || undefined,
    grado: filters.value.grado?.id || undefined,
  },
}))

// Cargar datos iniciales
const loadGrupos = async () => {
  isLoading.value = true
  try {
    const listResponse = await $apiRest<ListResponse<Grupo[]>>(
      apiGrupoRoutes.getPaginate,
      HttpMethodEnum.POST,
      listReq.value
    )
    grupos.value = listResponse.list || []
    changeTotalRows(listResponse.totalCount || 0)
  } catch (error: any) {
    console.error('Error loading grupos:', error)
    toast.error({
      message: error.message || 'Error cargando grupos',
      color: 'red',
    })
  } finally {
    isLoading.value = false
  }
}

// Cargar grados
const loadGrados = async () => {
  try {
    const gradosList = await $apiRest<Grado[]>(
      apiGradoRoutes.listAll, 
      HttpMethodEnum.GET
    )
    grados.value = gradosList || []
  } catch (error: any) {
    console.error('Error loading grados:', error)
    toast.error({
      message: error.message || 'Error cargando grados',
      color: 'red',
    })
  }
}

const { data: response, error } = await useAsyncData('grupos', async() => { 
     return await  $apiRest<ListResponse<Grupo[]>>(apiGrupoRoutes.getPaginate, HttpMethodEnum.POST, listReq.value);
});

if (error.value) {
    console.error('Error loading grupos:', error.value);
}

if (response.value) {
    grupos.value = response.value.list;
    console.log(grupos.value);
    changeTotalRows(response.value.totalCount);
}

// Cargar datos iniciales
onMounted(async () => {
  await Promise.all([loadGrados()])
  
  // Shortcut para buscar
  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === '/' && input.value) {
      event.preventDefault()
      input.value.focus()
    }
  }
  
  window.addEventListener('keydown', handleKeyPress)
  onUnmounted(() => window.removeEventListener('keydown', handleKeyPress))
})

// Watchers
watch(
  () => page.value,
  () => {
    loadGrupos()
  }
)

watch(
  () => [filters.value.year, filters.value.grado],
  () => {
    changePage(1)
    loadGrupos()
  },
  { deep: true }
)

function onSelect(row: Grupo) {
  titleModal.value = 'Editar Grupo'
  mode.value = ModeEnum.UPDATE
  grupoSelected.value = { ...row }
  isSlideoverOpen.value = true
}

const onSearch = () => {
  if (searchTimeOut.value) {
    clearTimeout(searchTimeOut.value)
  }
  searchTimeOut.value = setTimeout(() => {
    changePage(1)
    loadGrupos()
  }, 400)
}

const openSlideOverNuevoGrupo = () => {
  console.log('Abrir slideover') // Para debug
  isSlideoverOpen.value = true
  mode.value = ModeEnum.CREATE
  titleModal.value = 'Nuevo Grupo'
  grupoSelected.value = null
}

const verPlanificaciones = async (row: Grupo) => {
  await router.push({
    path: '/planificaciones',
    query: {
      grupoId: row.id,
      grupoNombre: row.nombre,
    },
  })
}
</script>

<template>
  <UDasboardPage>
     <UDashboardPanel grow>
            <UDashboardNavbar title="Grupos">

                 <template #trailing>
                    <UBadge :label="totalRows" variant="subtle" />
                </template>

                <template #right>
                    <UInput
          ref="input"
          v-model="filters.nombre"
          icon="i-heroicons-funnel"
          autocomplete="off"
          placeholder="Filtrar Grupos..."
          class="hidden lg:block"
          @input="onSearch"
          @keydown.esc="($event.target as HTMLInputElement).blur()"
        />

                  <UButton
          label="Nuevo Grupo"
          trailing-icon="i-heroicons-plus"
          color="primary"
          @click="openSlideOverNuevoGrupo"
        />
                </template>
            </UDashboardNavbar>

            <UDashboardToolbar>
                <template #default>
                  <!-- Toolbar / Filters -->
                  <div class="w-full border-b border-gray-200 dark:border-gray-700 px-4 py-4 flex gap-3 items-center flex-wrap">
                    <SelectYear 
                      v-model="filters.year" 
                      class="flex-1 max-w-72" 
                      @update:model-value="loadGrupos" 
                    />

                    <SelectGrado
                      v-model="filters.grado"
                      :grados="grados"
                      :multiple="false"
                      class="flex-1 max-w-72"
                      @update:model-value="loadGrupos"
                    />

                    <USelectMenu
                      v-model="selectedColumns"
                      icon="i-heroicons-adjustments-horizontal-solid"
                      :options="defaultColumns.map(col => ({ 
                        value: col.key, 
                        label: col.label 
                      }))"
                      multiple
                      class="hidden lg:block"
                    >
                    </USelectMenu>
                  </div>
                </template>
            </UDashboardToolbar>

      <UTable
        :data="grupos"
        :columns="columns"
        :loading="isLoading"
        class="w-full"
        empty="No se encontró ningún grupo."
      >
        <!-- USAR el helper asGrupo() o cast directo -->
        <template #nombre-cell="{ row }">
          <div class="flex items-center gap-3">
            <UAvatar 
              :src="row.original.url_image" 
              :alt="row.original.nombre" 
              size="xs" 
            />
            <span class="text-gray-900 dark:text-white font-medium">
              {{ row.original.nombre }}
            </span>
          </div>
        </template>

        <template #grados-cell="{ row }">
            <BadgeGrado 
              v-for="grado in asGrupo(row.original).grados" 
              :key="grado.id" 
              :grado="grado" 
            />
        </template>

         <template #year-cell="{ row }">
          <span>
             {{  row.original.year }}
          </span>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex flex-wrap items-center gap-2">
            <UButton
              icon="i-heroicons-pencil-square"
              size="sm"
              color="primary"
              variant="outline"
              @click="onSelect(asGrupo(row.original))"
              title="Editar grupo"
            />
            <UButton
              icon="i-tabler-calendar-event"
              size="sm"
              color="primary"
              variant="outline"
              @click="verPlanificaciones(asGrupo(row.original))"
              title="Ver planificaciones"
            />
          </div>
        </template>
      </UTable>

    <!-- Pagination -->
    <div 
      class="flex justify-end px-4 py-3 border-t border-gray-200 dark:border-gray-700"
    >
      <UPagination 
        v-model:page="page" 
        :items-per-page="rowsPerPage"
        :total="totalRows" 
      />
    </div>
      </UDashboardPanel>
  
    <!-- Slideover / Modal -->
    <USlideover v-model:open="isSlideoverOpen">

        <template #header>
          <div class="w-full flex items-center justify-between">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
              {{ titleModal }}
            </h2>

            <UButton color="primary" variant="subtle" :icon="'tabler:x'"  @click="isSlideoverOpen = false"/>
          </div>
        </template>
        
        <template #body>
          
           <GruposForm
            v-if="isSlideoverOpen"
            :mode="mode"
            :grupo-selected="grupoSelected"
            @close="isSlideoverOpen = false"
            @on:update="loadGrupos"
          />
        </template>
            
    </USlideover>
  </UDasboardPage>
 
</template>