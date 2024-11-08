import { useNuxtApp } from '#app'
import { defineStore } from 'pinia'
import type { Grado } from '~/types/grado';

export const controller = "grados";

export const useGradoService = defineStore('grado', () => {
   
  const grados = ref([]);
  const isLoading = ref(false);
  const alreadyLoaded = ref(false);

  const getAll = async () => {
    const { $request } = useNuxtApp()
    isLoading.value  = true;
    const resp = await $request<Grado[]>('get', controller)
    grados.value  = resp.data 
    isLoading.value = false;
    alreadyLoaded.value = true;
    return resp;
  }

  return {
    alreadyLoaded,
    isLoading,
    grados,
    getAll
  } 
})
