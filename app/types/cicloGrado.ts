import type { BaseModel } from "./base.model";
import type { Ciclo } from "./ciclo";
import type { Grado } from "./grado";

export interface CicloGrado extends BaseModel{
    nombre: string;
    ciclo_id: number;
    ciclo: Ciclo;
    grados: Grado[]
}