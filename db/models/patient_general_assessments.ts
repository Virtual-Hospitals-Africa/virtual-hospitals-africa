import { GeneralAssessmentCategory, TrxOrDb } from '../../types.ts'
import { assertOr400 } from '../../util/assertOr.ts'
import { jsonArrayFrom, now } from '../helpers.ts'
import memoize from '../../util/memoize.ts'

export const getAll = memoize(
  async (trx: TrxOrDb): Promise<Set<string>> => {
    const all = await trx
      .selectFrom('general_assessments')
      .select('assessment')
      .execute()

    return new Set(all.map((a) => a.assessment))
  },
  () => 'general_assessments',
)

export async function upsert(
  trx: TrxOrDb,
  { patient_id, encounter_id, encounter_provider_id, assessments }: {
    patient_id: number
    encounter_id: number
    encounter_provider_id: number
    assessments: string[]
  },
): Promise<void> {
  assertOr400(
    assessments.length ===
      new Set(assessments).size,
    'Assessments must be unique',
  )

  const all_assessments = await getAll(trx)
  for (const assessment of assessments) {
    assertOr400(
      all_assessments.has(assessment),
      `${assessment} is not a recognized assessment`,
    )
  }

  const removing = trx
    .deleteFrom('patient_general_assessments')
    .where('encounter_id', '=', encounter_id)
    .where('created_at', '<=', now)
    .execute()

  const adding = assessments.length && trx
    .insertInto('patient_general_assessments')
    .values(assessments.map((assessment) => ({
      patient_id,
      encounter_id,
      assessment,
      encounter_provider_id,
    })))
    .execute()

  await Promise.all([removing, adding])
}

export function get(
  trx: TrxOrDb,
  { patient_id, encounter_id }: { patient_id: number; encounter_id: number },
) {
  return trx
    .selectFrom('patient_general_assessments')
    .where('patient_id', '=', patient_id)
    .where('encounter_id', '=', encounter_id)
    .select(['assessment'])
    .execute()
}

export function getByCategory(
  trx: TrxOrDb,
  { patient_id, encounter_id }: { patient_id: number; encounter_id: number },
): Promise<GeneralAssessmentCategory[]> {
  return trx
    .selectFrom('general_assessment_categories')
    .select((eb) => [
      'general_assessment_categories.category',
      jsonArrayFrom(
        eb.selectFrom('general_assessments')
          .whereRef('category', '=', 'general_assessment_categories.category')
          .leftJoin(
            'patient_general_assessments',
            (join) =>
              join.onRef(
                'general_assessments.assessment',
                '=',
                'patient_general_assessments.assessment',
              )
                .on('patient_general_assessments.patient_id', '=', patient_id)
                .on(
                  'patient_general_assessments.encounter_id',
                  '=',
                  encounter_id,
                ),
          )
          .select((eb) => [
            'general_assessments.assessment',
            eb('patient_general_assessments.assessment', 'is not', null).as(
              'checked',
            ),
          ]),
      ).as('assessments'),
    ])
    .orderBy('general_assessment_categories.order', 'asc')
    .execute()
}
