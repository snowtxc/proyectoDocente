
<script lang="ts" setup>
import type { Prompt } from '~/types/prompt';


const isOpen = ref<boolean>(false);

const prompts = ref<Prompt[]>([{
  id: 1,
  description: 'Hola',
  created_at: undefined,
  updated_at: undefined
},{
  id: 2,
  description: 'Hola',
  created_at: undefined,
  updated_at: undefined
},{
  id: 3,
  description: 'Hola',
  created_at: undefined,
  updated_at: undefined
}]);

const loading = ref<boolean>(true);

const emptyPrompts = computed(()=>{
  return prompts.value.length == 0;
});

</script>

<template>
  <UTooltip :delay-duration="0" text="Usa la asistencia de flopi bot para generar respuestas automaticas">
      <UButton
          color="primary"
          label="Usar Flopi Bot"
          icon="tabler:robot"
          @click="isOpen = true"
      />
  </UTooltip>
 

  <UModal v-model="isOpen">
    <UCard :ui="{ header: { padding: 'p-4 sm:px-6' }, body: { padding: '' } }" class="min-w-0 min-h-[75vh]">

      <template #header>
        <div class="flex gap-2 justify-between items-center mt-2">
          <div class="flex items-center gap-2">
            <h1 class="font-medium text-xl">Flopi Bot</h1>
            <UIcon name="tabler:robot" class="size-7" />
          </div>

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

      <UDivider class="w-full"></UDivider>

      <UProgress animation="carousel" v-if="loading" />

      <div class="flex-1 px-2 mt-2">
        <div class="w-full overflow-y-auto max-h-full h-[75vh]">
          <div v-if="emptyPrompts && !loading" class="flex flex-col justify-center items-center mt-5 text-center px-2" >
            <UIcon name="tabler:search" class="w-8 h-8"/>
            <span>
              No pudimos encontrar ningún prompt
            </span>
          </div>
          <ul v-else role="list" class="divide-y divide-gray-200 dark:divide-gray-800 overflow-y-auto">
            <li v-for="(prompt, index) in prompts" :key="prompt.id"
              class="flex items-center justify-between gap-3 py-3 px-4 sm:px-6">
              <div class="flex items-center gap-3 w-full">
  
                <div class="text-sm min-w-0 flex gap-2">
                  <UIcon name="tabler:input-ai" class="w-5 h-5"/>
                  <p class="text-gray-900 dark:text-white font-medium truncate">
                  {{ prompt.description }}
                  </p>
                </div>
              </div>
  
              <div class="flex items-center gap-3">
                <UDropdown position="bottom-end">
                  <UButton icon="tabler:chevron-right" color="gray" variant="ghost"  />
                </UDropdown>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <template #footer>
        <div class="flex gap-2 items-center justify-end">
         
        <UButton
          color="white"
          label="Cerrar"
        />

        <UButton
        color="primary"
        label="Siguiente"
        :loading="loading"
        />

        </div>
        
      </template>
      
    </UCard>
</UModal>
</template>
