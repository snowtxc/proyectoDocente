import { createSharedComposable } from '@vueuse/core'

const _useSlideOver = () => {
  const isOpen = ref(true)

  const open = () =>{
     isOpen.value = true;
  }

  const close = ()=>{  
    isOpen.value = false;
  }

  return {
    isOpen,
    close,
    open
  }
}

export const useSlideOver = createSharedComposable(_useSlideOver)
