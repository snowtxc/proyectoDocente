<script setup lang="ts">
import {  format } from 'date-fns'
import es from 'date-fns/locale/es';

interface Props {
    modelValue: { start: Date, end: Date },
    defaultRangeDate?: {  start: Date, end: Date },
    classes? : string,
    disabled? : boolean;
}

const emit = defineEmits(['update:model-value'])

const props = withDefaults(defineProps<Props>() , {});

const selected = ref({...props.modelValue});

watch(() => props.modelValue, (newVal) => {
  selected.value = { ...newVal };
});

watch(selected, (newVal) => {
  emit('update:model-value', newVal);
}, { deep: true });

</script>

<template>
  <UPopover :popper="{ placement: 'bottom-start' }">
    <UButton icon="i-heroicons-calendar-days-20-solid" :class="props.classes || ''" :disabled="props.disabled">
      {{ format(selected.start, 'd MMM, yyy',{ locale : es}) }} - {{ format(selected.end, 'd MMM, yyy',{ locale : es}) }}
    </UButton>

    <template #panel="{ close }">
      <div class="flex items-center sm:divide-x divide-gray-200 dark:divide-gray-800">

        <DatePicker v-model="selected" @close="close" />
      </div>
    </template>
  </UPopover>
</template>