import { AxiosInstance } from 'axios'

declare module '#app' {
  interface NuxtApp {
    $api: AxiosInstance,
    $request<T = any>(method: string, url: string, data?: T): Promise<{
      ok: boolean
      data?: any
      error?: string
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
  }
}