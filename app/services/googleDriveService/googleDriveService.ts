import { useNuxtApp } from '#app'
import { defineStore } from 'pinia'
import type { ListFoldersDTO } from '~/types/google-drive';

export const controller = "google-drive";

export const useGoogleDriveService = defineStore('google-drive', () => {

  const listFolders = async (body: ListFoldersDTO) => {
    const { $request } = useNuxtApp()
    const resp = await $request<{ok:boolean}[]>('post', `${controller}/listFolders`)
    const { data } = resp;
    return data;
  }

  return {
    listFolders
  } 
})