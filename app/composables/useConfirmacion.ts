import ConfirmacionModal from '~/components/ConfirmacionModal.vue'

export interface OpcionesConfirmacion {
  titulo: string
  mensaje?: string
  aceptar?: string
  cancelar?: string
  peligro?: boolean
}

// Pide confirmación con el modal de Flopi: true si acepta; false si cancela o lo cierra.
export const useConfirmacion = () => {
  const overlay = useOverlay()

  return async (opciones: OpcionesConfirmacion): Promise<boolean> =>
    (await overlay.create(ConfirmacionModal, { destroyOnClose: true }).open(opciones)) === true
}
