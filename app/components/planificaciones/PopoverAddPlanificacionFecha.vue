<script setup lang="ts">
import type { CreateMultiplePlanificacionFecha, PlanificacionFecha, SimplePlanificacionFecha } from '~/types/planificacionFecha';
import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum';

    interface Props {
        planificacionId : number;
        showSmallBtn? : boolean;
        fechasDisabled?: string[]
    }
    
    const props = withDefaults(defineProps<Props>(),{});
    const toast = useToast();

    const { $apiRest } = useNuxtApp();
    const emit = defineEmits(['on:add']);
    
    const show = ref<boolean>(true);
    const showModalConfirm = ref<boolean>(false);

    const fecha =  ref(null);
    const multipleFecha = ref(false);

    const planificacionFechaACrear = ref<CreateMultiplePlanificacionFecha>(null);

    const fechasDisabled = computed(()=>{
        return props.fechasDisabled.map(fecha => {
            return convertDateStrToDateLocal(fecha)
        });
    })

    watch(()=> show.value, ()=>{
        if(!show.value){
            multipleFecha.value = false;
            fecha.value = null;
        }
    })

    watch(() => multipleFecha.value , ()=>{
        if(multipleFecha.value){
            fecha.value =  {start: null , end: null}
            return;
        }
        fecha.value = null;
    })

    const validForm = computed(()=>{
        if(!fecha.value)
            return false;
        if(multipleFecha.value &&  (!fecha.value.start && !fecha.value.end)){
            return false;
        }
        return true;
    })

    const onShowModalConfirm = ()=>{
        let fechas: string[] = multipleFecha.value ? getArrayDatesStrBetweenDates(fecha.value.start, fecha.value.end) : getArrayDatesStrBetweenDates(fecha.value, fecha.value) 

        planificacionFechaACrear.value  = {
            planificacion_id: props.planificacionId,
            fechas
        } 
        
        showModalConfirm.value = true;
    }

    const onSubmit = async()=>{

        showModalConfirm.value = false;
        
        try{
            const body: CreateMultiplePlanificacionFecha = planificacionFechaACrear.value;
            const fechasCreated = await $apiRest<PlanificacionFecha[]>(apiPlanificacionesFechaRoutes.create, HttpMethodEnum.POST, body);
            if(fechasCreated.length <= 0)
                return;

            emit('on:add', fechasCreated);
        }
        catch(message){
            toast.add({ 
                title: 'Error',
                description: message ? message : 'Error al agregar días a la planificación',
                color: 'red', 
                icon: 'i-heroicons-check-circle' 
            })
        }
    }

</script>

<template>
    <UPopover v-model:open="show">
        <UButton
            icon="tabler:calendar-plus"
            color="gray"
            variant="ghost"
            v-if="props.showSmallBtn"
        />
          
        <UButton color="primary" icon="tabler:calendar-plus" v-else> 
            Agregar nuevo día
        </UButton>
        
        <template #panel>
            <div class="flex flex-col items-center gap-4 mb-4 p-4">
                
                <UDashboardSection title="Agregar nuevo día" description="Agrega un nuevo día a la planificación y empieza a planificar sobre ese día.">
                </UDashboardSection>
                
                <div class="w-full">
                    <UCheckbox size="xl" v-model="multipleFecha" label="Elegir más de 1 día" />
                </div>

                <DatePicker v-model="fecha"  :disableWeekends="true" :range="multipleFecha" :disabledDates="fechasDisabled"/>
                
                <div class="w-full flex justify-end">
                    <UButton color="primary" icon="tabler:calendar-plus" :disabled="!validForm" @click="onShowModalConfirm"> 
                        Agregar
                    </UButton>
                </div>
            </div>
        </template>
  </UPopover>

  <ConfirmModal v-model="showModalConfirm" title="Confirmar nuevos días" description="¿Seguro deseas generar estos nuevos días a la planificación?" @onConfirm="onSubmit"></ConfirmModal>
</template>