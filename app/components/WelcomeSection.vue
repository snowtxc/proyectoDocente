 <script setup lang="ts">
import { computed } from 'vue'
import type { Planificacion } from '~/types/planificacion';


interface Props {
  userName: string
  ultimaPlanificacion?: Planificacion;
}

const props = defineProps<Props>()


const saludo = computed(() => {
  const hora = new Date().getHours()
  if (hora < 12) return 'Buen día'
  if (hora < 18) return 'Buenas tardes'
  return 'Buenas noches'
})
</script>


<template>
<UCard class="w-full">
<div class="flex flex-col gap-2">
<h2 class="text-2xl font-semibold">
{{ saludo }}, {{ userName }} 👋
</h2>


<div v-if="props.ultimaPlanificacion" >
  <p class="text-gray-600">
  Estábas planificando para
  <strong>{{ props.ultimaPlanificacion.grupo.nombre }} </strong>
  · Año lectivo {{ props.ultimaPlanificacion.grupo.year  }}
  </p>

  <p class="text-sm text-gray-500 mt-1">
  Última planificación actualizada: {{ props.ultimaPlanificacion.created_at }}
  </p>
</div>
</div>
</UCard>
</template>