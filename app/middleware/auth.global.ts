
import { useAuthStore } from "#imports";



export default defineNuxtRouteMiddleware(async(to, from) => {
    const authStore = useAuthStore();

    const { fullPath } = to;
    const isPublicRoute = LIST_PUBLIC_ROUTES.findIndex(route => route == fullPath) >= 0;

    if(!authStore.token && !isPublicRoute)
        return navigateTo("/login");

    if(authStore.token && isPublicRoute){
        return navigateTo('/home');
    }

    return;
})
