<script setup lang="ts">
import type { UsoIaDetalle } from '~/types/usoIa'

// Consumo de IA de un usuario: el mes en curso, los meses anteriores y cada uso.
// Lo usan Configuración > Uso de la IA y el detalle por usuario del superadmin.
interface Props {
  datos: UsoIaDetalle | null
  cargando?: boolean
  porPagina: number
}

const props = withDefaults(defineProps<Props>(), { cargando: false })
const pagina = defineModel<number>('pagina', { default: 1 })

const dinero = (valor: number) => new Intl.NumberFormat('es-UY', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
}).format(valor)

const numero = (valor: number) => new Intl.NumberFormat('es-UY').format(valor)

const nombreMes = (periodo: string) => {
  const texto = new Date(`${periodo}-15T12:00:00`).toLocaleDateString('es-UY', { month: 'long', year: 'numeric' })

  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

const fechaHora = (iso: string) => new Date(iso).toLocaleString('es-UY', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/Montevideo',
})

const seRenueva = computed(() => props.datos
  ? new Date(`${props.datos.mes.se_renueva}T12:00:00`).toLocaleDateString('es-UY', { day: 'numeric', month: 'long' })
  : '')

// Los meses anteriores: el actual ya está arriba.
const mesesAnteriores = computed(() => (props.datos?.meses ?? []).filter(mes => mes.periodo !== props.datos?.mes.periodo))
</script>

<template>
  <div v-if="datos" class="flex flex-col gap-6 text-sm">
    <!-- Este mes -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div class="rounded-xl border border-mona-100 bg-white px-4 py-3">
        <p class="text-mona-800/70">Gastado este mes</p>
        <p class="font-display text-2xl font-semibold text-mona-950 mt-0.5">{{ dinero(datos.mes.gastado_usd) }}</p>
        <p class="text-mona-800/70 mt-0.5">
          <template v-if="datos.mes.tope_usd !== null">
            {{ datos.mes.porcentaje }} % de {{ dinero(datos.mes.tope_usd) }} · se renueva el {{ seRenueva }}
          </template>
          <template v-else>Sin tope</template>
        </p>
      </div>
      <div class="rounded-xl border border-mona-100 bg-white px-4 py-3">
        <p class="text-mona-800/70">Tramos generados</p>
        <p class="font-display text-2xl font-semibold text-mona-950 mt-0.5">{{ numero(datos.mes.tramos_generados) }}</p>
        <p class="text-mona-800/70 mt-0.5">este mes</p>
      </div>
      <div class="rounded-xl border border-mona-100 bg-white px-4 py-3">
        <p class="text-mona-800/70">Correcciones</p>
        <p class="font-display text-2xl font-semibold text-mona-950 mt-0.5">{{ numero(datos.mes.correcciones) }}</p>
        <p class="text-mona-800/70 mt-0.5">{{ numero(datos.mes.usos) }} {{ datos.mes.usos === 1 ? 'uso' : 'usos' }} de la IA en total</p>
      </div>
    </div>

    <!-- Meses anteriores -->
    <section v-if="mesesAnteriores.length">
      <h3 class="font-bold text-mona-900 mb-2">Meses anteriores</h3>
      <div class="rounded-xl border border-mona-100 bg-white overflow-x-auto">
        <table class="w-full text-left">
          <thead class="text-xs uppercase tracking-wide text-mona-800/60 border-b border-mona-100">
            <tr>
              <th scope="col" class="px-4 py-2">Mes</th>
              <th scope="col" class="px-4 py-2 text-right">Tramos</th>
              <th scope="col" class="px-4 py-2 text-right">Correcciones</th>
              <th scope="col" class="px-4 py-2 text-right">Gastado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="mes in mesesAnteriores" :key="mes.periodo" class="border-b border-mona-50 last:border-0">
              <td class="px-4 py-2 text-mona-900">{{ nombreMes(mes.periodo) }}</td>
              <td class="px-4 py-2 text-right text-mona-900">{{ numero(mes.tramos_generados) }}</td>
              <td class="px-4 py-2 text-right text-mona-900">{{ numero(mes.correcciones) }}</td>
              <td class="px-4 py-2 text-right text-mona-900">{{ dinero(mes.gastado_usd) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Cada uso -->
    <section>
      <h3 class="font-bold text-mona-900 mb-2">Detalle de usos</h3>
      <div class="rounded-xl border border-mona-100 bg-white overflow-x-auto">
        <table class="w-full text-left">
          <thead class="text-xs uppercase tracking-wide text-mona-800/60 border-b border-mona-100">
            <tr>
              <th scope="col" class="px-4 py-2">Fecha</th>
              <th scope="col" class="px-4 py-2">Qué hizo la IA</th>
              <th scope="col" class="px-4 py-2 text-right">Tokens</th>
              <th scope="col" class="px-4 py-2 text-right">Costo</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="registro in datos.registros.list" :key="registro.id" class="border-b border-mona-50 last:border-0">
              <td class="px-4 py-2 text-mona-800/80 whitespace-nowrap">{{ fechaHora(registro.fecha) }}</td>
              <td class="px-4 py-2 text-mona-900">
                {{ registro.accion }}
                <span v-if="!registro.exitoso" class="text-mona-800/60">(no se completó)</span>
              </td>
              <td
                class="px-4 py-2 text-right text-mona-800/80 whitespace-nowrap"
                :title="`${numero(registro.tokens_entrada)} de entrada · ${numero(registro.tokens_salida)} de salida`"
              >
                {{ numero(registro.tokens_entrada + registro.tokens_salida) }}
              </td>
              <td class="px-4 py-2 text-right text-mona-900 whitespace-nowrap">{{ dinero(registro.costo_usd) }}</td>
            </tr>
            <tr v-if="datos.registros.list.length === 0">
              <td colspan="4" class="px-4 py-6 text-center text-mona-800/70">Todavía no hay usos registrados.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="datos.registros.totalCount > porPagina" class="flex justify-center mt-4">
        <UPagination v-model:page="pagina" :items-per-page="porPagina" :total="datos.registros.totalCount" size="sm" />
      </div>
    </section>
  </div>

  <p v-else-if="cargando" class="text-sm text-mona-800/70">Cargando…</p>
</template>
