<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import type { Grupo } from '~/types/grupo'
import type { Grado } from '~/types/grado'
import { ModeEnum } from '~/utils/enums/ModeEnum'
import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum'
import { apiGrupoRoutes, apiGradoRoutes } from '~/utils/apiRoutes'
import type { ListResponse } from '~/types/list-response'
import GrupoCard from '~/components/grupos/GrupoCard.vue'

const { $apiRest } = useNuxtApp()
const toast = useToast()

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

// Carga inicial (SSR): grupos + grados en paralelo.
// El callback debe RETORNAR los datos; asignarlos como side-effect dentro del callback
// no se hidrata correctamente en el cliente (el cliente arranca con los refs vacíos).
const { data: initData, error } = await useAsyncData('grupos-init', async () => {
  const [gruposResponse, gradosResponse] = await Promise.all([
    $apiRest<ListResponse<Grupo[]>>(apiGrupoRoutes.getPaginate, HttpMethodEnum.POST, listReq.value),
    $apiRest<Grado[]>(apiGradoRoutes.listAll, HttpMethodEnum.GET)
  ])
  return { gruposResponse, gradosResponse }
})

if (error.value) {
  console.error('Error loading grupos:', error.value)
}

if (initData.value) {
  grupos.value = initData.value.gruposResponse.list || []
  changeTotalRows(initData.value.gruposResponse.totalCount || 0)
  grados.value = initData.value.gradosResponse || []
}

onMounted(() => {
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
  titleModal.value = 'Editar grupo'
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
  isSlideoverOpen.value = true
  mode.value = ModeEnum.CREATE
  titleModal.value = 'Nuevo grupo'
  grupoSelected.value = null
}
</script>

<template>
  <div class="min-h-full px-4 sm:px-8 py-6 sm:py-8">
    <div class="max-w-6xl mx-auto">
      <!-- Encabezado -->
      <header class="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 class="font-display text-4xl font-bold text-mona-900 leading-none">Mis grupos</h1>
          <p class="text-mona-800/75 mt-2">
            <template v-if="totalRows > 0">
              Tenés <strong class="text-mona-900">{{ totalRows }}</strong> {{ totalRows === 1 ? 'grupo' : 'grupos' }}.
              Flopi usa el grado de cada uno para buscar en el programa.
            </template>
            <template v-else>Acá van tus clases. Flopi las usa para saber con qué grado trabajás.</template>
          </p>
        </div>
        <button
          type="button"
          class="boton-miel inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-display text-lg font-semibold"
          @click="openSlideOverNuevoGrupo"
        >
          <UIcon name="i-tabler-plus" class="w-5 h-5" />
          Nuevo grupo
        </button>
      </header>

      <!-- Filtros -->
      <div class="flex flex-wrap items-center gap-3 mb-6 p-3 bg-white rounded-2xl border-2 border-mona-100">
        <UInput
          ref="input"
          v-model="filters.nombre"
          icon="i-tabler-search"
          autocomplete="off"
          placeholder="Buscar por nombre…"
          size="lg"
          class="flex-1 min-w-48"
          @input="onSearch"
          @keydown.esc="($event.target as HTMLInputElement).blur()"
        />
        <SelectYear v-model="filters.year" class="w-full sm:w-44" @update:model-value="loadGrupos" />
        <SelectGrado
          v-model="filters.grado"
          :grados="grados"
          :multiple="false"
          class="w-full sm:w-52"
          @update:model-value="loadGrupos"
        />
      </div>

      <!-- Cargando -->
      <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <USkeleton v-for="n in 6" :key="n" class="h-56 rounded-3xl" />
      </div>

      <!-- Sin grupos -->
      <div
        v-else-if="grupos.length === 0"
        class="flex flex-col items-center text-center bg-white border-2 border-dashed border-miel-300 rounded-3xl px-6 py-12"
      >
        <FlopiBee :size="110" />
        <h2 class="font-display text-2xl font-bold text-mona-900 mt-4">Todavía no hay grupos por acá</h2>
        <p class="text-mona-800/75 mt-1.5 max-w-sm">
          Creá tu primer grupo con su grado y ya podés pedirle a Flopi una planificación.
        </p>
        <button
          type="button"
          class="boton-miel inline-flex items-center gap-2 px-5 py-3 mt-6 rounded-2xl font-display text-lg font-semibold"
          @click="openSlideOverNuevoGrupo"
        >
          <UIcon name="i-tabler-plus" class="w-5 h-5" />
          Nuevo grupo
        </button>
      </div>

      <!-- Grupos -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <GrupoCard
          v-for="grupo in grupos"
          :key="grupo.id"
          :grupo="grupo"
          @editar="onSelect"
        />
      </div>

      <!-- Paginación -->
      <div v-if="totalRows > rowsPerPage" class="flex justify-center mt-8">
        <UPagination v-model:page="page" :items-per-page="rowsPerPage" :total="totalRows" />
      </div>
    </div>

    <!-- Formulario de grupo -->
    <USlideover v-model:open="isSlideoverOpen">
        <template #header>
          <div class="w-full flex items-center justify-between">
            <h2 class="font-display text-2xl font-bold text-mona-900">
              {{ titleModal }}
            </h2>

            <UButton color="neutral" variant="ghost" :icon="'tabler:x'" aria-label="Cerrar" @click="isSlideoverOpen = false"/>
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
  </div>
</template>
