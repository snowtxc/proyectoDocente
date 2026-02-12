import { useAuthStore } from "~/utils/authStore";
import type { HttpMethodEnum } from "~/utils/enums/HttpMethodEnum";

export default defineNuxtPlugin((nuxtApp) => {

    const authStore = useAuthStore();
    const config = useRuntimeConfig();
    const { start, finish } = useLoadingIndicator();

    // ✅ Función getCookie mejorada
    const getCookie = (name) => {
        const match = document?.cookie?.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? match[2] : null;
    };

    const apiRest = async (endpoint: string, method: HttpMethodEnum, body: any, options: Record<string, any> = {}) => {
        const token = authStore.token;
        
        // ✅ 1. LEER COOKIE CORRECTA: XSRF-TOKEN (NO X-CSRF-TOKEN)
        let csrfToken = getCookie('XSRF-TOKEN');

        // ✅ 2. SI NO EXISTE, OBTENERLA DE /sanctum/csrf-cookie
        if (!csrfToken) {
            await $fetch(`${config.public.apiDomain}/sanctum/csrf-cookie`, {
                method: 'GET',
                credentials: 'include'
            });
            // ✅ RECUPERAR LA MISMA COOKIE XSRF-TOKEN
            csrfToken = getCookie('XSRF-TOKEN');
        }

        // ✅ 3. HEADER CORRECTO: X-XSRF-TOKEN (NO X-CSRF-TOKEN)
        const headers = {
            Accept: "application/json",
            "X-XSRF-TOKEN": csrfToken || "",  // 👈 CABECERA QUE SANCTUM ESPERA
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers
        };

        start();

        try {
            const response = await $fetch(`${config.public.apiBaseUrl}${endpoint}`, {
                method,
                ...options,
                headers,
                body,
                credentials: 'include' // ✅ OBLIGATORIO PARA ENVIAR COOKIES
            });
            finish();
            return response;
        } catch (e: any) {
            finish();
            const statusCode = e?.response?.status || e?.statusCode || e?.status;
            if (statusCode === 401) {
                authStore.clearToken();
                authStore.clearUser();
                navigateTo("/login");
            }
            const responseError = e?.response?._data || e?.data || e;
            const message = responseError?.message || responseError || 'An error occurred';
            throw message;
        }
    };

    nuxtApp.provide("apiRest", apiRest);
});