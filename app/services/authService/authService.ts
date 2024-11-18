// src/services/authService.ts
import type { CreateUserDTO, DeactivateDTO, LoggedUser, LoginDTO } from '~/types/user'
import { useNuxtApp } from '#app'
import { defineStore } from 'pinia'

export const userApi = {
  register: '/register',
  login: '/login',
  user: '/user',
  logout: '/logout',
  deactivate: '/auth/deactivate-account'
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<LoggedUser>(null)
  const token = ref<string>(null)

  const signUp = async (data: CreateUserDTO) => {
    const { $requestWithSpinner } = useNuxtApp()
    const resp = await $requestWithSpinner<CreateUserDTO>('post', userApi.register, data)
    return resp;
  }

  const signOut = async () => {
    const { $requestWithSpinner } = useNuxtApp()
    const resp = await $requestWithSpinner<CreateUserDTO>('post', userApi.logout)
    console.log(resp)
    handleCleanStoredToken();
    navigateTo("/login")
    return resp;
  }


  const getLoggedUser = async () => {
    const { $requestWithSpinner } = useNuxtApp()
    const resp = await $requestWithSpinner<CreateUserDTO>('get', userApi.user)
    if (resp?.data) {
      return resp?.data;
    } else {
      return null;
    }
  }

  const getCsrf = async () => {
    const { $getCsrf } = useNuxtApp()
    await $getCsrf()
  }

  const login = async (data: LoginDTO) => {
    const { $requestWithSpinner } = useNuxtApp()
    const resp = await $requestWithSpinner<LoginDTO>('post', userApi.login, data)
    if (resp?.data?.user) {
      token.value = resp?.data?.token as string;
      handleSetStoredToken(resp?.data?.token as string)
    }
    return resp;
  }

  const deactivate = async (data: DeactivateDTO) => {
    const { $requestWithSpinner } = useNuxtApp()
    const resp = await $requestWithSpinner<DeactivateDTO>('post', userApi.deactivate, data)
    if (resp?.ok) {
      handleCleanStoredToken();
      navigateTo("/login")
    }
    return resp;
  }


  return {
    login,
    getCsrf,
    signUp,
    signOut,
    getLoggedUser,
    user,
    token,
    deactivate,
  }

})
