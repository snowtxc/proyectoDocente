<script setup lang="ts">

    import TiptapEditor from '../tiptap/TiptapEditor.vue';

    const isOpen = ref(false);

    interface Props {
        modelValue: string,
        title: string;
        disabled?: boolean;
    }
    const props = withDefaults(defineProps<Props>(), {
        modelValue: null,
    });

    const value = ref(props.modelValue);

    const emit = defineEmits(['update:model-value']);
    
    const handleUpdateContent = (fields: {
        contentHtml : string,
        contentJson : string
    })=>{
        value.value = fields.contentJson;
    }

    const onSave = ()=>{
        isOpen.value = false;
        emit('update:model-value', value.value);
    }

</script>

<template>

    <div class="flex justify-end"> 

        <UButton
            icon="tabler:pencil"
            size="sm"
            color="primary"
            variant="outline"
            @click="isOpen = true"
            :disabled="props.disabled"
        />
            

        <UModal fullscreen title="Modal fullscreen" v-model="isOpen">  
            <UCard
              :ui="{ header: { padding: 'p-4 sm:px-6' }, body: { padding: '' } }"
              class="min-w-0 min-h-screen flex flex-col"
            >
              <template #header>
                <div class="flex gap-2 justify-between items-center mt-2">
                    <h1 class="font-medium text-xl">Plan de Aprendizaje</h1>
        
                    <UButton
                    icon="tabler:x"
                    size="sm"
                    color="primary"
                    square
                    variant="solid"
                    class="flex-none"
                    @click="isOpen = false;"
                    />
                </div>
              </template>

              <div class="w-full overflow-y-auto min-h-[80vh] max-h-[80vh]">
                <TiptapEditor :defaultContent="value" @on:update="handleUpdateContent"></TiptapEditor>
              </div>

              <template #footer>
                <div class="flex justify-end gap-3 items-end h-full">
                  <UButton
                    label="Cancelar"
                    color="gray"
                    variant="ghost"
                    @click="isOpen = false"
                  />
                  <UButton
                    type="button"
                    label="Guardar"
                    color="black"
                    @click="onSave"
                  />
                </div>
              </template>

            </UCard>
        </UModal>
    </div>
</template>