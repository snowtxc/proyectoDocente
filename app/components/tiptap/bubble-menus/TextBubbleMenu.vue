<script setup lang="ts">
import FormLink from '~/components/forms/FormLink.vue';
import type { LinkForm } from '~/utils/forms/link-form';

import { fonts } from '~/utils/fonts';
import { textSizes } from '~/utils/textSizes';

const props = defineProps(
  { editor: Object }
);

const iconBtnTypeText = ref(null);
const labelBtnFont = ref("Inter");
const labelBtnSizes = ref("Mediano");

const bgColorPicker = ref(null);
const textColorPicker = ref(null);

const showPopupFonts = ref(false);
const showPopupSizes = ref(false);

const itemsTypes = computed(() => [
  [{
    slot: 'format',
    label: 'Tipo',
    disabled: true,
   

  }], [
    {
      label: 'Parrafo',
      icon: 'tabler:text-plus',
      click: (item) => {
        iconBtnTypeText.value = 'tabler:text-plus';
        props.editor.chain().focus().setParagraph().run()
      },

    },
    {
      label: 'Título 1',
      icon: 'tabler:h-1',
      click: () => {
        iconBtnTypeText.value = 'tabler:h-1';
        props.editor.chain().focus().toggleHeading({ level: 1 }).run()

      }
    },
    {
      label: 'Título 2',
      icon: 'tabler:h-2',
      click: () => {
        iconBtnTypeText.value = 'tabler:h-2';
        props.editor.chain().focus().toggleHeading({ level: 2 }).run()

      }
    },
    {
      label: 'Título 3',
      icon: 'tabler:h-3',
      click: () => {
        iconBtnTypeText.value = 'tabler:h-3';
        props.editor.chain().focus().toggleHeading({ level: 3 }).run()

      }
    }],
  [{
    slot: 'lista',
    label: 'Listas',
    disabled: true
  }],
  [
    {
      label: "Lista de Viñetas",
      icon: "tabler:list",
      click: () => {
        iconBtnTypeText.value = 'tabler:list';
        props.editor.chain().focus().toggleBulletList().run()

      }
    },
    {
      label: "Lista Númerada",
      icon: "tabler:list-numbers",
      click: () => {
        iconBtnTypeText.value = 'tabler:list-numbers';
        props.editor.chain().focus().toggleOrderedList().run()

      }
    },

    {
      label: "Lista de Tareas",
      icon: 'tabler:list-details',
      click: () => {
        iconBtnTypeText.value = 'tabler:list-details';
        props.editor.chain().focus().toggleTaskList().run();
      }
    },

    {
      label: "Cita en Bloque",
      icon: "tabler:blockquote",
      click: () => {
        iconBtnTypeText.value = 'tabler:blockquote';
        props.editor.chain().focus().toggleBlockquote().run()

      }
    }]])

const itemsFonts = computed(() => [
  [
    {
      label: 'Inter',
      click: () => {


      }
    },
    {
      label: 'Arial',
      click: () => {
      }
    }
  ]
])

const itemsSizes = computed(() => [
  [
    {
      label: 'Más pequeño',
      click: () => {

      }
    },
    {
      label: 'Pequeño',
      click: () => {
      }
    }
  ]
])

const isBoldActive = computed(() => {
  return props.editor?.isActive('bold');
})

const isItalicActive = computed(() => {
  return props.editor?.isActive('italic');
})

const isUnderlineActive = computed(() => {
  return props.editor?.isActive('underline');
})

const handleEventLink = (linkForm: LinkForm) => {

  const { link } = linkForm;

  props.editor?.chain()
    .focus()
    .extendMarkRange('link')
    .setLink({ href: link })
    .run()
}

const openBgColorPicker = () => {
  bgColorPicker.value.click();
}

const handleSetTextBackground = ($event) => {
  if ($event) {
    const rgbColor = $event.target.value;
    props.editor?.chain().focus().setHighlight({ color: rgbColor }).run()
  }

}

const openTextColorPicker = () => {
  textColorPicker.value.click();
}

const handleSetTextColor = ($event) => {
  if ($event) {
    const rgbColor = $event.target.value;
    props.editor?.chain().focus().setMark('textStyle', { color: rgbColor }).run();
  }
}

const handleSetFontFamily = (font:string, fontType:string)=>{
  props.editor.chain().focus().setFontFamily(`${font} , ${fontType}`).run();
  labelBtnFont.value = font;
}

const handleSetFontSize = (label:string, px:string) => { 
  props.editor.chain().focus().setFontSize(px).run()
  labelBtnSizes.value = label;
}
 
</script>

<template>
  <div
    class="flex justify-between items-center w-full min-w-md p-2 min-w-[550px] bg-white/75 dark:bg-white/5 backdrop-blur shadow rounded-lg ring-1 ring-gray-200 dark:ring-gray-800">
    <UDropdown :items="itemsTypes">
      <UButton color="gray" variant="ghost" :icon="iconBtnTypeText ? iconBtnTypeText : 'tabler:align-box-left-bottom'">
      </UButton>
    </UDropdown>

    <UPopover v-model:open="showPopupFonts">
      <UButton color="gray" variant="ghost"> 
        {{ labelBtnFont }} 

        <UIcon name="tabler:chevron-down" class="w-3 h-3" />

      </UButton>
      
      <template #panel>
        <div class="p-4">
          <div v-for="fontType in fonts">
            <span class="font-semibold	"> {{ fontType.label }}</span>
            <div v-for="font in fontType.fonts" :key="font" class="p-2 hover:bg-gray-100 hover:cursor-pointer rounded-md"
              :class="{ 'bg-gray-100': props.editor.isActive('textStyle', { fontFamily:  font + ', ' + fontType.value}) }"
              :style="{ fontFamily: font + ', ' + fontType.value }"
              @click="handleSetFontFamily(font,fontType.value)">
              {{ font }}
            </div>
            <div class="w-full h-[2px] bg-gray-200 my-2"></div>
          </div>
        </div>
      </template>
    </UPopover>


    <UPopover v-model:open="showPopupSizes">


      <UButton color="gray" variant="ghost"> 
        {{ labelBtnSizes }} 
        <UIcon name="tabler:chevron-down" class="w-3 h-3" />

      </UButton>

      <template #panel>
        <div class="p-4">
          <div v-for="size in textSizes" class="p-2 hover:bg-gray-100 hover:cursor-pointer rounded-md"
          :style="{  fontSize: size.px }" 
          @click="handleSetFontSize(size.label,size.px)">
             {{ size.label }}
          </div>
        </div>
      </template>
    </UPopover>

    <div class="h-6 bg-gray-300 w-0.5 mx-2"></div>

    <UButton color="gray" variant="ghost" :icon="'tabler:bold'"
      @click="props.editor?.chain().focus().toggleBold().run()"
      :class="{ 'bg-gray-300 hover:bg-gray-300': isBoldActive }">
    </UButton>

    <UButton color="gray" variant="ghost" :icon="'tabler:italic'"
      :class="{ 'bg-gray-300 hover:bg-gray-300': isItalicActive }"
      @click="props.editor?.chain().focus().toggleItalic().run()"></UButton>



    <UButton color="gray" variant="ghost" :icon="'tabler:underline'"
      @click="props.editor?.chain().focus().toggleUnderline().run()"
      :class="{ 'bg-gray-300 hover:bg-gray-300': isUnderlineActive }"></UButton>

    <UPopover>

      <UButton color="gray" variant="ghost" :icon="'tabler:link'"></UButton>

      <template #panel>

        <FormLink @on:submit="handleEventLink"></FormLink>

      </template>
    </UPopover>

    <div>
      <UButton color="gray" variant="ghost" :icon="'tabler:paint'" @click="openBgColorPicker"></UButton>

      <input type="color" ref="bgColorPicker" class="invisible absolute" @input="handleSetTextColor"
        :value="props.editor?.getAttributes('textStyle').color" />
    </div>


    <div>
      <UButton color="gray" variant="ghost" :icon="'tabler:palette'" @click="openTextColorPicker"></UButton>

      <input type="color" ref="textColorPicker" class="invisible absolute" @input="handleSetTextBackground"
        :value="props.editor?.getAttributes('textStyle').color" />
    </div>




  </div>
</template>