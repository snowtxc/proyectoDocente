import type { Actividad } from "./actividad";
import type { BaseModel } from "./base.model";
import type { Secuencia } from "./secuencia";

export interface ActividadSecuencia extends BaseModel{
  actividad_id?: number;
  actividad?: Actividad;
  metodologia?: string;
  evaluacion?: string;
  justificacion?: string;
  secuencia_id: number;
  secuencia?: Secuencia;
  orden?: number;
}

export interface ReordenarActividadSecuenciaDTO {
    secuencia_id : number;
    actividad_secuencia_id: number;
    nuevoOrden : number;
}

export interface RemoverActividadSecuenciaDTO {
   secuencia_id : number;
actividad_secuencia_id: number;
}