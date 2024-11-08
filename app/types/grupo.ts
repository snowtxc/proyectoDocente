import type { BaseModel } from "./base.model";
import type { Grado } from "./grado";

export interface Grupo extends BaseModel{
    nombre: string;
    year: number;
    urlLogo?: string;
    esMultiGrado: boolean;
}

export interface CreateGrupoDTO{
    esMultiGrado: boolean;
    grados: Grado[];
    nombre: string;
    year: number;
    logo?: File;
}