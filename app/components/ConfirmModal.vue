<script setup lang="ts">

interface Props {
  modelValue: boolean
    title: string;
    description: string;
}

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'onConfirm'): void
  (e: 'onClose'): void
}>()

const model = defineModel({
  type: Boolean
})

const props = withDefaults(defineProps<Props>(),{});

const loading = ref(false)

</script>

<template>
  <UModal
    v-model:open="props.modelValue"
    :title="props.title"
    :description="props.description"
    icon="i-heroicons-exclamation-circle"
    :close="{ onClick: () => emit('onClose') }"
  >
    <template #footer>
      <UButton
        color="primary"
        label="Confirmar"
        :loading="loading"
        @click="emit('onConfirm')"
      />
      <UButton
        color="neutral"
        label="Cancelar"
        @click="emit('onClose')"
      />
    </template>
  </UModal>
</template>
