<script setup lang="ts">

    const props = defineProps({
        modelValue: {
            type: Number,
            default: new Date().getFullYear()
        }
    });

    const selectedYear = ref(props.modelValue);

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
        console.log(value)
        emit('update:modelValue', value);
    };

    watch(()=> props.modelValue, ()=>{
        selectedYear.value = props.modelValue;
    })

</script>

<template>
    <USelectMenu
            @update:modelValue="updateValue"
            searchable
            searchable-placeholder="Buscar un año..."
            class="w-full"
            placeholder="Selecciona un Año"
            :items="years"
            v-model="selectedYear"
            
        >
    
    </USelectMenu>
</template>