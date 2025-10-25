import type { BaseModel } from "./base.model";
import type { Contenido } from "./contenido";
import type { Espacio } from "./espacio";
import type { Grupo } from "./grupo";
import type { UnidadCurricular } from "./unidadCurricular";

export interface CreateSecuenciaDTO {
  groupId: any;
  name: string;
}

export interface Secuencia  extends BaseModel {
  id: number;
  nombre: string;
  contenido_id : number;
  contenido: Contenido;
  fundamentacion?: string;
  bibliografia?: string;
  slug: string;
  grupo_id: number;
  grupo: Grupo;
  espacio_id? : number;
  espacio? : Espacio;
  unidad_curricular_id? : number;
  unidad_curricular?: UnidadCurricular;
};