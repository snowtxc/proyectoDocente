<script setup lang="ts">
import type { CompetenciaEspecifica, CompetenciaEspecificaItemSelector, CompetenciaGeneral } from '~/types/competenciaEspecifica';
import type { Contenido } from '~/types/contenido';
import type { CriterioDeLogro } from '~/types/criterioDeLogro';
import { FormsCompetenciasGenerales, UPopover } from '#components';

interface Props {
  modelValue: CompetenciaEspecifica[],
  competenciasEspecificas: CompetenciaEspecifica[],
  competenciasGenerales: CompetenciaGeneral[],
  competenciasGeneralesSelected?: CompetenciaGeneral[],
  contenidoSelected?: Contenido,
  criteriosDeLogrosSelected?: CriterioDeLogro[]
  color: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
});

const filters = ref<{ competenciasGenerales: CompetenciaGeneral[] }>({
  competenciasGenerales: []
})

const emit = defineEmits(['update:model-value']);

const getLista = (): CompetenciaEspecificaItemSelector[] => {
  return props.competenciasEspecificas.map(competenciaEspecifica => {

    let recomendado: boolean = false;
    let contenidoRelacionado: Contenido = null;
    let competenciasGeneralesRelacionadas: CompetenciaGeneral[] = [];
    let criteriosDeLogrosRelacionados: CriterioDeLogro[] = [];
    let nroRelaciones: number = 0;

    if (props.competenciasGeneralesSelected?.length) {
      competenciasGeneralesRelacionadas = competenciaEspecifica.competencias_generales.filter(cg => {
        const result = props.competenciasGeneralesSelected.some(sel => sel.id == cg.id);
        if (result) {
          recomendado = true;
          nroRelaciones++;
        }
        return result;
      });
    }

    if (props.contenidoSelected) {
      contenidoRelacionado = competenciaEspecifica.contenidos.find(c => c.id == props.contenidoSelected.id);
      if (contenidoRelacionado) {
        recomendado = true;
        nroRelaciones++;
      }
    }

    if (props.criteriosDeLogrosSelected) {
      criteriosDeLogrosRelacionados = competenciaEspecifica.criterios_de_logros.filter(cdl => {
        const result = props.criteriosDeLogrosSelected.some(sel => sel.id == cdl.id);
        if (result) nroRelaciones++;
        return result;
      });

      if (criteriosDeLogrosRelacionados.length) recomendado = true;
    }

    return {
      ...competenciaEspecifica,
      checked: props.modelValue?.findIndex(ce => ce.id == competenciaEspecifica.id) >= 0,
      recomendado,
      contenidoRelacionado,
      competenciasGeneralesRelacionadas,
      criteriosDeLogrosRelacionados,
      nroRelaciones
    }
  }).sort((a, b) => {
    if (a.recomendado && (a.nroRelaciones > b.nroRelaciones))
      return -1;
    return 1;
  })
}

const competenciasEspecificas = ref(getLista());
const isOpen = ref(false);
const q = ref('');

const competenciasEspecificasFiltered = computed(() => {
  return competenciasEspecificas.value.filter(ce => {

    if (q.value.trim()) {
      if (!ce.descripcion.toLowerCase().includes(q.value.toLowerCase()))
        return false;
    }

    if (filters.value.competenciasGenerales.length) {
      const incluye = filters.value.competenciasGenerales.every(cg =>
        ce.competencias_generales.some(x => x.id == cg.id)
      );
      if (!incluye) return false;
    }

    return true;
  })
})

const emptyFiltered = computed(() =>
  competenciasEspecificasFiltered.value.length == 0
)

const onSave = () => {
  const selected = competenciasEspecificas.value.filter(c => c.checked);
  emit('update:model-value', selected);
  isOpen.value = false;
}

const onToggleCompetenciaEspecifica = (ce: any) => {
  ce.checked = !ce.checked;
}

watch([
  () => props.modelValue,
  () => props.competenciasEspecificas,
  () => props.contenidoSelected,
  () => props.criteriosDeLogrosSelected,
  () => props.competenciasGeneralesSelected
], () => {
  competenciasEspecificas.value = getLista()
})
</script>

<template>

  <UButton
    icon="tabler:pencil"
    size="sm"
    color="primary"
    variant="outline"
    @click="isOpen = true"
    :disabled="props.disabled"
  />

  <UModal v-model:open="isOpen">
  <template #content>
    <!-- Wrapper real con altura controlada -->
    <div class="w-full max-w-4xl h-[90vh] flex flex-col">

      <UCard class="flex flex-col flex-1 overflow-hidden">

        <!-- ================= HEADER ================= -->
        <template #header>
          <div class="flex gap-2 items-center shrink-0">

            <UInput
              v-model="q"
              icon="i-heroicons-magnifying-glass"
              placeholder="Buscar competencia especifica"
              autofocus
              class="flex-1"
            />

            <UPopover :popper="{ placement: 'bottom-start' }" mode="click">
              <UTooltip>
                <UButton
                  size="sm"
                  color="primary"
                  square
                  variant="outline"
                >
                  <div class="relative flex">
                    <div
                      v-if="filters.competenciasGenerales.length > 0"
                      class="w-2 h-2 rounded-full bg-green-500 absolute -top-1 -right-1"
                    />
                    <UIcon name="tabler:filter-cog" class="size-5" />
                  </div>
                </UButton>
              </UTooltip>

              <template #content>
                <div class="p-4 flex flex-col gap-y-4 max-w-64">
                  <FormsCompetenciasGenerales
                    v-model="filters.competenciasGenerales"
                    :competenciasGenerales="props.competenciasGenerales"
                  />
                </div>
              </template>
            </UPopover>

            <UButton
              icon="tabler:x"
              size="sm"
              color="primary"
              square
              variant="solid"
              @click="isOpen = false"
            />

          </div>
        </template>

        <!-- ================= BODY (SCROLL REAL) ================= -->
        <div class="flex-1 overflow-y-auto px-4 py-2 max-h-[60vh] overflow-y-auto">

          <div
            v-if="emptyFiltered"
            class="flex flex-col justify-center items-center mt-10 text-center"
          >
            <UIcon name="tabler:search" class="w-8 h-8" />
            <span>No pudimos encontrar ninguna competencia especifica.</span>
          </div>

          <ul
            v-else
            role="list"
            class="divide-y divide-gray-200 dark:divide-gray-800"
          >
            <li
              v-for="competenciaEspecifica in competenciasEspecificasFiltered"
              :key="competenciaEspecifica.id"
              @click="onToggleCompetenciaEspecifica(competenciaEspecifica)"
              class="w-full flex justify-between gap-3 py-3 px-2 sm:px-4 hover:cursor-pointer"
            >
              <div class="flex items-center gap-3 w-full">
                <div class="text-sm min-w-0 flex gap-2">
                  <UCheckbox
                    size="xl"
                    v-model="competenciaEspecifica.checked"
                  />
                  <p class="text-gray-900 dark:text-white font-medium break-words">
                    {{ competenciaEspecifica.codificacion }}
                    {{ competenciaEspecifica.descripcion }}
                  </p>
                </div>
              </div>

              <div class="flex items-start gap-3 shrink-0">
                <UPopover
                  v-if="competenciaEspecifica.recomendado"
                  :popper="{ placement: 'bottom-start' }"
                  mode="hover"
                >
                  <UTooltip>
                    <UButton
                      label="Recomendado"
                      icon="tabler:butterfly-filled"
                      :color="getColorBadgeComponente(props.color)"
                      variant="outline"
                      size="sm"
                    />
                  </UTooltip>

                  <template #content>
                    <div class="p-4 flex flex-col gap-y-4 max-w-64">

                      <div v-if="competenciaEspecifica.contenidoRelacionado">
                        <span class="font-medium">
                          Se relaciona al contenido seleccionado:
                        </span>
                        <ul class="list-disc ml-4">
                          <li>
                            {{ competenciaEspecifica.contenidoRelacionado.descripcion }}
                          </li>
                        </ul>
                      </div>

                      <div v-if="competenciaEspecifica.competenciasGeneralesRelacionadas?.length">
                        <USeparator color="primary" />
                        <span class="font-medium">
                          Competencias generales relacionadas:
                        </span>
                        <ul class="list-disc ml-4">
                          <li
                            v-for="cg in competenciaEspecifica.competenciasGeneralesRelacionadas"
                            :key="cg.id"
                          >
                            {{ cg.nombre }}
                          </li>
                        </ul>
                      </div>

                      <div v-if="competenciaEspecifica.criteriosDeLogrosRelacionados?.length">
                        <USeparator color="primary" />
                        <span class="font-medium">
                          Criterios de logro relacionados:
                        </span>
                        <ul class="list-disc ml-4">
                          <li
                            v-for="cdl in competenciaEspecifica.criteriosDeLogrosRelacionados"
                            :key="cdl.id"
                          >
                            {{ cdl.descripcion }}
                          </li>
                        </ul>
                      </div>

                    </div>
                  </template>
                </UPopover>
              </div>

            </li>
          </ul>
        </div>

        <!-- ================= FOOTER FIJO ================= -->
        <template #footer>
          <div class="flex justify-end gap-3 pb-2">
            <UButton
              label="Cancelar"
              color="neutral"
              variant="ghost"
              @click="isOpen = false"
            />
            <UButton
              label="Guardar"
              color="primary"
              @click="onSave"
            />
          </div>
        </template>

      </UCard>
    </div>
  </template>
</UModal>



</template>
