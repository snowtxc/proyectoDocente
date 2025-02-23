import { defineStore } from 'pinia'

export const useAuthStore = defineStore('main', {
  state: () => {
    return {
      token: null,
      user: null,
    }
  },
  actions: {
    setToken(newToken) {
      this.token = newToken
    },
    setUser(newUser) {
      this.user = newUser
    },

    clearToken(){
      this.token = null;
    },

    clearUser(){
        this.user = null;
    }
  },
  persist: true, // La persistencia se maneja con `true`
})
