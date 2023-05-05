import * as google from "../external-clients/google.ts";
import { getAllWithExtantTokens } from "../models/doctors.ts";
import {
  Availability,
  DoctorWithGoogleTokens,
  GCalFreeBusy,
  ReturnedSqlRow,
  TimeRange,
  TrxOrDb,
} from "../types.ts";
import { formatHarare } from "../util/date.ts";

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

export async function getAllDoctorAvailability(
  trx: TrxOrDb,
  timeRange: TimeRange = defaultTimeRange(),
) {
  const doctors = await getAllWithExtantTokens(trx);
  return Promise.all(doctors.map(async (doctor) => {
    const doctorGoogleAgent = new google.Agent(doctor);
    const freeBusy = await doctorGoogleAgent.getFreeBusy({
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

export async function firstAvailableThirtyMinutes(trx: TrxOrDb): Promise<{
  doctor: ReturnedSqlRow<DoctorWithGoogleTokens>;
  start: string;
}> {
  const doctorAvailability = await getAllDoctorAvailability(trx);

  let earliestAvailabilityDoctor: DoctorWithGoogleTokens | null = null;
  let earliestAvailabilityStart = "9999-99-99T23:59:59+02:00";

  for (const { doctor, availability } of doctorAvailability) {
    for (const { start, end } of availability) {
      const minutesBetween =
        (new Date(end).getTime() - new Date(start).getTime()) / 1000 / 60;
      if (minutesBetween < 30) continue;
      if (start < earliestAvailabilityStart) {
        earliestAvailabilityDoctor = doctor;
        earliestAvailabilityStart = start;
      }
    }
  }

  if (!earliestAvailabilityDoctor) throw new Error("No availability found");

  return {
    doctor: earliestAvailabilityDoctor,
    start: earliestAvailabilityStart,
  };
}

export async function generateAvailableTime(trx: TrxOrDb){
  console.log('doctor timessss')
  const doctorAvailability = await getAllDoctorAvailability(trx);
  
  console.log(doctorAvailability)

}

/**
 * Given a date, return the earliest available time on that date. 
 */
export async function getAvailableTimeFromDate(trx: TrxOrDb, date: Date): Promise<{
  doctor: ReturnedSqlRow<DoctorWithGoogleTokens>;
  start: string;
}> {
  const doctorAvailability = await getAllDoctorAvailability(trx);

  let earliestAvailabilityDoctor: DoctorWithGoogleTokens | null = null;
  let earliestAvailabilityStart = "9999-99-99T23:59:59+02:00";

  for (const { doctor, availability } of doctorAvailability) {
    for (const { start, end } of availability) {
      if (new Date(start).toISOString().startsWith(date.toISOString())) {
        const minutesBetween =
          (new Date(end).getTime() - new Date(start).getTime()) / 1000 / 60;
        if (minutesBetween < 30) continue;
        if (start < earliestAvailabilityStart) {
          earliestAvailabilityDoctor = doctor;
          earliestAvailabilityStart = start;
        }
      }
    }
  }
  if (!earliestAvailabilityDoctor) throw new Error("No availability found");

  return {
    doctor: earliestAvailabilityDoctor,
    start: earliestAvailabilityStart,
  };

}

// align a list of declined time and filter it out from all availability time from doctor.
export async function filterDoctorAvailability(trx: TrxOrDb,
  declinedTime: string[]): Promise<{
    doctor:ReturnedSqlRow<DoctorWithGoogleTokens>;
    start: string;
  }> {
    const declinedTimesAligned = declinedTime.map(time => {
      const date = new Date(time);
      const minutes = date.getMinutes();
      const alignedMinutes = minutes < 30 ? 0 : 30;
      date.setMinutes(alignedMinutes)
      date.setSeconds(0);
      return formatHarare(date);
    });

    console.log('aligned', declinedTimesAligned)

    
    const doctorsAvailability = await getAllDoctorAvailability(trx);

    const appointmentDuration = 30 * 60 * 1000; // duration of each appointment in milliseconds

const appointments = [];

for (const {doctor, availability} of doctorsAvailability) {

  for (const availableTime of availability) {
    const { start, end } = availableTime;

    const current = new Date(start);

    // set the current time to the beginning of the next half-hour
    current.setMinutes(Math.ceil(current.getMinutes() / 30) * 30); //0 or 30
    current.setSeconds(0);
    current.setMilliseconds(0);

    // iterate over all half-hour intervals between start and end times
    while (current.getTime() + appointmentDuration <= new Date(end).getTime()) {
      // const currentDate = new Date(current).toISOString()
      const currentDate = formatHarare(current)
      if (!declinedTimesAligned.includes(currentDate)){
        appointments.push({
          doctor: doctor,
          start: currentDate
        })
      }

      // increment the current time by the appointment duration
      current.setTime(current.getTime() + appointmentDuration);
    }
  }
}
  // console.log('all avialable', appointments)
  return appointments[0]
  }



