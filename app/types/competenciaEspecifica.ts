import type { BaseModel } from "./base.model";
import type { Contenido } from "./contenido";
import type { CriterioDeLogro } from "./criterioDeLogro";


export interface CompetenciaGeneral extends BaseModel{
    nombre: string;
    fundamentacion: string;
    url_image : string;
}

export interface CompetenciaEspecifica extends BaseModel{
    codificacion: string;
    descripcion: string;
    unidad_curricular_id : number;
    ciclo_grado_id: number;
    contenidos: Contenido[]
    criterios_de_logros: CriterioDeLogro[]
    competencias_generales: CompetenciaGeneral[]
}

export interface CompetenciaEspecificaFilter {
    unidad_curricular_id?: number;
    ciclos_grados_ids? : number[]
}

export type CompetenciaEspecificaItemSelector = CompetenciaEspecifica & {
    checked: boolean;
    recomendado: boolean;
    contenidoRelacionado? : Contenido;
    criteriosDeLogrosRelacionados?: CriterioDeLogro[];
    nroRelaciones: number;
};