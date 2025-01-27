<script setup lang="ts">

    import TiptapEditor from './tiptap/TiptapEditor.vue';

    const isSlideoverOpen = ref(false);

    const props = defineProps({
        modelValue: { type: String , required: true },
        title : { type: String, required: true}
    })

    const emit = defineEmits(['on:update']);
    
    const handleUpdateContent = (fields: {
        contentHtml : string,
        contentJson : string
    })=>{
        emit("on:update",fields)
    }

</script>

<template>

    <div class="flex justify-end"> 

        <div class="w-full flex justify-center">
            <UButton
            label="Ver plan de aprendizaje"
            class="flex-none"
            trailing-icon="i-heroicons-plus"
            color="black"
            @click="isSlideoverOpen = true"
        />
        </div>
       
        <div class="w-full flex justify-end absolute" v-if="isSlideoverOpen">
            <div id="slideover-container" class="fixed h-full  shadow-md w-1/2 bg-white flex">
                <!-- Overlay -->
                <div class="min-w-full inset-0 bg-[var(--ui-bg-elevated)]/75 hidden" id="slideover-overlay"></div>
            
                <div class="w-full bg-[var(--ui-bg)] divide-y divide-[var(--ui-border)] sm:ring ring-[var(--ui-border)] sm:shadow-lg flex flex-col focus:outline-none data-[state=open]:animate-[fade-in_200ms_ease-out] data-[state=closed]:animate-[fade-out_200ms_ease-in]" id="slideover-content">
                  <div class="px-4 py-5 sm:px-6 relative flex justify-between items-center">
                    <h2 class="text-[var(--ui-text-highlighted)] font-semibold" id="slideover-title">{{ props.title }}</h2>
                    <UButton  color="white" trailing-icon="tabler:letter-x" @click="isSlideoverOpen = false" />
                </div>
            
                  <div class="flex-1 overflow-y-auto p-4 sm:p-6" id="slideover-body">
                    <TiptapEditor :defaultContent="props.modelValue" @on:update="handleUpdateContent"></TiptapEditor>
                  </div>                
                </div>
            </div>
        </div>
    </div>
   
    
</template> 