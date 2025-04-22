<script setup lang="ts">
import { NodeViewWrapper } from '@tiptap/vue-3';
import ImagePicker from '~/components/image-picker/ImagePicker.vue';

const props = defineProps({
    node: Object,
    updateAttributes: Function,
    editor : Object
});

const imageSelected = ref<boolean>(props.node.attrs.src ? true : false);
const showImage = ref<boolean>(props.node.attrs.src ? true : false);

const handleImageSelected = (imageB64)=>{
    showImage.value = true;
    props.updateAttributes({
      src: imageB64
    })
}

</script>

<template>
    <NodeViewWrapper> 
         <ImagePicker @onSelectImage="handleImageSelected" v-if="!showImage"></ImagePicker>
          
          <div class="flex" :class="[props.node.attrs.align]">
            <img  :src="props.node.attrs.src"
            :alt="props.node.attrs.alt || ''"
            @click="imageSelected = !imageSelected"
            :class="[
                    'hover:cursor-pointer', 
                    imageSelected ? 'border-4 border-primary-500' : '',
                    ]" 
            :style="{ width: props.node.attrs.width + '%' }">
          </div>
          
    </NodeViewWrapper>
  </template>


  
 