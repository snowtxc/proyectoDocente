import type { Grupo } from '~/types/grupo'

// Logo de marca que se usa cuando un grupo no tiene imagen propia.
export const DEFAULT_GRUPO_LOGO = '/logo.png'

export const formattedImageUrlGrupo = (image_url: any) => {
    let url = image_url?.replace(/\\/g, '');
    if (url && url.startsWith('/')) {
        url = url.slice(1);
    }
    return url;
};

// Devuelve la imagen del grupo o, si no tiene, el logo por defecto.
export const grupoImagen = (grupo?: Pick<Grupo, 'url_image'> | null): string => {
  const url = formattedImageUrlGrupo(grupo?.url_image)
  return url && url.trim() !== '' ? url : DEFAULT_GRUPO_LOGO
}
