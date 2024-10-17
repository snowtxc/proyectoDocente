import { defineStore } from 'pinia'

export const useErrorStore = defineStore('errorStore', {
  state: () => ({
    errorMessage: null,
  }),
  actions: {
    setError(message: string) {
      this.errorMessage = message
    },
    clearError() {
      this.errorMessage = null
    },
  },
})