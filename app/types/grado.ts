import type { BaseModel } from "./base.model";
import type { CicloGrado } from "./cicloGrado";

export interface Grado extends BaseModel{
    nombre: string;
    ciclo_grado_id: number;
    ciclo_grado: CicloGrado;
}