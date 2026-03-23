<script setup lang="ts">
    declare const DocsAPI: any;

    import type { PromptCategory } from '~/utils/enums/PromptCategory.enum';
    import Editor from '@tinymce/tinymce-vue'
    import { ref } from 'vue';

    interface Props {
        modelValue: string,
        title: string;
        disabled?: boolean;
        disabledText?: string;
        paramsBot?: any,
        promptCategories: PromptCategory[]
    }    
    const props = withDefaults(defineProps<Props>(), {})
    
    const editorData = ref(props.modelValue ? props.modelValue : '');
    const isClient = ref(false);
    const editorKey = ref(0);

    const emit = defineEmits(['update:model-value','on:save','on:delete']);
    
    onMounted(async()=>{
      isClient.value = true;
    })

    watch(()=> editorData.value, ()=>{
      emit('update:model-value' , editorData.value);
    })

    watch(()=> props.modelValue, ()=>{
        editorData.value = props.modelValue ? props.modelValue : '';
    });

    // Manejador para subir imágenes como base64
    const handleImageUpload = (blobInfo: any, progress: any): Promise<string> => {
      return new Promise((resolve, reject) => {
        // Verificar tamaño (límite 5MB)
        if (blobInfo.blob().size > 5 * 1024 * 1024) {
          reject('La imagen es demasiado grande. Máximo 5MB.');
          return;
        }

        const reader = new FileReader();
        
        reader.onload = () => {
          resolve(reader.result as string);
        };
        
        reader.onerror = () => {
          reject('Error al leer el archivo');
        };
        
        reader.readAsDataURL(blobInfo.blob());
      });
    };

    // Configuración del editor - SIN UPLOADCARE
    const editorInit = {
      toolbar_mode: 'sliding',
      height: 1000,
      min_height: 500,
      
      // Plugins necesarios - ELIMINADO 'uploadcare'
      plugins: [
        'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'link', 'lists', 
        'media', 'searchreplace', 'table', 'visualblocks', 'wordcount',  
        'image', 'imagetools' // Plugins de imagen
      ],
      
      // Toolbar - ELIMINADO 'uploadcare'
      toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat | imagetools',
      
      tinycomments_mode: 'embedded',
      tinycomments_author: 'Author name',
      
      mergetags_list: [
        { value: 'First.Name', title: 'First Name' },
        { value: 'Email', title: 'Email' },
      ],
      
      // ELIMINADO: uploadcare_public_key
      
      // Configuración para imágenes base64
      automatic_uploads: false,
      images_upload_url: '',
      images_upload_handler: handleImageUpload,
      images_file_types: 'jpg,jpeg,png,gif,webp,bmp,svg',
      paste_data_images: true, // Permitir pegar imágenes
      image_caption: true,
      
      // Clases para imágenes
      image_class_list: [
        {title: 'Responsive', value: 'img-responsive'},
        {title: 'Ninguna', value: ''}
      ],
      
      image_dimensions: true,
      
      // Configuración para imagetools
      imagetools_cors_hosts: ['localhost', '127.0.0.1'],
      
      // Elementos válidos
      extended_valid_elements: 'img[class|src|alt|title|width|height|style|data-mce-src|data-mce-json]',
    };
</script>

<template>
    <div class="flex justify-end"> 
        <div class="w-full overflow-y-auto prose max-w-none">
            <Editor
                :key="editorKey"
                v-model="editorData"
                api-key="ugvypnkmhxv2hpflimqynev5f9x3crmeszhl1zv8ttbqx48i"
                :init="editorInit"
                :disabled="props.disabled"
            />
            
            <!-- Mensaje de ayuda -->
            <div class="text-xs text-gray-500 mt-1">
                💡 Las imágenes se guardarán automáticamente como base64 (incrustadas en el texto)
            </div>
        </div>
    </div>
</template>

<style scoped>
:deep(.tox-tinymce) {
    border-radius: 0.5rem;
}

:deep(img) {
    max-width: 100%;
    height: auto;
}

.text-xs {
    font-size: 0.75rem;
    line-height: 1rem;
}

.text-gray-500 {
    color: #6b7280;
}

.mt-1 {
    margin-top: 0.25rem;
}
</style>