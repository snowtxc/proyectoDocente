import type { BaseModel } from "./base.model";

export interface Tramo extends BaseModel{
    seDesarrolla: boolean;
    motivoNoSeDesarrolla? : string;
    planificacion_fecha_id: number;
    contenido_id? : number;
}