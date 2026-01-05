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
        const { health_worker: nurse, fetchJson } =
          await addTestEmployeeWithSession(db, {
            profession: 'nurse',
            registration_status: 'approved',
            organization_id: clinic.id,
          })

        const encounter =
          await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
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
              'id': '301354004',
              'description_id': '4696155015',
              'language_code': 'en',
              'name': 'Pain of ear',
              'category': 'finding',
              'best_similarity': 1,
              'priority': null,
            },
            {
              'id': '1010233001',
              'description_id': '4212225016',
              'language_code': 'en',
              'name': 'Otalgia of left ear',
              'category': 'finding',
              'best_similarity': 0.47058824,
              'priority': null,
            },
            {
              'id': '162359003',
              'description_id': '2691690017',
              'language_code': 'en',
              'name': 'Bilateral earache',
              'category': 'finding',
              'best_similarity': 0.44444445,
              'priority': null,
            },
            {
              'id': '1010234007',
              'description_id': '4212229010',
              'language_code': 'en',
              'name': 'Otalgia of right ear',
              'category': 'finding',
              'best_similarity': 0.44444445,
              'priority': null,
            },
            {
              'id': '27635008',
              'description_id': '758225015',
              'language_code': 'en',
              'name': 'Aching pain',
              'category': 'finding',
              'best_similarity': 0.3,
              'priority': null,
            },
          ],
          'has_next_page': false,
          'search_terms': {
            'patient_id': encounter.patient.id,
            'categories': ['disorder', 'finding', 'morphologic abnormality'],
            'search': 'earache',
          },
        })
      },
    )

    itParallel(
      'responds to a search for appendicular pain, which has priority Urgent by virtue of it being a descendant of Abdominal pain',
      async () => {
        const clinic = await createTestOrganization(db)
        const { health_worker: nurse, fetchJson } =
          await addTestEmployeeWithSession(db, {
            profession: 'nurse',
            registration_status: 'approved',
            organization_id: clinic.id,
          })

        const encounter =
          await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
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
          'id': '275406005',
          'description_id': '668271011',
          'language_code': 'en',
          'name': 'Appendicular pain',
          'category': 'finding',
          'best_similarity': 1,
          'priority': {
            'name': 'Urgent',
            'warning_sign': 'Abdominal pain',
          },
        })
      },
    )

    itParallel(
      'responds to a search for appendicular pain for a pregnant person, which has priority Very urgent by virtue of it being a descendant of Abdominal pain',
      async () => {
        const clinic = await createTestOrganization(db)
        const { health_worker: nurse, fetchJson, fetchOk } =
          await addTestEmployeeWithSession(db, {
            profession: 'nurse',
            registration_status: 'approved',
            organization_id: clinic.id,
          })

        const encounter =
          await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
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
          'id': '275406005',
          'description_id': '668271011',
          'language_code': 'en',
          'name': 'Appendicular pain',
          'category': 'finding',
          'best_similarity': 1,
          'priority': {
            'name': 'Very urgent',
            'warning_sign': 'Pregnancy and abdominal pain',
          },
        })
      },
    )
  })
})
