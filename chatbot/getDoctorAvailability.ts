import * as google from "../external-clients/google.ts";
import { getAllWithExtantTokens } from "../db/models/doctors.ts";
import {
  Availability,
  DoctorWithGoogleTokens,
  GCalFreeBusy,
  ReturnedSqlRow,
  TimeRange,
  TrxOrDb,
} from "../types.ts";
import { assertAllHarare, formatHarare } from "../util/date.ts";

export function getAvailability(
  doctor: {
    gcal_availability_calendar_id: string;
    gcal_appointments_calendar_id: string;
  },
  freeBusy: GCalFreeBusy,
): Availability {
  const availability = [
    ...freeBusy.calendars[doctor.gcal_availability_calendar_id].busy,
  ];

  const appointments =
    freeBusy.calendars[doctor.gcal_appointments_calendar_id].busy;

  appointments.forEach((appointment) => {
    const conflictIndex = availability.findIndex((availabilityBlock) =>
      (
        appointment.start >= availabilityBlock.start &&
        appointment.start < availabilityBlock.end
      ) || (
        appointment.end > availabilityBlock.start &&
        appointment.end <= availabilityBlock.end
      )
    );

    if (conflictIndex === -1) return;

    const conflict = availability[conflictIndex];

    let spliceWith: Availability;

    if (
      conflict.start === appointment.start && conflict.end === appointment.end
    ) {
      spliceWith = [];
    } else if (conflict.start === appointment.start) {
      spliceWith = [{
        start: appointment.end,
        end: conflict.end,
      }];
    } else if (conflict.end === appointment.end) {
      spliceWith = [{
        start: conflict.start,
        end: appointment.start,
      }];
      return;
    } else {
      spliceWith = [{
        start: conflict.start,
        end: appointment.start,
      }, {
        start: appointment.end,
        end: conflict.end,
      }];
    }

    availability.splice(conflictIndex, 1, ...spliceWith);
  });

  return availability;
}

// Leave doctor 2 hours to be able to confirm the appointment
export function defaultTimeRange(): TimeRange {
  const timeMin = new Date();
  timeMin.setHours(timeMin.getHours() + 2);
  const timeMax = new Date(timeMin);
  timeMax.setDate(timeMin.getDate() + 7);
  return { timeMin, timeMax };
}

export async function allUniqueAvailbaility(trx: TrxOrDb) {
  const allDoctorAvailabilities = await getAllAvailability(trx);

  const allAvailabilities = Array.from(
    new Set(
      allDoctorAvailabilities.flatMap((availability) =>
        availability.map(({ start }) => start)
      ),
    ),
  );
  const uniqueAvailbilites = allAvailabilities.filter((item, index) =>
    allAvailabilities.indexOf(item) === index
  );
  return uniqueAvailbilites;
}

async function getAllAvailability(
  trx: TrxOrDb,
  timeRange: TimeRange = defaultTimeRange(),
) {
  const doctors = await getAllWithExtantTokens(trx);
  return Promise.all(doctors.map(async (doctor) => {
    const doctorGoogleClient = new google.DoctorGoogleClient(doctor);
    const freeBusy = await doctorGoogleClient.getFreeBusy({
      ...timeRange,
      calendarIds: [
        doctor.gcal_appointments_calendar_id,
        doctor.gcal_availability_calendar_id,
      ],
    });
    return getAvailability(doctor, freeBusy);
  }));
}

export async function getAllDoctorAvailability(
  trx: TrxOrDb,
  timeRange: TimeRange = defaultTimeRange(),
) {
  const doctors = await getAllWithExtantTokens(trx);
  return Promise.all(doctors.map(async (doctor) => {
    const doctorGoogleClient = new google.DoctorGoogleClient(doctor);
    const freeBusy = await doctorGoogleClient.getFreeBusy({
      ...timeRange,
      calendarIds: [
        doctor.gcal_appointments_calendar_id,
        doctor.gcal_availability_calendar_id,
      ],
    });
    return {
      doctor,
      availability: getAvailability(doctor, freeBusy),
    };
  }));
}


/**
 * Gets doctor availability from google calenda, spilt them into 30 minutes block, and filter out
 * the declined time and return an object containing the start time and doctor.
 * @param trx db transaction object
 * @param declinedTimes a string array that contains the declined time slot
 * @param opts date: specify a date to see appointments on that date
 * @returns an object containing the start time and doctor
 */

export async function availableThirtyMinutes(trx: TrxOrDb, declinedTimes: string[], 
  opts: {date: string | null, timeslots_required: number}
): Promise<{
  doctor: ReturnedSqlRow<DoctorWithGoogleTokens>;
  start: string;
}[]> {
  assertAllHarare(declinedTimes)
  const doctorAvailability = await getAllDoctorAvailability(trx);

  let appointments: {doctor: DoctorWithGoogleTokens, start: string}[]
  appointments = []
  for (const { doctor, availability } of doctorAvailability) {
    for (const { start, end } of availability) {
      const doctor_appointments = generateAvailableThrityMinutes(start,end)
      .filter(time => !declinedTimes.includes(time))
      .filter(appointment => opts.date? appointment.includes(opts.date): true)
      .map(timeBlock => ({doctor: doctor, start: timeBlock}))
      appointments = appointments.concat(doctor_appointments)
    }
  }
  appointments.sort((a,b) => new Date(a.start).valueOf() - new Date(b.start).valueOf())
  const key = 'start';
  const uniqueAppointmentTimeslots = [...new Map(appointments.map(timeBlock => [timeBlock[key], timeBlock])).values()]

  console.log("Unique appointments by date", uniqueAppointmentTimeslots)

  if (uniqueAppointmentTimeslots.length === 0) throw new Error("No availability found");

  const requiredTimeslots = uniqueAppointmentTimeslots.length > opts.timeslots_required 
  ? uniqueAppointmentTimeslots.slice(0,opts.timeslots_required) 
  : uniqueAppointmentTimeslots
  
  return requiredTimeslots;
}

function generateAvailableThrityMinutes(start: string, end: string):
string[]{
  const appointments = []
  const appointmentDuration = 30 * 60 * 1000; // duration of each appointment in milliseconds
  const current = new Date(start);
  current.setMinutes(Math.ceil(current.getMinutes() / 30) * 30); //0 or 30
  current.setSeconds(0);
  current.setMilliseconds(0);

  while (current.getTime() + appointmentDuration <= new Date(end).getTime()) {
    const currentDate = formatHarare(current) 
    appointments.push(currentDate)
    current.setTime(current.getTime() + appointmentDuration);
  }
  return appointments

}
