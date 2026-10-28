<script setup lang="ts">
import { useAsistenteService } from '~/services/asistenteService/asistenteService'
import type { ElegidoPrograma, ItemPrograma, ListaPrograma } from '~/types/asistente'

// Un dato del programa de un tramo (la unidad curricular, los contenidos, los criterios...): se
// elige de la lista oficial, con buscador, y después se puede ajustar la redacción de cada uno.

const props = withDefaults(defineProps<{
  titulo: string
  lista: ListaPrograma
  planificacionId: number
  multiple?: boolean
  filtros?: { unidad_curricular_id?: number | null, contenido_ids?: number[] }
  // Si falta algo para poder elegir (por ejemplo, la unidad curricular), el aviso.
  bloqueado?: string | null
  vacio?: string
  ayuda?: string
}>(), { multiple: true, filtros: () => ({}), bloqueado: null, vacio: 'Ninguno elegido.', ayuda: '' })

const elegidos = defineModel<ElegidoPrograma[]>({ required: true })

const { listaPrograma } = useAsistenteService()

const abierto = ref(false)
const busqueda = ref('')
const opciones = ref<ItemPrograma[]>([])
const hayMas = ref(false)
const cargando = ref(false)
const error = ref(false)
const editando = ref<number | null>(null)
let pedido = 0

const cargar = async () => {
  const numero = ++pedido
  cargando.value = true
  error.value = false

  try {
    const respuesta = await listaPrograma(props.planificacionId, props.lista, { ...props.filtros, busqueda: busqueda.value.trim() || undefined })
    if (numero !== pedido) return
    opciones.value = respuesta.resultados
    hayMas.value = respuesta.hay_mas
  } catch {
    if (numero === pedido) error.value = true
  } finally {
    if (numero === pedido) cargando.value = false
  }
}

const buscar = useDebounceFn(cargar, 300)

watch(busqueda, () => abierto.value && buscar())
// Si cambian los filtros (otra unidad u otros contenidos), la lista se vuelve a pedir.
watch(() => JSON.stringify(props.filtros), () => {
  opciones.value = []
  if (abierto.value) cargar()
})

const abrir = () => {
  if (props.bloqueado) return
  abierto.value = true
  busqueda.value = ''
  cargar()
}

const estaElegido = (id: number) => elegidos.value.some(elegido => elegido.id === id)

const alternar = (opcion: ItemPrograma) => {
  if (estaElegido(opcion.id)) {
    elegidos.value = elegidos.value.filter(elegido => elegido.id !== opcion.id)
    return
  }

  const nuevo: ElegidoPrograma = { id: opcion.id, oficial: opcion.texto, texto: opcion.texto, espacio: opcion.espacio, color: opcion.color }
  elegidos.value = props.multiple ? [...elegidos.value, nuevo] : [nuevo]

  if (!props.multiple) abierto.value = false
}

const quitar = (id: number) => {
  elegidos.value = elegidos.value.filter(elegido => elegido.id !== id)
}

const ajustar = (id: number, texto: string) => {
  elegidos.value = elegidos.value.map(elegido => elegido.id === id ? { ...elegido, texto } : elegido)
}

const terminarAjuste = (elegido: ElegidoPrograma) => {
  editando.value = null
  // Vacío vuelve al texto del programa.
  if (!elegido.texto.trim()) ajustar(elegido.id, elegido.oficial)
  else ajustar(elegido.id, elegido.texto.trim())
}

const ajustado = (elegido: ElegidoPrograma) => elegido.texto.trim() !== elegido.oficial.trim()
</script>

<template>
  <div class="selector">
    <div class="flex items-center justify-between gap-2">
      <p class="titulo">{{ titulo }}</p>
      <button
        v-if="!abierto"
        type="button"
        class="boton-elegir"
        :disabled="!!bloqueado"
        :title="bloqueado ?? undefined"
        @click="abrir"
      >
        <UIcon :name="elegidos.length && !multiple ? 'i-tabler-switch-horizontal' : 'i-tabler-plus'" class="w-4 h-4" />
        {{ elegidos.length && !multiple ? 'Cambiar' : 'Elegir' }}
      </button>
    </div>
    <p v-if="ayuda" class="text-xs text-mona-800/65 -mt-0.5 mb-1.5">{{ ayuda }}</p>

    <!-- Lo elegido, con su redacción -->
    <ul v-if="elegidos.length" class="space-y-1.5">
      <li v-for="elegido in elegidos" :key="elegido.id" class="elegido" :class="{ ajustado: ajustado(elegido) }">
        <template v-if="editando === elegido.id">
          <UTextarea
            :model-value="elegido.texto"
            autoresize
            :rows="2"
            :maxrows="8"
            class="w-full"
            :aria-label="`Redacción de: ${elegido.oficial}`"
            autofocus
            @update:model-value="ajustar(elegido.id, String($event))"
            @keydown.esc.prevent="terminarAjuste(elegido)"
          />
          <div class="flex flex-wrap items-center gap-3 mt-1.5">
            <button type="button" class="accion fuerte" @click="terminarAjuste(elegido)">Listo</button>
            <button v-if="ajustado(elegido)" type="button" class="accion" @click="ajustar(elegido.id, elegido.oficial)">Volver al texto del programa</button>
          </div>
        </template>

        <template v-else>
          <div class="flex items-start gap-2">
            <p class="flex-1 min-w-0 text-[0.92rem] leading-snug text-mona-950">{{ elegido.texto }}</p>
            <button type="button" class="icono" title="Ajustar la redacción" @click="editando = elegido.id">
              <UIcon name="i-tabler-pencil" class="w-4 h-4" />
              <span class="sr-only">Ajustar la redacción</span>
            </button>
            <button v-if="multiple" type="button" class="icono quitar" title="Quitar" @click="quitar(elegido.id)">
              <UIcon name="i-tabler-x" class="w-4 h-4" />
              <span class="sr-only">Quitar</span>
            </button>
          </div>
          <p v-if="ajustado(elegido)" class="mt-1 text-xs text-mona-800/70">
            <UIcon name="i-tabler-pencil" class="w-3 h-3 inline -mt-0.5" />
            Con tu redacción ·
            <button type="button" class="font-bold text-mona-700 hover:underline" @click="ajustar(elegido.id, elegido.oficial)">volver al texto del programa</button>
          </p>
        </template>
      </li>
    </ul>
    <p v-else-if="!abierto" class="text-sm text-mona-800/60">{{ bloqueado ?? vacio }}</p>

    <!-- La lista del programa -->
    <div v-if="abierto" class="lista">
      <div class="flex items-center gap-2 p-2 border-b border-mona-100">
        <UInput
          v-model="busqueda"
          icon="i-tabler-search"
          placeholder="Buscar…"
          size="sm"
          class="flex-1"
          autofocus
          :aria-label="`Buscar en ${titulo}`"
          @keydown.esc.prevent="abierto = false"
        />
        <button type="button" class="accion fuerte px-2" @click="abierto = false">Listo</button>
      </div>

      <div class="max-h-72 overflow-y-auto p-1.5">
        <p v-if="cargando && !opciones.length" class="flex items-center gap-2 px-2 py-3 text-sm text-mona-800/70">
          <UIcon name="i-tabler-loader-2" class="w-4 h-4 animate-spin" /> Buscando en el programa…
        </p>
        <p v-else-if="error" class="px-2 py-3 text-sm text-red-700">
          No se pudo cargar la lista. <button type="button" class="font-bold underline" @click="cargar">Probá de nuevo</button>
        </p>
        <p v-else-if="!opciones.length" class="px-2 py-3 text-sm text-mona-800/70">
          {{ busqueda ? 'No hay nada con esas palabras. Probá con otras.' : 'No hay opciones para elegir.' }}
        </p>

        <button
          v-for="opcion in opciones"
          :key="opcion.id"
          type="button"
          class="opcion"
          :class="{ elegida: estaElegido(opcion.id) }"
          :aria-pressed="estaElegido(opcion.id)"
          @click="alternar(opcion)"
        >
          <span class="marca" :class="multiple ? 'rounded-md' : 'rounded-full'" aria-hidden="true">
            <UIcon v-if="estaElegido(opcion.id)" name="i-tabler-check" class="w-3.5 h-3.5" />
          </span>
          <span class="min-w-0">
            <span class="block text-sm leading-snug text-mona-950">{{ opcion.texto }}</span>
            <span v-if="opcion.detalle" class="block text-xs text-mona-800/60 mt-0.5">{{ opcion.detalle }}</span>
          </span>
        </button>

        <p v-if="hayMas" class="px-2 py-2 text-xs text-mona-800/65">Hay más: escribí en el buscador para encontrarlos.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.titulo {
  font-size: 0.8rem;
  font-weight: 800;
  color: var(--color-mona-900);
  margin-bottom: 0.3rem;
}

.boton-elegir {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.15rem 0.55rem;
  border-radius: 0.55rem;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--color-mona-700);
}

.boton-elegir:hover:not(:disabled) {
  background: var(--color-mona-50);
}

.boton-elegir:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.elegido {
  padding: 0.55rem 0.65rem;
  border: 1.5px solid var(--color-mona-100);
  border-radius: 0.7rem;
  background: #fff;
}

.elegido.ajustado {
  border-color: var(--color-miel-300);
  background: var(--color-miel-50);
}

.icono {
  flex-shrink: 0;
  width: 1.6rem;
  height: 1.6rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.45rem;
  color: var(--color-mona-700);
}

.icono:hover {
  background: var(--color-mona-50);
}

.icono.quitar:hover {
  background: #fef2f2;
  color: #b91c1c;
}

.accion {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--color-mona-700);
}

.accion:hover {
  text-decoration: underline;
}

.accion.fuerte {
  color: var(--color-mona-900);
}

.lista {
  margin-top: 0.4rem;
  border: 1.5px solid var(--color-mona-200);
  border-radius: 0.8rem;
  background: #fff;
  box-shadow: 0 6px 18px rgb(23 28 76 / 0.08);
}

.opcion {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  width: 100%;
  padding: 0.5rem 0.55rem;
  border-radius: 0.55rem;
  text-align: left;
}

.opcion:hover {
  background: var(--color-mona-50);
}

.opcion.elegida {
  background: var(--color-mona-50);
}

.marca {
  flex-shrink: 0;
  width: 1.1rem;
  height: 1.1rem;
  margin-top: 0.1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--color-mona-300);
  background: #fff;
  color: #fff;
}

.opcion.elegida .marca {
  border-color: var(--color-mona-600);
  background: var(--color-mona-600);
}
</style>
