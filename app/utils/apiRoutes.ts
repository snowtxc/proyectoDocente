export const apiGoogleDriveRoutes = {
    listFolders: '/google-drive/listFolders'
}

export const apiAuthRoutes = {
    login: '/login',
    getLoggedUser : '/user',
    register: '/register',
    loginWithGoogleCallback: '/login/google/callback',
    linkOrUpdateGoogleAccount : 'auth/linkOrUpdateGoogleAccount',
    updateProfile: '/auth/updateProfile'
}

export const apiUserConfigRoutes = {
    updateConfig : '/config/updateConfig',
    getConfig : '/config/getConfig'
}

export const apiGrupoRoutes = {
    list: '/grupos/paged',
    getPaginate: '/grupos/paged',
    create: '/grupos',
    update : (id:number) => `/grupos/${id}`
}

export const apiGradoRoutes = {
    listAll: '/grados',
}