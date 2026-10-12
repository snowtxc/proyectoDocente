import { useNuxtApp } from '#app'
import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum'
import { apiSuscripcionRoutes } from '~/utils/apiRoutes'
import type { EstadoSuscripcion } from '~/types/suscripcion'

export const useSuscripcionService = () => {
  const { $apiRest } = useNuxtApp()

  const obtenerEstado = async (): Promise<EstadoSuscripcion> => {
    return $apiRest<EstadoSuscripcion>(apiSuscripcionRoutes.estado, HttpMethodEnum.GET)
  }

  // Crea el pago del período elegido. Devuelve adónde ir a pagar.
  const iniciarPago = async (plan: number): Promise<{ url: string }> => {
    return $apiRest<{ url: string }>(apiSuscripcionRoutes.pagar, HttpMethodEnum.POST, { plan })
  }

  // Al volver de pagar: el backend consulta el pago y devuelve el estado actualizado.
  const verificarPago = async (paymentId: string): Promise<EstadoSuscripcion> => {
    return $apiRest<EstadoSuscripcion>(apiSuscripcionRoutes.verificar, HttpMethodEnum.POST, { payment_id: paymentId })
  }

  return { obtenerEstado, iniciarPago, verificarPago }
}
