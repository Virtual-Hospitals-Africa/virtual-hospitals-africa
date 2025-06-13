import { EncounterReason } from '../../db.d.ts'
import { TrxOrDb } from '../../types.ts'

export function get(
  trx: TrxOrDb,
  { patient_id, organization_id }: {
    patient_id: string
    organization_id: string
  },
) {
  return trx
    .selectFrom('patients')
    .innerJoin('patient_intake', 'patient_intake.patient_id', 'patients.id')
    .leftJoin(
      'patient_intake_visit_reason',
      'patient_intake_visit_reason.patient_intake_id',
      'patient_intake.id',
    )
    .where('patients.id', '=', patient_id)
    .where('patient_intake.organization_id', '=', organization_id)
    .selectAll('patient_intake')
    .selectAll('patient_intake_visit_reason')
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
    .onConflict((oc) => oc.doUpdateSet(values))
    .executeTakeFirstOrThrow()
}
