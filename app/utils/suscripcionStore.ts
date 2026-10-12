import { defineStore } from 'pinia'
import type { EstadoSuscripcion } from '~/types/suscripcion'

// Estado del acceso del docente (mes gratis o período pago). No se guarda: se pide al entrar.
export const useSuscripcionStore = defineStore('suscripcion', {
  state: () => {
    return {
      estado: null as EstadoSuscripcion | null,
    }
  },
  getters: {
    vencida: (state) => state.estado !== null && !state.estado.activa,
  },
  actions: {
    setEstado(nuevoEstado: EstadoSuscripcion | null) {
      this.estado = nuevoEstado
    },

    // El backend rechazó un pedido porque el período venció.
    marcarVencida() {
      if (this.estado) {
        this.estado = { ...this.estado, activa: false, dias_restantes: 0, avisar: false }
      }
    },

    actualizarUsoIa(usoIa: EstadoSuscripcion['uso_ia']) {
      if (this.estado) {
        this.estado = { ...this.estado, uso_ia: usoIa }
      }
    },

    clear() {
      this.estado = null
    },
  },
})
