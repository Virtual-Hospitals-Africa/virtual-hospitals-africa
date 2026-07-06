import { assertEquals } from 'std/assert/assert_equals.ts'
import { describe, it } from 'std/testing/bdd.ts'
import { buildPatientCaseFromEncounter, snomedConceptIdsFromEncounter } from '../../../shared/recommended_dose_calculator/patient_case_from_encounter.ts'

describe('shared/recommended_dose_calculator/patient_case_from_encounter.ts', () => {
  it('collects SNOMED concept ids from diagnoses and findings', () => {
    assertEquals(
      snomedConceptIdsFromEncounter({
        this_visit_diagnoses: [{
          specific_snomed_concept_id: '195967001',
          type: 'evaluation',
        } as never],
        this_visit_findings: [{
          workflow: 'triage',
          status: 'in progress',
          steps: [{
            workflow_step: 'warning_signs',
            title: 'Warning Signs',
            status: 'completed',
            records: [{
              specific_snomed_concept_id: '44054006',
              type: 'finding',
            } as never],
          }],
        }],
      }),
      ['195967001', '44054006'],
    )
  })

  it('builds a patient case when required encounter data is present', () => {
    const built = buildPatientCaseFromEncounter({
      patient: {
        date_of_birth: '1990-01-01',
        sex: 'female',
      },
      measurements: {
        height_cm: '170',
        weight_kg: '70',
      },
      snomed_concept_ids: ['195967001'],
    })

    assertEquals(built.ok, true)
    if (!built.ok) return
    assertEquals(built.patient_case.dob, '1990-01-01')
    assertEquals(built.patient_case.sex, 'female')
    assertEquals(built.patient_case.snomed_concept_ids, ['195967001'])
  })
})
