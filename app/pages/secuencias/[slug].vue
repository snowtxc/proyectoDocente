<script setup lang="ts">

import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum';
import type { Espacio } from '~/types/espacio';
import type { CompetenciaEspecifica, CompetenciaEspecificaFilter, CompetenciaGeneral, CompetenciaGeneralItemSelector } from '~/types/competenciaEspecifica';
import { cloneDeep, over } from 'lodash';
import { ActionMenuTramo } from '~/utils/enums/actionMenuTramo.enum';
import ConfirmModal from '~/components/ConfirmModal.vue';
import type { Secuencia } from '~/types/secuencia';
import type { ActividadSecuencia, RemoverActividadSecuenciaDTO } from '~/types/actividadSecuencia';
import type { UnidadCurricular } from '~/types/unidadCurricular';
import SelectorContenido from '~/components/contenido/SelectorContenido.vue';
import type { Contenido, ContenidoFilter } from '~/types/contenido';
import type { CriterioDeLogro, CriterioDeLogroFilter } from '~/types/criterioDeLogro';
import type { ListRequest } from '~/types/list-request';
import { EspacioOUnidadOptionEnum } from '~/utils/enums/EspacioOUnidadOption.enum';

import ActividadSecuenciaForm from '~/components/actividad-secuencias/ActividadSecuenciaForm.vue';

import SelectorCompetenciaEspecifica from '~/components/competencia-especifica/SelectorCompetenciaEspecifica.vue';
import SelectorCriteriosDeLogros from '~/components/criterio-de-logro/SelectorCriteriosDeLogros.vue';
import BaseSwitch from '~/components/BaseSwitch.vue';
import { ActionMenuActividadSecuencia } from '~/utils/enums/actionMenuActividadSecuencia.enum';
import CambiarOrdenActividadSecuencia from '~/components/actividad-secuencias/CambiarOrdenActividadSecuencia.vue';
import { TypeItemSyncGoogleDrive } from '~/utils/enums/typeItemSyncGoogleDrive';
import SelectorCompetenciaGeneral from "~/components/competencia-general/SelectorCompetenciaGeneral.vue";

import SyncGoogleDrive from '~/components/SyncGoogleDrive.vue'
import type { CicloGrado } from '~/types/cicloGrado';

const { $apiRest } = useNuxtApp();

const route = useRoute();
const toast = useToast();
const slug = route.params.slug as string;

const pendingSave = ref<boolean>(false);
const isSaving = ref<boolean>(true);
const showModalSyncGDrive = ref<boolean>(false);
const showModalExportConfirm = ref<boolean>(false);
const showModalDeleteConfirm = ref<boolean>(false);
const isTramosPanelCollapsed = ref<boolean>(false);
const pageUi = computed(() => ({
  left: isTramosPanelCollapsed.value ? 'hidden' : '',
  center: isTramosPanelCollapsed.value ? 'lg:col-start-1 lg:col-span-10' : ''
}));
const overlay = useOverlay()


const loadingMoreData = ref(false);

const { data: response, error, refresh } = await useAsyncData('secuenciaDetalle', async () => {
  const [secuencia, espacios, competenciasGenerales] = await Promise.all(
    [
      $apiRest<Secuencia>(apiSecuenciasRoutes.getBySlug(slug), HttpMethodEnum.GET),
      $apiRest<Espacio[]>(apiEspaciosRoutes.listAll, HttpMethodEnum.GET),
      $apiRest<CompetenciaGeneral[]>(apiCompetenciasGeneralesRoutes.listAll, HttpMethodEnum.GET)
    ]);
  return { secuencia, espacios, competenciasGenerales };
});

const cicloGradosSelected = computed<CicloGrado[]>(()=>{
    return secuencia.value.grupo.grados.map(g => g.ciclo_grado);
})


if (error.value) {
  throw createError({
    status: 404,
    statusText: error.value.message,
    data: {
      myCustomField: true,
    },
  })
}

const loadContenidosCriteriosDeLogrosYCompetencias = async (unidadCurricularId: number) => {

  loadingMoreData.value = true;

  const gradosIds = grupo.value.grados.map(g => g.id);

  const filtersContenidos: ContenidoFilter = {
    grados_ids: gradosIds,
    unidad_curricular_id: unidadCurricularId
  }

  const filtersCriteriosDeLogros: CriterioDeLogroFilter = {
    grados_ids: gradosIds,
    unidad_curricular_id: unidadCurricularId
  }

  const filtersCompetenciasEspecificas: CompetenciaEspecificaFilter = {
    ciclos_grados_ids: ciclosGradosIds.value,
    unidad_curricular_id: unidadCurricularId
  }

  const listReqContenidos: ListRequest = {
    page: -1,
    rowsPerPage: 1,
    filters: filtersContenidos
  };

  const listReqCriteriosDeLogros: ListRequest = {
    page: -1,
    rowsPerPage: 1,
    filters: filtersCriteriosDeLogros
  };

  const listReqCompetenciasEspecificas: ListRequest = {
    page: -1,
    rowsPerPage: 1,
    filters: filtersCompetenciasEspecificas
  };

  try {
    const [contenidosResponse, criteriosDeLogrosResponse, competenciasEspecificasResponse] = await Promise.all([
      $apiRest(apiContenidosRoutes.getPaginate, HttpMethodEnum.POST, listReqContenidos),
      $apiRest(apiCriteriosDeLogrosRoutes.getPaginate, HttpMethodEnum.POST, listReqCriteriosDeLogros),
      $apiRest(apiCompetenciasEspecificasRoutes.getPaginate, HttpMethodEnum.POST, listReqCompetenciasEspecificas)
    ]);

    contenidos.value = contenidosResponse.list;
    criteriosDeLogros.value = criteriosDeLogrosResponse.list;
    competenciasEspecificas.value = competenciasEspecificasResponse.list;

    loadingMoreData.value = false;

  } catch (message) {
    toast.error({
      title: "Error",
      message: message ? message : 'Error al obtener los contenidos ,criterios de logros y competencías especificas para el tramo.',
      color: "red"
    })
    loadingMoreData.value = false;
  }
}

const secuencia = ref<Secuencia>(response.value.secuencia);
const espacios = ref<Espacio[]>(response.value.espacios);
const contenidos = ref<Contenido[]>([]);

const competenciasGenerales = ref<CompetenciaGeneral[]>(response.value.competenciasGenerales);
const competenciasEspecificas = ref<CompetenciaEspecifica[]>([]);
const criteriosDeLogros = ref<CriterioDeLogro[]>([]);

const showModalChangeEspacioOrUnidadCurricular = ref<boolean>(false);
const titleChangeEspacioOrUnidadCurricular = ref<string>("");
const descriptionChangeEspacioOrUnidadCurricular = ref<string>("");

const espacioToChange = ref<Espacio>(null);
const unidadCurricularToChange = ref<UnidadCurricular>(null);
const optionToChange = ref<EspacioOUnidadOptionEnum>(null);

const actividadSecuenciaSelected = ref<any>(null);

// SE CARGA POR DEFECTO LA PRIMER ACTIVIDAD DE LA SECUENCIA
if (secuencia.value.actividades_secuencia.length > 0) {
  actividadSecuenciaSelected.value = secuencia.value.actividades_secuencia[0];
}

const grupo = computed(() => {
  return secuencia.value.grupo;
})

const ciclosGradosIds = computed(() => {
  let result = [];
  grupo.value.grados.map(grado => {
    if (result.findIndex(id => id == grado.ciclo_grado_id) < 0)
      result.push(grado.ciclo_grado_id);
  })
  return result;
})

const actividadesSecuencia = computed<ActividadSecuencia[]>(() => {
  return secuencia.value.actividades_secuencia;
})

const actividadNoSelectedText = computed(() => {
  if (actividadesSecuencia.value.length == 0)
    return 'No tienes ninguna actividad creada , prueba agregano una nueva';

  return 'No tienes ninguna actividad seleccionada';
})

const stepsActividades = computed(() => {
  return actividadesSecuencia.value.map((actividad, idx) => {
    const step = idx + 1;
    return {
      step,
      actividad,
      title: `Actividad ${step}`,
      description: `Actividad ${step}`,
      icon: 'tabler:file-text'
    }
  })
})

const loadingCreatingActividad = ref(false);

const currentStepActividad = computed(() => {
  if (actividadSecuenciaSelected.value == null)
    return null;

  return actividadesSecuencia.value.findIndex(x => x.id == actividadSecuenciaSelected.value.id) + 1;
})


const competenciasGeneralesSelected = computed<CompetenciaGeneralItemSelector[]>(() => {
  return secuencia.value.competencias_generales.map(cg => {
    // Si no hay competencias específicas, marcar todas como recomendadas
    if (secuencia.value.competencias_especificas.length === 0) {
      return {
        ...cg,
        recomendado: true,
        competenciasEspecificasRelacionadas: [],
        nroRelaciones: 0,
        checked: false
      };
    }

    // Marcar como recomendado si alguna competencia específica pertenece a esta competencia general
    const recomendado = secuencia.value.competencias_especificas.some(ce =>
      ce.competencias_generales.some(cgItem => cgItem.id === cg.id)
    );

    // Obtener competencias específicas relacionadas con esta competencia general
    const competenciasEspecificasRelacionadas = competenciasEspecificas.value.filter(x =>
      x.competencias_generales.some(cgItem => cgItem.id === cg.id)
    );

    return {
      ...cg,
      recomendado,
      competenciasEspecificasRelacionadas,
      nroRelaciones: competenciasEspecificasRelacionadas.length,
      checked: false
    };
  });
});



onBeforeMount(() => {
  if (secuencia.value.unidad_curricular) {
    loadContenidosCriteriosDeLogrosYCompetencias(secuencia.value.unidad_curricular.id)
  }
})

const onCreateActividad = async () => {

  const newActividadSecuencia: ActividadSecuencia = {
    id: 0,
    secuencia_id: secuencia.value.id,
    secuencia: secuencia.value,
    created_at: undefined,
    updated_at: undefined,
    metodologia: ''
  }

  try {

    const actividadSecuencia = await $apiRest<ActividadSecuencia>(apiActividadSecuenciaRoutes.create, HttpMethodEnum.POST, newActividadSecuencia);

    actividadesSecuencia.value.push(actividadSecuencia);


    actividadSecuenciaSelected.value = actividadSecuencia;

    toast.success({
      title: "Nueva actividad",
      message: 'Se ha extendido la secuencia a una nueva actividad.',
      color: "green"
    })

  } catch (message) {
    toast.error({
      title: "Error",
      message: message ? message : 'Error al crear una nueva actividad a la secuencia.',
      color: "red"
    })
  }
}


const onChangeActividad = (currentStep) => {

  if (currentStep > 0) {
    const idx = currentStep - 1;

    if (currentStep <= actividadesSecuencia.value.length) {
      const actividadSecuencia = actividadesSecuencia.value[idx];
      actividadSecuenciaSelected.value = { ...actividadSecuencia };
    }
  }

}

const onSaveSecuencia = async (showMessage: boolean = true) => {

  isSaving.value = true;

  try {
    const response = await $apiRest<{ status: boolean, message: string }>(apiSecuenciasRoutes.guardar(secuencia.value.id), HttpMethodEnum.POST, secuencia.value);
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
      message: message ? message : 'Error al guardar la secuencia. Por favor vuelve a intentarlo más tarde.',
      color: "red"
    })
  }
}

watch(() => secuencia.value.contenido, () => {
  secuencia.value.contenido_id = secuencia.value.contenido?.id
});

// ESCUCHA , si cambia algun dato de la secuencia pasa a reflejarse pendiente de guardar.
watch(
  [secuencia.value],
  () => {
    pendingSave.value = true;
  }
)

watch(() => secuencia.value.detallaRecursos, () => {
  if (secuencia.value.detallaRecursos) {
    secuencia.value.recursos = null;
  }
})

watch(() => secuencia.value.detallaMetodologia, () => {
  if (secuencia.value.detallaMetodologia) {
    secuencia.value.metodologia = null;
  }
})

watch(() => secuencia.value.detallaDuracion, () => {
  if (secuencia.value.detallaDuracion) {
    secuencia.value.duracion = null;
  }
})

watch(() => secuencia.value.detallaEvaluacion, () => {
  if (secuencia.value.detallaEvaluacion) {
    secuencia.value.evaluacion = null;
  }
})

watch(() => actividadSecuenciaSelected.value, () => {

  if (!actividadSecuenciaSelected.value)
    return;

  const idx = actividadesSecuencia.value.findIndex(t => t.id == actividadSecuenciaSelected.value.id);

  if (idx >= 0) {
    actividadesSecuencia.value[idx] = { ...actividadSecuenciaSelected.value };
  }

  // Se activa el pending save.
  pendingSave.value = true;
})


const actionsMenuActividad = ref([
  {
    title: 'Cambiar orden',
    icon: 'tabler:arrows-sort',
    actionName: ActionMenuTramo.CHANGE_ORDER
  },
  {
    title: 'Eliminar actividad',
    icon: 'tabler:trash',
    actionName: ActionMenuTramo.DELETE
  }
]);



const handleOnActionMenuActividad = async (data: { actionName: ActionMenuActividadSecuencia, step: number }) => {

  const stepSelected = stepsActividades.value.find(x => x.step == data.step);
  const actividadSelected = stepSelected.actividad;

  if (!stepSelected)
    return;

  let modal;
  switch (data.actionName) {

    case ActionMenuActividadSecuencia.CHANGE_ORDER:
      modal = overlay.create(CambiarOrdenActividadSecuencia);
      modal.open({
        secuenciaId: secuencia.value.id,
        actividadSecuenciaSelected: { ...actividadSelected },
        actividadesSecuencias: cloneDeep(actividadesSecuencia.value),
        "onOn-change-order": (actividadesSecuencias) => {
          updateOrdersActividades(actividadesSecuencias);
          modal.close()
        },

        "onOnClose": () => {
          modal.close();
        }

      })
      break;

    case ActionMenuActividadSecuencia.DELETE:
      modal = overlay.create(ConfirmModal)
      modal.open({
        title: `Remover actividad ${actividadSecuenciaSelected.value.orden}`,
        description: "Al remover la actividad , es posible que se reordenen todas las actividades de lasecuencia.",
        "onOnConfirm": async (data) => {

          try {
            modal.close();

            const body: RemoverActividadSecuenciaDTO = {
              secuencia_id: secuencia.value.id,
              actividad_secuencia_id: actividadSelected.id,
            }

            const response = await $apiRest<any>(apiActividadSecuenciaRoutes.removerActividad, HttpMethodEnum.POST, body);

            if (response.status) {

              const { actividadesSecuenciaUpdated } = response;

              const idx = secuencia.value.actividades_secuencia.findIndex(as => as.id == actividadSelected.id);

              if (idx >= 0)
                secuencia.value.actividades_secuencia.splice(idx, 1);

              actividadSecuenciaSelected.value = null;

              updateOrdersActividades(actividadesSecuenciaUpdated);

              toast.success({
                title: "Actividad removida con exito",
                message: "Actividad removida",
                color: "green"
              })
            }
          } catch (message) {
            toast.error({
              title: "Error",
              message: message ? message : 'Error al intentar remover la actividad',
              color: "red"
            })
          }

        },

        "onOnClose": () => {
          modal.close();
        }
      })
      break;
  }
}

//  Actualizar el orden de actividades
//  Dado una lista de actividades actualizados sus ordenes se actualiza los ordenes en el array de actividades general.
const updateOrdersActividades = (actividadesUpdated: ActividadSecuencia[]) => {

  actividadesUpdated.map(actividadUpdated => {
    const idx = secuencia.value.actividades_secuencia.findIndex(x => x.id == actividadUpdated.id);

    if (idx >= 0) {
      secuencia.value.actividades_secuencia[idx].orden = actividadUpdated.orden;
    }


    if (actividadSecuenciaSelected.value?.id == actividadUpdated?.id && actividadSecuenciaSelected.value?.orden != actividadUpdated.orden)
      actividadSecuenciaSelected.value.orden = actividadUpdated.orden;
  })

  secuencia.value.actividades_secuencia = secuencia.value.actividades_secuencia.sort((a, b) => a.orden - b.orden);
}


const onExport = async () => {

  if (!secuencia.value)
    return;

  showModalExportConfirm.value = false;

  try {

    const responseFile = await $apiRest(apiSecuenciasRoutes.exportar(secuencia.value.id), HttpMethodEnum.POST, { responseType: 'blob' });

    if (responseFile) {
      const fileName = `${secuencia.value.slug}.pdf`;
      downloadBlob(responseFile, fileName);

      toast.success({
        title: "Secuencia exportada",
        message: 'Se ha exportado la secuencia con exito.',
        color: "green"
      })
    }

  } catch (message) {
    toast.error({
      title: "Error",
      message: message ? message : 'Error al crear un nuevo tramo',
      color: "red"
    })
  }
}

const syncGoogleDrive = async () => {

  showModalSyncGDrive.value = false;

  // Si la planificacion se encuentra pendiente de guardar, se manda a aplicar los cambios.
  if (pendingSave.value)
    await onSaveSecuencia(false)

  const modal = overlay.create(SyncGoogleDrive);
  modal.open({
    // Key para evitar cache del componente,esto fuerza a Vue (y a Nuxt UI) a 
    // destruir el componente anterior y crear uno nuevo.
    key: `sync-${Date.now()}`,
    id: secuencia.value.id,
    type: TypeItemSyncGoogleDrive.SECUENCIA,
  });
}

const onChangeEspacio = (espacio: Espacio) => {

  if(secuencia.value.espacio && secuencia.value.unidad_curricular){

    espacioToChange.value =  { ... espacio } ;
    optionToChange.value = EspacioOUnidadOptionEnum.ESPACIO;
    titleChangeEspacioOrUnidadCurricular.value = "Cambiar de espacio."
    descriptionChangeEspacioOrUnidadCurricular.value = "¿Segur@ deseas cambiar de unidad curricular?. En caso de confirmar perderas los datos de la secuencia(contenido), incluido los datos de cada actividad(criterios de logros, competencias especificas meta de aprendizaje y plan de aprendizaje)"
    showModalChangeEspacioOrUnidadCurricular.value = true;

    return;
  }

  secuencia.value.espacio_id = espacio.id;
  secuencia.value.espacio = espacio;

  secuencia.value.unidad_curricular = null;
  secuencia.value.unidad_curricular_id = null;
}

const unidadesCurriculares = computed<UnidadCurricular[]>(() => {
  return secuencia.value?.espacio?.unidades_curriculares;
})

const onChangeUnidadCurricular = (unidadCurricular: UnidadCurricular) => {

  if (secuencia.value.unidad_curricular) {
    unidadCurricularToChange.value = unidadCurricular;
    optionToChange.value = EspacioOUnidadOptionEnum.UNIDAD_CURRICULAR;
    titleChangeEspacioOrUnidadCurricular.value = "Cambiar de unidad curricular."
    descriptionChangeEspacioOrUnidadCurricular.value = "¿Segur@ deseas cambiar de unidad curricular?. En caso de confirmar perderas los datos de la secuencia(contenido), incluido los datos de cada actividad(criterios de logros, competencias especificas meta de aprendizaje y plan de aprendizaje)"
    showModalChangeEspacioOrUnidadCurricular.value = true;
    return;
  }

  secuencia.value.unidad_curricular = unidadCurricular;
  secuencia.value.unidad_curricular_id = unidadCurricular.id;

  loadContenidosCriteriosDeLogrosYCompetencias(secuencia.value.unidad_curricular?.id);
}

const onConfirmChangeEspacioOUnidad = () => {

  showModalChangeEspacioOrUnidadCurricular.value = false;

  if (optionToChange.value === null)
    return;

  switch (optionToChange.value) {
    case EspacioOUnidadOptionEnum.ESPACIO:
      secuencia.value.espacio =  { ... espacioToChange.value };
      secuencia.value.espacio_id = espacioToChange.value.id;
      secuencia.value.unidad_curricular_id = null;
      secuencia.value.unidad_curricular = null;
      break;
    case EspacioOUnidadOptionEnum.UNIDAD_CURRICULAR:
      secuencia.value.unidad_curricular = { ...unidadCurricularToChange.value}
      secuencia.value.unidad_curricular_id =  unidadCurricularToChange.value.id;
      break;
  }

  secuencia.value.contenido = null;
  secuencia.value.contenido_id = null;
  contenidos.value = [];
  criteriosDeLogros.value = [];

  if (optionToChange.value == EspacioOUnidadOptionEnum.ESPACIO) {
    secuencia.value.unidad_curricular = null;
  }

  if (optionToChange.value == EspacioOUnidadOptionEnum.UNIDAD_CURRICULAR && secuencia.value.unidad_curricular) {
    loadContenidosCriteriosDeLogrosYCompetencias(secuencia.value.unidad_curricular?.id)
  }
}

const onDelete = async (): Promise<void> => {

  if (!secuencia.value)
    return;

  showModalDeleteConfirm.value = false;

  try {

    const secuenciaDeleted = await $apiRest(apiSecuenciasRoutes.delete(secuencia.value.id), HttpMethodEnum.DELETE);

    if (secuenciaDeleted) {

      toast.success({
        title: `Secuencia ${secuenciaDeleted.nombre} eliminada`,
        message: `Se ha eliminado la secuencia ${secuenciaDeleted.nombre} con exito.`,
        color: "green"
      })

      navigateTo('/secuencias');
    }

  } catch (message) {
    toast.error({
      title: "Error",
      message: message ? message : 'Error al intentar eliminar la secuencia.',
      color: "red"
    })
  }
}

</script>

<template>
  <div class="w-full flex flex-col overflow-y-auto">
    <!-- Barra de navegación superior -->
    <UDashboardNavbar>
      <template #right>
        <UTooltip text="Guardar secuencia">
          <UButton
            icon="tabler:device-floppy"
            color="neutral"
            variant="ghost"
            @click="onSaveSecuencia()"
          >
            <template #leading>
              <div class="flex flex-col">
                <div
                  v-if="pendingSave"
                  class="w-2 h-2 rounded-full bg-primary absolute float-right"
                />
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

        <UTooltip text="Exportar secuencia a Google Drive">
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
      </template>
    </UDashboardNavbar>

    <!-- Formulario principal de la secuencia -->
    <div class="w-full flex flex-col gap-2 justify-center border-b border-neutral-200 p-2">
      <!-- Espacio y unidad curricular -->
      <div class="flex md:flex-row gap-2">
        <USelectMenu
          :model-value="secuencia.espacio"
          :items="espacios"
          option-attribute="id"
          class="flex-1"
          @update:model-value="onChangeEspacio"
        >
          <template #leading="{ modelValue, ui }">
            <div v-if="secuencia.espacio" class="flex items-center">
              <span
                :style="{ backgroundColor: secuencia.espacio?.rgbColor }"
                class="inline-block h-2 w-2 flex-shrink-0 rounded-full mr-2"
                aria-hidden="true"
              />
              <span class="truncate">{{ secuencia.espacio?.nombre }}</span>
            </div>
            <span v-else>Selecciona un espacio.</span>
          </template>

          <template #item-leading="{ item }">
            <div class="flex items-center">
              <span
                :style="{ backgroundColor: item.rgbColor }"
                class="inline-block h-2 w-2 flex-shrink-0 rounded-full mr-2"
                aria-hidden="true"
              />
              <span class="truncate">{{ item.nombre }}</span>
            </div>
          </template>
        </USelectMenu>

        <USelectMenu
          :model-value="secuencia.unidad_curricular"
          :items="unidadesCurriculares"
          option-attribute="id"
          class="flex-1 min-w-[350px]"
          @update:model-value="onChangeUnidadCurricular"
        >
          <template #leading="{ modelValue, ui }">
            <div v-if="secuencia.unidad_curricular" class="flex items-center">
              <span
                :style="{ backgroundColor: secuencia.espacio?.rgbColor }"
                class="inline-block h-2 w-2 flex-shrink-0 rounded-full mr-2"
                aria-hidden="true"
              />
              <span class="truncate">{{ secuencia.unidad_curricular?.nombre }}</span>
            </div>
            <span v-else>Selecciona una unidad curricular.</span>
          </template>

          <template #item-leading="{ item }">
            <div class="flex items-center">
              <span
                :style="{ backgroundColor: secuencia.espacio?.rgbColor }"
                class="inline-block h-2 w-2 flex-shrink-0 rounded-full mr-2"
                aria-hidden="true"
              />
              <span class="truncate">{{ item?.nombre }}</span>
            </div>
          </template>
        </USelectMenu>
      </div>

      <!-- Contenido -->
      <UCard class="flex-1 flex flex-col">
        <div class="flex items-center justify-between">
          <SelectorContenido
            v-model="secuencia.contenido"
            :contenidos="contenidos"
            :color="secuencia.espacio?.rgbColor"
            :gradosEspecificos="grupo.grados"
            :unidadCurricular="secuencia.unidad_curricular"
          />
        </div>
      </UCard>

      <!-- Competencias Generales y Específicas (2 columnas) -->
      <div class="flex gap-2">
        <!-- Competencias Generales -->
        <UCard class="w-2/5 flex flex-col">
          <div class="flex items-center justify-between">
            <SelectorCompetenciaGeneral
              v-model:model-value="secuencia.competencias_generales"
              :competenciasGenerales="competenciasGenerales"
              :competenciasEspecificasSelected="secuencia.competencias_especificas"
              :color="secuencia.espacio?.rgbColor"
            />
          </div>
        </UCard>

        <!-- Competencias Específicas -->
        <UCard class="w-3/5 flex flex-col">
          <div class="flex items-center justify-between">
            <SelectorCompetenciaEspecifica
              v-model="secuencia.competencias_especificas"
              :competenciasEspecificas="competenciasEspecificas"
              :color="secuencia.espacio?.rgbColor"
              :disabled="secuencia.unidad_curricular == null"
              :contenidoSelected="secuencia.contenido"
              :competenciasGeneralesSelected="secuencia.competencias_generales"
              :criteriosDeLogrosSelected="secuencia.criterios_de_logros"
              :competenciasGenerales="competenciasGenerales"
              :ciclosGradosEspecificos="cicloGradosSelected"
              :unidadCurricular="secuencia.unidad_curricular"
            />
          </div>
        </UCard>
      </div>

      <!-- Criterios de Logros -->
      <UCard class="flex-1 flex flex-col">
        <div class="flex items-center justify-between">
          <SelectorCriteriosDeLogros
            v-model="secuencia.criterios_de_logros"
            :criteriosDeLogro="criteriosDeLogros"
            :color="secuencia.espacio?.rgbColor"
            :contenidoSelected="secuencia.contenido"
            :competenciasEspecificasSelected="secuencia.competencias_especificas"
            :disabled="secuencia.unidad_curricular == null"
            :gradosEspecificos="grupo.grados"
            :unidadCurricular="secuencia.unidad_curricular"
          />
        </div>

      </UCard>

      <!-- Opciones adicionales: recursos, metodología, duración, evaluación -->
      <UCard>
        <BaseSwitch
          v-model="secuencia.detallaRecursos"
          title="Detallar recursos"
          description="Activa esta opción si deseas agregar más información sobre los recursos utilizados."
        />

        <UCard v-if="secuencia.detallaRecursos" class="flex-1 flex flex-col mt-2">
          <div class="flex items-center justify-between">
            <span class="font-medium text-xl">Recursos</span>
            <InputTextModal label="Recursos" v-model="secuencia.recursos" />
          </div>
          <div class="flex justify-between gap-2 items-center">
            <div v-if="secuencia.recursos" class="break-words w-full whitespace-normal">
              {{ secuencia.recursos }}
            </div>
            <span v-else>No se ha especificado ningún recurso.</span>
          </div>
        </UCard>

        <USeparator class="my-2" />

        <BaseSwitch
          v-model="secuencia.detallaMetodologia"
          title="Detallar metodología"
          description="Activa esta opción si deseas agregar más información sobre la metodología utilizada."
        />

        <UCard v-if="secuencia.detallaMetodologia" class="flex-1 flex flex-col mt-2">
          <div class="flex items-center justify-between">
            <span class="font-medium text-xl">Metodología</span>
            <InputTextModal label="Metodología" v-model="secuencia.metodologia" />
          </div>
          <div class="flex justify-between gap-2 items-center">
            <div v-if="secuencia.metodologia" class="break-words w-full whitespace-normal">
              {{ secuencia.metodologia }}
            </div>
            <span v-else>No se ha especificado ninguna metodología.</span>
          </div>
        </UCard>

        <USeparator class="my-2" />

        <BaseSwitch
          v-model="secuencia.detallaDuracion"
          title="Detallar duración"
          description="Activa esta opción si deseas agregar más información sobre la duración de la secuencia."
        />

        <UCard v-if="secuencia.detallaDuracion" class="flex-1 flex flex-col mt-2">
          <div class="flex items-center justify-between">
            <span class="font-medium text-xl">Duración</span>
            <InputTextModal label="Duración" v-model="secuencia.duracion" />
          </div>
          <div class="flex justify-between gap-2 items-center">
            <div v-if="secuencia.duracion" class="break-words w-full whitespace-normal">
              {{ secuencia.duracion }}
            </div>
            <span v-else>No se ha especificado ninguna duración.</span>
          </div>
        </UCard>

        <USeparator class="my-2" />

        <BaseSwitch
          v-model="secuencia.detallaEvaluacion"
          title="Detallar evaluación"
          description="Activa esta opción si deseas agregar más información sobre la evaluación de la secuencia."
        />

        <UCard v-if="secuencia.detallaEvaluacion" class="flex-1 flex flex-col mt-2">
          <div class="flex items-center justify-between">
            <span class="font-medium text-xl">Evaluación</span>
            <InputTextModal label="Evaluación" v-model="secuencia.evaluacion" />
          </div>
          <div class="flex justify-between gap-2 items-center">
            <div v-if="secuencia.evaluacion" class="break-words w-full whitespace-normal">
              {{ secuencia.evaluacion }}
            </div>
            <span v-else>No se ha especificado ninguna evaluación.</span>
          </div>
        </UCard>
      </UCard>
    </div>

    <!-- Panel de actividades (stepper izquierdo + formulario derecho) -->
    <UPage :ui="pageUi">
      <template #left>
        <UDashboardPanel side="left" :width="200">
          <div class="overflow-y-auto flex flex-col items-end p-2">
            <UButton
              :icon="isTramosPanelCollapsed ? 'tabler:layout-sidebar-left-expand' : 'tabler:layout-sidebar-left-collapse'"
              color="neutral"
              variant="ghost"
              class="mr-2"
              @click="isTramosPanelCollapsed = !isTramosPanelCollapsed"
            />
            <Stepper
              :showButtonAddStep="true"
              buttonAddStep="Agregar nueva actividad"
              orientation="vertical"
              descriptionButtonAddStep="Extender una nueva actividad a la secuencia"
              :currentStep="currentStepActividad"
              :steps="stepsActividades"
              @on:add-step="onCreateActividad"
              :linear="false"
              ref="actividadesStepper"
              @on:change-step="onChangeActividad"
              :actionsMenu="actionsMenuActividad"
              @on:action-menu="handleOnActionMenuActividad"
            />
          </div>
        </UDashboardPanel>
      </template>

      <template #default>
        <UDashboardPanel collapsible side="right" grow>
          <div class="overflow-y-auto flex items-start" v-if="actividadSecuenciaSelected">
            <div v-if="isTramosPanelCollapsed">
              <UButton
                :icon="isTramosPanelCollapsed ? 'tabler:layout-sidebar-left-expand' : 'tabler:layout-sidebar-left-collapse'"
                color="neutral"
                variant="ghost"
                class="mr-2"
                @click="isTramosPanelCollapsed = !isTramosPanelCollapsed"
              />
            </div>
            <ActividadSecuenciaForm
              v-model="actividadSecuenciaSelected"
              v-if="actividadSecuenciaSelected"
              :actividadSecuencia="actividadSecuenciaSelected"
              :espacios="espacios"
              :espacio="secuencia.espacio"
              :unidadCurricular="secuencia.unidad_curricular"
              :contenido="secuencia.contenido"
              :gradosIds="grupo.grados.map(g => g.id)"
              :competenciasGenerales="secuencia.competencias_generales"
              :nroActividadSecuencia="currentStepActividad"
              :ciclosGradosIds="ciclosGradosIds"
              :criteriosDeLogros="secuencia.criterios_de_logros"
              :competenciasEspecificas="secuencia.competencias_especificas"
              :grupo="secuencia.grupo"
            />
          </div>
          <div v-else class="flex flex-col justify-center items-center h-screen">
            <UIcon name="tabler:file-text" size="60px" />
            <h1 class="mt-1">{{ actividadNoSelectedText }}</h1>
          </div>
        </UDashboardPanel>
      </template>
    </UPage>

    <!-- Modales -->
    <ConfirmModal
      v-show="showModalExportConfirm"
      v-model="showModalExportConfirm"
      title="Descargar secuencia"
      description="¿Querés descargar la secuencia actual como un archivo? Esto guardará una copia en tu computadora."
      @onConfirm="onExport"
      @onClose="showModalExportConfirm = false"
    />

    <ConfirmModal
      v-if="showModalSyncGDrive"
      v-model="showModalSyncGDrive"
      title="Sincronizar secuencia con Google Drive"
      description="¿Deseás sincronizar la secuencia actual con tu cuenta de Google Drive? Esto guardará una copia actualizada en la nube."
      @onConfirm="syncGoogleDrive"
      @onClose="showModalSyncGDrive = false"
    /> 

    <ConfirmModal
      v-model="showModalDeleteConfirm"
      title="Eliminar secuencia"
      description="¿Deseás eliminar la secuencia actual? Esta acción no se puede deshacer."
      @onConfirm="onDelete"
      @onClose="showModalDeleteConfirm = false"
    />

    <ConfirmModal
      v-model="showModalChangeEspacioOrUnidadCurricular"
      :title="titleChangeEspacioOrUnidadCurricular"
      :description="descriptionChangeEspacioOrUnidadCurricular"
      @onConfirm="onConfirmChangeEspacioOUnidad"
      @onClose="showModalChangeEspacioOrUnidadCurricular = false"
    />
  </div>
</template>