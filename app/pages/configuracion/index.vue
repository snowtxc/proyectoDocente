<script setup lang="ts">
import * as v from 'valibot'
import type { FormSubmitEvent } from '@nuxt/ui'
import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum'
import { apiAuthRoutes } from '~/utils/apiRoutes'

const { $apiRest } = useNuxtApp()
const authStore = useAuthStore()
const toast = useToast()

const user = computed(() => authStore.user)
const updating = ref(false)
const fileRef = ref<HTMLInputElement>()
const isDeleteAccountModalOpen = ref(false)

// Esquema de validación con Valibot
const profileSchema = v.object({
  nombre1: v.pipe(
    v.string(),
    v.minLength(1, 'Por favor ingresa tu nombre')
  ),
  nombre2: v.optional(v.string()),
  apellido1: v.pipe(
    v.string(),
    v.minLength(1, 'Por favor ingresa tu apellido')
  ),
  apellido2: v.optional(v.string()),
  nuevoAvatar: v.optional(v.any())
})

type ProfileSchema = v.InferOutput<typeof profileSchema>

// Estado reactivo del formulario
const profile = reactive<Partial<ProfileSchema>>({
  nombre1: '',
  nombre2: '',
  apellido1: '',
  apellido2: '',
  nuevoAvatar: undefined
})

// Actualizar estado cuando cambia el usuario
watch(() => authStore.user, (newUser) => {
  if (newUser) {
    profile.nombre1 = newUser.nombre1 || ''
    profile.nombre2 = newUser.nombre2 || ''
    profile.apellido1 = newUser.apellido1 || ''
    profile.apellido2 = newUser.apellido2 || ''
  }
}, { immediate: true })

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
    profile.nuevoAvatar = base64String
  }
  
  reader.readAsDataURL(file)
}

function onFileClick() {
  fileRef.value?.click()
}

async function onSubmit(event: FormSubmitEvent<ProfileSchema>) {
  try {
    // Validar con Valibot
    v.parse(profileSchema, event.data)
  } catch (error: any) {
    toast.error({
      title: 'Error de validación',
      message: error.message || 'Por favor verifica los datos del formulario',
      color: 'red',
      icon: 'i-heroicons-exclamation-triangle'
    })
    return
  }
  
  updating.value = true
  
  try {
    const userUpdated = await $apiRest(
      apiAuthRoutes.updateProfile,
      HttpMethodEnum.POST,
      {
        ...event.data,
        // Enviar solo el base64 si hay nueva imagen
        nuevoAvatar: profile.nuevoAvatar !== undefined ? profile.nuevoAvatar : undefined
      }
    )
    
    authStore.setUser(userUpdated)
    profile.nuevoAvatar = undefined
    
    toast.success({
      title: 'Perfil actualizado',
      message: 'Tu perfil se ha actualizado correctamente',
      icon: 'i-heroicons-check-circle',
      color: 'green'
    })
  } catch (error: any) {
    toast.error({
      title: 'Error',
      message: error?.message || 'Error al actualizar el perfil',
      icon: 'i-heroicons-exclamation-triangle',
      color: 'red'
    })
  } finally {
    updating.value = false
  }
}

</script>

<template>
  <UForm
    id="settings"
    :schema="profileSchema"
    :state="profile"
    @submit="onSubmit"
  >
    <UPageCard
      title="Perfil"
      description="Esta información corresponde a tus datos personales."
      variant="naked"
      orientation="horizontal"
      class="mb-4"
    >
      <UButton
        form="settings"
        label="Guardar cambios"
        icon="tabler:device-floppy"
        color="primary"
        type="submit"
        :loading="updating"
        :disabled="updating"
        class="w-fit lg:ms-auto"
      />
    </UPageCard>

    <UPageCard variant="subtle">
      <UFormField
        name="avatar"
        label="Foto de perfil"
        description="JPG, GIF o PNG. 1MB Máx."
        class="flex max-sm:flex-col justify-between sm:items-center gap-4"
      >
        <div class="flex flex-wrap items-center gap-3">
          <UAvatar
            :src="profile.nuevoAvatar || user?.url_image_profile"
            :alt="profile.nombre1"
            size="lg"
          />
          <UButton
            label="Elegir"
            icon="tabler:polaroid"
            color="primary"
            @click="onFileClick"
          />
          <input
            ref="fileRef"
            type="file"
            class="hidden"
            accept=".jpg, .jpeg, .png, .gif"
            @change="onFileChange"
          >
        </div>
      </UFormField>
      <USeparator />
      <UFormField
        name="email"
        label="Correo Electrónico"
        description="Usado para ingresar al Sistema"
        required
        class="flex max-sm:flex-col justify-between items-start gap-4"
      >
        <UInput
          :model-value="user?.email"
          disabled
          type="email"
          autocomplete="off"
          class="w-full"
        />
      </UFormField>
      <USeparator />
      <UFormField
        name="nombre1"
        label="Primer Nombre"
        required
        class="flex max-sm:flex-col justify-between items-start gap-4"
      >
        <UInput
          v-model="profile.nombre1"
          autocomplete="off"
          class="w-full"
        />
      </UFormField>
      <USeparator />
      <UFormField
        name="nombre2"
        label="Segundo Nombre"
        class="flex max-sm:flex-col justify-between items-start gap-4"
      >
        <UInput
          v-model="profile.nombre2"
          autocomplete="off"
          class="w-full"
        />
      </UFormField>
      <USeparator />
      <UFormField
        name="apellido1"
        label="Primer Apellido"
        required
        class="flex max-sm:flex-col justify-between items-start gap-4"
      >
        <UInput
          v-model="profile.apellido1"
          autocomplete="off"
          class="w-full"
        />
      </UFormField>
      <USeparator />
      <UFormField
        name="apellido2"
        label="Segundo Apellido"
        class="flex max-sm:flex-col justify-between items-start gap-4"
      >
        <UInput
          v-model="profile.apellido2"
          autocomplete="off"
          class="w-full"
        />
      </UFormField>
    </UPageCard>

    <UPageCard
      variant="subtle"
      class="mt-6"
    >
      <div class="flex flex-col items-start gap-4">
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Eliminar cuenta
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Una vez que elimines tu cuenta, no podrás recuperarla.
          </p>
        </div>
        <UButton
          color="error"
          label="Eliminar cuenta"
          @click="isDeleteAccountModalOpen = true"
        />
      </div>
    </UPageCard>
  </UForm>

  <!-- Modal para eliminar cuenta -->
  <SettingsDeleteAccountModal v-if="isDeleteAccountModalOpen" :model-value="isDeleteAccountModalOpen"  @on:close="isDeleteAccountModalOpen = false"/>
</template>