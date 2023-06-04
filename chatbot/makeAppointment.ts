import { assert, assertEquals } from 'std/testing/asserts.ts'
import { formatHarare } from '../util/date.ts'
import * as google from '../external-clients/google.ts'
import { getWithTokensById } from '../db/models/doctors.ts'
import * as appointments from '../db/models/appointments.ts'
import {
  AppointmentOfferedTime,
  DeepPartial,
  GCalEvent,
  PatientState,
  ReturnedSqlRow,
  TrxOrDb,
} from '../types.ts'

export function gcalAppointmentDetails(
  patientState: PatientState,
): {
  acceptedTime: ReturnedSqlRow<
    AppointmentOfferedTime & {
      doctor_name: string
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
    gcal: {
      summary: `Appointment with ${patientState.name}`,
      start: {
        dateTime: acceptedTime.start,
      },
      end: {
        dateTime: formatHarare(end),
      },
    },
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
    acceptedTime.doctor_id,
    'No doctor_id found',
  )

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

  const end = new Date(acceptedTime.start)
  end.setMinutes(end.getMinutes() + 30)

  const insertedEvent = await doctorGoogleClient.insertEvent(
    matchingDoctor.gcal_appointments_calendar_id,
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
