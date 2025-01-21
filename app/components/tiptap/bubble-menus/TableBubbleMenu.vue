<script setup lang="ts">
    const props = defineProps(
        {editor : Object }
    );

    const items = computed(() => [[
    {
      label: 'Agregar Columna a la Izquierda',
      icon: 'tabler:arrow-bar-to-left',
      click: (item) => {
        props.editor.chain().focus().addColumnBefore().run()      
     },

    },
    {
      label: 'Agregar Columna a la Derecha',
      icon: 'tabler:arrow-bar-right',
      click: () => {
        props.editor.chain().focus().addColumnAfter().run()
      }
    },
    {
      label: 'Agregar Fila Arriba',
      icon: 'tabler:arrow-bar-up',
      click: () => {
        props.editor.chain().focus().addRowBefore().run()
      }
    },
    {
      label: 'Agregar Fila Abajo',
      icon: 'tabler:arrow-bar-down',
      click: () => {
        props.editor.chain().focus().addRowAfter().run()

      }
    },


    {
      label: 'Pintar Celda',
      icon: 'tabler:palette',
      click: () => {    
        bgColorPicker.value.click();
      }
    },

    {
      label: 'Eliminar Columna',
      icon: 'tabler:trash',
      click: () => {
        props.editor.chain().focus().deleteColumn().run()
      }
    },
    {
      label: 'Eliminar Fila',
      icon: 'tabler:trash',
      click: () => {
        props.editor.chain().focus().deleteRow().run()
      }
    }]])

    const bgColorPicker = ref(null);

    const handleSetCellColor =($event)=>{
        if ($event) {
            const rgbColor = $event.target.value;
            props.editor.chain().focus().setCellAttribute('backgroundColor', rgbColor).run()        
        }
    }
</script>

<template>
    <div v-if="editor" class="flex flex-col justify-between  w-full min-w-md p-2 bg-white/75 dark:bg-white/5 backdrop-blur shadow rounded-lg ring-1 ring-gray-200 dark:ring-gray-800">
        
        <UDropdown :items="items">
            <UButton color="gray" variant="ghost" :icon="'tabler:pencil'">
                Modificar tabla
            </UButton>

            <input type="color" ref="bgColorPicker" class="invisible absolute" @input="handleSetCellColor"
        :value="props.editor?.getAttributes('textStyle').color" />
        </UDropdown>
    </div>
</template>