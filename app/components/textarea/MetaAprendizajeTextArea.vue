<script setup lang="ts">

    import FlopiBot from '../flopi-bot/FlopiBot.vue';

    interface Props {
        modelValue: string;
        disabled?: boolean;
    }

    const props = withDefaults(defineProps<Props>(), {
        modelValue: null,
    });

    const emit = defineEmits(['update:model-value']);

    const value = ref(props.modelValue);

    const isOpen = ref(false);

    const onSave = ()=>{
        isOpen.value = false;
        emit('update:model-value', value.value);
    }

</script>

<template>
    <UButton
      icon="tabler:pencil"
      size="sm"
      color="primary"
      variant="outline"
      @click="isOpen = true"
      :disabled="props.disabled"
  />

  
  <UModal fullscreen title="Modal fullscreen" v-model="isOpen">  
    <UCard
      :ui="{ header: { padding: 'p-4 sm:px-6' }, body: { padding: '' } }"
      class="min-w-0 min-h-screen flex flex-col"
    >
      <template #header>
        <div class="flex gap-2 justify-between items-center mt-2">
            <h1 class="font-medium text-xl">Meta de Aprendizaje</h1>

            <UButton
            icon="tabler:x"
            size="sm"
            color="primary"
            square
            variant="solid"
            class="flex-none"
            @click="isOpen = false;"
            />
        </div>
      </template>
  
      <!-- Contenido que crece -->
      <div class="flex-1 px-2 mt-2">
        <div class="flex justify-end py-2">
          <FlopiBot></FlopiBot>
        </div>
        <UTextarea v-model="value" class="w-full h-full" :rows="25" />
      </div>
  
      <template #footer>
        <div class="flex justify-end gap-3 items-end h-full">
          <UButton
            label="Cancelar"
            color="gray"
            variant="ghost"
            @click="isOpen = false"
          />
          <UButton
            type="button"
            label="Guardar"
            color="black"
            @click="onSave"
          />
        </div>
      </template>
    </UCard>
  </UModal>
  

</template>