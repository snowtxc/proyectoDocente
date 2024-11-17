<script setup lang="ts">

    const props = defineProps({
        modelValue: {
            type: Number,
            default: new Date().getFullYear()
        }
    });

    const emit = defineEmits(['update:modelValue']);

    const years = computed(()=>{
        let currentYear = new Date().getFullYear();
        let years = [];
        for(let i = currentYear; i >= 1900; i--){
            years.push(i);
        }
        return years;
    })

    const updateValue = (value) => {
        emit('update:modelValue', value);
    };

</script>

<template>
    <USelectMenu
            @change="updateValue"
            searchable
            searchable-placeholder="Buscar un año..."
            class="w-full"
            placeholder="Selecciona un Año"
            :options="years"
            :model-value="props.modelValue"
            
        >
        <template #option-empty="{ query }">
            <q>{{ query }}</q> no encontrado
        </template>
    </USelectMenu>
</template>