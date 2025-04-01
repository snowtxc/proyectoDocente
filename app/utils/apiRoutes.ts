export const apiGoogleDriveRoutes = {
    listFolders: '/google-drive/listFolders'
}

export const apiAuthRoutes = {
    login: '/login',
    getLoggedUser : '/user',
    register: '/register',
    loginWithGoogleCallback: '/login/google/callback',
    linkOrUpdateGoogleAccount : '/auth/linkOrUpdateGoogleAccount',
    updateProfile: '/auth/updateProfile',
    logout: '/logout',
    user: '/user',
    checkIfUserLogged: '/checkIfUserLogged',
    forgotPassword : '/forgot-password',
    verifyTokenResetPassword: (token:string) => `/verify-token-reset-password/${token}`,
    resetPassword: '/reset-password',

}

export const apiUserConfigRoutes = {
    updateConfig : '/config/updateConfig',
    getConfig : '/config/getConfig'
}

export const apiGrupoRoutes = {
    listAll: '/grupos',
    list: '/grupos/paged',
    getPaginate: '/grupos/paged',
    create: '/grupos',
    update : (id:number) => `/grupos/${id}`
}

export const apiGradoRoutes = {
    listAll: '/grados',
}

export const apiPlanificacionesRoutes = {
    getPaginate: '/planificaciones/paged',
    create: "/planificaciones",
    update: (id:number) => `/planificaciones/${id}`,
    getBySlug : (slug: string) => `/planificaciones/${slug}`,
    verificarFecha:  '/planificaciones/verificar-fecha'
}

export const apiPlanificacionesFechaRoutes = {
    create: "/planificaciones-fecha",
    find : (id: number) => `/planificaciones-fecha/${id}`,
    cambiarFecha : '/planificaciones-fecha/cambiar-fecha'
}

export const apiTramosRoutes = {
    create: "/tramos",
}