<script setup lang="ts">

const props = defineProps(
    {editor : Object }
);

const iconBtnTypeText = ref(null);
const labelBtnFormat = ref("Inter");
const labelBtnSizes = ref("Más pequeño");

const itemsTypes = computed(() => [
  [{
    slot: 'format',
    label: 'Tipo',
    disabled: true,
    
  }], [
  {
    label: 'Parrafo',
    icon: 'tabler:text-plus',
    click: (item) =>{
        iconBtnTypeText.value = 'tabler:text-plus';
    },
    
  },
  {
    label: 'Título 1',
    icon: 'tabler:h-1',
    click: () =>{
        iconBtnTypeText.value = 'tabler:h-1';
    }
  },
  {
    label: 'Título 2',
    icon: 'tabler:h-2',
    click: () =>{
        iconBtnTypeText.value = 'tabler:h-2';
    }
  },
  {
    label: 'Título 3',
    icon: 'tabler:h-3',
    click: () =>{
        iconBtnTypeText.value = 'tabler:h-3';
    }
  }],
  [{
    slot: 'lista',
    label: 'Listas',
    disabled: true
  }],
  [
  {
    label : "Lista de Viñetas",
    icon : "tabler:list",
    click: () =>{
        iconBtnTypeText.value = 'tabler:list';
    }
  },
  {
    label: "Lista Númerada",
    icon : "tabler:list-numbers",
    click : ()=>{
        iconBtnTypeText.value = 'tabler:list-numbers';
    }
  },

  {
    label: "Lista de Tareas",
    icon: 'tabler:list-details',
    click : ()=>{
        iconBtnTypeText.value = 'tabler:list-details';
    }
  },

  {
    label: "Cita en Bloque",
    icon: "tabler:blockquote",
    click: () =>{
        iconBtnTypeText.value = 'tabler:blockquote';
    }
}]])

const itemsFormats = computed(()=> [
    [
    {
        label: 'Inter',
        click: () =>{


        }
    },
    {
        label: 'Arial',
        click: () =>{
        }
    }
    ]
])

const itemsSizes = computed(()=> [
    [
    {
        label: 'Más pequeño',
        click: () =>{

        }
    },
    {
        label: 'Pequeño',
        click: () =>{
        }
    }
    ]
])

</script>

<template>
    <UCard class="w-full mx-auto bg-white/75 dark:bg-white/5 backdrop-blur">
        <div class="flex items-center">
            <UDropdown :items="itemsTypes">
                  <UButton
                    color="gray"
                    variant="ghost"
                    :icon="iconBtnTypeText ? iconBtnTypeText : 'tabler:align-box-left-bottom'"
                    ></UButton>
              </UDropdown>

            <UDropdown :items="itemsFormats">
                <UButton
                  color="gray"
                  variant="ghost"
                  > {{  labelBtnFormat }} </UButton>
            </UDropdown>

            <UDropdown :items="itemsSizes">
                <UButton
                  color="gray"
                  variant="ghost"
                  > {{  labelBtnSizes }} </UButton>
            </UDropdown>

            <div class="h-6 bg-gray-300 w-0.5 mx-2"></div>

            <UButton
            color="gray"
            variant="ghost"
            :icon="'tabler:bold'"
            @click="props.editor?.chain().focus().toggleBold().run()"
            ></UButton>    
        </div>
    </UCard>
</template>