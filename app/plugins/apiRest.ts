import { useAuthStore } from "~/utils/authStore";
import type { HttpMethodEnum } from "~/utils/enums/HttpMethodEnum";

export default defineNuxtPlugin((nuxtApp) => {
    const authStore = useAuthStore();
    const config = useRuntimeConfig();
    const { start, finish } = useLoadingIndicator();

    // ✅ Función getCookie con decodeURIComponent
    const getCookie = (name) => {
        const match = document?.cookie?.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? decodeURIComponent(match[2]) : null;
    };

    const apiRest = async (endpoint: string, method: HttpMethodEnum, body: any, options: Record<string, any> = {}) => {
        const token = authStore.token;
        
        // ✅ 1. SIEMPRE obtener CSRF cookie fresco (NO condicional)
        await $fetch(`${config.public.apiDomain}/sanctum/csrf-cookie`, {
            method: 'GET',
            credentials: 'include'
        });
        
        // ✅ 2. Leer cookie CORRECTA: XSRF-TOKEN (NO X-CSRF-TOKEN)
        const csrfToken = getCookie('XSRF-TOKEN');
        
        // ✅ 3. Header CORRECTO: X-XSRF-TOKEN (NO X-CSRF-TOKEN)
        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-XSRF-TOKEN': csrfToken || '',  // 👈 ESTE ES EL HEADER QUE SANCTUM ESPERA
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...options.headers
        };

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
            
            // ✅ 4. MANEJO ESPECÍFICO PARA CSRF MISMATCH (419)
            if (statusCode === 419) {
                console.warn('🔄 CSRF token expirado, reintentando...');
                // Reintentar automáticamente UNA VEZ
                return apiRest(endpoint, method, body, options);
            }
            
            // ✅ 5. Manejo de 401 Unauthorized
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