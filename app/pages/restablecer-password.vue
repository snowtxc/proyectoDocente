<script setup lang="ts">
    import type { ResetPasswordDTO } from '~/types/auth';
import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum';

    definePageMeta({
        layout: 'auth',
    })

    const { $apiRest  } = useNuxtApp();
    const toast = useToast();

    const route = useRoute()

    const token = route.query.token as string;

    const responseVerifyToken = await $apiRest<{invalidToken: string, message?: string}>(apiAuthRoutes.verifyTokenResetPassword(token), HttpMethodEnum.GET);

    if(responseVerifyToken.invalidToken){
        toast.add({
            title: "Error",
            description: responseVerifyToken.message,
            color: "red"
        });
        navigateTo(appAuthRoutes.forgotPassword);
    }

    const submit = ref<boolean>(false);

    const fields = [{
        name: 'newPassword',
        type: 'password',
        label: 'Nueva contraseña',
        placeholder: 'Nueva contraseña'
    },
    {
        name: 'confirmPassword',
        type: 'password',
        label: 'Confirmar nueva contraseña',
        placeholder: 'Confirmar nueva contraseña'
    }];


    const validate = (state: {newPassword: string, confirmPassword: string}) => {

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        const errors = []
        if (!state.newPassword) errors.push({ path: 'newPassword', message: 'Contraseña es requerida' })
        if(state.newPassword  && !passwordRegex.test(state.newPassword)) errors.push({ path: 'newPassword', message: 'La contraseña no es válida. Debe contener al menos una letra mayúscula, una minúscula, un número y un carácter especial.' })
        if(!state.confirmPassword) errors.push({ path: 'confirmPassword', message: 'Confirmación de contraseña es requerido' });
        if(state.newPassword !== state.confirmPassword) errors.push({ path: 'confirmPassword', message: 'Debe coincidir con la contraseña' });
        
        return errors
    }

    const onSubmit = async(form: { newPassword: string, confirmPassword: string})=>{

        if(submit.value)
            return;
        submit.value = true;

        try{
            const body : ResetPasswordDTO = {
                token,
                password: form.newPassword
            };

            const response = await $apiRest<{invalidToken: boolean, message?: string}>(apiAuthRoutes.resetPassword, HttpMethodEnum.POST,body);

            const { message } = response;

            if(response.invalidToken){
                toast.add({
                    title: "Error",
                    description: message ? message : 'Error al intentar restablecer contraseña',
                    color: "red"
                })
                navigateTo(appAuthRoutes.forgotPassword);
                return;
            }

            toast.add({
                title: "Exito",
                description: message,
                color: "green"
            })

            navigateTo(appAuthRoutes.login);

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
        icon="heroicons:lock-open-solid"
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
            Una vez reestablecida la contraseña se redireccionará para que pueda ingresar
          </template>
    </UAuthForm>
    </UCard>
</template>