<script setup lang="ts">
import { type CompetenciaEspecifica, type CompetenciaGeneral } from '~/types/competenciaEspecifica';
import type { Contenido } from '~/types/contenido';
import type { CriterioDeLogro } from '~/types/criterioDeLogro';
import type { Espacio } from '~/types/espacio';
import type { UnidadCurricular } from '~/types/unidadCurricular';

import EditorSlideOver from '../plan-de-aprendizaje/EditorSlideOver.client.vue';
import { PromptCategory } from '~/utils/enums/PromptCategory.enum';
import type { ActividadSecuencia } from '~/types/actividadSecuencia';
import type { Grupo } from '~/types/grupo';

interface Props {
    modelValue: ActividadSecuencia,
    actividadSecuencia: ActividadSecuencia,
    gradosIds: number[],
    ciclosGradosIds: number[],
    espacios: Espacio[],
    competenciasGenerales: CompetenciaGeneral[],
    nroActividadSecuencia: number;
    espacio?: Espacio;
    unidadCurricular: UnidadCurricular;
    contenido?: Contenido;
    criteriosDeLogros: CriterioDeLogro[],
    competenciasEspecificas: CompetenciaEspecifica[],
    grupo: Grupo
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
});

const emit = defineEmits(['update:modelValue']);

const metaAprendizajeContentHtml = ref<string>(null);
const planAprendizajeContentHtml = ref<string>(null);

const loadForm = (): void => {
  const { actividad } = props.modelValue;
  const { meta_aprendizaje_html_content, plan_aprendizaje_html_content } = actividad;
   
  metaAprendizajeContentHtml.value = meta_aprendizaje_html_content;
  planAprendizajeContentHtml.value = plan_aprendizaje_html_content;
}

onMounted(() => {
  loadForm();
})

// --- Lógica de IA ---

const paramsBotMetaAprendizaje = computed(() => {
  return {
    criteriosDeLogros: props.criteriosDeLogros.map(x => x.descripcion),
    competenciasEspecificas: props.competenciasEspecificas.map(x => x.descripcion),
    contenido: props.contenido?.descripcion,
    grados: [],
  }
})

const disabledFlopiBot = computed(() => {
  return !props.unidadCurricular || 
         props.competenciasGenerales.length === 0 || 
         props.competenciasEspecificas.length === 0 || 
         props.criteriosDeLogros.length === 0 ||
         !props.contenido;
})

const handleUseAllMetaYPlan = (value: { meta: string, plan: string }) => {
    metaAprendizajeContentHtml.value = value.meta;
    planAprendizajeContentHtml.value = value.plan;
    onChangeModel();
}

const handleUseMeta = (meta: string) => {
    metaAprendizajeContentHtml.value = meta;
    onChangeModel();
}

const handleUsePlan = (plan: string) => {
    planAprendizajeContentHtml.value = plan;
    onChangeModel();
}

// --- Fin Lógica de IA ---

const getCurrentData = () => {
  const { actividad } = props.modelValue;
  actividad.meta_aprendizaje_html_content = metaAprendizajeContentHtml.value;
  actividad.plan_aprendizaje_html_content = planAprendizajeContentHtml.value;

  return {
    ...props.modelValue,
    actividad: { ...actividad }
  };
}

const onChangeModel = () => {
  emit('update:modelValue', getCurrentData());
}

watch(() => props.modelValue, (newValue, oldValue) => {
  if (!newValue) return;
  if (newValue.id !== oldValue?.id) {
    loadForm();
  }
})
</script>
Template
He envuelto los editores en el contenedor visual de "Generación de Aprendizaje" e incluido el componente FlopiBotGenerarMetaYPlanModal.

HTML
<template>
  <div class="w-full px-2 pb-20 border-l border-neutral-200">
    <h1 class="font-medium text-xl text-center my-4">
      Actividad {{ props.actividadSecuencia.orden }}
    </h1>

    <div class="w-full flex flex-col gap-2 mt-2">
      
      <div class="mt-6 p-6 border-2 border-dashed border-primary-200 rounded-2xl bg-primary-50/30">
        
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 class="text-2xl font-bold text-primary-700 flex items-center gap-2">
              <UIcon name="i-lucide-sparkles" class="text-primary-500" />
              Generación de Aprendizaje
            </h2>
            <p class="text-sm text-gray-500">Usa la IA para redactar la actividad según el contexto curricular.</p>
          </div>

          <FlopiBotGenerarMetaYPlanModal
            :disabled="disabledFlopiBot"
            :planificacion="{
              espacio: props.espacio,
              unidadCurricular: props.unidadCurricular,
              contenido: props.contenido,
              criteriosLogro: props.criteriosDeLogros,
              competenciasEspecificas: props.competenciasEspecificas,
              competenciasGenerales: props.competenciasGenerales,
              grupo: props.grupo
            }"
            @use-all="handleUseAllMetaYPlan"
            @update:meta="handleUseMeta"
            @update:plan="handleUsePlan"
          />
        </div>

        <div class="grid grid-cols-1 gap-4">
          <UCard class="flex-1 flex flex-col hover:shadow-md transition-shadow">
            <div class="flex flex-col justify-between h-full">
              <div class="flex items-center gap-2 mb-4">
                <div class="p-2 bg-orange-100 rounded-lg">
                  <UIcon name="i-lucide-target" class="text-orange-600 w-5 h-5" />
                </div>
                <span class="font-bold text-lg text-gray-800">Meta de Aprendizaje</span>
              </div>

              <EditorSlideOver 
                v-model="metaAprendizajeContentHtml"
                @update:model-value="onChangeModel"
                :promptCategories="[PromptCategory.META_DE_APRENDIZAJE]"
                title="Meta de Aprendizaje" 
                :paramsBot="paramsBotMetaAprendizaje"
                disabledText="Debes seleccionar los elementos curriculares previos antes de asignar una meta."
              />
            </div>
          </UCard>

          <UCard class="flex-1 flex flex-col hover:shadow-md transition-shadow">
            <div class="flex flex-col justify-between h-full">
              <div class="flex items-center gap-2 mb-4">
                <div class="p-2 bg-blue-100 rounded-lg">
                  <UIcon name="i-lucide-map" class="text-blue-600 w-5 h-5" />
                </div>
                <span class="font-bold text-lg text-gray-800">Plan de Aprendizaje</span>
              </div>

              <EditorSlideOver 
                v-model="planAprendizajeContentHtml"
                @update:model-value="onChangeModel"
                :promptCategories="[PromptCategory.OTROS]"
                title="Plan de aprendizaje" 
                :paramsBot="{}"
                disabledText="Debes seleccionar los elementos curriculares previos antes de asignar un plan."
              />
            </div>
          </UCard>
        </div>
      </div>
      </div>
  </div>
</template>