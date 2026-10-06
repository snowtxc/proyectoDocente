<script setup lang="ts">
import type { LoginDTO } from '~/types/user';
import { apiAuthRoutes } from "~/utils/apiRoutes";
import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum';
import { useAuthStore } from '#imports';
import type { FormSubmitEvent } from '@nuxt/ui';
import * as z from 'zod'

import {
  useCodeClient,
  type ImplicitFlowSuccessResponse,
  type ImplicitFlowErrorResponse,
  type ImplicitFlowOptions
} from "vue3-google-signin";

definePageMeta({
  layout: 'auth',
});

useSeoMeta({
  title: 'Iniciar sesión'
});

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
    toast.error({
      message: errorResponse.error_description,
      color: "red"
    });
  }
};

const { $apiRest } = useNuxtApp();
const toast = useToast();
const authStore = useAuthStore();

const fields = [{
  name: 'email',
  type: 'email',
  size: 'xl',
  label: 'Email',
  placeholder: 'tu@correo.com',
      required: true

}, {
  name: 'password',
  label: 'Contraseña',
  type: 'password',
  size: 'xl',
  placeholder: 'Tu contraseña',
      required: true

}];

const { isReady, login: loginWithGoogle } = useCodeClient(googleSignInOptions);

const providers = [{
  label: 'Continuar con Google',
  icon: 'i-simple-icons-google',
  size: 'xl',
  color: 'neutral',
  variant: 'outline',
  class: 'justify-center rounded-2xl font-bold',
  
  onClick: () => {
    loginWithGoogle();
  }
}];

const schema = z.object({
  email: z.email('Email inválido'),
  password: z
  .string('La contraseña es obligatoria')
  .min(8, 'Debe tener al menos 8 caracteres')
})

type Schema = z.output<typeof schema>
  

async function onSubmit(payload: FormSubmitEvent<Schema>) {

  const { email , password } = payload.data;

  const loginInfo: LoginDTO = {
    email,
    password
  };

  try {
    const response = await $apiRest(apiAuthRoutes.login, HttpMethodEnum.POST, loginInfo);
    const { token, user } = response;
    authStore.setToken(token);
    authStore.setUser(user);
    await navigateTo("/home");
  } catch (errorMessage: any) {
    toast.error({
      title: "Error",
      message: errorMessage,
    });
  }
}
</script>

<template>
  <AuthShell
    saludo="¡Qué bueno verte de nuevo!"
    detalle="Entrá y seguimos con tus planificaciones donde las dejaste."
  >
    <UAuthForm
      :fields="fields"
      :schema="schema"
      title="Entrá a tu cuenta"
      align="top"
      :ui="{ title: 'font-display text-3xl font-bold text-mona-900', description: 'text-mona-800/80' }"
      separator="o"
      :providers="providers"
      :submit-button="{ label: 'Iniciar sesión', trailingIcon: 'i-heroicons-arrow-right-20-solid' }"
      @submit="onSubmit"
      :submit="{
        label: 'Entrar',
        color: 'primary',
        size: 'xl',
        class: 'justify-center font-display text-lg font-semibold text-mona-950 rounded-2xl',
      }"
    >
      <template #description>
        ¿No tenés cuenta?
        <NuxtLink to="/signup" class="text-mona-700 font-bold underline underline-offset-2">
          Crear cuenta
        </NuxtLink>.
      </template>

      <template #password-hint>
        <NuxtLink to="/forgot-password" class="text-mona-700 font-bold underline underline-offset-2">
          ¿Olvidaste la contraseña?
        </NuxtLink>
      </template>

      <template #footer>
        Al entrar aceptás nuestros
        <NuxtLink to="/terminos-y-condiciones" class="text-mona-700 font-bold underline underline-offset-2">
          Términos y condiciones
        </NuxtLink>.
      </template>
    </UAuthForm>
  </AuthShell>
</template>
