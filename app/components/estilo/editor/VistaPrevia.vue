<script setup lang="ts">
import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum'
import { apiEstiloRoutes } from '~/utils/apiRoutes'
import type { RecetaFormato } from '~/types/estilo'

// Hoja de muestra con el diseño que se está armando. La arma el backend con la misma plantilla
// del PDF, así lo que se ve es lo que se descarga. Se pide de nuevo con cada cambio, con una pausa.
const props = defineProps<{ receta: RecetaFormato }>()

const { $apiRest } = useNuxtApp()

const html = ref('')
const actualizando = ref(false)
const error = ref(false)
let pedido = 0

const pedir = useDebounceFn(async () => {
  const numero = ++pedido
  actualizando.value = true

  try {
    const respuesta = await $apiRest<string>(apiEstiloRoutes.formatoVistaPrevia, HttpMethodEnum.POST, { receta: props.receta }, { silencioso: true })

    // Si mientras tanto hubo otro cambio, vale la respuesta del último.
    if (numero === pedido) {
      html.value = respuesta
      error.value = false
    }
  } catch {
    if (numero === pedido) error.value = true
  } finally {
    if (numero === pedido) actualizando.value = false
  }
}, 350)

watch(() => props.receta, pedir, { deep: true, immediate: true })

// La hoja mide 21 cm (29,7 cm en horizontal): se achica para que entre a lo ancho.
const marco = ref<HTMLElement>()
const { width } = useElementSize(marco)
const zoom = computed(() => {
  const hoja = (props.receta.orientacion === 'horizontal' ? 29.7 : 21) * 37.8 + 48

  return width.value > 0 ? Math.min(1, (width.value - 8) / hoja) : 1
})

const documento = computed(() => html.value.replace('</head>', `<style>html { zoom: ${zoom.value.toFixed(3)}; }</style></head>`))

// Al redibujar, la hoja vuelve a donde estaba (sin scripts adentro, la página puede leer su scroll).
const hoja = ref<HTMLIFrameElement>()
let scroll = 0

watch(documento, () => {
  scroll = hoja.value?.contentWindow?.scrollY ?? scroll
})

const alCargar = () => hoja.value?.contentWindow?.scrollTo(0, scroll)
</script>

<template>
  <div ref="marco" class="relative w-full h-full">
    <iframe
      v-if="html"
      ref="hoja"
      :srcdoc="documento"
      sandbox="allow-same-origin"
      title="Vista previa de tu formato"
      class="w-full h-full border-0 block"
      @load="alCargar"
    />
    <p v-else-if="!error" class="absolute inset-0 flex items-center justify-center text-sm text-mona-800/70">
      Armando la vista previa…
    </p>

    <span
      v-if="actualizando && html"
      class="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-mona-800 shadow"
    >
      <UIcon name="i-tabler-loader-2" class="w-3.5 h-3.5 animate-spin" />
      Actualizando
    </span>
    <p
      v-if="error"
      class="absolute top-3 left-3 right-3 rounded-xl bg-red-50 border-2 border-red-200 px-3 py-2 text-sm text-red-700"
    >
      No se pudo actualizar la vista previa. Revisá tu conexión: cuando vuelva, se actualiza sola con el próximo cambio.
    </p>
  </div>
</template>
