<script setup lang="ts">
// Demostración animada de una charla con Flopi. Reproduce el flujo real del asistente.
type Paso =
  | { tipo: 'flopi', texto: string }
  | { tipo: 'docente', texto: string }
  | { tipo: 'opciones', items: { texto: string, elegida?: boolean }[] }
  | { tipo: 'pensando' }
  | { tipo: 'hoja' }

const guion: Paso[] = [
  { tipo: 'flopi', texto: '¿Para qué grupo es la planificación?' },
  { tipo: 'docente', texto: '4to B' },
  { tipo: 'flopi', texto: '¿Desde qué día hasta qué día?' },
  { tipo: 'docente', texto: 'Del lunes 13 al viernes 17' },
  { tipo: 'flopi', texto: 'Lunes 13: ¿qué tramo agregamos?' },
  { tipo: 'docente', texto: 'Quiero trabajar fracciones' },
  { tipo: 'pensando' },
  { tipo: 'flopi', texto: 'Encontré estos contenidos del programa para 4to:' },
  { tipo: 'opciones', items: [
    { texto: 'Expresiones decimales y fraccionarias: equivalencia entre fracciones', elegida: true },
    { texto: 'Sistema métrico decimal: fraccionamiento de unidades de medida' },
  ] },
  { tipo: 'pensando' },
  { tipo: 'hoja' },
]

const visibles = ref(guion.length)
const animada = ref(false)
let reloj: ReturnType<typeof setTimeout> | null = null

// "Pensando" se muestra solo mientras es el último paso visible.
const pasos = computed(() =>
  guion.slice(0, visibles.value).filter((paso, i) => paso.tipo !== 'pensando' || i === visibles.value - 1)
)

const avanzar = () => {
  const actual = guion[visibles.value - 1]
  const termino = visibles.value >= guion.length

  if (termino) {
    reloj = setTimeout(() => { visibles.value = 1; avanzar() }, 5200)
    return
  }

  const espera = actual?.tipo === 'pensando' ? 1500 : actual?.tipo === 'docente' ? 900 : 1500
  reloj = setTimeout(() => { visibles.value++; avanzar() }, espera)
}

onMounted(() => {
  // Sin animación si la persona prefiere menos movimiento: queda la charla completa.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  animada.value = true
  visibles.value = 1
  avanzar()
})

onUnmounted(() => {
  if (reloj) clearTimeout(reloj)
})
</script>

<template>
  <div class="demo relative bg-white rounded-[2rem] border-2 border-mona-100 shadow-[0_10px_0_0_var(--color-mona-200)] overflow-hidden" aria-label="Ejemplo de una charla con Flopi">
    <div class="flex items-center gap-2.5 px-5 py-3 border-b-2 border-miel-200 bg-miel-50">
      <FlopiBee :size="38" :animo="pasos[pasos.length - 1]?.tipo === 'pensando' ? 'pensando' : 'quieta'" />
      <div>
        <p class="font-display text-lg font-bold text-mona-900 leading-none">Flopi</p>
        <p class="text-xs text-mona-800/70">Tu asistente de planificación</p>
      </div>
    </div>

    <div class="bg-panal flex flex-col justify-end gap-2.5 px-4 py-4 h-[29rem] overflow-hidden">
      <template v-for="(paso, i) in pasos" :key="i">
        <div v-if="paso.tipo === 'flopi'" class="burbuja self-start max-w-[85%] bg-white border-2 border-miel-200 rounded-2xl rounded-bl-md px-3.5 py-2 text-sm text-mona-950" :class="{ aparecer: animada }">
          {{ paso.texto }}
        </div>

        <div v-else-if="paso.tipo === 'docente'" class="self-end max-w-[85%] bg-mona-700 text-white rounded-2xl rounded-br-md px-3.5 py-2 text-sm" :class="{ aparecer: animada }">
          {{ paso.texto }}
        </div>

        <div v-else-if="paso.tipo === 'opciones'" class="self-start w-[92%] space-y-1.5" :class="{ aparecer: animada }">
          <div
            v-for="item in paso.items"
            :key="item.texto"
            class="flex items-start gap-2 rounded-xl border-2 px-3 py-2 text-[13px] leading-snug text-mona-950"
            :class="item.elegida ? 'border-miel-500 bg-miel-100' : 'border-mona-100 bg-white'"
          >
            <span class="mt-0.5 w-4 h-4 flex-shrink-0 rounded-md border-2 flex items-center justify-center" :class="item.elegida ? 'bg-miel-500 border-miel-600' : 'border-mona-200'">
              <UIcon v-if="item.elegida" name="i-tabler-check" class="w-3 h-3 text-white" />
            </span>
            {{ item.texto }}
          </div>
        </div>

        <div v-else-if="paso.tipo === 'pensando'" class="self-start flex items-center gap-2 bg-white border-2 border-miel-200 rounded-2xl rounded-bl-md px-3.5 py-2 text-sm text-mona-800" :class="{ aparecer: animada }">
          <span class="puntos" aria-hidden="true"><i /><i /><i /></span>
          Flopi está pensando…
        </div>

        <!-- La hoja que resulta -->
        <div v-else class="hoja-cuaderno self-stretch rounded-xl border-2 border-mona-100 pl-12 pr-4 py-3 shadow-[0_4px_0_0_var(--color-mona-100)]" :class="{ aparecer: animada }">
          <p class="text-[11px] font-extrabold uppercase tracking-wide text-mona-700">Lunes 13 · Tramo I</p>
          <p class="font-display text-lg font-bold text-mona-900 leading-tight">Fracciones equivalentes con tiras de papel</p>
          <p class="text-[11px] font-extrabold uppercase tracking-wide text-miel-700 mt-2">Meta de aprendizaje</p>
          <p class="text-[13px] leading-snug text-mona-950">
            Los estudiantes reconocerán fracciones equivalentes usando material concreto para comparar repartos.
          </p>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.puntos {
  display: inline-flex;
  gap: 3px;
}

.puntos i {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background-color: var(--color-miel-500);
  animation: punto 1s ease-in-out infinite;
}

.puntos i:nth-child(2) { animation-delay: 0.15s; }
.puntos i:nth-child(3) { animation-delay: 0.3s; }

@keyframes punto {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
  30% { transform: translateY(-4px); opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .puntos i { animation: none; }
}
</style>
