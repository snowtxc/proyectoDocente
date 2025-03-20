<script setup lang="ts">

import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum';
import type { Planificacion } from '~/types/planificacion';
import type { Tramo } from '~/types/tramo';
import type { PlanificacionFecha, SimplePlanificacionFecha } from '~/types/planificacionFecha';

const { $apiRest } = useNuxtApp();

const route = useRoute();
const toast = useToast();
const slug = route.params.slug as string;

const { data: planificacion, error, refresh } = await useAsyncData('planificacionDetalle', async () => {
  const response = await $apiRest<Planificacion>(apiPlanificacionesRoutes.getBySlug(slug), HttpMethodEnum.GET);
  return response;
});

const planificacionFechaSelected = ref<PlanificacionFecha>(null);

if(planificacion.value.fechas.length > 0){
  const { data: planificacionFecha, error: errorPlanificacionFecha, refresh : refreshPlanificacionFecha } = await useAsyncData('planificacionFechaDetalle', async()=>{
    const planificacionFechaId = planificacion.value.fechas[0].id;
    const response = await $apiRest<PlanificacionFecha>(apiPlanificacionesFechaRoutes.find(planificacionFechaId), HttpMethodEnum.GET);
    return response;
  });

  planificacionFechaSelected.value = planificacionFecha.value;
}

const grupo  = computed(()=>{
  return planificacion.value.grupo;
})

const fechas = computed<SimplePlanificacionFecha[]>(()=>{
  return planificacion.value.fechas;
})

const tramos = computed<Tramo[]>(()=>{
  if(!planificacionFechaSelected.value)
    return  [];

  return planificacionFechaSelected.value.tramos as Tramo[];
})

const stepsTramos =  computed(()=>{
  return tramos.value.map((tramo,idx) =>{
    const step = idx + 1;
    return {
      step,
      title: `Tramo ${step}`,
      description: `Tramo ${step}`,      
      icon: 'tabler:file-text'
    }
  })
})

const showModalAddTramo = ref(false);
const tramoSelected = ref<Tramo>(null);

const loadingCreatingTramo = ref(false);

const currentStepTramo  = computed(()=>{
  if(tramoSelected.value == null)
    return null;
  
  return tramos.value.findIndex(x => x.id == tramoSelected.value.id) + 1;
})

const selectedTab = ref(0)

const { data: mails } = await useFetch<any[]>('/api/mails', { default: () => [] })

// Filter mails based on the selected tab
const filteredMails = computed(() => {
  if (selectedTab.value === 1) {
    return mails.value.filter(mail => !!mail.unread)
  }

  return mails.value
})

const onCreateTramo = async()=>{

  showModalAddTramo.value = false;
  
  const newTramo : Tramo = {
    id: 0,
    created_at: undefined,
    updated_at: undefined,
    planificacion_fecha_id: planificacionFechaSelected.value.id,
    seDesarrolla: true,
  }

  try{
   const tramo = await $apiRest(apiTramosRoutes.create, HttpMethodEnum.POST, newTramo);

   planificacionFechaSelected.value.tramos.push(tramo);

   toast.add({
      title: "Nuevo Tramo",
      description: 'Se ha extendido la planificación a un nuevo tramo.',
      color: "green"
    })

  }catch(message){
    toast.add({
      title: "Error",
      description: message ? message : 'Error al crear un nuevo tramo',
      color: "red"
    })
  }
}

const showPopoverAddFecha = ref<boolean>(true);

const changeSelectedFecha = (): void =>{

}

const onAddPlanificacionFechas = async(planificacionFechas: PlanificacionFecha[])=>{

  try{
    const planificaciconFechaid = planificacionFechas[0].id;
    const planificacionFecha = await $apiRest<PlanificacionFecha>(apiPlanificacionesFechaRoutes.find(planificaciconFechaid), HttpMethodEnum.GET);
    planificacionFechaSelected.value = planificacionFecha;
    
    const fechasActualesPlanificacion = [...planificacion.value.fechas];
    // se agregan las nuevas fechas al array de fecha de la planificacion.
    planificacion.value.fechas = [...fechasActualesPlanificacion, ...planificacionFechas];
    
    
    toast.add({ title: 'Se agregaron nuevos días a la planificación correctamente!', color: 'green', icon: 'i-heroicons-check-circle' })


  }catch(message){
    toast.add({
      title: "Error",
      description: message ? message : 'Error al obtener el día de la planificacion',
      color: "red"
    })
  }
  
}

</script>

<template>
  <UDashboardPage>
    <UDashboardPanel
      id="grupo"
      :width="400"
      :resizable="{ min: 300, max: 500 }"
    >
      <UDashboardNavbar
        :title="grupo.nombre"
      >
        <template #right>
          <BadgeGrado
          v-for="grado in planificacion.grupo.grados"
          :key="grado.id"
          :grado="grado">
        </BadgeGrado>
      
        </template>
      </UDashboardNavbar>

      <!-- Tramos -->
      <div class="overflow-y-auto mb-8 min-h-full" v-if="planificacionFechaSelected">
        <Stepper 
        :showButtonAddStep="true"
        titleButtonAddStep="Agregar nuevo tramo"
        descriptionButtonAddStep="Extender un nuevo tramo a la planificación"
        :currentStep="currentStepTramo"  
        :steps="stepsTramos"
        @on:add-step="showModalAddTramo = true"/>
        
      </div>

    </UDashboardPanel>

    <UDashboardPanel
      collapsible
      grow
      side="right"
    >
    <UDashboardNavbar>
      <template #toggle>
        <UDashboardNavbarToggle icon="i-heroicons-x-mark" />

        <UDivider
          orientation="vertical"
          class="mx-1.5 lg:hidden"
        />
      </template>

      <template #left>

        <div class="flex items-center">
          <UDashboardNavbar
          :title="planificacion.nombre"
            >
            </UDashboardNavbar>
  
          <PlanificacionesPopoverAddPlanificacionFecha 
          :show="showPopoverAddFecha" 
          :planificacionId="planificacion.id"
          @on:add="onAddPlanificacionFechas"
          :showSmallBtn="true"
          :fechasDisabled="planificacion.fechas.map(pf => pf.fecha)"></PlanificacionesPopoverAddPlanificacionFecha>
        </div>
       
      </template>

      <template #right>
        <UTooltip text="Exportar planificación a Google Drive">
          <UButton
            icon="tabler:brand-google-drive"
            color="gray"
            variant="ghost"
          />
        </UTooltip>

        <UTooltip text="Eliminar">
          <UButton
            icon="tabler:trash"
            color="gray"
            variant="ghost"
          />
        </UTooltip>

        <UDivider
          orientation="vertical"
          class="mx-1.5"
        />
      </template>

    
    </UDashboardNavbar>
      <div
        class="flex-1 hidden lg:flex items-center justify-center"
        v-if="planificacionFechaSelected">
        <UIcon
          name="i-heroicons-inbox"
          class="w-32 h-32 text-gray-400 dark:text-gray-500"
        />
      </div>

      <div v-else class="flex flex-col justify-center items-center h-screen">
        <UIcon
          name="tabler:butterfly-filled"
          size="60px"
        />
        <h1 class="mt-1"> No tienes ningún día planificado aún , prueba creando un nuevo día </h1>
      
        <PlanificacionesPopoverAddPlanificacionFecha 
          :show="showPopoverAddFecha" 
          :planificacionId="planificacion.id"
          @on:add="onAddPlanificacionFechas"
          :fechasDisabled="planificacion.fechas.map(pf => pf.fecha)"></PlanificacionesPopoverAddPlanificacionFecha>

        
      </div>
    </UDashboardPanel>
  </UDashboardPage>

  <!--Extender tramo-->
  <UDashboardModal
  v-model="showModalAddTramo"
  title="Agregar nuevo Tramo"
  description="¿Estás seguro que deseas agregar un siguiente tramo a la planificación?"
  icon="tabler:butterfly-filled"
  prevent-close
  :close-button="null"
  :ui="{
    icon: {
      base: 'text-primary dark:text-red-400'
    } as any,
    footer: {
      base: 'ml-16'
    } as any
  }"
>
  <template #footer>
    <UButton
      color="primary"
      label="Confirmar"
      :loading="loadingCreatingTramo"
      @click="onCreateTramo"
    />

    <UButton
        color="white"
        label="Cancelar"
        @click="showModalAddTramo = false"
      />
  </template>
</UDashboardModal>



<PlanificacionDia
v-if="planificacionFechaSelected"
:disabledBack="planificacionFechaSelected?.id === (fechas[0] ? fechas[0]?.id : null)"
:disabledNext="
  planificacionFechaSelected?.id ===
  (fechas[fechas?.length - 1] ? fechas[fechas?.length - 1]?.id : null)
"
:selectedDay="planificacionFechaSelected"
:enableDates="planificacion.fechas.map(pf => pf.fecha)"
@changeDate="changeSelectedFecha"
/>
  
</template>
