<script setup lang="ts">
import { usePlanificacionStore } from "~/services/planificacionService/planificacionService";
import type { PlanificacionList } from "~/types/index";
import { EstadoType } from "~/types/index";

const defaultColumns = [
    {
        key: "nombre",
        label: "Nombre",
        sortable: true,
    },
    {
        key: "rangoTiempos",
        label: "Rango Tiempos",
    },
    {
        key: "tramos",
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

const q = ref("");
const selected = ref<PlanificacionList[]>([]);
const selectedColumns = ref(defaultColumns);
const openAddModal = ref(false);
const sort = ref({ column: "id", direction: "asc" as const });
const input = ref<{ input: HTMLInputElement }>();
const isNewUserModalOpen = ref(false);
const planificacionesStore = usePlanificacionStore();

const { getPlanificaciones } = planificacionesStore;

const columns = computed(() =>
    defaultColumns.filter((column) => selectedColumns.value.includes(column))
);

const planificaciones = computed(() => planificacionesStore.planificaciones)

onMounted(async () => {
    await getPlanificaciones();
});

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
                    <UInput ref="input" v-model="q" icon="i-heroicons-funnel" autocomplete="off"
                        placeholder="Filtrar planificaciones" class="hidden lg:block"
                        @keydown.esc="$event.target.blur()">
                        <template #trailing>
                            <UKbd value="/" />
                        </template>
                    </UInput>

                    <UButton label="Crear planificacion" trailing-icon="i-heroicons-plus" color="gray"
                        @click="openAddModal = true" />
                </template>
            </UDashboardNavbar>

            <UDashboardToolbar>
                <template #left>
                    <!-- <USelectMenu
            v-model="selectedStatuses"
            icon="i-heroicons-check-circle"
            placeholder="Status"
            multiple
            :options="defaultStatuses"
            :ui-menu="{ option: { base: 'capitalize' } }"
          />
          <USelectMenu
            v-model="selectedLocations"
            icon="i-heroicons-map-pin"
            placeholder="Location"
            :options="defaultLocations"
            multiple
          /> -->
                </template>

                <template #right>
                    <USelectMenu v-model="selectedColumns" icon="i-heroicons-adjustments-horizontal-solid"
                        :options="defaultColumns" multiple class="hidden lg:block">
                        <template #label> Mostrar columnas </template>
                    </USelectMenu>
                </template>
            </UDashboardToolbar>

            <UDashboardModal v-model="isNewUserModalOpen" title="New user" description="Add a new user to your database"
                :ui="{ width: 'sm:max-w-md' }">
                <!-- ~/components/users/UsersForm.vue -->
                <UsersForm @close="isNewUserModalOpen = false" />
            </UDashboardModal>

            <UTable
                :empty-state="{ icon: 'i-heroicons-circle-stack-20-solid', label: 'No hay planificaciones creadas' }"
                no-results-text="Test" v-model="selected" v-model:sort="sort" :rows="planificaciones" :columns="columns"
                :loading="false" sort-mode="manual" class="w-full"
                :ui="{ divide: 'divide-gray-200 dark:divide-gray-800' }" @select="onSelect">
                <template #nombre-data="{ row }">
                    <ULink :to="appRoutes.planificacionPage(row.id)" active-class=''
                        class="text-green-500 dark:text-green-400 hover:text-green-700 dark:hover:text-green-200">
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
                    <UBadge :label="row.estado" :variant="'outline'"
                        :ui="{ rounded: 'rounded-full', backgroundColor: '#111111' }" :class="getColorsEstado(
                            row.estado ?? ''
                        )" />
                </template>
            </UTable>
        </UDashboardPanel>
    </UDashboardPage>
</template>
