<script setup lang="ts">
import type { Propuesta, PropuestaCurricular } from '~/types/asistente'

// Formulario para editar la redacción de una propuesta. Los datos del programa no se tocan.
const props = defineProps<{
  propuesta: Propuesta
  guardando?: boolean
  errores?: string[]
}>()

const emit = defineEmits<{
  (e: 'guardar', propuesta: Propuesta): void
  (e: 'cancelar'): void
}>()

// Copia de trabajo. Las listas se editan como texto, un elemento por renglón.
const borrador = ref<any>(JSON.parse(JSON.stringify(props.propuesta)))
const subpasos = ref<string[]>(((props.propuesta as PropuestaCurricular).plan ?? []).map(paso => paso.subpasos.join('\n')))

const esCurricular = computed(() => props.propuesta.tipo === 'curricular')

const renglones = (texto: string) => texto.split('\n').map(r => r.trim()).filter(r => r !== '')

const agregarPaso = () => {
  borrador.value.plan.push({ texto: '', subpasos: [] })
  subpasos.value.push('')
}

const quitarPaso = (indice: number) => {
  borrador.value.plan.splice(indice, 1)
  subpasos.value.splice(indice, 1)
}

const guardar = () => {
  if (!esCurricular.value) {
    emit('guardar', { tipo: 'libre', actividad: borrador.value.actividad.trim() })
    return
  }

  emit('guardar', {
    ...borrador.value,
    // Se descartan los pasos que quedaron vacíos.
    plan: borrador.value.plan
      .map((paso: { texto: string }, i: number) => ({ texto: paso.texto.trim(), subpasos: renglones(subpasos.value[i] ?? '') }))
      .filter((paso: { texto: string }) => paso.texto !== ''),
  })
}
</script>

<template>
  <form class="space-y-4 p-4 sm:p-5" @submit.prevent="guardar">
    <div
      v-if="errores && errores.length > 0"
      class="rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      <p class="font-bold mb-1">No se pudo guardar:</p>
      <ul class="list-disc pl-5 space-y-0.5">
        <li v-for="(error, i) in [...new Set(errores)]" :key="i">{{ error }}</li>
      </ul>
    </div>

    <!-- Tramo sin datos del programa: solo su nombre. -->
    <label v-if="!esCurricular" class="campo">
      <span>Actividad</span>
      <UInput v-model="borrador.actividad" class="w-full" maxlength="300" />
    </label>

    <template v-if="esCurricular">
      <label class="campo">
        <span>Meta de aprendizaje</span>
        <UTextarea v-model="borrador.meta_aprendizaje" :rows="3" autoresize class="w-full" maxlength="700" />
        <small>Empieza con "Los estudiantes" y lleva el verbo en futuro.</small>
      </label>

      <fieldset class="space-y-2.5">
        <legend class="etiqueta">Plan de aprendizaje y desarrollo de la intervención docente</legend>

        <div v-for="(paso, i) in borrador.plan" :key="i" class="flex items-start gap-2 p-2.5 rounded-xl bg-mona-50/70 border border-mona-100">
          <span class="mt-2 w-6 text-center text-sm font-extrabold text-mona-700">{{ i + 1 }}</span>
          <div class="flex-1 space-y-1.5">
            <UTextarea v-model="paso.texto" :rows="1" autoresize class="w-full" maxlength="700" :aria-label="`Paso ${i + 1}`" />
            <UTextarea
              v-model="subpasos[i]"
              :rows="1"
              autoresize
              class="w-full"
              size="sm"
              placeholder="Preguntas o ítems de este paso, uno por renglón (opcional)"
              :aria-label="`Preguntas o ítems del paso ${i + 1}`"
            />
          </div>
          <UButton
            icon="i-tabler-trash"
            color="neutral"
            variant="ghost"
            size="sm"
            :aria-label="`Quitar paso ${i + 1}`"
            :disabled="borrador.plan.length <= 1"
            @click="quitarPaso(i)"
          />
        </div>

        <UButton icon="i-tabler-plus" color="neutral" variant="ghost" size="xs" @click="agregarPaso">
          Agregar paso
        </UButton>
      </fieldset>

      <p class="text-xs text-mona-800/70">
        <UIcon name="i-tabler-lock" class="w-3.5 h-3.5 inline -mt-0.5" />
        El contenido, el criterio de logro y las competencias vienen del programa y no se editan.
        Para usar otros, agregá un tramo nuevo desde el chat.
      </p>
    </template>

    <div class="flex justify-end gap-2 pt-1">
      <UButton color="neutral" variant="ghost" :disabled="guardando" @click="emit('cancelar')">
        Cancelar
      </UButton>
      <button type="submit" class="boton-miel inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-display font-semibold" :disabled="guardando">
        <UIcon :name="guardando ? 'i-tabler-loader-2' : 'i-tabler-device-floppy'" class="w-5 h-5" :class="{ 'animate-spin': guardando }" />
        Guardar cambios
      </button>
    </div>
  </form>
</template>

<style scoped>
.campo {
  display: block;
}

.campo > span,
.etiqueta {
  display: block;
  font-size: 0.8rem;
  font-weight: 800;
  color: var(--color-mona-900);
  margin-bottom: 0.25rem;
}

.campo > small {
  display: block;
  font-size: 0.72rem;
  color: var(--color-mona-800);
  opacity: 0.7;
  margin-top: 0.2rem;
}
</style>
