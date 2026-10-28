import { useNuxtApp } from '#app'
import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum'
import { apiAsistenteRoutes, apiDescripcionesFundadasRoutes, apiEstiloRoutes, apiPlanificacionesRoutes } from '~/utils/apiRoutes'
import type { ListResponse } from '~/types/list-response'
import type { ContenidoPlanificacion, DescripcionFundada, EnvioMensaje, EstadoSesion, FormatoDescarga, Planificacion, PlanificacionResumen } from '~/types/asistente'
import type { RecetaFormato } from '~/types/estilo'

export const useAsistenteService = () => {
  const { $apiRest } = useNuxtApp()

  const iniciar = async (): Promise<EstadoSesion> => {
    return $apiRest<EstadoSesion>(apiAsistenteRoutes.iniciar, HttpMethodEnum.POST)
  }

  const obtenerEstado = async (id: number): Promise<EstadoSesion> => {
    return $apiRest<EstadoSesion>(apiAsistenteRoutes.estado(id), HttpMethodEnum.GET)
  }

  const enviar = async (id: number, envio: EnvioMensaje): Promise<EstadoSesion> => {
    return $apiRest<EstadoSesion>(apiAsistenteRoutes.enviar(id), HttpMethodEnum.POST, envio)
  }

  const listarPlanificaciones = async (pagina: number, porPagina: number): Promise<ListResponse<PlanificacionResumen[]>> => {
    return $apiRest<ListResponse<PlanificacionResumen[]>>(apiPlanificacionesRoutes.listar(pagina, porPagina), HttpMethodEnum.GET)
  }

  // Planificaciones con algún día entre desde y hasta (YYYY-MM-DD), para el calendario.
  const planificacionesEntre = async (desde: string, hasta: string): Promise<PlanificacionResumen[]> => {
    return (await $apiRest<ListResponse<PlanificacionResumen[]>>(apiPlanificacionesRoutes.calendario(desde, hasta), HttpMethodEnum.GET)).list
  }

  const obtenerPlanificacion = async (id: number): Promise<Planificacion> => {
    return $apiRest<Planificacion>(apiPlanificacionesRoutes.find(id), HttpMethodEnum.GET)
  }

  const guardarPlanificacion = async (id: number, contenido: ContenidoPlanificacion): Promise<Planificacion> => {
    return $apiRest<Planificacion>(apiPlanificacionesRoutes.update(id), HttpMethodEnum.PUT, { contenido })
  }

  const confirmarPlanificacion = async (id: number): Promise<Planificacion> => {
    return $apiRest<Planificacion>(apiPlanificacionesRoutes.confirmar(id), HttpMethodEnum.POST)
  }

  const eliminarPlanificacion = async (id: number): Promise<void> => {
    await $apiRest(apiPlanificacionesRoutes.eliminar(id), HttpMethodEnum.DELETE)
  }

  const guardarDescripcion = async (id: number, texto: string): Promise<DescripcionFundada> => {
    return $apiRest<DescripcionFundada>(apiDescripcionesFundadasRoutes.update(id), HttpMethodEnum.PUT, { texto })
  }

  // Baja un archivo del backend con la sesión del docente. Con "cuerpo", lo pide por POST.
  const bajarArchivo = async (ruta: string, nombre: string, cuerpo?: object): Promise<void> => {
    const config = useRuntimeConfig()
    // Sanctum pide el token CSRF en los POST (la cookie ya la dejó $apiRest).
    const xsrf = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]+)/)?.[1] ?? ''

    const response = await fetch(`${config.public.apiBaseUrl}${ruta}`, {
      method: cuerpo ? 'POST' : 'GET',
      credentials: 'include',
      headers: {
        Authorization: `Bearer ${useAuthStore().token}`,
        Accept: 'application/json',
        ...(cuerpo ? { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': decodeURIComponent(xsrf) } : {}),
      },
      body: cuerpo ? JSON.stringify(cuerpo) : undefined,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => null)
      throw new Error(error?.message ?? 'No se pudo descargar el archivo')
    }

    const blob = await response.blob()
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = nombre
    link.click()
    URL.revokeObjectURL(link.href)
  }

  const descargar = async (planificacion: Planificacion, formato: FormatoDescarga): Promise<void> => {
    const nombre = planificacion.titulo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

    await bajarArchivo(apiPlanificacionesRoutes.exportar(planificacion.id, formato), `${nombre || 'planificacion'}.${formato}`)
  }

  const descargarDescripcion = async (descripcion: DescripcionFundada, formato: FormatoDescarga): Promise<void> => {
    await bajarArchivo(apiDescripcionesFundadasRoutes.exportar(descripcion.id, formato), `descripcion-fundada.${formato}`)
  }

  // Planificación de prueba con el formato que usan las descargas del docente.
  const descargarEjemploFormato = async (formato: FormatoDescarga): Promise<void> => {
    await bajarArchivo(apiEstiloRoutes.formatoEjemplo(formato), `ejemplo-con-mi-formato.${formato}`)
  }

  // La misma prueba con el diseño que está armando en el editor, sin guardarlo.
  const descargarEjemploDiseno = async (formato: FormatoDescarga, receta: RecetaFormato): Promise<void> => {
    await bajarArchivo(apiEstiloRoutes.formatoEjemploDiseno, `ejemplo-con-mi-diseno.${formato}`, { formato, receta })
  }

  return { iniciar, obtenerEstado, enviar, listarPlanificaciones, planificacionesEntre, obtenerPlanificacion, guardarPlanificacion, confirmarPlanificacion, eliminarPlanificacion, descargar, guardarDescripcion, descargarDescripcion, descargarEjemploFormato, descargarEjemploDiseno }
}
