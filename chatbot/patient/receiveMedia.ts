import { assert } from 'std/assert/assert.ts'
import { PatientChatbotUserState, TrxOrDb } from '../../types.ts'
import * as appointments from '../../db/models/appointments.ts'
import * as patients from '../../db/models/patients.ts'

export async function receiveMedia(
  trx: TrxOrDb,
  patientState: PatientChatbotUserState,
) {
  assert(patientState.entity_id)
  const scheduling_appointment_request = await patients
    .schedulingAppointmentRequest(trx, patientState.entity_id)
  assert(scheduling_appointment_request)

  assert(patientState.unhandled_message.media_id)
  await appointments.insertRequestMedia(trx, {
    patient_appointment_request_id:
      scheduling_appointment_request.patient_appointment_request_id,
    media_id: patientState.unhandled_message.media_id,
  })
  return 'onboarded:make_appointment:subsequent_ask_for_media' as const
}
