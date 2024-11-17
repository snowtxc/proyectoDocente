import type { BaseModel } from "./base.model";

export interface Grado extends BaseModel{
    nombre: string;
    ciclo_grado_id: number;
}