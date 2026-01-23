<script setup lang="ts">

import { format, parseISO, parse } from "date-fns";
import { es } from 'date-fns/locale';
import type { PlanificacionFecha } from "~/types/planificacionFecha";
import { HttpMethodEnum } from "~/utils/enums/HttpMethodEnum";


interface Props {
    planficacionId: number;  
    selectedDay: PlanificacionFecha,
    enableDates?: string[]
}

const { $apiRest } = useNuxtApp();

const props =  withDefaults(defineProps<Props>(), { })
const toast = useToast();

const showModalDeleteConfirm = ref<boolean>(false);

const fechaSelectedFormatted = computed(()=>{
    const fecha = parse(props.selectedDay.fecha, 'yyyy-MM-dd', new Date());
    let fechaFormateada = format(fecha, "iiii d 'de' MMMM", { locale: es });
    fechaFormateada = fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1);
    return fechaFormateada;
})

const enableDates = computed(()=>{ 
  if(!props.enableDates)
    return null;

  const dates = props.enableDates.map(dateStr =>{
    return convertDateStrToDateLocal(dateStr);
  })
  return dates;
})

const emit = defineEmits(["changeDate", "changeDirection",'onDelete']);

const changeDate = (direction: "prev" | "next") => {
    emit("changeDirection", direction);
};

const fechaPickerSelected = ref(null);

watch(()=> fechaPickerSelected.value, ()=>{
  if(fechaPickerSelected.value){
    emit("changeDate", format(fechaPickerSelected.value,'yyyy-MM-dd'));
  }
})

const onDelete = async()=>{

  showModalDeleteConfirm.value = false;

  try{
    const result = await $apiRest(apiPlanificacionesFechaRoutes.remover(props.selectedDay.id), HttpMethodEnum.DELETE , {
      planificacion_id : props.planficacionId,
      planificacion_fecha_id : props.selectedDay.id
     });

     if(result.status == true){
      toast.success({
          title: "Fecha de la planificacion eliminada",
          message: "Se ha eliminado la fecha de la planificacion con exito",
          color: "green"
      })

      emit('onDelete');
     }

  }catch(message){
    toast.error({
      title: "Error",
      message: message ? message : 'Error al crear el grupo',
      color: "red"
    })
  }
}

</script>


<template>
    <div
        class="absolute transition-all w-fit bottom-4 bg-primary rounded-full left-0 right-0 m-auto px-6 py-4 flex flex-row items-center justify-center">
          
        <button v-if="props.enableDates[0] !== props.selectedDay.fecha" :class="['w-8 h-8']" @click="changeDate('prev')" ><UIcon name="i-heroicons-chevron-left-16-solid" class="w-8 h-8 text-white cursor-pointer" /></button>
        <div class="flex min-w-[80px] transition-all mx-4 text-white font-medium items-center justify-center gap-2">
              <UPopover :popper="{ placement: 'bottom-start' }">
                <template #default="{ open }">
                  <UTooltip
                    text="Elegir día desde calendario"
                    :prevent="open"
                  >
                    <UButton
                      icon="i-heroicons-clock"
                      color="neutral"
                      variant="ghost"
                      class="text-white hover:text-primary hover:bg-white"
                    />
                  </UTooltip>
                </template>
      
                <template #content="{ close }">
                  <DatePicker  v-model="fechaPickerSelected" @close="close"  :enabledDates="enableDates" :disableWeekends="true"/>
                </template>
              </UPopover>
            <span class="font-bold text-base">{{ fechaSelectedFormatted  }}</span>
             <UTooltip
                    text="Eliminar fecha"
                  >
                    <UButton
                      icon="tabler:trash"
                      color="neutral"
                      variant="ghost"
                      class="text-white hover:text-primary hover:bg-white"
                      @click="showModalDeleteConfirm = true"
                    />
                  </UTooltip>
        </div>
        <button v-if="props.enableDates[props.enableDates.length - 1] !== props.selectedDay.fecha" :class="['w-8 h-8']" @click="changeDate('next')"><UIcon name="i-heroicons-chevron-left-16-solid" class="w-8 h-8 text-white cursor-pointer rotate-180" /></button>

    </div>

    <ConfirmModal 
      v-model="showModalDeleteConfirm"
      title="Eliminar fecha" 
      description="¿Deseás eliminar este dia de la planificacion?." 
      @onConfirm="onDelete"
      @onClose="showModalDeleteConfirm = false">
</ConfirmModal>
</template>