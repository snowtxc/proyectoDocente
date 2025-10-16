<script setup lang="ts">

    declare const DocsAPI: any;

    import type { PromptCategory } from '~/utils/enums/PromptCategory.enum';
    import { apiDocumentos } from '~/utils/apiRoutes';
    import { HttpMethodEnum } from "~/utils/enums/HttpMethodEnum"

    import WebViewer from '../WebViewer.vue';
import type { Documento } from '~/types/documento';

    const isOpen = ref(false);
    const tiptapRef = ref();
    const toast = useToast();
    const isLoading = ref(false);
    const { $apiRest } = useNuxtApp();

    const documentUrl = ref<string>();

    interface Props {
        documentId: number,
        title: string;
        disabled?: boolean;
        disabledText?: string;
        paramsBot: any,
        promptCategories: PromptCategory[]
    }
    
    const props = withDefaults(defineProps<Props>(), {})

    const isClient = ref(false);

    const emit = defineEmits(['update:model-value','on:save']);
    
    onMounted(()=>{
      isClient.value = true;
    })

    const handleOnUseTextResponseBot = (responseTextHtml) =>{
      tiptapRef.value?.setContentFromHtml(responseTextHtml);
    }

    const openDocument = async()=>{

      isLoading.value = true;

      try{

        const response = await $apiRest<string>(apiDocumentos.openDocument(props.documentId), HttpMethodEnum.POST, {});
        isLoading.value = false;
        
        // SE SETEA EL URL DEL DOCUMENTO
        documentUrl.value = response;

        isOpen.value = true;

      }catch(message){
          toast.add({
              title: "Error",
              description: message,
              color: "red"
          });
          isLoading.value = false;
      }
      // Llamar a la query open documents de actividad.
    }

    /* SE MANDA A ACTUALIZAR EL DOCUMENTO */
    const  handleOnSave = async(blob)=>{

      try{
        const formData = new FormData();
        formData.append('documento', blob);

        isLoading.value = true;
        const documentSaved = await $apiRest<Documento>(apiDocumentos.saveDocument(props.documentId), HttpMethodEnum.POST, formData);
        isLoading.value = false;
        
        // SE SETEA EL URL DEL DOCUMENTO
        documentUrl.value = documentSaved.document_url;
        isOpen.value = false;
      
        toast.add({
              title: "Se ha guardado con exito",
              description: "",
              color: "green"
        });

        emit('on:save',documentSaved);

      }catch(message){
          toast.add({
              title: "Error",
              description: message,
              color: "red"
          });
          isLoading.value = false;
      }
    }
</script>

<template>
    <div class="flex justify-end"> 

      <UTooltip :text="(disabled && disabledText) ? disabledText: 'Editar'">
            <UButton
            icon="tabler:pencil"
            size="sm"
            color="primary"
            :loading="isLoading"
            variant="outline"
            @click="openDocument"
            :disabled="props.disabled"
        />
      </UTooltip>


        <UModal fullscreen title="Modal fullscreen" v-model="isOpen">  
            <UCard
              :ui="{ header: { padding: 'p-4 sm:px-6' }, body: { padding: '' } }"
              class="min-w-0 min-h-screen flex flex-col"
            >
              <template #header>
                <div class="flex gap-2 justify-between items-center mt-2">
                    <h1 class="font-medium text-xl"> {{ props.title }}</h1>
        
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

              

              <div class="w-full overflow-y-auto">
              
                <WebViewer 
                :disabledEdit="isLoading"
                :url="documentUrl"
                @onSave="handleOnSave">
                  <template v-slot:actions>
                      <FlopiBot :params="paramsBot" @on:use-text-response="handleOnUseTextResponseBot" :categories="props.promptCategories"></FlopiBot>
                  </template>
                </WebViewer>
              </div>

            </UCard>
        </UModal>
    </div>
</template>