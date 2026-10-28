<script setup lang="ts">
import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum'
import { apiEstiloRoutes } from '~/utils/apiRoutes'
import { paginasPdf } from '~/utils/paginasPdf'
import type { EstiloDocente } from '~/types/estilo'

// Perfil de estilo: el docente sube planificaciones suyas y Flopi aprende cómo planifica.
// Con la misma subida copia el diseño de la última para sus descargas; también puede diseñar el suyo.
useSeoMeta({ title: 'Mi estilo · Flopi Docentes' })

const { $apiRest } = useNuxtApp()
const toast = useToast()

const estilo = ref<EstiloDocente | null>(null)
const cargando = ref(true)
const subiendo = ref(false)
const analizando = ref(false)
const guardando = ref(false)
const resumen = ref('')
const entrada = ref<HTMLInputElement>()

const mensajeDe = (error: any, porDefecto: string) => {
  const errores = error?.errors ? Object.values(error.errors).flat() : []
  return (errores[0] as string) ?? (typeof error === 'string' ? error : (error?.message ?? porDefecto))
}

const aplicar = (datos: EstiloDocente) => {
  estilo.value = datos
  resumen.value = datos.resumen ?? ''
}

const cargar = async () => {
  try {
    aplicar(await $apiRest<EstiloDocente>(apiEstiloRoutes.estado, HttpMethodEnum.GET))
  } catch (error: any) {
    toast.error({ title: 'No pudimos cargar tu perfil', message: mensajeDe(error, 'Probá de nuevo.') })
  } finally {
    cargando.value = false
  }
}

const elegirArchivo = () => entrada.value?.click()

const subir = async (evento: Event) => {
  const archivo = (evento.target as HTMLInputElement).files?.[0]
  ;(evento.target as HTMLInputElement).value = ''
  if (!archivo) return

  subiendo.value = true

  try {
    const datos = new FormData()
    datos.append('archivo', archivo)

    // Del PDF, Flopi también mira cómo se ven las primeras páginas para copiar su diseño.
    if (archivo.name.toLowerCase().endsWith('.pdf')) {
      const paginas = await paginasPdf(archivo).catch(() => [])
      paginas.forEach(pagina => datos.append('paginas[]', pagina))
    }

    aplicar(await $apiRest<EstiloDocente>(apiEstiloRoutes.ejemplos, HttpMethodEnum.POST, datos))
    toast.success({
      title: '¡Listo!',
      message: estilo.value?.formato.analizando
        ? 'Flopi ya aprendió cómo escribís. Ahora está copiando el diseño para tus descargas.'
        : 'Flopi ya aprendió de tu planificación. Revisá abajo cómo describió tu estilo.',
    })
  } catch (error: any) {
    toast.error({ title: 'No se pudo usar ese archivo', message: mensajeDe(error, 'Probá de nuevo.') })
    await cargar()
  } finally {
    subiendo.value = false
  }
}

const quitar = async (id: number, nombre: string) => {
  if (!window.confirm(`¿Quitar "${nombre}"? Flopi va a volver a analizar tu estilo con las que queden.`)) return

  subiendo.value = true

  try {
    aplicar(await $apiRest<EstiloDocente>(apiEstiloRoutes.ejemplo(id), HttpMethodEnum.DELETE))
  } catch (error: any) {
    toast.error({ title: 'No se pudo quitar', message: mensajeDe(error, 'Probá de nuevo.') })
    await cargar()
  } finally {
    subiendo.value = false
  }
}

const volverAAnalizar = async () => {
  analizando.value = true

  try {
    aplicar(await $apiRest<EstiloDocente>(apiEstiloRoutes.analizar, HttpMethodEnum.POST))
    toast.success({ title: 'Listo', message: 'Volví a analizar tus planificaciones.' })
  } catch (error: any) {
    toast.error({ title: 'No se pudo analizar', message: mensajeDe(error, 'Probá de nuevo en un rato.') })
  } finally {
    analizando.value = false
  }
}

const guardarResumen = async () => {
  guardando.value = true

  try {
    aplicar(await $apiRest<EstiloDocente>(apiEstiloRoutes.estado, HttpMethodEnum.PUT, { resumen: resumen.value }))
    toast.success({ title: 'Guardado', message: 'Flopi va a usar esta descripción en tus próximos tramos.' })
  } catch (error: any) {
    toast.error({ title: 'No se pudo guardar', message: mensajeDe(error, 'Probá de nuevo.') })
  } finally {
    guardando.value = false
  }
}

const lleno = computed(() => (estilo.value?.ejemplos.length ?? 0) >= (estilo.value?.max_ejemplos ?? 3))
const cambioSinGuardar = computed(() => resumen.value.trim() !== (estilo.value?.resumen ?? '').trim())

onMounted(cargar)
</script>

<template>
  <div>
    <UPageCard
      title="Mi estilo"
      description="Enseñale a Flopi cómo planificás. Subí una o más planificaciones tuyas: los tramos que arme van a parecerse a lo que escribís vos. Abajo elegís cómo se ven tus descargas: con el diseño de tu planificación o con uno que armes vos."
      variant="naked"
      class="mb-4"
    />

    <p v-if="cargando" class="text-sm text-mona-800/70">Cargando…</p>

    <div v-else-if="estilo" class="flex flex-col gap-6">
      <!-- Planificaciones de ejemplo -->
      <section class="rounded-2xl border-2 border-mona-100 bg-white p-5">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 class="font-display text-xl font-semibold text-mona-900">Tus planificaciones de ejemplo</h3>
            <p class="text-sm text-mona-800/75 mt-1">
              Word (.docx) o PDF, hasta {{ estilo.max_ejemplos }}. Flopi aprende tu forma de planificar (no copia los temas)
              y copia el diseño de la última que subas para tus descargas.
            </p>
          </div>
          <button
            type="button"
            class="boton-miel inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-display font-semibold"
            :disabled="subiendo || lleno"
            @click="elegirArchivo"
          >
            <UIcon :name="subiendo ? 'i-tabler-loader-2' : 'i-tabler-upload'" class="w-5 h-5" :class="{ 'animate-spin': subiendo }" />
            {{ subiendo ? 'Analizando…' : 'Subir planificación' }}
          </button>
          <input ref="entrada" type="file" class="hidden" accept=".docx,.pdf,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" @change="subir">
        </div>

        <p v-if="subiendo" class="text-sm text-mona-800/75 mt-3">Flopi está leyendo tu planificación. Puede tardar unos segundos…</p>
        <p v-if="lleno" class="text-xs text-mona-800/70 mt-3">Llegaste al máximo. Quitá una para subir otra.</p>

        <ul v-if="estilo.ejemplos.length" class="mt-4 divide-y divide-mona-50 border-t border-mona-50">
          <li v-for="ejemplo in estilo.ejemplos" :key="ejemplo.id" class="flex items-center gap-3 py-2.5">
            <UIcon :name="ejemplo.nombre.toLowerCase().endsWith('.pdf') ? 'i-tabler-file-type-pdf' : 'i-tabler-file-type-docx'" class="w-5 h-5 text-mona-700" />
            <span class="flex-1 min-w-0 truncate text-mona-900">{{ ejemplo.nombre }}</span>
            <button type="button" class="text-sm font-bold text-mona-800/70 hover:text-red-700" :disabled="subiendo" @click="quitar(ejemplo.id, ejemplo.nombre)">
              Quitar
            </button>
          </li>
        </ul>
        <p v-else class="mt-4 text-sm text-mona-800/70">Todavía no subiste ninguna.</p>

        <p class="mt-4 text-xs text-mona-800/70">
          <UIcon name="i-tabler-lock" class="w-3.5 h-3.5 inline -mt-0.5" />
          No incluyas nombres de estudiantes. Solo guardamos el texto para entender tu estilo y lo podés quitar cuando quieras.
        </p>
      </section>

      <!-- Lo que aprendió Flopi -->
      <section v-if="estilo.ejemplos.length || estilo.resumen" class="rounded-2xl border-2 border-mona-100 bg-white p-5">
        <h3 class="font-display text-xl font-semibold text-mona-900">Cómo planificás, según Flopi</h3>
        <p class="text-sm text-mona-800/75 mt-1">Es lo que Flopi tiene en cuenta al escribir tus tramos. Si algo no te representa, cambialo.</p>

        <UTextarea v-model="resumen" :rows="6" autoresize class="w-full mt-3" maxlength="1500" placeholder="Todavía no hay una descripción. Probá con “Volver a analizar”." />

        <div class="flex flex-wrap justify-end gap-2 mt-3">
          <button
            v-if="estilo.ejemplos.length"
            type="button"
            class="boton-mona inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-sm"
            :disabled="analizando || subiendo"
            @click="volverAAnalizar"
          >
            <UIcon :name="analizando ? 'i-tabler-loader-2' : 'i-tabler-refresh'" class="w-4 h-4" :class="{ 'animate-spin': analizando }" />
            Volver a analizar
          </button>
          <button
            type="button"
            class="boton-miel px-4 py-2 rounded-xl font-display font-semibold"
            :disabled="guardando || !cambioSinGuardar"
            @click="guardarResumen"
          >
            {{ guardando ? 'Guardando…' : 'Guardar cambios' }}
          </button>
        </div>
      </section>

      <!-- Formato de las descargas: el de Flopi, el copiado de la última planificación o el que diseñó -->
      <EstiloFormatoDescarga :formato="estilo.formato" />
    </div>
  </div>
</template>
