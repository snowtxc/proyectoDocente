<script setup lang="ts">
import { useAsistenteService } from '~/services/asistenteService/asistenteService'
import type { DescripcionFundada, FormatoDescarga } from '~/types/asistente'

const props = defineProps<{
  descripcion: DescripcionFundada
  // Mientras el asistente está trabajando no se puede editar.
  ocupado?: boolean
}>()

const emit = defineEmits<{
  (e: 'actualizada', descripcion: DescripcionFundada): void
}>()

const { guardarDescripcion, descargarDescripcion } = useAsistenteService()
const toast = useToast()

const formatos = [
  { id: 'pdf', nombre: 'PDF', icono: 'i-tabler-file-type-pdf', color: 'text-red-600' },
  { id: 'docx', nombre: 'Word', icono: 'i-tabler-file-type-docx', color: 'text-mona-600' },
] as const

const editando = ref(false)
const guardando = ref(false)
const descargando = ref<FormatoDescarga | null>(null)
const borrador = ref('')
const errores = ref<string[]>([])
const copiado = ref(false)

const confirmada = computed(() => props.descripcion.estado === 'confirmada')

// Cada párrafo partido por el marcador del nombre, para poder resaltarlo.
const parrafos = computed(() =>
  props.descripcion.texto.split(/\n\s*\n/).map(parrafo => parrafo.split(props.descripcion.marcador_nombre))
)

const palabras = computed(() => props.descripcion.texto.trim().split(/\s+/).length)

// Si el asistente redacta de nuevo mientras se edita, se cierra el formulario.
watch(() => props.descripcion.texto, () => {
  if (!guardando.value) editando.value = false
})

const empezarEdicion = () => {
  borrador.value = props.descripcion.texto
  errores.value = []
  editando.value = true
}

const guardar = async () => {
  guardando.value = true
  errores.value = []

  try {
    const actualizada = await guardarDescripcion(props.descripcion.id, borrador.value)
    editando.value = false
    emit('actualizada', actualizada)
    toast.success({ title: 'Cambios guardados' })
  } catch (e: any) {
    errores.value = Array.isArray(e?.texto)
      ? e.texto.map((error: string) => error.includes('marcador')
        ? `Dejá el marcador ${props.descripcion.marcador_nombre} en lugar del nombre: lo reemplazás cuando copies o descargues el texto.`
        : 'El texto es muy corto o muy largo.')
      : ['No se pudieron guardar los cambios. Probá de nuevo.']
  } finally {
    guardando.value = false
  }
}

const copiar = async () => {
  try {
    await navigator.clipboard.writeText(props.descripcion.texto)
    copiado.value = true
    setTimeout(() => { copiado.value = false }, 2000)
  } catch {
    toast.error({ title: 'No se pudo copiar', message: 'Seleccioná el texto y copialo a mano.' })
  }
}

const bajar = async (formato: FormatoDescarga) => {
  descargando.value = formato
  try {
    await descargarDescripcion(props.descripcion, formato)
  } catch (e: any) {
    toast.error({ title: 'No se pudo descargar', message: e?.message ?? '' })
  } finally {
    descargando.value = null
  }
}
</script>

<template>
  <div class="flex flex-col h-full bg-mona-50/60">
    <!-- Encabezado -->
    <div class="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-white/80 backdrop-blur border-b-2 border-miel-200">
      <div class="flex items-center gap-2.5 min-w-0">
        <span class="w-10 h-10 flex-shrink-0 rounded-xl bg-mona-100 text-mona-700 flex items-center justify-center">
          <UIcon name="i-tabler-user-heart" class="w-5 h-5" />
        </span>
        <div class="min-w-0">
          <h2 class="font-display text-xl font-bold text-mona-900 leading-tight truncate">Descripción fundada</h2>
          <p class="text-xs font-bold truncate" :class="confirmada ? 'text-emerald-700' : 'text-miel-700'">
            {{ descripcion.grupo.grados.join(', ') }} ·
            {{ confirmada ? 'Lista para usar' : 'Borrador, todavía la podés cambiar' }}
          </p>
        </div>
      </div>

      <button
        v-if="!editando"
        type="button"
        class="boton-mona inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold flex-shrink-0"
        :disabled="ocupado"
        @click="empezarEdicion"
      >
        <UIcon name="i-tabler-pencil" class="w-4 h-4" />
        Editar
      </button>
    </div>

    <!-- Copiar y descargar -->
    <div v-if="!editando" class="flex items-center gap-2.5 flex-wrap px-4 sm:px-6 py-3 bg-miel-100 border-b-2 border-miel-200">
      <button type="button" class="boton-miel inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-display font-semibold" @click="copiar">
        <UIcon :name="copiado ? 'i-tabler-check' : 'i-tabler-copy'" class="w-5 h-5" />
        {{ copiado ? 'Copiada' : 'Copiar texto' }}
      </button>
      <button
        v-for="formato in formatos"
        :key="formato.id"
        type="button"
        class="boton-mona inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold"
        :disabled="descargando !== null"
        @click="bajar(formato.id)"
      >
        <UIcon
          :name="descargando === formato.id ? 'i-tabler-loader-2' : formato.icono"
          class="w-5 h-5"
          :class="[formato.color, { 'animate-spin': descargando === formato.id }]"
        />
        {{ formato.nombre }}
      </button>
    </div>

    <div class="flex-1 overflow-y-auto px-3 sm:px-6 py-5">
      <div class="max-w-2xl mx-auto space-y-4">
        <!-- Aviso de privacidad -->
        <p class="flex items-start gap-2.5 text-sm text-mona-900 bg-white border-2 border-mona-100 rounded-2xl px-4 py-3">
          <UIcon name="i-tabler-shield-lock" class="w-5 h-5 text-mona-600 flex-shrink-0 mt-0.5" />
          <span>
            Flopi no conoce el nombre del estudiante. Donde dice
            <strong class="marcador">{{ descripcion.marcador_nombre }}</strong>
            poné el nombre cuando copies o descargues el texto.
          </span>
        </p>

        <!-- Lectura -->
        <article v-if="!editando" class="hoja-cuaderno aparecer rounded-2xl border-2 border-mona-100 shadow-[0_6px_0_0_var(--color-mona-100)] pl-14 pr-5 sm:pr-8 py-7">
          <p v-for="(partes, i) in parrafos" :key="i" class="text-[16px] leading-[1.8] text-mona-950 mb-4 last:mb-0">
            <template v-for="(parte, j) in partes" :key="j">
              <strong v-if="j > 0" class="marcador">{{ descripcion.marcador_nombre }}</strong>{{ parte }}
            </template>
          </p>
          <p class="text-xs text-mona-800/60 mt-5">{{ palabras }} palabras</p>
        </article>

        <!-- Edición -->
        <form v-else class="bg-white rounded-2xl border-2 border-mona-100 p-4 sm:p-5 space-y-3" @submit.prevent="guardar">
          <div v-if="errores.length > 0" class="rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <p v-for="(error, i) in [...new Set(errores)]" :key="i">{{ error }}</p>
          </div>

          <UTextarea
            v-model="borrador"
            :rows="12"
            autoresize
            class="w-full"
            :ui="{ base: 'text-[15px] leading-relaxed' }"
            maxlength="3000"
            aria-label="Texto de la descripción fundada"
          />

          <div class="flex justify-end gap-2">
            <UButton color="neutral" variant="ghost" :disabled="guardando" @click="editando = false">
              Cancelar
            </UButton>
            <button type="submit" class="boton-miel inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-display font-semibold" :disabled="guardando">
              <UIcon :name="guardando ? 'i-tabler-loader-2' : 'i-tabler-device-floppy'" class="w-5 h-5" :class="{ 'animate-spin': guardando }" />
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* El marcador del nombre, resaltado para que no se pase por alto. */
.marcador {
  font-weight: 800;
  color: var(--color-mona-800);
  background-color: var(--color-miel-200);
  border-radius: 0.4rem;
  padding: 0.05rem 0.35rem;
}
</style>
