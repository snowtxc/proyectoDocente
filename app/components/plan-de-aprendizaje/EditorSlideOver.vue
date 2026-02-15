<script setup lang="ts">

    declare const DocsAPI: any;

    import type { PromptCategory } from '~/utils/enums/PromptCategory.enum';
    import { apiDocumentos } from '~/utils/apiRoutes';
    import { HttpMethodEnum } from "~/utils/enums/HttpMethodEnum"

    import WebViewer from '../WebViewer.vue';
    import type { Documento } from '~/types/documento';
    import { EditorModeEnum } from '~/utils/enums/EditorModeEnum';
    import ConfirmModal from '../ConfirmModal.vue';

    import {
      useCodeClient,
      type ImplicitFlowSuccessResponse,
      type ImplicitFlowErrorResponse,
      type ImplicitFlowOptions
    } from "vue3-google-signin";

    const isOpen = ref(false);
    const tiptapRef = ref();
    const toast = useToast();
    const isLoading = ref(false);
    const { $apiRest } = useNuxtApp();


    const overlay = useOverlay()

    const modal = overlay.create(ConfirmModal)

    const documentUrl = ref<string>();

    interface Props {
        documento: Documento,
        title: string;
        disabled?: boolean;
        disabledText?: string;
        paramsBot: any,
        promptCategories: PromptCategory[]
    }    
    const props = withDefaults(defineProps<Props>(), {})

    const documento = ref<Documento>(props.documento);
    const isClient = ref(false);

    const emit = defineEmits(['update:model-value','on:save','on:delete']);
    
    onMounted(()=>{
      isClient.value = true;
    })

    const handleOnUseTextResponseBot = (responseTextHtml) =>{
      tiptapRef.value?.setContentFromHtml(responseTextHtml);
    }

    const optionsMenu = computed<{title : string, icon: string, function: any}[]>(()=>{
      return documento.value?.editorMode ? [
      {
        label : 'Abrir',
        icon : 'tabler:edit',
        onSelect : ()=>{
          openDocument()
        },
      },
      {
        label : 'Eliminar',
        icon: 'tabler:trash',
        onSelect : ()=>{
           deleteDocument();
        },
      }
    ] :

    [
      {
        label : 'Usar editor local',
        icon : 'tabler:file-word',
        onSelect : ()=>{
          openDocument(EditorModeEnum.LOCAL)
        },
      },
      {
        label : 'Usar drive',
        icon: 'tabler:brand-google-drive',
        onSelect : ()=>{
          openDocument(EditorModeEnum.DRIVE);
        },
      }
    ]
    
    })

    const googleSignInOptions: ImplicitFlowOptions = {
      scope: googleScopes,
      onSuccess: async(responseGoogle: ImplicitFlowSuccessResponse) => {
        try{

          const { code } = responseGoogle;
          const response =  await $apiRest(apiAuthRoutes.linkOrUpdateGoogleAccount, HttpMethodEnum.POST, { code });

        if(response && response.id){
            // Si el login funciona perfectamente se manda a reabrir el documento de drive.
            openDocument(EditorModeEnum.DRIVE);
        }else{
          toast.error({
            title: "Error",
            message: "Ha ocurrido un error al sincronizar tu cuenta de google. por favor vuelve a intentarlo.",
            color: "red"
          });
        }

      }catch(message){
        toast.error({
          title: "Error",
          message: message,
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

    const openDocument = async(editorMode? : EditorModeEnum)=>{

      isLoading.value = true;

      try{

        const response = await $apiRest<{status: boolean, ref: string,editorMode:EditorModeEnum, googleDriveStatus?: any}>(apiDocumentos.openDocument(documento.value.id), HttpMethodEnum.POST, 
        {
          editorMode
        });

        if(response.status){

           switch(response.editorMode){
            case EditorModeEnum.LOCAL:
              documentUrl.value = response.ref;
              isOpen.value = true;
              break;
            case EditorModeEnum.DRIVE:
              window.open(response.ref, '_blank')
              break;
          }

          documento.value.editorMode = response.editorMode;
          documento.value.document_ref = 
          documento.value.document_preview_url = response.ref;

        }else{
          // STATUS FALSE
          switch(response.editorMode){
            case EditorModeEnum.LOCAL:
              break;
            case EditorModeEnum.DRIVE:
              if(response.googleDriveStatus && response.googleDriveStatus.relogin){
                loginWithGoogle();
              }
              break;
          }
        }

        isLoading.value = false;
      }catch(message){
          toast.error({
              title: "Error",
               message,
              color: "red"
          });
          isLoading.value = false;
      }
      // Llamar a la query open documents de actividad.
    }

    const deleteDocument = async()=>{

        modal.open({ 
        title: `Remover documento`,
        description: `
            Al remover el documento, perderás el acceso al archivo.
            Si fue cargado desde Google Drive, también se eliminará de tu espacio de Google.
            Si fue un word local, se eliminará de la plataforma.`
       ,
        "onOnConfirm" : async(data)=>{
         
          try{

            modal.close();

            const response = await $apiRest<any>(apiDocumentos.deleteDocument(documento.value.id), HttpMethodEnum.DELETE);

            if(response.status){
                documento.value = response.documento;
                toast.success({
                  title: "Exito",
                  message: 'Se ha removido el documento correctamente.',
                  color: "green"
            })

              emit('on:delete');
            }else{
              // Posible google drive
              console.log(response)
            }

          }catch(message){
            toast.error({
                title: "Error",
                message: message ? message : 'Error al intentar remover el documento',
                color: "red"
            })
          }

        }
      })
    }

    /* SE MANDA A ACTUALIZAR EL DOCUMENTO */
    const  handleOnSave = async(blob)=>{

      try{
        const formData = new FormData();
        formData.append('documento', blob);

        isLoading.value = true;
        isOpen.value = false;

        const documentSaved = await $apiRest<Documento>(apiDocumentos.saveDocument(documento.value.id), HttpMethodEnum.POST, formData);
        isLoading.value = false;
        
        // SE SETEA EL URL DEL DOCUMENTO
        documentUrl.value = documentSaved.document_url;
              
        toast.success({
              title: "Se ha guardado con exito",
              color: "green"
        });

        emit('on:save',documentSaved);

      }catch(message){
          toast.error({
              title: "Error",
              message,
              color: "red"
          });
          isLoading.value = false;
      }
    }

    watch(()=> props.documento, ()=>{
      documento.value = props.documento;
    })
</script>

<template>
    <div class="flex justify-end"> 

     <UPopover :popper="{ placement: 'bottom-start' }">
             <UTooltip :text="(disabled && disabledText) ? disabledText: 'Editar'">
        
                    <UDropdownMenu :items="optionsMenu" >
                      <UButton
                        icon="tabler:pencil"
                        size="sm"
                        color="primary"
                        :loading="isLoading"
                        variant="outline"
                        :disabled="props.disabled"
                    />
                  </UDropdownMenu>
            </UTooltip>
      </UPopover>


        <UModal fullscreen title="Modal fullscreen" v-model:open="isOpen">  
          <template #content>
            <UCard
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
          </template>
        </UModal>
    </div>
</template>