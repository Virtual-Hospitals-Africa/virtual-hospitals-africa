import { assert } from 'std/assert/assert.ts'
import { EncounterReason } from '../../db.d.ts'
import { TrxOrDb } from '../../types.ts'
import * as patient_encounters from './patient_encounters.ts'

function baseQuery(trx: TrxOrDb) {
  return trx
    .selectFrom('patients')
    .innerJoin('patient_intake', 'patient_intake.patient_id', 'patients.id')
    .leftJoin(
      'patient_intake_visit_reason',
      'patient_intake_visit_reason.patient_intake_id',
      'patient_intake.id',
    )
    .selectAll('patient_intake_visit_reason')
    .selectAll('patient_intake')
}

export function get(
  trx: TrxOrDb,
  { patient_id, organization_id }: {
    patient_id: string
    organization_id: string
  },
) {
  return baseQuery(trx)
    .where('patients.id', '=', patient_id)
    .where('patient_intake.organization_id', '=', organization_id)
    .executeTakeFirstOrThrow()
}

export function insert(
  trx: TrxOrDb,
  intake: {
    patient_id: string
    organization_id: string
    being_taken_by: string
  },
) {
  return trx.insertInto('patient_intake')
    .values(intake)
    .returning('id')
    .executeTakeFirstOrThrow()
}

export function upsertReason(
  trx: TrxOrDb,
  values: {
    patient_intake_id: string
    reason: EncounterReason
    emergency: boolean
    department_id: string
    notes?: string
  },
) {
  return trx.insertInto('patient_intake_visit_reason')
    .values(values)
    .onConflict((oc) => oc.column('patient_intake_id').doUpdateSet(values))
    .executeTakeFirstOrThrow()
}

export async function startEncounter(
  trx: TrxOrDb,
  { patient_intake_id }: { patient_intake_id: string },
) {
  const patient_intake = await baseQuery(trx)
    .where('patient_intake.id', '=', patient_intake_id)
    .executeTakeFirstOrThrow()

  assert(patient_intake.reason, 'Reason is required')
  console.log(`TODO handle emergency`, { emergency: patient_intake.emergency })
  console.log(`TODO handle department_id`, {
    department_id: patient_intake.department_id,
  })

  await Promise.all([
    patient_encounters.insert(trx, patient_intake.organization_id, {
      patient_id: patient_intake.patient_id,
      provider_ids: [patient_intake.being_taken_by],
      reason: patient_intake.reason,
      notes: patient_intake.notes ?? undefined,
      // emergency: patient_intake.emergency,
      // department_id: patient_intake.department_id,
    }),
    trx.deleteFrom('patient_intake')
      .where('id', '=', patient_intake_id)
      .execute(),
    trx.updateTable('patients')
      .where('id', '=', patient_intake.patient_id)
      .set('completed_intake', true)
      .executeTakeFirstOrThrow(),
  ])
}
