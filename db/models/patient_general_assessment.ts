import { TrxOrDb } from '../../types.ts'
import { assertOr400 } from '../../util/assertOr.ts'
import { now } from '../helpers.ts'

export async function upsert(
  trx: TrxOrDb,
  patient_id: number,
  general_assessments: { id: string }[],
): Promise<void> {
  assertOr400(
    general_assessments.length ===
      new Set(general_assessments.map((item) => item.id)).size,
    'Assessment ids must be unique',
  )

  const removing = trx
    .deleteFrom('patient_general_assessment')
    .where('patient_id', '=', patient_id)
    .where('created_at', '<=', now)
    .execute()

  const adding = general_assessments.length && trx
    .insertInto('patient_general_assessment')
    .values(general_assessments.map(({ id }) => ({
      patient_id,
      general_assessment_id: id,
    })))
    .execute()

  await Promise.all([removing, adding])
}

export function get(
  trx: TrxOrDb,
  patient_id: number,
): Promise<{ id: string }[]> {
  return trx
    .selectFrom('patient_general_assessment')
    .where('patient_general_assessment.patient_id', '=', patient_id)
    .select(['patient_general_assessment.general_assessment_id as id'])
    .execute()
}
