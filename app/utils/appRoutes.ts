
export const appRoutes = {
    planificaciones: () => '/planificaciones',
    planificacionPage: (slug:string) => `/planificaciones/${slug}`,
    secuenciaPage: (slug:string) => `/secuencias/${slug}`
}

export const appAuthRoutes ={
    login : "/login",
    forgotPassword : '/forgot-password'
}