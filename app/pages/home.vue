<script setup lang="ts">
import { useAsistenteService } from '~/services/asistenteService/asistenteService'
import type { DescripcionFundada, EnvioMensaje, EstadoSesion, MensajeChat, Planificacion } from '~/types/asistente'
import ChatMensaje from '~/components/asistente/ChatMensaje.vue'
import ChatOpciones from '~/components/asistente/ChatOpciones.vue'
import PlanificacionPreview from '~/components/asistente/PlanificacionPreview.vue'
import DescripcionPreview from '~/components/asistente/DescripcionPreview.vue'

const { iniciar, obtenerEstado, enviar } = useAsistenteService()
const toast = useToast()
const authStore = useAuthStore()

const nombreDocente = computed(() => authStore.user?.nombre1 ?? '')

// Al entrar solo está el saludo: se muestra a Flopi en grande con las acciones rápidas.
const esBienvenida = computed(() => sesion.value?.estado === 'inicio' && !mensajePendiente.value)

// El ánimo de Flopi acompaña lo que está pasando.
const animoFlopi = computed(() => {
  if (enviando.value) return 'pensando'
  return sesion.value?.planificacion || sesion.value?.descripcion ? 'contenta' : 'quieta'
})

// La conversación en curso se recuerda para retomarla al volver a entrar.
const CLAVE_SESION = 'flopi-asistente-sesion'

const sesion = ref<EstadoSesion | null>(null)
const cargandoSesion = ref(true)
const enviando = ref(false)
const texto = ref('')

// Mensaje del docente que se muestra mientras el asistente responde.
const mensajePendiente = ref<MensajeChat | null>(null)

const listaMensajes = ref<HTMLElement | null>(null)

const mensajes = computed<MensajeChat[]>(() => {
  const lista = sesion.value?.mensajes ?? []
  return mensajePendiente.value ? [...lista, mensajePendiente.value] : lista
})

// Solo se pueden usar las opciones del último mensaje del asistente.
const opcionesActivas = computed(() => {
  if (enviando.value || !sesion.value) return null

  const ultimo = sesion.value.mensajes[sesion.value.mensajes.length - 1]
  return ultimo?.rol === 'asistente' ? ultimo.opciones ?? null : null
})

const placeholder = computed(() => sesion.value?.ayuda_texto_libre ?? 'Escribí tu mensaje…')

const mensajesDeEspera = [
  'Flopi está pensando…',
  'Revoloteando por el programa…',
  'Juntando ideas…',
  'Ya casi lo tengo…',
]
const indiceEspera = ref(0)
let intervaloEspera: ReturnType<typeof setInterval> | null = null

watch(enviando, (valor) => {
  if (valor) {
    indiceEspera.value = 0
    intervaloEspera = setInterval(() => {
      indiceEspera.value = (indiceEspera.value + 1) % mensajesDeEspera.length
    }, 3500)
  } else if (intervaloEspera) {
    clearInterval(intervaloEspera)
  }
})

const bajarAlFinal = async () => {
  await nextTick()
  listaMensajes.value?.scrollTo({ top: listaMensajes.value.scrollHeight, behavior: 'smooth' })
}

watch(() => [mensajes.value.length, enviando.value], bajarAlFinal)

const usarSesion = (estado: EstadoSesion) => {
  sesion.value = estado

  if (estado.uso_ia) {
    useSuscripcionStore().actualizarUsoIa(estado.uso_ia)
  }
  localStorage.setItem(CLAVE_SESION, String(estado.id))
}

const nuevaConversacion = async () => {
  cargandoSesion.value = true
  try {
    usarSesion(await iniciar())
  } catch (message) {
    toast.error({ title: 'No se pudo abrir el asistente', message: String(message) })
  } finally {
    cargandoSesion.value = false
  }
}

onMounted(async () => {
  const guardada = Number(localStorage.getItem(CLAVE_SESION))

  if (guardada) {
    try {
      usarSesion(await obtenerEstado(guardada))
      cargandoSesion.value = false
      bajarAlFinal()
      return
    } catch {
      // La conversación ya no existe: se empieza una nueva.
      localStorage.removeItem(CLAVE_SESION)
    }
  }

  await nuevaConversacion()
})

onUnmounted(() => {
  if (intervaloEspera) clearInterval(intervaloEspera)
})

const mandar = async (envio: EnvioMensaje, textoVisible: string) => {
  if (!sesion.value || enviando.value) return

  enviando.value = true
  mensajePendiente.value = { id: 'pendiente', rol: 'docente', contenido: textoVisible }

  try {
    usarSesion(await enviar(sesion.value.id, envio))
  } catch (e: any) {
    const detalle = typeof e === 'string' ? e : (e?.texto?.[0] ?? 'Probá de nuevo en un momento.')
    toast.error({ title: 'No se pudo enviar', message: detalle })
  } finally {
    mensajePendiente.value = null
    enviando.value = false
  }
}

const enviarTexto = () => {
  const mensaje = texto.value.trim()
  if (!mensaje) return

  texto.value = ''
  mandar({ texto: mensaje }, mensaje)
}

const elegirOpciones = (ids: (number | string)[], textoVisible?: string) => {
  const opciones = opcionesActivas.value
  if (!opciones) return

  const elegidas = opciones.items.filter(item => ids.includes(item.id)).map(item => item.texto)

  mandar({ seleccion: { clave: opciones.clave, ids } }, textoVisible ?? elegidas.join('\n'))
}

// Edición directa desde la vista previa.
const alActualizarPlanificacion = (planificacion: Planificacion) => {
  if (sesion.value) {
    sesion.value = { ...sesion.value, planificacion }
  }
}

const alActualizarDescripcion = (descripcion: DescripcionFundada) => {
  if (sesion.value) {
    sesion.value = { ...sesion.value, descripcion }
  }
}

// Ícono de cada tipo de documento en la bienvenida.
const iconosDocumento: Record<string, string> = {
  planificacion: 'i-tabler-notebook',
  descripcion_fundada: 'i-tabler-user-heart',
}

// Hay un documento abierto al costado del chat.
const hayHoja = computed(() => !!sesion.value?.planificacion || !!sesion.value?.descripcion)

// Al confirmar cambian el estado y los mensajes: se vuelve a pedir la sesión.
const alConfirmar = async () => {
  if (!sesion.value) return

  try {
    usarSesion(await obtenerEstado(sesion.value.id))
  } catch (message) {
    toast.error({ title: 'No se pudo actualizar la conversación', message: String(message) })
  }
}
</script>

<template>
  <div class="flex flex-col lg:flex-row h-full">
    <!-- ================= Chat ================= -->
    <section
      class="flex flex-col min-h-0 flex-1"
      :class="hayHoja ? 'lg:max-w-[34rem] lg:border-r-2 border-miel-200' : ''"
    >
      <header class="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-white/80 backdrop-blur border-b-2 border-miel-200">
        <div class="flex items-center gap-3 min-w-0">
          <FlopiBee :size="46" :animo="animoFlopi" />
          <div class="min-w-0">
            <h1 class="font-display text-xl font-bold text-mona-900 leading-tight">Flopi</h1>
            <p class="text-xs text-mona-800/70 truncate">
              {{ enviando ? 'Está trabajando en tu pedido…' : 'Te acompaño paso a paso con tus documentos' }}
            </p>
          </div>
        </div>
        <button
          type="button"
          class="boton-mona inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold flex-shrink-0"
          :disabled="enviando || cargandoSesion"
          @click="nuevaConversacion"
        >
          <UIcon name="i-tabler-refresh" class="w-4 h-4" />
          <span class="hidden sm:inline">Empezar de nuevo</span>
        </button>
      </header>

      <div ref="listaMensajes" class="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <div class="max-w-2xl mx-auto">
          <div v-if="cargandoSesion" class="flex flex-col items-center gap-4 pt-16 text-mona-800/70">
            <FlopiBee :size="88" animo="pensando" />
            <p class="font-display text-lg">Flopi viene volando…</p>
          </div>

          <!-- Bienvenida: Flopi en grande y las acciones rápidas -->
          <div v-else-if="esBienvenida" class="aparecer flex flex-col items-center text-center pt-6 sm:pt-12">
            <FlopiBee :size="150" />
            <h2 class="font-display text-3xl sm:text-4xl font-bold text-mona-900 mt-4 leading-tight">
              ¡Hola<template v-if="nombreDocente">, {{ nombreDocente }}</template>! Soy Flopi
            </h2>
            <p class="text-mona-800/80 mt-2 max-w-md">
              Elegí qué querés armar y lo vamos haciendo paso a paso.
            </p>
            <div v-if="opcionesActivas" class="mt-7 flex flex-wrap justify-center gap-3">
              <button
                v-for="item in opcionesActivas.items"
                :key="item.id"
                type="button"
                class="boton-miel inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-display text-lg font-semibold"
                :disabled="enviando"
                @click="elegirOpciones([item.id])"
              >
                <UIcon :name="iconosDocumento[String(item.id)] ?? 'i-tabler-file-text'" class="w-6 h-6" />
                {{ item.texto }}
              </button>
            </div>
          </div>

          <div v-else class="space-y-4">
            <ChatMensaje v-for="mensaje in mensajes" :key="mensaje.id" :mensaje="mensaje" />

            <!-- Opciones clickeables del paso actual -->
            <div v-if="opcionesActivas" class="pl-[3.25rem]">
              <ChatOpciones :opciones="opcionesActivas" :disabled="enviando" @elegir="elegirOpciones" />
            </div>

            <!-- Flopi pensando -->
            <div v-if="enviando" class="aparecer flex items-end gap-2.5" role="status" aria-live="polite">
              <FlopiBee :size="48" animo="pensando" class="mb-1" />
              <div class="flex items-center gap-3 px-4 py-3 rounded-3xl rounded-bl-lg bg-white border-2 border-miel-200 text-[15px] text-mona-800">
                <span class="puntos" aria-hidden="true"><i /><i /><i /></span>
                {{ mensajesDeEspera[indiceEspera] }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Texto libre -->
      <form class="px-4 sm:px-6 pb-4 pt-2" @submit.prevent="enviarTexto">
        <div class="max-w-2xl mx-auto flex items-end gap-2 p-1.5 pl-4 bg-white rounded-[1.75rem] border-2 border-miel-300 shadow-[0_4px_0_0_var(--color-miel-200)] focus-within:border-mona-400">
          <UTextarea
            v-model="texto"
            :rows="1"
            :maxrows="5"
            autoresize
            variant="none"
            class="flex-1"
            :ui="{ base: 'px-0 py-2 text-[15px] text-mona-950 placeholder:text-mona-800/50' }"
            maxlength="1000"
            :placeholder="placeholder"
            :disabled="enviando || cargandoSesion"
            aria-label="Tu mensaje para Flopi"
            @keydown.enter.exact.prevent="enviarTexto"
          />
          <button
            type="submit"
            class="boton-miel w-11 h-11 mb-1 flex-shrink-0 rounded-full flex items-center justify-center"
            aria-label="Enviar"
            :disabled="enviando || cargandoSesion || texto.trim() === ''"
          >
            <UIcon name="i-tabler-send-2" class="w-5 h-5" />
          </button>
        </div>
      </form>
    </section>

    <!-- ================= Descripción fundada ================= -->
    <section v-if="sesion?.descripcion" class="flex-1 min-h-0 border-t-2 lg:border-t-0 border-miel-200">
      <DescripcionPreview
        :descripcion="sesion.descripcion"
        :ocupado="enviando"
        @actualizada="alActualizarDescripcion"
      />
    </section>

    <!-- ================= Vista previa ================= -->
    <section v-else-if="sesion?.planificacion" class="flex-1 min-h-0 border-t-2 lg:border-t-0 border-miel-200">
      <PlanificacionPreview
        :planificacion="sesion.planificacion"
        :ocupado="enviando"
        :borrador="sesion.borrador_tramo"
        @actualizada="alActualizarPlanificacion"
        @confirmada="alConfirmar"
      />
    </section>
  </div>
</template>

<style scoped>
/* Tres puntitos que saltan mientras Flopi piensa. */
.puntos {
  display: inline-flex;
  gap: 4px;
}

.puntos i {
  width: 7px;
  height: 7px;
  border-radius: 9999px;
  background-color: var(--color-miel-500);
  animation: punto 1s ease-in-out infinite;
}

.puntos i:nth-child(2) { animation-delay: 0.15s; }
.puntos i:nth-child(3) { animation-delay: 0.3s; }

@keyframes punto {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
  30% { transform: translateY(-5px); opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .puntos i { animation: none; }
}
</style>
