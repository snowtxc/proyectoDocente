<script setup lang="ts">
import { type CompetenciaEspecifica,  type CompetenciaGeneral } from '~/types/competenciaEspecifica';
import type { Contenido } from '~/types/contenido';
import type { CriterioDeLogro } from '~/types/criterioDeLogro';
import type { Espacio } from '~/types/espacio';
import type { UnidadCurricular } from '~/types/unidadCurricular';

import EditorSlideOver from '../plan-de-aprendizaje/EditorSlideOver.vue';
import { PromptCategory } from '~/utils/enums/PromptCategory.enum';
import type { Documento } from '~/types/documento';
import type { ActividadSecuencia } from '~/types/actividadSecuencia';

interface Props {
    modelValue: ActividadSecuencia,
    actividadSecuencia: ActividadSecuencia
    gradosIds: number[]
    ciclosGradosIds: number[],
    espacios: Espacio[],
    competenciasGenerales: CompetenciaGeneral[]
    nroActividadSecuencia: number;
    espacio? : Espacio;
    unidadCurricular: UnidadCurricular;
    contenido?: Contenido;
    criteriosDeLogros: CriterioDeLogro[],
    competenciasEspecificas: CompetenciaEspecifica[]
}

const { $apiRest } = useNuxtApp();

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
});

const emit = defineEmits(['update:modelValue']);

const form = ref({
    criteriosDeLogros: [],
    competenciasEspecificas: [],
});

const metaAprendizajeDocumento = ref<Documento>(null);
const planAprendizajeDocumento= ref<Documento>(null);

const competenciasGeneralesSelected = computed<CompetenciaGeneral[]>(()=>{
  return props.competenciasGenerales.filter(cg =>{
     return form.value.competenciasEspecificas.some((ce:CompetenciaEspecifica) => ce.competencias_generales.some(x => x.id == cg.id))
  })
})

const loadForm = (): void =>{
  
  const {   actividad } = props.modelValue;
  const  {  meta_aprendizaje_documento, plan_aprendizaje_documento } =  actividad;
  
  metaAprendizajeDocumento.value=   meta_aprendizaje_documento;
  planAprendizajeDocumento.value =  plan_aprendizaje_documento;
}

const clearForm = ()=>{
  form.value = {
    criteriosDeLogros: [],
    competenciasEspecificas: [],
  }
}

onMounted(()=>{
  loadForm();
})

const getCurrentData = ()=>{

  const { actividad } = props.modelValue;
  const {  competenciasEspecificas, criteriosDeLogros }  = form.value

  const data  = {
    ...props.modelValue,
    ...{
      competencias_especificas:  competenciasEspecificas,
      criterios_de_logros: criteriosDeLogros,
      actividad : { ...actividad }
    }
  }  
    
  return data;
}

const onChangeModel = ()=>{
  emit('update:modelValue',getCurrentData());
}

watch(()=> props.modelValue ,(newValue: ActividadSecuencia, oldValue: ActividadSecuencia)=>{
  if(!newValue){
    clearForm();
    return;
  }

  if(newValue.id != oldValue.id){
    loadForm();
  }
})

const paramsBotMetaAprendizaje = computed(()=>{
  const { criteriosDeLogros, competenciasEspecificas } = form.value;
  return {
    criteriosDeLogros: criteriosDeLogros.map(x => x.descripcion),
    competenciasEspecificas:  competenciasEspecificas.map(x => x.descripcion),
    grados : [],
  }
})

const disabledMetaAprendizaje = computed(()=>{
  return  form.value.competenciasEspecificas.length == 0;
})

const disabledPlanAprendizaje = computed(()=>{
  return  form.value.competenciasEspecificas.length == 0;
})

const handleSavedDocumentPlanAprendizaje = (document: Documento)=>{
  planAprendizajeDocumento.value = document;
}

const handleSavedDocumentMetaAprendizaje = (document: Documento)=>{
  metaAprendizajeDocumento.value = document;
}

</script>

<template>
  <div class="w-full px-2 pb-20">
    <h1 class="font-medium text-xl text-center my-4">
      Actividad {{ props.actividadSecuencia.orden }} 
    </h1>

    <div class="w-full flex flex-col gap-2 mt-2">
      <UCard class="flex-1 flex flex-col">
        <div class="flex flex-col justify-between">
          <span class="font-medium text-xl">Meta de Aprendizaje</span>

          <EditorSlideOver 
            :promptCategories="[PromptCategory.META_DE_APRENDIZAJE]"
            :documento="metaAprendizajeDocumento"
            title="Meta de Aprendizaje" 
            :paramsBot="paramsBotMetaAprendizaje"
            @on:save="handleSavedDocumentMetaAprendizaje"
            disabledText="Debes seleccionar una unidad curricular ,un contenido, criterios de logros y competencias especificas antes de asignar una meta de aprendizaje"></EditorSlideOver>
        </div>
        <div>
          <div v-if="metaAprendizajeDocumento?.document_preview_url">
             <a 
                :href="metaAprendizajeDocumento.document_preview_url" 
                  target="_blank"
                  class="text-primary font-bold px-3 py-1 rounded hover:cursor-pointer transition-colors duration-300">
                  Haz clic aquí para abrir la meta de aprendizaje
               </a>
          </div>
          <div v-else class="text-center">
            No se ha asignado una meta de aprendizaje.
          </div>
        </div>

      </UCard>

      <UCard class="flex-1 flex flex-col">
        <div class="flex flex-col  justify-between">
          <span class="font-medium text-xl">Plan de Aprendizaje</span>
           <EditorSlideOver 
              :promptCategories="[PromptCategory.OTROS]"
              :documento="planAprendizajeDocumento"
              @update:model-value="onChangeModel"
              @on:save="handleSavedDocumentPlanAprendizaje"
              title="Plan de aprendizaje" 
              :paramsBot="{}"
              disabledText="Debes seleccionar una unidad curricular ,un contenido, criterios de logros y competencias especificas antes de asignar un plan de aprendizaje"></EditorSlideOver>
            
            <div v-if="planAprendizajeDocumento?.document_preview_url">
              
              <a 
                :href="planAprendizajeDocumento.document_preview_url" 
                target="_blank"
                class="text-primary font-bold px-3 py-1 rounded hover:cursor-pointer transition-colors duration-300">
                Haz clic aquí para abrir el plan de aprendizaje
              </a>
            </div>
            

            <div v-else class="text-center">  No se ha asignado un plan de aprendizaje</div>

          </div>
         
      </UCard>
    </div>
  </div>
</template>