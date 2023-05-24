import { TrxOrDb, UnhandledPatientMessage } from '../types.ts'
import { assert } from 'std/testing/asserts.ts'
import * as google from '../external-clients/google.ts'
import { getWithTokensById } from '../db/models/doctors.ts'
import { deleteAppointment } from '../db/models/appointments.ts'

// This should remove the scheduled appointment from the database and from google calendar
export async function cancelAppointment(
  trx: TrxOrDb,
  patientMessage: UnhandledPatientMessage,
): Promise<UnhandledPatientMessage> {
  assert(
    patientMessage.scheduling_appointment_id,
    'No scheduling_appointment_id found in patientMessage',
  )
  await deleteAppointment(trx, patientMessage.scheduling_appointment_id)

  const acceptedTime = patientMessage.appointment_offered_times.find((aot) =>
    !aot.patient_declined
  )

  assert(acceptedTime, 'No acceptedTime found')
  assert(
    acceptedTime.doctor_id,
    'No doctor_id found',
  )

  const eventID = acceptedTime.scheduled_gcal_event_id

  const matchingDoctor = await getWithTokensById(trx, acceptedTime.doctor_id)

  assert(
    matchingDoctor,
    `No doctor session found for doctor_id ${acceptedTime.doctor_id}`,
  )
  assert(
    matchingDoctor.gcal_appointments_calendar_id,
    `No gcal_appointments_calendar_id found for doctor_id ${acceptedTime.doctor_id}`,
  )

  const doctorGoogleClient = new google.GoogleClient(matchingDoctor)
  console.log(
    'deleting events, matching doctor:',
    matchingDoctor.gcal_availability_calendar_id,
  )
  await doctorGoogleClient.deleteEvent(
    matchingDoctor.gcal_appointments_calendar_id,
    eventID,
  )

  return {
    ...patientMessage,
    appointment_offered_times: [],
    scheduling_appointment_id: undefined,
    scheduling_appointment_reason: undefined,
  }
}
