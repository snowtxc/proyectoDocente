
import { useAuthStore } from "#imports";

export default defineNuxtRouteMiddleware(async(to, from) => {
    const authStore = useAuthStore();

    const { fullPath } = to;

    const isPublicRoute =  fullPath && fullPath != '/' && LIST_PUBLIC_ROUTES.some(route => fullPath.includes(route));

    if(!authStore.token && !isPublicRoute)
        return navigateTo("/login");

    if(authStore.token && isPublicRoute){
        return navigateTo('/home');
    }

    return;
})
