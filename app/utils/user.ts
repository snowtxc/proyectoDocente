import { useAuthStore } from "~/services/authService/authService";
import { useErrorStore } from "~/services/errorService/errorService";
import { useLoadingStore } from "~/services/loadingService/loadingService";

export const DEFAULT_STORAGE_TOKEN_KEY = "mySessionKey";

export const handleGetSotredToken = () => {
    return localStorage.getItem(DEFAULT_STORAGE_TOKEN_KEY);
}

export const handleSetStoredToken = (token: string) => {
    localStorage.setItem(DEFAULT_STORAGE_TOKEN_KEY, token)
}

export const handleCleanStoredToken = () => {
    localStorage.removeItem(DEFAULT_STORAGE_TOKEN_KEY)
}

export const checkUserAuthentication = async (isPublicPath: boolean) => {
    if (typeof window !== "undefined") {

        const loadingStore = useLoadingStore()
        const authStore = useAuthStore();
        try {
            const token = handleGetSotredToken();
            if (token) {
                loadingStore.setLoading(true);
                const user = await authStore.getLoggedUser();
                if (isPublicPath && user) {
                    await navigateTo("/home")
                } else if (!isPublicPath && !user)  {
                    await navigateTo("/login")
                } else {
                    return true;
                }
            } else {
                if (!isPublicPath) {
                    await navigateTo("/login")
                }
            }
        } catch (error) {
            return true;
        } finally {
            loadingStore.setLoading(false)
            return true;
        }
    }

}