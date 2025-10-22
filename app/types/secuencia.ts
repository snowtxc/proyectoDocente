import type { BaseModel } from "./base.model";
import type { Contenido } from "./contenido";
import type { Grupo } from "./grupo";

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
};