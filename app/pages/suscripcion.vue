<script setup lang="ts">
import { useSuscripcionStore } from '~/utils/suscripcionStore'
import { useSuscripcionService } from '~/services/suscripcionService/suscripcionService'
import { appRoutes } from '~/utils/appRoutes'
import type { ResultadoPago } from '~/types/suscripcion'

useSeoMeta({ title: 'Mi suscripción · Flopi Docentes' })

const route = useRoute()
const router = useRouter()
const toast = useToast()
const suscripcionStore = useSuscripcionStore()
const suscripcionService = useSuscripcionService()

const estado = computed(() => suscripcionStore.estado)
const planElegido = ref('1m')
const pagando = ref(false)
const verificando = ref(false)

// Cómo quedó el pago del que se acaba de volver.
const resultado = ref<ResultadoPago | null>(null)

const fecha = (iso: string | null | undefined) => iso
  ? new Date(iso).toLocaleDateString('es-UY', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Montevideo' })
  : ''

const plata = (monto: number) => `$ ${new Intl.NumberFormat('es-UY').format(monto)}`

const dias = computed(() => {
  const cantidad = estado.value?.dias_restantes ?? 0

  return cantidad === 1 ? '1 día' : `${cantidad} días`
})

const titulo = computed(() => {
  if (!estado.value) return 'Mi suscripción'
  if (!estado.value.activa) return estado.value.en_prueba ? 'Se terminó tu mes gratis' : 'Tu período de Flopi venció'

  return estado.value.en_prueba ? 'Estás usando tu mes gratis' : 'Tu Flopi está al día'
})

const bajada = computed(() => {
  if (!estado.value) return ''

  if (!estado.value.activa) {
    return 'Para seguir planificando con Flopi, elegí por cuánto tiempo querés renovar. Tus grupos y todo lo que hiciste siguen guardados.'
  }

  return `Podés usar Flopi hasta el ${fecha(estado.value.acceso_hasta)} (te quedan ${dias.value}). Si renovás antes, el tiempo nuevo se suma al final: no perdés ningún día.`
})

const pagar = async () => {
  if (pagando.value) return

  pagando.value = true

  try {
    const { url } = await suscripcionService.iniciarPago(planElegido.value)

    // Se va a Mercado Pago; vuelve a esta misma página.
    window.location.href = url
  } catch (error: any) {
    pagando.value = false
    toast.error({ title: 'No pudimos iniciar el pago', message: typeof error === 'string' ? error : (error?.message ?? 'Probá de nuevo en un momento.') })
  }
}

const recargar = async () => {
  verificando.value = true

  try {
    suscripcionStore.setEstado(await suscripcionService.obtenerEstado())

    if (suscripcionStore.estado?.activa && !suscripcionStore.estado?.pago_en_proceso && resultado.value === 'en_proceso') {
      resultado.value = 'aprobado'
    }
  } catch (error: any) {
    toast.error({ title: 'No pudimos revisar el pago', message: typeof error === 'string' ? error : 'Probá de nuevo en un momento.' })
  } finally {
    verificando.value = false
  }
}

// Mercado Pago vuelve a esta página con el pago en la dirección (payment_id o collection_id).
onMounted(async () => {
  const pagoId = String(route.query.payment_id ?? route.query.collection_id ?? '')
  const estadoVuelta = String(route.query.status ?? route.query.collection_status ?? '')

  if (!pagoId && !estadoVuelta) return

  router.replace({ query: {} })

  if (!pagoId || pagoId === 'null') {
    // Volvió sin pagar (cerró Mercado Pago o el pago falló antes de crearse).
    if (['rejected', 'failure', 'cancelled'].includes(estadoVuelta)) {
      resultado.value = 'rechazado'
    }

    return
  }

  verificando.value = true

  try {
    const nuevo = await suscripcionService.verificarPago(pagoId)

    suscripcionStore.setEstado(nuevo)
    resultado.value = nuevo.resultado ?? null
  } catch (error: any) {
    toast.error({ title: 'No pudimos revisar el pago', message: 'Si ya pagaste, tocá “Ya pagué, revisar” en un momento.' })
    resultado.value = 'en_proceso'
  } finally {
    verificando.value = false
  }
})
</script>

<template>
  <div class="min-h-full px-4 sm:px-8 py-6 sm:py-10">
    <div class="max-w-3xl mx-auto">
      <!-- Encabezado -->
      <header class="flex items-start gap-4 mb-6 aparecer">
        <FlopiBee :size="84" :animo="resultado === 'aprobado' ? 'contenta' : (verificando ? 'pensando' : 'quieta')" class="flex-shrink-0 hidden sm:block" />
        <div>
          <h1 class="font-display text-4xl font-bold text-mona-900 leading-none">{{ titulo }}</h1>
          <p class="text-mona-800/80 mt-3 max-w-xl">{{ bajada }}</p>
        </div>
      </header>

      <!-- Revisando el pago al volver -->
      <div v-if="verificando" class="mb-6 p-4 rounded-2xl bg-white border-2 border-mona-100 flex items-center gap-3 text-mona-900" role="status">
        <UIcon name="i-tabler-loader-2" class="w-5 h-5 animate-spin flex-shrink-0" />
        Estamos revisando tu pago…
      </div>

      <!-- Resultado del pago -->
      <div
        v-else-if="resultado === 'aprobado'"
        class="mb-6 p-5 rounded-2xl bg-green-50 border-2 border-green-200 text-green-950 flex flex-wrap items-center justify-between gap-4 aparecer"
        role="status"
      >
        <div class="flex items-start gap-3">
          <UIcon name="i-tabler-circle-check" class="w-6 h-6 flex-shrink-0 text-green-700" />
          <div>
            <p class="font-display text-xl font-semibold leading-tight">¡Listo, recibimos tu pago!</p>
            <p class="mt-1">Tenés Flopi hasta el {{ fecha(estado?.acceso_hasta) }}.</p>
          </div>
        </div>
        <NuxtLink :to="appRoutes.asistente()" class="boton-miel inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-display text-lg font-semibold">
          Ir a Flopi
          <UIcon name="i-tabler-arrow-right" class="w-5 h-5" />
        </NuxtLink>
      </div>

      <div
        v-else-if="resultado === 'en_proceso' || estado?.pago_en_proceso"
        class="mb-6 p-5 rounded-2xl bg-miel-50 border-2 border-miel-300 text-mona-950 flex flex-wrap items-center justify-between gap-4 aparecer"
        role="status"
      >
        <div class="flex items-start gap-3 max-w-lg">
          <UIcon name="i-tabler-clock" class="w-6 h-6 flex-shrink-0 text-miel-700" />
          <div>
            <p class="font-display text-xl font-semibold leading-tight">Estamos esperando la confirmación de tu pago</p>
            <p class="mt-1">
              Si pagás en Abitab o Redpagos puede demorar un rato después de que pases por el local.
              Cuando se confirme, Flopi se habilita solo.
            </p>
          </div>
        </div>
        <button type="button" class="boton-mona inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold" @click="recargar">
          <UIcon name="i-tabler-refresh" class="w-5 h-5" />
          Ya pagué, revisar
        </button>
      </div>

      <div
        v-else-if="resultado === 'rechazado'"
        class="mb-6 p-5 rounded-2xl bg-red-50 border-2 border-red-200 text-red-950 flex items-start gap-3 aparecer"
        role="alert"
      >
        <UIcon name="i-tabler-alert-circle" class="w-6 h-6 flex-shrink-0 text-red-700" />
        <div>
          <p class="font-display text-xl font-semibold leading-tight">El pago no se pudo completar</p>
          <p class="mt-1">No se te cobró nada. Podés probar de nuevo, con el mismo medio de pago o con otro.</p>
        </div>
      </div>

      <!-- Períodos -->
      <section v-if="estado" class="bg-white rounded-3xl border-2 border-mona-100 p-5 sm:p-7">
        <h2 id="titulo-periodos" class="font-display text-2xl font-semibold text-mona-900">
          {{ estado.activa ? 'Renovar' : '¿Por cuánto tiempo querés renovar?' }}
        </h2>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4" role="radiogroup" aria-labelledby="titulo-periodos">
          <button
            v-for="plan in estado.planes"
            :key="plan.id"
            type="button"
            role="radio"
            :aria-checked="planElegido === plan.id"
            class="relative text-left p-4 rounded-2xl border-2 transition-colors"
            :class="planElegido === plan.id
              ? 'border-miel-500 bg-miel-50 shadow-[0_4px_0_0_var(--color-miel-500)]'
              : 'border-mona-100 bg-white hover:border-mona-300'"
            @click="planElegido = plan.id"
          >
            <UIcon
              v-if="planElegido === plan.id"
              name="i-tabler-circle-check-filled"
              class="absolute top-3 right-3 w-5 h-5 text-miel-600"
            />
            <span class="block font-display text-xl font-semibold text-mona-900 leading-tight">{{ plan.nombre }}</span>
            <span class="block font-display text-3xl font-bold text-mona-950 mt-2 leading-none">{{ plata(plan.precio) }}</span>
            <span class="block text-xs text-mona-800/70 mt-1.5">
              {{ plan.meses > 1 ? `${plata(plan.precio_por_mes)} por mes` : 'pesos uruguayos' }}
            </span>
          </button>
        </div>

        <div class="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
          <button
            type="button"
            class="boton-miel inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-display text-xl font-semibold"
            :disabled="pagando || verificando || !estado.pagos_habilitados"
            @click="pagar"
          >
            <UIcon :name="pagando ? 'i-tabler-loader-2' : 'i-tabler-lock'" class="w-5 h-5" :class="{ 'animate-spin': pagando }" />
            {{ pagando ? 'Abriendo Mercado Pago…' : 'Pagar con Mercado Pago' }}
          </button>
          <p class="text-sm text-mona-800/75 max-w-sm">
            Tarjeta de débito o crédito, Abitab, Redpagos o dinero en cuenta. Es un pago único: no se renueva solo.
          </p>
        </div>

        <p v-if="!estado.pagos_habilitados" class="mt-4 p-3 rounded-xl bg-miel-50 border border-miel-300 text-sm text-mona-950" role="status">
          Los pagos todavía no están habilitados. Escribinos y lo resolvemos.
        </p>
      </section>

      <p v-else class="p-5 rounded-2xl bg-white border-2 border-mona-100 text-mona-900">
        No pudimos cargar tu suscripción.
        <button type="button" class="font-bold underline underline-offset-2" @click="recargar">Probar de nuevo</button>
      </p>
    </div>
  </div>
</template>
