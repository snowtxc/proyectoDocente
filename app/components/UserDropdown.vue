<script setup lang="ts">
import { useAuthStore } from '~/utils/authStore';
import { apiAuthRoutes } from '~/utils/apiRoutes';
import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum';

defineProps<{
  // Solo el avatar, para la barra superior del celular.
  compacto?: boolean
}>()

const authStore = useAuthStore();
const { $apiRest } = useNuxtApp();
const toast = useToast()
const user = computed(() => authStore.user);
const runtimeConfig = useRuntimeConfig()


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
    onSelect: async()=>{
      try{
       const response = await $apiRest(apiAuthRoutes.logout,HttpMethodEnum.POST);
       navigateTo("/login");
       authStore.setToken(null);
       authStore.setUser(null);
      }catch(message){
        toast.error({
          message: message ? message : 'Error al deslogearse',
        })
      }
    }
  }]
])
</script>

<template>
  <UDropdownMenu
    :items="items"
    class="w-full"
  >
    <template #default>
      <button
        type="button"
        class="flex items-center gap-3 rounded-2xl text-left text-white hover:bg-white/10 transition-colors"
        :class="compacto ? 'p-1.5' : 'w-full px-3 py-2.5'"
        :aria-label="compacto ? 'Tu cuenta' : undefined"
      >
        <UAvatar
          :src="user.url_image_profile ? user.url_image_profile : runtimeConfig.public.DEFAULT_IMAGE_URL"
          :alt="user.nombre1"
          size="sm"
          class="ring-2 ring-miel-300"
        />
        <template v-if="!compacto">
          <span class="min-w-0 flex-1">
            <span class="block text-sm font-bold leading-tight truncate">{{ user.nombre1 }}</span>
            <span class="block text-xs text-mona-200 leading-tight truncate">{{ user.email }}</span>
          </span>
          <UIcon name="i-tabler-chevron-up" class="w-4 h-4 text-mona-200 flex-shrink-0" />
        </template>
      </button>
    </template>

    <template #account>
      <div class="text-left">
        <p>
          Entraste como
        </p>
        <p class="truncate font-medium text-gray-900 dark:text-white">
           {{ user.email }}
        </p>
      </div>
    </template>
  </UDropdownMenu>
</template>
