
<script lang="ts" setup>
import type { ActividadSecuencia, ReordenarActividadSecuenciaDTO } from '~/types/actividadSecuencia';
import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum';

interface Props {
    secuenciaId: number;
    actividadSecuenciaSelected: ActividadSecuencia;
    actividadesSecuencias: ActividadSecuencia[]
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
const initialOrden = ref(props.actividadSecuenciaSelected.orden)
const newOrden = ref(null);

const actividadesSecuencias = ref([...props.actividadesSecuencias]);

const isOpen = true;
const toast = useToast()

const emptyActividades = computed(()=>{
  return actividadesSecuencias.value.length == 0
})

// TRAMOS ORDENADOS POR ORDEN.
const orderActividades = computed(()=>{
  return actividadesSecuencias.value.sort((a,b) =>{
    if(a.orden <= b.orden)
      return -1;
    return 1;
  })
})


const changeOrder = (direction: Direction) =>{
  const idx = actividadesSecuencias.value.findIndex(t => t.id === props.actividadSecuenciaSelected.id);

  if (idx === -1) return;

  let swapIdx = direction === Direction.UP ? idx - 1 : idx + 1;

  if (swapIdx < 0 || swapIdx >= actividadesSecuencias.value.length) return;

  const tmpOrden = actividadesSecuencias.value[idx].orden;

  const newOrdenTmp = actividadesSecuencias.value[swapIdx].orden;
  actividadesSecuencias.value[idx].orden = newOrdenTmp;
  newOrden.value = newOrdenTmp;

  actividadesSecuencias.value[swapIdx].orden = tmpOrden;
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
      const body : ReordenarActividadSecuenciaDTO = {
          secuencia_id: props.secuenciaId,
          actividad_secuencia_id: props.actividadSecuenciaSelected.id,
          nuevoOrden: newOrden.value
      }         

      const response = await $apiRest<any>(apiActividadSecuenciaRoutes.reordenarActividad, HttpMethodEnum.POST,body);

      if(response.status){

        const { actividadesSecuenciaUpdated } = response;
        emit('on-change-order', actividadesSecuenciaUpdated);
        loadingReorder.value = false;
        toast.add({
            title: "Actividad ordenadoa con exito",
            description: "Actividad ordenada",
            color: "green"
        })
      }
      
    }catch(message){
        loadingReorder.value = false;
        toast.add({
            title: "Error",
            description: message ? message : 'Error al intentar reordenar la actividad de la secuencia',
            color: "red"
        })
    }
 
}

</script>

<template>
  <UModal v-model="isOpen">
    <UCard :ui="{ header: { padding: 'p-4 sm:px-6' }, body: { padding: '' } }" class="min-w-0 min-h-[75vh]">
      <template #header>
        Cambiar orden a la actividad {{ initialOrden }}
      </template>

      <div class="w-full overflow-y-auto max-h-full h-[75vh]">
        <div v-if="emptyActividades" class="flex flex-col justify-center items-center mt-5 text-center px-2" >
          <UIcon name="tabler:search" class="w-8 h-8"/>
          <span>
            No pudimos encontrar ninguna actividad.
          </span>
        </div>
        <ul v-else role="list" class="divide-y divide-gray-200 dark:divide-gray-800 overflow-y-auto">
          <li v-for="(actividad, index) in orderActividades" :key="actividad.id"
            class="flex items-center justify-between gap-3 py-3 px-4 sm:px-6">
            <div class="flex items-center gap-3 w-full hover:cursor-pointer">

              <div class="text-sm min-w-0 flex gap-2">
                <!-- <URadio v-model="folderIdSelected"  :value="folder.id"/> -->
                <UIcon name="tabler:file-text" class="w-5 h-5" :class="{'text-primary' : actividad.id == props.actividadSecuenciaSelected.id}"/>
                <p class="truncate" :class="{
                 'text-gray-900' : actividad.id != props.actividadSecuenciaSelected.id ,
                 'text-primary' : actividad.id == props.actividadSecuenciaSelected.id}">
                  Actividad {{ actividad.orden }}
                </p>
              </div>
            </div>

            <div class="flex items-center gap-3" v-if="actividad.id == props.actividadSecuenciaSelected.id">
              <UDropdown position="bottom-end">                
                <UButton icon="tabler:arrow-up" color="gray" variant="ghost" @click="changeOrder(Direction.UP)" v-if="index > 0"/>
                <UButton icon="tabler:arrow-down" color="gray" variant="ghost" @click="changeOrder(Direction.DOWN)" v-if="(index + 1) < actividadesSecuencias.length"/>
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