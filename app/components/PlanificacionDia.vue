<script setup lang="ts">

import { format, parseISO, parse } from "date-fns";
import { es } from 'date-fns/locale';
import type { PlanificacionFecha } from "~/types/planificacionFecha";


interface Props {
    selectedDay: PlanificacionFecha,
    disabledNext: boolean,
    disabledBack: boolean,
    enableDates?: string[]
}

const props =  withDefaults(defineProps<Props>(), { })

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

const emit = defineEmits(["changeDate"]);

const changeDate = (direction: "prev" | "next") => {
    emit("changeDate", direction);
};

</script>


<template>
    <div
        class="absolute transition-all w-fit bottom-4 bg-primary rounded-full left-0 right-0 m-auto px-6 py-4 flex flex-row items-center justify-center">

        <button :disabled="disabledBack" :class="['w-8 h-8', disabledBack && 'opacity-0 transition-all']" @click="changeDate('prev')" ><UIcon name="i-heroicons-chevron-left-16-solid" class="w-8 h-8 text-white cursor-pointer" /></button>
        <div class="flex min-w-[80px] transition-all mx-4 text-white font-medium items-center justify-center gap-2">
              <UPopover :popper="{ placement: 'bottom-start' }">
                <template #default="{ open }">
                  <UTooltip
                    text="Elegir día desde calendario"
                    :prevent="open"
                  >
                    <UButton
                      icon="i-heroicons-clock"
                      color="white"
                      variant="ghost"
                      class="text-white hover:text-primary hover:bg-white"
                    />
                  </UTooltip>
                </template>
      
                <template #panel="{ close }">
                  <DatePicker @close="close"  :enabledDates="enableDates" :disableWeekends="true"/>
                </template>
              </UPopover>
            <span class="font-bold text-base">{{ fechaSelectedFormatted  }}</span>
        </div>
        <button :disabled="disabledNext" :class="['w-8 h-8', disabledNext && 'opacity-0 transition-all']" @click="changeDate('next')"><UIcon name="i-heroicons-chevron-left-16-solid" class="w-8 h-8 text-white cursor-pointer rotate-180" /></button>

    </div>
</template>