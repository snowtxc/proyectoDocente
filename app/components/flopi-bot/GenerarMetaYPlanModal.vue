<script lang="ts" setup>
import { ref, computed } from 'vue';
import flyingBeeAnimation from '@/lotties/Flying bee-2.json';
import type { Espacio } from '~/types/espacio';
import type { UnidadCurricular } from '~/types/unidadCurricular';
import type { Contenido } from '~/types/contenido';
import type { CompetenciaEspecifica, CompetenciaGeneral } from '~/types/competenciaEspecifica';
import type { CriterioDeLogro } from '~/types/criterioDeLogro';
import type { FlopiBotGeneracionPlanRequest, GeneracionPlanResponse } from '~/types/flopiBot';
import type { Grupo } from '~/types/grupo';
import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum';

interface Props {
  disabled?: boolean;
  planificacion: {
    espacio: Espacio;
    unidadCurricular: UnidadCurricular
    contenido: Contenido
    competenciasEspecificas: CompetenciaEspecifica[]
    competenciasGenerales: CompetenciaGeneral[]
    criteriosLogro: CriterioDeLogro[],
    grupo: Grupo
  }
}

const { $apiRest } = useNuxtApp();
const toast = useToast();

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
});

const attachedFile = ref<{ name: string, data: string, type: string } | null>(null);
const emit = defineEmits(['update:meta', 'update:plan', 'use-all']);

const isOpen = ref(false);
const loading = ref(false);
const userContext = ref('');

const redefiningType = ref<'meta' | 'plan' | null>(null);
const redefineContext = ref('');
const isRedefining = ref(false);

const options = ref({
  meta: true,
  plan: true
});

const aiResults = ref({
  meta: '',
  plan: ''
});

const canGenerate = computed(() => {
  return (options.value.meta || options.value.plan) && userContext.value.trim().length > 5;
});

const handleGeneration = () => {
  isOpen.value = true;
};

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    toast.error({ title: "Archivo demasiado grande", message: "El máximo es 5MB", color: "red" });
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    attachedFile.value = {
      name: file.name,
      type: file.type,
      data: (reader.result as string).split(',')[1] 
    };
    toast.success({ title: "Archivo cargado", message: file.name, color: "green" });
  };
  
  reader.onerror = () => {
    toast.error({ title: "Error", message: "No se pudo leer el archivo", color: "red" });
  };

  reader.readAsDataURL(file);
};

const removeFile = () => {
  attachedFile.value = null;
};

const generatePlan = async () => {
  if (!canGenerate.value) return;
  
  loading.value = true;
  aiResults.value = { meta: '', plan: '' }; 

  try {
    const body: FlopiBotGeneracionPlanRequest = {
      grados: props.planificacion.grupo.grados.map(g => g.nombre),
      opciones_generacion: {
        generar_meta: options.value.meta,
        generar_plan: options.value.plan
      },
      datos_planificacion: {
        espacio : props.planificacion.espacio.nombre,
        unidad_curricular: props.planificacion.unidadCurricular.nombre,
        contenido: props.planificacion.contenido.descripcion,
        competencias_generales: props.planificacion.competenciasGenerales.map(cg => cg.nombre),
        competencias_especificas: props.planificacion.competenciasEspecificas.map(ce => `${ce.codificacion} ${ce.descripcion}`),
        criterios_logro: props.planificacion.criteriosLogro.map(cl => cl.descripcion)
      },
      contexto_adicional: userContext.value,
      archivo_adjunto: attachedFile.value ? {
        contenido: attachedFile.value.data,
        mimetype: attachedFile.value.type,
        nombre: attachedFile.value.name
      } : null
    }

    const result: GeneracionPlanResponse = await $apiRest<GeneracionPlanResponse>(apiFlopiBot.generarPropuestaPedagogica, HttpMethodEnum.POST, body);
      
    if (result.meta) aiResults.value.meta = result.meta;
    if (result.plan) aiResults.value.plan = result.plan;

  } catch (errorMessage) {
    toast.error({ title: "Error", message: errorMessage as string, color: "red" });
  } finally {
    loading.value = false;
  }
};

const openRedefineModal = (type: 'meta' | 'plan') => {
  redefiningType.value = type;
  redefineContext.value = '';
};

const redefineResult = async () => {
  if (!redefineContext.value.trim() || !redefiningType.value) return;

  isRedefining.value = true;
  const type = redefiningType.value;

  try {
    const body: FlopiBotGeneracionPlanRequest = {
      grados: props.planificacion.grupo.grados.map(g => g.nombre),
      opciones_generacion: {
        generar_meta: type === 'meta',
        generar_plan: type === 'plan'
      },
      datos_planificacion: {
        espacio : props.planificacion.espacio.nombre,
        unidad_curricular: props.planificacion.unidadCurricular.nombre,
        contenido: props.planificacion.contenido.descripcion,
        competencias_generales: props.planificacion.competenciasGenerales.map(cg => cg.nombre),
        competencias_especificas: props.planificacion.competenciasEspecificas.map(ce => `${ce.codificacion} ${ce.descripcion}`),
        criterios_logro: props.planificacion.criteriosLogro.map(cl => cl.descripcion)
      },
      contexto_adicional: `
        CONTEXTO ORIGINAL: ${userContext.value}
        RESULTADO ACTUAL A MEJORAR: ${aiResults.value[type]}
        SOLICITUD DE AJUSTE DEL USUARIO: ${redefineContext.value}
      `
    };

    const result: GeneracionPlanResponse = await $apiRest<GeneracionPlanResponse>(apiFlopiBot.generarPropuestaPedagogica, HttpMethodEnum.POST, body);
      
    if (type === 'meta' && result.meta) aiResults.value.meta = result.meta;
    if (type === 'plan' && result.plan) aiResults.value.plan = result.plan;

    redefiningType.value = null;
    toast.success({ title: "Ajuste aplicado correctamente", color: "green" });

  } catch (errorMessage) {
    toast.error({ title: "Error al ajustar", message: errorMessage as string, color: "red" });
  } finally {
    isRedefining.value = false;
  }
};

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success({ title: "Copiado al portapapeles", color: "green", icon: "i-lucide-copy" });
  } catch (err) {
    toast.error({ title: "Error al copiar", color: "red" });
  }
};

const useSingleResult = (type: 'meta' | 'plan') => {
  const value = type === 'meta' ? aiResults.value.meta : aiResults.value.plan;
  emit(`update:${type}`, value);
  toast.success({ title: `Se ha aplicado ${type === 'meta' ? 'la meta' : 'el plan'}`,  color: "green"});
  isOpen.value = false;
};

const useBothResults = () => {
  emit('use-all', { meta: aiResults.value.meta, plan: aiResults.value.plan });
  toast.success({ title: "Meta y Plan aplicados correctamente",  color: "green", icon: "i-lucide-check-circle" });
  isOpen.value = false;
};
</script>

<template>
  <UTooltip 
    text="Es necesario ingresar los componentes básicos de la planificación (Unidad curricular, contenido, criterios de logros, competencias)" 
    :prevent="!props.disabled"
  >
    <UButton
      icon="i-lucide-bot"
      size="xl"
      color="primary"
      variant="solid"
      class="shadow-lg hover:scale-105 transition-transform font-bold"
      :disabled="props.disabled"
      @click="handleGeneration"
    >
      Usar Flopi bot
      <template #trailing>
        <UIcon name="i-lucide-wand-2" class="animate-pulse" />
      </template>
    </UButton>
  </UTooltip>

  <UModal v-model:open="isOpen" fullscreen>
    <template #content>
      <UCard class="flex flex-col h-full overflow-y-auto">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-bold flex items-center gap-2">
              <UIcon name="i-lucide-sparkles" class="text-primary" />
              Configurador de Aprendizaje con IA
            </h3>
            <UButton color="neutral" variant="ghost" icon="i-lucide-x" @click="isOpen = false" />
          </div>
        </template>

        <div class="mx-auto w-full space-y-8 p-4">
          <section class="bg-primary-50 dark:bg-primary-950/20 p-5 rounded-2xl border border-primary-100 dark:border-primary-900/50">
            <p class="text-sm font-bold text-primary mb-4 uppercase tracking-wider flex items-center gap-2">
              <UIcon name="i-lucide-settings-2" />
              ¿Qué necesitas que genere Flopi bot?
            </p>
            <div class="flex gap-8">
              <UCheckbox v-model="options.meta" label="Meta de aprendizaje" class="font-medium" />
              <UCheckbox v-model="options.plan" label="Plan de actividades" class="font-medium" />
            </div>
          </section>

          <section class="bg-gray-50 dark:bg-gray-800/40 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
            <div class="flex items-center gap-2 mb-5 border-b border-gray-200 dark:border-gray-700 pb-3">
              <UIcon name="i-lucide-clipboard-list" class="text-primary-500 w-5 h-5" />
              <h4 class="font-bold text-gray-800 dark:text-gray-100">Base de tu planificación (MCN)</h4>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-1">
                <span class="text-[10px] uppercase font-black text-gray-400 tracking-widest">Espacio y Unidad</span>
                <div class="flex items-center">
                  <span 
                    v-if="props.planificacion.espacio" 
                    :style="{ backgroundColor: props.planificacion.espacio.rgbColor }"
                    class="inline-block h-3 w-3 flex-shrink-0 rounded-full mr-2 shadow-sm border border-black/5" 
                  />
                  <p class="text-sm text-gray-700 dark:text-gray-300">
                    {{ props.planificacion.espacio.nombre }} / {{ props.planificacion.unidadCurricular.nombre }}
                  </p>
                </div>
              </div>

              <div class="space-y-1">
                <span class="text-[10px] uppercase font-black text-gray-400 tracking-widest">Contenido</span>
                <p class="text-sm text-gray-700 dark:text-gray-300 font-semibold">{{ props.planificacion.contenido.descripcion }}</p>
              </div>

              <div class="space-y-3">
                <span class="text-[10px] uppercase font-black text-gray-400 tracking-widest">Competencias Generales</span>
                <div class="space-y-2">
                  <div 
                    v-for="compGen in props.planificacion.competenciasGenerales" 
                    :key="compGen.id"
                    class="flex items-center gap-3 p-2 rounded-lg bg-white/50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700"
                  >
                    <p class="text-xs text-gray-900 dark:text-white font-medium truncate flex-1">{{ compGen.nombre }}</p>
                    <UAvatar v-if="compGen.url_image" :src="compGen.url_image" size="xs" class="flex-shrink-0" />
                  </div>
                </div>
              </div>

              <div class="md:col-span-2 space-y-3">
                <span class="text-[10px] uppercase font-black text-gray-400 tracking-widest">Competencias especificas</span>
                <div class="flex flex-wrap gap-2">
                  <span v-for="comp in props.planificacion.competenciasEspecificas" :key="comp.id" class="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                     {{ comp.codificacion}} : {{ comp.descripcion }}
                  </span>
                </div>
              </div>

              <div class="md:col-span-2 space-y-3">
                <span class="text-[10px] uppercase font-black text-gray-400 tracking-widest">Criterios de logros</span>
                <div class="flex flex-wrap gap-2">
                  <span v-for="criterio in props.planificacion.criteriosLogro" :key="criterio.id" class="text-xs italic text-gray-600 dark:text-gray-400">
                    • {{ criterio.descripcion }}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section class="space-y-4">
            <div class="flex flex-col gap-1 border-l-4 border-primary-500 pl-4">
              <p class="font-bold text-gray-800 dark:text-gray-100">Información adicional para personalizar la propuesta</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">Detallá intereses del grupo, materiales disponibles o dinámicas de aula específicas.</p>
            </div>

            <UTextarea
              v-model="userContext"
              placeholder="Ej: El interés del grupo está en la fauna del Río de la Plata. Incluir actividades con materiales de desecho..."
              :rows="4"
              autoresize
              size="xl"
              class="w-full"
              variant="outline"
              color="primary"
            />

            <section class="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-2xl border border-primary/20 mt-4">
              <div class="flex items-center justify-between mb-3">
                <p class="text-xs font-bold text-primary uppercase flex items-center gap-2">
                  <UIcon name="i-lucide-file-up" />
                  Materiales de apoyo (PDF o Imágenes)
                </p>
                <UButton
                  v-if="attachedFile"
                  icon="i-lucide-trash-2"
                  color="error"
                  variant="ghost"
                  size="xs"
                  label="Quitar archivo"
                  @click="removeFile"
                />
              </div>

              <UInput 
                v-if="!attachedFile"
                type="file" 
                size="sm" 
                color="neutral" 
                icon="i-lucide-paperclip"
                accept=".pdf, .jpg, .png"
                @change="handleFileUpload"
              />

              <div v-else class="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-xl border border-primary/30 shadow-sm">
                <div class="bg-primary/10 p-2 rounded-lg">
                  <UIcon :name="attachedFile.type.includes('pdf') ? 'i-lucide-file-text' : 'i-lucide-image'" class="w-5 h-5 text-primary" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ attachedFile.name }}</p>
                  <p class="text-[10px] text-gray-500 uppercase">Archivo cargado exitosamente</p>
                </div>
                <UIcon name="i-lucide-check-circle-2" class="text-green-500 w-5 h-5" />
              </div>
            </section>

            <div class="flex justify-end gap-3">
              <UButton 
                label="Generar con Flopi bot" 
                icon="i-lucide-wand-2" 
                size="xl" 
                class="px-8 shadow-md"
                :loading="loading"
                :disabled="!canGenerate"
                @click="generatePlan"
              />
            </div>
          </section>

          <UDivider />

          <div v-if="loading" class="flex flex-col items-center justify-center py-12">
            <LottieAnimation :animationData="flyingBeeAnimation" class="w-1/2 max-w-[280px] m-auto" />
            <p class="text-center font-medium italic animate-pulse mt-4 text-primary">Flopi bot está procesando el contexto del grupo...</p>
          </div>

          <div v-else-if="aiResults.meta || aiResults.plan" class="space-y-6 pb-10">
            <div v-if="aiResults.meta && aiResults.plan" class="flex justify-center">
              <UButton 
                label="Usar Meta y Plan en mi planificación" 
                icon="i-lucide-check-check" 
                color="primary" 
                size="xl" 
                class="rounded-full shadow-xl px-10"
                @click="useBothResults"
              />
            </div>

            <div class="grid gap-6 md:grid-cols-2">
              <div v-if="aiResults.meta" class="bg-white dark:bg-gray-900 rounded-2xl p-6 border-l-8 border-primary shadow-sm flex flex-col">
                <div class="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">
                  <span class="text-primary font-black uppercase text-[10px] tracking-widest flex items-center gap-2">
                    <UIcon name="i-lucide-target" class="w-4 h-4" /> Meta
                  </span>
                  <div class="flex gap-1">
                    <UButton icon="i-lucide-message-square-dashed" color="neutral" variant="ghost" size="xs" @click="openRedefineModal('meta')" />
                    <UButton icon="i-lucide-copy" color="neutral" variant="ghost" size="xs" @click="copyToClipboard(aiResults.meta)" />
                    <UButton label="Usar meta" color="primary" variant="subtle" size="xs" @click="useSingleResult('meta')" />
                  </div>
                </div>
                <div class="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300" v-html="aiResults.meta" />
              </div>

              <div v-if="aiResults.plan" class="bg-white dark:bg-gray-900 rounded-2xl p-6 border-l-8 border-primary shadow-sm flex flex-col" :class="{'md:col-span-2': !aiResults.meta}">
                <div class="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">
                  <span class="text-primary font-black uppercase text-[10px] tracking-widest flex items-center gap-2">
                    <UIcon name="i-lucide-list-checks" class="w-4 h-4" /> Propuesta de Actividades
                  </span>
                  <div class="flex gap-1">
                    <UButton icon="i-lucide-message-square-dashed" color="neutral" variant="ghost" size="xs" @click="openRedefineModal('plan')" />
                    <UButton icon="i-lucide-copy" color="neutral" variant="ghost" size="xs" @click="copyToClipboard(aiResults.plan)" />
                    <UButton label="Usar plan" color="primary" variant="subtle" size="xs" @click="useSingleResult('plan')" />
                  </div>
                </div>
                <div class="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300" v-html="aiResults.plan" />
              </div>
            </div>
          </div>
          
          <div v-else class="text-center text-gray-400 py-24 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl flex flex-col items-center gap-4">
            <UIcon name="i-lucide-sparkles" class="w-12 h-12 opacity-20" />
            <p class="max-w-xs mx-auto">Completá el contexto de tu grupo y Flopi bot generará una propuesta personalizada para tu clase.</p>
          </div>
        </div>
      </UCard>
    </template>
  </UModal>

  <UModal :open="!!redefiningType" @close="redefiningType = null">
    <template #content>
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-message-square-dashed" class="text-primary" />
            <h3 class="font-bold text-lg">Ajustar {{ redefiningType === 'meta' ? 'Meta' : 'Plan' }}</h3>
          </div>
        </template>
        <div class="space-y-4">
          <p class="text-sm text-gray-500">¿Qué te gustaría cambiar o mejorar específicamente en este resultado?</p>
          <UTextarea v-model="redefineContext" placeholder="Ej: Hazlo más breve, enfócate en lo tecnológico..." :rows="3" autoresize color="primary" class="w-full" />
        </div>
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton label="Cancelar" color="neutral" variant="ghost" @click="redefiningType = null" />
            <UButton label="Actualizar" color="primary" icon="i-lucide-wand-2" :loading="isRedefining" :disabled="!redefineContext.trim()" @click="redefineResult" />
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>

<style scoped>
:deep(table) { width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 0.875rem; }
:deep(th), :deep(td) { border: 1px solid #e5e7eb; padding: 0.5rem; text-align: left; }
:deep(th) { background-color: #f9fafb; }
:deep(ul), :deep(ol) { padding-left: 1.5rem; margin-bottom: 1rem; }
:deep(li) { margin-bottom: 0.25rem; }
</style>