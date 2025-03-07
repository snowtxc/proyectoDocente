<script setup lang="ts">

import type { LoginDTO } from '~/types/user';
import { apiAuthRoutes } from "~/utils/apiRoutes";
import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum';
import { useAuthStore } from '~/utils/authStore';

definePageMeta({
  layout: 'auth',
})

useSeoMeta({
  title: 'Iniciar sesión'
})

const { $apiRest } = useNuxtApp();
const toast = useToast();
const authStore = useAuthStore();

import {
  useCodeClient,
  type ImplicitFlowSuccessResponse,
  type ImplicitFlowErrorResponse,
  type ImplicitFlowOptions
} from "vue3-google-signin";


const googleSignInOptions: ImplicitFlowOptions = {
  scope: googleScopes,
  onSuccess: async(response: ImplicitFlowSuccessResponse) => {
    try{
      const { code } = response;
      const responseGoogle =  await $apiRest(apiAuthRoutes.loginWithGoogleCallback, HttpMethodEnum.POST, { code });
      if(responseGoogle){
        const { user, token } = responseGoogle;
        authStore.setToken(token);
        authStore.setUser(user);
        navigateTo({ path: '/home' });
      }
    }catch(e){
      // ToDo
    }
   
  },
  onError: (errorResponse: ImplicitFlowErrorResponse) => {
    toast.add({
      title: "Error",
      description: errorResponse.error_description,
      color: "red"
    });
  }
};

const { isReady, login: loginWithGoogle } = useCodeClient(googleSignInOptions);

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

  try{
    const response =  await $apiRest(apiAuthRoutes.login, HttpMethodEnum.POST, loginInfo);
    const { token , user} = response;
    authStore.setToken(token);
    authStore.setUser(user);
    navigateTo("/home");

  }catch(messageError){
    toast.add({
      title: "Error",
      description: messageError,
      color: "red"
    })
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
          to="/forgot-password"
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
