export interface ReporteAdmin {
  id: number
  tipo: 'problema' | 'funcionalidad'
  mensaje: string
  pagina: string | null
  estado: 'nuevo' | 'visto' | 'resuelto'
  fecha: string
  usuario: { id: number, nombre: string, email: string } | null
}
