<script setup lang="ts">

import type { FormError } from '#ui/types'
import type { LinkForm } from '~/utils/forms/link-form';

const props =  defineProps({
  defaultForm : {
    required : false,
    type: Object,
    default: {}
  }
});

const emit = defineEmits(['on:submit']);

const form = reactive<LinkForm>({
   link: ''
});

// Se carga las propiedades del formulario por defecto en  nuestro form.
Object.assign(form, props.defaultForm);


function validateform(state: any): FormError[] {
  const errors = []
  if (!form.link) errors.push({ path: 'link', message: 'Por favor ingrese un link.' })

  if(!new RegExp("https?:\/\/(?:www\.)?[^\s/$.?#].[^\s]*").test(form.link))
    errors.push({ path: 'link', message: 'Por favor ingrese un link válido' })

  return errors
}

const onSubmit = ()=>{
    emit('on:submit', form)
}

</script>

<template>

    <UForm :state="form" :validate="validateform" :validate-on="['submit']" @submit="onSubmit" class="p-4 min-w-96">
        <UFormGroup name="link" label="Link" description="Convierte el extracto del texto en un link." required
        class="grid grid-cols-1 gap-2 flex items-center" :ui="{ container: '' }">
        <UInput v-model="form.link" type="text" autocomplete="off" icon="tabler:link"
            size="md" />
        </UFormGroup>

        <div class="flex justify-end mt-2">
        <UButton type="submit" label="Establecer Link" color="black" :disabled="false" />
        </div>
    </UForm>
</template>