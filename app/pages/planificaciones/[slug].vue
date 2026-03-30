<script setup lang="ts">

import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum';
import type { Planificacion } from '~/types/planificacion';
import type { RemoverTramoDTO, Tramo } from '~/types/tramo';
import type { PlanificacionFecha, SimplePlanificacionFecha } from '~/types/planificacionFecha';
import type { Espacio } from '~/types/espacio';
import type { CompetenciaGeneral } from '~/types/competenciaEspecifica';
import CambiarOrden from '~/components/tramos/CambiarOrden.vue';
import { cloneDeep } from 'lodash';
import { ActionMenuTramo } from '~/utils/enums/actionMenuTramo.enum';
import ConfirmModal from '~/components/ConfirmModal.vue';
import SyncGoogleDrive from '~/components/SyncGoogleDrive.vue';
import { TypeItemSyncGoogleDrive } from '~/utils/enums/typeItemSyncGoogleDrive';
import { apiCompetenciasGeneralesRoutes, apiEspaciosRoutes, apiPlanificacionesFechaRoutes, apiPlanificacionesRoutes, apiTramosRoutes, computed, downloadBlob, navigateTo, ref, useAsyncData, useRoute, useToast, watch } from '#imports';
import ModalTramoDesdeSecuencia from '~/components/tramos/ModalTramoDesdeSecuencia.vue';

const { $apiRest } = useNuxtApp();

const route = useRoute();
const toast = useToast();
const slug = route.params.slug as string;

const pendingSave = ref<boolean>(false);
const isSaving = ref<boolean>(true);
const showModalSyncGDrive = ref<boolean>(false);
const showModalExportConfirm = ref<boolean>(false);
const showModalDeleteConfirm = ref<boolean>(false);

const tramoFormRef = ref(null)

const { data: response, error, refresh } = await useAsyncData('planificacionDetalle', async () => {
  const [planificacion, espacios, competenciasGenerales] = await Promise.all(
    [
      $apiRest<Planificacion>(apiPlanificacionesRoutes.getBySlug(slug), HttpMethodEnum.GET),
      $apiRest<Espacio[]>(apiEspaciosRoutes.listAll, HttpMethodEnum.GET),
      $apiRest<CompetenciaGeneral[]>(apiCompetenciasGeneralesRoutes.listAll, HttpMethodEnum.GET)
    ]);
  return { planificacion, espacios, competenciasGenerales };
});

if (error.value) {
  throw createError({
    status: 404,
    statusText: error.value.message,
    data: {
      myCustomField: true,
    },
  })
}

console.log(response.value.planificacion)

const planificacion = ref<Planificacion>(response.value.planificacion);
const espacios = ref<Espacio[]>(response.value.espacios);
const competenciasGenerales = ref<CompetenciaGeneral[]>(response.value.competenciasGenerales);

const planificacionFechaSelected = ref<PlanificacionFecha>();
const tramoSelected = ref<Tramo>(null);

const tramosStepper = ref(null);

const overlay = useOverlay()
const isTramosPanelCollapsed = ref<boolean>(false);
const pageUi = computed(() => ({
  left: isTramosPanelCollapsed.value ? 'hidden' : '',
  center: isTramosPanelCollapsed.value ? 'lg:col-start-1 lg:col-span-10' : ''
}));

const ordenarFechasPlanificacion = (): SimplePlanificacionFecha[] => {
  const fechas: SimplePlanificacionFecha[] = [...planificacion.value.fechas];
  return fechas.sort((a, b) => {
    if (new Date(a.fecha).getTime() <= new Date(b.fecha).getTime())
      return -1
    return 1;
  })
}

if (planificacion.value) {
  const accesoRegistrado = $apiRest<boolean>(apiPlanificacionesRoutes.registrarAccesso(planificacion.value.id), HttpMethodEnum.POST)
}

if (planificacion.value.fechas.length > 0) {
  const { data: planificacionFecha, error: errorPlanificacionFecha, refresh: refreshPlanificacionFecha } = await useAsyncData('planificacionFechaDetalle', async () => {

    planificacion.value.fechas = ordenarFechasPlanificacion();

    const planificacionFechaId = planificacion.value.fechas[0].id;
    const response = await $apiRest<PlanificacionFecha>(apiPlanificacionesFechaRoutes.find(planificacionFechaId), HttpMethodEnum.GET);
    return response;
  });

  planificacionFechaSelected.value = planificacionFecha.value;

  if (planificacionFecha.value.tramos.length > 0) {
    tramoSelected.value = planificacionFecha.value.tramos[0];
  }
}

const grupo = computed(() => {
  return planificacion.value.grupo;
})

const ciclosGradosIds = computed(() => {
  let result = [];
  grupo.value.grados.map(grado => {
    if (result.findIndex(id => id == grado.ciclo_grado_id) < 0)
      result.push(grado.ciclo_grado_id);
  })
  return result;
})


const fechas = computed<SimplePlanificacionFecha[]>(() => {
  return planificacion.value.fechas;
})

const tramos = computed<Tramo[]>(() => {
  if (!planificacionFechaSelected.value)
    return [];

  return planificacionFechaSelected.value.tramos as Tramo[];
})

const tramoNoSelectedText = computed(() => {
  if (tramos.value.length == 0)
    return 'No tienes ningún tramo creado , prueba agregando uno nuevo';

  return 'No tienes ningún tramo seleccionado';
})


const stepsTramos = computed(() => {
  return [...tramos.value]
    .sort((a, b) => a.orden - b.orden)
    .map((tramo, idx) => {
      return {
        step: tramo.orden,
        tramo,
        title: `Tramo ${tramo.orden}`,
        description: `Tramo ${tramo.orden}`,
        icon: 'tabler:file-text'
      };
    });
})

const loadingCreatingTramo = ref(false);

const currentStepTramo = computed(() => {
  if (tramoSelected.value == null)
    return null;

  return tramos.value.findIndex(x => x.id == tramoSelected.value.id) + 1;
})

const onCreateTramo = async () => {

  const newTramo: Tramo = {
    id: 0,
    created_at: undefined,
    updated_at: undefined,
    planificacion_fecha_id: planificacionFechaSelected.value.id,
    criterios_de_logros: [],
    competencias_generales: [],
    competencias_especificas: [],
    noSeDesarrolla: false,
    motivoNoSeDesarrolla: '',
    actividad: undefined,
    orden: null
  }

  try {

    const tramo = await $apiRest(apiTramosRoutes.create, HttpMethodEnum.POST, newTramo);

    planificacionFechaSelected.value.tramos.push(tramo);
    tramoSelected.value = tramo;

    toast.success({
      title: "Nuevo Tramo",
      message: 'Se ha extendido la planificación a un nuevo tramo.',
      color: "green"
    })

  } catch (message) {
    toast.error({
      title: "Error",
      message: message ? message : 'Error al crear un nuevo tramo',
      color: "red"
    })
  }
}

const showPopoverAddFecha = ref<boolean>(false);

const onAddPlanificacionFechas = async (planificacionFechas: PlanificacionFecha[]) => {

  try {
    const planificaciconFechaid = planificacionFechas[0].id;
    const planificacionFecha = await $apiRest<PlanificacionFecha>(apiPlanificacionesFechaRoutes.find(planificaciconFechaid), HttpMethodEnum.GET);
    planificacionFechaSelected.value = planificacionFecha;

    const fechasActualesPlanificacion = [...planificacion.value.fechas];
    // se agregan las nuevas fechas al array de fecha de la planificacion.
    planificacion.value.fechas = [...fechasActualesPlanificacion, ...planificacionFechas];

    planificacion.value.fechas = ordenarFechasPlanificacion();

    tramoSelected.value = null;

    toast.success({ title: 'Se agregaron nuevos días a la planificación correctamente!', color: 'green', icon: 'i-heroicons-check-circle' })

  } catch (message) {
    toast.error({
      title: "Error",
      message: message ? message : 'Error al obtener el día de la planificacion',
      color: "red"
    })
  }

}

const changeSelectedFecha = (fecha: string) => {
  loadPlanificacionFecha(fecha);
}

const changeFechaDirection = (direction: "prev" | "next") => {

  const currentFechaIdx = fechas.value.findIndex(item => item.id == planificacionFechaSelected.value.id);
  if (currentFechaIdx < 0)
    return;

  let idx = direction == "prev" ? currentFechaIdx - 1 : currentFechaIdx + 1;

  const newCurrentFecha = fechas.value[idx];

  loadPlanificacionFecha(newCurrentFecha.fecha);
}

const onChangePlanificacionFecha = async (planificacionFechaUpdated: PlanificacionFecha) => {

  const idxToReplace = planificacion.value.fechas.findIndex(x => x.fecha == planificacionFechaUpdated.fecha);

  const idx = planificacion.value.fechas.findIndex(x => x.id == planificacionFechaUpdated.id);

  if (idxToReplace >= 0) {
    // Se elimina la fecha si es sustituida.
    planificacion.value.fechas.splice(idxToReplace, 1);
  }

  if (idx >= 0) {
    // La fecha actualizada cambia
    planificacion.value.fechas[idx].fecha = planificacionFechaUpdated.fecha;
  }

  planificacionFechaSelected.value.fecha = planificacionFechaUpdated.fecha;
  planificacion.value.fechas = ordenarFechasPlanificacion();

  loadPlanificacionFecha(planificacionFechaUpdated.fecha);
}

const loadPlanificacionFecha = async (fecha: string): Promise<void> => {
  try {

    const planificacionFecha = fechas.value.find(planificacionFecha => planificacionFecha.fecha == fecha);
    const response = await $apiRest<PlanificacionFecha>(apiPlanificacionesFechaRoutes.find(planificacionFecha.id), HttpMethodEnum.GET);
    planificacionFechaSelected.value = response;

    if (planificacionFechaSelected.value.tramos.length > 0) {
      // SE CARGA EL PRIMER TRAMO
      tramoSelected.value = { ...planificacionFechaSelected.value.tramos[0] };
    } else {
      tramoSelected.value = null;
    }

  } catch (message) {
    toast.error({
      title: "Error",
      message: message ? message : 'Error al obtener el dia de planificacion. Por favor vuelve a intentarlo más tarde.',
      color: "red"
    })
  }
}

const onChangeTramo = (currentStep) => {

  if (currentStep > 0) {
    const idx = currentStep - 1;

    if (currentStep <= tramos.value.length) {
      const tramo = tramos.value[idx];
      tramoSelected.value = { ...tramo };
    }
  }

}

const onSavePlanificacionFecha = async (showMessage: boolean = true) => {
  if (!planificacionFechaSelected.value)
    return;

  isSaving.value = true;

  try {

    const response = await $apiRest<{ status: boolean, message: string }>(apiPlanificacionesFechaRoutes.guardar(planificacionFechaSelected.value.id), HttpMethodEnum.POST, planificacionFechaSelected.value);
    isSaving.value = false;

    if (response && response.status) {

      if (showMessage) {
        toast.success({
          title: "Se ha guardado con exito",
          message: response.message,
          color: "green"
        });
      }
      pendingSave.value = false;
    }


  } catch (message) {
    isSaving.value = false;
    toast.error({
      title: "Error",
      message: message ? message : 'Error al obtener el dia de planificacion. Por favor vuelve a intentarlo más tarde.',
      color: "red"
    })
  }
}

watch(() => tramoSelected.value, () => {

  if (!tramoSelected.value)
    return;

  const idx = tramos.value.findIndex(t => t.id == tramoSelected.value.id);

  if (idx >= 0) {
    tramos.value[idx] = { ...tramoSelected.value };
  }

  // Se activa el pending save.
  pendingSave.value = true;
})



const actionsMenuTramo = ref([
  {
    title: 'Cambiar orden',
    icon: 'tabler:arrows-sort',
    color: null,
    actionName: ActionMenuTramo.CHANGE_ORDER
  },
  {
    title: 'Desde secuencia',
    icon: 'tabler:list-letters',
    color: null,
    actionName: ActionMenuTramo.LOAD_FROM_SECUENCIA
  },
  {
    title: 'Eliminar tramo',
    icon: 'tabler:trash',
    color: 'error',
    actionName: ActionMenuTramo.DELETE
  }
]);



const handleOnActionMenuTramo = async (data: { actionName: ActionMenuTramo, step: number }) => {

  const stepSelected = stepsTramos.value.find(x => x.step == data.step);
  const tramo = stepSelected.tramo;


  if (!stepSelected)
    return;

  let modal;

  switch (data.actionName) {
    case ActionMenuTramo.CHANGE_ORDER:
      modal = overlay.create(CambiarOrden);
      modal.open({
        planificacionId: planificacion.value.id,
        planificacionFechaId: planificacionFechaSelected.value.id,
        tramoSelected: { ...tramo },
        tramos: cloneDeep(tramos.value),
        "onOn-change-order": (tramosUpdated) => {

          console.log(tramosUpdated);
          updateOrdersTramos(tramosUpdated);
          modal.close()
        }
      })
      break;

    case ActionMenuTramo.DELETE:

      modal = overlay.create(ConfirmModal);
      modal.open({
        title: `Remover tramo ${tramo.orden}`,
        description: "AL remover el tramo , es posible que se reordenen todos los tramos de la planificación.",
        "onOnConfirm": async (data) => {

          try {
            modal.close();

            const body: RemoverTramoDTO = {
              planificacion_id: planificacion.value.id,
              planificacion_fecha_id: planificacionFechaSelected.value.id,
              tramo_id: tramo.id,
            }

            const response = await $apiRest<any>(apiTramosRoutes.removerTramo, HttpMethodEnum.POST, body);

            if (response.status) {

              const { tramosUpdated } = response;
              const idx = planificacionFechaSelected.value.tramos.findIndex(t => t.id == tramo.id);

              if (idx >= 0)
                planificacionFechaSelected.value.tramos.splice(idx, 1);

              tramoSelected.value = null;

              updateOrdersTramos(tramosUpdated);

              toast.success({
                title: "Tramo removido con exito",
                message: "Tramo removido",
                color: "green"
              })
            }
          } catch (message) {
            toast.error({
              title: "Error",
              message: message ? message : 'Error al intentar remover el tramo',
              color: "red"
            })
          }

        },
      })
      break;

    case ActionMenuTramo.LOAD_FROM_SECUENCIA:

      modal = overlay.create(ModalTramoDesdeSecuencia);

      modal.open({
        grupo: grupo.value,
        planificacion: planificacion.value,
        planificacionFecha: planificacionFechaSelected.value,
        tramo,
        "onLoadTramo": (tramo: Tramo) => {
          modal.close();
          onUpdateTramo(tramo)
        },

        "onOnClose": () => {
          modal.close();
        }
      })
      break;
  }
}

/// Actualizar el orden de tramos
// Dada una lista de tramos actualizados, se actualizan los ordenes en el array de tramos general.
const updateOrdersTramos = (tramosUpdated: Tramo[]) => {
  tramosUpdated.forEach(tramoUpdated => {
    const idx = planificacionFechaSelected.value.tramos.findIndex(x => x.id === tramoUpdated.id);

    if (idx >= 0) {
      planificacionFechaSelected.value.tramos[idx].orden = tramoUpdated.orden;
    }

    if (tramoSelected.value?.id === tramoUpdated.id && tramoSelected.value?.orden !== tramoUpdated.orden) {
      tramoSelected.value.orden = tramoUpdated.orden;
    }
  });

  planificacionFechaSelected.value.tramos = planificacionFechaSelected.value.tramos.sort((a, b) => a.orden - b.orden);
};


const onExport = async () => {

  if (!planificacion.value)
    return;

  try {

    showModalExportConfirm.value = false;

    const responseFile = await $apiRest(apiPlanificacionesRoutes.exportar(planificacion.value.id), HttpMethodEnum.POST, { responseType: 'blob' });

    if (responseFile) {
      const fileName = `${planificacion.value.slug}.pdf`;
      downloadBlob(responseFile, fileName);

      toast.success({
        title: "Planificacion exportada",
        message: 'Se ha exportado la planificación con exito.',
        color: "green"
      })
    }

  } catch (message) {
    toast.error({
      title: "Error",
      message: message ? message : 'Error al intentar exportar la planificacion',
      color: "red"
    })
  }
}

const syncGoogleDrive = async () => {

  showModalSyncGDrive.value = false;

  // Si la planificacion se encuentra pendiente de guardar, se manda a aplicar los cambios.
  if (pendingSave.value)
    await onSavePlanificacionFecha(false)

  const modal = overlay.create(SyncGoogleDrive);
  modal.open(
    {
      key: `sync-${Date.now()}`,
      id: planificacion.value.id,
      type: TypeItemSyncGoogleDrive.PLANIFICACION
    });
}


const onDelete = async (): Promise<void> => {

  if (!planificacion.value)
    return;

  showModalDeleteConfirm.value = false;

  try {

    const planificacionDeleted = await $apiRest(apiPlanificacionesRoutes.delete(planificacion.value.id), HttpMethodEnum.DELETE);

    if (planificacionDeleted) {

      toast.success({
        title: `Planificación ${planificacionDeleted.nombre} eliminada`,
        message: `Se ha eliminado la planificación ${planificacionDeleted.nombre} con exito.`,
        color: "green"
      });

      navigateTo('/planificaciones');
    }

  } catch (message) {
    toast.error({
      title: "Error",
      message: message ? message : 'Error al intentar eliminar la planificación.',
      color: "red"
    })
  }
}

const handleOnDeleteFecha = (planificacionFecha) => {
  const idx = fechas.value.findIndex(f => f.id == planificacionFecha.id);

  if (idx < 0)
    return;

  const firstDate = idx == 0;

  let nextIdx = null;

  if (fechas.value.length == 1) {
    nextIdx = null;
  } else if (firstDate) {
    nextIdx = 0;
  } else if (fechas.value.length > 1) {
    nextIdx = idx - 1;
  }

  fechas.value.splice(idx, 1);

  if (nextIdx == null) {
    planificacionFechaSelected.value = null;
  } else {
    loadPlanificacionFecha(fechas.value[nextIdx].fecha);
  }

}

const onUpdateTramo = (tramo: Tramo) => {

  const idx = planificacionFechaSelected.value.tramos.findIndex(t => t.id == tramo.id);

  if (idx >= 0) {

    tramoSelected.value = { ...tramo };
    planificacionFechaSelected.value.tramos[idx] = { ...tramo };

    setTimeout(() => {
      tramoFormRef.value.loadForm();
    }, 600)
  }

}

</script>

<template>
  <UPage :ui="pageUi">
    <template #left>
      <UDashboardPanel id="grupo" side="left">
        <template #header>
          <UDashboardNavbar :title="grupo.nombre">
            <template #right>
              <BadgeGrado
                v-for="grado in planificacion.grupo.grados"
                :key="grado.id"
                :grado="grado"
              />
              <UButton
                :icon="isTramosPanelCollapsed ? 'tabler:layout-sidebar-left-expand' : 'tabler:layout-sidebar-left-collapse'"
                color="neutral"
                variant="ghost"
                class="mr-2"
                @click="isTramosPanelCollapsed = !isTramosPanelCollapsed"
              />
            </template>
          </UDashboardNavbar>
        </template>

        <template #body>
          <div v-if="planificacionFechaSelected" class="overflow-y-auto mb-8 min-h-full">
            <Stepper
              :showButtonAddStep="true"
              titleButtonAddStep="Agregar nuevo tramo"
              orientation="vertical"
              descriptionButtonAddStep="Extender un nuevo tramo a la planificación"
              :currentStep="currentStepTramo"
              :steps="stepsTramos"
              @on:add-step="onCreateTramo"
              :linear="false"
              ref="tramosStepper"
              @on:change-step="onChangeTramo"
              :actionsMenu="actionsMenuTramo"
              @on:action-menu="handleOnActionMenuTramo"
            />
          </div>
        </template>
      </UDashboardPanel>
    </template>

    <template #default>
      <UDashboardPanel>
        <template #header>
          <UDashboardNavbar>
            <template #toggle>
              <UDashboardNavbarToggle icon="i-heroicons-x-mark" />
              <UDivider orientation="vertical" class="lg:hidden" />
            </template>

            <template #left>
              <div class="flex items-center">
                <UTooltip :text="isTramosPanelCollapsed ? 'Mostrar tramos' : 'Ocultar tramos'">
                  <UButton
                    :icon="isTramosPanelCollapsed ? 'tabler:layout-sidebar-left-expand' : 'tabler:layout-sidebar-left-collapse'"
                    color="neutral"
                    variant="ghost"
                    class="mr-2"
                    @click="isTramosPanelCollapsed = !isTramosPanelCollapsed"
                  />
                </UTooltip>

                <UDashboardNavbar :title="planificacion.nombre" />

                <PlanificacionesPopoverAddPlanificacionFecha
                  :planificacionId="planificacion.id"
                  @on:add="onAddPlanificacionFechas"
                  :showSmallBtn="true"
                  :fechasDisabled="planificacion.fechas.map(pf => pf.fecha)"
                />

                <PlanificacionesPopoverChangePlanificacionFecha
                  :planificacionId="planificacion.id"
                  :planificacionFecha="planificacionFechaSelected"
                  :fechasYaPlanificadas="planificacion.fechas.map(pf => pf.fecha)"
                  @on:change="onChangePlanificacionFecha"
                />
              </div>
            </template>

            <template #right>
              <UTooltip text="Guardar planificación">
                <UButton
                  icon="tabler:device-floppy"
                  color="neutral"
                  variant="ghost"
                  @click="onSavePlanificacionFecha()"
                >
                  <template #leading>
                    <div class="flex flex-col">
                      <div v-if="pendingSave" class="w-2 h-2 rounded-full bg-primary absolute float-right" />
                      <UIcon name="tabler:device-floppy" class="size-5" />
                    </div>
                  </template>
                </UButton>
              </UTooltip>

              <UTooltip text="Exportar a PDF">
                <UButton
                  icon="tabler:pdf"
                  color="neutral"
                  variant="ghost"
                  @click="showModalExportConfirm = true"
                />
              </UTooltip>

              <UTooltip text="Exportar planificación a Google Drive">
                <UButton
                  icon="tabler:brand-google-drive"
                  color="neutral"
                  variant="ghost"
                  @click="showModalSyncGDrive = true"
                />
              </UTooltip>

              <UTooltip text="Eliminar">
                <UButton
                  icon="tabler:trash"
                  color="neutral"
                  variant="ghost"
                  @click="showModalDeleteConfirm = true"
                />
              </UTooltip>

              <UDivider orientation="vertical" class="mx-1.5" />
            </template>
          </UDashboardNavbar>
        </template>

        <template #body>
          <div v-if="planificacionFechaSelected" class="p-2 overflow-y-auto">
            <TramosTramoForm
              v-if="tramoSelected"
              ref="tramoFormRef"
              v-model="tramoSelected"
              :tramo="tramoSelected"
              :espacios="espacios"
              :gradosIds="grupo.grados.map(g => g.id)"
              :ciclosGradosIds="ciclosGradosIds"
              :competenciasGenerales="competenciasGenerales"
              :nroTramo="currentStepTramo"
              :planificacion="planificacion"
            />
            <div v-else class="flex flex-col justify-center items-center h-screen">
              <UIcon name="tabler:file-text" size="60px" />
              <h1 class="mt-1">{{ tramoNoSelectedText }}</h1>
            </div>
          </div>
          <div v-else class="flex flex-col justify-center items-center h-screen">
            <UIcon name="tabler:butterfly-filled" size="60px" />
            <h1 class="mt-1">No tienes ningún día planificado aún, prueba creando un nuevo día</h1>
            <PlanificacionesPopoverAddPlanificacionFecha
              :show="showPopoverAddFecha"
              :planificacionId="planificacion.id"
              @on:add="onAddPlanificacionFechas"
              :fechasDisabled="planificacion.fechas.map(pf => pf.fecha)"
            />
          </div>
        </template>
      </UDashboardPanel>
    </template>
  </UPage>


  <ConfirmModal
    v-show="showModalExportConfirm"
    v-model="showModalExportConfirm"
    title="Descargar planificación"
    description="¿Querés descargar la planificación actual como un archivo? Esto guardará una copia en tu computadora."
    @onConfirm="onExport"
    @onClose="showModalExportConfirm = false"
  />

  <ConfirmModal
    v-if="showModalSyncGDrive"
    v-model="showModalSyncGDrive"
    title="Sincronizar planificación con Google Drive"
    description="¿Deseás sincronizar la planificación actual con tu cuenta de Google Drive? Esto guardará una copia actualizada en la nube."
    @onConfirm="syncGoogleDrive"
    @onClose="showModalSyncGDrive = false"
  />

  <ConfirmModal
    v-model="showModalDeleteConfirm"
    title="Eliminar planificación"
    description="¿Deseás eliminar la planificación actual? Esta acción no se puede deshacer."
    @onConfirm="onDelete"
    @onClose="showModalDeleteConfirm = false"
  />

  <PlanificacionDia
    v-if="planificacionFechaSelected"
    :planficacionId="planificacion.id"
    :selectedDay="planificacionFechaSelected"
    :enableDates="planificacion.fechas.map(pf => pf.fecha)"
    @changeDate="changeSelectedFecha"
    @changeDirection="changeFechaDirection"
    @onDelete="handleOnDeleteFecha(planificacionFechaSelected)"
  />
</template>