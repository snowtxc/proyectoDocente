export interface EstiloDocente {
  tiene_perfil: boolean
  resumen: string | null
  max_ejemplos: number
  ejemplos: { id: number, nombre: string, caracteres: number, fecha: string }[]
  // La última planificación que subió da también el formato de sus descargas.
  formato: FormatoExportacion
}

// Formato de descarga copiado de una planificación modelo del docente.
export interface FormatoExportacion {
  tiene_formato: boolean
  activo: boolean
  nombre: string | null
  descripcion: string | null
  detalles: { titulo: string, texto: string }[]
  fecha: string | null
  // El análisis sigue después de responder: mientras tanto se consulta el estado.
  analizando: boolean
  archivo_pendiente: string | null
  error: string | null
}
