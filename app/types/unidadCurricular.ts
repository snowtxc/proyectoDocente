import type { BaseModel } from "./base.model";
import type { Espacio } from "./espacio";

export interface  UnidadCurricular extends BaseModel{
    nombre: string;
    espacio_id: number;
    espacio : Espacio;
    bloqueada: boolean;
}