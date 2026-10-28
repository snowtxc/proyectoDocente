export interface EstiloDocente {
  tiene_perfil: boolean
  resumen: string | null
  max_ejemplos: number
  ejemplos: { id: number, nombre: string, caracteres: number, fecha: string }[]
  // La última planificación que subió da también el formato copiado de sus descargas.
  formato: FormatoExportacion
}

// Con qué formato se descargan sus planificaciones.
export type UsoFormato = 'flopi' | 'copiado' | 'disenado'

export interface DetalleFormato { titulo: string, texto: string }

// Formatos de descarga del docente: el copiado de una planificación modelo y el que diseñó en el editor.
export interface FormatoExportacion {
  en_uso: UsoFormato
  flopi: { detalles: DetalleFormato[] }
  copiado: { nombre: string | null, descripcion: string | null, detalles: DetalleFormato[] } | null
  disenado: { detalles: DetalleFormato[] } | null
  // La copia sigue después de responder: mientras tanto se consulta el estado.
  analizando: boolean
  archivo_pendiente: string | null
  error: string | null
}

// ---------------------------------------------------------------- Receta (RecetaFormato en el backend)

export type CampoTramo = 'espacio' | 'unidad_curricular' | 'contenido' | 'competencias_generales' | 'competencias_especificas' | 'criterios_logro' | 'meta' | 'plan'

export type Disposicion = 'cuadricula' | 'tabla_etiquetas' | 'secuencial'

export type Alineacion = 'izquierda' | 'centro' | 'derecha'

export interface EstiloBloque {
  negrita: boolean
  cursiva: boolean
  subrayado: boolean
  mayusculas: boolean
  tamano: number
  color: string
  alineacion: Alineacion
}

export interface RecetaFormato {
  descripcion: string
  fuente: { familia: string, tipo?: 'serif' | 'sans', tamano: number }
  orientacion: 'vertical' | 'horizontal'
  justificado: boolean
  encabezado: EstiloBloque & { mostrar: boolean, plantilla: string }
  dia: EstiloBloque & { plantilla: string, nueva_pagina: boolean }
  tramo: EstiloBloque & { mostrar: boolean, plantilla: string }
  disposicion: Disposicion
  // Solo en la cuadrícula: filas de celdas, cada celda con uno o más campos.
  filas: CampoTramo[][][]
  // Los campos visibles, en orden, con el nombre que les da el docente.
  etiquetas: Partial<Record<CampoTramo, string>>
  etiqueta: { negrita: boolean, cursiva: boolean, subrayado: boolean, mayusculas: boolean, color: string, en_linea: boolean }
  colores_espacio: Record<string, string> | []
  tabla: { borde: string, fondo_tramo: string | null, fondo_etiqueta: string | null, ancho_etiqueta: number }
  vinetas: [string, string]
  listas_en_vinetas: boolean
  espacio_entre_campos: boolean
}

// Lo que necesita el editor para empezar.
export interface DisenoFormato {
  receta: RecetaFormato
  origen: UsoFormato
  copiada: RecetaFormato | null
  flopi: RecetaFormato
  campos: { campo: CampoTramo, etiqueta: string, obligatorio: boolean }[]
}
