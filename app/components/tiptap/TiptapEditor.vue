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
import Underline  from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import { Color } from '@tiptap/extension-color'
import Highlight from "@tiptap/extension-highlight";
import FontFamily from "@tiptap/extension-font-family";
import FontSize from "tiptap-extension-font-size";
import Paragraph from '@tiptap/extension-paragraph';


// Bubble Menus.
import ImageBubbleMenu from './bubble-menus/ImageBubbleMenu.vue'
import TextBubbleMenu from './bubble-menus/TextBubbleMenu.vue'
import LinkBubbleMenu from './bubble-menus/LinkBubbleMenu.vue'

import { Link } from './extensions/link-extension'

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
        Underline,
        TextStyle.configure({ mergeNestedSpanStyles: true }),
        Color,
        FontSize,
        Paragraph,
        Link.configure({
          openOnClick: false,
        }),
        Highlight.configure({
          multicolor: true,
        }),
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
            return node && node.type.name === 'text' && !editor.isActive('link'); // Se muestra solo si el nodo es un párrafo (texto)
          }
        }),

        BubbleMenu.configure({
          pluginKey: 'linkBubbleMenu',
          element: document.querySelector('.link-menu'),
          shouldShow: ({ editor }) => {
            // Verifica si el nodo seleccionado es un texto
            const { from, to } = editor.state.selection;
            const node = editor.state.doc.nodeAt(from);
            return node && node.type.name === 'text' && editor.isActive('link'); // Se muestra solo si el nodo es un texto y tiene activo el link
          }
        }),
        FontFamily.configure({
          types: ['textStyle']
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
        <div class="text-menu w-full" >
          <TextBubbleMenu :editor="editor"> </TextBubbleMenu>
        </div>

        <div class="link-menu w-full" >
           <LinkBubbleMenu :editor="editor"></LinkBubbleMenu>
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

  p{
    margin: 0 0;
    padding: 0 0;
    font-size: 16px;
    color: black;
  }

  /* List styles */
  

  /* Task list specific styles */
  ul[data-type="taskList"] {
    list-style: none;
    margin-left: 0;
    padding: 0;

    li {
      align-items: center;
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

  

  ul {
    margin-left: 1em;
    padding: 0 !important;    
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-left: 0;
  }
  

  ul li {
    align-items: center;
    padding: 0 !important;
    margin: 0 !important; /* Espaciado entre elementos */    
  }

  
  ul li::marker {
    color: black; /* Cambia el color de las viñetas */
  }

  ol{
    margin-left: -1em;
  }

  ol li::marker {
    color: black; /* Cambia el color de las viñetas */
    font-size: 16px;
  }


  a {
    color: #3b82f6;
    cursor: pointer;
  }
  
}



</style>
  
