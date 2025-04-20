<script setup lang="ts">
import type { CompetenciaGeneral, CompetenciaGeneralItemSelector } from '~/types/competenciaEspecifica';


interface Props {
    modelValue: CompetenciaGeneral[],
    competenciasGenerales: CompetenciaGeneral[]
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: null,
});

const emit = defineEmits(['update:model-value','close']);

const competenciasGenerales = ref<CompetenciaGeneralItemSelector[]>(props.competenciasGenerales.map(cg => {
    return {
        ...cg,
        checked: props.modelValue.some(x => x.id == cg.id) 
    }
}));


const onSubmit = (): void=>{
    const competenciasGeneralesSelected = competenciasGenerales.value.filter(cg => cg.checked);
    emit('update:model-value',competenciasGeneralesSelected);
}

const onToggleCompetenciaGeneral = (competenciaGeneral: CompetenciaGeneralItemSelector)=>{
      if(competenciaGeneral.checked){
        competenciaGeneral.checked = false;
        return;
      }
      competenciaGeneral.checked = true;  
}

const clearFilters = ()=>{
    competenciasGenerales.value.map(cg =>{
        cg.checked = false;
    })
    emit('update:model-value', []);
}

</script>

<template>
    
    <div class="w-full overflow-y-auto max-h-full h-[60vh]">

        <ul  role="list" class="divide-y divide-gray-200 dark:divide-gray-800 overflow-y-auto">
          <li v-for="(competenciaGeneral) in competenciasGenerales" :key="competenciaGeneral.id" @click="onToggleCompetenciaGeneral(competenciaGeneral)"
            class="w-full flex justify-between gap-3 py-3 px-4 sm:px-6">
            <div class="flex items-center gap-3 w-full hover:cursor-pointer">
              <div class="text-sm min-w-0 flex items-center gap-3">
                <UCheckbox size="xl" v-model="competenciaGeneral.checked"/>
                <p class="text-gray-900 dark:text-white font-medium flex items-center gap-2">
                  <span>{{ competenciaGeneral.nombre }} </span>
                  <UAvatar :src="competenciaGeneral.url_image" size="sm" class="text-center mt-2"/>
                </p>
              </div>
            </div>
          </li>
        </ul>
      </div>

    <div class="flex justify-end gap-3">
        <UButton
        label="Limpiar"
        icon="tabler:filter-minus"
        @click="clearFilters"
        color="gray"
        />

        <UButton
        type="button"
        icon="tabler:filter-plus"
        label="Aplicar"
        color="black"
        @click="onSubmit"
        />
    </div>
</template>
