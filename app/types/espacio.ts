import type { BaseModel } from "./base.model";
import type { UnidadCurricular } from "./unidadCurricular";

export interface Espacio extends BaseModel{
    nombre: string;
    unidades_curriculares: UnidadCurricular[]
    rgbColor: string;
}