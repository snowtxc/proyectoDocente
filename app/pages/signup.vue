<script setup lang="ts">
import { useAuthStore } from '~/utils/authStore'
import { apiAuthRoutes } from "~/utils/apiRoutes"
import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum'
import type { CreateUserDTO } from '~/types/user'
import type { FormSubmitEvent } from '@nuxt/ui'
import * as z from 'zod'

import {
  useCodeClient,
  type ImplicitFlowSuccessResponse,
  type ImplicitFlowErrorResponse,
  type ImplicitFlowOptions
} from "vue3-google-signin"


definePageMeta({
  layout: 'auth'
})

useSeoMeta({
  title: 'Crear cuenta'
})

const { $apiRest } = useNuxtApp()
const toast = useToast()
const authStore = useAuthStore()

/* -----------------------
   Form fields
------------------------ */
const fields = [
  {
    name: 'name',
    type: 'text',
    size: 'xl',
    label: 'Nombres',
    placeholder: 'Ingresa tu nombre',
    required: true
  },
  {
    name: 'lastname',
    type: 'text',
    size: 'xl',
    label: 'Apellidos',
    placeholder: 'Ingresa tu apellido',
    required: true
  },
  {
    name: 'email',
    type: 'email',
    size: 'xl',
    label: 'Email',
    placeholder: 'Ingresar email',
    required: true
  },
  {
    name: 'password',
    type: 'password',
    size: 'xl',
    label: 'Contraseña',
    placeholder: 'Tu contraseña',
    required: true
  }
]

const googleSignInOptions: ImplicitFlowOptions = {
  scope: googleScopes,
  onSuccess: async (response: ImplicitFlowSuccessResponse) => {
    try {
      const { code } = response

      const responseGoogle = await $apiRest(
        apiAuthRoutes.loginWithGoogleCallback,
        HttpMethodEnum.POST,
        { code }
      )

      if (responseGoogle) {
        const { user, token } = responseGoogle

        authStore.setToken(token)
        authStore.setUser(user)

        await navigateTo('/home')
      }
    } catch (e) {
      toast.error({
        title: 'Error',
        message: 'No se pudo completar el registro con Google'
      })
    }
  },
  onError: (errorResponse: ImplicitFlowErrorResponse) => {
    toast.error({
      title: 'Error',
      message: errorResponse.error_description
    })
  }
}


const { isReady, login: loginWithGoogle } = useCodeClient(googleSignInOptions)

const providers = [
  {
    label: 'Continuar con Google',
    icon: 'i-simple-icons-google',
    size: 'xl',
    color: 'neutral',
    variant: 'outline',
    class: 'justify-center rounded-2xl font-bold',
    onClick: () => {
      loginWithGoogle()
    }
  }
]

/* -----------------------
   Zod schema
------------------------ */
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/

const schema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  lastname: z.string().min(1, 'El apellido es requerido'),
  email: z.email('Email inválido'),
  password: z
    .string()
    .min(8, 'Debe tener al menos 8 caracteres')
    .regex(
      passwordRegex,
      'Debe contener mayúscula, minúscula, número y carácter especial'
    )
})

type Schema = z.output<typeof schema>

/* -----------------------
   Submit
------------------------ */
async function onSubmit(payload: FormSubmitEvent<Schema>) {
  const data = payload.data

  const signUpInfo: CreateUserDTO = {
    nombre1: data.name.split(' ')[0],
    nombre2: data.name.split(' ')[1] || '',
    apellido1: data.lastname.split(' ')[0],
    apellido2: data.lastname.split(' ')[1] || '',
    email: data.email,
    password: data.password
  }

  try {
    const response = await $apiRest(
      apiAuthRoutes.register,
      HttpMethodEnum.POST,
      signUpInfo
    )

    const { user, token } = response

    authStore.setToken(token)
    authStore.setUser(user)

    toast.success({
      title: 'Cuenta creada',
      message: 'Tu cuenta fue creada correctamente'
    })

    await navigateTo('/home')
  } catch (errorMessage: any) {
    toast.error({
      title: 'Error',
      message: errorMessage
    })
  }
}
</script>


<template>
  <AuthShell
    saludo="¡Hola! Soy Flopi."
    detalle="Creá tu cuenta y te ayudo a armar tu primera planificación en una charla."
  >
    <UAuthForm
      :fields="fields"
      :schema="schema"
      :providers="providers"
      separator="o"
      title="Creá tu cuenta"
      align="top"
      :ui="{ title: 'font-display text-3xl font-bold text-mona-900', description: 'text-mona-800/80' }"
      :submit-button="{ label: 'Crear cuenta', trailingIcon: 'i-heroicons-user-plus-20-solid' }"
      @submit="onSubmit"
      :submit="{
          label: 'Crear cuenta',
          color: 'primary',
          size: 'xl',
          class: 'justify-center font-display text-lg font-semibold text-mona-950 rounded-2xl',
        }"
    >
      <template #description>
        ¿Ya tenés cuenta?
        <NuxtLink to="/login" class="text-mona-700 font-bold underline underline-offset-2">
          Iniciar sesión
        </NuxtLink>.
      </template>

      <template #footer>
        Al registrarte aceptás nuestros
        <NuxtLink to="/terminos-y-condiciones" class="text-mona-700 font-bold underline underline-offset-2">
          Términos y condiciones
        </NuxtLink>.
      </template>
    </UAuthForm>
  </AuthShell>
</template>
