<script setup lang="ts">
import type { Planificacion } from '~/types/planificacion';
import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum';


const { $apiRest } = useNuxtApp();

const route = useRoute();
const slug = route.params.slug as string;

const loadedPlanificacion =  ref<Planificacion>(null);

const fechas = computed(() => loadedPlanificacion.value?.fechas ?? []);
const errorPage = ref({ ok: false, message: "" });

const selectedFecha = ref(fechas?.value.length > 0 ? fechas[0] : null);

const changeSelectedFecha = (direction: "prev" | "next") => {
  const currentIndex = fechas?.value.findIndex(
    (fecha) => fecha === selectedFecha.value
  );
  if (direction === "prev" && currentIndex > 0) {
    selectedFecha.value = fechas.value[currentIndex - 1];
  } else if (direction === "next" && currentIndex < fechas.value.length - 1) {
    selectedFecha.value = fechas.value[currentIndex + 1];
  }
};

watch(
  () => fechas.value,
  (newVal) => {
    console.log("newVal", newVal);
    selectedFecha.value = newVal[0];
  }
);

onMounted(async () => {
  const planificacion = await $apiRest(apiPlanificacionesRoutes.getBySlug(slug), HttpMethodEnum.GET);
});

const progress = computed(() => {
  const totalFechas = fechas.value.length;
  if (!selectedFecha.value || totalFechas === 0) {
    return 0;
  }
  const currentIndex = fechas.value.findIndex(
    (fecha) => fecha === selectedFecha.value
  );
  return ((currentIndex + 1) / totalFechas) * 100; // Progress in percentage
});
</script>

<template>
  <div
    class="flex w-full flex-grow items-center justify-center h-full"
    v-if="errorPage.ok"
  >
    <UPageError :message="errorPage.message || 'Error'" />
  </div>

  <UDashboardPage class="relative" v-if="loadedPlanificacion?.id">
    <UDashboardPanel grow>
      <UDashboardNavbar class="text-lg" title="Detalle planificacion">
        <template #badge>
          <UBadge
            :label="loadedPlanificacion?.nombre"
            variant="outline"
            color="blue"
            class="px-3 py-1 text-lg ml-2 font-semibold border-2"
          />
        </template>
        <template #right>
          <UButton
            label="Duplicar"
            icon-class="w-4"
            icon="i-heroicons-document-duplicate"
            color="gray"
          />
          <UButton label="Editar" icon="i-heroicons-pencil" color="gray" />
          <UButton
            label="Exportar PDF"
            icon="i-heroicons-document-arrow-down"
            color="gray"
          />
        </template>
      </UDashboardNavbar>
      <div
        class="w-full h-auto px-5 py-4 flex flex-col items-start justify-center gap-5"
      >
        <InfoRows
          :rows="[
            {
              key: 'Nombre',
              value: loadedPlanificacion?.nombre,
            },
            {
              key: 'Rango de tiempos',
              value: 'Nombre',
              slotName: `rangoTiempos-slot`,
            },
            {
              key: 'Estado',
              value: loadedPlanificacion?.estado,
              slotName: 'estado-slot',
            },
            {
              key: 'Grupo',
              value: loadedPlanificacion?.grupo,
              slotName: 'grupo-slot',
            },
            {
              key: 'Grados',
              value: loadedPlanificacion?.grados,
              slotName: 'grado-slot',
            },
          ]"
        >
          <template #estado-slot>
            <UBadge
              size="lg"
              :label="loadedPlanificacion.estado"
              :variant="'outline'"
              :ui="{ rounded: 'rounded-full', backgroundColor: '#111111' }"
              :class="getColorsEstado(loadedPlanificacion.estado ?? '')"
            />
          </template>
          <template #grupo-slot>
            <div class="w-auto flex flex-row items-center justify-start gap-2">
              <UAvatar
                :src="
                  formattedImageUrlGrupo(loadedPlanificacion?.grupo?.url_image)
                "
                alt="Avatar"
              />
              <span class="text-neutral-800 font-medium text-sm">{{
                loadedPlanificacion?.grupo?.nombre
              }}</span>
            </div>
          </template>
          <template #rangoTiempos-slot>
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-calendar" class="w-5 h-5" />
              <span class="font-medium text-sm"
                >{{ loadedPlanificacion?.fechaDesde }} -
                {{ loadedPlanificacion?.fechaHasta }}</span
              >
            </div>
          </template>
          <template #grado-slot>
            <div class="flex items-center gap-2">
              <span class="font-medium text-neutral-700">{{
                loadedPlanificacion?.grados
                  ?.map((grado) => grado?.nombre)
                  .join(", ")
              }}</span>
            </div>
          </template>
        </InfoRows>
        <div
          class="flex relative w-full flex-col items-center justify-center gap-4"
        >
          <UProgress :value="progress ?? 0" />
          <div class="flex transition-all font-medium items-center gap-2">
            <UIcon name="i-heroicons-calendar" class="w-6 h-6" />
            <span class="font-medium text-xl">{{ selectedFecha?.fecha }}</span>
          </div>
          <div
            class="absolute text-lg text-green-500 underline flex flex-row items-center justify-center gap-1 font-medium cursor-pointer right-0 top-6"
          >
            <UIcon
              class="w-5 h-5 font-bold"
              name="i-heroicons-chat-bubble-oval-left-ellipsis"
            />
            <span>Observaciones</span>
          </div>
        </div>
      </div>
    </UDashboardPanel>
    <!-- ~/components/PlanificacionDia.vue -->
    <PlanificacionDia
      :disabledBack="selectedFecha?.id === (fechas[0] ? fechas[0]?.id : null)"
      :disabledNext="
        selectedFecha?.id ===
        (fechas[fechas?.length - 1] ? fechas[fechas?.length - 1]?.id : null)
      "
      :selectedDay="selectedFecha"
      @changeDate="changeSelectedFecha"
      v-if="loadedPlanificacion?.fechas?.length > 0"
    />
  </UDashboardPage>
</template>
