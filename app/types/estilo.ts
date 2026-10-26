export interface EstiloDocente {
  tiene_perfil: boolean
  resumen: string | null
  max_ejemplos: number
  ejemplos: { id: number, nombre: string, caracteres: number, fecha: string }[]
}
