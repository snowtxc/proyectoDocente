// src/services/authService.ts
import type { CreateUserDTO,  LoginDTO, UpdateUserProfileDTO, User } from '~/types/user'
import { useNuxtApp } from '#app'
import { defineStore } from 'pinia'

export const authApi = {
  register: '/register',
  login: '/login',
  loginWithGoogleCallback: '/login/google/callback',
  user: '/user',
  logout: '/logout',
  updateProfile: '/auth/updateProfile'
}

export const useAuthStore = defineStore('auth', () => {

  const user = ref<User>(null)
  const token = ref<string>(null)

  const signUp = async (data: CreateUserDTO) => {
    const { $requestWithSpinner } = useNuxtApp()
    const resp = await $requestWithSpinner<CreateUserDTO>('post', authApi.register, data)
    return resp;
  }

  const signOut = async () => {
    const { $requestWithSpinner } = useNuxtApp()
    const resp = await $requestWithSpinner<CreateUserDTO>('post', authApi.logout)
    handleCleanStoredToken();
    navigateTo("/login")
    return resp;
  }

  const getLoggedUser  = async () => {
    const { $requestWithSpinner } = useNuxtApp()
    const resp = await $requestWithSpinner<CreateUserDTO>('get', authApi.user)
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
    const resp = await $requestWithSpinner<LoginDTO>('post', authApi.login, data)
    if (resp?.data?.user) {
      token.value = resp?.data?.token as string;
      user.value = resp?.data?.user as User;
      handleSetStoredToken(resp?.data?.token as string)
    }
    return resp;
  }

  const updateProfile = async (data: UpdateUserProfileDTO) => {
    const { $requestWithSpinner } = useNuxtApp()
    const resp = await $requestWithSpinner<UpdateUserProfileDTO>('post', authApi.updateProfile, data);
    if(resp.data){
      user.value = resp.data as User;
    }
    return resp;
  }

  const loginWithGoogleCallback = async(access_token: string)=>{
    const { $requestWithSpinner } = useNuxtApp()
    const resp = await $requestWithSpinner('post', `${authApi.loginWithGoogleCallback}`, {access_token});
    if(resp.ok){
      token.value = resp?.data?.token as string;
      user.value = resp?.data?.user as User;
      handleSetStoredToken(resp?.data?.token as string)
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
    updateProfile,
    loginWithGoogleCallback
  }

} , 
{
  persist: true
})
