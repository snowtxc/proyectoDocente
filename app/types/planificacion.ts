import type { EstadoType } from ".";

export interface CreatePlanificacionDTO {
  groupId: any;
  name: string;
  startDate: string;
  endDate: string;
}

type Grado = {
  id: number;
  nombre: string;
  ciclo_grado_id: number;
  created_at: string | null;
  updated_at: string | null;
};

type Grupo = {
  id: number;
  nombre: string;
  esMultiGrado: boolean;
  year: number;
  created_at: string | null;
  updated_at: string | null;
  url_image: string;
  grados: Grado[];
};

export type Planificacion = {
  id: number;
  nombre: string;
  fechaDesde: string;
  fechaHasta: string;
  grupo_id: number;
  user_id: number;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  estado: EstadoType;
  grados: Grado[];
  grupo: Grupo;
  tramos: number;
};
