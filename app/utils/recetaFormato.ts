import type { CampoTramo, EstiloBloque, RecetaFormato } from '~/types/estilo'

// Los mismos textos y estilos que arma RecetaFormato en el backend para el PDF y el Word: con esto
// una planificación se ve en pantalla igual que el archivo que se descarga.

export const CAMPOS_TRAMO: Record<CampoTramo, string> = {
  espacio: 'Espacio de Conocimiento',
  unidad_curricular: 'Unidad Curricular',
  contenido: 'Contenido',
  competencias_generales: 'Competencia general',
  competencias_especificas: 'Competencia específica',
  criterios_logro: 'Criterio de logro',
  meta: 'Meta de aprendizaje',
  plan: 'Plan de aprendizaje y desarrollo de la intervención docente',
}

const ORDINALES = ['PRIMER', 'SEGUNDO', 'TERCER', 'CUARTO', 'QUINTO', 'SEXTO', 'SÉPTIMO', 'OCTAVO', 'NOVENO', 'DÉCIMO']

const ALINEACION = { izquierda: 'left', centro: 'center', derecha: 'right' } as const

const reemplazar = (plantilla: string, datos: Record<string, string>) =>
  plantilla.replace(/\{[A-Z]+\}/g, marcador => datos[marcador] ?? marcador)

const enMayusculas = (texto: string, mayusculas: boolean) => mayusculas ? texto.toLocaleUpperCase('es') : texto

// En pantalla la letra va un poco más grande que en la hoja (12 pt → 15 px), para leer cómodo.
export const tamanoEnPantalla = (puntos: number) => `${Math.round(puntos * 125) / 100}px`

// La letra del docente si la tiene la computadora; si no, una del mismo tipo.
export const familiaDe = (receta: RecetaFormato) => `'${receta.fuente.familia}', ${receta.fuente.tipo === 'serif' ? 'serif' : 'sans-serif'}`

// "LUNES 7 DE ABRIL" con la plantilla del docente.
export const textoDia = (receta: RecetaFormato, fecha: string) => {
  const [anio = 0, mes = 1, numero = 1] = fecha.split('-').map(Number)
  const dia = new Date(anio, mes - 1, numero)
  const nombre = dia.toLocaleDateString('es', { weekday: 'long' })

  const texto = reemplazar(receta.dia.plantilla, {
    '{DIA}': nombre.charAt(0).toLocaleUpperCase('es') + nombre.slice(1),
    '{NUMERO}': String(numero),
    '{MES}': dia.toLocaleDateString('es', { month: 'long' }),
  })

  return enMayusculas(texto, receta.dia.mayusculas)
}

// "PRIMER TRAMO", "TRAMO II", "Tramo 3"...
export const textoTramo = (receta: RecetaFormato, numero: number, romano: string) => enMayusculas(reemplazar(receta.tramo.plantilla, {
  '{ORDINAL}': ORDINALES[numero - 1] ?? String(numero),
  '{ROMANO}': romano,
  '{NUMERO}': String(numero),
}), receta.tramo.mayusculas)

export const textoEncabezado = (receta: RecetaFormato, datos: { titulo: string, grupo: string, docente: string }) => enMayusculas(reemplazar(receta.encabezado.plantilla, {
  '{TITULO}': datos.titulo,
  '{GRUPO}': datos.grupo,
  '{DOCENTE}': datos.docente,
}), receta.encabezado.mayusculas)

export const textoEtiqueta = (receta: RecetaFormato, campo: CampoTramo) =>
  enMayusculas(receta.etiquetas[campo] ?? CAMPOS_TRAMO[campo], receta.etiqueta.mayusculas)

// Los campos visibles, en orden.
export const camposVisibles = (receta: RecetaFormato) => Object.keys(receta.etiquetas) as CampoTramo[]

const clave = (texto: string) => texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z]/g, '')

// Color de las etiquetas de un tramo: el fijo de la receta, el que usa el docente para ese espacio o el de Flopi.
export const colorEtiqueta = (receta: RecetaFormato, espacio: string, colorFlopi: string) => {
  const buscado = clave(espacio)

  for (const [nombre, color] of Object.entries(receta.colores_espacio)) {
    const suya = clave(nombre)

    if (suya !== '' && (buscado.includes(suya) || suya.includes(buscado))) return color
  }

  return receta.etiqueta.color === 'espacio' ? colorFlopi.replace(/^#/, '').toUpperCase() : receta.etiqueta.color
}

// Títulos del documento, de cada día y de cada tramo.
export const estiloBloque = (bloque: EstiloBloque) => ({
  fontWeight: bloque.negrita ? 'bold' : 'normal',
  fontStyle: bloque.cursiva ? 'italic' : 'normal',
  textDecoration: bloque.subrayado ? 'underline' : 'none',
  fontSize: tamanoEnPantalla(bloque.tamano),
  color: `#${bloque.color}`,
  textAlign: ALINEACION[bloque.alineacion] ?? 'left',
})

// Nombres de los campos ("Contenido:").
export const estiloEtiqueta = (receta: RecetaFormato, color: string) => ({
  fontWeight: receta.etiqueta.negrita ? 'bold' : 'normal',
  fontStyle: receta.etiqueta.cursiva ? 'italic' : 'normal',
  textDecoration: receta.etiqueta.subrayado ? 'underline' : 'none',
  color: `#${color}`,
})

const ROMANOS: [number, string][] = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]

// "I", "II"… como el número de cada tramo en el día.
export const numeroRomano = (numero: number) => ROMANOS.reduce((texto, [valor, letra]) => {
  while (numero >= valor) {
    texto += letra
    numero -= valor
  }
  return texto
}, '')

// "Viernes 30 de octubre" (con el año si no es el actual).
export const fechaEnPalabras = (fecha: string) => {
  const [anio = 0, mes = 1, numero = 1] = fecha.split('-').map(Number)
  const dia = new Date(anio, mes - 1, numero)
  const texto = dia.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long', ...(anio !== new Date().getFullYear() ? { year: 'numeric' } : {}) })

  return texto.charAt(0).toLocaleUpperCase('es') + texto.slice(1).replace(',', '')
}
