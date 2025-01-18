<script setup lang="ts">

    import FormLink from '~/components/forms/FormLink.vue';
    import type { LinkForm } from '~/utils/forms/link-form';

    const props = defineProps(
        {editor : Object }
    );

    const url = computed<string>(()=>{
        return props.editor?.getAttributes('link').href        
    })

    const defaultFormLink =  ref<LinkForm>(null);

    const showFormLink = ref(false);

    const openLinkForm = ()=>{
        defaultFormLink.value = {
            link : url.value,
        }
        showFormLink.value = true;
    }

    const handleEventLink = (linkForm: LinkForm) =>{
        const { link } = linkForm;

        props.editor?.chain()
            .focus()
            .extendMarkRange('link')
            .setLink({ href: link })
            .run()

       showFormLink.value = false;
    }

    const openLink = ()=>{
        window.open(url.value, "_blank");
    }

    const removeLink = ()=>{
        props.editor.commands.unsetLink();
    }

</script>

<template>

    <UPopover v-if="showFormLink" v-model:open="showFormLink">  
        <UButton color="white" label="Open" class="hidden" trailing-icon="i-heroicons-chevron-down-20-solid" />
  
        <template #panel>

          <FormLink :defaultForm="defaultFormLink" @on:submit="handleEventLink"></FormLink>

        </template>
    </UPopover>
    
    <div  v-else class="flex justify-between items-center w-full bg-white/75  p-2 dark:bg-white/5 backdrop-blur shadow rounded-lg ring-1 ring-gray-200 dark:ring-gray-800">
        <a class="underline hover:cursor-pointer truncate" @click="openLink"> {{ url }}  </a>

        <div class="h-6 bg-gray-300 w-0.5 mx-2"></div>

        <div class="flex items-center gap-2">
            <UButton
            color="gray"
            variant="ghost"
            :icon="'tabler:pencil'"
            @click="openLinkForm"
            ></UButton>
    
            <UButton
            color="gray"
            variant="ghost"
            :icon="'tabler:trash'"
            @click="removeLink"
            ></UButton>
        </div>
    </div>
</template>