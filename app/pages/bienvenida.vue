<script setup lang="ts">
import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum'
import { apiAuthRoutes, apiEstiloRoutes } from '~/utils/apiRoutes'
import { appRoutes } from '~/utils/appRoutes'
import { paginasPdf } from '~/utils/paginasPdf'
import type { DisenoFormato, EstiloDocente, FormatoExportacion, RecetaFormato, UsoFormato } from '~/types/estilo'

// Paso obligatorio de Mi estilo: antes de usar Flopi, el docente elige cómo se ven sus planificaciones,
// en la pantalla y en las descargas. Lo hacen las cuentas nuevas y también las que ya existían.
useSeoMeta({ title: 'Elegí tu formato · Flopi Docentes' })

const { $apiRest } = useNuxtApp()
const authStore = useAuthStore()
const toast = useToast()

const formato = ref<FormatoExportacion | null>(null)
const diseno = ref<DisenoFormato | null>(null)
const eleccion = ref<UsoFormato>('flopi')
const cargando = ref(true)
const subiendo = ref(false)
const continuando = ref(false)
const entrada = ref<HTMLInputElement>()

const nombre = computed(() => String(authStore.user?.nombre1 ?? '').trim().split(' ')[0] ?? '')

const mensajeDe = (error: any, porDefecto: string) => {
  const errores = error?.errors ? Object.values(error.errors).flat() : []
  return (errores[0] as string) ?? (typeof error === 'string' ? error : (error?.message ?? porDefecto))
}

const cargar = async () => {
  const [estado, recetas] = await Promise.all([
    $apiRest<FormatoExportacion>(apiEstiloRoutes.formato, HttpMethodEnum.GET),
    $apiRest<DisenoFormato>(apiEstiloRoutes.formatoDiseno, HttpMethodEnum.GET),
  ])

  formato.value = estado
  diseno.value = recetas
}

// ---------------------------------------------------------------- Copiar el de una planificación

let consulta: ReturnType<typeof setInterval> | undefined

// La copia tarda uno o dos minutos: se pregunta cada unos segundos hasta que termina.
const esperarCopia = () => {
  clearInterval(consulta)

  consulta = setInterval(async () => {
    try {
      const estado = await $apiRest<FormatoExportacion>(apiEstiloRoutes.formato, HttpMethodEnum.GET, undefined, { silencioso: true })
      if (estado.analizando) return

      clearInterval(consulta)
      await cargar()

      if (estado.error) toast.error({ title: 'No se pudo copiar el diseño', message: estado.error })
      else toast.success({ title: '¡Diseño copiado!', message: 'Mirá cómo quedan tus planificaciones y, si te gusta, seguí.' })
    } catch {
      // Un corte de red no frena la espera: se vuelve a preguntar.
    }
  }, 3000)
}

onBeforeUnmount(() => clearInterval(consulta))

const elegirArchivo = () => entrada.value?.click()

const subir = async (evento: Event) => {
  const archivo = (evento.target as HTMLInputElement).files?.[0]
  ;(evento.target as HTMLInputElement).value = ''
  if (!archivo) return

  subiendo.value = true
  eleccion.value = 'copiado'

  try {
    const datos = new FormData()
    datos.append('archivo', archivo)

    // Del PDF, Flopi también mira cómo se ven las primeras páginas para copiar su diseño.
    if (archivo.name.toLowerCase().endsWith('.pdf')) {
      const paginas = await paginasPdf(archivo).catch(() => [])
      paginas.forEach(pagina => datos.append('paginas[]', pagina))
    }

    const estilo = await $apiRest<EstiloDocente>(apiEstiloRoutes.ejemplos, HttpMethodEnum.POST, datos)
    formato.value = estilo.formato
    if (estilo.formato.analizando) esperarCopia()
  } catch (error: any) {
    toast.error({ title: 'No se pudo usar ese archivo', message: mensajeDe(error, 'Probá de nuevo.') })
  } finally {
    subiendo.value = false
  }
}

// ---------------------------------------------------------------- La elección

const opciones = computed(() => [
  {
    valor: 'flopi' as const,
    titulo: 'Usar el formato de Flopi',
    detalle: 'Un cuadro por tramo con los datos del programa arriba y la meta y el plan abajo. Listo para usar.',
    icono: 'i-tabler-layout-grid',
  },
  {
    valor: 'copiado' as const,
    titulo: 'Copiar el de una planificación mía',
    detalle: 'Subí una planificación tuya en Word o PDF: Flopi copia su diseño (la letra, los títulos y los colores) y aprende cómo escribís.',
    icono: 'i-tabler-copy',
  },
  {
    valor: 'disenado' as const,
    titulo: 'Diseñar mi propio formato',
    detalle: 'Ubicá los campos de cada tramo y elegí la letra, los títulos y los colores, mirando cómo queda.',
    icono: 'i-tabler-palette',
  },
])

// La receta de lo elegido, para mostrar la hoja de muestra.
const recetaElegida = computed<RecetaFormato | null>(() => {
  if (!diseno.value) return null
  if (eleccion.value === 'flopi') return diseno.value.flopi
  if (eleccion.value === 'copiado') return diseno.value.copiada
  return formato.value?.disenado ? diseno.value.receta : null
})

const accion = computed(() => {
  if (eleccion.value === 'flopi') return { texto: 'Usar el formato de Flopi', listo: true }
  if (eleccion.value === 'copiado') {
    if (formato.value?.analizando) return { texto: 'Copiando el diseño…', listo: false }
    return formato.value?.copiado ? { texto: 'Usar este formato', listo: true } : { texto: 'Subí una planificación', listo: false }
  }
  return formato.value?.disenado ? { texto: 'Usar mi diseño', listo: true } : { texto: 'Abrir el editor', listo: true }
})

const continuar = async () => {
  if (eleccion.value === 'disenado' && !formato.value?.disenado) {
    await navigateTo({ path: appRoutes.disenarFormato(), query: { desde: 'bienvenida' } })
    return
  }

  continuando.value = true

  try {
    await $apiRest(apiEstiloRoutes.formato, HttpMethodEnum.PUT, { usar: eleccion.value })
    // Con el usuario al día, el resto de Flopi queda disponible.
    authStore.setUser(await $apiRest(apiAuthRoutes.user, HttpMethodEnum.GET))
    toast.success({ title: '¡Listo!', message: 'Ya podés empezar a planificar. El formato lo cambiás cuando quieras desde Mi estilo.' })
    await navigateTo(appRoutes.asistente())
  } catch (error: any) {
    toast.error({ title: 'No se pudo guardar', message: mensajeDe(error, 'Probá de nuevo.') })
  } finally {
    continuando.value = false
  }
}

onMounted(async () => {
  // Si ya lo eligió (por ejemplo, desde otro dispositivo), sigue de largo.
  if (authStore.user?.formato_elegido_at) {
    await navigateTo(appRoutes.asistente())
    return
  }

  try {
    await cargar()
    // Quien ya tenía un formato copiado o diseñado lo encuentra elegido.
    eleccion.value = formato.value?.en_uso ?? 'flopi'
    if (formato.value?.analizando) {
      eleccion.value = 'copiado'
      esperarCopia()
    }
  } catch (error: any) {
    toast.error({ title: 'No pudimos cargar los formatos', message: mensajeDe(error, 'Probá de nuevo.') })
  } finally {
    cargando.value = false
  }
})
</script>

<template>
  <div class="min-h-full px-4 sm:px-6 py-6 sm:py-10">
    <div class="max-w-6xl mx-auto">
      <header class="mb-6 sm:mb-8 max-w-3xl">
        <span class="inline-flex items-center gap-1.5 rounded-full bg-miel-100 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-miel-800">
          <UIcon name="i-tabler-sparkles" class="w-3.5 h-3.5" />
          Antes de empezar
        </span>
        <h1 class="font-display text-3xl sm:text-4xl font-bold text-mona-900 leading-tight mt-3">
          ¡Hola{{ nombre ? `, ${nombre}` : '' }}! Elegí cómo querés ver tus planificaciones
        </h1>
        <p class="text-mona-800/75 mt-2 text-[1.05rem]">
          Es el formato con el que Flopi te las muestra y con el que se descargan en Word y en PDF. Después lo podés cambiar cuando quieras desde Mi estilo.
        </p>
      </header>

      <p v-if="cargando" class="flex items-center gap-2 text-mona-800/70">
        <UIcon name="i-tabler-loader-2" class="w-5 h-5 animate-spin" /> Cargando…
      </p>

      <div v-else class="contenido">
        <!-- Las opciones -->
        <section class="space-y-3" role="radiogroup" aria-label="Formato de tus planificaciones">
          <div v-for="opcion in opciones" :key="opcion.valor" class="opcion" :class="{ elegida: eleccion === opcion.valor }">
            <button type="button" role="radio" class="eleccion" :aria-checked="eleccion === opcion.valor" @click="eleccion = opcion.valor">
              <span class="punto" aria-hidden="true" />
              <span class="icono"><UIcon :name="opcion.icono" class="w-5 h-5" /></span>
              <span class="min-w-0">
                <span class="flex flex-wrap items-center gap-2">
                  <span class="font-display text-lg font-bold text-mona-900 leading-tight">{{ opcion.titulo }}</span>
                  <span v-if="opcion.valor === formato?.en_uso && opcion.valor !== 'flopi'" class="etiqueta">El que tenés</span>
                </span>
                <span class="block text-sm text-mona-800/75 mt-0.5">{{ opcion.detalle }}</span>
              </span>
            </button>

            <!-- Copiar: subir la planificación y esperar la copia -->
            <div v-if="opcion.valor === 'copiado' && eleccion === 'copiado'" class="extra">
              <p v-if="formato?.analizando || subiendo" class="flex items-start gap-2 text-sm text-mona-800/85">
                <UIcon name="i-tabler-loader-2" class="w-4 h-4 mt-0.5 animate-spin flex-shrink-0" />
                <span v-if="subiendo">Subiendo tu planificación…</span>
                <span v-else>Copiando el diseño de <strong>{{ formato?.archivo_pendiente }}</strong>. Tarda uno o dos minutos: no hace falta que te quedes mirando.</span>
              </p>
              <template v-else>
                <p v-if="formato?.copiado" class="text-sm text-mona-800/85">
                  <UIcon name="i-tabler-circle-check" class="w-4 h-4 inline -mt-0.5 text-emerald-600" />
                  Copiado de <strong>{{ formato.copiado.nombre }}</strong>. {{ formato.copiado.descripcion }}
                </p>
                <p v-if="formato?.error" class="text-sm text-red-700">{{ formato.error }} Probá con otra planificación o elegí otra opción.</p>
                <button type="button" class="boton-mona inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-sm mt-2" @click="elegirArchivo">
                  <UIcon name="i-tabler-upload" class="w-4 h-4" />
                  {{ formato?.copiado ? 'Subir otra planificación' : 'Subir una planificación' }}
                </button>
                <p class="text-xs text-mona-800/65 mt-2">Word (.docx) o PDF. No incluyas nombres de estudiantes.</p>
              </template>
            </div>

            <!-- Diseñar: abrir el editor (o seguir con el diseño que ya tiene) -->
            <div v-if="opcion.valor === 'disenado' && eleccion === 'disenado' && formato?.disenado" class="extra">
              <NuxtLink :to="{ path: appRoutes.disenarFormato(), query: { desde: 'bienvenida' } }" class="text-sm font-bold text-mona-700 hover:underline">
                Editar mi diseño
              </NuxtLink>
            </div>
          </div>

          <input ref="entrada" type="file" accept=".docx,.pdf" class="hidden" @change="subir">

          <div class="continuar">
            <button
              type="button"
              class="boton-miel w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-display text-lg font-semibold"
              :disabled="!accion.listo || continuando || subiendo"
              @click="continuar"
            >
              <UIcon :name="continuando ? 'i-tabler-loader-2' : 'i-tabler-arrow-right'" class="w-5 h-5" :class="{ 'animate-spin': continuando }" />
              {{ accion.texto }}
            </button>
          </div>
        </section>

        <!-- Cómo quedan, con una planificación de muestra -->
        <section class="muestra" aria-label="Cómo quedan tus planificaciones">
          <EstiloEditorVistaPrevia v-if="recetaElegida" :receta="recetaElegida" />
          <div v-else class="h-full flex flex-col items-center justify-center text-center px-8">
            <span class="w-14 h-14 rounded-2xl bg-white/70 text-mona-600 flex items-center justify-center mb-3">
              <UIcon :name="eleccion === 'copiado' ? 'i-tabler-file-upload' : 'i-tabler-palette'" class="w-7 h-7" />
            </span>
            <p class="font-display text-lg font-bold text-mona-900">
              {{ eleccion === 'copiado' ? 'Acá vas a ver tu formato' : 'Lo armás en el editor' }}
            </p>
            <p class="text-sm text-mona-800/75 mt-1 max-w-sm">
              {{ eleccion === 'copiado'
                ? 'Apenas Flopi copie el diseño de tu planificación, lo ves con una planificación de muestra.'
                : 'Mientras lo armás, ves cómo queda con una planificación de muestra.' }}
            </p>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Las opciones y, al costado, cómo quedan. */
.contenido {
  display: grid;
  gap: 1.5rem;
  align-items: start;
}

@media (min-width: 1024px) {
  .contenido {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr);
  }
}

.opcion {
  border: 2px solid var(--color-mona-100);
  border-radius: 1.25rem;
  background: #fff;
  padding: 1rem 1.1rem;
  transition: border-color 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease;
}

.opcion.elegida {
  border-color: var(--color-mona-500);
  background: var(--color-mona-50);
  box-shadow: 0 5px 0 0 var(--color-mona-100);
}

.eleccion {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  width: 100%;
  text-align: left;
}

.punto {
  width: 1.2rem;
  height: 1.2rem;
  margin-top: 0.7rem;
  flex-shrink: 0;
  border-radius: 9999px;
  border: 2px solid var(--color-mona-300);
  background: #fff;
}

.opcion.elegida .punto {
  border-color: var(--color-mona-600);
  background: radial-gradient(circle, var(--color-mona-600) 0 40%, #fff 45%);
}

.icono {
  width: 2.6rem;
  height: 2.6rem;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.85rem;
  background: var(--color-mona-100);
  color: var(--color-mona-700);
}

.opcion.elegida .icono {
  background: var(--color-miel-300);
  color: var(--color-mona-950);
}

.etiqueta {
  padding: 0.1rem 0.55rem;
  border-radius: 9999px;
  background: var(--color-mona-100);
  color: var(--color-mona-800);
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.extra {
  margin: 0.75rem 0 0.1rem 5.15rem;
}

@media (max-width: 639px) {
  .extra {
    margin-left: 0;
  }
}

.continuar {
  padding-top: 0.5rem;
}

/* En el celular el botón queda a mano, abajo. */
@media (max-width: 1023px) {
  .continuar {
    position: sticky;
    bottom: 0;
    z-index: 5;
    padding: 0.75rem 0;
    background: linear-gradient(to top, var(--color-mona-50) 70%, transparent);
  }
}

.muestra {
  height: 70vh;
  border: 2px solid var(--color-mona-100);
  border-radius: 1.25rem;
  overflow: hidden;
  background: #eceae4;
}

@media (min-width: 1024px) {
  .muestra {
    position: sticky;
    top: 1.5rem;
    height: calc(100dvh - 12rem);
  }
}
</style>
