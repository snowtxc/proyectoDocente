<script setup>


const editor = useEditor({
  content: "<p>I'm running Tiptap with Vue.js. 🎉</p>",
  extensions: [TiptapStarterKit],
});

onBeforeUnmount(() => {
  unref(editor).destroy();
});
</script>


<template>
    <div class="w-full">
        <TiptapFloatingMenu :editor="editor" :tippy-options="{ duration: 100 }" v-if="editor">
          <div class="floating-menu">
            <button @click="editor.chain().focus().toggleHeading({ level: 1 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }">
              H1
            </button>
            <button @click="editor.chain().focus().toggleHeading({ level: 2 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }">
              H2
            </button>
            <button @click="editor.chain().focus().toggleBulletList().run()" :class="{ 'is-active': editor.isActive('bulletList') }">
              Bullet list
            </button>
          </div>
        </TiptapFloatingMenu>
        <TiptapEditorContent :editor="editor" />
    </div>
  </template>
  
