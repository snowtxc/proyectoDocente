// src/plugins/axios.js

import axios from "axios";
import { useErrorStore } from "~/services/errorService/errorService";
import { useLoadingStore } from "~/services/loadingService/loadingService";
import { DEFAULT_STORAGE_TOKEN_KEY } from "~/utils/user";

const getCookie = (name) => {
  const value = `; ${document?.cookie}`;
  const parts = value?.split(`; ${name}=`);
  if (parts.length === 2) return parts?.pop()?.split(";").shift();
};

function deleteCookie(name) {
  document.cookie = `${name}=; Max-Age=0; path=/;`;
}

export default defineNuxtPlugin((nuxtApp) => {
  const runtimeConfig = useRuntimeConfig();

  const api = axios.create({
    baseURL: `${runtimeConfig.public.apiBaseUrl}`,
    timeout: 100000,
    withCredentials: true,
    withXSRFToken: true,
  });
  
  const errorStore = useErrorStore((nuxtApp as any).$pinia)
  const loadingStore = useLoadingStore((nuxtApp as any).$pinia)

  api.interceptors.request.use(
    (config) => {
      config.headers["Accept"] = "application/json";
      const token = localStorage.getItem(DEFAULT_STORAGE_TOKEN_KEY);
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  api.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error.response && error.response.status === 401 && !LIST_PUBLIC_ROUTES.includes(window.location.pathname)) {
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  );

  const request = async (method, url, data = null, contentType = 'application/json') => {
    try {
      const csrfCookie = getCookie("XSRF-TOKEN");
      const response = await api({ method, url, data } as any, {
        headers: {
          "X-CSRF-TOKEN": csrfCookie || "",
          'Content-Type': contentType
        },
      });
      return {
        ok: true,
        data: response.data,
      };
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Error desconocido";
        errorStore.setError(message);
  
      return {
        ok: false,
        error: message,
      };
    }
  };

  const requestWithSpinner = async (method, url, data = null) => {
    try {
      loadingStore.setLoading(true);
      const resp = await request(method, url, data)
      return resp
    } finally {
      loadingStore.setLoading(false);
    }
  };

  const getCsrfToken = async () => {
    try {
      deleteCookie("XSRF-TOKEN");
      const response = await axios.get(
        `${`${runtimeConfig.public.apiBaseUrl}`.replace(
          "/api",
          ""
        )}/sanctum/csrf-cookie`,
        {
          withCredentials: true,
        }
      );
      return {
        ok: true,
        data: response.data,
      };
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Error desconocido";
      return {
        ok: false,
        error: message,
      };
    }
  };

  nuxtApp.provide("request", request);
  nuxtApp.provide("getCsrf", getCsrfToken);
  nuxtApp.provide("requestWithSpinner", requestWithSpinner);
});
