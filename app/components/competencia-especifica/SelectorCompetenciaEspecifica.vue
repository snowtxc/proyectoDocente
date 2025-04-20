<script setup lang="ts">
import type { CompetenciaEspecifica, CompetenciaEspecificaItemSelector, CompetenciaGeneral } from '~/types/competenciaEspecifica';
import type { Contenido } from '~/types/contenido';
import type { CriterioDeLogro } from '~/types/criterioDeLogro';
import { FormsCompetenciasGenerales, UPopover } from '#components';

  interface Props {
      modelValue: CompetenciaEspecifica[],
      competenciasEspecificas: CompetenciaEspecifica[],
      competenciasGenerales: CompetenciaGeneral[]
      contenidoSelected?: Contenido,
      criteriosDeLogrosSelected?: CriterioDeLogro[]
      color: string
      disabled?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
      modelValue: null,
  });

  const filters = ref<{competenciasGenerales: CompetenciaGeneral[]}>({
    competenciasGenerales: []
  })

  const emit = defineEmits(['update:model-value']);

  
  const getLista = () : CompetenciaEspecificaItemSelector[] =>{
    return props.competenciasEspecificas.map(competenciaEspecifica =>{

        let recomendado : boolean = false;
        let contenidoRelacionado : Contenido = null;
        let criteriosDeLogrosRelacionados: CriterioDeLogro[] = [];

        let nroRelaciones: number = 0;

        if(props.contenidoSelected){
            contenidoRelacionado = competenciaEspecifica.contenidos.find(c => c.id == props.contenidoSelected.id);
            if(contenidoRelacionado){
                recomendado = true;
                nroRelaciones += 1;
            }
        }

        if(props.criteriosDeLogrosSelected){

            criteriosDeLogrosRelacionados = competenciaEspecifica.criterios_de_logros.filter(criterioDeLogro => {
               const result =  props.criteriosDeLogrosSelected.some(cdl => cdl.id == criterioDeLogro.id);
               if(result)
                nroRelaciones += 1;
               return result;
            })

            if(criteriosDeLogrosRelacionados.length > 0)
                recomendado = true;
        }

        return {
            ...competenciaEspecifica,
            checked: props.modelValue.findIndex(ce => ce.id == competenciaEspecifica.id) >= 0,
            recomendado ,
            contenidoRelacionado,
            criteriosDeLogrosRelacionados,
            nroRelaciones
        }
    }).sort((a,b)=>{    
        if(a.recomendado && (a.nroRelaciones > b.nroRelaciones))
            return -1;
        return 1;
    })
  }

  const competenciasEspecificas = ref(getLista());

  const isOpen = ref<boolean>(true);

  const q = ref<string>('');

  const competenciasEspecificasFiltered = computed(()=>{
      return competenciasEspecificas.value.filter(competenciaEspecifica =>{

          const {  descripcion } = competenciaEspecifica;

          const descripcionLowerCase = descripcion.toLowerCase();

          if(q.value.trim().length > 0){
              const qLowerCase = q.value.toLocaleLowerCase();
              if(!descripcionLowerCase.includes(qLowerCase))
                  return false;
          }


          //Filtros por filtro de competencias generales.

          if(filters.value.competenciasGenerales.length > 0){
            const incluyeCompetenciaGeneral = filters.value.competenciasGenerales.every(cg => {
                return competenciaEspecifica.competencias_generales.some(x => x.id == cg.id);
            })
            if(!incluyeCompetenciaGeneral)
                return false;
          }


          return true;
      })
  })

  const emptyFiltered = computed(()=>{
      return competenciasEspecificasFiltered.value.length == 0;
  })

  const onSave = ()=>{
    const competenciasEspecificasSelected = competenciasEspecificas.value.filter(cdl => cdl.checked);
    emit('update:model-value', competenciasEspecificasSelected);
    isOpen.value = false;
  }

  const onToggleCompetenciaEspecifica = (competenciaEspecifica: CompetenciaEspecifica & {
      checked: boolean;
  })=>{
      if(competenciaEspecifica.checked){
        competenciaEspecifica.checked = false;
        return;
      }
      competenciaEspecifica.checked = true;
      
  }

  watch([
    () => props.modelValue, 
    () => props.competenciasEspecificas,
    () => props.contenidoSelected,
    () => props.criteriosDeLogrosSelected] ,()=>{
    competenciasEspecificas.value = getLista()
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

  <UModal v-model="isOpen">
      <UCard :ui="{ header: { padding: 'p-4 sm:px-6' }, body: { padding: '' } }" class="min-w-0 min-h-[75vh]">
        <template #header>
          <div class="flex gap-2 items-center mt-2">
            <UInput v-model="q" icon="i-heroicons-magnifying-glass" placeholder="Buscar competencia especifica" autofocus class="flex-1" />
            
            <UPopover :popper="{ placement: 'bottom-start' }" mode="click">
                <template #default="{ open }">
                  <UTooltip
                    :prevent="open"
                  >
                  <UButton
                    size="sm"
                    color="primary"
                    square
                    variant="outline"
                    class="flex-none"
                    >
                    <template #leading="{ modelValue, ui }">
                        
                        <div class="flex flex-col">
                            <div class="w-2 h-2 rounded-full bg-green-500  absolute float-right" v-if="filters.competenciasGenerales.length > 0"> </div>
                            <UIcon name="tabler:filter-cog" class="size-5" />
                        </div>
                        

                      </template>
                    </UButton>
                  </UTooltip>
                </template>

                <template #panel="{ close }">
                    <div class="p-2 m-4 flex flex-col gap-y-4 max-w-64">
                        <FormsCompetenciasGenerales 
                        v-model="filters.competenciasGenerales" 
                        :competenciasGenerales="props.competenciasGenerales" ></FormsCompetenciasGenerales>
                    </div>
                </template>
             </UPopover>

            <UButton
            icon="tabler:x"
            size="sm"
            color="primary"
            square
            variant="solid"
            class="flex-none"
            @click="isOpen = false;"
            />
          </div>
    
        </template>

        <div class="w-full overflow-y-auto max-h-full h-[75vh]">
          <div v-if="emptyFiltered" class="flex flex-col justify-center items-center mt-5 text-center px-2" >
            <UIcon name="tabler:search" class="w-8 h-8"/>
            <span>
              No pudimos encontrar ninguna competencia especifica.
            </span>
          </div>
          <ul v-else role="list" class="divide-y divide-gray-200 dark:divide-gray-800 overflow-y-auto">
            <li v-for="(competenciaEspecifica) in competenciasEspecificasFiltered" :key="competenciaEspecifica.id" @click="onToggleCompetenciaEspecifica(competenciaEspecifica)"
              class="w-full flex justify-between gap-3 py-3 px-4 sm:px-6">
              <div class="flex items-center gap-3 w-full hover:cursor-pointer">
                <div class="text-sm min-w-0 flex gap-2">
                  <UCheckbox size="xl" v-model="competenciaEspecifica.checked"/>
                  <p class="text-gray-900 dark:text-white font-medium">
                    {{ competenciaEspecifica.codificacion }} {{ competenciaEspecifica.descripcion }}
                  </p>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <UPopover :popper="{ placement: 'bottom-start' }" mode="hover" v-if="competenciaEspecifica.recomendado">
                    <template #default="{ open }">
                      <UTooltip
                        :prevent="open"
                      >
                         <UButton label="Recomendado" icon="tabler:butterfly-filled" :color="getColorBadgeComponente(props.color)" variant="outline"/>
                      </UTooltip>
                    </template>

                    <template #panel="{ close }">
                        <div class="p-2 m-4 flex flex-col gap-y-4 max-w-64">
                            <div v-if="competenciaEspecifica.contenidoRelacionado">
                                <span class="font-medium"> Se relaciona al contenido seleccionado: </span>
                                <ul class="list-disc">
                                    <li> {{ competenciaEspecifica.contenidoRelacionado?.descripcion }}</li>
                                </ul>
                            </div>
                            <USeparator color="primary" type="solid" />

                            <div v-if="competenciaEspecifica.criteriosDeLogrosRelacionados?.length > 0">
                                <span class="font-medium"> Se relaciona a los criterios de logros seleccionados: </span>
                                <ul class="list-disc">
                                    <li v-for="(criterioDeLogro,idx) in competenciaEspecifica.criteriosDeLogrosRelacionados" :key="idx"> {{ criterioDeLogro.descripcion }}</li>
                                </ul>
                            </div>

                        </div>

                    </template>
                </UPopover>
              </div>
            </li>
          </ul>
        </div>

        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton
              label="Cancelar"
              color="gray"
              variant="ghost"
              @click="isOpen = false"
            />

            <UButton
                type="button"
              label="Guardar"
              color="black"
              @click="onSave"
              />
          </div>
        </template>

      </UCard>
  </UModal>

</template>