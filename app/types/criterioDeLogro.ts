import type { BaseModel } from "./base.model";

export interface CriterioDeLogro extends BaseModel{
    descripcion: string;
    unidad_curricular_id : number;
    grado_id: number;
}

export interface CriterioDeLogroFilter {
    unidad_curricular_id?: number;
    grados_ids? : number[]
}