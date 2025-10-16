import type { BaseModel } from "./base.model";

export interface Documento extends BaseModel{
    document_ref?: string;
    document_url?: string;
    document_preview_url?: string;
    user_id: number;
}