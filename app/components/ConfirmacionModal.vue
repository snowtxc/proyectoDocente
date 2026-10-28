<script setup lang="ts">
import { DialogDescription, DialogTitle } from 'reka-ui'

// Confirmación con el estilo de Flopi, en lugar del aviso del navegador. Se abre con useConfirmacion().
withDefaults(defineProps<{
  titulo: string
  mensaje?: string
  aceptar?: string
  cancelar?: string
  // Para lo que borra o descarta algo: el botón va en rojo.
  peligro?: boolean
}>(), { mensaje: '', aceptar: 'Aceptar', cancelar: 'Cancelar', peligro: false })

const emit = defineEmits<{ close: [aceptado: boolean] }>()
</script>

<template>
  <UModal
    :close="false"
    :ui="{ overlay: 'z-[200] bg-mona-950/45 backdrop-blur-[2px]', content: 'z-[201] max-w-md rounded-2xl ring-0 shadow-[0_18px_50px_rgb(23_28_76/0.25)]' }"
  >
    <template #content>
      <div class="p-6">
        <div class="flex items-start gap-4">
          <span
            class="w-11 h-11 flex-shrink-0 rounded-2xl flex items-center justify-center"
            :class="peligro ? 'bg-red-50 text-red-600' : 'bg-miel-100 text-miel-800'"
            aria-hidden="true"
          >
            <UIcon :name="peligro ? 'i-tabler-alert-triangle' : 'i-tabler-help-circle'" class="w-6 h-6" />
          </span>
          <div class="min-w-0">
            <!-- Título y descripción del diálogo: los anuncian los lectores de pantalla. -->
            <DialogTitle as="h2" class="font-display text-xl font-bold text-mona-900 leading-tight">{{ titulo }}</DialogTitle>
            <DialogDescription as="p" :class="mensaje ? 'text-[0.95rem] text-mona-800/80 mt-1.5 leading-relaxed' : 'sr-only'">
              {{ mensaje || titulo }}
            </DialogDescription>
          </div>
        </div>

        <div class="flex flex-wrap justify-end gap-2 mt-6">
          <button type="button" class="px-4 py-2 rounded-xl font-bold text-mona-800 hover:bg-mona-50" @click="emit('close', false)">
            {{ cancelar }}
          </button>
          <button
            type="button"
            class="inline-flex items-center px-4 py-2 rounded-xl font-display font-semibold"
            :class="peligro ? 'boton-peligro' : 'boton-miel'"
            autofocus
            @click="emit('close', true)"
          >
            {{ aceptar }}
          </button>
        </div>
      </div>
    </template>
  </UModal>
</template>

<style scoped>
.boton-peligro {
  background-color: #dc2626;
  color: #fff;
  box-shadow: 0 4px 0 0 #991b1b;
  transition: transform 0.1s ease, box-shadow 0.1s ease, background-color 0.15s ease;
}

.boton-peligro:hover {
  background-color: #ef4444;
}

.boton-peligro:active {
  transform: translateY(3px);
  box-shadow: 0 1px 0 0 #991b1b;
}
</style>
