<script setup lang="ts">

    import type { PromptCategory } from '~/utils/enums/PromptCategory.enum';
    import TiptapEditor from '../tiptap/TiptapEditor.vue';

    const isOpen = ref(false);
    const tiptapRef = ref();

    interface Props {
        modelValue:  { contentHtml:string , contentJson: string},
        title: string;
        disabled?: boolean;
        disabledText?: string;
        paramsBot: any,
        promptCategories: PromptCategory[]
    }
    const props = withDefaults(defineProps<Props>(), {
        modelValue: null,
    })

    const valueJson = ref(props.modelValue.contentJson);
    const valueHtml = ref(props.modelValue.contentHtml);

    const emit = defineEmits(['update:model-value']);
    
    const handleUpdateContent = (fields: {
        contentHtml : string,
        contentJson : string
    })=>{
        valueJson.value =  fields.contentJson;
        valueHtml.value = fields.contentHtml;
    }

    const onSave = ()=>{
        isOpen.value = false;
        emit('update:model-value', {
          contentJson: valueJson.value,
          contentHtml: valueHtml.value
        });
    }

    const handleOnUseTextResponseBot = (responseTextHtml) =>{
      tiptapRef.value?.setContentFromHtml(responseTextHtml);
    }

</script>

<template>

    <div class="flex justify-end"> 

      <UTooltip :text="(disabled && disabledText) ? disabledText: 'Editar plan de aprendizaje'">
            <UButton
            icon="tabler:pencil"
            size="sm"
            color="primary"
            variant="outline"
            @click="isOpen = true"
            :disabled="props.disabled"
        />
      </UTooltip>

  
        <UModal fullscreen title="Modal fullscreen" v-model="isOpen">  
            <UCard
              :ui="{ header: { padding: 'p-4 sm:px-6' }, body: { padding: '' } }"
              class="min-w-0 min-h-screen flex flex-col"
            >
              <template #header>
                <div class="flex gap-2 justify-between items-center mt-2">
                    <h1 class="font-medium text-xl"> {{ props.title }}</h1>
        
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

              <div class="flex justify-end py-2 px-2">
                <FlopiBot :params="paramsBot" @on:use-text-response="handleOnUseTextResponseBot" :categories="props.promptCategories
                "></FlopiBot>
              </div>

              <div class="w-full overflow-y-auto min-h-[70vh] max-h-[70vh]">
                <TiptapEditor  :defaultContent="props.modelValue" @on:update="handleUpdateContent"  :editable="true" ref="tiptapRef"
                ></TiptapEditor>
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