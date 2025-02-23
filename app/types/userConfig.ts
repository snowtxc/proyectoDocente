export interface UserConfig{
    drive_planificaciones_folder_id? : string
    drive_planificaciones_folder_name? : string
    drive_secuencias_folder_id? : string
    drive_secuencias_folder_name? : string
}

export interface UpdateGoogleDriveInfoDTO{
    drive_planificaciones_folder_id?: string;
    drive_planificaciones_folder_name?: string;
    drive_secuencias_folder_id? : string;
    drive_secuencias_folder_name? : string;
}