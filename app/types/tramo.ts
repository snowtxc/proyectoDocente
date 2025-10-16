import type { Actividad } from "./actividad";
import type { BaseModel } from "./base.model";
import type { CompetenciaEspecifica } from "./competenciaEspecifica";
import type { Contenido } from "./contenido";
import type { CriterioDeLogro } from "./criterioDeLogro";
import type { Espacio } from "./espacio";
import type { UnidadCurricular } from "./unidadCurricular";

export interface Tramo extends BaseModel{
    seDesarrolla: boolean;
    motivoNoSeDesarrolla? : string;
    planificacion_fecha_id: number;
    contenido_id? : number;
    contenido?: Contenido;
    criterios_de_logros: CriterioDeLogro[],
    competencias_especificas: CompetenciaEspecifica[]
    espacio_id?: number;
    espacio?: Espacio;
    unidad_curricular_id? : number;
    unidad_curricular?: UnidadCurricular;
    actividad: Actividad;
    orden: number;
}

export interface ReordenarTramoDTO {
    planificacion_id : number;
    planificacion_fecha_id : number;
    tramo_id: number;
    nuevoOrden : number;
}

export interface RemoverTramoDTO {
    planificacion_id : number;
    planificacion_fecha_id : number;
    tramo_id: number;
}