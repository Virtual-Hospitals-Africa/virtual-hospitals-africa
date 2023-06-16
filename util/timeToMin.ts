import { Time } from "../types.ts";

export default function timeToMin(time : Time) : number
{
    let minutes : number = time.hour*60 + time.minute;
    if (time.amPm == "pm") minutes += (12*60);
    return minutes;
}