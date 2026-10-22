<script setup lang="ts">
import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum'
import { apiReportesRoutes } from '~/utils/apiRoutes'

// Formulario para reportar un problema o pedir una funcionalidad. Lo lee el superadmin.
const abierto = defineModel<boolean>('open', { default: false })

const { $apiRest } = useNuxtApp()
const toast = useToast()
const route = useRoute()

const tipos = [
  { id: 'problema', titulo: 'Algo no funciona', icono: 'i-tabler-bug' },
  { id: 'funcionalidad', titulo: 'Tengo una idea', icono: 'i-tabler-bulb' },
] as const

const tipo = ref<'problema' | 'funcionalidad'>('problema')
const mensaje = ref('')
const enviando = ref(false)

watch(abierto, (valor) => {
  if (valor) {
    tipo.value = 'problema'
    mensaje.value = ''
  }
})

const enviar = async () => {
  if (enviando.value || mensaje.value.trim().length < 5) return

  enviando.value = true

  try {
    await $apiRest(apiReportesRoutes.crear, HttpMethodEnum.POST, { tipo: tipo.value, mensaje: mensaje.value.trim(), pagina: route.fullPath })
    abierto.value = false
    toast.success({ title: '¡Gracias!', message: tipo.value === 'problema' ? 'Recibimos tu reporte y lo vamos a revisar.' : 'Recibimos tu idea.' })
  } catch (error: any) {
    const detalle = error?.errors?.mensaje?.[0]
    toast.error({ title: 'No se pudo enviar', message: detalle ?? (typeof error === 'string' ? error : 'Probá de nuevo.') })
  } finally {
    enviando.value = false
  }
}
</script>

<template>
  <UModal v-model:open="abierto" title="Reportar un problema o sugerir" description="Lo lee el equipo de Flopi.">
    <template #body>
      <div class="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Tipo de mensaje">
        <button
          v-for="t in tipos"
          :key="t.id"
          type="button"
          role="radio"
          :aria-checked="tipo === t.id"
          class="flex items-center gap-2 px-3 py-3 rounded-xl border-2 text-left font-bold text-mona-900 transition-colors"
          :class="tipo === t.id ? 'border-miel-500 bg-miel-50' : 'border-mona-100 hover:border-mona-300'"
          @click="tipo = t.id"
        >
          <UIcon :name="t.icono" class="w-5 h-5" />
          {{ t.titulo }}
        </button>
      </div>

      <label class="block mt-4">
        <span class="block text-sm font-bold text-mona-900 mb-1">
          {{ tipo === 'problema' ? '¿Qué pasó? Contanos qué estabas haciendo.' : '¿Qué te gustaría que haga Flopi?' }}
        </span>
        <UTextarea v-model="mensaje" :rows="5" autoresize class="w-full" maxlength="3000" />
      </label>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <button type="button" class="boton-mona px-4 py-2.5 rounded-xl font-bold" @click="abierto = false">Cancelar</button>
        <button
          type="button"
          class="boton-miel px-5 py-2.5 rounded-xl font-display text-lg font-semibold"
          :disabled="enviando || mensaje.trim().length < 5"
          @click="enviar"
        >
          {{ enviando ? 'Enviando…' : 'Enviar' }}
        </button>
      </div>
    </template>
  </UModal>
</template>
