<script setup lang="ts">

    import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum';
    import { apiAuthRoutes } from '~/utils/apiRoutes';

    definePageMeta({
        layout: 'auth',
    })

    const { $apiRest }  = useNuxtApp();
    const toast = useToast();

    const submit = ref(false);

    const fields = [{
        name: 'email',
        type: 'email',
        label: 'Email',
        placeholder: 'Ingresar email'
    }];


    const validate = (state: any) => {
        const errors = []
        if (!state.email) errors.push({ path: 'email', message: 'El email es requerido' })
        
        return errors
    }

    const onSubmit = async(form: { email: string})=>{
        if(submit.value)
            return;
        submit.value = true;

        try{
            const response = await $apiRest(apiAuthRoutes.forgotPassword, HttpMethodEnum.POST,form);
            const { message } = response;

            toast.add({
                title: "Exito",
                description: message,
                color: "green"
            })

        }catch(message){
            toast.add({
                title: "Error",
                description: message ? message : 'Error al intentar restablecer contraseña',
                color: "red"
            })
        }

    }

</script>

<template>
    <UCard class="max-w-sm w-full bg-white/75 dark:bg-white/5 backdrop-blur">
        
        <UAuthForm
        :fields="fields"
        :validate="validate"
        align="top"
        title="Restablecer Contraseña"
        icon="heroicons:key-16-solid"
        :ui="{ base: 'text-center', footer: 'text-center' }"
        :submit-button="{ label: 'Restablecer' }"
        @submit="onSubmit"
        >
        <template #description>
            Volver a Inicio de Sesión <NuxtLink
              to="/login"
              class="text-primary font-medium"
            >Iniciar sesión</NuxtLink>.
          </template>

          <template #footer>
            Se enviará un mail a su correo para proseguir con el restablecimiento de la contraseña
          </template>
    </UAuthForm>
    </UCard>
</template>