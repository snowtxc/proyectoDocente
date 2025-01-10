<script setup lang="ts">

import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableRow from '@tiptap/extension-table-row'
import Gapcursor from '@tiptap/extension-gapcursor'
import TableHeader from "@tiptap/extension-table-header";
import { Image } from "./extensions/image-extension";
import BubbleMenu from "@tiptap/extension-bubble-menu"
import { Editor} from '@tiptap/vue-3'

// Bubble Menus.
import ImageBubbleMenu from './bubble-menus/ImageBubbleMenu.vue'
import TextBubbleMenu from './bubble-menus/TextBubbleMenu.vue'

// enums
import { AlignEnum } from '~/utils/enums/AlignEnum'

const editorContainer = ref(null);

const editor = ref(null);

const itemsAddBtn = computed(() => [
  [{
    slot: 'format',
    label: 'Formato',
    disabled: true,
  }], [{
    label: 'Título 1',
    icon: 'tabler:h-1',
    click: () =>{
      editor.value.chain().focus().toggleHeading({ level: 1 }).run()
    }
  },
  {
    label: 'Título 2',
    icon: 'tabler:h-2',
    click: () =>{
      editor.value.chain().focus().toggleHeading({ level: 2 }).run()
    }
  },
  {
    label: 'Título 3',
    icon: 'tabler:h-3',
    click: () =>{
      editor.value.chain().focus().toggleHeading({ level: 3 }).run()
    }
  },
  {
    label : "Lista de Viñetas",
    icon : "tabler:list",
    click: () =>{
      editor.value.chain().focus().toggleBulletList().run()
    }
  },
  {
    label: "Lista Númerada",
    icon : "tabler:list-numbers",
    click : ()=>{
      editor.value.chain().focus().toggleOrderedList().run()
    }
  },

  {
    label: "Lista de Tareas",
    icon: 'tabler:list-details',
    click : ()=>{
      editor.value.chain().focus().toggleTaskList().run();
    }
  },

  {
    label: "Cita en Bloque",
    icon: "tabler:blockquote",
    click: () =>{
      editor.value.chain().focus().toggleBlockquote().run()
    }
   }],
  [{
    slot: 'format',
    label: 'Insertar',
    disabled: true
  }],
  [{
    label: 'Tabla',
    icon: 'tabler:table-dashed',
    click: () => {
      editor.value.chain().focus().insertTable({  withHeaderRow: true }).run()
    }
  },
  {
    label: 'Imagen',
    icon : 'tabler:photo',
    click: ()=>{
      editor.value.chain().focus().setImage({ src: "" }).run();
    }
  },
  {
    label : 'Columnas',
    icon : 'tabler:layout-columns'
  }, 
  {
    label : 'Pasar Regla',
    icon : 'tabler:ruler-measure' ,
    click : () =>{
      editor.value.chain().focus().setHorizontalRule().run()
    }
  },
  {
    label : 'Tabla de Contenido',
    icon : 'tabler:layout-navbar-collapse'
  }]
])

const itemsAppBtn = computed(() => [
  [{
    label: 'Eliminar Formato',
    icon: 'tabler:clear-formatting',
  },
  {
    label: 'Copiar',
    icon: 'tabler:clipboard-copy',
  },
  {
    label: 'Duplicar',
    icon: 'tabler:copy',
  }],

  [{
    label : "Eliminar",
    icon : "tabler:trash",
    color: 'red'
  }]

  
])

onMounted(()=>{
  if(editorContainer.value){
    editor.value =  new Editor({
      content: "<p>I'm running Tiptap with Vue.js. 🎉</p>",
      extensions: [
        TiptapStarterKit, 
        TaskList, 
        TaskItem,
        Table.configure({
          resizable: true,
          cellMinWidth: 50,
          allowTableNodeSelection: true
        }),
        TableCell,
        TableHeader,
        TableRow,
        Image,
        Gapcursor,
        TiptapHorizontalRule,
        BubbleMenu.configure({
          pluginKey: 'imageBubbleMenu',
          element: document.querySelector('.image-menu'),
          shouldShow: ({ editor }) => {
            // Verifica si el nodo seleccionado es una imagen
            const { from, to } = editor.state.selection;
            const node = editor.state.doc.nodeAt(from);
            return node && node.type.name === 'image' && node.attrs.src; // Se muestra solo si el nodo es una imagen
          }
        }),
        BubbleMenu.configure({
          pluginKey: 'textBubbleMenu',
          element: document.querySelector('.text-menu'),
          shouldShow: ({ editor }) => {
            // Verifica si el nodo seleccionado es un texto
            const { from, to } = editor.state.selection;
            const node = editor.state.doc.nodeAt(from);
            return node && node.type.name === 'text'; // Se muestra solo si el nodo es un párrafo (texto)
          }
        })
      ],

      editorProps: {
        attributes: {
          class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
        },
      },
    })
  }
  });

onBeforeUnmount(() => {
  unref(editor).destroy();
});


// Actualizacion de alineacion de una imagen.
const handleAlignImageEvent = (align: AlignEnum)=>{
    const styleImage = align == AlignEnum.CENTER ? 'justify-center' : align == AlignEnum.LEFT ? 'justify-left': 'justify-end';
    
    const { from, to } = editor.value.state.selection;
    const node = editor.value.state.doc.nodeAt(from);

    const attrs = node.attrs;

    editor.value.chain().focus().setImage({ ...attrs, align: styleImage }).run();
}

// Rango de tamaño de una imagen
const handleUpdateRangeImageEvent = (range)=>{
  const { from, to } = editor.value.state.selection;
  const node = editor.value.state.doc.nodeAt(from);
  const attrs = node.attrs;

  editor.value.chain().focus().setImage({ ...attrs, width: range }).run();
}


</script>


<template>
    <div class="w-full" ref="editorContainer">
        <div v-if="editor">
          <TiptapFloatingMenu :editor="editor" :tippy-options="{ duration: 100 }">
            <div class="flex gap-2">
  
              <UDropdown :items="itemsAddBtn">
                <UButton
                  trailing-icon="i-heroicons-plus"
                  color="white"/>
              </UDropdown>
              <UDropdown :items="itemsAppBtn">
                <UButton
                trailing-icon="i-heroicons-squares-2x2"
                color="white"/>
              </UDropdown>
              
            </div>
          </TiptapFloatingMenu>
        </div>
        

        <!-- Bubble menus -->

        <div class="image-menu">
          <ImageBubbleMenu 
          @update:range="handleUpdateRangeImageEvent"
          @on-align-event="handleAlignImageEvent" ></ImageBubbleMenu>
        </div>
    
        <!-- Menu para texto -->
        <div class="text-menu" >
          <TextBubbleMenu :editor="editor"> </TextBubbleMenu>
        </div>


        <TiptapEditorContent :editor="editor" />
    </div>
  </template>

  <style lang="scss">
/* Basic editor styles */
.tiptap {
  
  :first-child {
    margin-top: 0;
  }

  /* List styles */
  ul,
  ol {
    padding: 0 1rem;
    margin: 1.25rem 1rem 1.25rem 0.4rem;

    li p {
      margin-top: 0.25em;
      margin-bottom: 0.25em;
    }
  }

  /* Task list specific styles */
  ul[data-type="taskList"] {
    list-style: none;
    margin-left: 0;
    padding: 0;

    li {
      align-items: flex-start;
      display: flex;

      > label {
        flex: 0 0 auto;
        margin-right: 0.5rem;
        user-select: none;
      }

      > div {
        flex: 1 1 auto;
      }
    }

    input[type="checkbox"] {
      cursor: pointer;
    }

    ul[data-type="taskList"] {
      margin: 0;
    }
  }

  /* Table-specific styling */
  table {
    border-collapse: collapse;
    margin: 0;
    overflow: hidden;
    table-layout: fixed;
    width: 100%;

    td,
    th {
      border: 1px solid #94a3b8;
      box-sizing: border-box;
      min-width: 3em;
      padding: 6px 8px;
      position: relative;
      vertical-align: top;

      > * {
        margin-bottom: 0;
      }
    }

    th {
      background-color: #e5e7eb;
      font-weight: bold;
      text-align: left;
    }

    .selectedCell:after {
      background: #94a3b8;
      content: "";
      left: 0; right: 0; top: 0; bottom: 0;
      pointer-events: none;
      position: absolute;
      z-index: 2;
    }

    .column-resize-handle {
      background-color: purple;
      bottom: -2px;
      pointer-events: none;
      position: absolute;
      right: -2px;
      top: 0;
      width: 1px;
    }
  }

  .tableWrapper {
    margin: 1.5rem 0;
    overflow-x: auto;
  }

  &.resize-cursor {
    cursor: ew-resize;
    cursor: col-resize;
  }

  .tableWrapper {
    margin: 1.5rem 0;
    overflow-x: auto;
  }

  &.resize-cursor {
    cursor: ew-resize;
    cursor: col-resize;
  }

  .header-container {
    width: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .add-column-button {
    position: absolute;
    top: -10px; /* Ajusta según sea necesario para colocar el botón encima de la celda */
    left: 50%;
    transform: translateX(-50%);
    background-color: #007bff;
    color: white;
    border: none;
    padding: 5px;
    cursor: pointer;
    font-size: 14px;
  }
  
  .add-column-button:hover {
    background-color: #0056b3;
  }
  
  .header-content {
    padding: 5px 10px;
    text-align: center;
  }
}



</style>
  
