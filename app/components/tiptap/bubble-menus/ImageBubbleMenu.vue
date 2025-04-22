<script setup lang="ts">
import { AlignEnum } from '~/utils/enums/AlignEnum';

const range = ref(0);
const emit = defineEmits(['update:range', 'on-align-event']);

watch(range, (newValue) => {
    emit('update:range', newValue);
});

</script>

<template>
    <UCard class="max-w-sm w-full mx-auto bg-white/75 dark:bg-white/5 backdrop-blur">
        <div class="flex items-center">
            <UButton
                color="gray"
                variant="ghost"
                icon="tabler:align-box-left-bottom"
                @click="emit('on-align-event',AlignEnum.LEFT)"
            ></UButton>

            <UButton
                color="gray"
                variant="ghost"
                icon="tabler:align-box-center-bottom"
                @click="emit('on-align-event',AlignEnum.CENTER)"

            ></UButton>

            <UButton
                color="gray"
                variant="ghost"
                icon="tabler:align-box-right-stretch"
                @click="emit('on-align-event',AlignEnum.RIGHT)"

            ></UButton>

            <URange v-model="range" class="min-w-40"/>
        </div>
    </UCard>
    
</template>

<style scoped>

</style>

