import type { Plan } from "./plan";

export interface EstadoPlanUsuario {
    isExpired: boolean;
    vencimiento: Date
    planNombre: string;
    planes: Plan[];
    wppPhone: string
}