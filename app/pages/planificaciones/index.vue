<script setup lang="ts">
import SelectStatus from "~/components/select/SelectStatus.vue";
import { usePlanificacionService } from "~/services/planificacionService/planificacionService";
import type { PlanificacionList } from "~/types/index";
import { EstadoType } from "~/types/index";
import type { ListRequest } from "~/types/list-request";

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
        key: "tramosCount",
        label: "Tramos",
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

const selected = ref<PlanificacionList[]>([]);
const selectedColumns = ref(defaultColumns);
const openAddModal = ref(false);
const sort = ref({ column: "id", direction: "asc" as const });
const input = ref<{ input: HTMLInputElement }>();
const planificacionesStore = usePlanificacionService();
const { getPlanificaciones, paginationFilters } = planificacionesStore;
const columns = computed(() =>
    defaultColumns.filter((column) => selectedColumns.value.includes(column))
);
const planificaciones = computed(() => planificacionesStore.planificaciones);
const loadingPlanificaciones = computed(() => planificacionesStore.loading);
const rangeDate = ref<{ start: string, end: string }>({ start: null, end: null })

const { page, rowsPerPage, totalRows, changePage, changeTotalRows } =
    usePagination();

onMounted(() => {
    onFilter();
});

const loadPlanifications = async () => {
    const listItems = await getPlanificaciones();
    changeTotalRows(listItems.totalCount);
};

const onFilter = () => {
    changePage(1);
    loadPlanifications();
};

const query = computed({
    get: () => planificacionesStore?.filters?.query,
    set: (value) => {
        console.log("value", value);
        planificacionesStore.filters.query = value;
    },
});

const selectedStatus = computed({
    get: () => planificacionesStore?.filters?.estado,
    set: (value) => {
        planificacionesStore.filters.estado = value;
    },
});

watch(
    () => [
        planificacionesStore.filters.estado,
        planificacionesStore.filters.query,
        planificacionesStore.filters.rangeDates?.from,
        planificacionesStore.filters.rangeDates?.to,
    ],
    () => {
        clearTimeout(timeoutSearch);
        timeoutSearch = setTimeout(() => {
            onFilter();
        }, 1000);
    }
);

watch(
    () => [rowsPerPage.value, page.value],
    () => {
        paginationFilters.rowsPerPage = rowsPerPage.value;
        paginationFilters.page = page.value;
    }
);

watch(
    () => [rangeDate.value],
    () => {
        planificacionesStore.filters.rangeDates.from = rangeDate?.value?.start;
        planificacionesStore.filters.rangeDates.to = rangeDate?.value?.end;
    }
);

onMounted(async () => {
    await getPlanificaciones();
});

const clearRangeSelection = () => {
    rangeDate.value.start = undefined;
    rangeDate.value.end = undefined;
    planificacionesStore.filters.rangeDates.from = undefined;
    planificacionesStore.filters.rangeDates.to = undefined;
}

// const defaultLocations = planificaciones.reduce((acc, user) => {
//   if (!acc.includes(user.location)) {
//     acc.push(user.location)
//   }
//   return acc
// }, [] as string[])

// const defaultStatuses = users.value.reduce((acc, user) => {
//   if (!acc.includes(user.status)) {
//     acc.push(user.status)
//   }
//   return acc
// }, [] as string[])

function onSelect(row: PlanificacionList) {
    const index = selected.value.findIndex((item) => item.id === row.id);
    if (index === -1) {
        selected.value.push(row);
    } else {
        selected.value.splice(index, 1);
    }
}

defineShortcuts({
    "/": () => {
        input.value?.input?.focus();
    },
});
</script>

<template>
    <UDashboardPage>
        <AddPlanificacionSlide @update:open="openAddModal = $event" :open="openAddModal" />

        <UDashboardPanel grow>
            <UDashboardNavbar title="Planificaciones" :badge="planificaciones.length">
                <template #right>
                    <UInput ref="input" v-model="query" icon="i-heroicons-funnel" autocomplete="off"
                        placeholder="Buscar..." class="hidden lg:block"
                        @keydown.esc="$event.target.blur()">
                        <template #trailing>
                            <UKbd value="/" />
                        </template>
                    </UInput>

                    <UButton label="Crear planificación" trailing-icon="i-heroicons-plus" color="gray"
                        @click="openAddModal = true" />
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
                            <v-date-picker :focus="false" id="date" v-model="rangeDate" is-range>
                                <template #default="{ inputValue, inputEvents }">
                                    <UInput :autofocus="false" color="white"
                                        icon="material-symbols-light:calendar-month-rounded"
                                        placeholder="Fechas" class="w-full !h-[36px] z-0"
                                        :value="inputValue?.start && rangeDate?.start ? (inputValue.start + '-' + inputValue.end) : ''"
                                        v-on="inputEvents.start">
                                        <template #trailing>
                                            <button v-if="rangeDate?.start !== undefined && rangeDate.end !== undefined"
                                                @click="clearRangeSelection"
                                                class="cursor-pointer pointer-events-auto z-50 text-sm text-gray-500 hover:text-gray-700">
                                                <UIcon name="i-heroicons-x-mark" class="w-5 h-5 cursor-pointer" />
                                            </button>
                                        </template>
                                    </UInput>
                                </template>
                            </v-date-picker>
                        </div>
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
                :loading="loadingPlanificaciones" sort-mode="manual" class="w-full"
                :ui="{ divide: 'divide-gray-200 dark:divide-gray-800' }" @select="onSelect">
                <template #nombre-data="{ row }">
                    <ULink :to="appRoutes.planificacionPage(row.id)" active-class=""
                        class="text-green-500 underline dark:text-green-400 hover:text-green-700 dark:hover:text-green-200">
                        {{ row?.nombre }}
                    </ULink>
                </template>

                <template #rangoTiempos-data="{ row }">
                    <div class="flex items-center gap-2">
                        <UIcon name="i-heroicons-calendar" class="w-5 h-5" />
                        <span>{{ row?.fechaDesde }} - {{ row?.fechaHasta }}</span>
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
                            row.grados.map((grado) => grado?.nombre)?.join(", ")
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
    </UDashboardPage>
</template>
