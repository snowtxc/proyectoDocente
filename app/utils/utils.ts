
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
            result = "red";
            break;
        case "#8bc63e":
            result = "green"
            break;
        case "#e8b809":
            result = ""
            break;
        case "#ed028c":
            result = ""
            break;
        case "#90268f":
            result = ""
            break;
        case "#f7931d":
            result = ""
            break;
        case "#015ca3":
            result = ""
            break;
        default:
            result = "gray"
            break;
    }

    return result;
}