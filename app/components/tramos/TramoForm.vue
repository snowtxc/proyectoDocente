<script setup lang="ts">
import type { Espacio } from '~/types/espacio';
import type { Tramo } from '~/types/tramo';
import type { UnidadCurricular } from '~/types/unidadCurricular';


interface Props {
    modelValue: Tramo,
    espacios: Espacio[]
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
});

const emit = defineEmits(['update:modelValue']);

const form = ref({
    espacio: null,
    unidad_curricular: props.modelValue.unidad_curricular || null
});

const espacios = ref([...props.espacios]);


const loadForm = (): void =>{
  const { unidad_curricular, espacio } = props.modelValue;

  form.value.espacio = espacio;
  form.value.unidad_curricular = unidad_curricular;
}

onMounted(()=>{
  loadForm();
})


const unidadesCurriculares = computed<UnidadCurricular[]>(()=>{
    return form.value.espacio?.unidades_curriculares;
})

const getCurrentData = ()=>{
  const {  unidad_curricular , espacio}  = form.value

  const data  = {
    ...props.modelValue,
    ...{
      unidad_curricular,
      espacio
    }
  }

  return data;
}

const onChangeModel = ()=>{
  emit('update:modelValue',getCurrentData());
}

watch(()=> props.modelValue ,(newValue: Tramo, oldValue: Tramo)=>{
  if(newValue.id != oldValue.id){
    loadForm();
  }
})






</script>

<template>
  <div class="flex gap-2">
    <USelectMenu v-model="form.espacio" :options="espacios" option-attribute="id" class="flex-1"
    @change="onChangeModel">
        <template #label>
          <span 
          v-if="form.espacio"
          :style="{ backgroundColor: form.espacio?.rgbColor }"
          :class="['inline-block h-2 w-2 flex-shrink-0 rounded-full']" aria-hidden="true" />

          <span class="truncate" v-if="form.espacio">{{ form.espacio?.nombre }}</span>
          <span v-else>Selecciona un espacio.</span>
        </template>
    
        <template #option="{ option: espacio }">
          <span  :style="{ backgroundColor: espacio.rgbColor }" :class="['inline-block h-2 w-2 flex-shrink-0 rounded-full']" aria-hidden="true" />
          <span class="truncate">{{ espacio.nombre }}</span>
        </template>
      </USelectMenu>

      <USelectMenu v-model="form.unidad_curricular" :options="unidadesCurriculares" option-attribute="id" class="flex-1"
      @change="onChangeModel">
        <template #label>
          <span 
          v-if="form.unidad_curricular"
          :style="{ backgroundColor: form.espacio?.rgbColor }"
          :class="['inline-block h-2 w-2 flex-shrink-0 rounded-full']" aria-hidden="true" />

          <span class="truncate" v-if="form.unidad_curricular">{{ form.unidad_curricular?.nombre }}</span>
          <span v-else> Selecciona una unidad curricular.</span>
        </template>
    
        <template #option="{ option:  unidadCurricular }">
          <span  :style="{ backgroundColor: form.espacio?.rgbColor }" :class="['inline-block h-2 w-2 flex-shrink-0 rounded-full']" aria-hidden="true" />
          <span class="truncate">{{ unidadCurricular?.nombre }}</span>
        </template>
      </USelectMenu>
    
  </div>
 
</template>