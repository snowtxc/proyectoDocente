import { useNuxtApp } from '#app'
import { defineStore } from 'pinia'
import type {  CreateOrUpdateGrupoDTO, Grupo } from '~/types/grupo';
import type { ListRequest } from '~/types/list-request';
import type { ListResponse } from '~/types/list-response';

export const controller = "grupos";

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

export const useGrupoService = defineStore('grupo', () => {

  const totalCount = ref([]);
  const grupos = ref<Grupo[]>([]);
  
  const isLoading = ref<boolean>(false);
  

  const getPaginate = async(req: ListRequest) : Promise<ListResponse<Grupo[]>> =>{
    const { $request } = useNuxtApp()
    isLoading.value = true;
    const resp = await $request<ListRequest>('post', `${controller}/paged`, req);
    if(resp.data){
      grupos.value = resp.data.list;
    }
    isLoading.value = false;
    totalCount.value = resp.data.totalCount;
    return resp.data;
  }

  const createFormData = async(data:CreateOrUpdateGrupoDTO) =>{
    const formData = new FormData();
    Object.keys(data).map(key => {
      if(key === 'grados'){
          formData.append('grados', JSON.stringify(data.grados));
      }else if(key == 'esMultiGrado'){
        formData.append('esMultiGrado', data.esMultiGrado ? Number(1).toString() : Number(0).toString())
      }else if(key == 'logo'){
        if(data.logo){  // Solo si viene un archivo se agrega al formData
          formData.append('logo', data.logo)
        }
      }
      else{
        formData.append(key, data[key]);
      }
    });

    return formData;
  }

  const create = async (data: CreateOrUpdateGrupoDTO) => {
    const formData = await createFormData(data);

    const { $request } = useNuxtApp()
    const resp = await $request<FormData>('post', controller, formData,'multipart/form-data');

    return resp;
  }

  const update = async (id:number, data: CreateOrUpdateGrupoDTO) => {
    const formData = await createFormData(data);
    const { $request } = useNuxtApp()

    const resp = await $request<FormData>('post', `${controller}/${id}`, formData,'multipart/form-data');
    
    return resp;
  }

  return {
    create,
    update,
    getPaginate,
    grupos,
    isLoading
  } 
})
