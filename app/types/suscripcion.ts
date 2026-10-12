export interface PlanSuscripcion {
  id: number
  nombre: string
  meses: number
  precio: number
  precio_por_mes: number
}

// aprobado | en_proceso | rechazado | pendiente
export type ResultadoPago = 'aprobado' | 'en_proceso' | 'rechazado' | 'pendiente'

export interface EstadoSuscripcion {
  activa: boolean
  // Todavía no pagó nunca: está usando (o usó) el mes gratis.
  en_prueba: boolean
  acceso_hasta: string | null
  dias_restantes: number
  // Le quedan pocos días: conviene avisarle.
  avisar: boolean
  moneda: string
  planes: PlanSuscripcion[]
  // Pagó por un medio que acredita después (Abitab, Redpagos).
  pago_en_proceso: { plan: string, fecha: string } | null
  pagos_habilitados: boolean
  // Cuánto usó de la IA este mes, como porcentaje del tope.
  uso_ia: { porcentaje: number, agotado: boolean, se_renueva: string, en_prueba: boolean }
  // Solo al verificar un pago: cómo quedó.
  resultado?: ResultadoPago | null
}
