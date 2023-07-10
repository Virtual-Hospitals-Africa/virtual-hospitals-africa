import { sql } from 'kysely'
import {
  Appointment,
  PatientAppointmentOfferedTime,
  // AppointmentWithAllPatientInfo,
  Maybe,
  ReturnedSqlRow,
  TrxOrDb,
PatientAppointmentRequest,
PatientState,
NonNull,
} from '../../types.ts'
// import uniq from '../../util/uniq.ts'
// import { getWithMedicalRecords } from './patients.ts'
import { assert } from 'std/testing/asserts.ts'
import isDate from "../../util/isDate.ts";

export async function addOfferedTime(
  trx: TrxOrDb,
  opts: Omit<PatientAppointmentOfferedTime, 'declined'>,
): Promise<
  ReturnedSqlRow<PatientAppointmentOfferedTime & { health_worker_name: string }>
> {
  const result = await sql<
    ReturnedSqlRow<PatientAppointmentOfferedTime & { health_worker_name: string }>
  >`
    WITH inserted_offered_time as (
      INSERT INTO patient_appointment_offered_times(patient_appointment_request_id, health_worker_id, start)
          VALUES (${opts.patient_appointment_request_id}, ${opts.health_worker_id}, ${opts.start})
        RETURNING *
    )

    SELECT inserted_offered_time.*,
           health_workers.name as health_worker_name
      FROM inserted_offered_time
      JOIN health_workers ON inserted_offered_time.health_worker_id = health_workers.id
  `.execute(trx)

  return result.rows[0]
}

export function declineOfferedTimes(trx: TrxOrDb, ids: number[]) {
  assert(ids.length, 'Must provide ids to decline')
  return trx
    .updateTable('patient_appointment_offered_times')
    .set({ declined: true })
    .where('id', 'in', ids)
    .execute()
}

export async function getPatientDeclinedTimes(
  trx: TrxOrDb,
  opts: { patient_appointment_request_id: number },
): Promise<Date[]> {
  const readResult = await trx
    .selectFrom('patient_appointment_offered_times')
    .where('patient_appointment_request_id', '=', opts.patient_appointment_request_id)
    .where('declined', '=', true)
    .select('start')
    .execute()

  const declinedTimes = []

  for (const { start } of readResult) {
    assert(isDate(start))
    declinedTimes.push(start)
  }

  return declinedTimes
}

export async function createNewRequest(
  trx: TrxOrDb,
  opts: { patient_id: number },
): Promise<ReturnedSqlRow<PatientAppointmentRequest>> {
  const request = await trx
    .insertInto('patient_appointment_requests')
    .values({ patient_id: opts.patient_id })
    .returningAll()
    .executeTakeFirst()
  assert(request)
  return request
}


export function upsert(
  trx: TrxOrDb,
  info: Appointment & { id?: number },
): Promise<Maybe<ReturnedSqlRow<Appointment>>> {
  return trx
    .insertInto('appointments')
    .values(info)
    .onConflict((oc) => oc.column('id').doUpdateSet(info))
    .returningAll()
    .executeTakeFirst()
}

export function upsertRequest(
  trx: TrxOrDb,
  info: PatientAppointmentRequest & { id?: number },
): Promise<Maybe<ReturnedSqlRow<PatientAppointmentRequest>>> {
  return trx
    .insertInto('patient_appointment_requests')
    .values(info)
    .onConflict((oc) => oc.column('id').doUpdateSet(info))
    .returningAll()
    .executeTakeFirst()
}

export async function schedule(
  trx: TrxOrDb,
  opts: {
    appointment_offered_time_id: number
    gcal_event_id: string
  },
): Promise<NonNull<PatientState['scheduled_appointment']>> {
  const offered = await trx
    .selectFrom('patient_appointment_offered_times')
    .where('id', '=', opts.appointment_offered_time_id)
    .innerJoin('patient_appointment_requests', 'patient_appointment_requests.id', 'patient_appointment_request_id')
    .select(['patient_appointment_request_id', 'start', 'reason', 'patient_id', 'health_worker_id'])
    .executeTakeFirst()

  assert(offered)
  const { start, patient_id, health_worker_id, reason } = offered
  assert(reason)

  const appointmentToInsert = {
    ...opts,
    start,
    patient_id,
    reason,
  }

  const appointment = await trx
    .insertInto('appointments')
    .values(appointmentToInsert)
    .onConflict((oc) => oc.column('id').doUpdateSet(appointmentToInsert))
    .returningAll()
    .executeTakeFirst()

  assert(appointment)

  await trx
    .insertInto('appointment_health_worker_attendees')
    .values({ appointment_id: appointment.id, health_worker_id, confirmed: false })
    .returningAll()
    .executeTakeFirst()

  const healthWorker = await trx
    .selectFrom('health_workers')
    .where('id', '=', health_worker_id)
    .select('name')
    .executeTakeFirst()

  assert(healthWorker)

  await trx
    .deleteFrom('patient_appointment_requests')
    .where('id', '=', offered.patient_appointment_request_id)
  
  return {
    id: appointment.id,
    reason: appointment.reason,
    health_worker_id,
    health_worker_name: healthWorker.name,
    gcal_event_id: appointment.gcal_event_id,
    start,
  }
}

// export async function getWithPatientInfo(
//   trx: TrxOrDb,
//   query: {
//     id?: number
//     health_worker_id?: number
//   },
// ) {
//   let builder = trx
//     .selectFrom('patient_appointment_offered_times')
//     .innerJoin(
//       'appointments',
//       'appointment_offered_times.appointment_id',
//       'appointments.id',
//     )
//     .innerJoin('patients', 'appointments.patient_id', 'patients.id')
//     .select([
//       'appointments.id',
//       'patient_id',
//       'start',
//       'reason',
//       'confirmed',
//       'gcal_event_id',
//       'appointments.created_at',
//       'appointments.updated_at',
//     ])

//   if (query.id) builder = builder.where('appointments.id', '=', query.id)
//   if (query.health_worker_id) {
//     builder = builder.where('health_worker_id', '=', query.health_worker_id)
//   }

//   const appointments = await builder.execute()

//   if (!appointments.length) return []

//   const patient_ids = uniq(appointments.map((a) => a.patient_id))

//   const patients = await getWithMedicalRecords(trx, {
//     ids: patient_ids,
//     health_worker_id: query.health_worker_id,
//   })

//   return appointments.map((appointment) => {
//     const patient = patients.find((p) => p.id === appointment.patient_id)
//     assert(patient, `Could not find patient ${appointment.patient_id}`)
//     return { ...appointment, patient }
//   })
// }

// export async function getWithPatientInfoById(
//   trx: TrxOrDb,
//   id: number,
// ): Promise<Maybe<AppointmentWithAllPatientInfo>> {
//   const result = await getWithPatientInfo(trx, { id })
//   return result[0]
// }

export function remove(trx: TrxOrDb, id: number) {
  return trx.deleteFrom('appointments').where('id', '=', id).execute()
}