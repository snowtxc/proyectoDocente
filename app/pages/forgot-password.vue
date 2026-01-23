<script setup lang="ts">
import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum'
import { apiAuthRoutes } from '~/utils/apiRoutes'
import type { FormSubmitEvent } from '@nuxt/ui'
import * as z from 'zod'

definePageMeta({
  layout: 'auth'
})

useSeoMeta({
  title: 'Restablecer contraseña'
})

const { $apiRest } = useNuxtApp()
const toast = useToast()

const submit = ref(false)

/* -----------------------
   Fields
------------------------ */
const fields = [
  {
    name: 'email',
    type: 'email',
    label: 'Email',
    placeholder: 'Ingresar email',
    required: true
  }
]

/* -----------------------
   Schema
------------------------ */
const schema = z.object({
  email: z.email('Email inválido')
})

type Schema = z.output<typeof schema>

/* -----------------------
   Submit
------------------------ */
const onSubmit = async (payload: FormSubmitEvent<Schema>) => {
  if (submit.value) return
  submit.value = true

  try {
    const response = await $apiRest(
      apiAuthRoutes.forgotPassword,
      HttpMethodEnum.POST,
      payload.data
    )

    const { message } = response

    toast.success({
      message,
      color: 'green'
    })
  } catch (message: any) {
    toast.error({
      title: 'Error',
      message
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
            Recupera tu acceso
          </h1>
          <p class="text-xl text-white/90 mt-4 max-w-xl drop-shadow">
            Te enviaremos un correo para restablecer tu contraseña.
          </p>
        </div>
      </div>

      <!-- Right card -->
      <div class="flex items-center justify-center p-8 bg-transparent dark:bg-slate-800 relative md:col-span-5">
        <div class="w-full max-w-sm relative">

          <!-- Floating logo -->
          <div class="absolute -top-10 left-1/2 transform -translate-x-1/2">
            <!-- mismo SVG del login -->
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
              title="Restablecer contraseña"
              align="top"
              icon="heroicons:key-16-solid"
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
                Se enviará un correo con los pasos para restablecer tu contraseña.
              </template>
            </UAuthForm>
          </UCard>

          <div class="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
            © {{ new Date().getFullYear() }} Proyecto Docentes
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
