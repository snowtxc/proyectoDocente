<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  modelValue?: string
  readonly?: boolean;
  placeholder?: string
}>()

const emit = defineEmits(['update:modelValue'])

const content = ref(props.modelValue || '')

function update(e: Event) {
  const value = (e.target as HTMLTextAreaElement).value
  content.value = value
  emit('update:modelValue', value)
}
</script>

<template>
  <div class="w-full relative bg-[#fffef8] border border-amber-200 rounded-lg shadow-sm p-6">

    <div class="absolute inset-0 bg-gradient-to-b from-transparent to-amber-50 opacity-40 rounded-lg pointer-events-none" />

    <div class="absolute inset-0 pointer-events-none">
      <div
        v-for="i in 20"
        :key="i"
        class="border-b border-amber-100"
        :style="{ top: `${i * 28}px` }"
      />
    </div>

    <textarea
      class="relative w-full bg-transparent resize-none outline-none text-slate-800 leading-7"
      rows="10"
      :readonly="readonly"
      :value="content"
      @input="update"
      :placeholder="props.placeholder ?? 'Escribí tu nota acá...'"
    />
  </div>
</template>
