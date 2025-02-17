<script setup lang="ts">
import { useAuthStore } from '~/services/authService/authService';
import type { FormError, FormSubmitEvent } from '#ui/types'
import type { UpdateUserProfileDTO } from '~/types/user';
import { useErrorStore } from "~/services/errorService/errorService";

const authService = useAuthStore();
const errorService =   useErrorStore();

const user = computed(() => authService.user);
const { updateProfile } = authService;
const updating = ref(false);

const fileRef = ref<HTMLInputElement>()
const isDeleteAccountModalOpen = ref(false)

const form = reactive<UpdateUserProfileDTO>({
  nombre1: user.value.nombre1,
  nombre2: user.value.nombre2 || "",
  apellido1: user.value.apellido1 || "",
  apellido2: user.value.apellido2 || "",
  nuevoAvatar: undefined
})

const toast = useToast()

function validate(state: any): FormError[] {
  const errors = []
  if (!form.nombre1) errors.push({ path: 'nombre1', message: 'Por favor ingresa tu nombre.' })
  if (!form.apellido1) errors.push({ path: 'apellido1', message: 'Por favor ingresa tu apellido.' })
  if ((state.password_current && !state.password_new) || (!state.password_current && state.password_new)) errors.push({ path: 'password', message: 'Please enter a valid password.' })
  return errors
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files[0]; 
  const reader = new FileReader();

  const extension = file.name.split(".").pop();
  if(extension != 'jpg' && extension != 'png' && extension != 'jpeg' && extension != 'gif'){
    errorService.setError("Sólo se permite estos tipos de archivos .jpg, .jpeg, .png, .gif")
    return;
  }

  reader.onload = () => {
    const base64String = reader.result as string;   

    // Guardamos en formato base64. 
    form.nuevoAvatar = base64String;
  };
  reader.readAsDataURL(file);
 }

function onFileClick() {
  fileRef.value?.click()
}

async function onSubmit(event: FormSubmitEvent<any>) {
  updating.value = true;
  const resp = await updateProfile(form);
  form.nuevoAvatar = undefined;
  updating.value = false;
  if(resp.ok){
    toast.add({ title: 'Perfil actualizado!', icon: 'i-heroicons-check-circle' })
  }
}

</script>

<template>
  <UDashboardPanelContent class="pb-24">
    
    <UDashboardSection title="Personalización de Tema" description="Personaliza la apariencia y el diseño del sistema">
      <template #links>
        <UColorModeSelect color="gray" />


      </template>
    </UDashboardSection>

    <UDivider class="mb-4" />

    <UForm :state="form" :validate="validate" :validate-on="['submit']" @submit="onSubmit">
      <UDashboardSection title="Perfil" description="Esta información corresponde a tu datos personales.">
        <template #links>
          <UButton type="submit" label="Guardar Cambios" color="black" :disabled="updating" />
        </template>

        <UFormGroup name="avatar" class="flex justify-center" help="JPG, GIF or PNG. 2MB Max."
          :ui="{ container: 'flex flex-wrap items-center gap-3', help: 'mt-0' }">
          <div class="flex flex-col items-center">
            <UAvatar :src="form.nuevoAvatar ? form.nuevoAvatar : user.url_image_profile" :alt="form.nombre1" size="3xl" />

            <UButton label="Importar Foto de Perfil" class="mt-2"  color="white" size="md" @click="onFileClick" />
          </div>


          <input ref="fileRef" type="file" class="hidden" accept=".jpg, .jpeg, .png, .gif" @change="onFileChange">
        </UFormGroup>


        <UFormGroup name="email" label="Correo Electrónico" description="Usado para ingresar al Sistema." required
          class="grid grid-cols-2 gap-2" :ui="{ container: '' }">
          <UInput v-model="user.email" :disabled="true" type="email" autocomplete="off" icon="i-heroicons-envelope"
            size="md" />
        </UFormGroup>

        <UFormGroup name="nombre1" label="Primer Nombre" required class="grid grid-cols-2 gap-2 items-center"
          :ui="{ container: '' }">
          <UInput v-model="form.nombre1" autocomplete="off" icon="i-heroicons-user" size="md" />
        </UFormGroup>
        
        <UFormGroup name="name" label="Segundo Nombre" class="grid grid-cols-2 gap-2 items-center"
          :ui="{ container: '' }">
          <UInput v-model="form.nombre2" autocomplete="off" icon="i-heroicons-user" size="md" />
        </UFormGroup>

        <UFormGroup name="apellido1" label="Primer Apellido" required class="grid grid-cols-2 gap-2 items-center"
          :ui="{ container: '' }">
          <UInput v-model="form.apellido1" autocomplete="off" icon="i-heroicons-user" size="md" />
        </UFormGroup>


        <UFormGroup name="apellido2" label="Segundo Apellido" class="grid grid-cols-2 gap-2 items-center"
          :ui="{ container: '' }">
          <UInput v-model="form.apellido2" autocomplete="off" icon="i-heroicons-user" size="md" />
        </UFormGroup>

      </UDashboardSection>
    </UForm>

    <UDivider class="mb-4" />

    <UDashboardSection title="Cuenta"
      description="¿Ya no deseas usar nuestro servicio? Puedes eliminar tu cuenta aquí. Esta acción no es reversible. Toda la información relacionada con esta cuenta se eliminará de forma permanente.">
      <div>
        <UButton color="red" label="Eliminar Cuenta" size="md" @click="isDeleteAccountModalOpen = true" />
      </div>
    </UDashboardSection>

    <!-- ~/components/settings/DeleteAccountModal.vue -->
    <SettingsDeleteAccountModal v-model="isDeleteAccountModalOpen" />
  </UDashboardPanelContent>
</template>
