<script setup lang="ts">
import type { CompetenciaEspecifica } from '~/types/competenciaEspecifica';
import type { Contenido } from '~/types/contenido';
import type { CriterioDeLogro, CriterioDeLogroItemSelector } from '~/types/criterioDeLogro';

  interface Props {
      modelValue: CriterioDeLogro[],
      criteriosDeLogros: CriterioDeLogro[],
      contenidoSelected?: Contenido;
      competenciasEspecificasSelected?: CompetenciaEspecifica[]
      color: string
      disabled?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
      modelValue: null,
  });

  const emit = defineEmits(['update:model-value']);

  const getLista = () : CriterioDeLogroItemSelector[] =>{
    return props.criteriosDeLogros.map(criterioDeLogro =>{

        let recomendado : boolean = false;
        let contenidoRelacionado : Contenido = null;
        let competenciasEspecificasRelacionadas: CompetenciaEspecifica[] = [];

        let nroRelaciones: number = 0;

        if(props.contenidoSelected){
            contenidoRelacionado = criterioDeLogro.contenidos.find(c => c.id == props.contenidoSelected.id);
            if(contenidoRelacionado){
                recomendado = true;
                nroRelaciones += 1;
            }
        }

        if(props.competenciasEspecificasSelected){

            competenciasEspecificasRelacionadas = criterioDeLogro.competencias_especificas.filter(competenciaEspecifica => {
               const result =  props.competenciasEspecificasSelected.some(ce => ce.id == competenciaEspecifica.id);
               if(result)
                nroRelaciones += 1;
               return result;
            })

            if(competenciasEspecificasRelacionadas.length > 0)
                recomendado = true;
        }

        return {
            ...criterioDeLogro,
            checked: props.modelValue.findIndex(cdl => cdl.id == criterioDeLogro.id) >= 0,
            recomendado ,
            contenidoRelacionado,
            competenciasEspecificasRelacionadas,
            nroRelaciones
        }
    }).sort((a,b)=>{    
        if(a.recomendado && (a.nroRelaciones > b.nroRelaciones))
            return -1;
        return 1;
    })
  }

  const criteriosDeLogros = ref<CriterioDeLogroItemSelector[]>(getLista());

  const isOpen = ref<boolean>(true);

  const q = ref<string>('');

  
  const criteriosDeLogrosFiltered = computed(()=>{
      return criteriosDeLogros.value.filter(criterioDeLogro=>{
          const { descripcion } = criterioDeLogro;
          const descripcionLowerCase = descripcion.toLowerCase();

          if(q.value.trim().length > 0){
              const qLowerCase = q.value.toLocaleLowerCase();
              if(!descripcionLowerCase.includes(qLowerCase))
                  return false;
          }
          return true;
      })
  })

  const emptyFiltered = computed(()=>{
      return criteriosDeLogrosFiltered.value.length == 0;
  })

  const onSave = ()=>{
    const criteriosDeLogrosSelected = criteriosDeLogros.value.filter(cdl => cdl.checked);
    emit('update:model-value', criteriosDeLogrosSelected);
    isOpen.value = false;
  }

  const onToggleCriterioDeLogro = (criterioDeLogro: CriterioDeLogro & {
      checked: boolean;
  })=>{
      if(criterioDeLogro.checked){
        criterioDeLogro.checked = false;
        return;
      }
      criterioDeLogro.checked = true;
  }

  watch([
    ()=> props.modelValue, 
    ()=> props.criteriosDeLogros,
    ()=> props.contenidoSelected,
    ()=> props.competenciasEspecificasSelected] ,()=>{

    criteriosDeLogros.value = getLista();
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
            <UInput v-model="q" icon="i-heroicons-magnifying-glass" placeholder="Buscar criterio de logro" autofocus class="flex-1" />
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
              No pudimos encontrar ningún contenido.
            </span>
          </div>
          <ul v-else role="list" class="divide-y divide-gray-200 dark:divide-gray-800 overflow-y-auto">
            <li v-for="(criterioDeLogro) in criteriosDeLogrosFiltered" :key="criterioDeLogro.id" @click="onToggleCriterioDeLogro(criterioDeLogro)"
              class="w-full flex items-center justify-between gap-3 py-3 px-4 sm:px-6">
              <div class="flex items-center gap-3 w-full hover:cursor-pointer">
                <div class="text-sm min-w-0 flex gap-2">
                  <UCheckbox size="xl" v-model="criterioDeLogro.checked"/>
                  <p class="text-gray-900 dark:text-white font-medium">
                    {{ criterioDeLogro.descripcion }}
                  </p>
                </div>
              </div>
  
              <div class="flex items-center gap-3">
                <UPopover :popper="{ placement: 'bottom-start' }" mode="hover" v-if="criterioDeLogro.recomendado">
                  <template #default="{ open }">
                    <UTooltip
                      :prevent="open"
                    >
                       <UButton label="Recomendado" icon="tabler:butterfly-filled" :color="getColorBadgeComponente(props.color)" variant="outline"/>
                    </UTooltip>
                  </template>

                  <template #panel="{ close }">
                      <div class="p-2 m-4 flex flex-col gap-y-4 max-w-128">
                          <div v-if="criterioDeLogro.contenidoRelacionado">
                              <span class="font-medium"> Se relaciona al contenido seleccionado: </span>
                              <ul class="list-disc">
                                  <li class="my-2"> {{ criterioDeLogro.contenidoRelacionado?.descripcion }}</li>
                              </ul>
                          </div>
                          <USeparator color="primary" type="solid" />

                          <div v-if="criterioDeLogro.competenciasEspecificasRelacionadas?.length > 0">
                              <span class="font-medium"> Se relaciona a las competencias especificas seleccionadas: </span>
                              <ul class="list-disc">
                                  <li v-for="(competenciaEspecifica,idx) in criterioDeLogro.competenciasEspecificasRelacionadas" :key="idx" class="my-2"> {{  competenciaEspecifica.codificacion }} {{ competenciaEspecifica.descripcion }}</li>
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
