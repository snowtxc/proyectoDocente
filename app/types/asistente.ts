export type TipoOpciones = 'simple' | 'multiple' | 'fechas'

export interface OpcionItem {
  id: number | string
  texto: string
  detalle?: string
}

// Opciones clickeables que acompañan a un mensaje del asistente.
export interface Opciones {
  tipo: TipoOpciones
  clave: string
  items: OpcionItem[]
  maximo?: number
  // El paso se puede saltear sin elegir nada.
  opcional?: boolean
}

export interface MensajeChat {
  id: number | string
  rol: 'docente' | 'asistente'
  contenido: string
  opciones?: Opciones | null
  fecha?: string
}

export interface PasoPlan {
  texto: string
  subpasos: string[]
}

// Propuesta con contenidos del programa. Los datos del programa van como IDs.
export interface PropuestaCurricular {
  tipo: 'curricular'
  unidad_curricular_id: number
  contenido_ids: number[]
  criterio_logro_ids: number[]
  competencia_general_ids: number[]
  competencia_especifica_ids: number[]
  meta_aprendizaje: string
  actividad: string
  secuencia: string | null
  antecedente: string | null
  proyeccion: string | null
  plan: PasoPlan[]
  adecuaciones: string[]
  recursos: string[]
}

// Actividad sin datos del programa (por ejemplo, una clase a cargo de otro docente).
export interface PropuestaLibre {
  tipo: 'libre'
  actividad: string
}

export type Propuesta = PropuestaCurricular | PropuestaLibre

// Documento de la planificación, con el mismo esquema que valida el backend.
export interface ContenidoPlanificacion {
  fecha_desde: string
  fecha_hasta: string
  dias: { fecha: string, propuestas: Propuesta[] }[]
}

export interface Referencia {
  id: number
  texto: string
}

// Textos oficiales del programa de una propuesta. Solo lectura.
export interface ReferenciasPropuesta {
  espacio: string
  color: string
  unidad_curricular: string
  contenidos: Referencia[]
  criterios_logro: Referencia[]
  competencias_generales: Referencia[]
  competencias_especificas: Referencia[]
}

export type PropuestaPresentada =
  | (PropuestaCurricular & { numero: string, referencias: ReferenciasPropuesta })
  | (PropuestaLibre & { numero: string })

export interface DiaPresentado {
  fecha: string
  encabezado: string
  dia: string
  propuestas: PropuestaPresentada[]
}

export interface Planificacion {
  id: number
  titulo: string
  estado: 'borrador' | 'confirmada'
  grupo: { id: number, nombre: string, grados: string[] }
  // Documento tal como está guardado: es lo que se edita.
  contenido: ContenidoPlanificacion
  // El mismo documento listo para mostrar, con los textos del programa.
  dias: DiaPresentado[]
  total_propuestas: number
}

// Descripción fundada de un estudiante. El texto usa un marcador en lugar del nombre.
export interface DescripcionFundada {
  id: number
  estado: 'borrador' | 'confirmada'
  texto: string
  marcador_nombre: string
  grupo: { id: number, nombre: string, grados: string[] }
}

// Tramo redactado que el docente todavía no agregó al día.
export interface BorradorTramo {
  fecha: string
  propuesta: PropuestaPresentada
}

export interface EstadoSesion {
  id: number
  estado: string
  tipo_documento: string | null
  ayuda_texto_libre: string | null
  mensajes: MensajeChat[]
  planificacion: Planificacion | null
  descripcion: DescripcionFundada | null
  borrador_tramo: BorradorTramo | null
}

export interface EnvioMensaje {
  texto?: string
  seleccion?: { clave: string, ids: (number | string)[] }
}

export type FormatoDescarga = 'pdf' | 'docx'
