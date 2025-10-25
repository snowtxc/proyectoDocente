<script setup lang="ts">

import { ModeEnum } from '~/utils/enums/ModeEnum';

import type { FormError, FormSubmitEvent } from '#ui/types'
import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum';

import { defineProps, defineEmits, withDefaults, ref, reactive } from 'vue';
import type { Grupo } from '~/types/grupo';
import type { CreateSecuenciaDTO, Secuencia } from '~/types/secuencia';
import type { UnidadCurricular } from '~/types/unidadCurricular';
import type { Espacio } from '~/types/espacio';

interface Props {
    mode: ModeEnum,
    secuenciaSelected?: Secuencia
    espacios: Espacio[]
}

const { $apiRest } = useNuxtApp();

const toast = useToast()
const loading = ref(false);

const props = withDefaults(defineProps<Props>(), {});
const emit = defineEmits(['on:update', 'close'])

onBeforeMount(()=>{
  if(props.mode == ModeEnum.UPDATE && props.secuenciaSelected){
    patchForm(props.secuenciaSelected);
  }
});


const isEditMode = computed(()=>{
    if(props.mode == ModeEnum.UPDATE)
        return true;
    return false;
})

const form = reactive<{ grupo: Grupo, espacio?: Espacio ,unidad_curricular?: UnidadCurricular ,name: string }>({
    grupo: null,
    espacio: null,
    unidad_curricular: null,
    name: '',
});

const unidadesCurriculares = computed<UnidadCurricular[]>(()=>{
    return form.espacio?.unidades_curriculares;
})

const patchForm = (secuenciaSelected: Secuencia) =>{

  const { nombre, grupo , espacio ,unidad_curricular} = secuenciaSelected;

  form.name = nombre;
  form.grupo =  grupo;
  form.espacio = espacio;
  form.unidad_curricular = unidad_curricular;
}

const validate = (state: any): FormError[] => {
    const errors = []
    if (!form.grupo) errors.push({ path: 'grupo', message: 'Por favor ingresa un grupo.' })
    if (form.name.trim().length == 0) errors.push({ path: 'name', message: 'Debes ingresar al menos un nombre a la planificación' })
    
    return errors
}

const onChangeEspacio = (espacio: Espacio) =>{
  form.espacio = espacio;

  // Unidad curricular pasa a estar deseleccionada.
  form.unidad_curricular = null;
}

const onChangeUnidadCurricular = (unidadCurricular: UnidadCurricular)=>{
  form.unidad_curricular = unidadCurricular;
}

async function onSubmit(event: FormSubmitEvent<any>) {

    const { grupo, name ,unidad_curricular, espacio } = form;

    const errors = validate(form); // Obtén los errores de validación
    if (errors.length > 0)
        return;


    const extraData = {
        nombre: name ,
        espacio_id: espacio?.id,
        espacio: espacio,
        unidad_curricular_id : unidad_curricular?.id,
        unidad_curricular : unidad_curricular,  
    }
    try {

        let secuenciaResponse: Secuencia;

        loading.value = true;

        if (props.mode == ModeEnum.UPDATE && props.secuenciaSelected) {
            
            const secuenciaToEdit : Secuencia  = {
                ...props.secuenciaSelected,
                ...extraData
            };
            secuenciaResponse = await $apiRest<Secuencia>(apiSecuenciasRoutes.update(props.secuenciaSelected.id), HttpMethodEnum.POST, secuenciaToEdit);
        } else {
            const body: CreateSecuenciaDTO = {
                groupId : grupo.id,
                name,
                ...extraData
            }   
            secuenciaResponse = await $apiRest<Secuencia>(apiSecuenciasRoutes.create, HttpMethodEnum.POST, body);
        }

        loading.value = false;
        toast.add({
            title: "Nueva Secuencia",
            description: props.mode == ModeEnum.CREATE ? `Se ha creado la secuencia ${secuenciaResponse.nombre} correctamente` : `Se ha modificado la secuencia ${secuenciaResponse.nombre} correctamente`,
            color: "green"
        })

        emit('on:update');
        emit('close');

    } catch (message) {
      
        loading.value = false;
        toast.add({
            title: "Error",
            description: message ? message : 'Error al crear la secuencia',
            color: "red"
        })
    }
}
</script>



<template>
    <UForm :validate="validate" :validate-on="['submit']" :state="form" class="space-y-4" @submit="onSubmit">

        <UFormGroup label="Nombre" name="name">
            <UInput id="name" v-model="form.name"
                placeholder="Ingresa un nombre" class="w-full" autofocus color="gray" />
        </UFormGroup>

        <UFormGroup label="Grupo" name="grupo">
            <SelectGrupo v-model="form.grupo" :disabled="isEditMode"></SelectGrupo>
        </UFormGroup>

        <div class="w-full flex items-center">

        </div>
        <USelectMenu  :model-value="form.espacio" :options="espacios" option-attribute="id" class="flex-1 mt-4" :disabled="isEditMode"
            @change="onChangeEspacio">
            <template #label>
            <span v-if="form.espacio" :style="{ backgroundColor: form.espacio?.rgbColor }"
                :class="['inline-block h-2 w-2 flex-shrink-0 rounded-full']" aria-hidden="true" />

            <span class="truncate" v-if="form.espacio">{{ form.espacio?.nombre }}</span>
            <span v-else>Selecciona un espacio.</span>
            </template>

            <template #option="{ option: espacio }">
            <span :style="{ backgroundColor: espacio.rgbColor }"
                :class="['inline-block h-2 w-2 flex-shrink-0 rounded-full']" aria-hidden="true" />
            <span class="truncate">{{ espacio.nombre }}</span>
            </template>
            
        </USelectMenu>

        <USelectMenu :model-value="form.unidad_curricular" :options="unidadesCurriculares" option-attribute="id" class="flex-1 mt-4" :disabled="isEditMode"
        @change="onChangeUnidadCurricular">
            <template #label>
            <span v-if="form.unidad_curricular" :style="{ backgroundColor: form.espacio?.rgbColor }"
                :class="['inline-block h-2 w-2 flex-shrink-0 rounded-full']" aria-hidden="true" />

            <span class="truncate" v-if="form.unidad_curricular">{{ form.unidad_curricular?.nombre }}</span>
            <span v-else> Selecciona una unidad curricular.</span>
            </template>

            <template #option="{ option:  unidadCurricular }">
            <span :style="{ backgroundColor: form.espacio?.rgbColor }"
                :class="['inline-block h-2 w-2 flex-shrink-0 rounded-full']" aria-hidden="true" />
            <span class="truncate">{{ unidadCurricular?.nombre }}</span>
            </template>
        </USelectMenu>
            
        <div class="flex w-full justify-end gap-3">
            <UButton label="Cancelar" color="gray" variant="ghost" @click="emit('close')" />
            <UButton type="submit" @click="onSubmit" label="Guardar" color="black" :loading="loading" />
        </div>
    </UForm>
</template>
