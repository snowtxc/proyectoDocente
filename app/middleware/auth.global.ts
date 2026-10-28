import { useAuthStore } from "#imports";
import { LIST_PUBLIC_ROUTES } from "~/utils/publicRoutes";
import { useSuscripcionStore } from "~/utils/suscripcionStore";
import { RUTAS_SIN_FORMATO, debeElegirFormato } from "~/utils/eleccionFormato";

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

  // Antes de usar Flopi, el docente elige cómo se ven sus planificaciones (paso obligatorio de Mi estilo).
  if (authStore.token && debeElegirFormato(authStore.user) && !RUTAS_SIN_FORMATO.includes(to.path)) {
    return navigateTo('/bienvenida')
  }
})
