<script setup lang="ts">
    import { useGradoService } from '~/services/gradoService/gradoService';

    const gradoService = useGradoService();

    interface Props {
        modelValue: any,
        multiple: boolean
    }

    const props = withDefaults(defineProps<Props>(), {
        modelValue : null,
        multiple: false
    })

    const emit = defineEmits(['update:modelValue']);

    onMounted(async()=>{
        if(gradoService.alreadyLoaded){
            return;
        }
        await gradoService.getAll();
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
            :options="gradoService.grados"
            :loading="gradoService.isLoading"
            :multiple="props.multiple"
            :model-value="props.modelValue"            
        >
        <template #label>
            <span class="truncate">{{  (props.multiple && props.modelValue  && Array.isArray(props.modelValue)) ?  props.modelValue?.map(x => x.nombre).join(', ') : props.modelValue?.nombre }}</span>
            <span v-if="!props.modelValue || (typeof props.modelValue == 'object' && props.modelValue.length <= 0)"> {{  props.multiple ? 'Seleccionar Grados' : 'Seleccionar Grado' }} </span>
          </template>
    </USelectMenu>
</template>