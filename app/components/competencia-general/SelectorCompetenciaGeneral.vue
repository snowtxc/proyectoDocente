<script setup lang="ts">
import type { CompetenciaEspecifica, CompetenciaGeneral, CompetenciaGeneralItemSelector } from '~/types/competenciaEspecifica';
import type { Contenido } from '~/types/contenido';

interface Props {
    modelValue: CompetenciaGeneral[],
    competenciasGenerales: CompetenciaGeneral[],
    competenciasEspecificasSelected: CompetenciaEspecifica[]
    disabled?: boolean;
    color?: string
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: null,
});

const emit = defineEmits(['update:model-value']);

const getLista = () : CompetenciaGeneralItemSelector[] =>{

  return props.competenciasGenerales.map(competenciaGeneral =>{

      let recomendado : boolean = false;
      let contenidoRelacionado : Contenido = null;
      let competenciasEspecificasRelacionadas: CompetenciaEspecifica[] = [];

      let nroRelaciones = 0;
      
      if(props.competenciasEspecificasSelected){
          // tu lógica intacta
      }

      return {
          ...competenciaGeneral,
          checked: props.modelValue?.findIndex(ce => ce.id == competenciaGeneral.id) >= 0,
          recomendado,
          competenciasEspecificasRelacionadas,
          nroRelaciones
      }
  }).sort((a,b)=>{    
      if(a.recomendado && (a.nroRelaciones > b.nroRelaciones))
          return -1;
      return 1;
  })
}

const competenciasGenerales = ref(getLista());

const isOpen = ref<boolean>(false);
const q = ref<string>('');

const competenciasGeneralesFiltered = computed(()=>{
    return competenciasGenerales.value.filter(competenciaGeneral =>{

        const { nombre } = competenciaGeneral;
        const nombreLowerCase = nombre.toLowerCase();

        if(q.value.trim().length > 0){
            const qLowerCase = q.value.toLocaleLowerCase();
            if(!nombreLowerCase.includes(qLowerCase))
                return false;
        }

        return true;
    })
})

const emptyFiltered = computed(()=>{
    return competenciasGeneralesFiltered.value.length == 0;
})

const onSave = ()=>{
  const competenciasGeneralesSelected = competenciasGenerales.value.filter(cdl => cdl.checked);
  emit('update:model-value', competenciasGeneralesSelected);
  isOpen.value = false;
}

const onToggle = (competenciaGeneral: CompetenciaGeneral & { checked: boolean })=>{
    competenciaGeneral.checked = !competenciaGeneral.checked;
}

watch([
  () => props.modelValue, 
  () => props.competenciasEspecificasSelected
] ,()=>{
  competenciasGenerales.value = getLista()
})
</script>

<template>

  <UButton
      icon="tabler:pencil"
      size="sm"
      color="primary"
      variant="outline"
      @click="isOpen = true"
      :disabled="props.disabled"
  />

  <UModal v-model:open="isOpen" fullscreen>
    <template #content>

      <!-- CARD FLEX -->
      <UCard class="min-w-0 flex flex-col max-h-[90vh]">

        <!-- HEADER -->
        <template #header>
          <div class="flex gap-2 items-center mt-2">
            <UInput
              v-model="q"
              icon="i-heroicons-magnifying-glass"
              placeholder="Buscar competencia general"
              autofocus
              class="flex-1"
            />

            <UButton
              icon="tabler:x"
              size="sm"
              color="primary"
              square
              variant="solid"
              @click="isOpen = false"
            />
          </div>
        </template>

        <!-- BODY SCROLLABLE -->
        <div class="flex-1 overflow-y-auto max-h-[60vh] overflow-y-auto">

          <div v-if="emptyFiltered"
            class="flex flex-col justify-center items-center mt-5 text-center px-2">
            <UIcon name="tabler:search" class="w-8 h-8"/>
            <span>
              No pudimos encontrar ninguna competencia general.
            </span>
          </div>

          <ul v-else role="list"
            class="divide-y divide-gray-200 dark:divide-gray-800">
            
            <li
              v-for="(competenciaGeneral) in competenciasGeneralesFiltered"
              :key="competenciaGeneral.id"
              @click="onToggle(competenciaGeneral)"
              class="w-full flex justify-between gap-3 py-3 px-4 sm:px-6"
            >

              <div class="flex justify-between items-center gap-3 w-full hover:cursor-pointer">
                <div class="text-sm min-w-0 flex gap-2 items-center">
                  <UCheckbox size="xl" v-model="competenciaGeneral.checked"/>
                  <p class="text-gray-900 dark:text-white font-medium">
                    {{ competenciaGeneral.nombre }} 
                  </p>
                </div>

                <UAvatar
                  :src="competenciaGeneral.url_image"
                  size="md"
                  class="text-center"
                />
              </div>

              <div class="flex items-start gap-3">
                <UPopover mode="hover" v-if="competenciaGeneral.recomendado">
                  <UTooltip>
                    <UButton
                      label="Recomendado"
                      icon="tabler:butterfly-filled"
                      :color="getColorBadgeComponente(props.color)"
                      variant="outline"
                    />
                  </UTooltip>

                  <template #content>
                    <div class="p-4 flex flex-col gap-y-4 max-w-64">
                      <div v-if="competenciaGeneral.competenciasEspecificasRelacionadas?.length > 0">
                        <span class="font-medium">
                          Se relaciona a las siguientes competencias especificas:
                        </span>
                        <ul class="list-disc ml-4">
                          <li
                            v-for="(competenciaEspecifica,idx) in competenciaGeneral.competenciasEspecificasRelacionadas"
                            :key="idx"
                          >
                            {{ competenciaEspecifica.descripcion }}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </template>
                </UPopover>
              </div>

            </li>
          </ul>

        </div>

        <!-- FOOTER FIX -->
        <template #footer>
          <div class="flex justify-end gap-3 py-4">
            <UButton
              label="Cancelar"
              color="neutral"
              variant="ghost"
              @click="isOpen = false"
            />

            <UButton
              type="button"
              label="Guardar"
              color="primary"
              @click="onSave"
            />
          </div>
        </template>

      </UCard>
    </template>
  </UModal>

</template>
