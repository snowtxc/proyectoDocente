export interface SendTextPrompt {
    promptUsedId : number;
    instruction: string;
}

export interface FlopiBotGeneracionPlanRequest {
  grados: string[];
  contexto_adicional?: string;
  opciones_generacion: OpcionesGeneracion;
  datos_planificacion: DatosPlanificacion;
}

export interface OpcionesGeneracion {
  generar_meta: boolean;
  generar_plan: boolean;
}

export interface DatosPlanificacion {
  espacio: string;
  unidad_curricular: string;
  contenido: string;
  competencias_generales: string[];
  competencias_especificas:  string[],
  criterios_logro: string[];
}

// Response (output que devuelve FlopiBot)
export interface GeneracionPlanResponse {
  meta?: string;
  plan?: string
}

