<script setup lang="ts">

    import { useErrorStore } from "~/services/errorService/errorService";
    
    const emit = defineEmits(['onSelectImage']);

    const errorService =   useErrorStore();

    const fileRef = ref<HTMLInputElement>()

    function onFileChange(e: Event) {
        const input = e.target as HTMLInputElement;
        const file = input.files[0]; 
        const reader = new FileReader();

        const extension = file.name.split(".").pop();
        if(extension != 'jpg' && extension != 'png' && extension != 'jpeg' && extension != 'gif'){
            errorService.setError("Sólo se permite estos tipos de archivos .jpg, .jpeg, .png, .gif")
            return;
        }

        reader.onload = () => {
            const base64String = reader.result as string;   

            emit('onSelectImage',base64String);
        };
        reader.readAsDataURL(file);
    }

</script>

<template>
    
    <div class="flex items-center justify-center w-full" @click="fileRef.click()">
        <label for="dropzone-file" class="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
            <div class="flex flex-col items-center justify-center pt-5 pb-6">
                <svg class="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                </svg>
                <p class="mb-2 text-sm text-gray-500 dark:text-gray-400"><span class="font-semibold">Click to upload</span> or drag and drop</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
            </div>
        </label>
      </div>
    <input ref="fileRef" type="file" class="hidden" accept=".jpg, .jpeg, .png, .gif" @change="onFileChange">

</template>