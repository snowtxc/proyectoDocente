
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
    deactivate: '/auth/deactivate-account'
}

export const apiUserConfigRoutes = {
    updateConfig : '/config/updateConfig',
    getConfig : '/config/getConfig'
}

export const apiGrupoRoutes = {
    getSecuenciasRelacionadas : (id:number) => `/grupos/${id}/secuencias/relacionadas`,
    listAll: '/grupos',
    list: '/grupos/paged',
    getPaginate: '/grupos/paged',
    create: '/grupos',
    update : (id:number) => `/grupos/${id}`
}

export const apiGradoRoutes = {
    listAll: '/grados',
}

export const apiCicloGradosRoutes = {
    listAll: '/ciclos-grados',
}

export const apiPlanificacionesRoutes = {
    getPaginate: '/planificaciones/paged',
    create: "/planificaciones",
    update: (id:number) => `/planificaciones/${id}`,
    getBySlug : (slug: string) => `/planificaciones/${slug}`,
    verificarFecha:  '/planificaciones/verificar-fecha',
    exportar: (id: number) => `/planificaciones/${id}/exportar`,
    sincronizarGoogleDrive: (id:number) => `/planificaciones/${id}/sincronizarGoogleDrive`,
    delete: (id: number) =>  `/planificaciones/${id}`,
    registrarAccesso : (id: number) => `/planificaciones/${id}/access`
}

export const apiPlanificacionesFechaRoutes = {
    getPaginate:  '/planificaciones-fecha/paged',
    create: "/planificaciones-fecha",
    find : (id: number) => `/planificaciones-fecha/${id}`,
    cambiarFecha : '/planificaciones-fecha/cambiar-fecha',
    guardar: (id:number)=> `/planificaciones-fecha/${id}/guardar`,
    remover: (id: number) =>  `/planificaciones-fecha/${id}`
}

export const apiTramosRoutes = {
    create: "/tramos",
    reordenarTramo: '/tramos/reordenarTramo',
    removerTramo: '/tramos/removerTramo',
    cargarTramoDesdeActividadSecuencia: '/tramos/cargarTramoDesdeActividadSecuencia'
}

export const apiEspaciosRoutes = {
    listAll: "/espacios",
}

export const apiContenidosRoutes = {
    getPaginate: "/contenidos/paged",
}

export const apiCriteriosDeLogrosRoutes = {
    getPaginate: "/criterios-de-logros/paged",
}

export const apiCompetenciasEspecificasRoutes = {
    getPaginate: "/competencias-especificas/paged",
}

export const apiCompetenciasGeneralesRoutes = {
    listAll: '/competencias-generales'
}

export const apiPromptsRoutes = {
    getPaginate : '/prompts/paged',
}

export const apiFlopiBot = {
    sendPromptMessage : "/flopi-bot/send-prompt-message",
    generarPropuestaPedagogica: "/flopi-bot/generar-propuesta-pedagogica"
}

export const apiDocumentos = {
    createDocument : () => `/createDocument`,
    openDocument :  (id:number) => `/documentos/${id}/openDocument`,
    saveDocument :  (id:number) => `/documentos/${id}/saveDocument`,
    deleteDocument : (id: number) => `/documentos/${id}`
}

export const apiSecuenciasRoutes = {
    getPaginate: '/secuencias/paged',
    create: "/secuencias",
    update: (id:number) => `/secuencias/${id}`,
    getBySlug : (slug: string) => `/secuencias/${slug}`,
    guardar: (id:number)=> `/secuencias/${id}/guardar`,
    exportar: (id: number) => `/secuencias/${id}/exportar`,
    sincronizarGoogleDrive: (id:number) => `/secuencias/${id}/sincronizarGoogleDrive`,
    delete: (id: number) =>  `/secuencias/${id}`
}

export const apiActividadSecuenciaRoutes = {
    create: "/actividades-secuencias",
    reordenarActividad: '/actividades-secuencias/reordenarActividad',
    removerActividad: '/actividades-secuencias/removerActividad'
}

export const apiPlanUsuarioRoutes = {
    getEstadoPeriodoPrueba : '/planes-usuarios/getEstadoPeriodoPlan'
}

export const apiDashboardRoutes = {
    getDashboard : '/dashboard/getDashboard'
}