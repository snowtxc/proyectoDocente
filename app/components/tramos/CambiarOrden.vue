
<script lang="ts" setup>
import type { ReordenarTramoDTO, Tramo } from '~/types/tramo';
import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum';

interface Props {
    planificacionId: number;
    planificacionFechaId: number;
    tramoSelected: Tramo;
    tramos: Tramo[]
}

const { $apiRest  } = useNuxtApp();

const emit = defineEmits(['on-change-order']);

enum Direction {
    UP,
    DOWN
}
const modal = useModal()

const props = withDefaults(defineProps<Props>() , {});

const loadingReorder = ref(false);
const initialOrden = ref(props.tramoSelected.orden)
const newOrden = ref(null);

const tramos = ref([...props.tramos]);

const isOpen = true;
const toast = useToast()

const emptyTramos = computed(()=>{
  return tramos.value.length == 0
})

// TRAMOS ORDENADOS POR ORDEN.
const orderTramos = computed(()=>{
  return tramos.value.sort((a,b) =>{
    if(a.orden <= b.orden)
      return -1;
    return 1;
  })
})


const changeOrder = (direction: Direction) =>{
  const idx = tramos.value.findIndex(t => t.id === props.tramoSelected.id);

  if (idx === -1) return;

  let swapIdx = direction === Direction.UP ? idx - 1 : idx + 1;

  if (swapIdx < 0 || swapIdx >= tramos.value.length) return;

  const tmpOrden = tramos.value[idx].orden;

  const newOrdenTmp = tramos.value[swapIdx].orden;
  tramos.value[idx].orden = newOrdenTmp;
  newOrden.value = newOrdenTmp;

  tramos.value[swapIdx].orden = tmpOrden;
}

// Disable button , si no hay un nuevo orden o el orden es igual al orden que ya tiene entonces disabled;
const disableBtn = computed(()=>{
  if(newOrden.value === null)
    return true;

  if(newOrden.value == initialOrden.value)
    return true;
  
  return false;
});

const reorder = async()=>{
  if(newOrden.value === null)
    return;

  loadingReorder.value = true;
   try{
    
      const body : ReordenarTramoDTO = {
          planificacion_id : props.planificacionId,
          planificacion_fecha_id : props.planificacionFechaId,
          tramo_id : props.tramoSelected.id,
          nuevoOrden : newOrden.value
      }         
      const response = await $apiRest<any>(apiTramosRoutes.reordenarTramo, HttpMethodEnum.POST,body);

      if(response.status){
        const { tramosUpdated } = response;
        emit('on-change-order', tramosUpdated);
        loadingReorder.value = false;
        toast.add({
            title: "Tramo ordenado con exito",
            description: "Tramo ordenado",
            color: "green"
        })
      }
      
    }catch(message){
        loadingReorder.value = false;
        toast.add({
            title: "Error",
            description: message ? message : 'Error al intentar reordenar el tramo',
            color: "red"
        })
    }
 
}

</script>

<template>
  <UModal v-model="isOpen">
    <UCard :ui="{ header: { padding: 'p-4 sm:px-6' }, body: { padding: '' } }" class="min-w-0 min-h-[75vh]">
      <template #header>
        Cambiar orden al tramo {{ initialOrden }}
      </template>

      <div class="w-full overflow-y-auto max-h-full h-[75vh]">
        <div v-if="emptyTramos" class="flex flex-col justify-center items-center mt-5 text-center px-2" >
          <UIcon name="tabler:search" class="w-8 h-8"/>
          <span>
            No pudimos encontrar ningún tramo.
          </span>
        </div>
        <ul v-else role="list" class="divide-y divide-gray-200 dark:divide-gray-800 overflow-y-auto">
          <li v-for="(tramo, index) in orderTramos" :key="tramo.id"
            class="flex items-center justify-between gap-3 py-3 px-4 sm:px-6">
            <div class="flex items-center gap-3 w-full hover:cursor-pointer">

              <div class="text-sm min-w-0 flex gap-2">
                <!-- <URadio v-model="folderIdSelected"  :value="folder.id"/> -->
                <UIcon name="tabler:file-text" class="w-5 h-5" :class="{'text-primary' : tramo.id == props.tramoSelected.id}"/>
                <p class="truncate" :class="{'text-gray-900' : tramo.id != props.tramoSelected.id , 'text-primary' : tramo.id == props.tramoSelected.id}">
                  Tramo {{ tramo.id }}
                </p>
              </div>
            </div>

            <div class="flex items-center gap-3" v-if="tramo.id == props.tramoSelected.id">
              <UDropdown position="bottom-end">                
                <UButton icon="tabler:arrow-up" color="gray" variant="ghost" @click="changeOrder(Direction.UP)" v-if="index > 0"/>
                <UButton icon="tabler:arrow-down" color="gray" variant="ghost" @click="changeOrder(Direction.DOWN)" v-if="(index + 1) < tramos.length"/>
              </UDropdown>
            </div>
          </li>
        </ul>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          
          <UButton
            label="Gancelar"
            color="white"
            type="white"
            @click="modal.close()"
          />

          <UButton
            type="submit"
            icon="tabler:arrows-sort"
            label="Reordenar"
            color="black"
            :disabled="disableBtn"
            @click="reorder"
          />
        </div>
      </template>

    </UCard>
  </UModal>
</template>