
export const appRoutes = {
    asistente: () => '/home',
    grupos: () => '/grupos',
    planificaciones: () => '/planificaciones',
    planificacion: (id: number) => `/planificaciones/${id}`,
    suscripcion: () => '/suscripcion',
    usuarios: () => '/admin/usuarios',
    reportes: () => '/admin/reportes',
}

export const appAuthRoutes ={
    login : "/login",
    forgotPassword : '/forgot-password'
}
