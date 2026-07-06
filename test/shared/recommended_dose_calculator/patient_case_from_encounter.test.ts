import { assertEquals } from 'std/assert/assert_equals.ts'
import { describe, it } from 'std/testing/bdd.ts'
import { positiveRecordsFromEncounter } from '../../../shared/recommended_dose_calculator/patient_case_from_encounter.ts'
import { DEFINITE, EQUIVOCAL } from '../../../shared/snomed_concepts.ts'

describe('shared/recommended_dose_calculator/patient_case_from_encounter.ts', () => {
  it('yields positive diagnoses and findings, skipping negatives and measurements', () => {
    const records = Array.from(
      positiveRecordsFromEncounter({
        this_visit_diagnoses: [
          {
            specific_snomed_concept_id: '195967001',
            type: 'evaluation',
            value: { type: 'snomed_concept', name: EQUIVOCAL.name },
          } as never,
          {
            specific_snomed_concept_id: '73211009',
            type: 'evaluation',
            value: { type: 'snomed_concept', name: DEFINITE.name },
          } as never,
        ],
        this_visit_findings: [{
          workflow: 'triage',
          status: 'in progress',
          steps: [{
            workflow_step: 'warning_signs',
            title: 'Warning Signs',
            status: 'completed',
            records: [
              {
                specific_snomed_concept_id: '44054006',
                type: 'finding',
                existence: 'Yes',
                value: null,
              } as never,
              {
                specific_snomed_concept_id: '55284004',
                type: 'finding',
                existence: 'No',
                value: null,
              } as never,
              {
                specific_snomed_concept_id: '271649006',
                type: 'finding',
                existence: 'Yes',
                value: { type: 'measurement' },
              } as never,
              {
                specific_snomed_concept_id: '38341003',
                type: 'evaluation',
              } as never,
            ],
          }],
        }],
      }),
    )

    assertEquals(
      records.map((record) => record.specific_snomed_concept_id),
      ['73211009', '44054006', '38341003'],
    )
  })
})
