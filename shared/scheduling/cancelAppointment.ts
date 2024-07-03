import { assert } from 'std/assert/assert.ts'
import { PatientChatbotUserState, TrxOrDb } from '../../types.ts'
import * as google from '../../external-clients/google.ts'
import * as patients from '../../db/models/patients.ts'
import { get } from '../../db/models/providers.ts'
import { remove } from '../../db/models/appointments.ts'

// This should remove the scheduled appointment from the database and from google calendar
export async function cancelAppointment(
  trx: TrxOrDb,
  patientState: PatientChatbotUserState,
) {
  assert(patientState.entity_id, 'No entity_id found in patientState')
  const scheduled_appointments = await patients.scheduledAppointments(
    trx,
    patientState.entity_id,
  )
  const scheduled_appointment = scheduled_appointments[0]
  assert(
    scheduled_appointment,
    'No scheduling_appointment_id found in patientState',
  )
  await remove(trx, scheduled_appointment.id)

  const matchingProvider = await get(
    trx,
    scheduled_appointment.provider_id,
  )

  const healthWorkerGoogleClient = new google.GoogleClient(matchingProvider)
  await healthWorkerGoogleClient.deleteEvent(
    matchingProvider.gcal_appointments_calendar_id,
    scheduled_appointment.gcal_event_id,
  )
}
