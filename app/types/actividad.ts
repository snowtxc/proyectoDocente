import type { BaseModel } from "./base.model";

export interface Actividad extends BaseModel{
    recursos?: string;
    observacion?: string;
    esGeneral: boolean;
    plan_aprendizaje_document_id?: number;
    meta_aprendizaje_document_id?: number;
    plan_aprendizaje_documento: any;
    meta_aprendizaje_documento: any;
}