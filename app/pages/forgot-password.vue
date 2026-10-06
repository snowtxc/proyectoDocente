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
    size: 'xl',
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

    submit.value = false;
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
  <AuthShell
    saludo="Tranqui, a todos nos pasa."
    detalle="Decime tu correo y te mando los pasos para elegir una contraseña nueva."
  >
    <UAuthForm
      :fields="fields"
      :schema="schema"
      title="Recuperá tu acceso"
      align="top"
      :ui="{ title: 'font-display text-3xl font-bold text-mona-900', description: 'text-mona-800/80' }"
      @submit="onSubmit"
       :submit="{
          label: 'Enviarme el correo',
          color: 'primary',
          size: 'xl',
          class: 'justify-center font-display text-lg font-semibold text-mona-950 rounded-2xl',
          icon: 'tabler:arrow-narrow-right',
          loading:  submit
        }"
    >
      <template #description>
        Volver a
        <NuxtLink to="/login" class="text-mona-700 font-bold underline underline-offset-2">
          Iniciar sesión
        </NuxtLink>.
      </template>

      <template #footer>
        El correo puede tardar unos minutos. Revisá también la carpeta de spam.
      </template>
    </UAuthForm>
  </AuthShell>
</template>
