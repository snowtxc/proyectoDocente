<script setup lang="ts">
import * as v from 'valibot'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { CreatePlanificacionDTO, Planificacion } from '~/types/planificacion'
import type { Grupo } from '~/types/grupo'
import { apiPlanificacionesRoutes } from '~/utils/apiRoutes'
import { ModeEnum } from '~/utils/enums/ModeEnum'
import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum'

interface Props {
    mode: ModeEnum,
    planificacionSelected?: Planificacion
}

const { $apiRest } = useNuxtApp();

const toast = useToast()
const loading = ref(false);

// Esquema de validación con Valibot
const schema = v.object({
  name: v.pipe(
    v.string(),
    v.minLength(1, 'Debes ingresar al menos un nombre a la planificación')
  ),
  grupo: v.custom((value) => {
    return value !== null && value !== undefined
  }, 'Por favor ingresa un grupo.')
})

type Schema = v.InferOutput<typeof schema>

const props = withDefaults(defineProps<Props>(), {})
const emit = defineEmits(['on:update', 'close'])

// Estado reactivo para el formulario
const state = reactive<Schema>({
  name: '',
  grupo: null as Grupo | null
})

onBeforeMount(() => {
  if (props.mode === ModeEnum.UPDATE && props.planificacionSelected) {
    patchForm(props.planificacionSelected)
  }
})

const isEditMode = computed(() => {
  return props.mode === ModeEnum.UPDATE
})

const patchForm = (planificacionSelected: Planificacion) => {
  const { nombre, grupo } = planificacionSelected
  state.name = nombre
  state.grupo = grupo
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    v.parse(schema, event.data)
  } catch (error: any) {
    toast.error({
      title: 'Error de validación',
      message: error.message || 'Por favor verifica los datos del formulario',
      color: 'red'
    })
    return
  }

  const { grupo, name } = event.data

  if (!grupo) {
    toast.error({
      title: 'Error de validación',
      message: 'Por favor selecciona un grupo',
      color: 'red'
    })
    return
  }

  try {
    loading.value = true
    let planificacionResponse: Planificacion

    if (props.mode === ModeEnum.UPDATE && props.planificacionSelected) {
      const planificacionToEdit: Planificacion = {
        ...props.planificacionSelected,
        nombre: name
      }
      planificacionResponse = await $apiRest<Planificacion>(
        apiPlanificacionesRoutes.update(props.planificacionSelected.id),
        HttpMethodEnum.POST,
        planificacionToEdit
      )
    } else {
      const body: CreatePlanificacionDTO = {
        groupId: (grupo as Grupo).id,
        name
      }
      planificacionResponse = await $apiRest<Planificacion>(
        apiPlanificacionesRoutes.create,
        HttpMethodEnum.POST,
        body
      )
    }

    loading.value = false

    toast.error({
      title: 'Éxito',
      message: props.mode === ModeEnum.CREATE
        ? `Se ha creado la planificación ${planificacionResponse.nombre} correctamente`
        : `Se ha modificado la planificación ${planificacionResponse.nombre} correctamente`,
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
        ref="formRef"
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
            <SelectGrupo v-model="state.grupo" :disabled="isEditMode" class="w-full" />
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
