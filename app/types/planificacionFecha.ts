import type { BaseModel } from "./base.model";
import type { Tramo } from "./tramo";

export interface SimplePlanificacionFecha  extends BaseModel {
    fecha: string;
    observacion?: string;
}

export interface PlanificacionFecha  extends BaseModel{
    fecha: string;
    observacion?: string;
    tramos: Tramo[]
}

export interface CreateMultiplePlanificacionFecha {
    planificacion_id: number;
    fechas: string[]
}