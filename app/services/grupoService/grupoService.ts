// src/services/authService.ts
import type { CreateUserDTO, LoggedUser, LoginDTO } from '~/types/user'
import { useNuxtApp } from '#app'
import { defineStore } from 'pinia'

export const grupoApi = {
  list: '/grupos/paged',
}

export const useGrupoStore = defineStore('grupos', () => {
  const loading = ref<boolean>(false)
  const grupos = ref<any[]>([])

  const getGrupos = async () => {
    try {
        loading.value = true;
        const { $request } = useNuxtApp()
        const resp = await $request('post', grupoApi.list, { page: 1, rowsPerPage: 100 })
        console.log(resp);
        if (resp?.ok && resp?.data?.list) {
          grupos.value = resp.data.list;
        }
    return resp;
    } catch (error) {
        console.log("error", error)
    } finally {
        loading.value = false;
    }
  }

  return {
    getGrupos,
    grupos,
    loading,
  }

})
