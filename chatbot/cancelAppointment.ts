import { PatientState, TrxOrDb } from '../types.ts'
import { assert } from 'std/testing/asserts.ts'
import * as google from '../external-clients/google.ts'
import { getWithTokensById } from '../db/models/health_workers.ts'
import { deleteAppointment } from '../db/models/appointments.ts'

// This should remove the scheduled appointment from the database and from google calendar
export async function cancelAppointment(
  trx: TrxOrDb,
  patientState: PatientState,
): Promise<PatientState> {
  assert(
    patientState.scheduling_appointment_id,
    'No scheduling_appointment_id found in patientState',
  )
  await deleteAppointment(trx, patientState.scheduling_appointment_id)

  const acceptedTime = patientState.appointment_offered_times.find((aot) =>
    !aot.patient_declined
  )

  assert(acceptedTime, 'No acceptedTime found')
  assert(
    acceptedTime.health_worker_id,
    'No health_worker_id found',
  )

  const eventID = acceptedTime.scheduled_gcal_event_id

  const matchingHealthWorker = await getWithTokensById(
    trx,
    acceptedTime.health_worker_id,
  )

  assert(
    matchingHealthWorker,
    `No health_worker session found for health_worker_id ${acceptedTime.health_worker_id}`,
  )
  assert(
    matchingHealthWorker.gcal_appointments_calendar_id,
    `No gcal_appointments_calendar_id found for health_worker_id ${acceptedTime.health_worker_id}`,
  )

  const healthWorkerGoogleClient = new google.GoogleClient(matchingHealthWorker)
  console.log(
    'deleting events, matching health_worker:',
    matchingHealthWorker.gcal_availability_calendar_id,
  )
  await healthWorkerGoogleClient.deleteEvent(
    matchingHealthWorker.gcal_appointments_calendar_id,
    eventID,
  )

  return {
    ...patientState,
    appointment_offered_times: [],
    scheduling_appointment_id: undefined,
    scheduling_appointment_reason: undefined,
    scheduling_appointment_status: undefined,
  }
}
