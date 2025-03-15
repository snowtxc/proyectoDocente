<script setup lang="ts">

interface Props {
    title: string;
    description: string;
}

const emit = defineEmits(['onConfirm']);

const model = defineModel({
  type: Boolean
})

const props = withDefaults(defineProps<Props>(),{});

const loading = ref(false)

</script>

<template>
  <UDashboardModal
    v-model="model"
    :title="props.title"
    :description="props.description"
    icon="i-heroicons-exclamation-circle"
    prevent-close
    :close-button="null"
    :ui="{
      icon: {
        base: 'text-primary'
      } as any,
      footer: {
        base: 'ml-16'
      } as any
    }"
  >
    <template #footer>
      <UButton
        color="primary"
        label="Confirmar"
        :loading="loading"
        @click="emit('onConfirm')"
      />
      <UButton
        color="white"
        label="Cancelar"
        @click="model = false"
      />
    </template>
  </UDashboardModal>
</template>
