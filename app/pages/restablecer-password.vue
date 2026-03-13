<script setup lang="ts">
import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum'
import { apiAuthRoutes} from '~/utils/apiRoutes'
import { appAuthRoutes } from '#imports'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { ResetPasswordDTO } from '~/types/auth'
import * as z from 'zod'

definePageMeta({
  layout: 'defaultTwo'
})

useSeoMeta({
  title: 'Restablecer contraseña'
})

const { $apiRest } = useNuxtApp()
const toast = useToast()
const route = useRoute()

const token = route.query.token as string

/* -----------------------
   Token Verification
------------------------ */
try {
  const responseVerifyToken = await $apiRest<{ invalidToken: string; message?: string }>(
    apiAuthRoutes.verifyTokenResetPassword(token),
    HttpMethodEnum.GET
  )

  console.log('responseVerifyToken', responseVerifyToken)

  if (responseVerifyToken.invalidToken) {
    toast.error({
      title: 'Error',
      message: responseVerifyToken.message || 'Token inválido'
    })
    navigateTo(appAuthRoutes.forgotPassword)
  }
} catch (error: any) {
  toast.error({
    title: 'Error',
    message: error.message || 'Error al verificar el token'
  })
  navigateTo(appAuthRoutes.forgotPassword)
}

const submit = ref(false)

/* -----------------------
   Fields
------------------------ */
const fields = [
  {
    name: 'newPassword',
    type: 'password',
    label: 'Nueva contraseña',
    placeholder: 'Nueva contraseña',
    required: true
  },
  {
    name: 'confirmPassword',
    type: 'password',
    label: 'Confirmar nueva contraseña',
    placeholder: 'Confirmar nueva contraseña',
    required: true
  }
]

/* -----------------------
   Schema
------------------------ */
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

const schema = z
  .object({
    newPassword: z
      .string()
      .min(1, 'Contraseña es requerida')
      .regex(
        passwordRegex,
        'La contraseña debe contener al menos una letra mayúscula, una minúscula, un número y un carácter especial'
      ),
    confirmPassword: z.string().min(1, 'Confirmación de contraseña es requerida')
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas deben coincidir',
    path: ['confirmPassword']
  })

type Schema = z.output<typeof schema>

/* -----------------------
   Submit
------------------------ */
const onSubmit = async (payload: FormSubmitEvent<Schema>) => {
  if (submit.value) return
  submit.value = true

  try {
    const body: ResetPasswordDTO = {
      token,
      password: payload.data.newPassword
    }

    const response = await $apiRest<{ invalidToken: boolean; message?: string }>(
      apiAuthRoutes.resetPassword,
      HttpMethodEnum.POST,
      body
    )

    if (response.invalidToken) {
      toast.error({
        title: 'Error',
        message: response.message || 'Error al intentar restablecer contraseña'
      })
      navigateTo(appAuthRoutes.forgotPassword)
      return
    }

    toast.success({
      message: response.message || 'Contraseña restablecida exitosamente'
    })

    navigateTo(appAuthRoutes.login)
  } catch (error: any) {
    toast.error({
      title: 'Error',
      message: error.message || 'Error al intentar restablecer contraseña'
    })
  } finally {
    submit.value = false
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
            Nueva contraseña
          </h1>
          <p class="text-xl text-white/90 mt-4 max-w-xl drop-shadow">
            Crea una nueva contraseña segura para tu cuenta.
          </p>
        </div>
      </div>

      <!-- Right card -->
      <div class="flex items-center justify-center p-8 bg-transparent dark:bg-slate-800 relative md:col-span-5">
        <div class="w-full max-w-sm relative">
          <!-- Floating logo -->
          <div class="absolute -top-10 left-1/2 transform -translate-x-1/2">
            <svg 
              width="100" 
              height="100" 
              viewBox="0 0 100 100" 
              xmlns="http://www.w3.org/2000/svg"
            >
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
              title="Restablecer Contraseña"
              align="top"
              icon="heroicons:lock-open-solid"
              :submit-button="{ label: 'Restablecer', trailingIcon: 'i-heroicons-paper-airplane-20-solid' }"
              @submit="onSubmit"
            >
              <template #description>
                Volver a
                <NuxtLink to="/login" class="text-primary font-medium">
                  Iniciar sesión
                </NuxtLink>.
              </template>

              <template #footer>
                Una vez reestablecida la contraseña se redireccionará para que pueda ingresar
              </template>
            </UAuthForm>
          </UCard>

          <div class="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
            © {{ new Date().getFullYear() }} Floi Docentes
          </div>
        </div>
      </div>
    </div>
  </div>
</template>