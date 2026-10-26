<script setup lang="ts">
import type { PasoPlan, Propuesta, PropuestaCurricular } from '~/types/asistente'

// Formulario para editar la redacción de una propuesta. Los datos del programa no se tocan.
const props = defineProps<{
  propuesta: Propuesta
  planificacionId: number
  guardando?: boolean
  errores?: string[]
}>()

const emit = defineEmits<{
  (e: 'guardar', propuesta: Propuesta): void
  (e: 'cancelar'): void
}>()

// Copia de trabajo.
const borrador = ref<any>(JSON.parse(JSON.stringify(props.propuesta)))

// La meta y el plan se editan con formato. Si el tramo todavía no tiene versión con formato,
// se arma desde el texto que redactó Flopi.
const escapar = (texto: string) => texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const curricular = props.propuesta as PropuestaCurricular

// Los subtítulos del plan (en multigrado, uno por grado) van como títulos del editor.
const planComoHtml = (plan: PasoPlan[]) => {
  let html = ''
  let enLista = false

  for (const paso of plan) {
    if (paso.titulo) {
      if (enLista) html += '</ul>'
      enLista = false
      html += `<h3>${escapar(paso.texto)}</h3>`
      continue
    }

    if (!enLista) html += '<ul>'
    enLista = true
    html += `<li>${escapar(paso.texto)}</li>` + paso.subpasos.map(sub => `<li class="ql-indent-1">${escapar(sub)}</li>`).join('')
  }

  return enLista ? html + '</ul>' : html
}

const metaHtml = ref(curricular.meta_html ?? (curricular.meta_aprendizaje ? `<p>${escapar(curricular.meta_aprendizaje)}</p>` : ''))
const planHtml = ref(curricular.plan_html ?? (curricular.plan?.length ? planComoHtml(curricular.plan) : ''))

const esCurricular = computed(() => props.propuesta.tipo === 'curricular')

const guardar = () => {
  if (!esCurricular.value) {
    emit('guardar', { tipo: 'libre', actividad: borrador.value.actividad.trim() })
    return
  }

  // El backend limpia el HTML y saca de ahí el texto de la meta y los pasos del plan.
  emit('guardar', {
    ...borrador.value,
    meta_html: metaHtml.value,
    plan_html: planHtml.value,
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
      <div class="campo">
        <span>Meta de aprendizaje</span>
        <AsistenteEditorTexto v-model="metaHtml" :planificacion-id="planificacionId" :alto="90" placeholder="Los estudiantes…" />
        <small>Empieza con "Los estudiantes" y lleva el verbo en futuro.</small>
      </div>

      <div class="campo">
        <span>Plan de aprendizaje y desarrollo de la intervención docente</span>
        <AsistenteEditorTexto v-model="planHtml" :planificacion-id="planificacionId" :alto="220" placeholder="Los pasos de la clase…" />
        <small>Podés usar listas, negrita, títulos e imágenes, como en Word.</small>
      </div>

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
