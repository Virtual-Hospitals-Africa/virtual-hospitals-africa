import { sql } from 'kysely'
import {
  Maybe,
  RenderedPatientEncounter,
  RenderedPatientEncounterProvider,
  TrxOrDb,
} from '../../types.ts'
import * as waiting_room from './waiting_room.ts'
import * as examinations from './examinations.ts'
import * as patients from './patients.ts'
import isObjectLike from '../../util/isObjectLike.ts'
import { assertOr400, assertOr403, assertOr404 } from '../../util/assertOr.ts'
import { jsonArrayFrom, jsonArrayFromColumn, now } from '../helpers.ts'
import { EncounterReason, EncounterStep } from '../../db.d.ts'
import { ENCOUNTER_REASONS } from '../../shared/encounter.ts'
import { ensureProviderId } from './providers.ts'
import { EmployedHealthWorker } from '../../types.ts'
import { assert } from 'std/assert/assert.ts'
import uniq from '../../util/uniq.ts'

export type Upsert =
  & {
    encounter_id?: Maybe<number>
    reason: EncounterReason
    provider_ids?: number[]
    appointment_id?: Maybe<number>
    notes?: Maybe<string>
    intake?: Maybe<string>
  }
  & (
    | { patient_id: number; patient_name?: Maybe<string> }
    | { patient_id?: Maybe<number>; patient_name: string }
  )

export function assertIsEncounterReason(
  str: string,
): asserts str is EncounterReason {
  assertOr400(ENCOUNTER_REASONS.has(str as EncounterReason))
}

export function assertIsUpsert(
  obj: unknown,
): asserts obj is Upsert {
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
  assertOr400(obj.intake == null || typeof obj.intake === 'string')
}

export async function upsert(
  trx: TrxOrDb,
  organization_id: number,
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
  waiting_room_id: number
  created_at: Date
  providers: {
    encounter_provider_id: number
    provider_id: number
  }[]
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
        provider_id: ensureProviderId(trx, provider_id),
      })))
      .returning([
        'id as encounter_provider_id',
        'provider_id',
      ])
      .execute()
    : Promise.resolve([])

  const waiting_room_added = await waiting_room.add(trx, {
    patient_encounter_id: upserted.id,
    organization_id,
  })

  return {
    ...upserted,
    waiting_room_id: waiting_room_added.id,
    providers: await adding_providers,
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
  examinations.forPatientEncounter(trx)
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
      'waiting_room.organization_id as waiting_room_organization_id',
      jsonArrayFromColumn(
        'encounter_step',
        eb.selectFrom('patient_encounter_steps')
          .innerJoin(
            'encounter',
            'encounter.step',
            'patient_encounter_steps.encounter_step',
          )
          .whereRef('patient_encounter_id', '=', 'patient_encounters.id')
          .orderBy('encounter.order desc')
          .select('encounter_step'),
      ).as('steps_completed'),
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
          .select((eb_providers) => [
            'patient_encounter_providers.id as patient_encounter_provider_id',
            'employment.id as employment_id',
            'employment.organization_id',
            'employment.profession',
            'health_workers.id as health_worker_id',
            'health_workers.name as health_worker_name',
            eb_providers('patient_encounter_providers.seen_at', 'is not', null)
              .as('seen'),
          ])
          .whereRef(
            'patient_encounter_providers.patient_encounter_id',
            '=',
            'patient_encounters.id',
          ),
      ).as('providers'),
      jsonArrayFrom(
        eb.selectFrom('patient_examinations_with_recommendations')
          .selectAll('patient_examinations_with_recommendations')
          .whereRef(
            'patient_examinations_with_recommendations.encounter_id',
            '=',
            'patient_encounters.id',
          ),
      ).as('examinations'),
    ])
    .orderBy('patient_encounters.created_at', 'desc')

export const openQuery = (trx: TrxOrDb) =>
  baseQuery(trx).where('patient_encounters.closed_at', 'is', null)

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

export function completedStep(
  trx: TrxOrDb,
  { encounter_id, step }: {
    encounter_id: number
    step: EncounterStep
  },
) {
  return trx.insertInto('patient_encounter_steps')
    .values({ patient_encounter_id: encounter_id, encounter_step: step })
    .onConflict((oc) => oc.doNothing())
    .execute()
}

export function close(
  trx: TrxOrDb,
  { encounter_id }: {
    encounter_id: number
  },
) {
  return trx.updateTable('patient_encounters')
    .set({
      closed_at: now,
    })
    .where('id', '=', encounter_id)
    .executeTakeFirstOrThrow()
}

/*
  Note: this modifies health_worker.open_encounters in place
*/
export async function removeFromWaitingRoomAndAddSelfAsProvider(
  trx: TrxOrDb,
  { health_worker, patient_id, encounter_id }: {
    health_worker: EmployedHealthWorker
    patient_id: number
    encounter_id: number | 'open'
  },
): Promise<{
  encounter: RenderedPatientEncounter
  encounter_provider: RenderedPatientEncounterProvider
}> {
  const encounter = health_worker.open_encounters.find(
    (e) => encounter_id === 'open' && (e.patient_id === patient_id),
  ) || await get(trx, {
    encounter_id,
    patient_id,
  })

  // TODO: start an encounter if it doesn't exist?
  assertOr404(encounter, 'No open visit with this patient')

  const removing_from_waiting_room = encounter.waiting_room_id && (
    waiting_room.remove(trx, {
      id: encounter.waiting_room_id,
    })
  )

  let matching_provider = encounter.providers.find(
    (provider) => provider.health_worker_id === health_worker.id,
  )
  if (!matching_provider) {
    const being_seen_at_organizations = encounter.waiting_room_organization_id
      ? [encounter.waiting_room_organization_id]
      : uniq(
        encounter.providers.map((p) => p.organization_id),
      )

    const employment = health_worker.employment.find(
      (e) => being_seen_at_organizations.includes(e.organization.id),
    )
    assertOr403(
      employment,
      'You do not have access to this patient at this time. The patient is being seen at a organization you do not work at. Please contact the organization to get access to the patient.',
    )

    const provider = employment.roles.doctor || employment.roles.nurse

    if (!provider) {
      assert(employment.roles.admin)
      assertOr403(
        false,
        'You must be a nurse or doctor to edit patient information as part of an encounter',
      )
    }

    const added_provider = await addProvider(trx, {
      encounter_id: encounter.encounter_id,
      provider_id: provider.employment_id,
      seen_now: true,
    })

    assert(added_provider.seen_at)

    matching_provider = {
      patient_encounter_provider_id: added_provider.id,
      employment_id: provider.employment_id,
      organization_id: employment.organization.id,
      profession: employment.roles.doctor ? 'doctor' : 'nurse',
      health_worker_id: health_worker.id,
      health_worker_name: health_worker.name,
      seen: true,
    }
    encounter.providers.push(matching_provider)
  } else if (!matching_provider.seen) {
    const { seen_at } = await markProviderSeen(trx, {
      patient_encounter_provider_id:
        matching_provider.patient_encounter_provider_id,
    })
    assert(seen_at)
    matching_provider.seen = true
  }

  await removing_from_waiting_room

  return {
    encounter,
    encounter_provider: matching_provider,
  }
}
