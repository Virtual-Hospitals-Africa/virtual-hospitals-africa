import { assert, assertEquals } from "std/testing/asserts.ts";
import { formatHarare } from "../util/date.ts";
import * as google from "../external-clients/google.ts";
import { getAllWithTokens } from "../models/doctors.ts";
import * as appointments from "../models/appointments.ts";
import {
  AppointmentOfferedTime,
  DeepPartial,
  GCalEvent,
  ReturnedSqlRow,
  TrxOrDb,
  UnhandledPatientMessage,
} from "../types.ts";

export function appointmentDetails(
  patientMessage: UnhandledPatientMessage,
): {
  offeredTime: ReturnedSqlRow<
    AppointmentOfferedTime & {
      doctor_name: string;
    }
  >;
  gcal: DeepPartial<GCalEvent>;
} {
  assert(
    patientMessage.appointment_offered_times,
    "No appointment_offered_times found in patientMessage",
  );
  assertEquals(
    patientMessage.appointment_offered_times.length,
    1,
    "More than one appointment_offered_times not yet supported",
  );
  assert(
    patientMessage.appointment_offered_times[0],
    "No appointment_offered_times found in patientMessage",
  );
  assert(
    !patientMessage.appointment_offered_times[0].patient_declined,
    "Patient rejected offered appointment time",
  );

  const offeredTime = patientMessage.appointment_offered_times[0];

  const end = new Date(offeredTime.start);
  end.setMinutes(end.getMinutes() + 30);

  return {
    offeredTime,
    gcal: {
      summary: `Appointment with ${patientMessage.name}`,
      start: {
        dateTime: offeredTime.start,
      },
      end: {
        dateTime: formatHarare(end),
      },
    },
  };
}

export async function makeAppointment(
  trx: TrxOrDb,
  patientMessage: UnhandledPatientMessage,
): Promise<UnhandledPatientMessage> {
  assertEquals(
    patientMessage.conversation_state,
    "onboarded:appointment_scheduled",
    "Only onboarded:appointment_scheduled patients supported for now",
  );
  assert(
    patientMessage.scheduling_appointment_id,
    "No scheduling_appointment_id found in patientMessage",
  );
  assert(
    patientMessage.scheduling_appointment_reason,
    "No scheduling_appointment_reason found in patientMessage",
  );

  const details = appointmentDetails(patientMessage);
  console.log("appointment details", JSON.stringify(details));

  const { offeredTime, gcal } = details;
  const doctors = await getAllWithTokens(trx);

  const matchingDoctor = doctors.find((doctor) =>
    doctor.id === offeredTime.doctor_id
  );

  assert(
    offeredTime.doctor_id,
    "No doctor_id found",
  );
  assert(
    matchingDoctor,
    `No doctor session found for doctor_id ${offeredTime.doctor_id}`,
  );
  assert(
    matchingDoctor.gcal_appointments_calendar_id,
    `No gcal_appointments_calendar_id found for doctor_id ${offeredTime.doctor_id}`,
  );

  const doctorGoogleClient = new google.DoctorGoogleClient(matchingDoctor);

  const end = new Date(offeredTime.start);
  end.setMinutes(end.getMinutes() + 30);

  const insertedEvent = await doctorGoogleClient.insertEvent(
    matchingDoctor.gcal_appointments_calendar_id,
    gcal,
  );

  await appointments.schedule(trx, {
    appointment_offered_time_id: offeredTime.id,
    scheduled_gcal_event_id: insertedEvent.id,
  });

  return {
    ...patientMessage,
    appointment_offered_times: [{
      ...offeredTime,
      scheduled_gcal_event_id: insertedEvent.id,
    }],
  };
}
