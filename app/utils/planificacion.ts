import { EstadoType } from "~/types";
import { PlanificacionEstadoEnum } from "./enums/PlanificacionEstado.enum";

export const formattedImageUrlGrupo = (image_url: any) => {
    let url = image_url?.replace(/\\/g, '');
    if (url && url.startsWith('/')) {
        url = url.slice(1);
    }
    return url;
};

export const getColorsEstado = (estado: PlanificacionEstadoEnum): string => {
    if (estado == PlanificacionEstadoEnum.FINALIZADA) {
        return `green`
    } else if (estado == PlanificacionEstadoEnum.EN_CURSO) {
        return `orange`
    } else {
        return `blue`
    }
};
