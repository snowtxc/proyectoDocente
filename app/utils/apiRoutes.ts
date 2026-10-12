
export const apiAuthRoutes = {
    login: '/login',
    getLoggedUser : '/user',
    register: '/register',
    loginWithGoogleCallback: '/login/google/callback',
    updateProfile: '/auth/updateProfile',
    logout: '/logout',
    user: '/user',
    checkIfUserLogged: '/checkIfUserLogged',
    forgotPassword : '/forgot-password',
    verifyTokenResetPassword: (token:string) => `/verify-token-reset-password/${token}`,
    resetPassword: '/reset-password',
    deactivate: '/auth/deactivate-account'
}

export const apiGrupoRoutes = {
    getById : (id:any) => `/grupos/${id}`,
    listAll: '/grupos',
    list: '/grupos/paged',
    getPaginate: '/grupos/paged',
    create: '/grupos',
    update : (id:number) => `/grupos/${id}`,
}

export const apiGradoRoutes = {
    listAll: '/grados',
}

export const apiAsistenteRoutes = {
    iniciar: '/asistente/sesiones',
    estado: (id: number) => `/asistente/sesiones/${id}`,
    enviar: (id: number) => `/asistente/sesiones/${id}/mensajes`,
}

export const apiDescripcionesFundadasRoutes = {
    find: (id: number) => `/descripciones-fundadas/${id}`,
    update: (id: number) => `/descripciones-fundadas/${id}`,
    exportar: (id: number, formato: string) => `/descripciones-fundadas/${id}/exportar?formato=${formato}`,
}

export const apiPlanificacionesRoutes = {
    listar: '/planificaciones',
    find: (id: number) => `/planificaciones/${id}`,
    update: (id: number) => `/planificaciones/${id}`,
    confirmar: (id: number) => `/planificaciones/${id}/confirmar`,
    exportar: (id: number, formato: string) => `/planificaciones/${id}/exportar?formato=${formato}`,
}

export const apiSuscripcionRoutes = {
    estado: '/suscripcion',
    pagar: '/suscripcion/pagos',
    verificar: '/suscripcion/pagos/verificar',
}

export const apiAdminRoutes = {
    usuarios: (pagina: number, porPagina: number, buscar: string) => `/admin/usuarios?page=${pagina}&rowsPerPage=${porPagina}&buscar=${encodeURIComponent(buscar)}`,
    aplicarPlan: (id: number) => `/admin/usuarios/${id}/plan`,
    planes: '/admin/planes',
    configuraciones: '/admin/configuraciones',
    configuracion: (id: number) => `/admin/configuraciones/${id}`,
}
