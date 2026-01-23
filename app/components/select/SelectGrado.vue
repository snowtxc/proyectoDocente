<script setup lang="ts">

    import type { Grado } from '~/types/grado';

    interface Props {
        modelValue: any,
        grados: Grado[],
        multiple: boolean
        loading?: boolean
    }

    const props = withDefaults(defineProps<Props>(), {
        modelValue : null,
        multiple: false
    })

    const emit = defineEmits(['update:modelValue']);

    const  grados =  ref<Grado[]>(props.grados);


    watch(() => props.grados, ()=>{
        grados.value = props.grados;
    })

    const updateValue = (value) => {
        emit('update:modelValue', value);
    };

</script>

<template>


    <USelectMenu
            @update:model-value="updateValue"
            searchable
            searchable-placeholder="Buscar un grado..."
            class="w-full"
            by="id"
            option-attribute="nombre"
            :search-attributes="['nombre']"
            :items="grados"
            :multiple="props.multiple"
            :loading="loading"   
        >
        
        <template #leading="{ modelValue, ui }">
            <span v-if="!props.modelValue || (typeof props.modelValue == 'object' && props.modelValue.length <= 0)"> {{  props.multiple ? 'Seleccionar Grados' : 'Seleccionar Grado' }} </span>

            <span class="truncate flex flex-wrap gap-2" v-else-if="(props.multiple && props.modelValue)">    
                                <BadgeGrado
                v-for="grado in props.modelValue"
                :key="grado.id"
                :grado="grado">
              </BadgeGrado>
            </span>
            <span class="trucante" v-else>
                <BadgeGrado
                :key="props.modelValue.id"
                :grado="props.modelValue">
              </BadgeGrado>
                
            </span>
        </template>
        

        <template #item-leading="{ item }">
            <BadgeGrado
                :key="item.id"
                :grado="item">
              </BadgeGrado>
          </template>
    </USelectMenu>
</template>