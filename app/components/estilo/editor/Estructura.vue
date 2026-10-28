<script setup lang="ts">
import draggable from 'vuedraggable'
import type { CampoTramo, DisenoFormato, Disposicion } from '~/types/estilo'

// Dónde va cada campo del tramo. En el cuadro con celdas, filas de hasta tres celdas; en el de
// dos columnas y en el texto seguido, una lista. Los campos que no se usan quedan abajo.
const props = defineProps<{ campos: DisenoFormato['campos'] }>()

const disposicion = defineModel<Disposicion>('disposicion', { required: true })
const filas = defineModel<CampoTramo[][][]>('filas', { required: true })
const orden = defineModel<CampoTramo[]>('orden', { required: true })
const nombres = defineModel<Record<string, string>>('nombres', { required: true })

const MAX_FILAS = 10
const MAX_CELDAS = 3

const disposiciones: { valor: Disposicion, nombre: string, ayuda: string }[] = [
  { valor: 'cuadricula', nombre: 'Cuadro con celdas', ayuda: 'Un cuadro por tramo. Ubicás los campos en filas, hasta tres uno al lado del otro.' },
  { valor: 'tabla_etiquetas', nombre: 'Dos columnas', ayuda: 'Un cuadro por tramo: el nombre del campo a la izquierda y el texto a la derecha.' },
  { valor: 'secuencial', nombre: 'Texto seguido', ayuda: 'Un campo abajo del otro, sin cuadro.' },
]

const porDefecto = (campo: CampoTramo) => props.campos.find(c => c.campo === campo)?.etiqueta ?? campo
const obligatorio = (campo: CampoTramo) => !!props.campos.find(c => c.campo === campo)?.obligatorio
const clave = (campo: CampoTramo) => campo

const visibles = computed<CampoTramo[]>(() => disposicion.value === 'cuadricula' ? filas.value.flat(2) : [...orden.value])

// Los ocultos tienen su propia lista para poder arrastrarlos; siempre son los que no están visibles.
const ocultos = ref<CampoTramo[]>([])

watch(visibles, (lista) => {
  const fuera = props.campos.map(c => c.campo).filter(c => !lista.includes(c))
  ocultos.value = [...ocultos.value.filter(c => fuera.includes(c)), ...fuera.filter(c => !ocultos.value.includes(c))]
}, { immediate: true })

// Meta y plan no se pueden soltar entre los ocultos.
const grupoOcultos = {
  name: 'campos',
  put: (_destino: unknown, _origen: unknown, elemento: HTMLElement) => !obligatorio(elemento.dataset.campo as CampoTramo),
}

// En el celular, arrastrar arranca después de mantener apretado: así se puede seguir desplazando la página.
const arrastre = {
  animation: 150,
  ghostClass: 'fantasma',
  filter: '.no-arrastrar',
  preventOnFilter: false,
  delay: 150,
  delayOnTouchOnly: true,
}

const ocultar = (campo: CampoTramo) => {
  if (disposicion.value !== 'cuadricula') {
    orden.value.splice(orden.value.indexOf(campo), 1)
    return
  }

  for (const fila of filas.value) {
    for (const celda of fila) {
      if (celda.includes(campo)) celda.splice(celda.indexOf(campo), 1)
    }
  }
}

const mostrar = (campo: CampoTramo) => {
  if (disposicion.value !== 'cuadricula') {
    orden.value.push(campo)
  } else if (filas.value.length < MAX_FILAS) {
    filas.value.push([[campo]])
  } else {
    filas.value[filas.value.length - 1]!.at(-1)!.push(campo)
  }
}

const tieneObligatorio = (fila: CampoTramo[][]) => fila.flat().some(obligatorio)

const moverFila = (i: number, paso: number) => {
  const [fila] = filas.value.splice(i, 1)
  filas.value.splice(i + paso, 0, fila!)
}

// Solo celdas vacías. Si la fila se queda sin celdas, se va la fila.
const quitarCelda = (i: number, j: number) => {
  filas.value[i]!.splice(j, 1)
  if (!filas.value[i]!.length) filas.value.splice(i, 1)
}

const ayuda = computed(() => disposiciones.find(d => d.valor === disposicion.value)?.ayuda)
</script>

<template>
  <div class="space-y-6">
    <section>
      <h4 class="titulo">Cómo se arma cada tramo</h4>
      <div class="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Cómo se arma cada tramo">
        <button
          v-for="opcion in disposiciones"
          :key="opcion.valor"
          type="button"
          role="radio"
          class="disposicion"
          :class="{ elegida: disposicion === opcion.valor }"
          :aria-checked="disposicion === opcion.valor"
          @click="disposicion = opcion.valor"
        >
          <span class="miniatura" :class="opcion.valor" aria-hidden="true">
            <template v-if="opcion.valor === 'cuadricula'">
              <i /><i /><i /><i /><i class="ancha" />
            </template>
            <template v-else-if="opcion.valor === 'tabla_etiquetas'">
              <i /><i class="ancha" /><i /><i class="ancha" /><i /><i class="ancha" />
            </template>
            <template v-else>
              <i /><i /><i class="corta" /><i /><i class="corta" />
            </template>
          </span>
          <span class="text-xs font-bold leading-tight">{{ opcion.nombre }}</span>
        </button>
      </div>
      <p class="text-xs text-mona-800/70 mt-2">{{ ayuda }}</p>
    </section>

    <section>
      <h4 class="titulo">Dónde va cada campo</h4>
      <p class="text-xs text-mona-800/70 -mt-1 mb-2">
        Arrastralos para ubicarlos (en el celular, mantené apretado). Con el lápiz les cambiás el nombre.
      </p>

      <div v-if="disposicion === 'cuadricula'" class="space-y-2">
        <div v-for="(fila, i) in filas" :key="i" class="fila">
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-xs font-bold text-mona-800/70">Fila {{ i + 1 }}</span>
            <div class="flex items-center gap-0.5">
              <button type="button" class="accion-fila" title="Subir la fila" :disabled="i === 0" @click="moverFila(i, -1)">
                <UIcon name="i-tabler-arrow-up" class="w-3.5 h-3.5" />
                <span class="sr-only">Subir la fila {{ i + 1 }}</span>
              </button>
              <button type="button" class="accion-fila" title="Bajar la fila" :disabled="i === filas.length - 1" @click="moverFila(i, 1)">
                <UIcon name="i-tabler-arrow-down" class="w-3.5 h-3.5" />
                <span class="sr-only">Bajar la fila {{ i + 1 }}</span>
              </button>
              <button type="button" class="accion-fila" title="Agregar una celda" :disabled="fila.length >= MAX_CELDAS" @click="fila.push([])">
                <UIcon name="i-tabler-column-insert-right" class="w-3.5 h-3.5" />
                <span class="sr-only">Agregar una celda a la fila {{ i + 1 }}</span>
              </button>
              <button
                type="button"
                class="accion-fila"
                :title="tieneObligatorio(fila) ? 'Mové la meta y el plan a otra fila para quitar esta' : 'Quitar la fila'"
                :disabled="tieneObligatorio(fila)"
                @click="filas.splice(i, 1)"
              >
                <UIcon name="i-tabler-trash" class="w-3.5 h-3.5" />
                <span class="sr-only">Quitar la fila {{ i + 1 }}</span>
              </button>
            </div>
          </div>

          <div class="grid gap-1.5" :style="{ gridTemplateColumns: `repeat(${fila.length}, minmax(0, 1fr))` }">
            <div v-for="(celda, j) in fila" :key="j" class="relative">
              <span v-if="!celda.length" class="vacia">Soltá un campo acá</span>
              <button
                v-if="!celda.length"
                type="button"
                class="quitar-celda"
                title="Quitar la celda"
                @click="quitarCelda(i, j)"
              >
                <UIcon name="i-tabler-x" class="w-3 h-3" />
                <span class="sr-only">Quitar la celda</span>
              </button>
              <draggable :list="celda" :item-key="clave" group="campos" class="celda" v-bind="arrastre">
                <template #item="{ element }">
                  <EstiloEditorCampoChip
                    v-model="nombres[element]"
                    :data-campo="element"
                    :por-defecto="porDefecto(element)"
                    :obligatorio="obligatorio(element)"
                    @ocultar="ocultar(element)"
                  />
                </template>
              </draggable>
            </div>
          </div>
        </div>

        <button
          type="button"
          class="boton-mona w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl font-bold text-sm"
          :disabled="filas.length >= MAX_FILAS"
          @click="filas.push([[]])"
        >
          <UIcon name="i-tabler-row-insert-bottom" class="w-4 h-4" />
          Agregar una fila
        </button>
        <p class="text-xs text-mona-800/70">Las celdas y las filas vacías no salen en la planificación.</p>
      </div>

      <draggable v-else :list="orden" :item-key="clave" group="campos" class="lista" :class="disposicion" v-bind="arrastre">
        <template #item="{ element }">
          <EstiloEditorCampoChip
            v-model="nombres[element]"
            :data-campo="element"
            :por-defecto="porDefecto(element)"
            :obligatorio="obligatorio(element)"
            @ocultar="ocultar(element)"
          />
        </template>
      </draggable>
    </section>

    <section>
      <h4 class="titulo">Campos que no usás</h4>
      <div class="relative">
        <span v-if="!ocultos.length" class="vacia">Arrastrá acá los que no quieras que salgan</span>
        <draggable :list="ocultos" :item-key="clave" :group="grupoOcultos" class="bandeja" v-bind="arrastre">
          <template #item="{ element }">
            <EstiloEditorCampoChip
              v-model="nombres[element]"
              :data-campo="element"
              :por-defecto="porDefecto(element)"
              :obligatorio="false"
              oculto
              @mostrar="mostrar(element)"
            />
          </template>
        </draggable>
      </div>
      <p class="text-xs text-mona-800/70 mt-1.5">La meta y el plan van siempre.</p>
    </section>
  </div>
</template>

<style scoped>
.titulo {
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--color-mona-900);
  margin-bottom: 0.5rem;
}

.disposicion {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  padding: 0.6rem 0.4rem;
  border: 2px solid var(--color-mona-100);
  border-radius: 0.9rem;
  color: var(--color-mona-900);
  background: #fff;
  text-align: center;
}

.disposicion:hover {
  border-color: var(--color-mona-300);
}

.disposicion.elegida {
  border-color: var(--color-mona-500);
  background: var(--color-mona-50);
}

/* Dibujito de cada disposición. */
.miniatura {
  width: 3.4rem;
  height: 2.6rem;
  display: grid;
  gap: 2px;
  padding: 3px;
  border-radius: 0.35rem;
  background: #fff;
  border: 1.5px solid var(--color-mona-300);
}

.miniatura i {
  display: block;
  border-radius: 2px;
  background: var(--color-mona-200);
}

.miniatura.cuadricula {
  grid-template-columns: 1fr 1fr;
}

.miniatura.cuadricula .ancha {
  grid-column: span 2;
  background: var(--color-mona-300);
}

.miniatura.tabla_etiquetas {
  grid-template-columns: 1fr 2fr;
}

.miniatura.tabla_etiquetas i:not(.ancha) {
  background: var(--color-mona-400);
}

.miniatura.secuencial {
  border-color: transparent;
  grid-template-rows: repeat(5, 1fr);
}

.miniatura.secuencial i {
  height: 3px;
  align-self: center;
}

.miniatura.secuencial .corta {
  width: 65%;
}

.fila {
  border: 2px solid var(--color-mona-100);
  border-radius: 0.9rem;
  padding: 0.5rem;
  background: #fbfcff;
}

.accion-fila {
  width: 1.6rem;
  height: 1.6rem;
  border-radius: 0.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-mona-700);
}

.accion-fila:not(:disabled):hover {
  background: var(--color-mona-50);
}

.accion-fila:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.celda,
.bandeja,
.lista {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-height: 2.9rem;
  padding: 0.3rem;
  border-radius: 0.7rem;
}

.celda {
  height: 100%;
  border: 2px dashed var(--color-mona-200);
  background: #fff;
}

.bandeja {
  flex-direction: row;
  flex-wrap: wrap;
  border: 2px dashed var(--color-mona-200);
  background: var(--color-mona-50);
}

.bandeja > * {
  flex: 0 1 auto;
  max-width: 100%;
}

/* En dos columnas, la lista se ve como la columna de nombres. */
.lista.tabla_etiquetas {
  border-left: 4px solid var(--color-mona-300);
  border-radius: 0.2rem 0.7rem 0.7rem 0.2rem;
}

.vacia {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 1.5rem;
  text-align: center;
  font-size: 0.72rem;
  color: var(--color-mona-800);
  opacity: 0.6;
  pointer-events: none;
  z-index: 1;
}

.quitar-celda {
  position: absolute;
  top: 0.3rem;
  right: 0.3rem;
  z-index: 2;
  width: 1.3rem;
  height: 1.3rem;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-mona-700);
  background: var(--color-mona-50);
}

.fantasma {
  opacity: 0.45;
  border-style: dashed;
}
</style>
