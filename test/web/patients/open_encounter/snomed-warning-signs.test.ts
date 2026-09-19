import { afterAll, before } from 'std/testing/bdd.ts'
import db from '../../../../db/db.ts'
import { addTestEmployeeWithSession } from 'test/_helpers/employees.ts'
import { createTestOrganization } from 'test/_helpers/organizations.ts'
import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import waitUntilTestServerUp from 'test/_helpers/waitUntilTestServerUp.ts'
import { assertMatches } from '../../../../util/assertMatches.ts'
import z from 'zod'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'

describeParallel('/app/snomed/warning-signs', () => {
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

        assertMatches(first_page, {
          'page': 1,
          'rows_per_page': 10,
          'results': [
            {
              'clinical_finding_s_expression': '(clinical_finding (snomed_concept "Pain of ear" "finding"))',
              'snomed_concept_id': '301354004',
              'name': 'Pain of ear',
              'description': 'finding',
              'category': 'Search Results',
              'best_similarity': z.number(),
              'priority': null,
              'priority_by_virtue_of_matching_warning_sign': null,
            },
            {
              'clinical_finding_s_expression': '(clinical_finding (snomed_concept "Otalgia of left ear" "finding"))',
              'snomed_concept_id': '1010233001',
              'name': 'Otalgia of left ear',
              'description': 'finding',
              'category': 'Search Results',
              'best_similarity': z.number(),
              'priority': null,
              'priority_by_virtue_of_matching_warning_sign': null,
            },
            {
              'clinical_finding_s_expression': '(clinical_finding (snomed_concept "Bilateral earache" "finding"))',
              'snomed_concept_id': '162359003',
              'name': 'Bilateral earache',
              'description': 'finding',
              'category': 'Search Results',
              'best_similarity': z.number(),
              'priority': null,
              'priority_by_virtue_of_matching_warning_sign': null,
            },
            {
              'clinical_finding_s_expression': '(clinical_finding (snomed_concept "Otalgia of right ear" "finding"))',
              'snomed_concept_id': '1010234007',
              'name': 'Otalgia of right ear',
              'description': 'finding',
              'category': 'Search Results',
              'best_similarity': z.number(),
              'priority': null,
              'priority_by_virtue_of_matching_warning_sign': null,
            },
          ],
          'has_next_page': false,
          'search_terms': {
            'age_determination': 'adult',
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

        assertMatches(results[0], {
          'clinical_finding_s_expression': '(clinical_finding (snomed_concept "Appendicular pain" "finding"))',
          'snomed_concept_id': '275406005',
          'name': 'Appendicular pain',
          'description': 'finding',
          'priority': 'Urgent',
          'priority_by_virtue_of_matching_warning_sign': 'Abdominal pain',
          'best_similarity': z.number(),
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

        assertMatches(results[0], {
          'clinical_finding_s_expression': '(clinical_finding (snomed_concept "Appendicular pain" "finding"))',
          'snomed_concept_id': '275406005',
          'name': 'Appendicular pain',
          'description': 'finding',
          'priority': 'Very urgent',
          'priority_by_virtue_of_matching_warning_sign': 'Pregnancy and abdominal pain',
          'best_similarity': z.number(),
          'category': 'Search Results',
        })
      },
    )
  })

  describeParallel('GET with finding_site', () => {
    const EAR_SITE = '(finding_site (snomed_concept "Ear structure" "body structure"))'

    itParallel(
      'ranks findings whose predefined site matches first, drops findings of other sites, and lends the site to findings with none',
      async () => {
        const clinic = await createTestOrganization(db)
        const { fetchJSON } = await addTestEmployeeWithSession(db, {
          role: 'nurse',
          organization_id: clinic.id,
        })

        const { results } = await fetchJSON(
          `/app/snomed/warning-signs?age_determination=adult&search=pain&finding_site=Ear+structure`,
        )

        const byName = (name: string) => {
          const result = results.find((result: { name: string }) => result.name === name)
          assert(result, `No result named ${name} among ${results.map((result: { name: string }) => result.name).join(', ')}`)
          return result
        }

        // Pain of ear sits in Ear structure exactly, so it is the site's own finding, unaltered
        const pain_of_ear = byName('Pain of ear')
        assertMatches(pain_of_ear, {
          'clinical_finding_s_expression': '(clinical_finding (snomed_concept "Pain of ear" "finding"))',
          'finding_site': { name: 'Ear structure', category: 'body structure' },
          'category': 'Search Results',
        })

        // Chest pain sits in the thorax, which is neither within nor around the ear
        assert(!results.some((result: { name: string }) => result.name === 'Chest pain'))

        // Headache sits in the head, which contains the ear, so the ear is the more specific site
        const headache = byName('Headache (Ear structure)')
        assertMatches(headache, {
          'clinical_finding_s_expression': `(clinical_finding (snomed_concept "Headache" "finding") ${EAR_SITE})`,
          'finding_site': { name: 'Ear structure', category: 'body structure' },
        })

        // Findings within the ear rank ahead of those around it, which rank ahead of those sited nowhere
        const tier = (result: { clinical_finding_s_expression: string; predefined_attributes: { s_expression: string }[] }) => {
          if (!result.clinical_finding_s_expression.includes(EAR_SITE)) return 2
          return result.predefined_attributes.some((attribute) => attribute.s_expression.includes('"Finding site"')) ? 1 : 0
        }
        const tiers = results.map(tier)
        assertEquals(tiers, [...tiers].sort((a, b) => b - a), results.map((result: { name: string }) => result.name).join(', '))
        assert(tiers.includes(2) && tiers.includes(1), tiers.join(','))
        assert(results.indexOf(pain_of_ear) < results.indexOf(headache))
      },
    )

    itParallel(
      'lends the site to a finding with no site of its own',
      async () => {
        const clinic = await createTestOrganization(db)
        const { fetchJSON } = await addTestEmployeeWithSession(db, {
          role: 'nurse',
          organization_id: clinic.id,
        })

        const { results } = await fetchJSON(
          `/app/snomed/warning-signs?age_determination=adult&snomed_concept_id=22253000&finding_site=Ear+structure`,
        )

        assertEquals(results.length, 1)
        assertMatches(results[0], {
          'clinical_finding_s_expression': `(clinical_finding (snomed_concept "Pain" "finding") ${EAR_SITE})`,
          'name': 'Pain (Ear structure)',
          'finding_site': { name: 'Ear structure', category: 'body structure' },
        })
      },
    )

    itParallel(
      'keeps a predefined site narrower than the one chosen',
      async () => {
        const clinic = await createTestOrganization(db)
        const { fetchJSON } = await addTestEmployeeWithSession(db, {
          role: 'nurse',
          organization_id: clinic.id,
        })

        const { results } = await fetchJSON(
          `/app/snomed/warning-signs?age_determination=adult&search=earache&finding_site=Ear+structure`,
        )

        // Otalgia of left ear sits in the left ear, which is more specific than the ear, so keeps its own site
        const left = results.find((result: { name: string }) => result.name === 'Otalgia of left ear')
        assertMatches(left, {
          'clinical_finding_s_expression': '(clinical_finding (snomed_concept "Otalgia of left ear" "finding"))',
          'finding_site': { name: 'Left ear structure', category: 'body structure' },
        })
      },
    )

    itParallel(
      'lends the site to a finding whose predefined site is broader than the one chosen',
      async () => {
        const clinic = await createTestOrganization(db)
        const { fetchJSON } = await addTestEmployeeWithSession(db, {
          role: 'nurse',
          organization_id: clinic.id,
        })

        const { results } = await fetchJSON(
          `/app/snomed/warning-signs?age_determination=adult&search=hearing+difficulty&finding_site=Ear+structure`,
        )

        // Hearing difficulty sits in the auditory system, of which the ear is a part
        const hearing_difficulty = results.find((result: { name: string }) => result.name === 'Hearing difficulty (Ear structure)')
        assertMatches(hearing_difficulty, {
          'clinical_finding_s_expression': `(clinical_finding (snomed_concept "Hearing difficulty" "finding") ${EAR_SITE})`,
          'finding_site': { name: 'Ear structure', category: 'body structure' },
        })
      },
    )

    itParallel(
      'sends no finding_site when none was chosen',
      async () => {
        const clinic = await createTestOrganization(db)
        const { fetchJSON } = await addTestEmployeeWithSession(db, {
          role: 'nurse',
          organization_id: clinic.id,
        })

        const { results } = await fetchJSON(
          `/app/snomed/warning-signs?age_determination=adult&search=chest+pain`,
        )

        assertMatches(results[0], {
          'name': 'Chest pain',
          'finding_site': null,
        })
      },
    )
  })

  itParallel(
    'responds to a search for runny nose returning nasal discharge',
    async () => {
      const clinic = await createTestOrganization(db)
      const { fetchJSON } = await addTestEmployeeWithSession(db, {
        role: 'nurse',
        organization_id: clinic.id,
      })

      const { results } = await fetchJSON(
        `/app/snomed/warning-signs?age_determination=adult&pregnancy=true&search=runny+nose`,
      )

      assertMatches(results[0], {
        'clinical_finding_s_expression': '(clinical_finding (snomed_concept "Nasal discharge" "finding"))',
        'snomed_concept_id': '64531003',
        'name': 'Nasal discharge',
        'description': 'finding',
        'priority': null,
        'priority_by_virtue_of_matching_warning_sign': null,
        'best_similarity': z.number(),
        'category': 'Search Results',
      })
    },
  )
})
