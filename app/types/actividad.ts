import type { BaseModel } from "./base.model";

export interface Actividad extends BaseModel{
    meta_de_aprendizaje_json?  : string;
    plan_de_aprendizaje_json? : string;
    meta_de_aprendizaje_html?: string;
    plan_de_aprendizaje_html?: string;
    recursos?: string;
    observacion?: string;
    esGeneral: boolean;
}