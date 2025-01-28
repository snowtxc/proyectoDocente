<script setup lang="ts">

const props = defineProps({
    selectedDay: {
        id: String,
        fecha: String
    },
    disabledBack: Boolean,
    disabledNext: Boolean,
})

const emit = defineEmits(["changeDate"]);

const changeDate = (direction: "prev" | "next") => {
    emit("changeDate", direction);
};

</script>


<template>
    <div
        class="absolute transition-all w-fit bottom-4 bg-neutral-900 rounded-full left-0 right-0 m-auto px-6 py-4 flex flex-row items-center justify-center">

        <button :disabled="disabledBack" :class="['w-8 h-8', disabledBack && 'opacity-0 transition-all']" @click="changeDate('prev')" ><UIcon name="i-heroicons-chevron-left-16-solid" class="w-8 h-8 text-white cursor-pointer" /></button>
        <div class="flex min-w-[150px] transition-all mx-4 text-white font-medium items-center justify-center gap-2">
            <UIcon name="i-heroicons-calendar" class="w-5 h-5" />
            <span class="font-bold text-base">{{ selectedDay?.fecha }}</span>
        </div>
        <button :disabled="disabledNext" :class="['w-8 h-8', disabledNext && 'opacity-0 transition-all']" @click="changeDate('next')"><UIcon name="i-heroicons-chevron-left-16-solid" class="w-8 h-8 text-white cursor-pointer rotate-180" /></button>

    </div>
</template>