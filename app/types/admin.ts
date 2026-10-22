export interface UsuarioAdmin {
  id: number
  nombre: string
  email: string
  rol: 'superadmin' | 'docente'
  alta: string | null
  acceso_hasta: string | null
  activa: boolean
  // Todavía no tuvo ningún período pago ni aplicado a mano.
  en_prueba: boolean
  // Porcentaje del tope de IA usado este mes.
  uso_ia: number
  // Dólares de IA gastados este mes.
  gasto_ia: number
}

export interface ConfiguracionAdmin {
  id: number
  clave: string
  valor: string
  descripcion: string
}
