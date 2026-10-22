<script setup lang="ts">
import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum'
import { apiUsoIaRoutes } from '~/utils/apiRoutes'
import type { UsoIaDetalle } from '~/types/usoIa'

useSeoMeta({ title: 'Uso de la IA · Flopi Docentes' })

const { $apiRest } = useNuxtApp()
const toast = useToast()

const porPagina = 15
const pagina = ref(1)
const datos = ref<UsoIaDetalle | null>(null)
const cargando = ref(false)

const cargar = async () => {
  cargando.value = true

  try {
    datos.value = await $apiRest<UsoIaDetalle>(apiUsoIaRoutes.mio(pagina.value, porPagina), HttpMethodEnum.GET)
  } catch (error: any) {
    toast.error({ title: 'No pudimos cargar tu uso de la IA', message: typeof error === 'string' ? error : (error?.message ?? 'Probá de nuevo.') })
  } finally {
    cargando.value = false
  }
}

watch(pagina, cargar)
onMounted(cargar)
</script>

<template>
  <div>
    <UPageCard
      title="Uso de la IA"
      description="Cuánto usaste la IA de Flopi y lo que costó cada pedido. Los montos son en dólares."
      variant="naked"
      class="mb-4"
    />

    <SettingsUsoIaDetalle v-model:pagina="pagina" :datos="datos" :cargando="cargando" :por-pagina="porPagina" />
  </div>
</template>
