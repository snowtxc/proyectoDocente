<script setup lang="ts">
import { type CompetenciaEspecifica, type CompetenciaEspecificaFilter, type CompetenciaGeneral, type CompetenciaGeneralItemSelector } from '~/types/competenciaEspecifica';
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
import SelectorCompetenciaGeneral from "../competencia-general/SelectorCompetenciaGeneral.vue";
import { EspacioOUnidadOptionEnum } from '~/utils/enums/EspacioOUnidadOption.enum';

import EditorSlideOver from '../plan-de-aprendizaje/EditorSlideOver.client.vue';
import { PromptCategory } from '~/utils/enums/PromptCategory.enum';
import type { Planificacion } from '~/types/planificacion';
import type { CicloGrado } from '~/types/cicloGrado';

interface Props {
    modelValue: Tramo,
    tramo: Tramo
    gradosIds: number[]
    ciclosGradosIds: number[],
    espacios: Espacio[],
    nroTramo: number;
    competenciasGenerales: CompetenciaGeneral[]
    planificacion: Planificacion
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
    competenciasGenerales : [],
    competenciasEspecificas: [],
    noSeDesarrolla: false,
    motivoNoSeDesarrolla: ''
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

const loadingMoreData = ref(false);

const metaAprendizajeContentHtml  = ref<string>(null);
const planAprendizajeContentHtml = ref<string>(null);

const loadForm = (): void =>{

  
  const { unidad_curricular, espacio ,competencias_generales , competencias_especificas, criterios_de_logros,contenido, actividad , noSeDesarrolla , motivoNoSeDesarrolla} = props.modelValue;
  const  {  meta_aprendizaje_html_content, plan_aprendizaje_html_content } =  actividad;

  form.value.espacio = espacio;
  form.value.unidad_curricular = unidad_curricular;
  form.value.competenciasGenerales = competencias_generales;
  form.value.competenciasEspecificas = competencias_especificas;
  form.value.criteriosDeLogros = criterios_de_logros;
  form.value.contenido = contenido;
  form.value.noSeDesarrolla = noSeDesarrolla;
  form.value.motivoNoSeDesarrolla = motivoNoSeDesarrolla;

  metaAprendizajeContentHtml.value=   meta_aprendizaje_html_content;
  planAprendizajeContentHtml.value =  plan_aprendizaje_html_content;


  if(form.value.unidad_curricular){
    // Si la carga del formulario ya tiene una unidad curricular entonces mandamos a cargar los contenidos y los criterios de logros para ese tramo.
    loadContenidosCriteriosDeLogrosYCompetencias(form.value.unidad_curricular.id)
  }
}


defineExpose({
  loadForm
})

const clearForm = ()=>{
  form.value = {
    espacio: null,
    unidad_curricular: props.modelValue.unidad_curricular || null,
    contenido: null,
    criteriosDeLogros: [],
    competenciasGenerales : [],
    competenciasEspecificas: [],
    noSeDesarrolla: false,
    motivoNoSeDesarrolla: '',
  }
  
  metaAprendizajeContentHtml.value = '';
  planAprendizajeContentHtml.value = '';
}

onMounted(()=>{
  loadForm();
})


const unidadesCurriculares = computed<UnidadCurricular[]>(()=>{
    return form.value.espacio?.unidades_curriculares;
})

const cicloGradosSelected = computed<CicloGrado[]>(()=>{
    return props.planificacion.grupo.grados.map(g => g.ciclo_grado);
})


const competenciasGeneralesSelected = computed<CompetenciaGeneralItemSelector[]>(()=>{

  return form.value.competenciasGenerales.map(cg => {
      
      if(form.value.competenciasEspecificas.length == 0){
         cg.recomendado = true;
         return cg;
      }

      // Marcar como competencia general recomendado si alguna 
      // competencia especifica del tramo seleccionada pertenece a esa competencia general
      const recomendado  = form.value.competenciasEspecificas.some(ce => {
          const exists = ce.competencias_generales.some(cgItem => cgItem.id == cg.id);
          return exists;
      });

      cg.recomendado = recomendado;

      // Asignar las competencias especificas relacionadas a esa competencia general
      cg.competenciasEspecificasRelacionadas =  competenciasEspecificas.value.filter(x => x.competencias_generales.some(cgItem => cgItem.id == cg.id));
      
      return cg;
  })
})

const getCurrentData = ()=>{
  
  const { actividad } = props.modelValue;

  actividad.plan_aprendizaje_html_content = planAprendizajeContentHtml.value;
  actividad.meta_aprendizaje_html_content = metaAprendizajeContentHtml.value;

  const {  unidad_curricular , espacio, contenido, competenciasEspecificas, competenciasGenerales, criteriosDeLogros, noSeDesarrolla,  motivoNoSeDesarrolla }  = form.value

  const data  = {
    ...props.modelValue,
    ...{
      unidad_curricular,
      unidad_curricular_id: unidad_curricular ? unidad_curricular.id : null,
      espacio,
      espacio_id : espacio ? espacio.id : null,
      contenido, 
      contenido_id: contenido ? contenido.id : null,
      competencias_generales :  competenciasGenerales,
      competencias_especificas:  competenciasEspecificas,
      criterios_de_logros: criteriosDeLogros,
      actividad : { ...actividad },
      noSeDesarrolla,
      motivoNoSeDesarrolla
    }
  }  
    
  return data;
}

const onChangeModel = ()=>{
  emit('update:modelValue',getCurrentData());
}

watch(()=> props.modelValue ,(newValue: Tramo, oldValue: Tramo)=>{
  if(!newValue){
    clearForm();
    return;
  }

  if(newValue.id != oldValue.id){
    loadForm();
    return;
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
  }

  form.value.unidad_curricular = unidadCurricular;

  // solo si la unidad curricular no esta bloqueada mandamos a obtener la data.
  if(!form.value.unidad_curricular?.bloqueada){
    loadContenidosCriteriosDeLogrosYCompetencias(unidadCurricular.id);
  }

  onChangeModel();
}


const loadContenidosCriteriosDeLogrosYCompetencias = async(unidadCurricularId: number)=>{

   loadingMoreData.value = true;

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

    loadingMoreData.value = false;
    
   }catch(message){
    toast.error({
      title: "Error",
      message: message ? message : 'Error al obtener los contenidos ,criterios de logros y competencías especificas para el tramo.',
      color: "red"
    })
    loadingMoreData.value = false;
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

  if(optionToChange.value == EspacioOUnidadOptionEnum.UNIDAD_CURRICULAR && form.value.unidad_curricular && !form.value.unidad_curricular?.bloqueada){
    loadContenidosCriteriosDeLogrosYCompetencias(form.value.unidad_curricular?.id)
  }

  onChangeModel();
}

const paramsBotMetaAprendizaje = computed(()=>{

const { criteriosDeLogros, competenciasEspecificas, contenido } = form.value;
  return {
    criteriosDeLogros: criteriosDeLogros.map(x => x.descripcion),
    competenciasEspecificas:  competenciasEspecificas.map(x => x.descripcion),
    contenido: contenido?.descripcion,
    grados : [],
  }
})

const disabledMetaAprendizaje = computed(()=>{
  return  !form.value.unidad_curricular || 
          form.value.competenciasEspecificas.length == 0 || 
          form.value.competenciasEspecificas.length == 0 || 
          !form.value.contenido;
})

const disabledPlanAprendizaje = computed(()=>{
  return  !form.value.unidad_curricular || 
          form.value.competenciasEspecificas.length == 0 || 
          form.value.competenciasEspecificas.length == 0 || 
          !form.value.contenido;
})


watch(()=> form.value.noSeDesarrolla, ()=>{
  if(!form.value.noSeDesarrolla){
    form.value.motivoNoSeDesarrolla = '';
    onChangeModel();
  }
})

</script>

<template>
  <div class="w-full px-2 pb-20">
    <h1 class="font-medium text-xl text-center my-4">
      Tramo  {{ props.tramo.orden  }} 
    </h1>
    
    <div class="flex items-center gap-2 font-medium justify-end my-2"  v-if="!form.unidad_curricular?.bloqueada">
          <span>¿No se desarrolla?</span>
            <USwitch 
            unchecked-icon="i-lucide-x"
             checked-icon="i-lucide-check"
            size="md" v-model="form.noSeDesarrolla"  @update:model-value="onChangeModel"  color="primary"/>
    </div>
    
    <div v-if="form.noSeDesarrolla">
      <NotaHoja
        v-model="form.motivoNoSeDesarrolla"
        @update:model-value="onChangeModel"
        placeholder="Indique el motivo (actividad extracurricular, suspensión, acto, etc.)"
      ></NotaHoja>
    </div>
    <div v-else>
      
      <div class="flex gap-2 mt-2">
      <USelectMenu
         :model-value="form.espacio" 
         :items="espacios" 
         option-attribute="id" 
         class="flex-1"
         @update:model-value="onChangeEspacio">

        <template #leading="{ modelValue, ui }">
            <span v-if="form.espacio" :style="{ backgroundColor: form.espacio?.rgbColor }"
            :class="['inline-block h-2 w-2 flex-shrink-0 rounded-full mr-2']" aria-hidden="true" />

            <span class="truncate" v-if="form.espacio">{{ form.espacio?.nombre }}</span>
            <span v-else>Selecciona un espacio.</span>
        </template>

      <template #item-leading="{ item }">
        <div class="flex items-center">
           <span :style="{ backgroundColor: item.rgbColor }"
            :class="['inline-block h-2 w-2 flex-shrink-0 rounded-full mr-2']" aria-hidden="true" />
          <span class="truncate">{{ item.nombre }}</span>
        </div>
         
      </template>

      </USelectMenu>

      <USelectMenu :model-value="form.unidad_curricular" :items="unidadesCurriculares" option-attribute="id"
        class="flex-1" @update:model-value="onChangeUnidadCurricular">

        <template #leading="{ modelValue, ui }">
            <span v-if="form.unidad_curricular" :style="{ backgroundColor: form.espacio?.rgbColor }"
            :class="['inline-block h-2 w-2 flex-shrink-0 rounded-full mr-2']" aria-hidden="true" />

          <span class="truncate" v-if="form.unidad_curricular">{{ form.unidad_curricular?.nombre }}</span>
          <span v-else> Selecciona una unidad curricular.</span>

        </template>

        <template #item-leading="{ item }">
        <div class="flex items-center">
           <span :style="{ backgroundColor: form.espacio?.rgbColor }"
            :class="['inline-block h-2 w-2 flex-shrink-0 rounded-full mr-2']" aria-hidden="true" />
          <span class="truncate">{{ item?.nombre }}</span>
        </div>
         
      </template>

      </USelectMenu>
      </div>

      <UProgress size="xl" v-if="loadingMoreData" class="mt-2" />

    <div v-else>

        <ComingSoon v-if="form.unidad_curricular?.bloqueada"></ComingSoon>

        <div  v-else class="w-full flex flex-col gap-2 mt-2" >
          <UCard class="flex-1 flex flex-col mt-2">
        <div class="flex items-center justify-between">
          <span class="font-medium text-xl">Contenido</span>

          <SelectorContenido 
            v-model="form.contenido" 
            @update:model-value="onChangeModel" 
            :contenidos="contenidos"
            :color="form.espacio?.rgbColor" 
            :competenciasEspecificas="competenciasEspecificas"
            :competencias-generales="competenciasGenerales"
            :competenciasEspecificasSelected="form.competenciasEspecificas"
            :criteriosDeLogrosSelected="form.criteriosDeLogros" 
            :disabled="form.unidad_curricular == null"
            :gradosEspecificos="props.planificacion.grupo.grados"
            :unidadCurricular="form.unidad_curricular"></SelectorContenido>
          
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
      
      <div class="flex gap-2">
        <UCard class="w-2/5 flex flex-col">
          <div class="flex items-center justify-between">
            <span class="font-medium text-xl">Competencias Generales</span>
             <SelectorCompetenciaGeneral  
              v-model:model-value="form.competenciasGenerales" 
              @update:model-value="onChangeModel" 
              :competenciasGenerales="competenciasGenerales"
              :competenciasEspecificasSelected="form.competenciasEspecificas"
               :color="form.espacio?.rgbColor"></SelectorCompetenciaGeneral>
          </div>

          <div class="flex flex-col justify-between gap-2 items-center mt-2">
            <div class="grid grid-cols-2 gap-2" v-if="form.competenciasGenerales.length > 0">
              <UCard v-for="competenciaGeneral in competenciasGeneralesSelected" :key="competenciaGeneral.id">
                <div class="w-full flex flex-col h-full items-center justify-center">
                  <div class="w-full flex justify-end relative mb-2"> 
                  <UPopover mode="hover" v-if="!competenciaGeneral.recomendado">
                      <UTooltip
                      >
                          <UButton icon="tabler:alert-square-rounded"  color="error" variant="outline" />
                      </UTooltip>
  
                    <template #content>
                        <div class="p-2 m-4 flex flex-col gap-y-4 max-w-128">
                              <span class="font-medium"> Competencias especificas relacionadas: </span>  
                              <div class="flex flex-col gap-y-2">
                                <div v-for="competenciaEspecifica in competenciaGeneral.competenciasEspecificasRelacionadas" :key="competenciaEspecifica.id" class="flex gap-2">
                                  <div>
                                    <div>
                                      <span class="font-medium">{{ competenciaEspecifica.codificacion }}</span> {{ competenciaEspecifica.descripcion }}
                                    </div>
                                  </div>
                                </div>     
                          </div>                      
                        </div>
                    </template>
                  </UPopover>
                  </div>
                  <div class="text-sm text-center">{{ competenciaGeneral.nombre }}</div>
                  <UAvatar :src="competenciaGeneral.url_image" size="xl" class="text-center mt-2" />
                </div>
              </UCard>
            </div>

            <span v-else>
              No se ha seleccionado ninguna competencia general.
            </span>
          </div>
        </UCard>

        <UCard class="w-3/5  flex flex-col">
          <div class="flex items-center justify-between">
            <span class="font-medium text-xl">Competencias Especificas</span>
            <SelectorCompetenciaEspecifica 
               v-model="form.competenciasEspecificas" 
              :competenciasEspecificas="competenciasEspecificas" 
              :color="form.espacio?.rgbColor"
              :disabled="form.unidad_curricular == null" 
              :contenidoSelected="form.contenido"
              :criteriosDeLogrosSelected="form.criteriosDeLogros" 
              :competenciasGenerales="props.competenciasGenerales"
              :competenciasGeneralesSelected="form.competenciasGenerales"
              @update:model-value="onChangeModel"
              :gradosEspecificos="props.planificacion.grupo.grados"
              :ciclosGradosEspecificos="cicloGradosSelected"
              :unidadCurricular="form.unidad_curricular">
            </SelectorCompetenciaEspecifica>
          </div>

          <div class="flex justify-between gap-2 items-center">
            <div>
              <ul class="list-disc px-2" v-if="form.competenciasEspecificas.length > 0">
                <li v-for="competenciaEspecifica in form.competenciasEspecificas" :key="competenciaEspecifica.id"
                  class="my-2">
                  {{ competenciaEspecifica.codificacion }} {{ competenciaEspecifica.descripcion }}
                </li>
              </ul>
              <span v-else>
                No se ha seleccionado ningún criterio de logro.
              </span>
            </div>
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
            :disabled="form.unidad_curricular == null"
            :gradosEspecificos="props.planificacion.grupo.grados"
            :unidadCurricular="form.unidad_curricular">
          </SelectorCriteriosDeLogros>
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
        <div class="flex flex-col justify-between">
          <div class="flex items-center gap-2">
            <span class="font-medium text-xl my-2">Meta de Aprendizaje</span>
          </div>

          <EditorSlideOver 
            v-model="metaAprendizajeContentHtml"
            @update:model-value="onChangeModel"
            :promptCategories="[PromptCategory.META_DE_APRENDIZAJE]"
            title="Meta de Aprendizaje" 
            :paramsBot="paramsBotMetaAprendizaje"
            disabledText="Debes seleccionar una unidad curricular ,un contenido, criterios de logros y competencias especificas antes de asignar una meta de aprendizaje"></EditorSlideOver>
        </div>
      </UCard>

      <UCard class="flex-1 flex flex-col">

        <div class="flex flex-col  justify-between">
          <div class="flex items-center gap-2 my-2">
            <span class="font-medium text-xl">Plan de Aprendizaje</span>
          </div>

           <EditorSlideOver 
              v-model="planAprendizajeContentHtml"
              @update:model-value="onChangeModel"
              :promptCategories="[PromptCategory.OTROS]"
              title="Plan de aprendizaje" 
              :paramsBot="{}"
              disabledText="Debes seleccionar una unidad curricular ,un contenido, criterios de logros y competencias especificas antes de asignar un plan de aprendizaje"></EditorSlideOver>
          </div>
         
      </UCard>
        </div>
    </div>
    </div>
  </div>

  <ConfirmModal 
    v-model="showModalChangeEspacioOrUnidadCurricular" 
    :title="titleChangeEspacioOrUnidadCurricular"
    :description="descriptionChangeEspacioOrUnidadCurricular" 
    @onConfirm="onConfirmChangeEspacioOUnidad"
    @onClose="showModalChangeEspacioOrUnidadCurricular = false"></ConfirmModal>

</template>