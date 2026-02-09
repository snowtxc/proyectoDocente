import type { BaseModel } from "./base.model";

export interface Plan extends BaseModel{
    nombre: string;
    costo: number;
    plazoDias: number;
    esDePrueba: boolean;
    linkMercadoPago: string;
}