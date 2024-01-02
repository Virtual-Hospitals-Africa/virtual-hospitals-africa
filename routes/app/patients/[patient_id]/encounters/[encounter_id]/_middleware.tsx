import { FreshContext } from '$fresh/server.ts'
import { WithSession } from 'fresh_session'
import {
  EmployedHealthWorker,
  RenderedPatientEncounter,
  RenderedPatientEncounterProvider,
  TrxOrDb,
} from '../../../../../../types.ts'
import * as patient_encounters from '../../../../../../db/models/patient_encounters.ts'
import * as waiting_room from '../../../../../../db/models/waiting_room.ts'
import {
  assertOr403,
  assertOr404,
  StatusError,
} from '../../../../../../util/assertOr.ts'
import getNumericParam from '../../../../../../util/getNumericParam.ts'
import { assert } from 'std/assert/assert.ts'

function getEncounterId(ctx: FreshContext): 'open' | number {
  if (ctx.params.encounter_id === 'open') {
    return 'open'
  }
  return getNumericParam(ctx, 'encounter_id')
}

export type EncounterContext = FreshContext<
  WithSession & {
    trx: TrxOrDb
    encounter: RenderedPatientEncounter
    encounter_provider: RenderedPatientEncounterProvider
    healthWorker: EmployedHealthWorker
  }
>

export async function handler(
  _req: Request,
  ctx: EncounterContext,
) {
  const encounter_id = getEncounterId(ctx)
  const patient_id = getNumericParam(ctx, 'patient_id')
  const { trx, healthWorker } = ctx.state

  const encounter = await patient_encounters.get(trx, {
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

  const matching_provider = encounter.providers.find(
    (provider) => provider.health_worker_id === healthWorker.id,
  )

  if (!matching_provider) {
    const facility_id = encounter.waiting_room_facility_id
    assertOr403(
      facility_id,
      'You do not have access to this patient at this time. The patient is being seen at a facility you do not work at. Please contact the facility to get access to the patient.',
    )
    assert(encounter.waiting_room_id)
    const employment = healthWorker.employment.find(
      (e) => e.facility_id === facility_id,
    )
    assertOr403(
      employment,
      'You do not have access to this patient at this time. The patient is being seen at a facility you do not work at. Please contact the facility to get access to the patient.',
    )
    const provider = employment.roles.doctor || employment.roles.nurse
    if (!provider) {
      assert(employment.roles.admin)
      // TODO: revisit whether this is true
      throw new StatusError(
        'You must be a nurse or doctor to edit patient information as part of an encounter',
        403,
      )
    }

    const added_provider = await patient_encounters.addProvider(trx, {
      encounter_id: encounter.encounter_id,
      provider_id: provider.employment_id,
      seen_now: true,
    })

    assert(added_provider.seen_at)

    ctx.state.encounter_provider = {
      patient_encounter_provider_id: added_provider.id,
      employment_id: provider.employment_id,
      facility_id: employment.facility_id,
      profession: employment.roles.doctor ? 'doctor' : 'nurse',
      health_worker_id: healthWorker.id,
      health_worker_name: healthWorker.name,
      seen_at: added_provider.seen_at,
    }
    encounter.providers.push(ctx.state.encounter_provider)
  } else if (!matching_provider.seen_at) {
    const { seen_at } = await patient_encounters.markProviderSeen(trx, {
      patient_encounter_provider_id:
        matching_provider.patient_encounter_provider_id,
    })
    assert(seen_at)
    matching_provider.seen_at = seen_at
    ctx.state.encounter_provider = matching_provider
  } else {
    ctx.state.encounter_provider = matching_provider
  }

  await removing_from_waiting_room

  ctx.state.encounter = encounter
  return ctx.next()
}
