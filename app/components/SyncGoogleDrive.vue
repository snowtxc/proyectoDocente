<script setup lang="ts">

import type { DriveFolder, SyncFileResult } from '~/types/google-drive';
import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum';

import {
  useCodeClient,
  type ImplicitFlowSuccessResponse,
  type ImplicitFlowErrorResponse,
  type ImplicitFlowOptions
} from "vue3-google-signin";

import { TypeItemSyncGoogleDrive } from '~/utils/enums/typeItemSyncGoogleDrive';

interface Props {
   id : number; // puede ser de secuencia o planificacion
   type: TypeItemSyncGoogleDrive,
}

const props = withDefaults(defineProps<Props>(),{});

const { $apiRest } = useNuxtApp();
const toast = useToast();

const open = ref(true);
const responseResult = ref<SyncFileResult>(null);

const emit = defineEmits(['on-close']);

onMounted(()=>{
  sync();
})

const googleSignInOptions: ImplicitFlowOptions = {
  scope: googleScopes,
  onSuccess: async(responseGoogle: ImplicitFlowSuccessResponse) => {
    try{

      const { code } = responseGoogle;
      const response =  await $apiRest(apiAuthRoutes.linkOrUpdateGoogleAccount, HttpMethodEnum.POST, { code });

      if(response && response.id){
        // Volver a sincronizar
        sync();
      }else{
        toast.error({
          title: "Error",
          message: "Ha ocurrido un error al sincronizar tu cuenta de google.",
          color: "red"
        });
      }

    }catch(message){
      toast.error({
        title: "Error",
        message,
        color: "red"
      });
    }
   
  },
  onError: (errorResponse: ImplicitFlowErrorResponse) => {
    toast.error({
      title: "Error",
      message: errorResponse.error_description,
      color: "red"
    })
  }
};

const { isReady, login: loginWithGoogle } = useCodeClient(googleSignInOptions);

const sync = async()=>{
  try{
    const response = 
    props.type == TypeItemSyncGoogleDrive.PLANIFICACION ?    
        await $apiRest<SyncFileResult>(apiPlanificacionesRoutes.sincronizarGoogleDrive(props.id), HttpMethodEnum.POST) :
     props.type == TypeItemSyncGoogleDrive.SECUENCIA ? 
         await $apiRest<SyncFileResult>(apiSecuenciasRoutes.sincronizarGoogleDrive(props.id), HttpMethodEnum.POST) : null;
  
    if(!response.status && response.relogin){
      loginWithGoogle();
      return;
    } 
    
    responseResult.value = response;

  }catch(message){
    toast.error({
      title: "Error",
      message: message ? message : props.type == TypeItemSyncGoogleDrive.PLANIFICACION ? 'Error al sincronizar la planificacion con google drive.' : 'Error al sincronizar la secuencia con google drive.',
      color: "red"
    })
  }
}

const openFileDrive = (link: string)=>{
    window.open(link, '_blank');
}

</script>

<template>
   <UModal v-model:open="open"  @close="emit('on-close')">
    <template #content>
      <UCard variant="subtle">
        <template #header>
          <div class="flex justify-center">
            <img
              src="/google-drive.png"
              alt="Google drive icono"
              class="w-32"
            >
          </div>

        </template>
          <h1 class="text-center font-bold" v-if="responseResult">Sincronizado! 😁</h1>
          <h1 class="text-center font-bold" v-else>Sincronizando ... ⏳</h1>

          <div v-if="responseResult" class="w-full flex flex-col md:flex-row items-center gap-2">
            <UInput v-model="responseResult.link" type="text" autocomplete="off" disabled class="w-full flex-1" 
              icon="tabler:brand-google-drive">
            </UInput>
             <UButton
              icon="tabler:window-maximize"
              color="primary"
              class="flex-none"
              square
              variant="outline"
              @click="openFileDrive(responseResult.link)"
              />
          </div>

         <UProgress size="xl" color="primary" v-else/>

        <template #footer>
          <Placeholder class="h-8" />
        </template>
      </UCard>
    </template>
    
   </UModal>
</template>
