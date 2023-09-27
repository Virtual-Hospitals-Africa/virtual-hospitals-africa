import { assert } from 'std/assert/assert.ts'
import { PatientState, TrxOrDb } from '../types.ts'
import * as google from '../external-clients/google.ts'
import { getWithTokensById } from '../db/models/health_workers.ts'
import { remove } from '../db/models/appointments.ts'

// This should remove the scheduled appointment from the database and from google calendar
export async function cancelAppointment(
  trx: TrxOrDb,
  patientState: PatientState,
): Promise<PatientState> {
  assert(
    patientState.scheduled_appointment,
    'No scheduling_appointment_id found in patientState',
  )
  await remove(trx, patientState.scheduled_appointment.id)

  const matchingHealthWorker = await getWithTokensById(
    trx,
    patientState.scheduled_appointment.health_worker_id,
  )

  assert(
    matchingHealthWorker,
    `No health_worker session found for health_worker_id ${patientState.scheduled_appointment.health_worker_id}`,
  )
  assert(
    matchingHealthWorker.gcal_appointments_calendar_id,
    `No gcal_appointments_calendar_id found for health_worker_id ${patientState.scheduled_appointment.health_worker_id}`,
  )

  const healthWorkerGoogleClient = new google.GoogleClient(matchingHealthWorker)
  console.log(
    'deleting events, matching health_worker:',
    matchingHealthWorker.gcal_availability_calendar_id,
  )
  await healthWorkerGoogleClient.deleteEvent(
    matchingHealthWorker.gcal_appointments_calendar_id,
    patientState.scheduled_appointment.gcal_event_id,
  )

  return {
    ...patientState,
    scheduled_appointment: undefined,
  }
}
