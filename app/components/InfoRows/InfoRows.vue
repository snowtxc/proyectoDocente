<script setup lang="ts">
import type { JSX } from 'vue/jsx-runtime';


type Row = { key: string; value: any, slotName?: string, };

defineProps<{
  rows: Row[];
}>();

</script>


<template>
    <div class="w-full rounded-lg overflow-hidden border-2 border-gray-300 h-auto p-0">
        <div
      v-for="(row, index) in rows"
      :key="index"
      :class="`row-item flex flex-row items-center overflow-hidden justify-start ${index + 1 !== rows.length ? `border-b-2` : `border-none`} border-gray-300 ${index % 2 === 0 ? `bg-gray-100` : `bg-white`}`"
    >
    <div class="w-[25%] px-5 py-3"><span class="font-semibold">{{ row.key  }}</span></div>
    <div class="flex flex-grow w-full border-l-2 border-gray-300 items-center justify-start px-5 py-4">
        <slot v-if="row?.slotName" :name="row?.slotName"></slot>
        <span class="font-normal text-base text-neutral-700" v-else>{{ row.value }}</span>
      </div>
    </div>
    </div>
</template>