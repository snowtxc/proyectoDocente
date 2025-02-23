<script setup lang="ts">

import type { UpdateGoogleDriveInfoDTO } from '~/types/userConfig';
import { useGoogleDriveService } from '~/services/googleDriveService/googleDriveService';
import { useErrorStore } from '~/services/errorService/errorService';
import { useNuxtApp } from "#app";

import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum';

import type { DriveFolder } from '~/types/google-drive';

import type { UserConfig } from '~/types/userConfig.ts';

import {
  useTokenClient,
  type AuthCodeFlowSuccessResponse,
  type AuthCodeFlowErrorResponse,
} from "vue3-google-signin";

import { apiAuthRoutes, apiUserConfigRoutes } from "~/utils/apiRoutes";

const { start, finish } = useLoadingIndicator();
const toast = useToast();
const { $apiRest } = useNuxtApp();

const config: UserConfig = await $apiRest(apiUserConfigRoutes.getConfig, HttpMethodEnum.GET);

const { drive_planificaciones_folder_name, drive_planificaciones_folder_id, drive_secuencias_folder_id, drive_secuencias_folder_name } = config;

const form = reactive<UpdateGoogleDriveInfoDTO>({
  drive_planificaciones_folder_id,
  drive_planificaciones_folder_name,
  drive_secuencias_folder_id,
  drive_secuencias_folder_name
})

const authService = useAuthStore();
const errorService = useErrorStore();

const googleDriveService = useGoogleDriveService();

const handleOnSuccess = async (response: AuthCodeFlowSuccessResponse) => {
  const { access_token } = response;
  const resp =  await $apiRest(apiAuthRoutes.linkOrUpdateGoogleAccount, HttpMethodEnum.POST, {access_token});
  getFoldersGoogleDrive();
}

const handleOnError = (errorResponse: AuthCodeFlowErrorResponse) => {
  errorService.setError(errorResponse.error_description);
};

const { isReady, login: loginWithGoogle } = useTokenClient({
  onSuccess: handleOnSuccess,
  onError: handleOnError,
});

const updating = ref(false);

const getFoldersGoogleDrive = async () => {
  const data: { authenticated_provider: boolean, folders: string[] } = await googleDriveService.listFolders({});
  if (!data.authenticated_provider) {
    loginWithGoogle();
    return;
  }
}

const onChangePlanificacionesFolder = async (folder: DriveFolder) => {
  const { id, name } = folder;
  form.drive_planificaciones_folder_id = id;
  form.drive_planificaciones_folder_name = name;
}

const onChangeSecuenciasFolder = async(folder: DriveFolder) =>{
  const { id ,name  } = folder;
  form.drive_secuencias_folder_id = id;
  form.drive_secuencias_folder_name = name;
}

const onSubmit = async () => {

  const { drive_planificaciones_folder_id, drive_planificaciones_folder_name ,drive_secuencias_folder_id, drive_secuencias_folder_name } = form;

  const config: UserConfig = {
    drive_planificaciones_folder_id,
    drive_planificaciones_folder_name,
    drive_secuencias_folder_id,
    drive_secuencias_folder_name
  }

  try {
    start();
    const data = await $apiRest(apiUserConfigRoutes.updateConfig, HttpMethodEnum.POST, config);
    finish();
    toast.add({
      title: "Configuración actualizada",
      description: "Se ha actualizado la configuración de Google Drive éxitosamente.",
      color: "green"
    })
  } catch {
    finish();
    toast.add({
      title: "Error",
      description: "No se ha podido actualizar la configuración de Google Drive. Por favor intentelo más tarde.",
      color: "red"
    })
  }
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

        <UFormGroup name="path_planificaciones" label="Planificaciones"
          description="Carpeta o ruta donde se guarda las planificaciones."
          class="grid grid-cols-2 gap-2 hover:cursor-pointer" :ui="{ container: '' }">
          <div class="flex flex-col md:flex-row items-center gap-2">
            <UInput v-model="form.drive_planificaciones_folder_name" type="text" disabled class="basis-4/5"
              autocomplete="off" size="md" icon="tabler:brand-google-drive" @click="getFoldersGoogleDrive">
            </UInput>

            <!--Planificaciones-->
            <div class="md:flex-none">
              <DriveSelectFolder 
                @on:select="onChangePlanificacionesFolder"
                :defaultFolder="{
                  name: form.drive_planificaciones_folder_name,
                  id: form.drive_planificaciones_folder_id
                }"
                :defaultFolderId="form.drive_planificaciones_folder_id"></DriveSelectFolder>
            </div>
          </div>

        </UFormGroup>

        <UFormGroup name="path_secuencias" label="Secuencias"
          description="Carpeta o ruta donde se guarda las secuencias." class="grid grid-cols-2 gap-2"
          :ui="{ container: '' }">
          <div class="flex flex-col md:flex-row items-center gap-2">
            <UInput v-model="form.drive_secuencias_folder_name" type="text" autocomplete="off" disabled class="basis-4/5" size="md"
              icon="tabler:brand-google-drive">
            </UInput>

            <!--Secuencias-->
            <div class="md:flex-none">
              <DriveSelectFolder 
                @on:select="onChangeSecuenciasFolder"
                :defaultFolder="{
                  name: form.drive_secuencias_folder_name,
                  id: form.drive_secuencias_folder_id
                }"></DriveSelectFolder>
            </div>
          </div>

        </UFormGroup>
      </UDashboardSection>
    </UForm>
  </UDashboardPanelContent>
</template>
