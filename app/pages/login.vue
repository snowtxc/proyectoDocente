<script setup lang="ts">
// import { login } from '~/services/authService/authService';
import { useAuthStore } from '~/services/authService/authService';
import type { LoginDTO } from '~/types/user';

definePageMeta({
  layout: 'auth'
})

useSeoMeta({
  title: 'Iniciar sesión'
})


import {
  useTokenClient,
  type AuthCodeFlowSuccessResponse,
  type AuthCodeFlowErrorResponse,
} from "vue3-google-signin";

import { useErrorStore } from '~/services/errorService/errorService';

const errorService =   useErrorStore();

const { login, loginWithGoogleCallback } = useAuthStore()

const handleOnSuccess = async(response: AuthCodeFlowSuccessResponse) => {
  const responseGoogle =  await loginWithGoogleCallback(response.access_token);
  if(responseGoogle){
    navigateTo({ path: '/home' });
  }
}


const handleOnError = (errorResponse: AuthCodeFlowErrorResponse) => {
  errorService.setError(errorResponse.error_description);
};

const { isReady, login: loginWithGoogle } = useTokenClient({
  onSuccess: handleOnSuccess,
  onError: handleOnError,
});


const fields = [{
  name: 'email',
  type: 'email',
  label: 'Email',
  placeholder: 'Ingresar correo'
}, {
  name: 'password',
  label: 'Contraseña',
  type: 'password',
  placeholder: 'Ingresar contraseña'
}]

const validate = (state: any) => {
  const errors = []
  if (!state.email) errors.push({ path: 'email', message: 'Email is required' })
  if (!state.password) errors.push({ path: 'password', message: 'Password is required' })
  return errors
}

const providers = [{
  label: 'Continuar con Google',
  icon: 'i-simple-icons-google',
  color: 'white' as const,
  click: () => {
    // Se abré el login en base a nuestro client-id generado
    loginWithGoogle();
  }
}]


async function onSubmit(data: any) {
  const loginInfo: LoginDTO = {
    email: data?.email,
    password: data?.password
  }
  const resp = await login(loginInfo)
  if (resp?.ok) {
    console.log("cuenta creada");
  } else {
  }
}
</script>

<!-- eslint-disable vue/multiline-html-element-content-newline -->
<!-- eslint-disable vue/singleline-html-element-content-newline -->
<template>
  <UCard class="max-w-sm w-full bg-white/75 dark:bg-white/5 backdrop-blur">
    <UAuthForm
      :fields="fields"
      :validate="validate"
      :providers="providers"
      title="Bienvenido"
      align="top"
      :divider="'o'"
      icon="i-heroicons-lock-closed"
      :ui="{ base: 'text-center', footer: 'text-center' }"
      :submit-button="{ label: 'Iniciar sesión', trailingIcon: 'i-heroicons-arrow-right-20-solid' }"
      @submit="onSubmit"
    >
      <template #description>
        No tienes cuenta? <NuxtLink
          to="/signup"
          class="text-primary font-medium"
        >Crear cuenta</NuxtLink>.
      </template>

      <template #password-hint>
        <NuxtLink
          to="/"
          class="text-primary font-medium"
        >Olvidaste la contraseña?</NuxtLink>
      </template>

      <template #footer>
        Iniciando, aceptas nuestros <NuxtLink
          to="/"
          class="text-primary font-medium"
        >Terminos y condiciones</NuxtLink>.
      </template>
    </UAuthForm>
  </UCard>
</template>
