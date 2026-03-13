import type { BaseModel } from "./base.model";
import type { Documento } from "./documento";

export interface Actividad extends BaseModel{
    recursos?: string;
    observacion?: string;
    esGeneral: boolean;
    plan_aprendizaje_document_id?: number;
    meta_aprendizaje_document_id?: number;
    plan_aprendizaje_documento: Documento;
    meta_aprendizaje_documento: Documento;
    meta_aprendizaje_html_content? : string;
    plan_aprendizaje_html_content? : string;
}