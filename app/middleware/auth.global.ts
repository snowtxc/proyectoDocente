import { useAuthStore } from "#imports";
import { LIST_PUBLIC_ROUTES } from "~/utils/publicRoutes";

export default defineNuxtRouteMiddleware((to) => {

  if (process.server) return

  const authStore = useAuthStore()

  const publicRoutes = LIST_PUBLIC_ROUTES
  const isPublicRoute = publicRoutes.includes(to.path)

  if (!authStore.token && !isPublicRoute) {
    return navigateTo('/login')
  }

  if (authStore.token && to.path === '/login') {
    return navigateTo('/home')
  }
})
