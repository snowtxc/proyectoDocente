<script setup lang="ts">
import type { CommandPaletteItem } from '@nuxt/ui'
import { item } from '@unovis/ts/components/bullet-legend/style';
import type { Grado } from '~/types/grado';
import { CicloGradoEnum } from '~/utils/enums/CicloGradoEnum';
import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum';


interface Props {
    gradosSelected: Grado[]
    label : string
}

const { $apiRest } = useNuxtApp();

const emit = defineEmits(['onSelect'])

const props = withDefaults(defineProps<Props>() , {});

const items =  computed(()=>{
  return grados.value.map(grado =>{
    return  {
      label: grado.nombre,
      value: grado.id.toString(),
      disabled: props.gradosSelected.findIndex(g => g.id == grado.id) >= 0,
      chip: {
        color: grado.ciclo_grado_id == CicloGradoEnum.TRAMO_1 ? 'error' :  
              grado.ciclo_grado_id == CicloGradoEnum.TRAMO_2 ? 'warning': 
              grado.ciclo_grado_id == CicloGradoEnum.TRAMO_3 ? 'secondary' : 
              grado.ciclo_grado_id == CicloGradoEnum.TRAMO_4 ? 'success' : 'error'
      },
    }
  }) satisfies CommandPaletteItem[];
}) ;

const label = ref([])

const grados = ref<Grado[]>([]);
const loadingGrados = ref<boolean>(true);

onBeforeMount(()=>{
  loadData();
});

const loadData = async()=>{
  loadingGrados.value = true;
  grados.value = await $apiRest(apiGradoRoutes.listAll, HttpMethodEnum.GET)
  loadingGrados.value = false;
}

function onSelect(item) {
  const  gradoId = parseInt(item.value);
  const grado = grados.value.find(g => g.id == gradoId);

  emit('onSelect', grado);
}

</script>

<template>
  <UPopover :content="{ side: 'right', align: 'start' }" >
    <UButton
      :loading="loadingGrados"
      icon="i-lucide-tag"
      :label="props.label"
      color="neutral"
      variant="subtle"
    />

    <template #content="{ close }">
      <UCommandPalette
        v-model="label"
        placeholder="Buscar grado..."
        :groups="[{ id: 'grados', items }]"
        :ui="{ input: '[&>input]:h-8 [&>input]:text-sm' }"
        @update:model-value="(item)=>{
          onSelect(item)
          close()
        }"
      />
    </template>
  </UPopover>
</template>

