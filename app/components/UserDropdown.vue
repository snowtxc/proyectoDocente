<script setup lang="ts">
import { useAuthStore } from '~/utils/authStore';
import { apiAuthRoutes } from '~/utils/apiRoutes';
import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum';

const authStore = useAuthStore();
const { $apiRest } = useNuxtApp();
const toast = useToast()
const user = computed(() => authStore.user);

const items = computed(() => [
  [{
    slot: 'account',
    label: '',
    disabled: true
  }], [{
    label: 'Configuración',
    icon: 'i-heroicons-cog-8-tooth',
    to: '/configuracion'
  },
  {
    label: 'Salir',
    icon: 'tabler:logout',
    click: async()=>{
      try{
       const response = await $apiRest(apiAuthRoutes.logout,HttpMethodEnum.POST);
       navigateTo("/login");
       authStore.setToken(null);
       authStore.setUser(null);
      }catch(message){
        toast.add({
          title: "Error",
          description: message ? message : 'Error al deslogearse',
          color: "red"
        })
      }
    }
  }]
])
</script>

<template>
  <UDropdown
    mode="hover"
    :items="items"
    :ui="{ width: 'w-full', item: { disabled: 'cursor-text select-text' } }"
    :popper="{ strategy: 'absolute', placement: 'top' }"
    class="w-full"
  >
    <template #default="{ open }">
      <UButton
        color="gray"
        variant="ghost"
        class="w-full"
        :label="user.nombre1"
        :class="[open && 'bg-gray-50 dark:bg-gray-800']"
      >
        <template #leading>
          <UAvatar
            :src="user.url_image_profile"
            size="2xs"
          />
        </template>

        <template #trailing>
          <UIcon
            name="i-heroicons-ellipsis-vertical"
            class="w-5 h-5 ml-auto"
          />
        </template>
      </UButton>
    </template>

    <template #account>
      <div class="text-left">
        <p>
          Se inició sesión como
        </p>
        <p class="truncate font-medium text-gray-900 dark:text-white">
           {{ user.email }}
        </p>
      </div>
    </template>
  </UDropdown>
</template>
