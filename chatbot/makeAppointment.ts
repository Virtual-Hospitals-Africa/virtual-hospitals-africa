import { assert, assertEquals } from "std/testing/asserts.ts";
import { formatHarare } from "../util/date.ts";
import * as google from "../external-clients/google.ts";
import { getAllWithTokens } from "../models/doctors.ts";
import * as appointments from "../models/appointments.ts";
import { UnhandledPatientMessage } from "../types.ts";

export async function makeAppointment(
  patientMessage: UnhandledPatientMessage,
): Promise<UnhandledPatientMessage> {
  assert(
    patientMessage.scheduling_appointment_id,
    "No scheduling_appointment_id found in patientMessage",
  );
  assert(
    patientMessage.scheduling_appointment_reason,
    "No scheduling_appointment_reason found in patientMessage",
  );
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
  assert(
    patientMessage.appointment_offered_times[0].doctor_id,
    "No doctor_id found",
  );

  const offeredTime = patientMessage.appointment_offered_times[0];

  const doctors = await getAllWithTokens();

  const matchingDoctor = doctors.find((doctor) =>
    doctor.id === offeredTime.doctor_id
  );

  // TODO: this can easily fail before we fix needing to look up all sessions
  assert(
    matchingDoctor,
    `No doctor session found for doctor_id ${offeredTime.doctor_id}`,
  );
  assert(
    matchingDoctor.gcal_appointments_calendar_id,
    `No gcal_appointments_calendar_id found for doctor_id ${offeredTime.doctor_id}`,
  );

  const doctorGoogleAgent = new google.Agent(matchingDoctor);

  const end = new Date(offeredTime.start);
  end.setMinutes(end.getMinutes() + 30);

  const insertedEvent = await doctorGoogleAgent.insertEvent(
    matchingDoctor.gcal_appointments_calendar_id,
    {
      summary: `Appointment with ${patientMessage.name}`,
      start: {
        dateTime: offeredTime.start,
      },
      end: {
        dateTime: formatHarare(end),
      },
      // organizer: {
      //   email: 'hgatorganizer@gmail.com'
      // },
      // attendees: [
      //   {
      //     email: 'hgatorganizer@gmail.com',
      //     responseStatus: 'accepted'
      //   }
      // ]
    },
  );

  await appointments.schedule({
    appointment_offered_time_id: offeredTime.id,
    scheduled_gcal_event_id: insertedEvent.id,
  });

  return {
    ...patientMessage,
    appointment_offered_times: [{
      ...patientMessage.appointment_offered_times[0],
    }],
  };
}
