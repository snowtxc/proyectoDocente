import type { BaseModel } from "./base.model";
import type { CompetenciaEspecifica } from "./competenciaEspecifica";
import type { CriterioDeLogro } from "./criterioDeLogro";

export interface ContenidoEstructurante extends BaseModel{
    titulo: string;
}

export interface Contenido extends BaseModel{
    nombre: string;
    descripcion: string;
    competencias_especificas: CompetenciaEspecifica[],
    criterios_de_logros: CriterioDeLogro[]
    contenido_estructurante_id: number;
    contenido_estructurante: ContenidoEstructurante;
}

export type ContenidoItemSelector = Contenido & {
    recomendado: boolean;
    competenciasEspecificasRelacionadas?: CompetenciaEspecifica[];
    criteriosDeLogrosRelacionados? : CriterioDeLogro[];
    nroRelaciones: number;
};


export interface ContenidoFilter {
    unidad_curricular_id?: number;
    grados_ids? : number[]
}