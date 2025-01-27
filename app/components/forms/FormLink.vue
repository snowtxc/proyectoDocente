<script setup lang="ts">

import type { FormError } from '#ui/types'
import type { LinkForm } from '~/utils/forms/link-form';

const props =  defineProps({
  defaultForm : {
    required : false,
    type: Object,
    default: {}
  },

  isYoutubeLink : {
    required: false,
    type: Boolean,
    default: false
  },

  label: {
    required: false,
    type: String,
    default: 'Link',
    
  },

  description : {
    required: false,
    type: String,
    default:  'Convierte el extracto del texto en un link.'
  },
  labelBtn: {
    required: false,
    type: String,
    default:  'Establecer Link'
  },

  showCloseButton : {
    required: false,
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['on:submit','close']);

const form = reactive<LinkForm>({
   link: ''
});

// Se carga las propiedades del formulario por defecto en  nuestro form.

if(props.defaultForm){
  Object.assign(form, props.defaultForm);
}


function validateform(state: any): FormError[] {
  const errors = []

  const message = props.isYoutubeLink ? 'Por favor ingresa un link de youtube.' : 'Por favor ingrese un link.';
  if (!form.link) errors.push({ path: 'link', message })

  if(!new RegExp("https?:\/\/(?:www\.)?[^\s/$.?#].[^\s]*").test(form.link)){
    errors.push({ path: 'link', message: 'Por favor ingrese un link válido' })

  }else if(props.isYoutubeLink &&
  !new RegExp("https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+$").test(form.link))
  {
    errors.push({ path: 'link', message: 'Por favor ingrese un link de youtube válido' })
  }
  return errors
}

const onSubmit = ()=>{
    emit('on:submit', form)
}

</script>

<template>

    <UForm :state="form" :validate="validateform" :validate-on="['submit']" @submit="onSubmit" class="p-4 min-w-96">
        <UFormGroup name="link" :label="props.label" :description="props.description" required
        class="grid grid-cols-1 gap-2 flex items-center" :ui="{ container: '' }">
        <UInput v-model="form.link" type="text" autocomplete="off" icon="tabler:link"
            size="md" />
        </UFormGroup>

        <div class="flex justify-end mt-2 gap-3">
          <UButton
            v-if="props.showCloseButton"
            label="Cancel"
            color="gray"
            variant="ghost"
            @click="emit('close')"
          />

        <UButton type="submit" :label="props.labelBtn" color="black" :disabled="false" />
        </div>
    </UForm>
</template>