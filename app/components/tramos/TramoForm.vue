<script setup lang="ts">
import type { CompetenciaEspecificaFilter } from '~/types/competenciaEspecifica';
import type { ContenidoFilter } from '~/types/contenido';
import type { CriterioDeLogroFilter } from '~/types/criterioDeLogro';
import type { Espacio } from '~/types/espacio';
import type { ListRequest } from '~/types/list-request';
import type { Tramo } from '~/types/tramo';
import type { UnidadCurricular } from '~/types/unidadCurricular';
import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum';

interface Props {
    modelValue: Tramo,
    gradosIds: number[]
    ciclosGradosIds: number[],
    espacios: Espacio[]
}

const { $apiRest } = useNuxtApp();

const toast = useToast();

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
});

const emit = defineEmits(['update:modelValue']);

const form = ref({
    espacio: null,
    unidad_curricular: props.modelValue.unidad_curricular || null
});

const espacios = ref([...props.espacios]);


const loadForm = (): void =>{
  const { unidad_curricular, espacio } = props.modelValue;

  form.value.espacio = espacio;
  form.value.unidad_curricular = unidad_curricular;
}

onMounted(()=>{
  loadForm();
})


const unidadesCurriculares = computed<UnidadCurricular[]>(()=>{
    return form.value.espacio?.unidades_curriculares;
})

const getCurrentData = ()=>{
  const {  unidad_curricular , espacio}  = form.value

  const data  = {
    ...props.modelValue,
    ...{
      unidad_curricular,
      espacio
    }
  }

  return data;
}

const onChangeModel = ()=>{
  emit('update:modelValue',getCurrentData());
}

watch(()=> props.modelValue ,(newValue: Tramo, oldValue: Tramo)=>{
  if(newValue.id != oldValue.id){
    loadForm();
  }
})

const onChangeUnidadCurricular = (unidadCurricular: UnidadCurricular)=>{
  loadContenidosCriteriosDeLogrosYCompetencias(unidadCurricular.id);
  onChangeModel();
}


const loadContenidosCriteriosDeLogrosYCompetencias = async(unidadCurricularId: number)=>{

   const { gradosIds , ciclosGradosIds} = props;

   const filtersContenidos : ContenidoFilter = {
      grados_ids : gradosIds,
      unidad_curricular_id: unidadCurricularId
   }

   const filtersCriteriosDeLogros: CriterioDeLogroFilter = {
    grados_ids : gradosIds,
    unidad_curricular_id: unidadCurricularId
   }

   const filtersCompetenciasEspecificas: CompetenciaEspecificaFilter = {
     ciclos_grados_ids: ciclosGradosIds,
     unidad_curricular_id: unidadCurricularId
   }

   const listReqContenidos: ListRequest = {
    page: -1,
    rowsPerPage: 1,
    filters: filtersContenidos
   };

   const listReqCriteriosDeLogros : ListRequest = {
    page: -1,
    rowsPerPage: 1,
    filters: filtersCriteriosDeLogros
   };

   const listReqCompetenciasEspecificas : ListRequest = {
    page: -1,
    rowsPerPage: 1,
    filters: filtersCompetenciasEspecificas
   };

   try{
    const  [contenidosResponse, criteriosDeLogrosResponse, competenciasEspecificasResponse ] =  await Promise.all([
      $apiRest(apiContenidosRoutes.getPaginate, HttpMethodEnum.POST, listReqContenidos),
      $apiRest(apiCriteriosDeLogrosRoutes.getPaginate, HttpMethodEnum.POST, listReqCriteriosDeLogros),
      $apiRest(apiCompetenciasEspecificasRoutes.getPaginate, HttpMethodEnum.POST, listReqCompetenciasEspecificas)
    ]);
    console.log(contenidosResponse.list);
    console.log(criteriosDeLogrosResponse.list);
    console.log(competenciasEspecificasResponse.list)
   }catch(message){
    toast.add({
      title: "Error",
      description: message ? message : 'Error al obtener los contenidos ,criterios de logros y competencías especificas para el tramo.',
      color: "red"
    })
   }
   
  
}






</script>

<template>
  <div class="flex gap-2">
    <USelectMenu 
    v-model="form.espacio" :options="espacios" option-attribute="id" class="flex-1"
    @change="onChangeModel">
        <template #label>
          <span 
          v-if="form.espacio"
          :style="{ backgroundColor: form.espacio?.rgbColor }"
          :class="['inline-block h-2 w-2 flex-shrink-0 rounded-full']" aria-hidden="true" />

          <span class="truncate" v-if="form.espacio">{{ form.espacio?.nombre }}</span>
          <span v-else>Selecciona un espacio.</span>
        </template>
    
        <template #option="{ option: espacio }">
          <span  :style="{ backgroundColor: espacio.rgbColor }" :class="['inline-block h-2 w-2 flex-shrink-0 rounded-full']" aria-hidden="true" />
          <span class="truncate">{{ espacio.nombre }}</span>
        </template>
      </USelectMenu>

      <USelectMenu v-model="form.unidad_curricular" :options="unidadesCurriculares" option-attribute="id" class="flex-1"
      @change="onChangeUnidadCurricular">
        <template #label>
          <span 
          v-if="form.unidad_curricular"
          :style="{ backgroundColor: form.espacio?.rgbColor }"
          :class="['inline-block h-2 w-2 flex-shrink-0 rounded-full']" aria-hidden="true" />

          <span class="truncate" v-if="form.unidad_curricular">{{ form.unidad_curricular?.nombre }}</span>
          <span v-else> Selecciona una unidad curricular.</span>
        </template>
    
        <template #option="{ option:  unidadCurricular }">
          <span  :style="{ backgroundColor: form.espacio?.rgbColor }" :class="['inline-block h-2 w-2 flex-shrink-0 rounded-full']" aria-hidden="true" />
          <span class="truncate">{{ unidadCurricular?.nombre }}</span>
        </template>
      </USelectMenu>
    
  </div>
 
</template>