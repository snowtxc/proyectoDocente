import { defineStore } from 'pinia'

export const useLoadingStore = defineStore('loadingStore', {
  state: () => ({
    loading: false,
  }),
  actions: {
    setLoading(loading: boolean) {
      this.loading = loading
    },
    clearLoading() {
      this.loading = false
    },
  },
})