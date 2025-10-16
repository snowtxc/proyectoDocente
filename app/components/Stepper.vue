<script setup lang="ts">

import { Icon } from '@iconify/vue'
import { StepperDescription, StepperIndicator, StepperItem, StepperRoot, StepperSeparator, StepperTitle, StepperTrigger } from 'reka-ui'
import { useMouse, useWindowScroll } from '@vueuse/core'
import { da } from 'date-fns/locale'

interface Props {
    showButtonAddStep? : boolean,
    titleButtonAddStep?: string,
    descriptionButtonAddStep?: string
    steps: { step: number, title: string , description, icon: string } []
    currentStep: number;
    disabled?: boolean;
    orientation : "vertical" | "horizontal",
    linear?: boolean;
    actionsMenu?: { title: string, icon: string , actionName: string}[]
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

const { x, y } = useMouse()
const { y: windowY } = useWindowScroll()

const openMenus = ref({});
const isOpenContextMenuActionsTramo = ref(false);

const virtualElement = ref({ getBoundingClientRect: () => ({}) })
const virtualElements = ref({})

function onContextMenu(event, step) {

  virtualElements.value[step] = event.currentTarget
  openMenus.value[step] = true

  if(props.actionsMenu?.length == 0)
    return;

  const top = unref(y) - unref(windowY)
  const left = unref(x)

  virtualElement.value.getBoundingClientRect = () => ({
    width: 0,
    height: 0,
    top,
    left
  })

  isOpenContextMenuActionsTramo.value = true
}


  const onClickActionMenu = (actionName:string, step : number) =>{

      emit('on:action-menu', {
        actionName,
        step
      })
  }

</script>

<template>
  <StepperRoot
    :default-value="1"
    :orientation="props.orientation"
    class="flex w-full"
    :class="{
      'flex-row': props.orientation == 'horizontal',
      'flex-col' : props.orientation == 'vertical'
    }"
    :linear="props.linear"
    v-model="currentStep"
  >
  
    <StepperItem
      v-for="item in props.steps"
      :key="item.step"
      :disabled="props.disabled"
      class="w-full flex items-center justify-center gap-2 cursor-pointer group relative my-10"
      :class="{
        'flex-row': props.orientation == 'horizontal',
        'flex-col' : props.orientation == 'vertical'
      }"
      :step="item.step"
    >
      <StepperTrigger class="inline-flex border-2 shadow-sm items-center text-white bg-primary border-primary group-data-[state=inactive]:border-gray-200 group-data-[state=inactive]:bg-white group-data-[state=inactive]:text-stone-700 group-data-[disabled]:opacity-50 group-data-[disabled]:cursor-not-allowed justify-center rounded-full w-10 h-10 shrink-0 focus:shadow-[0_0_0_2px] focus:shadow-black focus:outline-none">
        <StepperIndicator>
          <div class="w-full" @contextmenu.prevent="onContextMenu($event,item.step)">
            <Icon
            :icon="item.icon"
            class="w-5 h-5"
          />
          <UContextMenu v-model="openMenus[item.step]" :virtual-element="virtualElements[item.step]">

            <div v-for="(action, idx) in props.actionsMenu"  :key="idx" class="p-4 text-black hover:bg-gray-100 flex items-center gap-2" @click="onClickActionMenu(action.actionName, item.step)">
                <UIcon :name="action.icon" class="w-5 h-5" />
                <span>  {{ action.title }} </span>
            </div>
          </UContextMenu>
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

    <StepperItem
      v-if="props.showButtonAddStep"
      :key="stepAdd"
      @click="emit('on:add-step')"
      class="w-full flex flex-col items-center justify-center gap-2 cursor-pointer group relative my-10"
      icon="tabler:circle-dashed-plus"
      :step="stepAdd"
    >
      <div @click="emit('on:add-step')">
        <StepperTrigger class="inline-flex border-2 shadow-sm items-center hover:text-white hover:bg-primary  justify-center rounded-full w-10 h-10 shrink-0 focus:shadow-[0_0_0_2px]">
          <StepperIndicator>
            <Icon
              icon="tabler:circle-dashed-plus"
              class="w-5 h-5 hover:cursor-pointer"
              @click="emit('on:add-step')"
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