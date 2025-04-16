import type { BaseModel } from "./base.model";

export interface CompetenciaEspecifica extends BaseModel{
    codificacion: string;
    descripcion: string;
    unidad_curricular_id : number;
    ciclo_grado_id: number;
}

export interface CompetenciaEspecificaFilter {
    unidad_curricular_id?: number;
    ciclos_grados_ids? : number[]
}