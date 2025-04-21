<script setup lang="ts">
import { AlignEnum } from '~/utils/enums/AlignEnum';
import FormLink from '~/components/forms/FormLink.vue';
import type { LinkForm } from '~/utils/forms/link-form';

const props = defineProps(
  { editor: Object }
);

const emit = defineEmits(['on-align-event','on-change-link']);

const url = computed<string>(()=>{
    return props.editor?.getAttributes('youtube').src;       
})

const defaultFormLink = ref<LinkForm>({
    link : url.value
});

const showFormLink = ref(false);

const openLinkForm = ()=>{
    defaultFormLink.value = {
        link : url.value,
    }
    showFormLink.value = true;
}


const handleChangeYoutubeLink = (formLink: LinkForm) =>{
    props.editor.commands.setYoutubeVideo({
        src: formLink.link
    })

    showFormLink.value = false;
}

</script>

<template>
    <UPopover v-if="showFormLink" v-model:open="showFormLink">  
        <UButton color="white" label="Open" class="hidden" trailing-icon="i-heroicons-chevron-down-20-solid" />
  
        <template #panel>
            <FormLink
            description="Modifica el link de youtube"
            :isYoutubeLink="true"
            label="Link de Youtube"
            @on:submit="handleChangeYoutubeLink"
            :defaultForm="defaultFormLink"
            ></FormLink>        
        </template>
    </UPopover>
    

    <UCard class="max-w-sm w-full mx-auto bg-white/75 dark:bg-white/5 backdrop-blur">
        <div class="flex items-center">
            <UButton
                color="gray"
                variant="ghost"
                icon="tabler:align-box-left-bottom"
                @click="emit('on-align-event',AlignEnum.LEFT)"
            ></UButton>

            <UButton
                color="gray"
                variant="ghost"
                icon="tabler:align-box-center-bottom"
                @click="emit('on-align-event',AlignEnum.CENTER)"

            ></UButton>

            <UButton
                color="gray"
                variant="ghost"
                icon="tabler:align-box-right-stretch"
                @click="emit('on-align-event',AlignEnum.RIGHT)"

            ></UButton>

            <UPopover>

            <UButton color="gray" variant="ghost" :icon="'tabler:pencil'" @click="openLinkForm"></UButton>

            </UPopover>
        </div>
        </UCard>
</template>