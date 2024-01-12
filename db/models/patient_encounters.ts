import { sql } from 'kysely'
import {
  Maybe,
  PatientEncounterReason,
  RenderedPatientEncounter,
  TrxOrDb,
} from '../../types.ts'
import * as waiting_room from './waiting_room.ts'
import * as patients from './patients.ts'
import isObjectLike from '../../util/isObjectLike.ts'
import { assertOr400 } from '../../util/assertOr.ts'
import { jsonArrayFrom } from '../helpers.ts'

export type Upsert =
  & {
    encounter_id?: Maybe<number>
    reason: PatientEncounterReason
    provider_ids?: number[]
    appointment_id?: Maybe<number>
    notes?: Maybe<string>
  }
  & (
    | { patient_id: number; patient_name?: Maybe<string> }
    | { patient_id?: Maybe<number>; patient_name: string }
  )

export const reasons = new Set<PatientEncounterReason>([
  'seeking treatment',
  'appointment',
  'follow up',
  'referral',
  'checkup',
  'emergency',
  'other',
])

export const drop_in_reasons: PatientEncounterReason[] = [
  'seeking treatment',
  'appointment',
  'follow up',
  'referral',
  'checkup',
  'emergency',
  'other',
]

export function assertIsEncounterReason(
  str: string,
): asserts str is PatientEncounterReason {
  assertOr400(reasons.has(str as PatientEncounterReason))
}

export function assertIsUpsert(
  obj: unknown,
): asserts obj is Upsert {
  console.log(obj)
  assertOr400(isObjectLike(obj))
  assertOr400(obj.encounter_id == null || typeof obj.encounter_id === 'number')
  assertOr400(obj.patient_id == null || typeof obj.patient_id === 'number')
  assertOr400(typeof obj.reason === 'string')
  assertIsEncounterReason(obj.reason)
  assertOr400(
    !obj.provider_ids ||
      (Array.isArray(obj.provider_ids) &&
        obj.provider_ids.every((id: unknown) => typeof id === 'number')),
  )
  assertOr400(
    obj.appointment_id == null || typeof obj.appointment_id === 'number',
  )
  assertOr400(obj.notes == null || typeof obj.notes === 'string')
}

export async function upsert(
  trx: TrxOrDb,
  facility_id: number,
  {
    encounter_id,
    patient_id,
    patient_name,
    reason,
    appointment_id,
    notes,
    provider_ids,
  }: Upsert,
): Promise<{
  id: number
  patient_id: number
  created_at: Date
  provider_ids: number[]
}> {
  if (!patient_id) {
    assertOr400(!encounter_id)
    assertOr400(patient_name)
    patient_id = (await patients.upsert(trx, { name: patient_name })).id
  }

  const values = {
    patient_id,
    reason,
    notes,
    appointment_id: appointment_id || null,
  }

  const upserted = await (
    encounter_id
      ? trx
        .updateTable('patient_encounters')
        .set(values)
        .where('id', '=', encounter_id)
        .returning(['id', 'patient_id', 'created_at'])
        .executeTakeFirstOrThrow()
      : trx
        .insertInto('patient_encounters')
        .values(values)
        .returning(['id', 'patient_id', 'created_at'])
        .executeTakeFirstOrThrow()
  )

  const adding_providers = provider_ids?.length
    ? trx
      .insertInto('patient_encounter_providers')
      .values(provider_ids.map((provider_id) => ({
        patient_encounter_id: upserted.id,
        provider_id,
      })))
      .returning('id')
      .execute()
    : Promise.resolve([])

  await waiting_room.add(trx, {
    patient_encounter_id: upserted.id,
    facility_id,
  })

  const providers = await adding_providers

  return {
    ...upserted,
    provider_ids: providers.map((p) => p.id),
  }
}

export function addProvider(
  trx: TrxOrDb,
  { encounter_id, provider_id, seen_now }: {
    encounter_id: number
    provider_id: number
    seen_now?: boolean
  },
) {
  return trx
    .insertInto('patient_encounter_providers')
    .values({
      patient_encounter_id: encounter_id,
      provider_id,
      seen_at: seen_now ? sql<Date>`now()` : null,
    })
    .returning(['id', 'seen_at'])
    .executeTakeFirstOrThrow()
}

export function markProviderSeen(
  trx: TrxOrDb,
  { patient_encounter_provider_id }: {
    patient_encounter_provider_id: number
  },
) {
  return trx
    .updateTable('patient_encounter_providers')
    .set({ seen_at: sql<Date>`now()` })
    .where('patient_encounter_providers.id', '=', patient_encounter_provider_id)
    .returning(['id', 'seen_at'])
    .executeTakeFirstOrThrow()
}

export const ofHealthWorker = (trx: TrxOrDb, health_worker_id: number) =>
  trx
    .selectFrom('patient_encounter_providers')
    .innerJoin(
      'employment',
      'patient_encounter_providers.provider_id',
      'employment.id',
    )
    .where('employment.health_worker_id', '=', health_worker_id)
    .select('patient_encounter_providers.patient_encounter_id')
    .distinct()

export const baseQuery = (trx: TrxOrDb) =>
  trx
    .selectFrom('patient_encounters')
    .leftJoin(
      'waiting_room',
      'waiting_room.patient_encounter_id',
      'patient_encounters.id',
    )
    .select((eb) => [
      'patient_encounters.id as encounter_id',
      'patient_encounters.created_at',
      'patient_encounters.closed_at',
      'patient_encounters.reason',
      'patient_encounters.notes',
      'patient_encounters.appointment_id',
      'patient_encounters.patient_id',
      'waiting_room.id as waiting_room_id',
      'waiting_room.facility_id as waiting_room_facility_id',
      jsonArrayFrom(
        eb.selectFrom('patient_encounter_providers')
          .innerJoin(
            'employment',
            'employment.id',
            'patient_encounter_providers.provider_id',
          )
          .innerJoin(
            'health_workers',
            'health_workers.id',
            'employment.health_worker_id',
          )
          .select([
            'patient_encounter_providers.id as patient_encounter_provider_id',
            'employment.id as employment_id',
            'employment.facility_id',
            'employment.profession',
            'health_workers.id as health_worker_id',
            'health_workers.name as health_worker_name',
            'patient_encounter_providers.seen_at',
          ])
          .whereRef(
            'patient_encounter_providers.patient_encounter_id',
            '=',
            'patient_encounters.id',
          ),
      ).as('providers'),
    ])
    .orderBy('patient_encounters.created_at', 'desc')

export function get(
  trx: TrxOrDb,
  { patient_id, encounter_id }: {
    patient_id: number
    encounter_id: number | 'open'
  },
): Promise<RenderedPatientEncounter | undefined> {
  let query = baseQuery(trx)
    .where('patient_encounters.patient_id', '=', patient_id)

  query = encounter_id === 'open'
    ? query.where('patient_encounters.closed_at', 'is', null)
    : query.where('patient_encounters.id', '=', encounter_id)

  return query.executeTakeFirst()
}

export function getOpen(trx: TrxOrDb, patient_id: number) {
  return get(trx, { patient_id, encounter_id: 'open' })
}
