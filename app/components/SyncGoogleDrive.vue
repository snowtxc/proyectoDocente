<script setup lang="ts">

import type { DriveFolder, SyncFileResult } from '~/types/google-drive';
import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum';

import {
  useCodeClient,
  type ImplicitFlowSuccessResponse,
  type ImplicitFlowErrorResponse,
  type ImplicitFlowOptions
} from "vue3-google-signin";
import type { UserConfig } from '~/types/userConfig';
import SelectFolder from './drive/SelectFolder.vue';
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
const showModalSelectFolder = ref<boolean>(false);

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

        const config: UserConfig = await $apiRest(apiUserConfigRoutes.getConfig, HttpMethodEnum.GET);
        const { drive_secuencias_folder_id } = config;
        
        if(!drive_secuencias_folder_id){
          // se abre la carpeta para seleccionar.
          showModalSelectFolder.value = true;
        }else{
            sync();
        }
      }else{
        toast.add({
          title: "Error",
          description: "Ha ocurrido un error al sincronizar tu cuenta de google.",
          color: "red"
        });
      }

    }catch(message){
      toast.add({
        title: "Error",
        description: message,
        color: "red"
      });
    }
   
  },
  onError: (errorResponse: ImplicitFlowErrorResponse) => {
    toast.add({
      title: "Error",
      description: errorResponse.error_description,
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
    toast.add({
      title: "Error",
      description: message ? message : props.type == TypeItemSyncGoogleDrive.PLANIFICACION ? 'Error al sincronizar la planificacion con google drive.' : 'Error al sincronizar la secuencia con google drive.',
      color: "red"
    })
  }
}

const openFileDrive = (link: string)=>{
    window.open(link, '_blank');
}

const updateFolderId = async(folder: DriveFolder) =>{

  const { id ,name  } = folder;

  const config: UserConfig =  props.type == TypeItemSyncGoogleDrive.PLANIFICACION ? 
  {
    drive_planificaciones_folder_id : id,
    drive_planificaciones_folder_name: name
  }: 
  {
    drive_secuencias_folder_id : id,
    drive_secuencias_folder_name : name
  }

  try {
    const data = await $apiRest(apiUserConfigRoutes.updateConfig, HttpMethodEnum.POST, config);
    
    if(data){
      // una vez actualizado la carpeta mandamos a actualizar
      open.value = true;
      sync();
    }
  } catch {
    toast.add({
      title: "Error",
      description: "No se ha podido actualizar la configuración de Google Drive. Por favor intentelo más tarde.",
      color: "red"
    })
  }
}

</script>

<template>
   <UModal v-model:model-value="open"  @close="emit('on-close')">
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

         <UProgress size="xl" color="green" v-else/>

        <template #footer>
          <Placeholder class="h-8" />
        </template>
      </UCard>
   </UModal>

  <SelectFolder
  v-if="showModalSelectFolder"
  :openInstant="true"
  @on:select="updateFolderId"
  :hideButton="true"
  ></SelectFolder>
</template>
