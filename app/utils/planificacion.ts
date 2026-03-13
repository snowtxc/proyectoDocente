export const formattedImageUrlGrupo = (image_url: any) => {
    let url = image_url?.replace(/\\/g, '');
    if (url && url.startsWith('/')) {
        url = url.slice(1);
    }
    return url;
};


