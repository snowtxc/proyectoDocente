<script setup lang="ts">
import { type CompetenciaEspecifica,  type CompetenciaGeneral } from '~/types/competenciaEspecifica';
import type { Contenido } from '~/types/contenido';
import type { CriterioDeLogro } from '~/types/criterioDeLogro';
import type { Espacio } from '~/types/espacio';
import type { UnidadCurricular } from '~/types/unidadCurricular';

import EditorSlideOver from '../plan-de-aprendizaje/EditorSlideOver.client.vue';
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

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
});

const emit = defineEmits(['update:modelValue']);

const metaAprendizajeContentHtml = ref<string>(null);
const planAprendizajeContentHtml= ref<string>(null);

const loadForm = (): void =>{
  
  const {   actividad } = props.modelValue;
  const  {  meta_aprendizaje_html_content, plan_aprendizaje_html_content  } =  actividad;
   
  metaAprendizajeContentHtml.value =   meta_aprendizaje_html_content;
  planAprendizajeContentHtml.value =  plan_aprendizaje_html_content;
}


onMounted(()=>{
  loadForm();
})

const getCurrentData = ()=>{

  const { actividad } = props.modelValue;

  actividad.meta_aprendizaje_html_content = metaAprendizajeContentHtml.value;
  actividad.plan_aprendizaje_html_content = planAprendizajeContentHtml.value;

  const data  = {
    ...props.modelValue,
    ...{
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
    return;
  }

  if(newValue.id != oldValue.id){
    loadForm();
  }
})

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
            v-model="metaAprendizajeContentHtml"
            :promptCategories="[PromptCategory.META_DE_APRENDIZAJE]"
            title="Meta de Aprendizaje" 
            @update:model-value="onChangeModel"
            disabledText="Debes seleccionar una unidad curricular ,un contenido, criterios de logros y competencias especificas antes de asignar una meta de aprendizaje"></EditorSlideOver>
        </div>
      </UCard>

      <UCard class="flex-1 flex flex-col">
        <div class="flex flex-col  justify-between">
          <span class="font-medium text-xl">Plan de Aprendizaje</span>
           <EditorSlideOver 
              v-model="planAprendizajeContentHtml"
              :promptCategories="[PromptCategory.OTROS]"
              @update:model-value="onChangeModel"
              title="Plan de aprendizaje" 
              :paramsBot="{}"
              disabledText="Debes seleccionar una unidad curricular ,un contenido, criterios de logros y competencias especificas antes de asignar un plan de aprendizaje"></EditorSlideOver>
          </div>
         
      </UCard>
    </div>
  </div>
</template>