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
            @change="updateValue"
            searchable
            searchable-placeholder="Buscar un grado..."
            class="w-full"
            by="id"
            option-attribute="nombre"
            :search-attributes="['nombre']"
            :options="grados"
            :multiple="props.multiple"
            :model-value="props.modelValue"         
            :loading="loading"   
        >
        <template #label>
            <span v-if="!props.modelValue || (typeof props.modelValue == 'object' && props.modelValue.length <= 0)"> {{  props.multiple ? 'Seleccionar Grados' : 'Seleccionar Grado' }} </span>

            <span class="truncate flex flex-wrap gap-2" v-else-if="(props.multiple && props.modelValue  && Array.isArray(props.modelValue))">
                
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

        <template #option="{ option }">
            <BadgeGrado
                :key="option.id"
                :grado="option">
              </BadgeGrado>
          </template>
    </USelectMenu>
</template>