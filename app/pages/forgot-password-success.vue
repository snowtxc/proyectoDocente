<script setup lang="ts">
import { useAuthStore } from "~/services/authService/authService";

definePageMeta({
  layout: "auth",
});

useSeoMeta({
  title: "¡Correo enviado!",
});

const { forgotPassword } = useAuthStore();

const fields = [
  {
    name: "email",
    type: "email",
    label: "Email",
    placeholder: "Ingresar correo",
  },
];

const validate = (state: any) => {
  const errors = [];
  if (!state.email)
    errors.push({ path: "email", message: "El email es necesario" });
  return errors;
};

async function onSubmit(data: any) {
  const resp = await forgotPassword(data?.email);
  if (resp?.ok) {
    navigateTo({ path: "/forgot-password-success" });
    console.log("email enviado");
  } else {
    console.log("error: ", resp?.error);
  }
}
</script>

<template>
  <UCard class="max-w-sm w-full bg-white/75 dark:bg-white/5 backdrop-blur">
    <div class="flex flex-col text-center items-center gap-5">
      <span class="text-4xl">¡Chequea tu correo!</span>
      <span class="text-gray-300/80">Te enviamos un email con las instrucciones para restablecer tu contraseña.</span>
      <span class="text-3xl">📧</span>
    </div>
  </UCard>
</template>
