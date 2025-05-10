<script setup lang="ts">
    import type { CompetenciaEspecifica } from '~/types/competenciaEspecifica';
import type { Contenido, ContenidoItemSelector } from '~/types/contenido';
import type { CriterioDeLogro } from '~/types/criterioDeLogro';

    interface Props {
        modelValue: Contenido,
        contenidos: Contenido[],
        competenciasEspecificasSelected?: CompetenciaEspecifica[],
        criteriosDeLogrosSelected?: CriterioDeLogro[]
        color: string
        disabled?: boolean
    }

    const props = withDefaults(defineProps<Props>(), {
        modelValue: null,
    });

    const emit = defineEmits(['update:model-value']);

    const getLista = () : ContenidoItemSelector[] =>{
      return props.contenidos.map(contenido  =>{

          let recomendado : boolean = false;
          let competenciasEspecificasRelacionadas: CompetenciaEspecifica[] = [];
          let criteriosDeLogrosRelacionados: CriterioDeLogro[] = [];

          let nroRelaciones: number = 0;

          if(props.competenciasEspecificasSelected){

              competenciasEspecificasRelacionadas = contenido.competencias_especificas.filter(competenciaEspecifica => {
                const result =  props.competenciasEspecificasSelected.some(ce => ce.id == competenciaEspecifica.id);
                if(result)
                  nroRelaciones += 1;
                return result;
              })

              if(competenciasEspecificasRelacionadas.length > 0)
                  recomendado = true;
          }


          if(props.criteriosDeLogrosSelected){

            criteriosDeLogrosRelacionados = contenido.criterios_de_logros.filter(criterioDeLogro => {
              const result =  props.criteriosDeLogrosSelected.some(cdl => cdl.id == criterioDeLogro.id);
              if(result)
                nroRelaciones += 1;
              return result;
            })

            if(criteriosDeLogrosRelacionados.length > 0)
                recomendado = true;
          }

          return {
              ...contenido,
              recomendado ,
              competenciasEspecificasRelacionadas,
              criteriosDeLogrosRelacionados,
              nroRelaciones
          }
      }).sort((a,b)=>{    
          if(a.recomendado && (a.nroRelaciones > b.nroRelaciones))
              return -1;
          return 1;
      })
    }

    const contenidos = ref<ContenidoItemSelector[]>(getLista());

    const contenidoIdSelected = ref<number>(props.modelValue ? props.modelValue.id : null);

    const isOpen = ref<boolean>(false);

    const q = ref<string>('');

    
    const contenidosFiltered = computed(()=>{
        return contenidos.value.filter(contenido =>{
            const { descripcion } = contenido;
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
        return contenidosFiltered.value.length == 0;
    })

    const onChangeContenido = (contenido: Contenido)=>{
        contenidoIdSelected.value = contenido.id;
    }

    const onSelectContenido = ()=>{
        isOpen.value = false;
        const contenido = props.contenidos.find(c => c.id == contenidoIdSelected.value);
        emit('update:model-value', contenido);
    }

    watch([
    ()=> props.modelValue, 
    ()=> props.contenidos,
    ()=> props.criteriosDeLogrosSelected,
    ()=> props.competenciasEspecificasSelected] ,()=>{

        contenidoIdSelected.value = props.modelValue?.id;
        contenidos.value = getLista();
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
              <UInput v-model="q" icon="i-heroicons-magnifying-glass" placeholder="Buscar Contenido" autofocus class="flex-1" />
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
              <li v-for="(contenido) in contenidosFiltered" :key="contenido.id"
                class="w-full flex items-center justify-between gap-3 py-3 px-4 sm:px-6">
                <div class="flex items-center gap-3 w-full hover:cursor-pointer" @click="onChangeContenido(contenido)">
                  <div class="text-sm min-w-0 flex gap-2">
                    <URadio v-model="contenidoIdSelected"  :value="contenido.id"/>
                    <p class="text-gray-900 dark:text-white font-medium">
                      {{ contenido.descripcion }}
                    </p>
                  </div>
                </div>
    
                <div class="flex items-center gap-3">
                  <UPopover :popper="{ placement: 'bottom-start' }" mode="hover" v-if="contenido.recomendado">
                    <template #default="{ open }">
                      <UTooltip
                        :prevent="open"
                      >
                         <UButton label="Recomendado" icon="tabler:butterfly-filled" :color="getColorBadgeComponente(props.color)" variant="outline"/>
                      </UTooltip>
                    </template>
  
                    <template #panel="{ close }">
                        <div class="p-2 m-4 flex flex-col gap-y-4 max-w-128">
                          <div v-if="contenido.competenciasEspecificasRelacionadas?.length > 0">
                              <span class="font-medium"> Se relaciona a las competencias especificas seleccionadas: </span>
                              <ul class="list-disc">
                                  <li v-for="(competenciaEspecifica,idx) in contenido.competenciasEspecificasRelacionadas" :key="idx" class="my-2"> {{  competenciaEspecifica.codificacion }} {{ competenciaEspecifica.descripcion }}</li>
                              </ul>
                          </div>
                            <USeparator color="primary" type="solid" />
  
                            <div v-if="contenido.criteriosDeLogrosRelacionados?.length > 0">
                                <span class="font-medium"> Se relaciona a los criterios de logros seleccionados: </span>
                                <ul class="list-disc">
                                    <li v-for="(criterioDeLogro,idx) in contenido.criteriosDeLogrosRelacionados" :key="idx" class="my-2">{{ criterioDeLogro.descripcion }}</li>
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
                :disabled="contenidoIdSelected == null"
                @click="onSelectContenido"
                />
            </div>
          </template>
         
        </UCard>
    </UModal>

</template>
