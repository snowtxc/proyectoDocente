<script setup lang="ts">
import { useBreakpoints, breakpointsTailwind } from '@vueuse/core'
import { DatePicker as VCalendarDatePicker } from 'v-calendar'
// @ts-expect-error - no types available
import type { DatePickerDate, DatePickerRangeObject } from 'v-calendar/dist/types/src/use/datePicker'
import 'v-calendar/dist/style.css'


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
  'color': 'primary',
  'is-dark': { selector: 'html', darkClass: 'dark' },
  'first-day-of-week': 2,

});

</script>

<template>
  <VCalendarDatePicker v-if="props.range"
    v-model.range="date" :columns="smallerThanSm ? 1 : 2" :rows="smallerThanSm ? 2 : 1" v-bind="{ ...attrs, ...$attrs }"
    :disabled-dates="disabledDates" />
  <VCalendarDatePicker v-else v-model="date" v-bind="{ ...attrs, ...$attrs }" :disabled-dates="disabledDates" />

</template>

<style>
:root {
  --vc-gray-50: rgb(var(--color-gray-50));
  --vc-gray-100: rgb(var(--color-gray-100));
  --vc-gray-200: rgb(var(--color-gray-200));
  --vc-gray-300: rgb(var(--color-gray-300));
  --vc-gray-400: rgb(var(--color-gray-400));
  --vc-gray-500: rgb(var(--color-gray-500));
  --vc-gray-600: rgb(var(--color-gray-600));
  --vc-gray-700: rgb(var(--color-gray-700));
  --vc-gray-800: rgb(var(--color-gray-800));
  --vc-gray-900: rgb(var(--color-gray-900));
}

.vc-primary {
  --vc-accent-50: rgb(var(--color-primary-50));
  --vc-accent-100: rgb(var(--color-primary-100));
  --vc-accent-200: rgb(var(--color-primary-200));
  --vc-accent-300: rgb(var(--color-primary-300));
  --vc-accent-400: rgb(var(--color-primary-400));
  --vc-accent-500: rgb(var(--color-primary-500));
  --vc-accent-600: rgb(var(--color-primary-600));
  --vc-accent-700: rgb(var(--color-primary-700));
  --vc-accent-800: rgb(var(--color-primary-800));
  --vc-accent-900: rgb(var(--color-primary-900));
}
</style>
