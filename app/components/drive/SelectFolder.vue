<script setup lang="ts">

import type { DriveFolderList, DriveFolder, ListFoldersDTO } from '~/types/google-drive';
import { apiGoogleDriveRoutes } from "~/utils/apiRoutes";
import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum';
import { DriveListModeEnum } from '~/utils/enums/DriveListModeEnum';

const {  $apiRest  } = useNuxtApp();

const loading = ref<boolean>(false);
const folders = ref<DriveFolder[]>([]);
const q = ref('');

const isRootDirectory = ref(false);
const isOpen = ref(false);

const props = defineProps({
  defaultFolderId : {
    type:  String,
    required: false
  }
});

const emit = defineEmits(['on:select']);

const openModal = async () => {
  isOpen.value = true;
  listFolders(props.defaultFolderId || null, DriveListModeEnum.ROOT);
}

const folderIdSelected = ref<string>(props.defaultFolderId || null);

const folderIsSelected = computed(()=>{
  return folderIdSelected.value !== null;
})


const listFolders = async(folderId?:string, listMode? : DriveListModeEnum) => {
  loading.value = true;
  const requestFolder: ListFoldersDTO  = { folderId, listMode };
  const data : DriveFolderList = await $apiRest(apiGoogleDriveRoutes.listFolders, HttpMethodEnum.POST, requestFolder);
  folders.value = data.folders;
  isRootDirectory.value = data.isRoot;
  loading.value = false;
}

const foldersFiltered = computed(() => {
  const search = q.value;
  if (search.trim().length == 0) {
    return folders.value;
  }
  const searchLower = search.toLowerCase();

  return folders.value.filter(folder => {
    const { name } = folder;
    const nameLower = name.toLowerCase();
    if (nameLower.includes(searchLower)) {
      return true;
    }
    return false;
  })
})

const emptyFolders = computed(()=>{
  return foldersFiltered.value.length == 0;
})

const viewFolder = (folder: DriveFolder): void =>{
  const { id } = folder;
  listFolders(id, DriveListModeEnum.NESTED);
}

const  onChangeFolder =  (folder: DriveFolder) : void =>{
  folderIdSelected.value = folder.id;
}

const onSelectFolder = () : void =>{
  if(!folderIdSelected.value)
    return;

  const folderSelected = folders.value.find(x => x.id == folderIdSelected.value);
  emit('on:select', folderSelected);
  isOpen.value = false;
}


</script>

<template>
  <UModal v-model="isOpen">
    <UCard :ui="{ header: { padding: 'p-4 sm:px-6' }, body: { padding: '' } }" class="min-w-0 min-h-[75vh]">
      <template #header>
        <div class="flex gap-2 items-center">
          <UInput v-model="q" icon="i-heroicons-magnifying-glass" placeholder="Buscar Carpeta" autofocus class="flex-1" />
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

      <UProgress animation="carousel" v-if="loading" />

      <div class="w-full overflow-y-auto max-h-full h-[75vh]">
        <div v-if="emptyFolders && !loading" class="flex flex-col justify-center items-center mt-5 text-center px-2" >
          <UIcon name="tabler:search" class="w-8 h-8"/>
          <span>
            No pudimos encontrar ningúna carpeta con ese término. Por favor inténtalo de nuevo.
          </span>
        </div>
        <ul v-else role="list" class="divide-y divide-gray-200 dark:divide-gray-800 overflow-y-auto">
          <li v-for="(folder, index) in foldersFiltered" :key="index"
            class="flex items-center justify-between gap-3 py-3 px-4 sm:px-6">
            <div class="flex items-center gap-3 w-full hover:cursor-pointer" @click="onChangeFolder(folder)">

              <div class="text-sm min-w-0 flex gap-2">
                <URadio v-model="folderIdSelected"  :value="folder.id"/>
                <UIcon name="tabler:folder" class="w-5 h-5"/>
                <p class="text-gray-900 dark:text-white font-medium truncate">
                  {{ folder.name }}
                </p>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <UDropdown position="bottom-end">
                <UButton icon="tabler:chevron-right" color="gray" variant="ghost" @click="viewFolder(folder)" />
              </UDropdown>
            </div>
          </li>
        </ul>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton
            label="Cancelar"
            color="gray"
            variant="ghost"
            @click="isOpen = false"
          />
          <UButton
            type="submit"
            label="Guardar"
            color="black"
            :disabled="!folderIsSelected"
            @click="onSelectFolder"
          />
        </div>
      </template>
     
    </UCard>
  </UModal>

  <UButton class="w-full" type="button" label="Seleccionar Carpeta" color="black" @click="openModal" />

</template>