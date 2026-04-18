import type { BaseModel } from "./base.model";

export interface Actividad extends BaseModel{
    recursos?: string;
    observacion?: string;
    esGeneral: boolean;
    meta_aprendizaje_html_content? : string;
    plan_aprendizaje_html_content? : string;
}