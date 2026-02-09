<script setup lang="ts">
import * as v from 'valibot'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { CreateOrUpdateGrupoDTO, Grupo } from '~/types/grupo'
import type { Grado } from '~/types/grado'
import { ModeEnum } from '~/utils/enums/ModeEnum'
import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum'
import { apiGrupoRoutes } from '~/utils/apiRoutes'

interface Props {
  mode: ModeEnum
  grupoSelected?: Grupo
}

// Esquema simplificado de validación con Valibot para depuración
const schema = v.object({
  nombre: v.pipe(
    v.string(),
    v.minLength(1, 'Por favor ingresa un nombre al grupo.')
  ),
  year: v.pipe(
    v.number(),
    v.minValue(2000, 'El año debe ser mayor o igual a 2000'),
    v.maxValue(2100, 'El año debe ser menor o igual a 2100')
  ),
  grados: v.custom((value) => {
    if (state.esMultiGrado) {
      return Array.isArray(value) && value.length > 0
    } else {
      return value !== null && value !== undefined
    }
  }, 'Debes seleccionar al menos un grado'),
  esMultiGrado: v.boolean(),
  logo: v.optional(v.any())
})

type Schema = v.InferOutput<typeof schema>

const { $apiRest } = useNuxtApp()
const toast = useToast()
const runtimeConfig = useRuntimeConfig()

const props = withDefaults(defineProps<Props>(), {})
const emit = defineEmits(['on:update', 'close'])

const loading = ref(false)
const fileRef = ref<HTMLInputElement>()
const logoB64 = ref<string | null>(null)
const grados = ref<Grado[]>([])
const loadingGrados = ref<boolean>(true)

const defaultGroupImage = computed(() => runtimeConfig.public.DEFAULT_GRUPO_IMAGE_URL)

// Estado reactivo para el formulario
const state = reactive<Schema>({
  nombre: '',
  year: new Date().getFullYear(),
  grados: null,
  esMultiGrado: false,
  logo: null
})

onBeforeMount(async () => {
  grados.value = await loadGrados()
  
  if (props.mode === ModeEnum.UPDATE && props.grupoSelected) {
    loadForm(props.grupoSelected)
  }
})

const loadGrados = async (): Promise<Grado[]> => {
  loadingGrados.value = true
  try {
    const grados = await $apiRest(apiGradoRoutes.listAll, HttpMethodEnum.GET)
    return grados
  } finally {
    loadingGrados.value = false
  }
}

const loadForm = (grupo: Grupo) => {

  state.nombre = grupo.nombre
  state.esMultiGrado = grupo.esMultiGrado;
  state.year = grupo.year;
  
  if (!grupo.esMultiGrado) {
    state.grados = grupo.grados[0] as Grado;
  } else {
    state.grados = grupo.grados;
  }
  
  
  logoB64.value = grupo.url_image
}

const createFormData = (data: CreateOrUpdateGrupoDTO) => {
  
  const formData = new FormData();
    Object.keys(data).map(key => {
      if(key === 'grados'){
          formData.append('grados', JSON.stringify(data.grados));
      }else if(key == 'esMultiGrado'){
        formData.append('esMultiGrado', data.esMultiGrado ? Number(1).toString() : Number(0).toString())
      }else if(key == 'logo'){
        if(data.logo){  // Solo si viene un archivo se agrega al formData
          formData.append('logo', data.logo)
        }
      }
      else{
        formData.append(key, data[key]);
      }
    });

    return formData;
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
  
  const body: CreateOrUpdateGrupoDTO = {
    ...event.data,
    grados: Array.isArray(event.data.grados) 
      ? event.data.grados 
      : [event.data.grados]
  }

  try {
    loading.value = true
    let grupoResponse: Grupo
    
    if (props.mode === ModeEnum.UPDATE && props.grupoSelected) {
      grupoResponse = await $apiRest<Grupo>(
        apiGrupoRoutes.update(props.grupoSelected.id),
        HttpMethodEnum.POST,
        createFormData(body)
      )
    } else {
      grupoResponse = await $apiRest<Grupo>(
        apiGrupoRoutes.create,
        HttpMethodEnum.POST,
        createFormData(body)
      )
    }
    
    loading.value = false
    
    toast.error({
      title: 'Éxito',
      message: props.mode === ModeEnum.CREATE
        ? `Se ha creado el grupo ${grupoResponse.nombre} correctamente`
        : `Se ha modificado el grupo ${grupoResponse.nombre} correctamente`,
      color: 'green',
      icon: 'i-heroicons-check-circle',
      timeout: 3000
    })
    
    emit('on:update')
    emit('close')
  } catch (error: any) {
    loading.value = false
    console.error('Error en la solicitud:', error) // Depuración
    toast.error({
      title: 'Error',
      message: error?.message || 'Error al procesar la solicitud',
      color: 'red',
      icon: 'i-heroicons-exclamation-triangle',
      timeout: 3000
    })
  }
}

const handleChangeMultiGrado = () => {
  if (state.esMultiGrado) {
    state.grados = []
    return
  }
  state.grados = null
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  
  if (!file) return
  
  const extension = file.name.split('.').pop()?.toLowerCase()
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif']
  
  if (!extension || !allowedExtensions.includes(extension)) {
    toast.error({
      title: 'Error',
      message: 'Sólo se permiten estos tipos de archivos: .jpg, .jpeg, .png, .gif',
      color: 'red',
      icon: 'i-heroicons-exclamation-triangle',
      timeout: 3000
    })
    return
  }
  
  const reader = new FileReader()
  
  reader.onload = () => {
    const base64String = reader.result as string
    state.logo = file
    logoB64.value = base64String
  }
  
  reader.readAsDataURL(file)
}

function onFileClick() {
  fileRef.value?.click()
}

</script>

<template>
  <div>
  </div>
  <UForm
    ref="formRef"
    :schema="schema"
    :state="state"
    class="space-y-4"
    @submit.prevent="onSubmit"
  >
    <div class="relative flex flex-col items-center">
      <UAvatar
        :src="logoB64 || defaultGroupImage"
        size="3xl"
        class="border-2 border-gray-200"
      />
      <UButton
        label="Cambiar imagen"
        class="mt-2"
        color="neutral"
        variant="outline"
        size="sm"
        @click="onFileClick"
      />
      <input
        ref="fileRef"
        type="file"
        class="hidden"
        accept=".jpg,.jpeg,.png,.gif"
        @change="onFileChange"
      >
    </div>

    <UFormField label="Nombre" name="nombre">
      <UInput
        v-model="state.nombre"
        placeholder="Ingresa el nombre del grupo"
        autofocus
        class="w-full"
        :ui="{ base: 'w-full' }"
      />
    </UFormField>

    <UFormField label="Año Escolar" name="year">
      <SelectYear v-model="state.year" />
    </UFormField>

    <UFormField name="esMultiGrado">
      <UCheckbox
        v-model="state.esMultiGrado"
        label="¿Grupo es MultiGrado?"
        help="En caso de que el grupo incluya más de 1 grado selecciona la opción para escoger más de uno"
        @change="handleChangeMultiGrado"
      />
    </UFormField>

    <UFormField :label="state.esMultiGrado ? 'Grados' : 'Grado'" name="grados">
      <SelectGrado
        v-model="state.grados"
        :multiple="state.esMultiGrado"
        class="mt-2"
        :grados="grados"
        :loading="loadingGrados"
      />
    </UFormField>
    
    <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
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