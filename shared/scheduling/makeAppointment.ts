import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import {
  differenceInMinutes,
  formatHarare,
  isIsoHarare,
} from '../../util/date.ts'
import { get } from '../../db/models/providers.ts'
import * as appointments from '../../db/models/appointments.ts'
import {
  DeepPartial,
  GCalEvent,
  HealthWorkerWithGoogleTokens,
  PatientAppointmentOfferedTime,
  PatientState,
  ReturnedSqlRow,
  TrxOrDb,
} from '../../types.ts'
import { assertOr400 } from '../../util/assertOr.ts'
import isObjectLike from '../../util/isObjectLike.ts'

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

type InsertEvent = (
  health_worker: HealthWorkerWithGoogleTokens,
  calendar_id: string,
  event: DeepPartial<GCalEvent>,
) => Promise<GCalEvent>

export async function makeAppointmentChatbot(
  trx: TrxOrDb,
  patientState: PatientState,
  insertEvent: InsertEvent,
): Promise<PatientState> {
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
    acceptedTime.provider_id,
    'No provider_id found',
  )

  const matchingHealthWorker = await get(
    trx,
    acceptedTime.provider_id,
  )

  const end = new Date(acceptedTime.start)
  end.setMinutes(end.getMinutes() + 30)

  const insertedEvent = await insertEvent(
    matchingHealthWorker,
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
  start: string
  end: string
  reason: string
  durationMinutes: number
  patient_id: number
  provider_ids: number[]
}

export function assertIsScheduleFormValues(
  values: unknown,
): asserts values is ScheduleFormValues {
  assertOr400(isObjectLike(values))
  assertOr400(typeof values.start === 'string')
  assertOr400(isIsoHarare(values.start))
  assertOr400(typeof values.end === 'string')
  assertOr400(isIsoHarare(values.end))
  assertOr400(typeof values.durationMinutes === 'number')
  assertOr400(typeof values.reason === 'string')
  assertOr400(typeof values.patient_id === 'number')
  assertOr400(Array.isArray(values.provider_ids))
  assertOr400(values.provider_ids.every((id) => typeof id === 'number'))
}

export async function makeAppointmentWeb(
  trx: TrxOrDb,
  values: ScheduleFormValues,
  insertEvent: InsertEvent,
): Promise<void> {
  assertEquals(
    values.provider_ids.length,
    1,
    'TODO support multiple health workers',
  )
  assert(isIsoHarare(values.start))
  assert(isIsoHarare(values.end))
  const start = new Date(values.start)
  const end = new Date(values.end)
  assertEquals(
    values.durationMinutes,
    differenceInMinutes(end, start),
  )

  const matchingHealthWorker = await get(
    trx,
    values.provider_ids[0],
  )

  const insertedEvent = await insertEvent(
    matchingHealthWorker,
    matchingHealthWorker.gcal_appointments_calendar_id,
    gcal({
      start: values.start,
      end: values.end,
    }),
  )

  const appointment = await appointments.upsert(trx, {
    start,
    patient_id: values.patient_id,
    reason: values.reason,
    gcal_event_id: insertedEvent.id,
  })

  await appointments.addAttendees(trx, {
    appointment_id: appointment.id,
    provider_ids: values.provider_ids,
  })
}
