import type { BaseModel } from "./base.model"

export interface User extends BaseModel{
  nombre1: string;
  nombre2: string;
  apellido1: string;
  apellido2: string;
  email: string;
  url_image_profile: string;
  drive_path_planificaciones_folder?: string;
  drive_path_planificaciones_folder_id?: string;
}

export interface CreateUserDTO {
  nombre1: string
  nombre2: string
  apellido1: string
  apellido2: string
  email: string
  password: string
}

export interface LoginDTO {
  email: string
  password: string
}

export interface UpdateUserProfileDTO{
  nombre1: string
  nombre2: string
  apellido1: string
  apellido2: string;
  nuevoAvatar? : string;
}