import type { BaseModel } from "./base.model";
import type { Grado } from "./grado";
import type { Secuencia } from "./secuencia";

export interface Grupo extends BaseModel{
    nombre: string;
    year: number;
    url_image: string;
    esMultiGrado: boolean;
    grados: Grado[];
}

export interface CreateOrUpdateGrupoDTO{
    esMultiGrado: boolean;
    grados: Grado[] | Grado; 
    nombre: string;
    year: number;
    logo?: File;
}

export interface SecuenciaRelacionadaAGrupo {
    secuenciasDelGrupo: Secuencia[]
    secuenciasCompatibles: Secuencia[]
}