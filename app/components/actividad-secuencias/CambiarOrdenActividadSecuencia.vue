
<script lang="ts" setup>
import type { ActividadSecuencia, ReordenarActividadSecuenciaDTO } from '~/types/actividadSecuencia';
import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum';
import draggable from 'vuedraggable';

interface Props {
    secuenciaId: number;
    actividadSecuenciaSelected: ActividadSecuencia;
    actividadesSecuencias: ActividadSecuencia[]
}

const { $apiRest  } = useNuxtApp();

const emit = defineEmits(['on-change-order','onClose']);
const props = withDefaults(defineProps<Props>() , {});

const loadingReorder = ref(false);
const initialOrden = ref(props.actividadSecuenciaSelected.orden)
const newOrden = ref(null);

const actividadesSecuencias = ref([...props.actividadesSecuencias]);

const toast = useToast()

const emptyActividades = computed(()=>{
  return actividadesSecuencias.value.length == 0
})

// Disable button , si no hay un nuevo orden o el orden es igual al orden que ya tiene entonces disabled;
const disableBtn = computed(()=>{
  if(newOrden.value === null)
    return true;

  if(newOrden.value == initialOrden.value)
    return true;
  
  return false;
});

const onDragEnd = () => {
  actividadesSecuencias.value.forEach((actividad, index) => {
    actividad.orden = index + 1;
  });

  const selected = actividadesSecuencias.value.find(
    actividad => actividad.id === props.actividadSecuenciaSelected.id
  );
  newOrden.value = selected?.orden ?? null;
};

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
        toast.success({
            title: "Actividad ordenadoa con exito",
            message: "Actividad ordenada",
            color: "green"
        })
      }
      
    }catch(message){
        loadingReorder.value = false;
        toast.error({
            title: "Error",
            message: message ? message : 'Error al intentar reordenar la actividad de la secuencia',
            color: "red"
        })
    }
 
}

</script>

<template>
  <UModal 
    title="Cambiar orden a la actividad"
    description="Cambiar orden a la actividad"
    :dismissible="false"
    :ui="{ footer: 'justify-end' }">
    <template #content>
      <UCard  class="min-w-0 min-h-[75vh]">
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
        <draggable
          v-else
          v-model="actividadesSecuencias"
          item-key="id"
          class="divide-y divide-gray-200 dark:divide-gray-800 overflow-y-auto"
          @end="onDragEnd">
          <template #item="{ element: actividad, index }">
            <li class="flex items-center justify-between gap-3 py-3 px-4 sm:px-6">
              <div class="flex items-center justify-between w-full cursor-grab active:cursor-grabbing">
                <div class="text-sm min-w-0 flex gap-2">
                  <UIcon
                    name="tabler:file-text"
                    class="w-5 h-5"
                    :class="{ 'text-primary': actividad.id == props.actividadSecuenciaSelected.id }" />
                  <p
                    class="truncate"
                    :class="actividad.id == props.actividadSecuenciaSelected.id ? 'text-primary' : 'text-gray-900'">
                    Actividad {{ index + 1 }}
                  </p>
                </div>
                <UIcon name="tabler:grip-vertical" class="w-5 h-5 text-gray-400" />
              </div>
            </li>
          </template>
        </draggable>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          
          <UButton
            label="Gancelar"
            color="neutral"
            @click="emit('onClose')"
          />

          <UButton
            type="submit"
            icon="tabler:arrows-sort"
            label="Reordenar"
            color="primary"
            :disabled="disableBtn"
            @click="reorder"
          />
        </div>
      </template>

    </UCard>
    </template>
    
  </UModal>
</template>
