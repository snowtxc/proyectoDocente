<script setup lang="ts">
import { format } from 'date-fns';
import type { CambiarPlanificacionFechaDTO, PlanificacionFecha, SimplePlanificacionFecha } from '~/types/planificacionFecha';
import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum';

    interface Props {
        planificacionId : number;
        planificacionFecha?: PlanificacionFecha;
        fechasYaPlanificadas: string[]
    }
    
    const props = withDefaults(defineProps<Props>(),{});
    const toast = useToast();

    const { $apiRest } = useNuxtApp();
    const emit = defineEmits(['on:change']);
    
    const show = ref<boolean>(false);
    const buscandoFechaUsada = ref<boolean>(false);

    const showModalConfirm = ref<boolean>(false);
    const showPopover = ref(false);
    const showModalFechaExistente = ref<boolean>(false);

    const descriptionModalConfirm = ref<string>("");

    const fecha =  ref(null);

    const fechasDisabled = computed(()=>{
        // la fechas desactivada es unicamente la propia fecha del dia que se intenta cambiar
        const  { fecha } = props.planificacionFecha;
        return [convertDateStrToDateLocal(fecha)];
    })

    const fechasYaOcupadas = computed(()=>{
        // Array de dates de fechas ya planificada ignorando la propia fecha
        return  props.fechasYaPlanificadas.filter(fecha=> fecha != props.planificacionFecha.fecha). map(fecha =>{
          return convertDateStrToDateLocal(fecha);
        })
    })
    
    const onShowModalConfirm = ()=>{    
        showModalConfirm.value = true;
    }

    const onSubmit = async()=>{

        showModalConfirm.value = false;
        
        try{
            const { id } = props.planificacionFecha;

            const body: CambiarPlanificacionFechaDTO = {
                planificacion_fecha_id: id,
                nuevaFecha: format(fecha.value, "yyyy-MM-dd")
            }
            
            const planificacionFechaUpdated = await $apiRest<PlanificacionFecha>(apiPlanificacionesFechaRoutes.cambiarFecha, HttpMethodEnum.POST, body);
        
            toast.add({
                title: "Actualización de fecha",
                description: `Se ha actualizado la planificación del día ${ format(convertDateStrToDateLocal(props.planificacionFecha.fecha),'dd/MM/yyyy')} a ${format(fecha.value, 'dd/MM/yyyy')} correctamente.`,
                color: "green"
            })

            showPopover.value = false;
            emit('on:change', planificacionFechaUpdated);
            fecha.value = null;
        }
        catch(message){
            showPopover.value = false;
            toast.add({ 
                title: 'Error',
                description: message ? message : 'Error al agregar días a la planificación',
                color: 'red', 
                icon: 'i-heroicons-check-circle' 
            })
        }
    }

    watch(()=> fecha.value , async()=>{

        if(fecha.value){
            buscandoFechaUsada.value = true;
        
            try{
                const  body : { planificacion_id: number, fecha: string }  = {
                    planificacion_id: props.planificacionId,
                    fecha:   format(fecha.value, "yyyy-MM-dd")
                }
                
                // Llamada a la api de planificacion para ver si la fecha a la que se intenta cambiar ya esta usada.
                const planificacionFechaUsada =  await $apiRest<boolean>(apiPlanificacionesRoutes.verificarFecha, HttpMethodEnum.POST, body);

                showModalFechaExistente.value = planificacionFechaUsada;
                buscandoFechaUsada.value = false;
                descriptionModalConfirm.value = `¿Seguro deseas cambiar de fecha el día planificado desde  ${format(convertDateStrToDateLocal(props.planificacionFecha.fecha),'dd/MM/yyyy')}  ${ format(fecha.value, 'dd/MM/yyyy')} ?`;

            }catch(message){
                toast.add({
                    title: "Error",
                    description: message ? message : 'Error',
                    color: "red"
                })
                buscandoFechaUsada.value = false
            }
        }
        
      
    })


</script>

<template>
    <UPopover v-model:open="show">
        
        <UButton
            icon="tabler:calendar-week"
            color="gray"
            variant="ghost"
            @click="showPopover = true"
            :disabled="props.planificacionFecha ? false: true"
        />
                
        <template #panel>
            <div class="flex flex-col items-center gap-4 mb-4 p-4" v-if="showPopover">
                <UDashboardSection title="Cambiar fecha" description="Cambiar fecha del día planificado. Por favor elige a que fecha quieres cambiar tu día planificado el .">
                    
                </UDashboardSection>

                <DatePicker v-model="fecha"  :disableWeekends="true"  :disabledDates="fechasDisabled" :highlightedDates="fechasYaOcupadas"/>
                
                <UAlert
                    v-if="showModalFechaExistente"
                    title="Atención!"
                    description="Ya existe un día planificado en la fecha a la que intentas cambiar. Continuar implica que perderás los planificado en esa fecha."
                    color="red"
                    variant="outline"
                    close
                />

                <div class="w-full flex justify-end">
                    <UButton color="primary" icon="tabler:calendar-week" @click="onShowModalConfirm" :disabled="!fecha || buscandoFechaUsada"> 
                        Cambiar de Fecha
                    </UButton>
                </div>
            </div>
        </template>
  </UPopover>

  <ConfirmModal v-model="showModalConfirm" title="Cambiar Fecha" :description="descriptionModalConfirm" @onConfirm="onSubmit" ></ConfirmModal>
</template>