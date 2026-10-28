import type { RecetaFormato } from '~/types/estilo'

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
  // Subtítulo dentro del plan: en multigrado, "Todos juntos" o el nombre de un grado.
  titulo?: boolean
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
  plan: PasoPlan[]
  // Versión con formato que escribió el docente en el editor (si la editó). Tiene prioridad.
  meta_html?: string
  plan_html?: string
  // Redacción que le dio el docente a los textos del programa (los IDs siguen siendo los oficiales).
  textos?: TextosAjustados
}

export interface TextosAjustados {
  espacio?: string
  unidad_curricular?: string
  // Por ID: {"12": "texto ajustado"}.
  contenidos?: Record<string, string>
  criterios_logro?: Record<string, string>
  competencias_generales?: Record<string, string>
  competencias_especificas?: Record<string, string>
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
  // El texto del programa, si el docente lo ajustó.
  oficial?: string
}

// Textos oficiales del programa de una propuesta. Solo lectura.
export interface ReferenciasPropuesta {
  espacio: string
  color: string
  unidad_curricular: string
  // Los del programa (el espacio y la unidad pueden tener la redacción del docente).
  espacio_oficial?: string
  unidad_curricular_oficial?: string
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
  // El PDF y el Word de esta versión ya están guardados en DigitalOcean.
  archivos_guardados?: boolean
  // Diseño de las descargas del docente: la planificación se muestra igual que el archivo.
  receta: RecetaFormato
}

// Fila de "Mis planificaciones".
export interface PlanificacionResumen {
  id: number
  titulo: string
  estado: 'borrador' | 'confirmada'
  grupo: string | null
  desde: string | null
  hasta: string | null
  // Días de clase con la cantidad de tramos de cada uno.
  dias: { fecha: string, tramos: number }[]
  total_propuestas: number
  archivos_guardados: boolean
  actualizada: string | null
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
  // Cuánto usó de la IA este mes: llega con cada respuesta para mantener al día la barra.
  uso_ia?: { porcentaje: number, agotado: boolean, se_renueva: string, en_prueba: boolean }
  // Si ya le enseñó a Flopi cómo planifica (Configuración > Mi estilo).
  tiene_estilo?: boolean
}

export interface EnvioMensaje {
  texto?: string
  seleccion?: { clave: string, ids: (number | string)[] }
}

export type FormatoDescarga = 'pdf' | 'docx'

// Listas del programa para el editor de un tramo.
export type ListaPrograma = 'unidades' | 'contenidos' | 'criterios' | 'competencias_generales' | 'competencias_especificas'

export interface ItemPrograma {
  id: number
  texto: string
  detalle?: string
  // Solo las unidades curriculares: su espacio y el color del espacio.
  espacio?: string
  color?: string
}

// Un dato del programa elegido en el editor, con la redacción que va en la planificación.
export interface ElegidoPrograma {
  id: number
  oficial: string
  texto: string
  espacio?: string
  color?: string
}

export interface ResultadoPrograma {
  resultados: ItemPrograma[]
  total: number
  hay_mas: boolean
}

// Meta y plan que redacta Flopi para un tramo del editor.
export interface RedaccionTramo {
  meta_aprendizaje: string
  plan: PasoPlan[]
}
