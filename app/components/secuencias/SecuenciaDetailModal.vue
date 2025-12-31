<script setup lang="ts">
  import type { Secuencia } from '~/types/secuencia';

  interface Props {
      secuencia: Secuencia,
  }

  const modal = useModal();
  const emit = defineEmits(['on:close']);

  const props = defineProps<Props>();

  const isOpen = ref(false)
  
  const router = useRouter()
  
  const goToFullSequence = () => {
    isOpen.value = false;
    emit('on:close')
    modal.close();
    router.push(`/secuencias/${props.secuencia.slug}`)
  }
</script>

<template>
  <div>
    <UButton icon="tabler:eye" color="gray" variant="ghost" @click="isOpen = true" />           

    <UModal v-model="isOpen" prevent-close class="w-full">
      <UCard :ui="{ ring: '', divide: 'w-full divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
               Secuencia : {{ props.secuencia.nombre }}
            </h3>
            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="isOpen = false" />
          </div>
        </template>

        <div class="flex gap-2 items-center max-h-[60vh] overflow-y-auto">
           <USelectMenu 
           :disabled="true" 
           :model-value="secuencia.espacio" option-attribute="id" 
           class="flex-1 w-full">
            <template #label>
              <span v-if="secuencia.espacio" :style="{ backgroundColor: secuencia.espacio?.rgbColor }"
                :class="['inline-block h-2 w-2 flex-shrink-0 rounded-full']" aria-hidden="true" />

              <span class="truncate" v-if="secuencia.espacio">{{ secuencia.espacio?.nombre }}</span>
              <span v-else>Sin espacio.</span>
            </template>
            <template #option="{ option: espacio }">
              <span :style="{ backgroundColor: espacio.rgbColor }"
                :class="['inline-block h-2 w-2 flex-shrink-0 rounded-full']" aria-hidden="true" />
              <span class="truncate">{{ espacio.nombre }}</span>
          </template>
          </USelectMenu>
           <USelectMenu 
           :model-value="secuencia.unidad_curricular" option-attribute="id" 
           :disabled="true"
           class="flex-1 w-full">
              <template #label>
                <span v-if="secuencia.unidad_curricular" :style="{ backgroundColor: secuencia.espacio?.rgbColor }"
                    :class="['inline-block h-2 w-2 flex-shrink-0 rounded-full']" aria-hidden="true" />

                <span class="truncate" v-if="secuencia.unidad_curricular">{{ secuencia.unidad_curricular?.nombre }}</span>
                <span v-else> Sin unidad curricular.</span>
              </template>

              <template #option="{ option:  unidadCurricular }">
                <span :style="{ backgroundColor: secuencia.espacio?.rgbColor }"
                :class="['inline-block h-2 w-2 flex-shrink-0 rounded-full']" aria-hidden="true" />
                <span class="truncate">{{ unidadCurricular?.nombre }}</span>
              </template>
          </USelectMenu>
        </div>

        <UDivider class="my-2"></UDivider>

        <div class="mt-2 max-h-[70vh] overflow-y-auto">
          <div class="flex flex-col"> 
            <strong>Contenido: </strong>
            <p v-if="secuencia.contenido">{{ secuencia.contenido?.descripcion }}</p>
            <p v-else>Sin asignar</p>
          </div>

          <UDivider class="my-2"></UDivider>

          <div class="flex flex-col"> 
            <strong>Competencias generales: </strong>
            <ul v-if="secuencia.competencias_especificas.length > 0" class="list-disc px-2">
              <li v-for="competenciaGeneral in secuencia.competencias_generales" :key="competenciaGeneral.id" class="my-2 flex flex-row items-center gap-2">
                 <span>{{ competenciaGeneral.nombre }}</span>
                <UAvatar :src="competenciaGeneral.url_image" size="sm" class="text-center mt-2"/>
              </li>
            </ul>
            <p v-else> Sin asignar</p>
          </div>

          <UDivider class="my-2"></UDivider>

          <div class="flex flex-col"> 
            <strong>Competencias especificas: </strong>
            <ul v-if="secuencia.competencias_especificas.length > 0" class="list-disc px-2">
              <li v-for="competenciaEspecifica in secuencia.competencias_especificas" :key="competenciaEspecifica.id" class="my-2">
                 <strong>{{ competenciaEspecifica.codificacion }}:</strong> {{ competenciaEspecifica.descripcion }}
              </li>
            </ul>
            <p v-else> Sin asignar</p>
          </div>

          <UDivider class="my-2"></UDivider>

          <div class="flex flex-col"> 
            <strong>Criterios de logros: </strong>
            <ul v-if="secuencia.criterios_de_logros?.length > 0" class="list-disc px-2">
              <li v-for="criterioDeLogro in secuencia.criterios_de_logros" :key="criterioDeLogro.id" class="my-2">
                {{ criterioDeLogro.descripcion }}
              </li>
            </ul>
            <p v-else> Sin asignar</p>
          </div>
          
          <UDivider class="my-2"></UDivider>

      
          <div class="flex flex-col"> 
            <strong>Meta general :</strong>
            <p v-if="secuencia.metaGeneral">{{ secuencia.metaGeneral }}</p>
            <p v-else>Sin asignar</p>
          </div>
        </div>

        <!-- Botón para ir a la secuencia completa -->
        <div class="mt-6 flex justify-center">
          <UButton 
            color="primary" 
            variant="solid" 
            icon="i-heroicons-arrow-right-20-solid"
            @click="goToFullSequence"
          >
            Ir a la secuencia completa
          </UButton>
        </div>

      </UCard>
    </UModal>
  </div>
</template>
