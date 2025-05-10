import { AxiosInstance } from 'axios'

declare module '#app' {
  interface NuxtApp {
    $api: AxiosInstance,
    $request<T = any>(method: string, url: string, data?: T,contentType?:string): Promise<{
      ok: boolean
      data?: any
      error?: string,
    }>,
    $requestWithSpinner<T = any>(method: string, url: string, data?: T): Promise<{
      ok: boolean
      data?: any
      error?: string
    }>,
    $getCsrf(): Promise<{
      ok: boolean
      data?: any
      error?: string
    }>,

    $apiRest<T = any>(endpoint: string, method: HttpMethodEnum, body?: any, options: Record<string, any> = {}) : Promise<T>;
  }
}