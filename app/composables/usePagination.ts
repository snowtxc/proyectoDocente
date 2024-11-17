import { createSharedComposable } from '@vueuse/core'

const _usePagination = () => {

  const page = ref<number>(1);
  const rowsPerPage = ref<number>(10);
  const totalRows = ref<number>(0);

  const changePage = (newPage: number)=>{
    page.value = newPage;
  }

  const changeRowsPerPage = (newRowsPerPage: number)=>{
    rowsPerPage.value = newRowsPerPage;
  }

  const changeTotalRows = (newTotalRows:number) =>{
    totalRows.value = newTotalRows;
  }

  return {
    page,
    rowsPerPage,
    totalRows,
    changePage,
    changeRowsPerPage,
    changeTotalRows
  }
}

export const usePagination = createSharedComposable(_usePagination)
