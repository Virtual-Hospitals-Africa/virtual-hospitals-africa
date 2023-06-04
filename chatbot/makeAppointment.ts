import { assert, assertEquals } from 'std/testing/asserts.ts'
import { formatHarare } from '../util/date.ts'
import * as google from '../external-clients/google.ts'
import { getWithTokensById } from '../db/models/doctors.ts'
import * as appointments from '../db/models/appointments.ts'
import {
  AppointmentOfferedTime,
  DeepPartial,
  GCalEvent,
  ReturnedSqlRow,
  TrxOrDb,
  UnhandledPatientMessage,
} from '../types.ts'

export function gcalAppointmentDetails(
  patientMessage: UnhandledPatientMessage,
): {
  acceptedTime: ReturnedSqlRow<
    AppointmentOfferedTime & {
      doctor_name: string
    }
  >
  gcal: DeepPartial<GCalEvent>
} {
  assert(
    patientMessage.appointment_offered_times &&
      patientMessage.appointment_offered_times.length,
    'No appointment_offered_times found in patientMessage',
  )

  const acceptedTimes = patientMessage.appointment_offered_times.filter(
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
      summary: `Appointment with ${patientMessage.name}`,
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
  patientMessage: UnhandledPatientMessage,
): Promise<UnhandledPatientMessage> {
  assertEquals(
    patientMessage.conversation_state,
    'onboarded:appointment_scheduled',
    'Only onboarded:appointment_scheduled patients supported for now',
  )
  assert(
    patientMessage.scheduling_appointment_id,
    'No scheduling_appointment_id found in patientMessage',
  )
  assert(
    patientMessage.scheduling_appointment_reason,
    'No scheduling_appointment_reason found in patientMessage',
  )

  const details = gcalAppointmentDetails(patientMessage)

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
    ...patientMessage,
    appointment_offered_times: patientMessage.appointment_offered_times.map(
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
