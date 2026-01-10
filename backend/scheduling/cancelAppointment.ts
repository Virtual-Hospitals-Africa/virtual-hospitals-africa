import { assert } from 'std/assert/assert.ts'
import { PatientChatbotUserState, TrxOrDb } from '../../types.ts'
import * as google from '../../external-clients/google.ts'
import { scheduledAppointments } from '../../db/models/patient_appointments.ts'
import { getById } from '../../db/models/employees.ts'
import { employment_calendars } from '../../db/models/employment_calendars.ts'
import { google_tokens } from '../../db/models/google_tokens.ts'
import { remove } from '../../db/models/appointments.ts'
import { assertOr401 } from '../../util/assertOr.ts'

// This should remove the scheduled appointment from the database and from google calendar
export async function cancelAppointment(
  trx: TrxOrDb,
  patientState: PatientChatbotUserState,
) {
  assert(
    patientState.chatbot_user.entity_id,
    'No entity_id found in patientState',
  )
  const scheduled_appointments = await scheduledAppointments(
    trx,
    patientState.chatbot_user.entity_id,
  )
  const scheduled_appointment = scheduled_appointments[0]
  assert(
    scheduled_appointment,
    'No scheduling_appointment_id found in patientState',
  )
  await remove(trx, scheduled_appointment.id)

  const matching_provider = await getById(
    trx,
    scheduled_appointment.provider_id,
  )
  const tokens = await google_tokens.getByEntityId(
    trx,
    'health_worker',
    matching_provider.id,
  )
  const calendars = await employment_calendars.findOneOptional(
    trx,
    matching_provider,
  )

  assertOr401(tokens)
  assertOr401(
    calendars?.availability_set,
    'Google calendar availability not yet set',
  )

  const health_worker_google_client = new google.GoogleClient(tokens)
  await health_worker_google_client.deleteEvent(
    calendars.gcal_appointments_calendar_id,
    scheduled_appointment.gcal_event_id,
  )
}
