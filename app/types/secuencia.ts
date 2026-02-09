import type { Actividad } from "./actividad";
import type { ActividadSecuencia } from "./actividadSecuencia";
import type { BaseModel } from "./base.model";
import type { CompetenciaEspecifica, CompetenciaGeneral } from "./competenciaEspecifica";
import type { Contenido } from "./contenido";
import type { CriterioDeLogro } from "./criterioDeLogro";
import type { Espacio } from "./espacio";
import type { Grupo } from "./grupo";
import type { UnidadCurricular } from "./unidadCurricular";

export interface CreateSecuenciaDTO {
  groupId: any;
  name: string;
  espacio_id?: number;
  unidad_curricular_id? : number;
}

export interface Secuencia  extends BaseModel {
  nombre: string;
  contenido_id : number;
  contenido: Contenido;
  fundamentacion?: string;
  bibliografia?: string;
  metaGeneral?: string;
  slug: string;
  grupo_id: number;
  grupo: Grupo;
  espacio_id? : number;
  espacio? : Espacio;
  unidad_curricular_id? : number;
  unidad_curricular?: UnidadCurricular;
  actividades_secuencia: ActividadSecuencia[]
  criterios_de_logros: CriterioDeLogro[],
  competencias_generales: CompetenciaGeneral[]
  competencias_especificas: CompetenciaEspecifica[]
  detallaRecursos?: boolean
  recursos?: string;
  detallaMetodologia? : boolean;
  metodologia?: string;
  detallaDuracion?: boolean;
  duracion?: string;
  detallaEvaluacion?: boolean;
  evaluacion? : string;
};