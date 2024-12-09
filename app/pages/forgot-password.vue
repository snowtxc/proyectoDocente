<script setup lang="ts">
import { useAuthStore } from '~/services/authService/authService';

definePageMeta({
  layout: 'auth'
})

useSeoMeta({
  title: 'Resetear contraseña'
})

const { forgotPassword } = useAuthStore()

const fields = [{
  name: 'email',
  type: 'email',
  label: 'Email',
  placeholder: 'Ingresar correo'
}]

const validate = (state: any) => {
  const errors = []
  if (!state.email) errors.push({ path: 'email', message: 'El email es necesario' })
  return errors
}


async function onSubmit(data: any) {
  const resp = await forgotPassword(data?.email)
  if (resp?.ok) {
    navigateTo({ path: '/forgot-password-success' });
    console.log("email enviado");
  } else {
    console.log("error: ", resp?.error);
  }
}
</script>

<template>
  <UCard class="max-w-sm w-full bg-white/75 dark:bg-white/5 backdrop-blur">
    <UAuthForm
      :fields="fields"
      :validate="validate"
      title="Restablecer Contraseña"
      align="top"
      :divider="'o'"
      icon="i-heroicons-lock-open"
      :ui="{ base: 'text-center', footer: 'text-center' }"
      :submit-button="{ label: 'Enviar email', trailingIcon: 'i-heroicons-arrow-right-20-solid' }"
      @submit="onSubmit"
    >
      <template #description>
        Enviaremos un email con las instrucciones para restablecer tu contraseña.
      </template>
    </UAuthForm>
  </UCard>
</template>
