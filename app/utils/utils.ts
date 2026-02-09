
import { format, addDays, isBefore } from 'date-fns';

export function convertDateStrToDateLocal(fechaStr : string) : Date {

    const [year, month, day] = fechaStr.split('-').map(Number);
    
    const fecha = new Date(year, month - 1, day);

    return fecha;
}

export function getArrayDatesStrBetweenDates(from: Date, to: Date): string[] {

    const dates: string[] = [];
    let currentDate = from;

    while (isBefore(currentDate, addDays(to, 1))) {
        dates.push(format(currentDate, 'yyyy-MM-dd')); 
        currentDate = addDays(currentDate, 1);
    }

    return dates;
}

export const getColorBadgeComponente = (rgbColor: string) : any=>{
    let result: string;

    switch(rgbColor){
        case "#d71634":
            result = "error";
            break;
        case "#8bc63e":
            result = "success"
            break;
        case "#e8b809":
            result = "warning"
            break;
        case "#ed028c":
            result = "error"
            break;
        case "#90268f":
            result = "error"
            break;
        case "#f7931d":
            result = "warning"
            break;
        case "#015ca3":
            result = "info"
            break;
        default:
            result = "secondary"
            break;
    }

    return result;
}


export function downloadBlob(blob: Blob, nombreArchivo: string) {

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo;
    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

