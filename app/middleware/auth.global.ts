import { useAuthStore } from "#imports";
import { LIST_PUBLIC_ROUTES } from "~/utils/publicRoutes";
import { useSuscripcionStore } from "~/utils/suscripcionStore";

export default defineNuxtRouteMiddleware((to) => {

  const authStore = useAuthStore()

  const publicRoutes = LIST_PUBLIC_ROUTES
  const isPublicRoute = publicRoutes.includes(to.path)

  if (!authStore.token && !isPublicRoute) {
    return navigateTo('/login')
  }

  if (authStore.token && isPublicRoute) {
    return navigateTo('/home')
  }

  // Con el período vencido, la única pantalla disponible es la de renovar.
  if (authStore.token && useSuscripcionStore().vencida && to.path !== '/suscripcion') {
    return navigateTo('/suscripcion')
  }
})
