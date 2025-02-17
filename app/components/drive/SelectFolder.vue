<script setup lang="ts">

import { useGoogleDriveService } from '~/services/googleDriveService/googleDriveService';
import type { DriveFolder } from '~/types/google-drive';

const googleDriveService = useGoogleDriveService();

const links = [{
  id: 'home',
  label: 'Inicio',
  icon: 'i-heroicons-home',
  to: '/home',
  tooltip: {
    text: 'Inicio',
    shortcuts: []
  }
},
{
  id: 'grupos',
  label: 'Grupos',
  icon: 'healthicons:i-groups-perspective-crowd-outline',
  to: '/grupos',
  tooltip: {
    text: 'Grupos',
    shortcuts: []
  }
},

{
  id: 'planificaciones',
  label: 'Planificaciones',
  icon: 'i-heroicons-home',
  to: '/planificaciones',
  tooltip: {
    text: 'Planificaciones',
    shortcuts: []
  }
},
{
  id: 'secuencias',
  label: 'Secuencias',
  icon: 'i-heroicons-home',
  to: '/secuencias',
  tooltip: {
    text: 'Secuencias',
    shortcuts: [],
  }
}]

const groups = [{
  key: 'links',
  label: 'Ir a',
  commands: links.map(link => ({ ...link, shortcuts: link.tooltip?.shortcuts }))
}]

const loading = ref<boolean>(false);
const folders = ref<DriveFolder[]>([]);
const q = ref('');

const isOpen = ref(false);

const openModal = async () => {
  isOpen.value = true;
  loading.value = true;
  const data = await googleDriveService.listFolders({});
  loading.value = false;
  folders.value = data;
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


</script>

<template>
  <UModal v-model="isOpen">
    <UCard :ui="{ header: { padding: 'p-4 sm:px-6' }, body: { padding: '' } }" class="min-w-0 min-h-[80vh]">
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

      <div class="w-full overflow-y-auto max-h-full" v-else>
        <div v-if="emptyFolders" class="flex flex-col justify-center items-center mt-5 text-center px-2" >
          <UIcon name="tabler:search" class="w-8 h-8"/>
          <span>
            No pudimos encontrar ningúna carpeta con ese término. Por favor inténtalo de nuevo.
          </span>
        </div>
        <ul v-else role="list" class="divide-y divide-gray-200 dark:divide-gray-800 overflow-y-auto max-h-[80vh]">
          <li v-for="(folder, index) in foldersFiltered" :key="index"
            class="flex items-center justify-between gap-3 py-3 px-4 sm:px-6">
            <div class="flex items-center gap-3 min-w-0">

              <div class="text-sm min-w-0 flex gap-2">
                <UIcon name="tabler:folder" class="w-5 h-5"/>
                <p class="text-gray-900 dark:text-white font-medium truncate">
                  {{ folder.name }}
                </p>
              </div>
            </div>

            <div class="flex items-center gap-3">

              <UDropdown position="bottom-end">
                <UButton icon="tabler:chevron-right" color="gray" variant="ghost" />
              </UDropdown>
            </div>
          </li>
        </ul>
      </div>

    </UCard>
  </UModal>

  <UButton class="w-full" type="button" label="Seleccionar Carpeta" color="black" @click="openModal" />

</template>