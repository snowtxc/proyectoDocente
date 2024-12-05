import { EstadoType } from "~/types";

export const formattedImageUrlGrupo = (image_url: any) => {
    let url = image_url?.replace(/\\/g, '');
    if (url && url.startsWith('/')) {
        url = url.slice(1);
    }
    return url;
};

export const getColorsEstado = (estado: string): string => {
    if (estado == EstadoType.Finalizada) {
        return `green`
    } else if (estado === EstadoType.EnCurso) {
        return `orange`
    } else {
        return `blue`
    }
};
