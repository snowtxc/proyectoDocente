// src/services/authService.ts
import type { CreateUserDTO, LoginDTO } from "~/types/user";
import { useNuxtApp } from "#app";
import { defineStore } from "pinia";
import type { CreatePlanificacionDTO, Planificacion } from "~/types/planificacion";

export const planificacionApi = {
  create: "/planificaciones/",
  get: "/planificaciones/paged/",
  getById: (id: string) => `/planificaciones/${id}`,
};

export const DEFAULT_PLANIFICATION_PARAMS = { rowsPerPage: 25, page: 1 };

export const usePlanificacionService = defineStore("planificacion", () => {
  const loading = ref<boolean>(false);
  const planificaciones = ref<Planificacion[]>([]);
  const loadedPlanificacion = ref<Planificacion | undefined>();
  const filters = ref<{query?: string, estado?: string, rangeDates: { from?: string, to?: string } }>({ query: undefined, estado: undefined, rangeDates: { from: undefined, to:undefined}});
  const paginationFilters = ref<{rowsPerPage: number, page: number}>(DEFAULT_PLANIFICATION_PARAMS);


  const createPlanificacion = async (formData: CreatePlanificacionDTO) => {
    try {
      loading.value = true;
      const { $request } = useNuxtApp();
      const resp = await $request("post", planificacionApi.create, formData);
      if (resp?.ok) {
        await getPlanificaciones();
      }
      return resp;
    } catch (error) {
      console.log("error", error);
    } finally {
      loading.value = false;
    }
  };

  const getPlanificaciones = async () => {
    try {
      loading.value = true;
      const { $request } = useNuxtApp();
      const resp = await $request(
        "post",
        planificacionApi.get,
        {
          ...paginationFilters.value,
          filters: {
            query: filters?.value?.query,
            estado: filters?.value?.estado,
            from: filters?.value?.rangeDates?.from,
            to: filters?.value?.rangeDates?.to,
          }
        }
      );
      if (resp?.data?.list) {
        console.log("new list", resp.data.list)
        planificaciones.value = resp.data.list || [];
      }
      return resp?.data;
    } finally {
      loading.value = false;
    }
  };

  const getPlanificacion = async (id: string, onError: any) => {
    try {
      loading.value = true;
      const { $requestWithSpinner } = useNuxtApp();
      const resp = await $requestWithSpinner(
        "post",
        `${planificacionApi.getById(id)}`
      );
      if (resp?.data) {
        loadedPlanificacion.value = resp?.data;
        console.log(resp?.data);
      } else {
        if (onError) {
          onError(resp?.error);
        }
      }
      return resp;
    } catch (error) {
      if (onError) {
        onError(error?.message);
      }
    } finally {
      loading.value = false;
    }
  };

  return {
    createPlanificacion,
    loading,
    getPlanificacion,
    planificaciones,
    loadedPlanificacion,
    getPlanificaciones,
    filters,
    paginationFilters
  };
});
