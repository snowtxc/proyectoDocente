// Imágenes de las primeras páginas de un PDF (JPEG en data URL), para que Flopi vea su diseño.
// pdf.js se carga solo cuando hace falta: pesa bastante y se usa en una sola pantalla.
export const paginasPdf = async (archivo: File, cantidad = 2, ancho = 1100): Promise<string[]> => {
  const pdfjs = await import('pdfjs-dist')
  const { default: worker } = await import('pdfjs-dist/build/pdf.worker.min.mjs?url')
  pdfjs.GlobalWorkerOptions.workerSrc = worker

  const tarea = pdfjs.getDocument({ data: await archivo.arrayBuffer() })
  const documento = await tarea.promise
  const imagenes: string[] = []

  try {
    for (let numero = 1; numero <= Math.min(cantidad, documento.numPages); numero++) {
      const pagina = await documento.getPage(numero)
      const vista = pagina.getViewport({ scale: ancho / pagina.getViewport({ scale: 1 }).width })

      const lienzo = document.createElement('canvas')
      lienzo.width = Math.floor(vista.width)
      lienzo.height = Math.floor(vista.height)

      await pagina.render({ canvas: lienzo, viewport: vista }).promise
      imagenes.push(lienzo.toDataURL('image/jpeg', 0.7))
    }
  } finally {
    await tarea.destroy()
  }

  return imagenes
}
