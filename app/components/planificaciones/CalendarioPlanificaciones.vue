<script setup lang="ts">
import { useAsistenteService } from '~/services/asistenteService/asistenteService'
import { appRoutes } from '~/utils/appRoutes'
import type { PlanificacionResumen } from '~/types/asistente'

// Vista de mes de las planificaciones: cada una con su color, en los días de clase que abarca.
const { planificacionesEntre } = useAsistenteService()
const toast = useToast()

// Colores bien distintos entre sí, para reconocer cada planificación de un vistazo.
const COLORES = ['#2563eb', '#16a34a', '#d97706', '#db2777', '#7c3aed', '#0891b2', '#dc2626', '#65a30d', '#c026d3', '#0d9488']

const hoy = new Date()
const mes = ref(new Date(hoy.getFullYear(), hoy.getMonth(), 1))
const planificaciones = ref<PlanificacionResumen[]>([])
const cargando = ref(false)

const iso = (fecha: Date) => `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`
const hoyIso = iso(hoy)

const colorDe = (p: PlanificacionResumen) => COLORES[p.id % COLORES.length]

const tituloMes = computed(() => {
  const texto = mes.value.toLocaleDateString('es-UY', { month: 'long', year: 'numeric' })
  return texto.charAt(0).toUpperCase() + texto.slice(1)
})

// Semanas de lunes a domingo que cubren el mes.
const semanas = computed(() => {
  const primero = mes.value
  const inicio = new Date(primero)
  inicio.setDate(primero.getDate() - ((primero.getDay() + 6) % 7))

  const ultimo = new Date(primero.getFullYear(), primero.getMonth() + 1, 0)
  const fin = new Date(ultimo)
  fin.setDate(ultimo.getDate() + (6 - ((ultimo.getDay() + 6) % 7)))

  const dias: Date[] = []
  for (const d = new Date(inicio); d <= fin; d.setDate(d.getDate() + 1)) {
    dias.push(new Date(d))
  }

  return Array.from({ length: dias.length / 7 }, (_, i) => dias.slice(i * 7, i * 7 + 7))
})

const rango = computed(() => {
  const todas = semanas.value.flat()
  return { desde: iso(todas[0]!), hasta: iso(todas[todas.length - 1]!) }
})

// fecha => planificaciones que tienen ese día de clase.
const porDia = computed(() => {
  const mapa: Record<string, { planificacion: PlanificacionResumen, tramos: number }[]> = {}

  for (const p of planificaciones.value) {
    for (const dia of p.dias) {
      (mapa[dia.fecha] ??= []).push({ planificacion: p, tramos: dia.tramos })
    }
  }

  return mapa
})

const cargar = async () => {
  cargando.value = true

  try {
    planificaciones.value = await planificacionesEntre(rango.value.desde, rango.value.hasta)
  } catch (e: any) {
    toast.error({ title: 'No pudimos cargar el calendario', message: typeof e === 'string' ? e : (e?.message ?? 'Probá de nuevo.') })
  } finally {
    cargando.value = false
  }
}

const mover = (meses: number) => {
  mes.value = new Date(mes.value.getFullYear(), mes.value.getMonth() + meses, 1)
}

const irAHoy = () => {
  mes.value = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
}

watch(rango, cargar, { immediate: true })
</script>

<template>
  <div class="bg-white rounded-2xl border-2 border-mona-100 overflow-hidden">
    <div class="flex items-center justify-between gap-3 px-4 py-3 border-b-2 border-mona-100">
      <h2 class="font-display text-2xl font-semibold text-mona-900">{{ tituloMes }}</h2>
      <div class="flex items-center gap-1.5">
        <span v-if="cargando" class="text-xs text-mona-800/60 mr-2">Cargando…</span>
        <button type="button" class="boton-mona px-3 py-1.5 rounded-xl font-bold text-sm" @click="irAHoy">Hoy</button>
        <button type="button" class="boton-mona p-2 rounded-xl" aria-label="Mes anterior" @click="mover(-1)">
          <UIcon name="i-tabler-chevron-left" class="w-4 h-4" />
        </button>
        <button type="button" class="boton-mona p-2 rounded-xl" aria-label="Mes siguiente" @click="mover(1)">
          <UIcon name="i-tabler-chevron-right" class="w-4 h-4" />
        </button>
      </div>
    </div>

    <div class="overflow-x-auto">
      <div class="min-w-[640px]">
        <div class="grid grid-cols-7 text-xs font-bold uppercase tracking-wide text-mona-800/60 border-b border-mona-100">
          <div v-for="nombre in ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']" :key="nombre" class="px-2 py-2 text-center">{{ nombre }}</div>
        </div>

        <div v-for="(semana, s) in semanas" :key="s" class="grid grid-cols-7 border-b border-mona-50 last:border-0">
          <div
            v-for="dia in semana"
            :key="iso(dia)"
            class="min-h-28 p-1.5 border-r border-mona-50 last:border-r-0"
            :class="[dia.getMonth() !== mes.getMonth() ? 'bg-mona-50/40' : '', dia.getDay() === 0 || dia.getDay() === 6 ? 'bg-mona-50/60' : '']"
          >
            <div class="flex justify-end">
              <span
                class="text-xs font-bold w-6 h-6 inline-flex items-center justify-center rounded-full"
                :class="iso(dia) === hoyIso ? 'bg-miel-400 text-mona-950' : (dia.getMonth() !== mes.getMonth() ? 'text-mona-800/40' : 'text-mona-900')"
              >
                {{ dia.getDate() }}
              </span>
            </div>

            <div class="flex flex-col gap-1 mt-0.5">
              <NuxtLink
                v-for="{ planificacion, tramos } in (porDia[iso(dia)] ?? []).slice(0, 3)"
                :key="planificacion.id"
                :to="appRoutes.planificacion(planificacion.id)"
                class="block truncate rounded-md px-1.5 py-0.5 text-[11px] font-bold text-white hover:opacity-85"
                :style="{ backgroundColor: colorDe(planificacion), opacity: tramos === 0 ? 0.55 : 1 }"
                :title="`${planificacion.titulo} · ${planificacion.grupo ?? 'Sin grupo'} · ${tramos} ${tramos === 1 ? 'tramo' : 'tramos'} este día`"
              >
                {{ planificacion.grupo ?? planificacion.titulo }} · {{ tramos }}
              </NuxtLink>
              <span v-if="(porDia[iso(dia)]?.length ?? 0) > 3" class="text-[11px] font-bold text-mona-800/70 px-1">
                +{{ porDia[iso(dia)]!.length - 3 }} más
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Referencias: qué color es cada planificación del mes -->
    <div v-if="planificaciones.length" class="flex flex-wrap gap-x-4 gap-y-2 px-4 py-3 border-t-2 border-mona-100 text-sm">
      <NuxtLink
        v-for="p in planificaciones"
        :key="p.id"
        :to="appRoutes.planificacion(p.id)"
        class="inline-flex items-center gap-2 text-mona-900 hover:underline"
      >
        <span class="w-3 h-3 rounded-sm flex-shrink-0" :style="{ backgroundColor: colorDe(p) }" />
        {{ p.titulo }}
        <span class="text-mona-800/60">({{ p.estado === 'confirmada' ? 'confirmada' : 'borrador' }})</span>
      </NuxtLink>
    </div>
    <p v-else-if="!cargando" class="px-4 py-3 border-t-2 border-mona-100 text-sm text-mona-800/70">No hay planificaciones en este mes.</p>
  </div>
</template>
