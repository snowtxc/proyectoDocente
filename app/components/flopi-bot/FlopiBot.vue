
<script lang="ts" setup>
import type { ListRequest } from '~/types/list-request';
import type { ListResponse } from '~/types/list-response';
import type { Prompt } from '~/types/prompt';
import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum';
import Stepper from '../Stepper.vue';
import type { SendTextPrompt } from '~/types/flopiBot';
import type { PromptCategory } from '~/utils/enums/PromptCategory.enum';

interface Props {
    params: Object,
    hideButton? : boolean;
    hideUseResponse? : boolean;
    categories?: PromptCategory[]
}

const { $apiRest } = useNuxtApp();

const props = withDefaults(defineProps<Props>(), {});
const emit = defineEmits(['on:use-text-response']);

const isOpen = ref<boolean>(false);

const prompts = ref<Prompt[]>([]);

const loading = ref<boolean>(true);
const creatingResponse = ref<boolean>(false);

const toast = useToast()

const emptyPrompts = computed(()=>{
  return prompts.value.length == 0;
});

const responseText = ref<string>('');

const promptSelected = ref<Prompt>(null);

const form = ref({
  promptValue: ''
})

const  formattedResponseText = computed(()=>{
  return responseText.value.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>'); ;
})

const steps = [{
  step: 1,
  title: `Seleccionar prompt`,
  description: ``,
  icon: "tabler:robot"
},
{
  step: 2,
  title: `Revisar instrucción`,
  description: ``,
  icon : "tabler:robot"
},
{
  step: 3,
  title: `Generar respuesta`,
  description: ``,
  icon : "tabler:robot"
}];

onMounted(async()=>{
  try{

    const listReq : ListRequest = {
      page: -1,
      rowsPerPage: 1,
      filters: {
        promptCategoriesIds: props.categories ? props.categories : null
      }
    }

    const data  = await $apiRest<ListResponse<Prompt[]>>(apiPromptsRoutes.getPaginate, HttpMethodEnum.POST,listReq);

    prompts.value = data.list as Prompt[];

    loading.value = false;

  }catch(message){
    loading.value = false;
    toast.error({
        title: "Error",
        message,
    });
  }
})

const currentStep = ref<number>(1);

const selectPrompt = async(prompt?: Prompt)=>{

  promptSelected.value = prompt;

  if(prompt){
    const instruction  = MetaDeAprendizajePrompt.generarInstructionByPrompt(prompt, props.params);
    form.value.promptValue = instruction;
  }else{
    form.value.promptValue = "";
  }

  currentStep.value ++;
}


const onGenerateResponse = async(): Promise<void> =>{

  creatingResponse.value = true;

  const body : SendTextPrompt = {
    promptUsedId: promptSelected.value?.id,
    instruction: form.value.promptValue
  }

  try{
    responseText.value = await $apiRest<string>(apiFlopiBot.sendPromptMessage, HttpMethodEnum.POST, body);
    creatingResponse.value = false;
    currentStep.value ++
    
  }catch(message){
    creatingResponse.value = false;
    toast.error({
        title: "Error",
        message,
        color: "red"
    });  
  }
}

const copyClipboard = ()=>{
  navigator.clipboard.writeText(formattedResponseText.value);
}

const useTextResponse = ()=>{
  isOpen.value = false;
  emit('on:use-text-response', formattedResponseText.value);
}

function openModal() {
  isOpen.value = true;
}

defineExpose({
  openModal
});


</script>

<template>
  <UTooltip :delay-duration="0" text="Usa la asistencia de flopi bot para generar respuestas automaticas" v-if="!props.hideButton">
      <UButton
          color="primary"
          label="Usar Flopi Bot"
          icon="tabler:robot"
          @click="isOpen = true"
      />
  </UTooltip>
 

  <UModal v-model:open="isOpen">
    <template #content>
      <UCard>
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

        <UProgress animation="carousel" v-if="loading" />

        <USeparator class="w-full"></USeparator>

        <div class="w-full flex">
           <Stepper 
            class="w-full"
            :showButtonAddStep="false"
            orientation="horizontal"
            titleButtonAddStep="Agregar nuevo tramo"
            descriptionButtonAddStep="Extender un nuevo tramo a la planificación"
            :currentStep="currentStep"
            :steps="steps"
            :linear="true"
            :disabled="true"/>
            </div>

        <USeparator class="w-full"></USeparator>

        <template v-if="currentStep == 1">
          <div class="flex-1 px-2 mt-2">
            <ul role="list" class="divide-y divide-gray-200 dark:divide-gray-800 overflow-y-auto">
              <li class="flex items-center justify-between gap-3 py-3 px-4 sm:px-6">
                <div class="text-sm min-w-0 flex gap-2">
                  <UIcon name="tabler:input-ai" class="w-5 h-5"/>
                  <p class="text-gray-900 dark:text-white font-medium">
                    Genera tu propia instrucción
                  </p>
                </div>
                <div class="flex items-center gap-3">
                  <UDropdown position="bottom-end">
                    <UTooltip :text="'Escribe tu propia instrucción y el bot te asistirá.'">
                      <UButton icon="tabler:chevron-right" color="primary" variant="ghost" @click="selectPrompt(null)"/>
                    </UTooltip>
                  </UDropdown>
                </div>
              </li>

            </ul>

            <USeparator class="mt-4"></USeparator>
            <div v-if="!emptyPrompts">
              <h1 class="text-center py-2">Instrucciones a usar</h1>
              <div class="w-full overflow-y-auto max-h-full h-[50vh]">
          
                <ul  role="list" class="divide-y divide-gray-200 dark:divide-gray-800 overflow-y-auto">
                  <li v-for="(prompt, index) in prompts" :key="prompt.id"
                    class="flex items-center justify-between gap-3 py-3 px-4 sm:px-6">
                    <div class="flex items-center gap-3 w-full">
        
                      <div class="text-sm min-w-0 flex gap-2">
                        <UIcon name="tabler:input-ai" class="w-5 h-5"/>
                        <p class="text-gray-900 dark:text-white font-medium">
                        {{ prompt.description }}
                        </p>
                      </div>
                    </div>
        
                    <div class="flex items-center gap-3">
                      <UDropdown position="bottom-end">
                        <UTooltip :text="prompt.additional_description">
                          <UButton icon="tabler:chevron-right" color="primary" variant="ghost"  @click="selectPrompt(prompt)" />
                        </UTooltip>
                      </UDropdown>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            
          </div>
        </template>

        <template v-if="currentStep == 2">
          
          <div class="p-4">
            <div class="flex justify-center">
              <ul class="list-disc px-4">
                <li v-if="promptSelected"> {{ promptSelected.description  }} </li>
                <li v-else> Generar tu propia instrucción</li>
              </ul>
            </div>
            

            <UTextarea v-model="form.promptValue" class="w-full h-full my-1" :rows="10" />

            <UButton
                color="primary"
                variant="outline"
                class="w-full text-center py-2 flex justify-center"
                label="Volver atras"
                @click="currentStep --"
                icon="tabler:arrow-left"
            />

            <UButton
                color="primary"
                class="w-full text-center py-3 flex justify-center mt-2"
                label="Generar respuesta"
                :disabled="form.promptValue.trim().length <= 0"
                @click="onGenerateResponse"
                :loading="creatingResponse"
                icon="tabler:robot"
            />
            
          </div>
          

        </template>

        <template v-if="currentStep == 3">
          
          <div class="p-4">

            <div class="w-full p-6 border-1 overflow-y-auto max-h-[60vh]" v-html="formattedResponseText"></div>

            <!-- <UTextarea v-model="responseText" class="w-full h-full mt-4" :rows="15" :disabled="true" /> -->

            <UButton
                color="primary"
                variant="outline"
                class="w-full text-center py-2 flex justify-center mt-2"
                label="Volver atras"
                @click="currentStep --"
                icon="tabler:arrow-left"
            />

            <div class="flex items-center gap-2 mt-2">
            
              <UButton
                  color="primary"
                  class="flex-1 text-center flex justify-center"
                  label="Copiar al portapapeles"
                  variant="outline"
                  @click="copyClipboard"
                  icon="tabler:copy"
              />

              <UButton
                  v-if="!props.hideUseResponse"
                  color="primary"
                  class="flex-1 text-center flex justify-center"
                  label="Usar"
                  @click="useTextResponse"
                  variant="outline"
                  icon="tabler:book-download"
              />
            </div>
          </div>
        
        </template>
      </UCard>

    </template>
  </UModal>
</template>
