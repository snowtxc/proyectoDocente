<script setup lang="ts">
    import type { Grupo } from '~/types/grupo'
    import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum';
    import { defineProps, defineEmits, ref ,onBeforeMount} from 'vue';
    
    const { $apiRest } = useNuxtApp();
    const toast = useToast();
    const isLoading = ref(false);

    const props = defineProps({
        modelValue: {
            type: Object,
            default: null
        },
        disabled: {
            type: Boolean,
            default: false
        }
    });

    const emit = defineEmits(['update:model-value', 'close'])

    const grupos = ref<Grupo[]>([]);
    
    onMounted(async()=>{
        if(!props.disabled){
            isLoading.value = true;
            try{
                const gruposData = await $apiRest(apiGrupoRoutes.listAll,HttpMethodEnum.GET);
                grupos.value = gruposData;
                isLoading.value = false;

            }catch(message){
                isLoading.value = false;
                toast.add({
                    title: "Error",
                    description: message,
                    color: "red"
                });
            }
        }
        
    });

    const updateValue = (value) => {
        emit('update:model-value', value);
    };

</script>

<template>
    <USelectMenu 
        @change="updateValue"
        searchable 
        v-model="selected"
        :loading="isLoading"
        by="id"
        :options="grupos"
        :disabled="props.disabled"
        placeholder="Seleccionar grupo">

        <template #label>
            <div v-if="props.modelValue" class="flex items-center gap-2">
                <UAvatar :src="props.modelValue.url_image" size="2xs" />

                 <span>{{ props.modelValue.nombre }} </span> 
            </div>

            <div v-else>
                Seleccionar Grupo
            </div>
        </template>
        
        <template #option="{ option }">
            
            <UAvatar :src="option.url_image" size="2xs" />

            <span>{{ option.nombre }} </span> 
          </template>
    </USelectMenu>
</template>