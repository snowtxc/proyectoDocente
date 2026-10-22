<script setup lang="ts">
import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum'
import { apiAdminRoutes } from '~/utils/apiRoutes'
import { appRoutes } from '~/utils/appRoutes'
import { useAuthStore } from '~/utils/authStore'
import type { ListResponse } from '~/types/list-response'
import type { ConfiguracionAdmin, UsuarioAdmin } from '~/types/admin'
import type { PlanSuscripcion } from '~/types/suscripcion'
import type { UsoIaDetalle } from '~/types/usoIa'

useSeoMeta({ title: 'Usuarios · Flopi Docentes' })

const { $apiRest } = useNuxtApp()
const toast = useToast()
const authStore = useAuthStore()

// Solo el superadmin. El backend lo exige igual en cada pedido.
if (authStore.user?.rol !== 'superadmin') {
  await navigateTo(appRoutes.asistente())
}

const usuarios = ref<UsuarioAdmin[]>([])
const total = ref(0)
const pagina = ref(1)
const porPagina = 20
const buscar = ref('')
const cargando = ref(false)

const planes = ref<PlanSuscripcion[]>([])
const configuraciones = ref<ConfiguracionAdmin[]>([])
const guardandoConfiguracion = ref<number | null>(null)

// Aplicar un plan a mano.
const usuarioElegido = ref<UsuarioAdmin | null>(null)
const planElegido = ref<number | null>(null)
const modalAbierto = ref(false)
const aplicando = ref(false)

// Consumo de IA de un usuario.
const consumoAbierto = ref(false)
const consumoUsuario = ref<UsuarioAdmin | null>(null)
const consumo = ref<UsoIaDetalle | null>(null)
const consumoPagina = ref(1)
const consumoPorPagina = 15
const cargandoConsumo = ref(false)

const dinero = (valor: number) => new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(valor)

const cargarConsumo = async () => {
  if (!consumoUsuario.value) return

  cargandoConsumo.value = true

  try {
    consumo.value = await $apiRest<UsoIaDetalle>(apiAdminRoutes.usoIa(consumoUsuario.value.id, consumoPagina.value, consumoPorPagina), HttpMethodEnum.GET)
  } catch (error: any) {
    toast.error({ title: 'No pudimos cargar el consumo', message: mensajeDe(error, 'Probá de nuevo.') })
  } finally {
    cargandoConsumo.value = false
  }
}

const verConsumo = (usuario: UsuarioAdmin) => {
  consumoUsuario.value = usuario
  consumo.value = null
  consumoPagina.value = 1
  consumoAbierto.value = true
  cargarConsumo()
}

watch(consumoPagina, cargarConsumo)

const mensajeDe = (error: any, porDefecto: string) => typeof error === 'string' ? error : (error?.message ?? porDefecto)

const fecha = (iso: string | null) => iso
  ? new Date(iso).toLocaleDateString('es-UY', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'America/Montevideo' })
  : '—'

const estadoDe = (usuario: UsuarioAdmin) => {
  if (usuario.rol === 'superadmin') return { texto: 'Sin vencimiento', clase: 'bg-mona-100 text-mona-900' }
  if (!usuario.activa) return { texto: 'Vencido', clase: 'bg-red-100 text-red-900' }

  return usuario.en_prueba
    ? { texto: 'Mes gratis', clase: 'bg-miel-100 text-miel-900' }
    : { texto: 'Al día', clase: 'bg-green-100 text-green-900' }
}

const cargarUsuarios = async () => {
  cargando.value = true

  try {
    const respuesta = await $apiRest<ListResponse<UsuarioAdmin[]>>(apiAdminRoutes.usuarios(pagina.value, porPagina, buscar.value.trim()), HttpMethodEnum.GET)

    usuarios.value = respuesta.list
    total.value = respuesta.totalCount
  } catch (error: any) {
    toast.error({ title: 'No pudimos cargar los usuarios', message: mensajeDe(error, 'Probá de nuevo.') })
  } finally {
    cargando.value = false
  }
}

let espera: ReturnType<typeof setTimeout> | null = null

const alBuscar = () => {
  if (espera) clearTimeout(espera)

  espera = setTimeout(() => {
    pagina.value = 1
    cargarUsuarios()
  }, 350)
}

watch(pagina, cargarUsuarios)

const abrirModal = (usuario: UsuarioAdmin) => {
  usuarioElegido.value = usuario
  planElegido.value = planes.value[0]?.id ?? null
  modalAbierto.value = true
}

const aplicarPlan = async () => {
  if (!usuarioElegido.value || planElegido.value === null || aplicando.value) return

  aplicando.value = true

  try {
    const actualizado = await $apiRest<UsuarioAdmin>(apiAdminRoutes.aplicarPlan(usuarioElegido.value.id), HttpMethodEnum.POST, { plan: planElegido.value })

    usuarios.value = usuarios.value.map(usuario => usuario.id === actualizado.id ? actualizado : usuario)
    modalAbierto.value = false
    toast.success({ title: 'Plan aplicado', message: `${actualizado.nombre} tiene Flopi hasta el ${fecha(actualizado.acceso_hasta)}.` })
  } catch (error: any) {
    toast.error({ title: 'No se pudo aplicar el plan', message: mensajeDe(error, 'Probá de nuevo.') })
  } finally {
    aplicando.value = false
  }
}

const guardarConfiguracion = async (configuracion: ConfiguracionAdmin) => {
  guardandoConfiguracion.value = configuracion.id

  try {
    const guardada = await $apiRest<ConfiguracionAdmin>(apiAdminRoutes.configuracion(configuracion.id), HttpMethodEnum.PUT, { valor: configuracion.valor })

    configuracion.valor = guardada.valor
    toast.success({ title: 'Guardado', message: 'El cambio ya está en uso.' })
  } catch (error: any) {
    const detalle = error?.errors?.valor?.[0]

    toast.error({ title: 'No se pudo guardar', message: detalle ?? mensajeDe(error, 'Revisá el valor.') })
  } finally {
    guardandoConfiguracion.value = null
  }
}

onMounted(async () => {
  if (authStore.user?.rol !== 'superadmin') return

  cargarUsuarios()

  try {
    const [listaPlanes, listaConfiguraciones] = await Promise.all([
      $apiRest<PlanSuscripcion[]>(apiAdminRoutes.planes, HttpMethodEnum.GET),
      $apiRest<ConfiguracionAdmin[]>(apiAdminRoutes.configuraciones, HttpMethodEnum.GET),
    ])

    planes.value = listaPlanes
    configuraciones.value = listaConfiguraciones
  } catch (error: any) {
    toast.error({ title: 'No pudimos cargar los planes o la configuración', message: mensajeDe(error, 'Probá de nuevo.') })
  }
})
</script>

<template>
  <div class="min-h-full px-4 sm:px-8 py-6 sm:py-8">
    <div class="max-w-6xl mx-auto">
      <header class="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 class="font-display text-4xl font-bold text-mona-900 leading-none">Usuarios</h1>
          <p class="text-mona-800/75 mt-2">
            <strong class="text-mona-900">{{ total }}</strong> {{ total === 1 ? 'cuenta' : 'cuentas' }}. Podés aplicarle un plan a mano a cualquiera, sin que pague.
          </p>
        </div>
        <UInput
          v-model="buscar"
          icon="i-tabler-search"
          autocomplete="off"
          placeholder="Buscar por nombre o correo…"
          size="lg"
          class="w-full sm:w-80"
          aria-label="Buscar usuarios"
          @input="alBuscar"
        />
      </header>

      <!-- Listado -->
      <div class="bg-white rounded-2xl border-2 border-mona-100 overflow-x-auto">
        <table class="w-full text-sm text-left">
          <thead class="text-xs uppercase tracking-wide text-mona-800/70 border-b-2 border-mona-100">
            <tr>
              <th scope="col" class="px-4 py-3">Usuario</th>
              <th scope="col" class="px-4 py-3">Rol</th>
              <th scope="col" class="px-4 py-3">Alta</th>
              <th scope="col" class="px-4 py-3">Acceso hasta</th>
              <th scope="col" class="px-4 py-3">Estado</th>
              <th scope="col" class="px-4 py-3">IA del mes</th>
              <th scope="col" class="px-4 py-3">Gasto IA</th>
              <th scope="col" class="px-4 py-3"><span class="sr-only">Acciones</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="usuario in usuarios" :key="usuario.id" class="border-b border-mona-50 last:border-0">
              <td class="px-4 py-3">
                <span class="block font-bold text-mona-950">{{ usuario.nombre }}</span>
                <span class="block text-mona-800/75">{{ usuario.email }}</span>
              </td>
              <td class="px-4 py-3 text-mona-900">{{ usuario.rol === 'superadmin' ? 'Superadmin' : 'Docente' }}</td>
              <td class="px-4 py-3 text-mona-900 whitespace-nowrap">{{ fecha(usuario.alta) }}</td>
              <td class="px-4 py-3 text-mona-900 whitespace-nowrap">{{ usuario.rol === 'superadmin' ? '—' : fecha(usuario.acceso_hasta) }}</td>
              <td class="px-4 py-3">
                <span class="inline-block px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap" :class="estadoDe(usuario).clase">
                  {{ estadoDe(usuario).texto }}
                </span>
              </td>
              <td class="px-4 py-3 text-mona-900">{{ usuario.rol === 'superadmin' ? '—' : `${usuario.uso_ia} %` }}</td>
              <td class="px-4 py-3 text-mona-900 whitespace-nowrap">{{ dinero(usuario.gasto_ia) }}</td>
              <td class="px-4 py-3 text-right whitespace-nowrap">
                <button
                  type="button"
                  class="boton-mona inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold whitespace-nowrap mr-2"
                  @click="verConsumo(usuario)"
                >
                  <UIcon name="i-tabler-sparkles" class="w-4 h-4" />
                  Consumo
                </button>
                <button
                  v-if="usuario.rol !== 'superadmin'"
                  type="button"
                  class="boton-mona inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold whitespace-nowrap"
                  @click="abrirModal(usuario)"
                >
                  <UIcon name="i-tabler-gift" class="w-4 h-4" />
                  Aplicar plan
                </button>
              </td>
            </tr>
            <tr v-if="!cargando && usuarios.length === 0">
              <td colspan="8" class="px-4 py-8 text-center text-mona-800/75">No hay usuarios que coincidan.</td>
            </tr>
            <tr v-if="cargando && usuarios.length === 0">
              <td colspan="8" class="px-4 py-8 text-center text-mona-800/75">Cargando…</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="total > porPagina" class="flex justify-center mt-5">
        <UPagination v-model:page="pagina" :items-per-page="porPagina" :total="total" />
      </div>

      <!-- Configuración -->
      <section class="mt-10">
        <h2 class="font-display text-2xl font-semibold text-mona-900">Configuración</h2>
        <p class="text-mona-800/75 mt-1">Los cambios rigen al instante, sin desplegar.</p>

        <div class="mt-4 bg-white rounded-2xl border-2 border-mona-100 divide-y divide-mona-50">
          <form
            v-for="configuracion in configuraciones"
            :key="configuracion.id"
            class="flex flex-wrap items-center gap-3 px-4 py-3"
            @submit.prevent="guardarConfiguracion(configuracion)"
          >
            <label :for="`configuracion-${configuracion.id}`" class="flex-1 min-w-60">
              <span class="block font-mono text-sm font-bold text-mona-950">{{ configuracion.clave }}</span>
              <span class="block text-sm text-mona-800/75">{{ configuracion.descripcion }}</span>
            </label>
            <UInput :id="`configuracion-${configuracion.id}`" v-model="configuracion.valor" size="lg" class="w-44" autocomplete="off" />
            <button
              type="submit"
              class="boton-mona px-4 py-2 rounded-xl font-bold"
              :disabled="guardandoConfiguracion === configuracion.id"
            >
              {{ guardandoConfiguracion === configuracion.id ? 'Guardando…' : 'Guardar' }}
            </button>
          </form>
        </div>
      </section>
    </div>

    <!-- Consumo de IA de un usuario -->
    <UModal
      v-model:open="consumoAbierto"
      title="Consumo de IA"
      :description="consumoUsuario ? `${consumoUsuario.nombre} · ${consumoUsuario.email}` : ''"
      :ui="{ content: 'sm:max-w-3xl' }"
    >
      <template #body>
        <SettingsUsoIaDetalle v-model:pagina="consumoPagina" :datos="consumo" :cargando="cargandoConsumo" :por-pagina="consumoPorPagina" />
      </template>
    </UModal>

    <!-- Aplicar un plan a mano -->
    <UModal
      v-model:open="modalAbierto"
      title="Aplicar un plan"
      :description="usuarioElegido ? `${usuarioElegido.nombre} · ${usuarioElegido.email}` : ''"
    >
      <template #body>
        <p class="text-sm text-mona-900">
          Se le suman los meses del plan sin cobrarle nada. Si todavía le quedan días, se agregan al final.
          Queda registrado que lo aplicaste vos.
        </p>

        <div class="grid grid-cols-2 gap-2 mt-4" role="radiogroup" aria-label="Plan a aplicar">
          <button
            v-for="plan in planes"
            :key="plan.id"
            type="button"
            role="radio"
            :aria-checked="planElegido === plan.id"
            class="px-4 py-3 rounded-xl border-2 text-left font-display text-lg font-semibold text-mona-900 transition-colors"
            :class="planElegido === plan.id ? 'border-miel-500 bg-miel-50' : 'border-mona-100 hover:border-mona-300'"
            @click="planElegido = plan.id"
          >
            {{ plan.nombre }}
          </button>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2 w-full">
          <button type="button" class="boton-mona px-4 py-2.5 rounded-xl font-bold" @click="modalAbierto = false">Cancelar</button>
          <button
            type="button"
            class="boton-miel px-5 py-2.5 rounded-xl font-display text-lg font-semibold"
            :disabled="aplicando || planElegido === null"
            @click="aplicarPlan"
          >
            {{ aplicando ? 'Aplicando…' : 'Aplicar plan' }}
          </button>
        </div>
      </template>
    </UModal>
  </div>
</template>
