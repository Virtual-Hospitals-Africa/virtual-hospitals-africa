import { assert } from 'std/assert/assert.ts'
import { PatientState, TrxOrDb } from '../../types.ts'
import * as google from '../../external-clients/google.ts'
import { get } from '../../db/models/providers.ts'
import { remove } from '../../db/models/appointments.ts'

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

  const matchingProvider = await get(
    trx,
    patientState.scheduled_appointment.provider_id,
  )

  const healthWorkerGoogleClient = new google.GoogleClient(matchingProvider)
  await healthWorkerGoogleClient.deleteEvent(
    matchingProvider.gcal_appointments_calendar_id,
    patientState.scheduled_appointment.gcal_event_id,
  )

  return {
    ...patientState,
    scheduled_appointment: undefined,
  }
}
