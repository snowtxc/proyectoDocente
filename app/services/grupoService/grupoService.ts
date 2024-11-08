import { useNuxtApp } from '#app'
import { defineStore } from 'pinia'
import type { CreateGrupoDTO, Grupo } from '~/types/grupo';

export const controller = "grupos";

export const useGrupoService = defineStore('grupo', () => {

  const grupos = ref<Grupo[]>([]);
  const isLoading = ref<boolean>(false);
  
  const getAll = async()=>{
    const { $request } = useNuxtApp()
    isLoading.value = true;
    const resp = await $request<Grupo[]>('get', controller)
    if(resp.data){
      grupos.value = resp.data;
    }
    isLoading.value = false;
    return resp;
  }

  const create = async (data: CreateGrupoDTO) => {
    const { $requestWithSpinner } = useNuxtApp()
    const resp = await $requestWithSpinner<Grupo>('post', controller, data)
    if(resp.data){
      grupos.value.push(resp.data as Grupo);
    }
    return resp;
  }
  
  return {
    create,
    getAll,
    grupos,
    isLoading
  } 
})
