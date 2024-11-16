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
        return `ring-2 bg-opacity-10 bg-green-500 text-green-600 ring-green-500`
    } else if (estado === EstadoType.EnCurso) {
        return `ring-2 bg-opacity-10 bg-yellow-500 text-yellow-600 ring-yellow-500`
    } else {
        return `ring-2 bg-opacity-10 bg-blue-500 text-blue-600 ring-blue-500`
    }
};
