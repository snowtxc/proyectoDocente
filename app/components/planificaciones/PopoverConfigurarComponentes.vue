<script setup lang="ts">
interface Props {
  llevaAntecedentes?: boolean;
  llevaProyecciones?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  llevaAntecedentes: false,
  llevaProyecciones: false
});

const emit = defineEmits([
  'update:llevaAntecedentes',
  'update:llevaProyecciones'
]);

const show = ref(false);
</script>

<template>
  <UPopover v-model:open="show">
    <UTooltip text="Configurar componentes">
      <UButton
        icon="tabler:adjustments-horizontal"
        color="neutral"
        variant="ghost"
      />
    </UTooltip>

    <template #content>
      <div class="w-[320px] p-4 space-y-4">
        <UDashboardSection
          title="Configurar componentes"
          description="Activa los componentes opcionales que quieras mostrar en esta planificación."
        />

        <div class="space-y-3">
          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="font-medium text-sm text-gray-900 dark:text-white">
                Incluir Antecedentes
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Muestra una sección editable de antecedentes.
              </p>
            </div>
            <USwitch
              :model-value="props.llevaAntecedentes"
              @update:model-value="emit('update:llevaAntecedentes', $event)"
            />
          </div>

          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="font-medium text-sm text-gray-900 dark:text-white">
                Incluir Proyecciones
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Muestra una sección editable de proyecciones.
              </p>
            </div>
            <USwitch
              :model-value="props.llevaProyecciones"
              @update:model-value="emit('update:llevaProyecciones', $event)"
            />
          </div>
        </div>
      </div>
    </template>
  </UPopover>
</template>
