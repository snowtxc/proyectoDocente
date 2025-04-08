import type { BaseModel } from "./base.model";
import type { Contenido } from "./contenido";
import type { Espacio } from "./espacio";
import type { UnidadCurricular } from "./unidadCurricular";

export interface Tramo extends BaseModel{
    seDesarrolla: boolean;
    motivoNoSeDesarrolla? : string;
    planificacion_fecha_id: number;
    contenido_id? : number;
    contenido?: Contenido;
    espacio_id?: number;
    espacio?: Espacio;
    unidad_curricular_id? : number;
    unidad_curricular?: UnidadCurricular;
}