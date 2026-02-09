<script setup lang="ts">
import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum';

const model = defineModel({
  type: Boolean
})

const toast = useToast()


const loading = ref(false)

const emit = defineEmits(['on:close']);

const { $apiRest } = useNuxtApp();
const authStore = useAuthStore();

async function onDelete() {

  loading.value = true

  try{
       const response = await $apiRest<{status: boolean, message: string}>(apiAuthRoutes.deactivate, HttpMethodEnum.POST);
    
        if(response.status){
            toast.success({ icon: 'i-heroicons-check-circle', title: response.message })
            authStore.setToken(null);
            authStore.setUser(null);
            await navigateTo({ path: '/login' })

        }else{
            toast.error({
                title: "Error",
                  message: response.message,
                color: "red"
            });
            loading.value = false;
        }

    }catch(message){
      toast.error({
          title: "Error",
            message,
          color: "red"
      });
      loading.value = false;
    }
}

  
</script>

<template>
  <UModal
    v-model:open="model"
    title="Eliminar Cuenta"
    description="¿Estás seguro que deseas eliminar tu cuenta?"
    icon="i-heroicons-exclamation-circle"
    :close="{ onClick: () => emit('on:close') }"
  >
    <template #footer>
      <UButton
        color="error"
        label="Eliminar Cuenta"
        :loading="loading"
        @click="onDelete"
      />
      <UButton
        color="neutral"
        label="Cancel"
        @click="emit('on:close')"
      />
    </template>
  </UModal>
</template>
