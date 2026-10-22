import type { ListResponse } from '~/types/list-response'

export interface RegistroUsoIa {
  id: number
  fecha: string
  // Lo que hizo la IA, ya en texto: "Generó un tramo", "Buscó contenidos"...
  accion: string
  tokens_entrada: number
  tokens_salida: number
  costo_usd: number
  exitoso: boolean
}

export interface MesUsoIa {
  periodo: string // 2026-10
  tokens_entrada: number
  tokens_salida: number
  gastado_usd: number
  tramos_generados: number
  correcciones: number
}

export interface UsoIaDetalle {
  mes: {
    periodo: string
    se_renueva: string
    gastado_usd: number
    // Null: sin tope (superadmin o cuenta exenta).
    tope_usd: number | null
    porcentaje: number
    tramos_generados: number
    correcciones: number
    usos: number
  }
  meses: MesUsoIa[]
  registros: ListResponse<RegistroUsoIa[]>
  // Solo en la vista del superadmin.
  usuario?: { id: number, nombre: string, email: string }
}
