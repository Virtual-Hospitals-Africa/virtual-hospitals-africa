import { TrxOrDb, UnhandledPatientMessage } from "../types.ts";
import { assert } from "std/testing/asserts.ts";
import * as google from "../external-clients/google.ts";
import { getWithTokensById } from "../db/models/doctors.ts";
import { appointmentDetails } from "./makeAppointment.ts";

// This should remove the scheduled appointment from the database and from google calendar
export async function cancelAppointment(
  trx: TrxOrDb,
  patientMessage: UnhandledPatientMessage,
): Promise<UnhandledPatientMessage> {
  assert(
    patientMessage.scheduling_appointment_id,
    "No scheduling_appointment_id found in patientMessage",
  );
  await trx.deleteFrom("appointments")
    .where("id", "=", patientMessage.scheduling_appointment_id)
    .execute();

  const details = appointmentDetails(patientMessage);
  const { offeredTime } = details;
  const eventID = offeredTime.scheduled_gcal_event_id;

  const matchingDoctor = await getWithTokensById(trx, offeredTime.doctor_id);
  console.log("get with tokens by id", matchingDoctor);
  // const doctors = await getAllWithTokens(trx);
  // const matchingDoctor = doctors.find(doctor => doctor.id === offeredTime.doctor_id);

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
  console.log(
    "deleting events, matching doctor:",
    matchingDoctor.gcal_availability_calendar_id,
  );
  await doctorGoogleClient.deleteEvent(
    matchingDoctor.gcal_appointments_calendar_id,
    eventID,
  );

  return {
    ...patientMessage,
    appointment_offered_times: [],
    scheduling_appointment_id: undefined,
  };
}
