<script setup lang="ts">

import type { CreatePlanificacionDTO, Planificacion } from '~/types/planificacion';

import { apiPlanificacionesRoutes } from '~/utils/apiRoutes';

import { ModeEnum } from '~/utils/enums/ModeEnum';

import type { FormError, FormSubmitEvent } from '#ui/types'
import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum';

import { defineProps, defineEmits, withDefaults, ref, reactive } from 'vue';
import type { Grupo } from '~/types/grupo';
import type { Secuencia } from '~/types/secuencia';

interface Props {
    mode: ModeEnum,
    secuenciaSelected?: Secuencia
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

const getDefaultRangeDate = () : { start: Date, end: Date } =>{
    const start = new Date();
    const end = new Date()
    end.setDate(end.getDate() + 7);

    return { start, end}
}

const isEditMode = computed(()=>{
    if(props.mode == ModeEnum.UPDATE)
        return true;
    return false;
})

const form = reactive<{ grupo: Grupo, name: string }>({
    grupo: null,
    name: '',
});

const patchForm = (secuenciaSelected: Secuencia) =>{

  const { nombre, grupo } = secuenciaSelected;

  form.name = nombre;
  form.grupo =  grupo;
}

const validate = (state: any): FormError[] => {
    const errors = []
    if (!form.grupo) errors.push({ path: 'grupo', message: 'Por favor ingresa un grupo.' })
    if (form.name.trim().length == 0) errors.push({ path: 'name', message: 'Debes ingresar al menos un nombre a la planificación' })
    
    return errors
}

async function onSubmit(event: FormSubmitEvent<any>) {

    const { grupo, name } = form;

    const errors = validate(form); // Obtén los errores de validación
    if (errors.length > 0)
        return;

    try {

        let secuenciaResponse: Secuencia;

        loading.value = true;

        if (props.mode == ModeEnum.UPDATE && props.secuenciaSelected) {
            
            const secuenciaToEdit : Secuencia  = {
                ...props.secuenciaSelected,
                ...{nombre: name}
            };
            secuenciaResponse = await $apiRest<Secuencia>(apiSecuenciasRoutes.update(props.secuenciaSelected.id), HttpMethodEnum.POST, secuenciaToEdit);
        } else {
            const body: CreatePlanificacionDTO = {
                groupId : grupo.id,
                name,
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
            
        <div class="flex w-full justify-end gap-3">
            <UButton label="Cancelar" color="gray" variant="ghost" @click="emit('close')" />
            <UButton type="submit" @click="onSubmit" label="Guardar" color="black" :loading="loading" />
        </div>
    </UForm>
</template>
