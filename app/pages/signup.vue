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
    label: 'Nombres',
    placeholder: 'Ingresa tu nombre',
    required: true
  },
  {
    name: 'lastname',
    type: 'text',
    label: 'Apellidos',
    placeholder: 'Ingresa tu apellido',
    required: true
  },
  {
    name: 'email',
    type: 'email',
    label: 'Email',
    placeholder: 'Ingresar email',
    required: true
  },
  {
    name: 'password',
    type: 'password',
    label: 'Contraseña',
    placeholder: 'Ingresar contraseña',
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
  <div class="flex bg-gray-50 dark:bg-gray-900 min-h-screen">
    <div class="w-full bg-transparent rounded-lg overflow-hidden grid grid-cols-1 md:grid-cols-12 h-full">

      <!-- Left image -->
      <div class="hidden md:flex relative h-full min-h-screen md:col-span-7">
        <img
          src="/wallpaper-login.png"
          alt="Docentes"
          class="w-full h-full object-cover"
          loading="lazy"
        />
        <div class="absolute inset-0 flex flex-col justify-center items-start px-16 bg-black/20">
          <h1 class="text-6xl font-bold text-white drop-shadow-lg">
            Bienvenido a Flopi Docentes
          </h1>
          <p class="text-xl text-white/90 mt-4 max-w-xl drop-shadow">
            Crea tu cuenta y comienza a planificar mejor.
          </p>
        </div>
      </div>

      <!-- Right card -->
      <div class="flex items-center justify-center p-8 bg-transparent dark:bg-slate-800 relative md:col-span-5">
        <div class="w-full max-w-sm relative">

          <!-- Floating logo -->
          <div class="absolute -top-10 left-1/2 transform -translate-x-1/2">
            <!-- mismo SVG del login -->
            <svg width="100" height="100" viewBox="0 0 100 100">
              <g>
                <polygon points="28.66,25 20,30 11.34,25 11.34,15 20,10 28.66,15" fill="#F6C84C"/>
                <polygon points="45.91,25 37.25,30 28.59,25 28.59,15 37.25,10 45.91,15" fill="#F6C84C"/>
                <polygon points="63.16,25 54.5,30 45.84,25 45.84,15 54.5,10 63.16,15" fill="#F6C84C"/>
              </g>
            </svg>
          </div>

          <UCard class="pt-12 px-6 pb-6 bg-white/95 dark:bg-slate-800/95">
            <UAuthForm
              :fields="fields"
              :schema="schema"
              :providers="providers"
              title="Crear cuenta"
              align="top"
              :submit-button="{ label: 'Crear cuenta', trailingIcon: 'i-heroicons-user-plus-20-solid' }"
              @submit="onSubmit"
              :submit="{
                  label: 'Registrarse',
                  color: 'primary',
                }"
            >
              <template #description>
                ¿Ya tienes cuenta?
                <NuxtLink to="/login" class="text-primary font-medium">
                  Iniciar sesión
                </NuxtLink>.
              </template>

              <template #footer>
                Al registrarte aceptas nuestros
                <NuxtLink to="/" class="text-primary font-medium">
                  Términos y condiciones
                </NuxtLink>.
              </template>
            </UAuthForm>
          </UCard>

          <div class="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
            © {{ new Date().getFullYear() }} Flopi Docentes
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
