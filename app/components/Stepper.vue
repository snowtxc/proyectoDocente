<script setup lang="ts">

import { Icon } from '@iconify/vue'
import { StepperDescription, StepperIndicator, StepperItem, StepperRoot, StepperSeparator, StepperTitle, StepperTrigger } from 'reka-ui'

interface Props {
    showButtonAddStep? : boolean,
    titleButtonAddStep?: string,
    descriptionButtonAddStep?: string
    steps: { step: number, title: string , description, icon: string } []
    currentStep: number;
    disabled?: boolean;
    orientation : "vertical" | "horizontal",
    linear?: boolean;
    actionsMenu?: { title: string, icon: string , actionName: string, color?: string}[],
    blockNextSteps?: boolean | null 
}

const props = withDefaults(defineProps<Props>() , {});

const emit = defineEmits(['on:add-step','on:change-step', 'on:action-menu']);

const  currentStep = ref(props.currentStep);

const stepAdd = computed(()=>{
  return props.steps.length + 1;
})

watch(()=> currentStep.value, ()=>{
  emit('on:change-step', currentStep.value);
})

watch(()=> props.currentStep, ()=> {
  currentStep.value = props.currentStep;
})

const changeStep = (step:number) => {
  currentStep.value = step;
}

defineExpose({
  changeStep
})

const getMenuItems : any = (value:any) => {

  if(!props.actionsMenu)
   return [];

  return props.actionsMenu.map(item => {
    return {
      label: item.title,
      color: item.color ? item.color : 'red',
      icon: item.icon,
      onSelect() {
        emit('on:action-menu', {
          actionName: item.actionName,
          step: value.step, // Aquí usamos el step pasado como parámetro
        })
      }
    }
  })
}



</script>

<template>
  <StepperRoot
    :default-value="1"
    :orientation="props.orientation"
    class="flex w-full"
    :class="{
      'flex-row w-full': props.orientation == 'horizontal',
      'flex-col' : props.orientation == 'vertical'
    }"
    :linear="props.linear"
    v-model="currentStep"
  >
    <div v-for="item in props.steps" :key="item.step" class="w-full">
       <UContextMenu :items="getMenuItems(item)" :ui="{ content: 'w-48' }"> 
          <StepperItem
          :disabled="props.disabled || (props.blockNextSteps && item.step > currentStep)"
          class="w-full flex items-center justify-center gap-2 cursor-pointer group relative my-10"
          :class="{
            'flex-row': props.orientation == 'horizontal',
            'flex-col' : props.orientation == 'vertical'
          }"
          :step="item.step"
        >
                                  
          <StepperTrigger 
          :class="{
            'bg-primary  border-primary': item.step <= currentStep, 
            'bg-stone-300/50' : item.step > currentStep,
          }"
          class="inline-flex border-2 shadow-sm items-center text-white  group-data-[state=inactive]:border-gray-200 group-data-[state=inactive]:bg-white group-data-[state=inactive]:text-stone-700 group-data-[disabled]:opacity-50 group-data-[disabled]:cursor-not-allowed justify-center rounded-full w-10 h-10 shrink-0 focus:shadow-[0_0_0_2px] focus:shadow-black focus:outline-none">
            
            <StepperIndicator>
                <div class="w-full">
                <Icon
                :icon="item.icon"
                class="w-5 h-5"
                 :class="{
                  'bg-primary  border-primary': item.step <= currentStep, 
                  'text-black border-gray' : item.step > currentStep,
                }"
              />
              </div>

            </StepperIndicator>
          </StepperTrigger>
        

          <StepperSeparator
          v-if="item.step == 1  || (item.step !== props.steps.length )"
          class="rounded-full shrink-0 text-center"
          :class="{
            'bg-primary': item.step <= currentStep, 
            'bg-stone-300/50' : item.step >= currentStep,
            'w-[3px] h-[40px]': props.orientation == 'vertical',
            'w-[60px] h-[3px]' : props.orientation == 'horizontal'
          }"
            />

          <div class="absolute text-center top-full left-0 w-full mt-2 text-stone-700 dark:text-white group-data-[disabled]:opacity-50">
            <StepperTitle class="font-medium">
              {{ item.title }}
            </StepperTitle>
            <StepperDescription class="hidden sm:block text-xs">
              {{ item.description }}
            </StepperDescription>
          </div>
          </StepperItem>
      </UContextMenu>
    </div>
   
    <StepperItem
      v-if="props.showButtonAddStep"
      :key="stepAdd"
      @click="emit('on:add-step')"
      class="w-full flex flex-col items-center justify-center gap-2 cursor-pointer group relative my-10"
      icon="tabler:circle-dashed-plus"
      :step="stepAdd"
    >
      <div>
        <StepperTrigger class="inline-flex border-2 shadow-sm items-center hover:text-white hover:bg-primary  justify-center rounded-full w-10 h-10 shrink-0 focus:shadow-[0_0_0_2px]">
          <StepperIndicator>
            <Icon
              icon="tabler:circle-dashed-plus"
              class="w-5 h-5 hover:cursor-pointer"
            />
          </StepperIndicator>
        </StepperTrigger>
      </div>
     

      <div class="absolute text-center top-full left-0 w-full mt-2 text-stone-700 dark:text-white group-data-[disabled]:opacity-50">
        <StepperTitle class="font-medium">
          {{ props.titleButtonAddStep  }}
        </StepperTitle>
        <StepperDescription class="hidden sm:block text-xs">
          {{ props.descriptionButtonAddStep }}
        </StepperDescription>
      </div>
    </StepperItem>
  </StepperRoot>
</template>