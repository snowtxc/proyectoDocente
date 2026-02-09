<script setup lang="ts">
    import type { Grupo } from '~/types/grupo'
    import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum';
    import { apiGrupoRoutes } from '~/utils/apiRoutes';
    
    const { $apiRest } = useNuxtApp();
    const toast = useToast();
    const isLoading = ref(false);
    const selected = ref<Grupo | null>(null);

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
    
    watch(() => props.modelValue, (newValue) => {
        selected.value = newValue as Grupo | null;
    }, { immediate: true });

    onMounted(async()=>{
        if(!props.disabled){
            isLoading.value = true;
            try{
                const gruposData = await $apiRest<Grupo[]>(apiGrupoRoutes.listAll,HttpMethodEnum.GET);
                grupos.value = gruposData;
                isLoading.value = false;

            }catch(message){
                isLoading.value = false;
                toast.error({
                    title: "Error",
                    message,
                    color: "error"
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
        @update:model-value="updateValue"
        searchable 
        v-model="selected"
        :loading="isLoading"
        by="id"
        :items="grupos"
        :disabled="props.disabled"
        empty="No existen grupos">

        <template #empty>
            No existen grupos.
        </template>

        <template #leading="{ modelValue, ui }">
             <div v-if="props.modelValue" class="flex items-center gap-2">
                <UAvatar :src="props.modelValue.url_image" size="2xs" />

                 <span>{{ props.modelValue.nombre }} </span> 
            </div>
            <span v-else> Selecciona un grupo</span>
        </template>
        
        <template #item-leading="{ item }">
            
            <UAvatar :src="item.url_image" size="2xs" />

            <span>{{ item.nombre }} </span> 
          </template>
    </USelectMenu>
</template>