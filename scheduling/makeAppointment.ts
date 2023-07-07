import { assert, assertEquals } from 'std/testing/asserts.ts'
import { formatHarare } from '../util/date.ts'
import * as google from '../external-clients/google.ts'
import { getWithTokensById } from '../db/models/health_workers.ts'
import * as appointments from '../db/models/appointments.ts'
import {
  AppointmentOfferedTime,
  DeepPartial,
  GCalEvent,
  PatientState,
  ReturnedSqlRow,
  TrxOrDb,
} from '../types.ts'

function gcal({ start, end }: {
  start: string,
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
    AppointmentOfferedTime & {
      health_worker_name: string
    }
  >
  gcal: DeepPartial<GCalEvent>
} {
  assert(
    patientState.appointment_offered_times &&
      patientState.appointment_offered_times.length,
    'No appointment_offered_times found in patientState',
  )

  const acceptedTimes = patientState.appointment_offered_times.filter(
    (offeredTime) => !offeredTime.patient_declined,
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
      start: acceptedTime.start,
      end: formatHarare(end),
    })
  }
}

export async function makeAppointment(
  trx: TrxOrDb,
  patientState: PatientState,
): Promise<PatientState> {
  assertEquals(
    patientState.conversation_state,
    'onboarded:appointment_scheduled',
    'Only onboarded:appointment_scheduled patients supported for now',
  )
  assert(
    patientState.scheduling_appointment_id,
    'No scheduling_appointment_id found in patientState',
  )
  assert(
    patientState.scheduling_appointment_reason,
    'No scheduling_appointment_reason found in patientState',
  )

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

  await appointments.schedule(trx, {
    appointment_offered_time_id: acceptedTime.id,
    scheduled_gcal_event_id: insertedEvent.id,
  })

  return {
    ...patientState,
    appointment_offered_times: patientState.appointment_offered_times.map(
      (aot) =>
        aot.id === acceptedTime.id
          ? {
            ...acceptedTime,
            scheduled_gcal_event_id: insertedEvent.id,
          }
          : aot,
    ),
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

export async function makeAppointment2(
  trx: TrxOrDb,
  values: ScheduleFormValues,
): Promise<PatientState> {

  const appointment = await appointments.upsert(trx, {
    patient_id: values.patient_id,
    reason: values.reason,
    status: 'pending'
  })

  const offeredTime = appointments.newOfferedTime(trx, {
    appointment_id: appointment.id,
    health_worker_id: values.health_worker_ids[0],
    start: formatHarare(values.start),
  })


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

  await appointments.schedule(trx, {
    appointment_offered_time_id: acceptedTime.id,
    scheduled_gcal_event_id: insertedEvent.id,
  })

  return {
    ...patientState,
    appointment_offered_times: patientState.appointment_offered_times.map(
      (aot) =>
        aot.id === acceptedTime.id
          ? {
            ...acceptedTime,
            scheduled_gcal_event_id: insertedEvent.id,
          }
          : aot,
    ),
  }
}
