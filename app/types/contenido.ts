import type { BaseModel } from "./base.model";

export interface ContenidoEstructurante extends BaseModel{
    titulo: string;
}

export interface Contenido extends BaseModel{
    nombre: string;
    descripcion: string;
}

export interface ContenidoFilter {
    unidad_curricular_id?: number;
    grados_ids? : number[]
}