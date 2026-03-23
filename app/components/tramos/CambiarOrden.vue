<script lang="ts" setup>
import type { ReordenarTramoDTO, Tramo } from '~/types/tramo';
import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum';
import draggable from 'vuedraggable';

interface Props {
  planificacionId: number;
  planificacionFechaId: number;
  tramoSelected: Tramo;
  tramos: Tramo[]
}

const { $apiRest } = useNuxtApp();

const emit = defineEmits(['on-change-order', 'close']);

const props = withDefaults(defineProps<Props>(), {});

const loadingReorder = ref(false);
const initialOrden = ref(props.tramoSelected.orden)
const newOrden = ref(null);

const tramos = ref([...props.tramos]);

const toast = useToast()

const emptyTramos = computed(() => {
  return tramos.value.length == 0
})

// TRAMOS ORDENADOS POR ORDEN.
const orderTramos = computed(() => {
  return tramos.value.sort((a, b) => {
    if (a.orden <= b.orden)
      return -1;
    return 1;
  })
})


// Disable button , si no hay un nuevo orden o el orden es igual al orden que ya tiene entonces disabled;
const disableBtn = computed(() => {
  if (newOrden.value === null)
    return true;

  if (newOrden.value == initialOrden.value)
    return true;

  return false;
});

const onDragEnd = () => {
  tramos.value.forEach((t, index) => {
    t.orden = index + 1;
  });

  const selected = tramos.value.find(t => t.id === props.tramoSelected.id);
  newOrden.value = selected?.orden ?? null;
};

const reorder = async () => {
  if (newOrden.value === null)
    return;

  loadingReorder.value = true;
  try {

    const body: ReordenarTramoDTO = {
      planificacion_id: props.planificacionId,
      planificacion_fecha_id: props.planificacionFechaId,
      tramo_id: props.tramoSelected.id,
      nuevoOrden: newOrden.value
    }
    const response = await $apiRest<any>(apiTramosRoutes.reordenarTramo, HttpMethodEnum.POST, body);

    if (response.status) {
      const { tramosUpdated } = response;
      emit('on-change-order', tramosUpdated);
      loadingReorder.value = false;
      toast.success({
        title: "Tramo ordenado con exito",
        message: "Tramo ordenado",
        color: "green"
      })
    }

  } catch (message) {
    loadingReorder.value = false;
    toast.error({
      title: "Error",
      message: message ? message : 'Error al intentar reordenar el tramo',
      color: "red"
    })
  }

}

</script>

<template>
  <UModal title="Cambiar orden al tramo " description="Cambiar orden al tramo " :dismissible="false"
    :ui="{ footer: 'justify-end' }">
    <template #content>
      <UCard>
        <template #header>
          Cambiar orden al tramo {{ initialOrden }}
        </template>

        <div class="w-full overflow-y-auto max-h-full h-[75vh]">
          <div v-if="emptyTramos" class="flex flex-col justify-center items-center mt-5 text-center px-2">
            <UIcon name="tabler:search" class="w-8 h-8" />
            <span>
              No pudimos encontrar ningún tramo.
            </span>
          </div>
          <draggable v-model="tramos" item-key="id" class="divide-y divide-gray-200 dark:divide-gray-800"
            @end="onDragEnd">
            <template #item="{ element: tramo, index }">
              <li class="flex items-center justify-between gap-3 py-3 px-4 sm:px-6">

                <div class="flex items-center justify-between w-full cursor-grab active:cursor-grabbing">

                  <p class="truncate" :class="tramo.id == props.tramoSelected.id ? 'text-primary' : 'text-gray-900'">
                    Tramo {{ index + 1 }}
                  </p>
                  <UIcon name="tabler:grip-vertical" class="w-5 h-5 text-gray-400" />
                </div>

              </li>
            </template>
          </draggable>
        </div>

        <template #footer>
          <div class="flex justify-end gap-3">

            <UButton label="Gancelar" color="neutral" @click="emit('close', true)" />

            <UButton type="submit" icon="tabler:arrows-sort" label="Reordenar" color="primary" :disabled="disableBtn"
              @click="reorder" />
          </div>
        </template>

      </UCard>
    </template>

  </UModal>

</template>