<script lang="ts" setup>

    interface Props {
        label: string;
        modelValue: string,
        disabled?: boolean
    }

    const props = withDefaults(defineProps<Props>(), {
        modelValue: null,
    });
    
    const emit = defineEmits(['update:model-value'])

    const isOpen = ref(false);

    const value = ref(props.modelValue);

    const onSave = () : void =>{  
      emit('update:model-value', value.value);
      isOpen.value = false;
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

  <UModal v-model="isOpen">
      <UCard :ui="{ header: { padding: 'p-4 sm:px-6' }, body: { padding: '' } }" class="min-w-0 min-h-[75vh] p-4">
        <UFormGroup :label="props.label" name="name">
            <UTextarea v-model="value" class="w-full h-full mt-4" :rows="25" />
        </UFormGroup>

         <div class="flex w-full justify-end gap-3 mt-4">
              <UButton label="Cancelar" color="gray" variant="ghost" @click="isOpen = false" />
              <UButton type="submit" @click="onSave" label="Guardar" color="black"/>
          </div>
      </UCard>
  </UModal>
</template>
<style>

</style>