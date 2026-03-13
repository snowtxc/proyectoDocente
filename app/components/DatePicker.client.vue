<script setup lang="ts">
import { useBreakpoints, breakpointsTailwind } from '@vueuse/core'
import { DatePicker as VCalendarDatePicker } from 'v-calendar'
// @ts-expect-error - no types available
import type { DatePickerDate, DatePickerRangeObject } from 'v-calendar/dist/types/src/use/datePicker'
import 'v-calendar/dist/style.css'
import { format } from 'date-fns'


const calendarLocale = {
  id: 'es',
  firstDayOfWeek: 2,
  dayNames: [
    'Domingo','Lunes','Martes','Miércoles',
    'Jueves','Viernes','Sábado'
  ],
  dayNamesShort: ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'],
  monthNames: [
    'Enero','Febrero','Marzo','Abril','Mayo','Junio',
    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
  ],
  monthNamesShort: [
    'Ene','Feb','Mar','Abr','May','Jun',
    'Jul','Ago','Sep','Oct','Nov','Dic'
  ],
}

const getDatesBetween = (from: Date, end: Date): Date[] => {
  const dateArray: Date[] = [];
  const currentDate = new Date(from);
  const endTime = end.getTime();

  while (currentDate.getTime() <= endTime) {
    dateArray.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dateArray;
}

defineOptions({
  inheritAttrs: false
})

const props = defineProps({
  modelValue: {
    type: [Date, Object] as PropType<DatePickerDate | DatePickerRangeObject | null>,
    default: null
  },
  enabledDates: {
    type: [Array],
    default: null
  },

  disabledDates: {
    type: [Array],
    default: null
  },

  disableWeekends: {
    type: Boolean,
    dafault: null,
    required: false
  },

  range: {
    type: Boolean,
    default: false
  },

  highlightedDates: {
    type: Array,
    required: false
  }
})


const disabledDates = computed(() => {
  if ((!props.enabledDates || props.enabledDates.length == 0) && !props.disableWeekends)
    return null;

  let fechasDisabled = [];

  if (props.enabledDates) {
    const enableDates = props.enabledDates as Date[];

    const orderAscDates = enableDates.sort((a: Date, b: Date) => a.getTime() - b.getTime());

    orderAscDates.reduce((previousValue: Date, currentValue: Date) => {

      if (previousValue == null) {
        const end = new Date(currentValue)
        end.setDate(end.getDate() - 1);
        fechasDisabled.push({ start: null, end });
        return currentValue;
      }

      const datesBetween = getDatesBetween(previousValue, currentValue);


      if (datesBetween.length <= 2)
        return currentValue;

      if (datesBetween.length == 3) {
        fechasDisabled.push({ start: new Date(datesBetween[1]), end: new Date(datesBetween[1]) })
        return currentValue;
      }

      fechasDisabled.push({ start: new Date(datesBetween[1]), end: new Date(datesBetween[datesBetween.length - 2]) })
      return currentValue;

    }, null)

    const lastDay = new Date(orderAscDates[orderAscDates.length - 1]);
    lastDay.setDate(lastDay.getDate() + 1);
    fechasDisabled.push({ start: lastDay, end: null });

  }

  if (props.disableWeekends) {

    fechasDisabled.push({
      repeat: {
        weekdays: [1, 7],
      },
    });
  }

  if(props.disabledDates){
    props.disabledDates.map(fecha =>{
      fechasDisabled.push({start: fecha, end: fecha});
    })
  }

  return fechasDisabled;
})

const emit = defineEmits(['update:model-value', 'close'])

const date = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:model-value', value)
    emit('close')
  }
})

const breakpoints = useBreakpoints(breakpointsTailwind)

const smallerThanSm = breakpoints.smaller('sm')

const attrs = ref({
  'transparent': true,
  'borderless': true,
  'color': 'yellow',
  'is-dark': { selector: 'html', darkClass: 'dark' },
  'first-day-of-week': 2,
  'dot': true,
  'dates': new Date(),
  'highlight': true
});

const  attributes = computed(() => {
  if(!props.highlightedDates){
    return {}
  }
  return props.highlightedDates.map((date: Date) => ({
    key: `fecha utilizada -${format(date,'dd/MM/yyyy')}`,
    dates: date,
    color:'yellow',
    dot: true, //Se Agrega un punto en la fecha
  }));
});


</script>

<template>
  <VCalendarDatePicker v-if="props.range"
    :locale="calendarLocale"
    v-model.range="date" :columns="smallerThanSm ? 1 : 2" :rows="smallerThanSm ? 2 : 1" v-bind="{ ...attrs, ...$attrs }"
    :disabled-dates="disabledDates"
    color="primary" 
    :attributes="attributes"/>
  <VCalendarDatePicker v-else v-model="date" v-bind="{ ...attrs, ...$attrs }" :disabled-dates="disabledDates"  :attributes="attributes"/>

</template>

<style scoped>
/* DÍA SELECCIONADO */
:deep(.vc-day.is-selected),
:deep(.vc-day.is-selected .vc-day-content) {
  background-color: rgb(var(--color-primary-600)) !important;
  color: white !important;
}

/* RANGO ENTRE FECHAS */
:deep(.vc-day.is-between),
:deep(.vc-day.is-between .vc-day-content) {
  background-color: rgb(var(--color-primary-200)) !important;
  color: rgb(var(--color-primary-900)) !important;
}

/* INICIO Y FIN DEL RANGO */
:deep(.vc-day.is-start),
:deep(.vc-day.is-end),
:deep(.vc-day.is-start .vc-day-content),
:deep(.vc-day.is-end .vc-day-content) {
  background-color: rgb(var(--color-primary-600)) !important;
  color: white !important;
}

/* DARK MODE */
:deep(.dark .vc-day.is-selected),
:deep(.dark .vc-day.is-selected .vc-day-content),
:deep(.dark .vc-day.is-start),
:deep(.dark .vc-day.is-end) {
  background-color: rgb(var(--color-primary-700)) !important;
  color: white !important;
}

:deep(.dark .vc-day.is-between),
:deep(.dark .vc-day.is-between .vc-day-content) {
  background-color: rgb(var(--color-primary-900)) !important;
  color: rgb(var(--color-primary-100)) !important;
}


</style>