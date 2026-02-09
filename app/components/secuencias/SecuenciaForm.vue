<script setup lang="ts">
import * as v from 'valibot'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { Grupo } from '~/types/grupo'
import type { CreateSecuenciaDTO, Secuencia } from '~/types/secuencia'
import type { UnidadCurricular } from '~/types/unidadCurricular'
import type { Espacio } from '~/types/espacio'
import { apiSecuenciasRoutes } from '~/utils/apiRoutes'
import { ModeEnum } from '~/utils/enums/ModeEnum'
import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum'

interface Props {
  mode: ModeEnum
  secuenciaSelected?: Secuencia
  espacios: Espacio[]
}

const { $apiRest } = useNuxtApp()
const toast = useToast()
const loading = ref(false)

// Esquema de validación con Valibot
const schema = v.object({
  name: v.pipe(
    v.string(),
    v.minLength(1, 'Debes ingresar al menos un nombre a la secuencia')
  ),
  grupo: v.custom(
    (value) => value !== null && value !== undefined,
    'Por favor ingresa un grupo.'
  ),
  espacio: v.optional(
    v.custom(
      (value) => value !== null && value !== undefined,
      'Por favor ingresa un espacio.'
    )
  ),
  unidad_curricular: v.optional(
    v.custom(
      (value) => value !== null && value !== undefined,
      'Por favor ingresa una unidad curricular válida.'
    )
  )
})

type Schema = v.InferOutput<typeof schema>

const props = withDefaults(defineProps<Props>(), {})
const emit = defineEmits(['on:update', 'close'])

// Estado reactivo para el formulario
const state = reactive<Schema>({
  name: '',
  grupo: null as Grupo | null,
  espacio: null as Espacio | null,
  unidad_curricular: null as UnidadCurricular | null
})

onBeforeMount(() => {
  if (props.mode === ModeEnum.UPDATE && props.secuenciaSelected) {
    patchForm(props.secuenciaSelected)
  }
})

const isEditMode = computed(() => {
  return props.mode === ModeEnum.UPDATE
})

// Computed para filtrar unidades curriculares basadas en el espacio seleccionado
const unidadesCurriculares = computed<UnidadCurricular[]>(() => {
  return (state.espacio as Espacio)?.unidades_curriculares || []
})

const patchForm = (secuenciaSelected: Secuencia) => {
  const { nombre, grupo, espacio, unidad_curricular } = secuenciaSelected
  state.name = nombre
  state.grupo = grupo
  state.espacio = espacio
  state.unidad_curricular = unidad_curricular
}

const onChangeEspacio = (espacio: Espacio) => {
  state.espacio = espacio
  state.unidad_curricular = null
}

const onChangeUnidadCurricular = (unidadCurricular: UnidadCurricular) => {
  state.unidad_curricular = unidadCurricular
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    v.parse(schema, event.data)
  } catch (error: any) {
    toast.error({
      title: 'Error de validación',
      message: error.message || 'Por favor verifica los datos del formulario',
      color: 'red',
      icon: 'i-heroicons-exclamation-triangle',
      timeout: 3000
    })
    return
  }

  const { grupo, name, espacio, unidad_curricular } = event.data

  try {
    loading.value = true
    let secuenciaResponse: Secuencia

    if (props.mode === ModeEnum.UPDATE && props.secuenciaSelected) {
      const secuenciaToEdit: Secuencia = {
        ...props.secuenciaSelected,
        nombre: name,
        espacio_id: (espacio as Espacio)?.id,
        espacio: (espacio as Espacio),
        unidad_curricular_id: (unidad_curricular as UnidadCurricular)?.id,
        unidad_curricular: (unidad_curricular as UnidadCurricular)
      }

      secuenciaResponse = await $apiRest<Secuencia>(
        apiSecuenciasRoutes.update(props.secuenciaSelected.id),
        HttpMethodEnum.POST,
        secuenciaToEdit
      )
    } else {
      const body: CreateSecuenciaDTO = {
        groupId: (grupo as Grupo).id,
        name,
        espacio_id: (espacio as Espacio)?.id,
        unidad_curricular_id: (unidad_curricular as UnidadCurricular)?.id
      }

      secuenciaResponse = await $apiRest<Secuencia>(
        apiSecuenciasRoutes.create,
        HttpMethodEnum.POST,
        body
      )
    }

    loading.value = false
    
    toast.success({
      title: 'Éxito',
      message: props.mode === ModeEnum.CREATE
        ? `Se ha creado la secuencia ${secuenciaResponse.nombre} correctamente`
        : `Se ha modificado la secuencia ${secuenciaResponse.nombre} correctamente`,
      color: 'green',
      icon: 'i-heroicons-check-circle',
      timeout: 3000
    })

    emit('on:update')
    emit('close')
  } catch (error: any) {
    loading.value = false
    console.error('Error en la solicitud:', error)
    
    toast.error({
      title: 'Error',
      message: error?.message || 'Error al procesar la solicitud',
      color: 'red',
      icon: 'i-heroicons-exclamation-triangle',
      timeout: 3000
    })
  }
}
</script>

<template>
  <UForm
    :schema="schema"
    :state="state"
    class="space-y-4"
    @submit.prevent="onSubmit"
  >
    <UFormField label="Nombre" name="name">
      <UInput
        id="name"
        v-model="state.name"
        placeholder="Ingresa un nombre"
        class="w-full"
        autofocus
        :ui="{ base: 'w-full' }"
      />
    </UFormField>

    <UFormField label="Grupo" name="grupo">
      <SelectGrupo
        v-model="state.grupo"
        :disabled="isEditMode"
        class="w-full"
      />
    </UFormField>

    <UFormField label="Espacio" name="espacio">
      <USelectMenu
        :model-value="state.espacio as Espacio"
        :items="espacios"
        :disabled="isEditMode"
        class="w-full"
        @update:model-value="onChangeEspacio"
      >
        <template #leading="{ modelValue, ui }">
             <div class="flex gap-2 items-center" v-if="state.espacio">
                <span
            
            :style="{ backgroundColor: (state.espacio as Espacio)?.rgbColor }"
            :class="['inline-block h-2 w-2 flex-shrink-0 rounded-full']"
            aria-hidden="true"
                />
                <span class="truncate" v-if="state.espacio">{{ (state.espacio as Espacio)?.nombre }}</span>
             </div>
          
          <span v-else>Selecciona un espacio</span>
        </template>
        
        <template #item-leading="{ item }">
            <div class="flex gap-2 items-center">
            <span
            :style="{ backgroundColor: item.rgbColor }"
            :class="['inline-block h-2 w-2 flex-shrink-0 rounded-full']"
            aria-hidden="true"
          />
          <span class="truncate">{{ item.nombre }}</span>
            </div>
         
        </template>
      </USelectMenu>
    </UFormField>

    <UFormField label="Unidad Curricular" name="unidad_curricular">
      <USelectMenu
        :model-value="state.unidad_curricular as UnidadCurricular"
        :items="unidadesCurriculares"
        :disabled="isEditMode || !state.espacio"
        class="w-full"
        @update:model-value="onChangeUnidadCurricular"
      >
        <template #leading="{ modelValue, ui }">
            <div class="flex items-center" v-if="state.unidad_curricular">
                <span
                    
                    :style="{ backgroundColor: (state.espacio as Espacio)?.rgbColor }"
                    :class="['inline-block h-2 w-2 flex-shrink-0 rounded-full']"
                    aria-hidden="true"
                />
                <span class="truncate ml-2" v-if="state.unidad_curricular">
                    {{ (state.unidad_curricular as UnidadCurricular)?.nombre }}
                </span>
            </div>
          
          <span v-else>
            {{ state.espacio ? 'Selecciona una unidad curricular' : 'Selecciona un espacio primero' }}
          </span>
        </template>
        
        <template #item-leading="{ item }">
          <div class="flex gap-2 items-center">
            <span
            :style="{ backgroundColor: (state.espacio as Espacio)?.rgbColor }"
            :class="['inline-block h-2 w-2 flex-shrink-0 rounded-full']"
            aria-hidden="true"
            />
            <span class="truncate">{{  item.nombre }}</span>
          </div>
          
        </template>
      </USelectMenu>
    </UFormField>

    <div class="flex w-full justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
      <UButton
        label="Cancelar"
        color="neutral"
        variant="ghost"
        @click="emit('close')"
      />
      <UButton
        type="submit"
        label="Guardar"
        color="primary"
        :loading="loading"
        :disabled="loading"
      />
    </div>
  </UForm>
</template>