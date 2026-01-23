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
  label: 'Email',
  placeholder: 'Ingresar correo',
      required: true

}, {
  name: 'password',
  label: 'Contraseña',
  type: 'password',
  placeholder: 'Ingresar contraseña',
      required: true

}];

const { isReady, login: loginWithGoogle } = useCodeClient(googleSignInOptions);

const providers = [{
  label: 'Continuar con Google',
  icon: 'i-simple-icons-google',
  
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
  <div class="flex bg-gray-50 dark:bg-gray-900 min-h-screen">
    <div class="w-full bg-transparent rounded-lg overflow-hidden grid grid-cols-1 md:grid-cols-12 h-full">
      <!-- Left: Full image panel -->
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
            Planificaciones, secuencias y recursos en un solo lugar.
          </p>
        </div>
      </div>

      <!-- Right: Login box -->
      <div class="flex items-center justify-center p-8 bg-transparent dark:bg-slate-800 relative md:col-span-5">
        <div class="w-full max-w-sm relative">
          <!-- floating brand icon above the card -->
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
              title="Iniciar sesión"
              align="top"
              :divider="'o'"
              :providers="providers"
              :submit-button="{ label: 'Iniciar sesión', trailingIcon: 'i-heroicons-arrow-right-20-solid' }"
              @submit="onSubmit"
              :submit="{
                  label: 'Ingresar',
                  color: 'primary',
              }"
            >
              <template #description>
                ¿No tienes cuenta?
                <NuxtLink to="/signup" class="text-primary font-medium">
                  Crear cuenta
                </NuxtLink>.
              </template>

              <template #password-hint>
                <NuxtLink to="/forgot-password" class="text-primary font-medium">
                  Olvidaste la contraseña?
                </NuxtLink>
              </template>

              <template #footer>
                Al iniciar aceptas nuestros
                <NuxtLink to="/" class="text-primary font-medium">
                  Términos y condiciones
                </NuxtLink>.
              </template>
            </UAuthForm>
          </UCard>

          <!-- small footer under card -->
          <div class="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
            © {{ new Date().getFullYear() }} Proyecto Docentes
          </div>
        </div>
      </div>
    </div>
  </div>
</template>