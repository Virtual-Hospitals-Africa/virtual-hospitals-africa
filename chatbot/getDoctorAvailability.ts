import * as google from "../external-clients/google.ts";
import { assert } from "std/testing/asserts.ts";
import { getAllWithExtantTokens } from "../models/doctors.ts";
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

export async function firstAvailableThirtyMinutes(trx: TrxOrDb, declinedTimes: string[]): Promise<{
  doctor: ReturnedSqlRow<DoctorWithGoogleTokens>;
  start: string;
}> {
  assertAllHarare(declinedTimes)

  const doctorAvailability = await getAllDoctorAvailability(trx);

  let earliestAvailabilityDoctor: DoctorWithGoogleTokens | null = null;
  let earliestAvailabilityStart = "9999-99-99T23:59:59+02:00";

  /*
    declinedTimes ["2023-05-09T09:30:00+02:00", "2023-05-10T09:00:00+02:00"]
    availability [
      { start: "2023-05-09T09:30:00+02:00", end: "2023-05-09T17:00:00+02:00" },
      { start: "2023-05-10T09:00:00+02:00", end: "2023-05-10T17:00:00+02:00" },
      { start: "2023-05-11T09:00:00+02:00", end: "2023-05-11T17:00:00+02:00" },
      { start: "2023-05-12T09:00:00+02:00", end: "2023-05-12T17:00:00+02:00" },
      { start: "2023-05-15T09:00:00+02:00", end: "2023-05-15T17:00:00+02:00" }
    ]
  */

  for (const { doctor, availability } of doctorAvailability) {
    const appointments = []
    const appointmentDuration = 30 * 60 * 1000; // duration of each appointment in milliseconds

    console.log('availability', availability)
    for (const { start, end } of availability) {
      const current = new Date(start)
      current.setMinutes(Math.ceil(current.getMinutes() / 30) * 30); //0 or 30
      current.setSeconds(0);
      current.setMilliseconds(0);


      while (current.getTime() + appointmentDuration <= new Date(end).getTime()) {
        const currentDate = formatHarare(current) 
        console.log('currentDate', currentDate)
        if (!declinedTimes.includes(currentDate)){
          appointments.push({
            doctor: doctor,
            start: currentDate
          })
        }
        current.setTime(current.getTime() + appointmentDuration);
      }
      // const minutesBetween =
      //   (new Date(end).getTime() - new Date(start).getTime()) / 1000 / 60;
      // if (minutesBetween < 30) continue;
      // if (declinedTimes.some(time => start <= time && time < end)) continue;
      if (start < earliestAvailabilityStart) {
        earliestAvailabilityDoctor = appointments[0].doctor;
        earliestAvailabilityStart = appointments[0].start;
      }
    }
  }

  if (!earliestAvailabilityDoctor) throw new Error("No availability found");

  return {
    doctor: earliestAvailabilityDoctor,
    start: earliestAvailabilityStart,
  };
}
