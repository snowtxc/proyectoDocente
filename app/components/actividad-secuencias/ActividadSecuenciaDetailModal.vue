<script setup lang="ts">
  import { ActividadSecuenciasActividadSecuenciaDetailModal } from '#components';
import type { ActividadSecuencia } from '~/types/actividadSecuencia';
  import type { Secuencia } from '~/types/secuencia';
import { EditorModeEnum } from '~/utils/enums/EditorModeEnum';

  interface Props {
      secuencia: Secuencia,
      actividadSecuencia: ActividadSecuencia
  }
  const props = defineProps<Props>();

  const title = computed(()=>{
    return  `Actividad ${props.actividadSecuencia.orden} (secuencia: ${props.secuencia.nombre})`;
  })

  const emit = defineEmits(['onClose']);

  const isOpen = ref(false)
  
  const router = useRouter()
  
  const goToFullSequence = () => {
    isOpen.value = false;
    emit('onClose');
    router.push(`/secuencias/${props.secuencia.slug}`)
  }
</script>

<template>
  <div>
    <UButton icon="tabler:eye" color="primary" variant="ghost" @click="isOpen = true" />           

    <UModal v-model:open="isOpen" class="w-full">
      <template #content>
         <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
              {{ title }}
            </h3>
            <UButton color="neutral" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="isOpen = false" />
          </div>
        </template>

        <div class="mt-2 max-h-[70vh] overflow-y-auto">
          <div class="flex flex-col"> 
            <div class="flex gap-2 items-center">
                <strong>  Meta de aprendizaje </strong>

               <div v-if="props.actividadSecuencia.actividad?.meta_aprendizaje_documento?.editorMode">
                <img
                  src="/localEditor.png"
                  alt="Editor local icono"
                  class="w-6"
                  v-if="props.actividadSecuencia.actividad?.meta_aprendizaje_documento?.editorMode == EditorModeEnum.LOCAL"
                >

                <img
                  src="/google-drive.png"
                  alt="Google drive icono"
                  class="w-6"
                    v-if="props.actividadSecuencia.actividad?.meta_aprendizaje_documento?.editorMode == EditorModeEnum.DRIVE"
                />
              </div>
            </div>
            <div v-if="props.actividadSecuencia.actividad?.meta_aprendizaje_documento.editorMode" class="mt-1">
               <a 
                :href="props.actividadSecuencia.actividad?.meta_aprendizaje_documento.document_url" 
                target="_blank"
                class="text-primary font-bold py-1 rounded hover:cursor-pointer transition-colors duration-300">
                Haz clic aquí para abrir el plan de aprendizaje
              </a>
            </div>
            <p v-else> Sin asignar</p>
          </div>
        
          <UDivider class="my-4"></UDivider>
      
          <div class="flex flex-col"> 
            <div class="flex gap-2 items-center">
                <strong> Plan de aprendizaje </strong>

               <div v-if="props.actividadSecuencia.actividad?.plan_aprendizaje_documento?.editorMode" class="mt-1">
                <img
                  src="/localEditor.png"
                  alt="Editor local icono"
                  class="w-6"
                  v-if="props.actividadSecuencia.actividad?.plan_aprendizaje_documento?.editorMode == EditorModeEnum.LOCAL"
                >

                <img
                  src="/google-drive.png"
                  alt="Google drive icono"
                  class="w-6"
                    v-if="props.actividadSecuencia.actividad?.plan_aprendizaje_documento?.editorMode == EditorModeEnum.DRIVE"
                />
              </div>
            </div>
            
             <div v-if="props.actividadSecuencia.actividad?.plan_aprendizaje_documento.editorMode">
               <a 
                :href="props.actividadSecuencia.actividad?.plan_aprendizaje_documento.document_url" 
                target="_blank"
                class="text-primary font-bold py-1 rounded hover:cursor-pointer transition-colors duration-300">
                Haz clic aquí para abrir el plan de aprendizaje
              </a>
            </div>
            <p v-else> Sin asignar</p>
          </div>
        </div>

        <!-- Botón para ir a la secuencia completa -->
        <div class="mt-6 flex justify-center">
          <UButton 
            color="primary" 
            variant="solid" 
            icon="i-heroicons-arrow-right-20-solid"
            @click="goToFullSequence"
          >
            Ir a la secuencia completa
          </UButton>
        </div>

      </UCard>
      </template>
     
    </UModal>
  </div>
</template>
