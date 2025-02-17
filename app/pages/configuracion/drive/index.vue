<script setup lang="ts">

import type { UpdateGoogleDriveInfoDTO } from '~/types/google-drive';
import { useGoogleDriveService } from '~/services/googleDriveService/googleDriveService';
import { useErrorStore } from '~/services/errorService/errorService';
import { useAuthStore  } from '~/services/authService/authService';

import {
  useTokenClient,
  type AuthCodeFlowSuccessResponse,
  type AuthCodeFlowErrorResponse,
} from "vue3-google-signin";

const authService = useAuthStore();
const errorService =   useErrorStore();

const googleDriveService = useGoogleDriveService();

const handleOnSuccess = async(response: AuthCodeFlowSuccessResponse) => {
  const { access_token } = response;
  const resp =  await authService.linkOrUpdateGoogleAccount(access_token);
  getFoldersGoogleDrive();
}

const handleOnError = (errorResponse: AuthCodeFlowErrorResponse) => {
  errorService.setError(errorResponse.error_description);
};

const { isReady, login: loginWithGoogle } = useTokenClient({
  onSuccess: handleOnSuccess,
  onError: handleOnError,
});

const form = reactive<UpdateGoogleDriveInfoDTO>({
  path_planificaciones: null,
  path_secuencias: null
})

const updating = ref(false);


const getFoldersGoogleDrive = async()=>{
  const data : { authenticated_provider: boolean , folders: string[] } = await googleDriveService.listFolders({});
   if(!data.authenticated_provider){
      loginWithGoogle();
      return;
   }
}


const onSubmit = ()=>{
  //ToDo
  return;
}

</script>

<template>
  <UDashboardPanelContent class="pb-24">

    <UForm :state="form" :validate-on="['submit']" @submit="onSubmit">
      <UDashboardSection title="Google Drive" description="Información relacionada a tu cuenta de Google Drive.">
        <template #links>
          <UButton type="submit" label="Guardar Cambios" color="black" :disabled="updating" />
        </template>

        <UFormGroup
        name="path_planificaciones"
        label="Planificaciones"
        description="Carpeta o ruta donde se guarda las planificaciones."
        class="grid grid-cols-2 gap-2 hover:cursor-pointer"
        :ui="{ container: '' }"
      >
      <div class="flex flex-col md:flex-row items-center gap-2">
          <UInput
          v-model="form.path_planificaciones"
          type="text"
          class="basis-4/5"
          autocomplete="off"
          size="md"
          icon="tabler:brand-google-drive"
          @click="getFoldersGoogleDrive"
        >
        </UInput>

        <div class="md:flex-none">
          <DriveSelectFolder ></DriveSelectFolder>
        </div>
      </div>
        
        </UFormGroup>

      <UFormGroup
      name="path_secuencias"
      label="Secuencias"
      description="Carpeta o ruta donde se guarda las secuencias."
      class="grid grid-cols-2 gap-2"
      :ui="{ container: '' }"
    >
      <UInput
        v-model="form.path_secuencias"
        type="text"
        autocomplete="off"
        size="md"
        icon="tabler:brand-google-drive"

      >
      </UInput>
    </UFormGroup>
      </UDashboardSection>
    </UForm>
  </UDashboardPanelContent>
</template>
