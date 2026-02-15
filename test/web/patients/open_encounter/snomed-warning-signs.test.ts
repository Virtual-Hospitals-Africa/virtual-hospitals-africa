import { assertEquals } from 'std/assert/assert_equals.ts'
import { afterAll, before } from 'std/testing/bdd.ts'
import db from '../../../../db/db.ts'
import { addTestEmployeeWithSession } from 'test/_helpers/employees.ts'
import { createTestOrganization } from 'test/_helpers/organizations.ts'
import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import waitUntilTestServerUp from 'test/_helpers/waitUntilTestServerUp.ts'
import { insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest } from 'test/_helpers/workflows.ts'
import asFormData from '../../../../util/asFormData.ts'

describeParallel('snomed-warning-signs', () => {
  before(waitUntilTestServerUp)
  afterAll(() => db.destroy())

  describeParallel('GET', () => {
    itParallel(
      'responds to a search for earache',
      async () => {
        const clinic = await createTestOrganization(db)
        const { health_worker: nurse, fetchJson } = await addTestEmployeeWithSession(db, {
          profession: 'nurse',

          organization_id: clinic.id,
        })

        const encounter = await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
          db,
          nurse.organization_id,
          {
            employment_id: nurse.employee_id,
          },
        )

        const first_page = await fetchJson(
          `/app/organizations/${clinic.id}/patients/${encounter.patient.id}/open_encounter/snomed-warning-signs?search=earache`,
        )

        assertEquals(first_page, {
          'page': 1,
          'rows_per_page': 20,
          'results': [
            {
              'clinical_finding_s_expression': '(clinical_finding (snomed_concept "Pain of ear" "finding"))',
              'snomed_concept_id': '301354004',
              'primary_name': 'Pain of ear',
              'secondary_text': 'finding',
              'category': 'Search Results',
              'similarity': 1,
            },
            {
              'clinical_finding_s_expression': '(clinical_finding (snomed_concept "Otalgia of left ear" "finding"))',
              'snomed_concept_id': '1010233001',
              'primary_name': 'Otalgia of left ear',
              'secondary_text': 'finding',
              'category': 'Search Results',
              'similarity': 0.47058824,
            },
            {
              'clinical_finding_s_expression': '(clinical_finding (snomed_concept "Bilateral earache" "finding"))',
              'snomed_concept_id': '162359003',
              'primary_name': 'Bilateral earache',
              'secondary_text': 'finding',
              'category': 'Search Results',
              'similarity': 0.44444445,
            },
            {
              'clinical_finding_s_expression': '(clinical_finding (snomed_concept "Otalgia of right ear" "finding"))',
              'snomed_concept_id': '1010234007',
              'primary_name': 'Otalgia of right ear',
              'secondary_text': 'finding',
              'category': 'Search Results',
              'similarity': 0.44444445,
            },
            {
              'clinical_finding_s_expression': '(clinical_finding (snomed_concept "Aching pain" "finding"))',
              'snomed_concept_id': '27635008',
              'primary_name': 'Aching pain',
              'secondary_text': 'finding',
              'category': 'Search Results',
              'similarity': 0.3,
            },
          ],
          'has_next_page': false,
          'search_terms': {
            'patient_id': encounter.patient.id,
            'categories': ['finding', 'morphologic abnormality', 'disorder'],
            'search': 'earache',
          },
        })
      },
    )

    itParallel(
      'responds to a search for appendicular pain, which has priority Urgent by virtue of it being a descendant of Abdominal pain',
      async () => {
        const clinic = await createTestOrganization(db)
        const { health_worker: nurse, fetchJson } = await addTestEmployeeWithSession(db, {
          profession: 'nurse',

          organization_id: clinic.id,
        })

        const encounter = await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
          db,
          nurse.organization_id,
          {
            employment_id: nurse.employee_id,
          },
        )

        const { results } = await fetchJson(
          `/app/organizations/${clinic.id}/patients/${encounter.patient.id}/open_encounter/snomed-warning-signs?search=appendicular+pain`,
        )

        assertEquals(results[0], {
          'clinical_finding_s_expression': '(clinical_finding (snomed_concept "Appendicular pain" "finding"))',
          'snomed_concept_id': '275406005',
          'primary_name': 'Appendicular pain',
          'secondary_text': 'finding',
          'sats_priority': 'Urgent',
          'sats_priority_by_virtue_of_matching_warning_sign': 'Abdominal pain',
          'similarity': 1,
          'category': 'Search Results',
        })
      },
    )

    itParallel(
      'responds to a search for appendicular pain for a pregnant person, which has priority Very urgent by virtue of it being a descendant of Abdominal pain',
      async () => {
        const clinic = await createTestOrganization(db)
        const { health_worker: nurse, fetchJson, fetchOk } = await addTestEmployeeWithSession(db, {
          profession: 'nurse',

          organization_id: clinic.id,
        })

        const encounter = await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
          db,
          nurse.organization_id,
          {
            employment_id: nurse.employee_id,
          },
        )

        await fetchOk(
          `/app/organizations/${clinic.id}/patients/${encounter.patient.id}/open_encounter/triage/brief_history`,
          {
            method: 'POST',
            body: asFormData({
              diabetes: {
                existence: 'No',
              },
              pregnancy: {
                existence: 'Yes',
              },
            }),
          },
          { cancel_response_body: true },
        )

        const { results } = await fetchJson(
          `/app/organizations/${clinic.id}/patients/${encounter.patient.id}/open_encounter/snomed-warning-signs?search=appendicular+pain`,
        )

        assertEquals(results[0], {
          'clinical_finding_s_expression': '(clinical_finding (snomed_concept "Appendicular pain" "finding"))',
          'snomed_concept_id': '275406005',
          'primary_name': 'Appendicular pain',
          'secondary_text': 'finding',
          'sats_priority': 'Very urgent',
          'sats_priority_by_virtue_of_matching_warning_sign': 'Pregnancy and abdominal pain',
          'similarity': 1,
          'category': 'Search Results',
        })
      },
    )
  })
})
