<script setup lang="ts">
import { type CompetenciaEspecifica, type CompetenciaEspecificaFilter, type CompetenciaGeneral } from '~/types/competenciaEspecifica';
import type { Contenido, ContenidoFilter } from '~/types/contenido';
import type { CriterioDeLogro, CriterioDeLogroFilter } from '~/types/criterioDeLogro';
import type { Espacio } from '~/types/espacio';
import type { ListRequest } from '~/types/list-request';
import type { Tramo } from '~/types/tramo';
import type { UnidadCurricular } from '~/types/unidadCurricular';
import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum';

import SelectorContenido from '../contenido/SelectorContenido.vue';
import SelectorCriteriosDeLogros from '../criterio-de-logro/SelectorCriteriosDeLogros.vue';
import SelectorCompetenciaEspecifica from '../competencia-especifica/SelectorCompetenciaEspecifica.vue';
import { EspacioOUnidadOptionEnum } from '~/utils/enums/EspacioOUnidadOption.enum';

interface Props {
    modelValue: Tramo,
    gradosIds: number[]
    ciclosGradosIds: number[],
    espacios: Espacio[],
    competenciasGenerales: CompetenciaGeneral[]
}

const { $apiRest } = useNuxtApp();

const toast = useToast();

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
});

const emit = defineEmits(['update:modelValue']);


const form = ref({
    espacio: null,
    unidad_curricular: props.modelValue.unidad_curricular || null,
    contenido: null,
    criteriosDeLogros: [],
    competenciasEspecificas: []
});

const espacios = ref([...props.espacios]);

const contenidos = ref<Contenido[]>([]);
const criteriosDeLogros = ref<CriterioDeLogro[]>([]);
const competenciasEspecificas = ref<CompetenciaEspecifica[]>([]);

const showModalChangeEspacioOrUnidadCurricular = ref<boolean>(false);
const titleChangeEspacioOrUnidadCurricular = ref<string>("");
const descriptionChangeEspacioOrUnidadCurricular = ref<string>("");

const espacioToChange = ref<Espacio>(null);
const unidadCurricularToChange = ref<UnidadCurricular>(null);
const optionToChange = ref<EspacioOUnidadOptionEnum>(null);

const loadForm = (): void =>{
  const { unidad_curricular, espacio , competencias_especificas, criterios_de_logros,contenido } = props.modelValue;

  console.log(props.modelValue);

  form.value.espacio = espacio;
  form.value.unidad_curricular = unidad_curricular;
  form.value.competenciasEspecificas = competencias_especificas;
  form.value.criteriosDeLogros = criterios_de_logros;
  form.value.contenido = contenido;
}

onMounted(()=>{
  loadForm();
})


const unidadesCurriculares = computed<UnidadCurricular[]>(()=>{
    return form.value.espacio?.unidades_curriculares;
})

const competenciasGeneralesSelected = computed<CompetenciaGeneral[]>(()=>{
  return props.competenciasGenerales.filter(cg =>{
     return form.value.competenciasEspecificas.some((ce:CompetenciaEspecifica) => ce.competencias_generales.some(x => x.id == cg.id))
  })
})

const getCurrentData = ()=>{
  const {  unidad_curricular , espacio, contenido, competenciasEspecificas, criteriosDeLogros}  = form.value

  const data  = {
    ...props.modelValue,
    ...{
      unidad_curricular,
      espacio,
      contenido,
      competencias_especificas:  competenciasEspecificas,
      criterios_de_logros: criteriosDeLogros
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

const onChangeEspacio = (espacio: Espacio) =>{
  if(form.value.espacio && form.value.unidad_curricular){
    espacioToChange.value = espacio;
    optionToChange.value = EspacioOUnidadOptionEnum.ESPACIO;
    titleChangeEspacioOrUnidadCurricular.value = "Cambiar de espacio."
    descriptionChangeEspacioOrUnidadCurricular.value = "¿Segur@ deseas cambiar de espacio?. En caso de confirmar perderas los datos del tramo(contenido,criterios de logros, competencias especificas), meta de aprendizaje y plan de aprendizaje";
    showModalChangeEspacioOrUnidadCurricular.value = true;
    
    return;
  }  
  form.value.espacio = espacio;
  form.value.unidad_curricular = null;
  onChangeModel();
}

const onChangeUnidadCurricular = (unidadCurricular: UnidadCurricular)=>{

  if(form.value.unidad_curricular){
    unidadCurricularToChange.value = unidadCurricular;
    optionToChange.value = EspacioOUnidadOptionEnum.UNIDAD_CURRICULAR;
    titleChangeEspacioOrUnidadCurricular.value = "Cambiar de unidad curricular."
    descriptionChangeEspacioOrUnidadCurricular.value = "¿Segur@ deseas cambiar de unidad curricular?. En caso de confirmar perderas los datos del tramo(contenido,criterios de logros, competencias especificas), meta de aprendizaje y plan de aprendizaje"
    showModalChangeEspacioOrUnidadCurricular.value = true;
    return;
  }

  form.value.unidad_curricular = unidadCurricular;
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
     
    contenidos.value = contenidosResponse.list;
    criteriosDeLogros.value = criteriosDeLogrosResponse.list;
    competenciasEspecificas.value = competenciasEspecificasResponse.list;
    
   }catch(message){
    toast.add({
      title: "Error",
      description: message ? message : 'Error al obtener los contenidos ,criterios de logros y competencías especificas para el tramo.',
      color: "red"
    })
   }
}

const onConfirmChangeEspacioOUnidad = ()=>{
  showModalChangeEspacioOrUnidadCurricular.value = false;

  if(optionToChange.value === null)
    return;

  switch(optionToChange.value){
    case EspacioOUnidadOptionEnum.ESPACIO:
      form.value.espacio =  { ... espacioToChange.value };
      break;
    case EspacioOUnidadOptionEnum.UNIDAD_CURRICULAR:
      form.value.unidad_curricular = { ...unidadCurricularToChange.value}
  }

  form.value.competenciasEspecificas = [];
  form.value.criteriosDeLogros = [];
  form.value.contenido = null;

  if(optionToChange.value == EspacioOUnidadOptionEnum.ESPACIO){
    form.value.unidad_curricular = null;
  }

  if(optionToChange.value == EspacioOUnidadOptionEnum.UNIDAD_CURRICULAR && form.value.unidad_curricular){
    loadContenidosCriteriosDeLogrosYCompetencias(form.value.unidad_curricular?.id)
  }

  onChangeModel();
}


</script>

<template>
  <div class="w-full px-2">
    <div class="flex gap-2">
      <USelectMenu 
      :model-value="form.espacio"
      :options="espacios" option-attribute="id" class="flex-1"
      @change="onChangeEspacio">
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
  
        <USelectMenu  :model-value="form.unidad_curricular" :options="unidadesCurriculares" option-attribute="id" class="flex-1"
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
  
    <div class="w-full flex flex-col gap-2 mt-2">
      
      <div class="flex gap-2">
        <UCard class="w-3/5  flex flex-col">
        <div class="flex items-center justify-between">
          <span class="font-medium text-xl">Competencias Especificas</span>
          <SelectorCompetenciaEspecifica 
          v-model="form.competenciasEspecificas" 
          @update:model-value="onChangeModel"
          :competenciasEspecificas="competenciasEspecificas" 
          :color="form.espacio?.rgbColor"
          :disabled="form.unidad_curricular == null"
          :contenidoSelected="form.contenido"
          :criteriosDeLogrosSelected="form.criteriosDeLogros"
          :competenciasGenerales="props.competenciasGenerales"
          ></SelectorCompetenciaEspecifica>
        </div>
        
        <div class="flex justify-between gap-2 items-center">
          <div>
            <ul class="list-disc px-2" v-if="form.competenciasEspecificas.length > 0">
              <li v-for="competenciaEspecifica in form.competenciasEspecificas" :key="competenciaEspecifica.id" class="my-2">
                  {{ competenciaEspecifica.codificacion  }} {{ competenciaEspecifica.descripcion }}
              </li>
            </ul>
            <span v-else>
              No se ha seleccionado ningún criterio de logro.
            </span>
          </div>
        </div>
        
        </UCard>
    
        <UCard class="w-2/5 flex flex-col">
          <div class="flex items-center justify-between">
            <span class="font-medium text-xl">Competencias Generales</span>
          </div>
          
          <div class="flex flex-col justify-between gap-2 items-center">
              <div class="grid grid-cols-2 gap-2" v-if="competenciasGeneralesSelected.length > 0" >
                <UCard 
                v-for="competenciaGeneral in competenciasGeneralesSelected" 
                :key="competenciaGeneral.id" >
                  <div class="w-full flex flex-col h-full items-center justify-center">
                    <div class="text-sm text-center">{{ competenciaGeneral.nombre }}</div>
                    <UAvatar :src="competenciaGeneral.url_image" size="xl" class="text-center mt-2"/>
                  </div>
                </UCard>
              </div>
              
              <span v-else>
                No se ha seleccionado ninguna competencia general.
              </span>
            </div>        
        </UCard>
      </div>
      
    
  
      <UCard class="flex-1 flex flex-col">
        <div class="flex items-center justify-between">
          <span class="font-medium text-xl">Criterios de Logros</span>
          <SelectorCriteriosDeLogros 
          v-model="form.criteriosDeLogros" 
          @update:model-value="onChangeModel"
          :criteriosDeLogros="criteriosDeLogros" 
          :color="form.espacio?.rgbColor"
          :contenidoSelected="form.contenido"
          :competenciasEspecificasSelected="form.competenciasEspecificas"
          :disabled="form.unidad_curricular == null"></SelectorCriteriosDeLogros>
        </div>
        <div class="flex justify-between gap-2 items-center">
          <div>
            <ul class="list-disc" v-if="form.criteriosDeLogros.length > 0">
              <li v-for="criterioDeLogro in form.criteriosDeLogros" :key="criterioDeLogro.id">
                {{ criterioDeLogro.descripcion }}
              </li>
            </ul>
            <span v-else>
              No se ha seleccionado ningún criterio de logro.
            </span>
          </div>
        </div>
        
      </UCard>
  
      <UCard class="flex-1 flex flex-col">
        <div class="flex items-center justify-between">
          <span class="font-medium text-xl">Contenido</span>
  
          <SelectorContenido 
          v-model="form.contenido" 
          @update:model-value="onChangeModel"
          :contenidos="contenidos" 
          :color="form.espacio?.rgbColor"
          :competenciasEspecificasSelected="form.competenciasEspecificas"
          :criteriosDeLogrosSelected="form.criteriosDeLogros"
          :disabled="form.unidad_curricular == null"></SelectorContenido>
        </div>
        <div class="flex justify-between gap-2 items-center">
          <div>
            <ul class="list-disc" v-if="form.contenido">
              <li>{{ form.contenido.descripcion }}</li>
            </ul>
            <span v-else>
              No se ha seleccionado ningún contenido.
            </span>
          </div>
        </div>
        
      </UCard>
    </div>
  </div>

  <ConfirmModal v-model="showModalChangeEspacioOrUnidadCurricular" :title="titleChangeEspacioOrUnidadCurricular" :description="descriptionChangeEspacioOrUnidadCurricular" @onConfirm="onConfirmChangeEspacioOUnidad"></ConfirmModal>

  
 
</template>