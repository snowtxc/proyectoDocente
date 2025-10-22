<script setup lang="ts">

import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum';
import type { Planificacion } from '~/types/planificacion';
import type { RemoverTramoDTO, Tramo } from '~/types/tramo';
import type { PlanificacionFecha, SimplePlanificacionFecha } from '~/types/planificacionFecha';
import type { Espacio } from '~/types/espacio';
import type { CompetenciaGeneral } from '~/types/competenciaEspecifica';
import CambiarOrden from '~/components/tramos/CambiarOrden.vue';
import { cloneDeep } from 'lodash';
import { ActionMenuTramo } from '~/utils/enums/actionMenuTramo.enum';
import ConfirmModal from '~/components/ConfirmModal.vue';

const { $apiRest } = useNuxtApp();

const route = useRoute();
const toast = useToast();
const slug = route.params.slug as string;

const pendingSave = ref<boolean>(false);
const isSaving = ref<boolean>(true);

const modal = useModal()

const { data: response, error, refresh } = await useAsyncData('planificacionDetalle', async () => {
  const [planificacion,espacios, competenciasGenerales]= await  Promise.all(
    [
      $apiRest<Planificacion>(apiPlanificacionesRoutes.getBySlug(slug), HttpMethodEnum.GET),
      $apiRest<Espacio[]>(apiEspaciosRoutes.listAll, HttpMethodEnum.GET),
      $apiRest<CompetenciaGeneral[]>(apiCompetenciasGeneralesRoutes.listAll, HttpMethodEnum.GET)
    ]);
  return { planificacion,  espacios , competenciasGenerales};
});

const planificacion = ref<Planificacion>(response.value.planificacion);
const espacios = ref<Espacio[]>(response.value.espacios);
const competenciasGenerales = ref<CompetenciaGeneral[]>(response.value.competenciasGenerales);

const planificacionFechaSelected = ref<PlanificacionFecha>();
const tramoSelected = ref<Tramo>(null);

const tramosStepper = ref(null);

const ordenarFechasPlanificacion = () : SimplePlanificacionFecha[] =>{
    const fechas : SimplePlanificacionFecha[] =  [...planificacion.value.fechas];
    return fechas.sort((a, b) =>{
      if(new Date(a.fecha).getTime() <= new Date(b.fecha).getTime())
        return -1
      return 1;
    })
}

if(planificacion.value.fechas.length > 0){
  const { data: planificacionFecha, error: errorPlanificacionFecha, refresh : refreshPlanificacionFecha } = await useAsyncData('planificacionFechaDetalle', async()=>{
        
    planificacion.value.fechas = ordenarFechasPlanificacion();

    const planificacionFechaId = planificacion.value.fechas[0].id;
    const response = await $apiRest<PlanificacionFecha>(apiPlanificacionesFechaRoutes.find(planificacionFechaId), HttpMethodEnum.GET);
    return response;
  });

  planificacionFechaSelected.value = planificacionFecha.value;

  if(planificacionFecha.value.tramos.length > 0){
    tramoSelected.value = planificacionFecha.value.tramos[0];
  }
}

const grupo  = computed(()=>{
  return planificacion.value.grupo;
})

const ciclosGradosIds = computed(()=>{
  let result = [];
  grupo.value.grados.map(grado =>{
    if(result.findIndex(id => id == grado.ciclo_grado_id)  < 0) 
      result.push(grado.ciclo_grado_id);
  })
  return result;
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
      tramo,
      title: `Tramo ${step}`,
      description: `Tramo ${step}`,      
      icon: 'tabler:file-text'
    }
  })
})

const showModalAddTramo = ref(false);
const loadingCreatingTramo = ref(false);

const currentStepTramo  = computed(()=>{
  if(tramoSelected.value == null)
    return null;
  
  return tramos.value.findIndex(x => x.id == tramoSelected.value.id) + 1;
})

const onCreateTramo = async()=>{

  showModalAddTramo.value = false;
  
  const newTramo : Tramo = {
    id: 0,
    created_at: undefined,
    updated_at: undefined,
    planificacion_fecha_id: planificacionFechaSelected.value.id,
    seDesarrolla: true,
    criterios_de_logros: [],
    competencias_especificas: [],
    actividad: undefined,
    orden: null
  }

  try{

   const tramo = await $apiRest(apiTramosRoutes.create, HttpMethodEnum.POST, newTramo);

   planificacionFechaSelected.value.tramos.push(tramo);
   tramoSelected.value = tramo;

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

const showPopoverAddFecha = ref<boolean>(false);

const onAddPlanificacionFechas = async(planificacionFechas: PlanificacionFecha[])=>{

  try{
    const planificaciconFechaid = planificacionFechas[0].id;
    const planificacionFecha = await $apiRest<PlanificacionFecha>(apiPlanificacionesFechaRoutes.find(planificaciconFechaid), HttpMethodEnum.GET);
    planificacionFechaSelected.value = planificacionFecha;
    
    const fechasActualesPlanificacion = [...planificacion.value.fechas];
    // se agregan las nuevas fechas al array de fecha de la planificacion.
    planificacion.value.fechas = [...fechasActualesPlanificacion, ...planificacionFechas];
    
    planificacion.value.fechas = ordenarFechasPlanificacion();

    toast.add({ title: 'Se agregaron nuevos días a la planificación correctamente!', color: 'green', icon: 'i-heroicons-check-circle' })

  }catch(message){
    toast.add({
      title: "Error",
      description: message ? message : 'Error al obtener el día de la planificacion',
      color: "red"
    })
  }
  
}

const changeSelectedFecha  = (fecha: string)=>{
  loadPlanificacionFecha(fecha);
}

const changeFechaDirection = (direction: "prev" | "next") => {

  const currentFechaIdx = fechas.value.findIndex(item => item.id == planificacionFechaSelected.value.id);
  if(currentFechaIdx < 0)
    return;

  let idx = direction == "prev" ? currentFechaIdx - 1 : currentFechaIdx + 1;

  const newCurrentFecha =  fechas.value[idx];

  loadPlanificacionFecha(newCurrentFecha.fecha);
}

const onChangePlanificacionFecha = async(planificacionFechaUpdated: PlanificacionFecha)=>{

  const idxToReplace = planificacion.value.fechas.findIndex(x => x.fecha == planificacionFechaUpdated.fecha);

  const idx = planificacion.value.fechas.findIndex(x => x.id == planificacionFechaUpdated.id);

  if(idxToReplace >= 0){
    // Se elimina la fecha si es sustituida.
    planificacion.value.fechas.splice(idxToReplace, 1);
  }

  if(idx >= 0){
    // La fecha actualizada cambia
    planificacion.value.fechas[idx].fecha = planificacionFechaUpdated.fecha;
  }

  planificacionFechaSelected.value.fecha = planificacionFechaUpdated.fecha;
  planificacion.value.fechas = ordenarFechasPlanificacion();

  loadPlanificacionFecha(planificacionFechaUpdated.fecha);
}

const loadPlanificacionFecha = async(fecha: string)  : Promise<void> =>{
  try{

    const planificacionFecha = fechas.value.find(planificacionFecha => planificacionFecha.fecha == fecha);
    const response = await $apiRest<PlanificacionFecha>(apiPlanificacionesFechaRoutes.find(planificacionFecha.id), HttpMethodEnum.GET);
    planificacionFechaSelected.value = response;

    if(planificacionFechaSelected.value.tramos.length > 0){
      // SE CARGA EL PRIMER TRAMO
      tramoSelected.value = { ... planificacionFechaSelected.value.tramos[0] };
    }else{
      tramoSelected.value = null;
    }

  }catch(message){
    toast.add({
      title: "Error",
      description: message ? message : 'Error al obtener el dia de planificacion. Por favor vuelve a intentarlo más tarde.',
      color: "red"
    })
  }
}

const onChangeTramo = (currentStep) =>{

  if(currentStep > 0){
    const idx = currentStep - 1;

    if(currentStep <= tramos.value.length){
      const tramo = tramos.value[idx];
      tramoSelected.value = { ... tramo };
    }
  }
 
}

const onSavePlanificacionFecha = async()=>{
    if(!planificacionFechaSelected.value)
      return;

    isSaving.value = true;

    try{

      const response = await $apiRest<{ status: boolean , message: string}>(apiPlanificacionesFechaRoutes.guardar(planificacionFechaSelected.value.id), HttpMethodEnum.POST, planificacionFechaSelected.value);
      isSaving.value = false;

      if(response && response.status){
        toast.add({
              title: "Se ha guardado con exito",
              description: response.message,
              color: "green"
        });

        pendingSave.value = false;
      }
        

    }catch(message){
      isSaving.value = false;
      toast.add({
        title: "Error",
        description: message ? message : 'Error al obtener el dia de planificacion. Por favor vuelve a intentarlo más tarde.',
        color: "red"
      })
    }
}

watch(()=> tramoSelected.value, ()=>{

    const idx = tramos.value.findIndex(t => t.id == tramoSelected.value.id);

    if(idx >= 0){
      tramos.value[idx] = { ...tramoSelected.value};
    }  

    // Se activa el pending save.
    pendingSave.value = true;
})

const onCancelNuevoTramo = ()=>{
  showModalAddTramo.value = false;
  tramosStepper.value.changeStep(currentStepTramo.value);
}

const actionsMenuTramo = ref([
   { 
    title: 'Cambiar orden',
    icon: 'tabler:arrows-sort',
    actionName: ActionMenuTramo.CHANGE_ORDER
    },
    {
    title: 'Eliminar tramo',
    icon: 'tabler:trash',
    actionName: ActionMenuTramo.DELETE
  }
  ]);



 const handleOnActionMenuTramo = async( data: { actionName: ActionMenuTramo, step: number })=>{
  
  const stepSelected = stepsTramos.value.find(x => x.step == data.step);
  const tramoSelected = stepSelected.tramo;

  if(!stepSelected)
    return;

   switch(data.actionName){

    case ActionMenuTramo.CHANGE_ORDER:
      
      modal.open(CambiarOrden, { 
        planificacionId: planificacion.value.id, 
        planificacionFechaId : planificacionFechaSelected.value.id,
        tramoSelected : {... tramoSelected } , 
        tramos :  cloneDeep(tramos.value),
        "onOn-change-order" : (tramosUpdated)=>{
          
          updateOrdersTramos(tramosUpdated);
          modal.close()
        }
      })
      break;

    case ActionMenuTramo.DELETE:
      modal.open(ConfirmModal, { 
        title: `Remover tramo ${tramoSelected.orden}`,
        description: "AL remover el tramo , es posible que se reordenen todos los tramos de la planificación.",
        "onOnConfirm" : async(data)=>{
        
          try{
            modal.close();

            const body : RemoverTramoDTO = {
              planificacion_id : planificacion.value.id,
              planificacion_fecha_id : planificacionFechaSelected.value.id,
              tramo_id : tramoSelected.id,
           }         

           const response = await $apiRest<any>(apiTramosRoutes.removerTramo, HttpMethodEnum.POST,body);

          if(response.status){

            const { tramosUpdated } = response;

            const idx = planificacionFechaSelected.value.tramos.findIndex(tramo => tramo.id == tramoSelected.id);

            if(idx >= 0)
              planificacionFechaSelected.value.tramos.splice(idx,1);

            updateOrdersTramos(tramosUpdated);
            
            toast.add({
                title: "Tramo ordenado con exito",
                description: "Tramo ordenado",
                color: "green"
            })
          }
          }catch(message){
            toast.add({
                title: "Error",
                description: message ? message : 'Error al intentar eliminar el tramo',
                color: "red"
            })
          }

        }
      })
      break;
   }
 }    

 // Actualizar el orden de tramos
 // Dado una lista de tramos actualizados sus ordenes se actualiza los ordenes en el array de tramos general.
 const updateOrdersTramos = (tramosUpdated: Tramo[])=>{

   tramosUpdated.map(tramoUpdated =>{

    const idx = planificacionFechaSelected.value.tramos.findIndex(x => x.id == tramoUpdated.id);

    if(idx >= 0)
      planificacionFechaSelected.value.tramos[idx].orden = tramoSelected.value.orden;

    if(tramoSelected.value.id == tramoUpdated.id && tramoSelected.value.orden != tramoUpdated.orden)
      tramoSelected.value.orden = tramoUpdated.orden;
   })
 }

 const onExport = async()=>{
   
   if(!planificacion.value)
    return;

   try{

   const responseFile = await $apiRest(apiPlanificacionesRoutes.exportar(planificacion.value.id), HttpMethodEnum.POST, {responseType: 'blob'});

   if(responseFile){
     downloadBlob(responseFile, "planificacion.docx");

      toast.add({
        title: "Planificacion exportada",
        description: 'Se ha exportado la planificación con exito.',
        color: "green"
      })
   }
   
  }catch(message){
    toast.add({
      title: "Error",
      description: message ? message : 'Error al crear un nuevo tramo',
      color: "red"
    })
  }
 }

</script>

<template>
  <UDashboardPage>
    <UDashboardPanel
      id="grupo"
      :width="200"
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
        orientation="vertical"
        descriptionButtonAddStep="Extender un nuevo tramo a la planificación"
        :currentStep="currentStepTramo"  
        :steps="stepsTramos"
        @on:add-step="showModalAddTramo = true"
        :linear="false"
        ref="tramosStepper"
        @on:change-step="onChangeTramo"
        :actionsMenu="actionsMenuTramo"
        @on:action-menu="handleOnActionMenuTramo"/>
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
          :planificacionId="planificacion.id"
          @on:add="onAddPlanificacionFechas"
          :showSmallBtn="true"
          :fechasDisabled="planificacion.fechas.map(pf => pf.fecha)"></PlanificacionesPopoverAddPlanificacionFecha>

          <PlanificacionesPopoverChangePlanificacionFecha 
          :planificacionId="planificacion.id"
          :planificacionFecha="planificacionFechaSelected"
          :fechasYaPlanificadas="planificacion.fechas.map(pf => pf.fecha)"
          @on:change="onChangePlanificacionFecha"></PlanificacionesPopoverChangePlanificacionFecha>
        </div>
       
      </template>

      <template #right>

        <UTooltip text="Guardar planificación">
          <UButton
            icon="tabler:device-floppy"
            color="gray"
            variant="ghost"
            @click="onSavePlanificacionFecha()"
          >
          <template #leading="{ modelValue, ui }">
                        
            <div class="flex flex-col">
                <div class="w-2 h-2 rounded-full bg-primary  absolute float-right" v-if="pendingSave"> </div>
                <UIcon name="tabler:device-floppy" class="size-5" />
            </div>
        
          </template>
        </UButton>
        </UTooltip>

         <UTooltip text="Exportar a Word">
          <UButton
            icon="tabler:file-word"
            color="gray"
            variant="ghost"
            @click="onExport"
          />
        </UTooltip>

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
      <div class="p-2 overflow-y-auto"
        v-if="planificacionFechaSelected">

        <TramosTramoForm 
          v-if="tramoSelected"  
          v-model="tramoSelected" 
          :tramo="tramoSelected"  
          :espacios="espacios" 
          :gradosIds="grupo.grados.map(g => g.id)"
          :ciclosGradosIds="ciclosGradosIds"
          :competenciasGenerales="competenciasGenerales"
          :nroTramo="currentStepTramo"></TramosTramoForm>

        <div v-else class="flex flex-col justify-center items-center h-screen">
          <UIcon
            name="tabler:file-text"
            size="60px"
          />
          <h1 class="mt-1"> No tienes ningún tramo creado , prueba agregando uno nuevo </h1>
          </div>
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
        @click="onCancelNuevoTramo"
      />
  </template>
</UDashboardModal>



<PlanificacionDia
v-if="planificacionFechaSelected"
:selectedDay="planificacionFechaSelected"
:enableDates="planificacion.fechas.map(pf => pf.fecha)"
@changeDate="changeSelectedFecha"
@changeDirection="changeFechaDirection"
/>
  
</template>
