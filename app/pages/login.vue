
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
  if (!state.password) errors.push({ path: 'password', message: 'Contraseña es requerida' })
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
  <div class="flex bg-gray-50 dark:bg-gray-900 min-h-screen">
    <div class="w-full bg-transparent rounded-lg overflow-hidden grid grid-cols-1 md:grid-cols-12 h-full">


      <!-- Left: Full image panel -->
     <div class="hidden md:flex relative h-full min-h-screen md:col-span-7">
  <!-- Imagen -->
      <img
        src="/wallpaper-login.png"
        alt="Docentes"
        class="w-full h-full object-cover"
      />

      <!-- Overlay de texto -->
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
             <svg width="100" height="100" viewBox="0 0 100 100" role="img" aria-labelledby="hcTitle hcDesc" xmlns="http://www.w3.org/2000/svg">
  <title id="hcTitle">Logo panal de abeja</title>
  <desc id="hcDesc">Patrón de hexágonos amarillo, estilo panal</desc>

  <!-- optional soft shadow -->
  <defs>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.12"/>
    </filter>
  </defs>

  <!-- hexagons -->
  <g transform="translate(2,2)" filter="url(#softShadow)">
    <polygon points="28.66,25 20,30 11.34,25 11.34,15 20,10 28.66,15" fill="#F6C84C" stroke="#D99A00" stroke-width="1.5" stroke-linejoin="round"/>
    <polygon points="45.91,25 37.25,30 28.59,25 28.59,15 37.25,10 45.91,15" fill="#F6C84C" stroke="#D99A00" stroke-width="1.5" stroke-linejoin="round"/>
    <polygon points="63.16,25 54.5,30 45.84,25 45.84,15 54.5,10 63.16,15" fill="#F6C84C" stroke="#D99A00" stroke-width="1.5" stroke-linejoin="round"/>

    <polygon points="20.99,41.66 12.33,46.66 3.67,41.66 3.67,31.66 12.33,26.66 20.99,31.66" fill="#F6C84C" stroke="#D99A00" stroke-width="1.5" stroke-linejoin="round"/>
    <polygon points="38.24,41.66 29.58,46.66 20.92,41.66 20.92,31.66 29.58,26.66 38.24,31.66" fill="#F6C84C" stroke="#D99A00" stroke-width="1.5" stroke-linejoin="round"/>
    <polygon points="55.49,41.66 46.83,46.66 38.17,41.66 38.17,31.66 46.83,26.66 55.49,31.66" fill="#F6C84C" stroke="#D99A00" stroke-width="1.5" stroke-linejoin="round"/>

    <polygon points="37.32,58.32 28.66,63.32 20,58.32 20,48.32 28.66,43.32 37.32,48.32" fill="#F6C84C" stroke="#D99A00" stroke-width="1.5" stroke-linejoin="round"/>
    <polygon points="54.57,58.32 45.91,63.32 37.25,58.32 37.25,48.32 45.91,43.32 54.57,48.32" fill="#F6C84C" stroke="#D99A00" stroke-width="1.5" stroke-linejoin="round"/>
    <polygon points="71.82,58.32 63.16,63.32 54.5,58.32 54.5,48.32 63.16,43.32 71.82,48.32" fill="#F6C84C" stroke="#D99A00" stroke-width="1.5" stroke-linejoin="round"/>
  </g>
            w</svg>
          </div>

          <UCard class="pt-12 px-6 pb-6 bg-white/95 dark:bg-slate-800/95">
            <UAuthForm
              class=""
              :fields="fields"
              :validate="validate"
              :providers="providers"
              title="Iniciar sesión"
              align="top"
              :divider="'o'"
              icon=""
              :ui="{ base: 'text-center', footer: 'text-center' }"
              :submit-button="{ label: 'Iniciar sesión', trailingIcon: 'i-heroicons-arrow-right-20-solid' }"
              @submit="onSubmit"
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


