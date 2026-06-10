import type { BaseModel } from "./base.model"

export interface User extends BaseModel{
  nombre1: string;
  nombre2: string | null;
  apellido1: string;
  apellido2: string | null;
  email: string;
  url_image_profile?: string | null;
  drive_path_planificaciones_folder?: string;
  drive_path_planificaciones_folder_id?: string;
  roles?: Role[];
  plan?: Plan | null;
  current_plan_usuario?: CurrentPlanUsuario | null;
  plan_status?: PlanStatus | null;
}

export interface Role {
  id: number;
  name: 'cliente' | 'administrador' | string;
  guard_name: string;
}

export interface Plan {
  id: number;
  nombre: string;
  plazoDias: number;
  costo: string;
}

export interface CurrentPlanUsuario {
  id: number;
  plan_id: number;
  user_id: number;
  vencimiento: string;
}

export type PlanStatusEstado = 'vigente' | 'vencido' | 'sin_plan' | string;

export interface PlanStatus {
  planNombre?: string | null;
  vencimiento?: string | null;
  isExpired?: boolean;
  estado: PlanStatusEstado;
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
