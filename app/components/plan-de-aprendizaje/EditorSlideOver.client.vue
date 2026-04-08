<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css'; // Tema Snow (clásico)
// import '@vueup/vue-quill/dist/vue-quill.bubble.css'; // Tema Bubble (flotante)

import type { PromptCategory } from '~/utils/enums/PromptCategory.enum';

interface Props {
    modelValue: string;
    title: string;
    disabled?: boolean;
    disabledText?: string;
    paramsBot?: any;
    promptCategories: PromptCategory[];
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: '',
    disabled: false
});

const emit = defineEmits(['update:model-value', 'on:save', 'on:delete']);

const editorData = ref(props.modelValue);
const quillRef = ref(null);

// Sincronización: Editor -> Padre
watch(() => editorData.value, (newValue) => {
    // Quill emite un string vacío como '<p><br></p>' a veces, 
    // lo normalizamos si es necesario
    emit('update:model-value', newValue);
});

// Sincronización: Padre -> Editor
watch(() => props.modelValue, (newValue) => {
    if (newValue !== editorData.value) {
        editorData.value = newValue || '';
    }
});

// Configuración de la barra de herramientas (Toolbar)
const globalOptions = {
    modules: {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'indent': '-1' }, { 'indent': '+1' }],
            [{ 'align': [] }],
            ['link', 'image', 'video'],
            ['clean'] // Eliminar formato
        ],
    },
    placeholder: 'Escribe aquí tu contenido...',
    theme: 'snow'
};

// Nota: Quill maneja automáticamente las imágenes pegadas o subidas como Base64
// por defecto si no se configura un "Image Uploader" específico.
</script>

<template>
    <div class="quill-container w-full prose max-w-none">
        <QuillEditor
            ref="quillRef"
            v-model:content="editorData"
            content-type="html"
            :options="globalOptions"
            :read-only="props.disabled"
            class="min-h-[500px] bg-white dark:bg-gray-900"
        />
        
        <!-- Mensaje de ayuda -->
        <div class="text-xs text-gray-500 mt-1 flex items-center gap-1">
            <UIcon name="tabler:info-circle" />
            💡 Las imágenes se incrustan automáticamente como base64.
        </div>
    </div>
</template>

<style scoped>
/* Estilizamos el contenedor de Quill para que se parezca a tu diseño anterior */
.quill-container :deep(.ql-toolbar.ql-snow) {
    border-top-left-radius: 0.5rem;
    border-top-right-radius: 0.5rem;
    border-color: #e5e7eb;
    background-color: #f9fafb;
}

.quill-container :deep(.ql-container.ql-snow) {
    border-bottom-left-radius: 0.5rem;
    border-bottom-right-radius: 0.5rem;
    border-color: #e5e7eb;
    min-height: 500px;
    font-size: 1rem;
}

/* Modo oscuro opcional */
.dark .quill-container :deep(.ql-toolbar) {
    background-color: #1f2937;
    border-color: #374151;
}

.dark .quill-container :deep(.ql-container) {
    border-color: #374151;
}

/* Ajuste de imágenes para que sean responsivas dentro del editor */
.quill-container :deep(.ql-editor img) {
    max-width: 100%;
    height: auto;
    border-radius: 0.5rem;
}
</style>