import { sql } from 'kysely'
import {
  Appointment,
  AppointmentOfferedTime,
  AppointmentWithAllPatientInfo,
  Maybe,
  ReturnedSqlRow,
  TrxOrDb,
} from '../../types.ts'
import uniq from '../../util/uniq.ts';
import { getWithMedicalRecord } from "./patients.ts"
import { assert } from "std/_util/asserts.ts";

export async function addOfferedTime(
  trx: TrxOrDb,
  opts: { appointment_id: number; health_worker_id: number; start: string },
): Promise<
  ReturnedSqlRow<AppointmentOfferedTime & { health_worker_name: string }>
> {
  const result = await sql<
    ReturnedSqlRow<AppointmentOfferedTime & { health_worker_name: string }>
  >`
    WITH inserted_offered_time as (
      INSERT INTO appointment_offered_times(appointment_id, health_worker_id, start)
          VALUES (${opts.appointment_id}, ${opts.health_worker_id}, ${opts.start})
        RETURNING *
    )

    SELECT inserted_offered_time.*,
           health_workers.name as health_worker_name
      FROM inserted_offered_time
      JOIN health_workers ON inserted_offered_time.health_worker_id = health_workers.id
  `.execute(trx)

  return result.rows[0]
}

export async function newOfferedTime(
  trx: TrxOrDb,
  opts: { appointment_id: number; health_worker_id: number; start: string },
): Promise<
  ReturnedSqlRow<AppointmentOfferedTime & { health_worker_name: string }>
> {
  const result = await sql<
    ReturnedSqlRow<AppointmentOfferedTime & { health_worker_name: string }>
  >`
  WITH inserted_offered_time as (
    INSERT INTO appointment_offered_times(appointment_id, health_worker_id, start)
        VALUES (${opts.appointment_id}, ${opts.health_worker_id}, ${opts.start})
      RETURNING *
  )

    SELECT inserted_offered_time.*,
           health_workers.name as health_worker_name
      FROM inserted_offered_time
      JOIN health_workers ON inserted_offered_time.health_worker_id = health_workers.id
      JOIN appointment_offered_times.appointment_id = ${opts.appointment_id}
  `.execute(trx)

  return result.rows[0]
}

export async function declineOfferedTimes(trx: TrxOrDb, ids: number[]) {
  const writeResult = await trx
    .updateTable('appointment_offered_times')
    .set({ patient_declined: true })
    .where('id', 'in', ids)
    .execute()

  return writeResult
}

export async function getPatientDeclinedTimes(
  trx: TrxOrDb,
  opts: { appointment_id: number },
): Promise<string[]> {
  const readResult = await trx
    .selectFrom('appointment_offered_times')
    .where('appointment_id', '=', opts.appointment_id)
    .where('patient_declined', '=', true)
    .select('start')
    .execute()

  const declinedTimes = []

  for (const { start } of readResult) {
    declinedTimes.push(start)
  }

  return declinedTimes
}

export function createNew(
  trx: TrxOrDb,
  opts: { patient_id: number },
): Promise<ReturnedSqlRow<Appointment>[]> {
  return trx
    .insertInto('appointments')
    .values({ patient_id: opts.patient_id, status: 'pending' })
    .returningAll()
    .execute()
}

export async function upsert(
  trx: TrxOrDb,
  info: Appointment & { id?: number },
): Promise<ReturnedSqlRow<Appointment>> {
  const [appointment] = await trx
    .insertInto('appointments')
    .values(info)
    .onConflict((oc) => oc.column('id').doUpdateSet(info))
    .returningAll()
    .execute()

  return appointment
}

export function schedule(
  trx: TrxOrDb,
  opts: {
    appointment_offered_time_id: number
    scheduled_gcal_event_id: string
  },
) {
  return trx
    .updateTable('appointment_offered_times')
    .set({ scheduled_gcal_event_id: opts.scheduled_gcal_event_id })
    .where('id', '=', opts.appointment_offered_time_id)
    .execute()
}

export async function getWithPatientInfo(
  trx: TrxOrDb,
  query: {
    id?: number
    health_worker_id?: number
  },
) {

  let builder = trx
    .selectFrom('appointment_offered_times')
    .innerJoin(
      'appointments',
      'appointment_offered_times.appointment_id',
      'appointments.id',
    )
    .innerJoin('patients', 'appointments.patient_id', 'patients.id')
    .select([
      'appointments.id',
      'patient_id',
      'start',
      'reason',
      'status',
      'scheduled_gcal_event_id',
      'appointments.created_at',
      'appointments.updated_at',
    ])

  if (query.id) builder = builder.where('appointments.id', '=', query.id)
  if (query.health_worker_id) {
    builder = builder.where('health_worker_id', '=', query.health_worker_id)
  }

  return builder.execute()

  // const appointments = await builder.execute()

  // const patient_ids = uniq(appointments.map((a) => a.patient_id))

  // const patients = await getWithMedicalRecord(trx, { patient_ids })

  // return appointments.map(appointment => {
  //   const patient = patients.find(p => p.id === appointment.patient_id)
  //   assert(patient, `Could not find patient ${appointment.patient_id}`)
  //   return { ...appointment, patient }
  // })
}

export async function getWithPatientInfoById(
  trx: TrxOrDb,
  id: number,
): Promise<Maybe<AppointmentWithAllPatientInfo>> {
  const result = await getWithPatientInfo(trx, { id })
  return result[0]
}

export function remove(trx: TrxOrDb, id: number) {
  return trx.deleteFrom('appointments').where('id', '=', id).execute()
}
