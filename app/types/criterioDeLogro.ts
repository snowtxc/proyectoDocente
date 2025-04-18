import type { BaseModel } from "./base.model";
import type { CompetenciaEspecifica } from "./competenciaEspecifica";
import type { Contenido } from "./contenido";

export interface CriterioDeLogro extends BaseModel{
    descripcion: string;
    unidad_curricular_id : number;
    contenidos: Contenido[],
    competencias_especificas: CompetenciaEspecifica[]
    grado_id: number;
}

export type CriterioDeLogroItemSelector = CriterioDeLogro & {
    checked: boolean;
    recomendado: boolean;
    contenidoRelacionado? : Contenido;
    competenciasEspecificasRelacionadas?: CompetenciaEspecifica[];
    nroRelaciones: number;
};

export interface CriterioDeLogroFilter {
    unidad_curricular_id?: number;
    grados_ids? : number[]
}