import { useAuthStore } from "~/utils/authStore";
import type { HttpMethodEnum } from "~/utils/enums/HttpMethodEnum";

export default defineNuxtPlugin((nuxtApp) => {

    const authStore = useAuthStore();

    const config = useRuntimeConfig();
    const { start, finish } = useLoadingIndicator();

    const getCookie = (name) => {
        const match = document?.cookie?.match(new RegExp('(^| )' + name + '=([^;]+)')) || null;
        if (match) 
            return match[2];
        else
            return null;
    };

    // Definir el tipo de la función `apiRest`
    const apiRest = async(endpoint: string, method: HttpMethodEnum, body: any, options: Record<string, any> = {}) => {
        const token = authStore.token;
        
        let csrfToken = getCookie('XSRF-TOKEN');

        if(!csrfToken){
            await $fetch(`http://localhost:8000/sanctum/csrf-cookie`, { method : 'GET', credentials: 'include'});
            csrfToken = getCookie('X-CSRF-TOKEN');
        }

        const headers = token ? {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "X-CSRF-TOKEN": csrfToken || "",
            ...options.headers
        } : {
            Accept: "application/json",
            "X-CSRF-TOKEN": csrfToken || "",
            ...options.headers
        };

        start();

        try{
            const response = await $fetch(`${config.public.apiBaseUrl}${endpoint}`, {
                method,
                ...options,
                headers,
                body,
                credentials: 'include'
            });
            finish();
            return response;
        }catch(e){
            finish();
            const statusCode = e.response.status;  // Aquí obtenemos el código de estado
            if(statusCode == 401){
                authStore.clearToken();
                authStore.clearUser();
                navigateTo("/login");
            }
            const responseError = await e.response._data;
            const { message } = responseError;
            throw message;
        }        
    };

    // Proveer la función tipada
    nuxtApp.provide("apiRest", apiRest);
});