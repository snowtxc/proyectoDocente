<script lang="ts" setup>

interface Props {
  title: string;
  description: string;
  modelValue: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(props.modelValue)

watch(
  () => props.modelValue,
  (val) => {
    isOpen.value = val
  }
)

watch(isOpen, (val) => {
  emit('update:modelValue', val)
})
</script>

<template>
  <div class="flex flex-col justify-center px-2">
    <div class="flex items-center gap-2">
      <h3 class="text-lg font-semibold text-gray-800"> {{  props.title }}</h3>
      <div class="flex items-center gap-3">
        <USwitch
          v-model="isOpen"
          :disabled="props.disabled"
        />
      </div>
    </div>
    <p class="text-sm text-gray-500">
      {{  props.description }}
    </p>
  </div>
</template>
