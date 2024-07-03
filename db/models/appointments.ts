import { sql } from 'kysely'
import {
  Appointment,
  AppointmentWithAllPatientInfo,
  HasStringId,
  Maybe,
  PatientAppointmentOfferedTime,
  PatientAppointmentRequest,
  PatientAppointmentRequestMedia,
  SchedulingAppointmentOfferedTime,
  TrxOrDb,
} from '../../types.ts'
import uniq from '../../util/uniq.ts'
import { getWithOpenEncounter } from './patients.ts'
import { assert } from 'std/assert/assert.ts'
import isDate from '../../util/isDate.ts'
import { jsonArrayFrom, now } from '../helpers.ts'
import { ensureProviderId } from './providers.ts'

export function addOfferedTime(
  trx: TrxOrDb,
  opts: Omit<PatientAppointmentOfferedTime, 'declined'>,
): Promise<SchedulingAppointmentOfferedTime> {
  return trx.with(
    'inserted_offer_time',
    (qb) =>
      qb.insertInto('patient_appointment_offered_times')
        .values({
          patient_appointment_request_id: opts.patient_appointment_request_id,
          provider_id: ensureProviderId(trx, opts.provider_id),
          start: opts.start,
        })
        .returningAll(),
  ).with(
    'inserted_with_health_worker_name',
    (qb) =>
      qb.selectFrom('health_workers')
        .innerJoin(
          'employment',
          'employment.health_worker_id',
          'health_workers.id',
        )
        .innerJoin(
          'inserted_offer_time',
          'employment.id',
          'inserted_offer_time.provider_id',
        )
        .selectAll('inserted_offer_time')
        .select('health_workers.name as health_worker_name')
        .select('employment.profession'),
  )
    .selectFrom('inserted_with_health_worker_name')
    .selectAll()
    .executeTakeFirstOrThrow()
}

export function declineOfferedTimes(trx: TrxOrDb, ids: string[]) {
  assert(ids.length, 'Must provide ids to decline')
  return trx
    .updateTable('patient_appointment_offered_times')
    .set({ declined: true })
    .where('id', 'in', ids)
    .execute()
}

export async function getPatientDeclinedTimes(
  trx: TrxOrDb,
  opts: { patient_appointment_request_id: string },
): Promise<Date[]> {
  const readResult = await trx
    .selectFrom('patient_appointment_offered_times')
    .where(
      'patient_appointment_request_id',
      '=',
      opts.patient_appointment_request_id,
    )
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

export function createNewRequest(
  trx: TrxOrDb,
  opts: { patient_id: string },
): Promise<HasStringId<PatientAppointmentRequest>> {
  return trx
    .insertInto('patient_appointment_requests')
    .values({ patient_id: opts.patient_id })
    .returningAll()
    .executeTakeFirstOrThrow()
}

export function upsert(
  trx: TrxOrDb,
  info: Appointment & { id?: string },
): Promise<HasStringId<Appointment>> {
  return trx
    .insertInto('appointments')
    .values(info)
    .onConflict((oc) => oc.column('id').doUpdateSet(info))
    .returningAll()
    .executeTakeFirstOrThrow()
}

export function upsertRequest(
  trx: TrxOrDb,
  info: { id?: string; patient_id: string; reason?: string | null },
): Promise<HasStringId<PatientAppointmentRequest>> {
  return trx
    .insertInto('patient_appointment_requests')
    .values(info)
    .onConflict((oc) => oc.column('id').doUpdateSet(info))
    .returningAll()
    .executeTakeFirstOrThrow()
}

export function addAttendees(
  trx: TrxOrDb,
  { appointment_id, provider_ids }: {
    appointment_id: string
    provider_ids: string[]
  },
) {
  return trx
    .insertInto('appointment_providers')
    .values(provider_ids.map((provider_id) => ({
      appointment_id,
      confirmed: false,
      // Only add the provider if they are a doctor or nurse
      provider_id: ensureProviderId(trx, provider_id),
    })))
    .returningAll()
    .execute()
}

export async function schedule(
  trx: TrxOrDb,
  { appointment_offered_time_id, gcal_event_id }: {
    appointment_offered_time_id: string
    gcal_event_id: string
  },
) {
  const offered = await trx
    .selectFrom('patient_appointment_offered_times')
    .where(
      'patient_appointment_offered_times.id',
      '=',
      appointment_offered_time_id,
    )
    .innerJoin(
      'patient_appointment_requests',
      'patient_appointment_requests.id',
      'patient_appointment_request_id',
    )
    .select([
      'patient_appointment_request_id',
      'start',
      'reason',
      'patient_id',
      'provider_id',
    ])
    .executeTakeFirstOrThrow()

  const { start, patient_id, provider_id, reason } = offered
  assert(reason)

  const appointmentToInsert = {
    gcal_event_id,
    start,
    patient_id,
    reason,
  }

  const appointment = await trx
    .insertInto('appointments')
    .values(appointmentToInsert)
    .onConflict((oc) => oc.column('id').doUpdateSet(appointmentToInsert))
    .returningAll()
    .executeTakeFirstOrThrow()

  await addAttendees(trx, {
    appointment_id: appointment.id,
    provider_ids: [provider_id],
  })

  const healthWorker = await trx
    .selectFrom('employment')
    .innerJoin(
      'health_workers',
      'health_workers.id',
      'employment.health_worker_id',
    )
    .where('employment.id', '=', provider_id)
    .select('health_workers.name')
    .executeTakeFirstOrThrow()

  // TODO: select, insert, delete in one query
  const media_ids = await getMediaIdByRequestId(trx, {
    request_id: offered.patient_appointment_request_id,
  })
  if (media_ids.length) {
    await insertMedia(trx, {
      appointment_id: appointment.id,
      media_ids,
    })
  }

  await trx
    .deleteFrom('patient_appointment_requests')
    .where('id', '=', offered.patient_appointment_request_id)
    .executeTakeFirstOrThrow()

  return {
    id: appointment.id,
    reason: appointment.reason,
    provider_id,
    health_worker_name: healthWorker.name,
    gcal_event_id: appointment.gcal_event_id,
    start,
  }
}

export async function countUpcoming(
  trx: TrxOrDb,
  opts: { health_worker_id: string },
): Promise<number> {
  const { count } = await trx
    .selectFrom('appointments')
    .innerJoin(
      'appointment_providers',
      'appointments.id',
      'appointment_providers.appointment_id',
    )
    .innerJoin(
      'employment',
      'employment.id',
      'appointment_providers.provider_id',
    )
    .where(
      'employment.health_worker_id',
      '=',
      opts.health_worker_id,
    )
    .where('start', '>=', now)
    .select([
      sql<number>`count(appointments.id)`.as('count'),
    ])
    .executeTakeFirstOrThrow()

  return count
}

export async function getWithPatientInfo(
  trx: TrxOrDb,
  opts: {
    id?: string
    health_worker_id?: string
  },
) {
  let query = trx
    .selectFrom('appointments')
    .innerJoin(
      'appointment_providers',
      'appointments.id',
      'appointment_providers.appointment_id',
    )
    .innerJoin('patients', 'appointments.patient_id', 'patients.id')
    .select((eb) => [
      'appointments.id',
      'patient_id',
      'start',
      'reason',
      'confirmed',
      'gcal_event_id',
      'appointments.created_at',
      'appointments.updated_at',
      jsonArrayFrom(
        eb.selectFrom('appointment_media')
          .innerJoin('media', 'media.id', 'media_id')
          .select(['media_id', 'mime_type'])
          .whereRef(
            'appointments.id',
            '=',
            'appointment_media.appointment_id',
          ),
      ).as('media'),
    ])
    .orderBy('start', 'asc')

  if (opts.id) query = query.where('appointments.id', '=', opts.id)
  if (opts.health_worker_id) {
    query = query
      .innerJoin(
        'employment',
        'employment.id',
        'appointment_providers.provider_id',
      )
      .where('employment.health_worker_id', '=', opts.health_worker_id)
  }

  const appointments = await query.execute()

  if (!appointments.length) return []

  const patient_ids = uniq(appointments.map((a) => a.patient_id))

  const patients = await getWithOpenEncounter(trx, {
    ids: patient_ids,
    health_worker_id: opts.health_worker_id,
  })

  return appointments.map((appointment) => {
    const patient = patients.find((p) => p.id === appointment.patient_id)
    assert(patient, `Could not find patient ${appointment.patient_id}`)
    return { ...appointment, patient }
  })
}

export async function getWithPatientInfoById(
  trx: TrxOrDb,
  id: string,
): Promise<Maybe<AppointmentWithAllPatientInfo>> {
  const result = await getWithPatientInfo(trx, { id })
  return result[0]
}

export function remove(trx: TrxOrDb, id: string) {
  return trx.deleteFrom('appointments').where('id', '=', id).execute()
}

export function insertRequestMedia(
  trx: TrxOrDb,
  toInsert: {
    patient_appointment_request_id: string
    media_id: string
  },
): Promise<HasStringId<PatientAppointmentRequestMedia>> {
  assert(toInsert.patient_appointment_request_id)
  assert(toInsert.media_id)
  return trx
    .insertInto('patient_appointment_request_media')
    .values(toInsert)
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function getMediaIdByRequestId(
  trx: TrxOrDb,
  opts: {
    request_id: string
  },
): Promise<string[]> {
  const queryResult = await trx.selectFrom('patient_appointment_request_media')
    .where('patient_appointment_request_id', '=', opts.request_id).select(
      'media_id',
    ).execute()
  return queryResult.map((row) => row.media_id)
}

export function insertMedia(
  trx: TrxOrDb,
  opts: {
    appointment_id: string
    media_ids: string[]
  },
) {
  assert(opts.appointment_id)
  assert(opts.media_ids.length)
  const toInsert = opts.media_ids.map((media_id) => ({
    appointment_id: opts.appointment_id,
    media_id,
  }))
  return trx.insertInto('appointment_media').values(toInsert).returningAll()
    .executeTakeFirstOrThrow()
}
