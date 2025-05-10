<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '#ui/types'
import SelectYear from '../select/SelectYear.vue';
import type { CreateOrUpdateGrupoDTO, Grupo } from '~/types/grupo';
import { useErrorStore } from '~/services/errorService/errorService';
import { ModeEnum } from '~/utils/enums/ModeEnum';
import type { Grado } from '~/types/grado';
import { HttpMethodEnum } from '~/utils/enums/HttpMethodEnum';
import { apiGrupoRoutes } from '~/utils/apiRoutes';

interface Props {
    mode: ModeEnum,
    grupoSelected?: Grupo
}

const {  $apiRest } = useNuxtApp();

const toast = useToast()

const runtimeConfig = useRuntimeConfig()
const errorService =   useErrorStore();

const defaultGroupImage = ref<string>(runtimeConfig.public.DEFAULT_GRUPO_IMAGE_URL);

const props = withDefaults(defineProps<Props>() , {});

const emit = defineEmits(['on:update','close'])

const loading = ref(false);

const fileRef = ref<HTMLInputElement>()

const logoB64 = ref(null);

const grados = ref<Grado[]>([]);
const loadingGrados = ref<boolean>(true);

onBeforeMount(async()=>{
  grados.value = await loadGrados();
   
  if(props.mode == ModeEnum.UPDATE && props.grupoSelected){
    loadForm(props.grupoSelected);
  }
});

const loadGrados = async()=>{
  loadingGrados.value = true;
  const grados = await $apiRest(apiGradoRoutes.listAll, HttpMethodEnum.GET);
  loadingGrados.value = false;
  return grados;
}

const form = reactive<CreateOrUpdateGrupoDTO>({
  nombre: "",
  esMultiGrado: false,
  grados: null,
  logo: null,
  year: new Date().getFullYear()
});

const loadForm = (grupo: Grupo) =>{
  form.nombre = grupo.nombre;
  form.esMultiGrado = grupo.esMultiGrado;
  if(!grupo.esMultiGrado){
     form.grados = grupo.grados[0] as Grado;
  }else{
      form.grados = grupo.grados;
  }
  defaultGroupImage.value = grupo.url_image;
}

const validate = (state: any): FormError[] => {
  const errors = []
  if (!form.nombre) errors.push({ path: 'nombre', message: 'Por favor ingresa un nombre al grupo.' })
  if(form.grados == null ||  form.grados?.length <= 0) errors.push({path: 'grados', message: 'Debes ingresar al menos un grado al grupo'})
  if(!form.year) errors.push({path: 'year',message: 'Debes ingresar el año escolar del grupo' })
  return errors
}

const createFormData = (data:CreateOrUpdateGrupoDTO) =>{
    const formData = new FormData();
    Object.keys(data).map(key => {
      if(key === 'grados'){
          formData.append('grados', JSON.stringify(data.grados));
      }else if(key == 'esMultiGrado'){
        formData.append('esMultiGrado', data.esMultiGrado ? Number(1).toString() : Number(0).toString())
      }else if(key == 'logo'){
        if(data.logo){  // Solo si viene un archivo se agrega al formData
          formData.append('logo', data.logo)
        }
      }
      else{
        formData.append(key, data[key]);
      }
    });

    return formData;
}

async function onSubmit(event: FormSubmitEvent<any>) {

  const body: CreateOrUpdateGrupoDTO = {
    ...form,
    grados: Array.isArray(form.grados) ? form.grados: [form.grados]
  }

  try{
    let grupoResponse: Grupo;
    loading.value = true;
    if(props.mode == ModeEnum.UPDATE && props.grupoSelected){
      grupoResponse  = await $apiRest<Grupo>(apiGrupoRoutes.update(props.grupoSelected.id), HttpMethodEnum.POST,  createFormData(body));
    }else{
      grupoResponse =  await $apiRest<Grupo>(apiGrupoRoutes.create, HttpMethodEnum.POST,createFormData(body));
    }
    loading.value = false;
    toast.add({
      title: "Grupo creado",
      description: props.mode == ModeEnum.CREATE ?  `Se ha creado el grupo ${grupoResponse.nombre} correctamente` : `Se ha modificado el grupo ${grupoResponse.nombre} correctamente`,
      color: "green"
    })
    emit('on:update');
    emit('close');
  }catch(message){
    loading.value = false;
    toast.add({
      title: "Error",
      description: message ? message : 'Error al crear el grupo',
      color: "red"
    })
  }  
}

const handleChangeMultiGrado = () => {
  if (form.esMultiGrado) {
    form.grados = [];
    return;
  }
  form.grados = null;
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files[0]; 
  const reader = new FileReader();

  const extension = file.name.split(".").pop();
  if(extension != 'jpg' && extension != 'png' && extension != 'jpeg' && extension != 'gif'){
    errorService.setError("Sólo se permite estos tipos de archivos .jpg, .jpeg, .png, .gif")
    return;
  }

  reader.onload = () => {
    const base64String = reader.result as string;   
    form.logo = file;
    logoB64.value = base64String;
  };
  reader.readAsDataURL(file);
 }

function onFileClick() {
  fileRef.value?.click()
}

</script>

<template>
  <UForm :validate="validate" :validate-on="['submit']" :state="form" class="space-y-4" @submit="onSubmit">
  
    <div class="relative flex flex-col items-center">
      <UAvatar :src="logoB64 ? logoB64 : defaultGroupImage"
        size="3xl" />
      <UButton label="Cambiar imagen" class="mt-1" color="white" size="md" @click="onFileClick" />
      <input ref="fileRef" type="file" class="hidden" accept=".jpg, .jpeg, .png, .gif" @change="onFileChange">
    </div>

    <UFormGroup label="Nombre" name="nombre">
      <UInput v-model="form.nombre" placeholder="Nombre" autofocus />
    </UFormGroup>

    <UFormGroup label="Año Escolar" name="year">
      <SelectYear v-model="form.year"></SelectYear>

    </UFormGroup>

    <UCheckbox v-model="form.esMultiGrado" name="esMultiGrado" label="¿Grupo es MultiGrado?"
      help="En caso de que el grupo incluya más de 1 grado selecciona la opción para escoger más de uno"
      @change="handleChangeMultiGrado" />

    <UFormGroup :label="form.esMultiGrado ? 'Grados': 'Grado'" name="grados">
      <SelectGrado v-model="form.grados" :multiple="form.esMultiGrado" class="mt-2" :grados="grados" :loading="loadingGrados"></SelectGrado>
    </UFormGroup>
    
    <div class="flex justify-end gap-3">
      <UButton label="Cancelar" color="gray" variant="ghost" @click="emit('close')" />
      <UButton type="submit" label="Guardar" color="black" :loading="loading"/>
    </div>
  </UForm>
</template>
