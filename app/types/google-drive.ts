export interface UpdateGoogleDriveInfoDTO{
    path_planificaciones?: string;
    path_secuencias?: string;
}

export interface ListFoldersDTO {
    baseFolder? : string;
}

export interface DriveFolder {
    id: string;
    name: string;
}