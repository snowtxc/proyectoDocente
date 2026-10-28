// Paso obligatorio de Mi estilo: antes de usar Flopi, el docente elige cómo se ven sus planificaciones
// (en la pantalla y en las descargas). Lo hacen las cuentas nuevas y también las que ya existían.

// Lo que se puede usar sin haber elegido: la pantalla para elegir, el editor de formato y renovar.
export const RUTAS_SIN_FORMATO = ['/bienvenida', '/disenar-formato', '/suscripcion']

export const debeElegirFormato = (user: { rol?: string, formato_elegido_at?: string | null } | null | undefined) =>
  !!user && user.rol !== 'superadmin' && !user.formato_elegido_at
