<script setup lang="ts">
import type { UserConfig } from '~/types/userConfig';
import { apiUserConfigRoutes } from '~/utils/apiRoutes';
import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum';

const { $apiRest } = useNuxtApp();
const toast = useToast();

const loading = ref(true);
const saving = ref(false);

const state = reactive<UserConfig>({
  antecedentesPorDefectoPlanificacion: false,
  proyeccionesPorDefecto: false
});

const loadConfig = async () => {
  loading.value = true;

  try {
    const config = await $apiRest<UserConfig>(
      apiUserConfigRoutes.getConfig,
      HttpMethodEnum.GET
    );

    state.antecedentesPorDefectoPlanificacion = !!config?.antecedentesPorDefectoPlanificacion;
    state.proyeccionesPorDefecto = !!config?.proyeccionesPorDefecto;
  } catch (error: any) {
    toast.error({
      title: 'Error',
      message: error?.message || 'No se pudo cargar la configuración de planificación.',
      color: 'red'
    });
  } finally {
    loading.value = false;
  }
};

const onSubmit = async () => {
  saving.value = true;

  try {
    await $apiRest(
      apiUserConfigRoutes.updateConfig,
      HttpMethodEnum.POST,
      {
        antecedentesPorDefectoPlanificacion: !!state.antecedentesPorDefectoPlanificacion,
        proyeccionesPorDefecto: !!state.proyeccionesPorDefecto
      }
    );

    toast.success({
      title: 'Configuración actualizada',
      message: 'Se guardaron los parámetros de planificación.',
      color: 'green'
    });
  } catch (error: any) {
    toast.error({
      title: 'Error',
      message: error?.message || 'No se pudieron guardar los parámetros de planificación.',
      color: 'red'
    });
  } finally {
    saving.value = false;
  }
};

await loadConfig();
</script>

<template>
  <div class="space-y-4">
    <UPageCard
      title="Parámetros de Planificación"
      description="Define qué componentes opcionales se activan por defecto al crear una nueva planificación."
      variant="naked"
      orientation="horizontal"
      class="mb-4"
    >
      <UButton
        label="Guardar"
        icon="tabler:device-floppy"
        color="primary"
        :loading="saving"
        :disabled="saving || loading"
        class="w-fit lg:ms-auto"
        @click="onSubmit"
      />
    </UPageCard>

    <UPageCard variant="subtle">
      <div v-if="loading" class="py-6">
        <UProgress animation="carousel" />
      </div>

      <template v-else>
        <div class="flex items-start justify-between gap-4">
          <div>
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
              Incluir Antecedentes por defecto
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Las nuevas planificaciones se crearán con la sección Antecedentes activada.
            </p>
          </div>
          <USwitch v-model="state.antecedentesPorDefectoPlanificacion" />
        </div>

        <USeparator class="my-4" />

        <div class="flex items-start justify-between gap-4">
          <div>
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
              Incluir Proyecciones por defecto
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Las nuevas planificaciones se crearán con la sección Proyecciones activada.
            </p>
          </div>
          <USwitch v-model="state.proyeccionesPorDefecto" />
        </div>
      </template>
    </UPageCard>
  </div>
</template>
