<script setup lang="ts">
  const content = ref("<p>hola</p>");

  const handleChangeContent = (fields: {
        contentHtml : string,
        contentJson : string
    })=>{

      content.value = fields.contentHtml;
  }
  
</script>

<template>  
    <div class="w-full">
      <EditorSlideOver 
      v-model="content"
      @on:update="handleChangeContent"
      title="Plan de Aprendizaje"></EditorSlideOver>

    </div>
</template> 