<script setup lang="ts">

import { useAuthStore } from '~/utils/authStore';

import { apiAuthRoutes } from "~/utils/apiRoutes";

import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum';

import type { CreateUserDTO } from '~/types/user';

definePageMeta({
  layout: 'auth'
})

useSeoMeta({
  title: 'Crear cuenta'
})

const {  $apiRest  } = useNuxtApp();
const toast = useToast()
const authStore = useAuthStore();


const fields = [{
  name: 'name',
  type: 'text',
  label: 'Nombres',
  placeholder: 'Ingresa tu nombre'
},
{
  name: 'lastname',
  type: 'text',
  label: 'Apellidos',
  placeholder: 'Ingresa tu apellido'
},
{
  name: 'email',
  type: 'email',
  label: 'Email',
  placeholder: 'Ingresar email'
}, {
  name: 'password',
  label: 'Contraseña',
  type: 'password',
  placeholder: 'Ingresar contraseña'
}]

const validate = (state: any) => {
  const errors = []
  if (!state.email) errors.push({ path: 'email', message: 'El email es requerido' })
  if (!state.password) errors.push({ path: 'password', message: 'La contraseña es requerida' })
  if (!state.name) errors.push({ path: 'name', message: 'El nombre el requerido' })

  return errors
}

const providers = [{
  label: 'Continuar con Google',
  icon: 'i-simple-icons-google',
  color: 'white' as const,
  click: () => {
    console.log('Redirect to GitHub login')
  }
}]

async function onSubmit(data: any) {
  const signUpInfo: CreateUserDTO = {
    nombre1: `${data?.name?.split(" ")[0]}`,
    nombre2: `${data?.name?.split(" ")[1] || ""}`,
    apellido1: `${data?.lastname?.split(" ")[0]}`,
    apellido2: `${data?.lastname?.split(" ")[1] || ""}`,
    email: `${data?.email}`,
    password: `${data?.password}`
  }
  try{
    const response =  await $apiRest(apiAuthRoutes.register, HttpMethodEnum.POST, signUpInfo);
    const { user, token }  = response;

    authStore.setToken(token);
    authStore.setUser(user);

    navigateTo('/home');

    toast.add({
      title: "Cuenta Creada",
      description: "Se ha creado correctamente su cuenta",
      color: "green"
    });

  }catch(message){
    toast.add({
      title: "Error",
      description: message,
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
      align="top"
      title="Crear cuenta"
      :ui="{ base: 'text-center', footer: 'text-center' }"
      :submit-button="{ label: 'Crear cuenta' }"
      @submit="onSubmit"
    >
      <template #description>
        Ya tienes una cuenta? <NuxtLink
          to="/login"
          class="text-primary font-medium"
        >Iniciar sesión</NuxtLink>.
      </template>

      <template #footer>
        Registrandote, aceptas nuestros <NuxtLink
          to="/"
          class="text-primary font-medium"
        >Terminos y condiciones</NuxtLink>.
      </template>
    </UAuthForm>
  </UCard>
</template>
