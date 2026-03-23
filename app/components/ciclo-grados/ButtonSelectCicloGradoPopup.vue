<script setup lang="ts">
import type { CommandPaletteItem } from '@nuxt/ui'
import type { CicloGrado } from '~/types/cicloGrado';
import { apiCicloGradosRoutes } from '~/utils/apiRoutes';
import { CicloGradoEnum } from '~/utils/enums/CicloGradoEnum';
import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum';

interface Props {
    ciclosGradosSelected: CicloGrado[]
    label : string
}

const { $apiRest } = useNuxtApp();

const emit = defineEmits(['onSelect'])

const props = withDefaults(defineProps<Props>() , {});

const items =  computed(()=>{
  return cicloGrados.value.map(cg =>{
    return  {
      label:  `${cg.nombre} (${cg.grados.map(g => g.nombre).join(',')})`,
      value: cg.id.toString(),
      disabled: props.ciclosGradosSelected.findIndex(cicloGrado => cicloGrado.id == cg.id) >= 0,
      chip: {
        color: 
              cg.id == CicloGradoEnum.TRAMO_1 ? 'error' :  
              cg.id== CicloGradoEnum.TRAMO_2 ? 'warning': 
              cg.id == CicloGradoEnum.TRAMO_3 ? 'secondary' : 
              cg.id == CicloGradoEnum.TRAMO_4 ? 'success' : 'error'
      },
    }
  }) satisfies CommandPaletteItem[];
}) ;

const label = ref([])

const cicloGrados = ref<CicloGrado[]>([]);

const loadingGrados = ref<boolean>(true);

onBeforeMount(()=>{
  loadData();
});

const loadData = async()=>{
  loadingGrados.value = true;
  cicloGrados.value = await $apiRest(apiCicloGradosRoutes.listAll, HttpMethodEnum.GET)

  loadingGrados.value = false;
}

function onSelect(item) {
  
  const  cicloGradoId = parseInt(item.value);
  const grado = cicloGrados.value.find(g => g.id == cicloGradoId);

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
        placeholder="Buscar tramo..."
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

