<script setup lang="ts">
import { useAuthStore } from '~/services/authService/authService';
import type { DeactivateDTO } from '~/types/user';

const model = defineModel({
  type: Boolean
})

const toast = useToast()

const loading = ref(false)

const { deactivate, getLoggedUser } = useAuthStore()

async function onDelete(data: any) {
  loading.value = true;


  try {
    const loggedUser = await getLoggedUser();
    const deactivateData: DeactivateDTO = {
      userId: loggedUser.id,
    };

    const response = await deactivate(deactivateData);

  } catch (error) {
    console.error('Error al desactivar la cuenta:', error);
    toast.add({
      icon: 'i-heroicons-exclamation-circle',
      title: 'Ocurrió un error al desactivar la cuenta',
      color: 'red',
    });
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <UDashboardModal v-model="model" title="Desactivar cuenta"
    description="¿Estas seguro de que deseas desactivar la cuenta?" icon="i-heroicons-exclamation-circle" prevent-close
    :close-button="null" :ui="{
      icon: {
        base: 'text-red-500 dark:text-red-400'
      } as any,
      footer: {
        base: 'ml-16'
      } as any
    }">
    <template #footer>
      <UButton color="red" label="Desactivar" :loading="loading" @click="onDelete" />
      <UButton color="white" label="Cancelar" @click="model = false" />
    </template>
  </UDashboardModal>
</template>
