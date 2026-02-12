import { useAuthStore } from "~/utils/authStore";
import type { HttpMethodEnum } from "~/utils/enums/HttpMethodEnum";

export default defineNuxtPlugin((nuxtApp) => {
    const authStore = useAuthStore();
    const config = useRuntimeConfig();
    const { start, finish } = useLoadingIndicator();

    const getCookie = (name) => {
        const match = document?.cookie?.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? decodeURIComponent(match[2]) : null;
    };

    const apiRest = async (endpoint: string, method: HttpMethodEnum, body: any, options: Record<string, any> = {}) => {
        const token = authStore.token;
        
        await $fetch(`${config.public.apiDomain}/sanctum/csrf-cookie`, {
            method: 'GET',
            credentials: 'include'
        });
        
        const csrfToken = getCookie('XSRF-TOKEN');
        
        const headers = {
            Accept: "application/json",
            "Content-Type": "application/json",
            "X-XSRF-TOKEN": csrfToken || "", // 👈 ESTE ES EL BUENO
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers
        };

        console.log('✅ Enviando headers:', {
            'X-XSRF-TOKEN': csrfToken?.substring(0, 20) + '...',
            Authorization: token ? 'Bearer ...' : 'none'
        });

        start();

        try {
            const response = await $fetch(`${config.public.apiBaseUrl}${endpoint}`, {
                method,
                headers,
                body,
                credentials: 'include',
                ...options
            });
            finish();
            return response;
            
        } catch (e: any) {
            finish();
            
            const statusCode = e?.response?.status || e?.statusCode;
            const responseData = e?.response?._data || e?.data;
            
            console.error('❌ Error API:', { statusCode, responseData });

            // ✅ 5. MANEJAR 422 VALIDATION ERROR (¡LO QUE TE FALTA!)
            if (statusCode === 422) {
                // Lanzar error de validación con todos los detalles
                throw {
                    status: 422,
                    message: responseData?.message || 'Error de validación',
                    errors: responseData?.errors || {},
                    data: responseData
                };
            }

            if (statusCode === 419) {
                console.warn('🔄 CSRF expirado, reintentando...');
                return apiRest(endpoint, method, body, options);
            }

            if (statusCode === 401) {
                authStore.clearToken();
                authStore.clearUser();
                navigateTo("/login");
            }

            const message = responseData?.message || responseData || 'An error occurred';
            throw message;
        }
    };

    nuxtApp.provide("apiRest", apiRest);
});