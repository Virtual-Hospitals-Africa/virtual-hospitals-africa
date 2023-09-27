import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { differenceInMinutes, formatHarare, stringify } from '../util/date.ts'
import * as google from '../external-clients/google.ts'
import { getWithTokensById } from '../db/models/health_workers.ts'
import * as appointments from '../db/models/appointments.ts'
import {
  DeepPartial,
  GCalEvent,
  PatientAppointmentOfferedTime,
  PatientState,
  ReturnedSqlRow,
  TrxOrDb,
} from '../types.ts'

function gcal({ start, end }: {
  start: string
  end: string
}) {
  return {
    summary: 'Appointment',
    start: { dateTime: start },
    end: { dateTime: end },
  }
}

export function gcalAppointmentDetails(
  patientState: PatientState,
): {
  acceptedTime: ReturnedSqlRow<
    PatientAppointmentOfferedTime & {
      health_worker_name: string
    }
  >
  gcal: DeepPartial<GCalEvent>
} {
  assert(patientState.scheduling_appointment_request)
  assert(
    patientState.scheduling_appointment_request.offered_times.length,
    'No appointment_offered_times found in patientState',
  )

  const acceptedTimes = patientState.scheduling_appointment_request
    .offered_times.filter(
      (offeredTime) => !offeredTime.declined,
    )

  assertEquals(
    acceptedTimes.length,
    1,
    'Patient should have accepted exactly one offered time',
  )
  const [acceptedTime] = acceptedTimes

  const end = new Date(acceptedTime.start)
  end.setMinutes(end.getMinutes() + 30)
  return {
    acceptedTime,
    gcal: gcal({
      start: formatHarare(acceptedTime.start),
      end: formatHarare(end),
    }),
  }
}

export async function makeAppointmentChatbot(
  trx: TrxOrDb,
  patientState: PatientState,
): Promise<PatientState> {
  console.log('makeAppointmentChatbot')
  assertEquals(
    patientState.conversation_state,
    'onboarded:appointment_scheduled',
    'Only onboarded:appointment_scheduled patients supported for now',
  )
  assert(patientState.scheduling_appointment_request)
  assert(patientState.scheduling_appointment_request.reason)

  const details = gcalAppointmentDetails(patientState)

  const { acceptedTime, gcal } = details
  assert(
    acceptedTime.health_worker_id,
    'No health_worker_id found',
  )

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

  const end = new Date(acceptedTime.start)
  end.setMinutes(end.getMinutes() + 30)

  const insertedEvent = await healthWorkerGoogleClient.insertEvent(
    matchingHealthWorker.gcal_appointments_calendar_id,
    gcal,
  )

  const scheduled_appointment = await appointments.schedule(trx, {
    appointment_offered_time_id: acceptedTime.id,
    gcal_event_id: insertedEvent.id,
  })

  return {
    ...patientState,
    scheduled_appointment,
    scheduling_appointment_request: undefined,
  }
}

export type ScheduleFormValues = {
  start: Date
  end: Date
  reason: string
  durationMinutes: number
  patient_id: number
  health_worker_ids: number[]
}

export async function makeAppointmentWeb(
  trx: TrxOrDb,
  values: ScheduleFormValues,
): Promise<void> {
  assertEquals(
    values.health_worker_ids.length,
    1,
    'TODO support multiple health workers',
  )
  assertEquals(
    values.durationMinutes,
    differenceInMinutes(values.end, values.start),
  )

  const matchingHealthWorker = await getWithTokensById(
    trx,
    values.health_worker_ids[0],
  )

  assert(
    matchingHealthWorker,
    `No health_worker session found for health_worker_id ${
      values.health_worker_ids[0]
    }`,
  )
  assert(
    matchingHealthWorker.gcal_appointments_calendar_id,
    `No gcal_appointments_calendar_id found for health_worker_id ${
      values.health_worker_ids[0]
    }`,
  )

  const healthWorkerGoogleClient = new google.GoogleClient(matchingHealthWorker)

  const insertedEvent = await healthWorkerGoogleClient.insertEvent(
    matchingHealthWorker.gcal_appointments_calendar_id,
    gcal({
      start: stringify(values.start),
      end: stringify(values.end),
    }),
  )

  const appointment = await appointments.upsert(trx, {
    patient_id: values.patient_id,
    reason: values.reason,
    start: values.start,
    gcal_event_id: insertedEvent.id,
  })

  await appointments.addAttendees(trx, {
    appointment_id: appointment.id,
    health_worker_ids: values.health_worker_ids,
  })
}
