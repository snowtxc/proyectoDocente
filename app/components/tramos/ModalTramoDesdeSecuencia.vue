
<script lang="ts" setup>
import type { ActividadSecuencia, ActividadSecuenciaItemSelector } from '~/types/actividadSecuencia';
import type { Grupo, SecuenciaRelacionadaAGrupo } from '~/types/grupo';
import type { Secuencia } from '~/types/secuencia';
import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum';
import ConfirmModal from '../ConfirmModal.vue';
import type { CargarTramoDesdeActividadSecuencia, Tramo } from '~/types/tramo';
import type { Planificacion } from '~/types/planificacion';
import type { PlanificacionFecha } from '~/types/planificacionFecha';

import SecuenciaDetailModal from '../secuencias/SecuenciaDetailModal.vue';
import ActividadSecuenciaDetailModal from '../actividad-secuencias/ActividadSecuenciaDetailModal.vue';

interface Props {
    grupo: Grupo;
    tramo: Tramo;
    planificacion: Planificacion;
    planificacionFecha : PlanificacionFecha
}

const { $apiRest  } = useNuxtApp();

const emit = defineEmits(['onClose','loadTramo']);

const props = withDefaults(defineProps<Props>() , {});
const toast = useToast();
const currentStep = ref<number>(1);

const isLoading = ref<boolean>(true);
const showModalConfirm = ref<boolean>(false);

const secuenciaSelected = ref<Secuencia>(null);
const secuenciasRelacionadas = ref<SecuenciaRelacionadaAGrupo>(null);

const actividadSecuenciaSelected = ref<ActividadSecuencia>(null);
  
const actividadeSecuencias = computed<ActividadSecuenciaItemSelector[]>(() => {
  
  if (!secuenciaSelected.value) return [];

  return secuenciaSelected.value.actividades_secuencia.map(actividadSecuencia => {

    const checked = (actividadSecuenciaSelected.value && actividadSecuenciaSelected.value.id == actividadSecuencia.id) ? true : false;

    return {
      ...actividadSecuencia,
      checked
    };
  });
});

const disable = computed<boolean>(()=> {
  return actividadSecuenciaSelected.value ? false : true;
})

const loadSecuenciasRelacionadas = async()=>{

 isLoading.value = true;
    
  try{
      const response = await $apiRest<SecuenciaRelacionadaAGrupo>(apiGrupoRoutes.getSecuenciasRelacionadas(props.grupo.id),HttpMethodEnum.GET);
      secuenciasRelacionadas.value = response;

     isLoading.value = false;

  }catch(message){
    toast.error({
      title: "Error",
      message: message ? message : 'Error al crear el grupo',
      color: "red"
    })
    isLoading.value = false;
  }
}

onMounted(()=>{
    loadSecuenciasRelacionadas();
})

const steps = [{
  step: 1,
  title: `Seleccionar secuencia`,
  description: ``,
  icon: "tabler:list-letters"
},
{
  step: 2,
  title: `Seleccionar actividad`,
  description: ``,
  icon : "tabler:file-text"
}];

const selectSecuencia = (secuencia: Secuencia)=>{
    secuenciaSelected.value = secuencia;
    nextStep();
}

const nextStep = ()=>{
  currentStep.value = currentStep.value + 1;
}

const handleChangeActividad = (checked: boolean, actividad: ActividadSecuencia)=>{

  if(!checked){
    actividadSecuenciaSelected.value = null;
    return;
  }
  actividadSecuenciaSelected.value = actividad;
}

const handleChangeStep = (step) =>{
  if(step == 1)
    actividadSecuenciaSelected.value = null;
  currentStep.value = step;
}

const cargarActividadAlTramo = async()=>{
    showModalConfirm.value = false;

    try{
       const body: CargarTramoDesdeActividadSecuencia = {
        secuencia_id : secuenciaSelected.value.id,
        actividad_secuencia_id: actividadSecuenciaSelected.value.id,
        planificacion_id: props.planificacion.id,
        planificacion_fecha_id : props.planificacionFecha.id,
        tramo_id : props.tramo.id
      }

      const response =  await $apiRest(apiTramosRoutes.cargarTramoDesdeActividadSecuencia, HttpMethodEnum.POST, body);

      if(response.status){
         toast.success({
            title: "Tramo cargado desde secuencia",
            message: response.message,
            color: "green"
        })

        const tramo : Tramo = response.tramo as Tramo;

        emit('loadTramo', tramo);
      }

    }catch(message){
      toast.error({
          title: "Error",
          message: message ? message : 'Error al intentar cargar la actividad de la secuencia al tramo.',
          color: "red"
        })
    } 
   
    
}


</script>

<template>
  <UModal
    title="Cargar tramo desde actividad de secuencia."
    description="Cargar tramo desde actividad de secuencia."
    :dismissible="false"
    :ui="{ footer: 'justify-end' }"
  >
  <template #content>
    <UCard class="min-w-0 min-h-[75vh]">
      <template #header>
        Cargar tramo desde actividad de secuencia
      </template>


      <div class="w-full overflow-y-auto max-h-full h-[75vh]">
        <Stepper 
            :showButtonAddStep="false"
            orientation="horizontal"
            :currentStep="currentStep"
            :steps="steps"
            :linear="true"
            @on:change-step="handleChangeStep"
            :blockNextSteps="true"/>

         <USeparator
            orientation="horizontal"
            class="mx-1.5 lg:hidden"
            />
        <UProgress size="xl" v-if="isLoading" class="mt-2" />


        <div class="w-full flex flex-col p-2" v-if="!isLoading">
          <div v-if="currentStep == 1">
            <USeparator label="Secuencias del grupo" class="my-2" />

<div class="w-full">
  <ul
    v-if="secuenciasRelacionadas.secuenciasDelGrupo?.length"
    role="list"
    class="divide-y divide-gray-200 dark:divide-gray-800 overflow-y-auto"
  >
    <li
      v-for="secuencia in secuenciasRelacionadas.secuenciasDelGrupo"
      :key="secuencia.id"
      class="flex items-center justify-between gap-3 py-3 px-4 sm:px-6"
    >
      <div class="flex items-center gap-3 w-full hover:cursor-pointer">
        <div class="text-sm min-w-0 flex gap-2">
          <UIcon name="tabler:file-text" class="w-5 h-5" />
          <p class="truncate">
            Secuencia : {{ secuencia.nombre }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <UDropdown position="bottom-end">
          <div class="flex items-center gap-3">
            <SecuenciaDetailModal
            :secuencia="secuencia"
            @onClose="emit('onClose')"
          />
          <UButton
            icon="tabler:chevron-right"
            color="neutral"
            variant="ghost"
            @click="selectSecuencia(secuencia)"
          />
          </div>
          
        </UDropdown>
      </div>
    </li>
  </ul>

  <p
    v-else
    class="text-sm text-gray-500 dark:text-gray-400 px-4 py-3 text-center"
  >
    No hay secuencias asociadas a este grupo.
  </p>
</div>

          <USeparator label="Otras secuencias" class="my-2" />

<div class="w-full">
  <ul
    v-if="secuenciasRelacionadas.secuenciasCompatibles?.length"
    role="list"
    class="divide-y divide-gray-200 dark:divide-gray-800 overflow-y-auto"
  >
    <li
      v-for="secuencia in secuenciasRelacionadas.secuenciasCompatibles"
      :key="secuencia.id"
      class="flex items-center justify-between gap-3 py-3 px-4 sm:px-6"
    >
      <div class="flex items-center gap-3 w-full hover:cursor-pointer">
        <div class="text-sm min-w-0 flex gap-2">
          <UIcon name="tabler:file-text" class="w-5 h-5" />
          <p class="truncate">
            Secuencia : {{ secuencia.nombre }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <UDropdown position="bottom-end">
          <SecuenciasSecuenciaDetailModal
            :secuencia="secuencia"
            @on:close=""
          />
          <UButton
            icon="tabler:chevron-right"
            color="primary"
            variant="ghost"
            @click="selectSecuencia(secuencia)"
          />
        </UDropdown>
      </div>
    </li>
  </ul>

  <p
    v-else
    class="text-sm text-gray-500 dark:text-gray-400 px-4 py-3 text-center"
  >
    No hay otras secuencias disponibles.
  </p>
</div>

          </div>

          <div v-else-if="currentStep == 2">
              <USeparator label="Actividades" class="my-2" />
              <div class="w-full">
              <ul  v-if="actividadeSecuencias.length > 0" role="list" class="divide-y divide-gray-200 dark:divide-gray-800 overflow-y-auto">
                <li v-for="(actividad) in actividadeSecuencias" :key="actividad.id"
                  class="flex items-center justify-between gap-3 py-3 px-4 sm:px-6">
                  <div class="flex items-center gap-3 w-full hover:cursor-pointer">

                    <div class="text-sm min-w-0 flex gap-2">
                      <UIcon name="tabler:file-text" class="w-5 h-5"/>
                      <p class="truncate">
                        Actividad : {{ actividad.orden }}
                      </p>
                    </div>
                  </div>

                  <div class="flex items-center gap-3">
                    <ActividadSecuenciaDetailModal
                    :secuencia="secuenciaSelected" 
                    :actividadSecuencia="actividad"
                    @onClose="emit('onClose')"
                    ></ActividadSecuenciaDetailModal>

                    <UDropdown position="bottom-end">       
                      <USwitch color="primary" :model-value="actividad.checked" @update:model-value="handleChangeActividad($event,actividad)"  />
                    </UDropdown>
                  </div>
                </li>
              </ul>

              <p v-else class="text-center text-md mt-4"> La secuencia seleccionada no tiene actividades</p>
            </div>

          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          
          <UButton
            label="Cancelar"
            color="neutral"
            @click="emit('onClose')"
          />

          <UButton
            type="submit"
            icon="tabler:upload"
            :disabled="disable"
            label="Cargar actividad al tramo"
            color="primary"
            @click="showModalConfirm = true"
          />
        </div>
      </template>

    </UCard>

      <ConfirmModal 
   v-model="showModalConfirm"
   title="Cargar tramo desde secuencia"
   :description="'Cargar actividad ' + actividadSecuenciaSelected?.orden + ' al tramo ' + props.tramo.orden + ' de la planificacion ' + props.planificacion.nombre"
   @onConfirm="cargarActividadAlTramo"
   @on-close="showModalConfirm = false"
   ></ConfirmModal>
  </template>

  </UModal>

 

</template>