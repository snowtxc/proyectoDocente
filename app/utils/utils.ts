
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