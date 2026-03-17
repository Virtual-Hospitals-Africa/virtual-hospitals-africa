import { assertEquals } from 'std/assert/assert_equals.ts'
import { afterAll, before } from 'std/testing/bdd.ts'
import db from '../../../../db/db.ts'
import { addTestEmployeeWithSession } from 'test/_helpers/employees.ts'
import { createTestOrganization } from 'test/_helpers/organizations.ts'
import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import waitUntilTestServerUp from 'test/_helpers/waitUntilTestServerUp.ts'

describeParallel('snomed-warning-signs', () => {
  before(waitUntilTestServerUp)
  afterAll(() => db.destroy())

  describeParallel('GET', () => {
    itParallel(
      'responds to a search for earache',
      async () => {
        const clinic = await createTestOrganization(db)
        const { fetchJSON } = await addTestEmployeeWithSession(db, {
          role: 'nurse',
          organization_id: clinic.id,
        })

        const first_page = await fetchJSON(
          `/app/snomed/warning-signs?age_determination=adult&search=earache`,
        )

        assertEquals(first_page, {
          'page': 1,
          'rows_per_page': 10,
          'results': [
            {
              'clinical_finding_s_expression': '(clinical_finding (snomed_concept "Pain of ear" "finding"))',
              'snomed_concept_id': '301354004',
              'name': 'Pain of ear',
              'description': 'finding',
              'category': 'Search Results',
              'best_similarity': 1,
              'priority': null,
              'priority_by_virtue_of_matching_warning_sign': null,
            },
            {
              'clinical_finding_s_expression': '(clinical_finding (snomed_concept "Otalgia of left ear" "finding"))',
              'snomed_concept_id': '1010233001',
              'name': 'Otalgia of left ear',
              'description': 'finding',
              'category': 'Search Results',
              'best_similarity': 0.47058824,
              'priority': null,
              'priority_by_virtue_of_matching_warning_sign': null,
            },
            {
              'clinical_finding_s_expression': '(clinical_finding (snomed_concept "Bilateral earache" "finding"))',
              'snomed_concept_id': '162359003',
              'name': 'Bilateral earache',
              'description': 'finding',
              'category': 'Search Results',
              'best_similarity': 0.44444445,
              'priority': null,
              'priority_by_virtue_of_matching_warning_sign': null,
            },
            {
              'clinical_finding_s_expression': '(clinical_finding (snomed_concept "Otalgia of right ear" "finding"))',
              'snomed_concept_id': '1010234007',
              'name': 'Otalgia of right ear',
              'description': 'finding',
              'category': 'Search Results',
              'best_similarity': 0.44444445,
              'priority': null,
              'priority_by_virtue_of_matching_warning_sign': null,
            },
            {
              'clinical_finding_s_expression': '(clinical_finding (snomed_concept "Aching pain" "finding"))',
              'snomed_concept_id': '27635008',
              'name': 'Aching pain',
              'description': 'finding',
              'category': 'Search Results',
              'best_similarity': 0.3,
              'priority': null,
              'priority_by_virtue_of_matching_warning_sign': null,
            },
          ],
          'has_next_page': false,
          'search_terms': {
            'age_determination': 'adult',
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
        const { fetchJSON } = await addTestEmployeeWithSession(db, {
          role: 'nurse',
          organization_id: clinic.id,
        })

        const { results } = await fetchJSON(
          `/app/snomed/warning-signs?age_determination=adult&search=appendicular+pain`,
        )

        assertEquals(results[0], {
          'clinical_finding_s_expression': '(clinical_finding (snomed_concept "Appendicular pain" "finding"))',
          'snomed_concept_id': '275406005',
          'name': 'Appendicular pain',
          'description': 'finding',
          'priority': 'Urgent',
          'priority_by_virtue_of_matching_warning_sign': 'Abdominal pain',
          'best_similarity': 1,
          'category': 'Search Results',
        })
      },
    )

    itParallel(
      'responds to a search for appendicular pain for a pregnant person, which has priority Very urgent by virtue of it being a descendant of Abdominal pain',
      async () => {
        const clinic = await createTestOrganization(db)
        const { fetchJSON } = await addTestEmployeeWithSession(db, {
          role: 'nurse',
          organization_id: clinic.id,
        })

        const { results } = await fetchJSON(
          `/app/snomed/warning-signs?age_determination=adult&pregnancy=true&search=appendicular+pain`,
        )

        assertEquals(results[0], {
          'clinical_finding_s_expression': '(clinical_finding (snomed_concept "Appendicular pain" "finding"))',
          'snomed_concept_id': '275406005',
          'name': 'Appendicular pain',
          'description': 'finding',
          'priority': 'Very urgent',
          'priority_by_virtue_of_matching_warning_sign': 'Pregnancy and abdominal pain',
          'best_similarity': 1,
          'category': 'Search Results',
        })
      },
    )
  })
})
