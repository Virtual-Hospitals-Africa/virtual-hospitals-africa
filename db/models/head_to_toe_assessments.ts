import { assert } from 'std/assert/assert.ts'
import type { TrxOrDb } from '../../types.ts'
import { jsonArrayFrom } from '../helpers.ts'
import { ensureEncounterId } from './patient_encounters.ts'
import { assertIsExamination } from '../../shared/examinations.ts'

export async function forPatientEncounter(trx: TrxOrDb, opts: {
  patient_id: string
  encounter_id: string
}) {
  const examinations = await trx.selectFrom('examinations')
    .leftJoin(
      'patient_examinations',
      (qb) =>
        qb
          .onRef(
            'patient_examinations.examination_name',
            '=',
            'examinations.name',
          )
          .on(
            'patient_examinations.encounter_id',
            '=',
            ensureEncounterId(trx, opts),
          ),
    )
    .select((eb) => [
      'examinations.name as examination_name',
      'examinations.tab',
      'examinations.page',
      'examinations.path',
      'patient_examinations.completed',
      'patient_examinations.skipped',
      'patient_examinations.ordered',
      jsonArrayFrom(
        eb.selectFrom('patient_examination_findings')
          .whereRef(
            'patient_examination_findings.patient_examination_id',
            '=',
            'patient_examinations.id',
          )
          .innerJoin(
            'snomed_concepts',
            'snomed_concepts.snomed_concept_id',
            'patient_examination_findings.snomed_concept_id',
          )
          .select([
            'snomed_concept_id',
            'snomed_concepts.english_term as snomed_english_term',
            'additional_notes',
          ])
          .select((eb_findings) =>
            jsonArrayFrom(
              eb_findings.selectFrom('patient_examination_finding_body_sites')
                .whereRef(
                  'patient_examination_finding_body_sites.patient_examination_finding_id',
                  '=',
                  'patient_examination_findings.id',
                )
                .innerJoin(
                  'snomed_concepts',
                  'snomed_concepts.snomed_concept_id',
                  'patient_examination_finding_body_sites.snomed_concept_id',
                )
                .select([
                  'snomed_concepts.snomed_concept_id',
                  'snomed_concepts.english_term as snomed_english_term',
                ]),
            ).as('body_sites')
          ),
      ).as('findings'),
    ])
    .where('examinations.name', 'like', 'Head-to-toe Assessment%')
    .orderBy('examinations.order', 'asc')
    .execute()

  return examinations.map(({ examination_name, ...ex }) => {
    assertIsExamination(examination_name)
    assert(
      examination_name.startsWith('Head-to-toe Assessment'),
      `examination_name must start with Head-to-toe Assessment but got ${examination_name}`,
    )
    assert(
      ex.path.startsWith('/head_to_toe_assessment'),
      `path must start with /head_to_toe_assessment but got ${ex.path}`,
    )

    const href =
      `/app/patients/${opts.patient_id}/encounters/${opts.encounter_id}${ex.path}`

    return {
      ...ex,
      examination_name,
      href,
    }
  })
}
