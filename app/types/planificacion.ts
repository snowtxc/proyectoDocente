import type { PlanificacionEstadoEnum } from "~/utils/enums/PlanificacionEstado.enum";
import type { EstadoType } from "../types";
import type { Grupo } from "./grupo";
import type { BaseModel } from "./base.model";
import type { SimplePlanificacionFecha } from "./planificacionFecha";

export interface CreatePlanificacionDTO {
  groupId: any;
  name: string;
}

type Grado = {
  id: number;
  nombre: string;
  ciclo_grado_id: number;
  created_at: string | null;
  updated_at: string | null;
};

export type Planificacion = {
  id: number;
  nombre: string;
  grupo_id: number;
  user_id: number;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  estado: PlanificacionEstadoEnum;
  grados: Grado[];
  grupo: Grupo;
  tramos: number;
  slug: string;
  fechas: SimplePlanificacionFecha[];
  last_planning_access_at?: Date;
};
