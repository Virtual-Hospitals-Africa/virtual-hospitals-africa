import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { afterAll } from 'std/testing/bdd.ts'
import db from '../../db/db.ts'
import { snomed_warning_signs } from '../../db/models/snomed_warning_signs.ts'
import { nameAndCategorySnomedConceptBase } from '../../db/models/s_expression.ts'
import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import findMatching from '../../util/findMatching.ts'

describeParallel('db/models/snomed_warning_signs.ts', () => {
  afterAll(() => db.destroy())

  describeParallel('priority', () => {
    itParallel('assigns a warning sign priority to the sign concept and its descendants', async () => {
      const { results } = await snomed_warning_signs.search(db, {
        search: 'cardiac arrest',
        age_determination: 'adult',
      })

      const cardiac_arrest = findMatching(results, { name: 'Cardiac arrest' })
      assertEquals(cardiac_arrest.priority, 'Emergency')
      assertEquals(cardiac_arrest.priority_by_virtue_of_matching_warning_sign, 'Cardiac arrest')

      // Bradycardic cardiac arrest is a descendant of Cardiac arrest, so it inherits the sign
      const descendant = findMatching(results, { name: 'Bradycardic cardiac arrest' })
      assertEquals(descendant.priority, 'Emergency')
      assertEquals(descendant.priority_by_virtue_of_matching_warning_sign, 'Cardiac arrest')
    })

    itParallel('only applies a sign to the age determination it was defined for', async () => {
      const { results } = await snomed_warning_signs.search(db, {
        search: 'cardiac arrest',
        age_determination: 'younger child',
      })

      const cardiac_arrest = findMatching(results, { name: 'Cardiac arrest' })
      assertEquals(cardiac_arrest.priority, null)
      assertEquals(cardiac_arrest.priority_by_virtue_of_matching_warning_sign, null)
    })

    itParallel('leaves priority null for a finding that matches no warning sign', async () => {
      const { results } = await snomed_warning_signs.search(db, {
        search: 'seizure',
        age_determination: 'adult',
      })

      const seizure = findMatching(results, { name: 'Seizure' })
      assertEquals(seizure.priority, 'Emergency')

      const seizure_free = findMatching(results, { name: 'Seizure free' })
      assertEquals(seizure_free.priority, null)
      assertEquals(seizure_free.priority_by_virtue_of_matching_warning_sign, null)
    })

    itParallel('escalates to the pregnancy-specific sign when pregnancy is set', async () => {
      const { results: not_pregnant } = await snomed_warning_signs.search(db, {
        search: 'abdominal pain',
        age_determination: 'adult',
      })

      const abdominal_pain = findMatching(not_pregnant, { name: 'Abdominal pain' })
      assertEquals(abdominal_pain.priority, 'Urgent')
      assertEquals(abdominal_pain.priority_by_virtue_of_matching_warning_sign, 'Abdominal pain')

      const { results: pregnant } = await snomed_warning_signs.search(db, {
        search: 'abdominal pain',
        age_determination: 'adult',
        pregnancy: true,
      })

      const abdominal_pain_pregnant = findMatching(pregnant, { name: 'Abdominal pain' })
      assertEquals(abdominal_pain_pregnant.priority, 'Very urgent')
      assertEquals(
        abdominal_pain_pregnant.priority_by_virtue_of_matching_warning_sign,
        'Pregnancy and abdominal pain',
      )
    })
  })

  describeParallel('finding_site', () => {
    itParallel('is null, and absent from the s_expression, when no site is chosen', async () => {
      const { results } = await snomed_warning_signs.search(db, {
        search: 'earache',
        age_determination: 'adult',
      })

      const pain_of_ear = findMatching(results, { name: 'Pain of ear' })
      assertEquals(pain_of_ear.chosen_finding_site, null)
      assertEquals(
        pain_of_ear.clinical_finding_s_expression,
        '(clinical_finding (snomed_concept "Pain of ear" "finding"))',
      )
    })

    itParallel("reports the concept's own site when it is within the chosen site", async () => {
      const { results } = await snomed_warning_signs.search(db, {
        search: 'earache',
        age_determination: 'adult',
        finding_site: 'Ear structure',
      })

      // Otalgia of left ear is predefined as sited in the left ear, which is more
      // specific than the chosen Ear structure, so that is what comes back. The site
      // is already implied by the concept, so it is left out of the s_expression.
      const left = findMatching(results, { name: 'Otalgia of left ear' })
      assertEquals(left.chosen_finding_site, { name: 'Left ear structure', category: 'body structure' })
      assertEquals(
        left.clinical_finding_s_expression,
        '(clinical_finding (snomed_concept "Otalgia of left ear" "finding"))',
      )
    })

    itParallel('reports the chosen site when it matches the predefined site exactly', async () => {
      const { results } = await snomed_warning_signs.search(db, {
        search: 'earache',
        age_determination: 'adult',
        finding_site: 'Ear structure',
      })

      const pain_of_ear = findMatching(results, { name: 'Pain of ear' })
      assertEquals(pain_of_ear.chosen_finding_site, { name: 'Ear structure', category: 'body structure' })
      assertEquals(
        pain_of_ear.clinical_finding_s_expression,
        '(clinical_finding (snomed_concept "Pain of ear" "finding"))',
      )
    })

    itParallel('names the chosen site in the s_expression when it is within the predefined site', async () => {
      const { results } = await snomed_warning_signs.search(db, {
        search: 'earache',
        age_determination: 'adult',
        finding_site: 'Left ear structure',
      })

      // Pain of ear is sited in the whole ear, which contains the chosen left ear.
      // The chosen site is the more specific of the two, so it is named explicitly.
      const pain_of_ear = findMatching(results, { name: 'Pain of ear (Left ear structure)' })
      assertEquals(pain_of_ear.chosen_finding_site, { name: 'Left ear structure', category: 'body structure' })
      assertEquals(
        pain_of_ear.clinical_finding_s_expression,
        '(clinical_finding (snomed_concept "Pain of ear" "finding") (finding_site (snomed_concept "Left ear structure" "body structure")))',
      )
    })

    itParallel('names the chosen site for a finding with no predefined site of its own', async () => {
      const { results } = await snomed_warning_signs.search(db, {
        search: 'pain',
        age_determination: 'adult',
        finding_site: 'Ear structure',
      })

      const headache = findMatching(results, { name: 'Headache (Ear structure)' })
      assertEquals(headache.chosen_finding_site, { name: 'Ear structure', category: 'body structure' })
      assertEquals(
        headache.clinical_finding_s_expression,
        '(clinical_finding (snomed_concept "Headache" "finding") (finding_site (snomed_concept "Ear structure" "body structure")))',
      )
    })

    itParallel('drops findings sited somewhere unrelated to the chosen site', async () => {
      const { results } = await snomed_warning_signs.search(db, {
        search: 'earache',
        age_determination: 'adult',
        finding_site: 'Knee region structure',
      })

      assertEquals(results, [])
    })

    itParallel('ranks findings within the chosen site first, then those around it, then those with no site', async () => {
      const { results } = await snomed_warning_signs.search(db, {
        search: 'swelling',
        age_determination: 'adult',
        finding_site: 'Ear structure',
      }, { rows_per_page: 15 })

      const names = results.map((r) => r.name)
      const indexOf = (name: string) => {
        const index = names.indexOf(name)
        assert(index !== -1, `${name} not among ${JSON.stringify(names)}`)
        return index
      }

      // Sited in the right ear, which is within the chosen ear
      const within = indexOf('Swelling of bilateral ears')
      // Sited in the head, which contains the chosen ear
      const around = indexOf('Swelling of head (Ear structure)')
      // No predefined site of its own
      const unsited = indexOf('Swelling (Ear structure)')

      assert(within < around, 'a finding within the chosen site outranks one sited around it')
      assert(around < unsited, 'a finding sited around the chosen site outranks one with no site')

      // The site ranking beats text similarity: the bare "Swelling" is the closest
      // match by name, and the one sited within the ear is the furthest, yet the
      // order is the other way around.
      assert(Number(results[unsited].best_similarity) > Number(results[within].best_similarity))
      assert(Number(results[around].best_similarity) > Number(results[within].best_similarity))
    })

    itParallel('drops a finding sited within an excluding_structure', async () => {
      // Pain of ear is sited in the ear, which is within the chosen head, so it comes back
      // under the head alone. A patient presenting with head symptoms does not mean their ear.
      const { results: without_exclusion } = await snomed_warning_signs.search(db, {
        search: 'earache',
        age_determination: 'adult',
        finding_site: 'Head structure',
      })
      assert(without_exclusion.some((result) => result.name === 'Pain of ear'))

      const { results } = await snomed_warning_signs.search(db, {
        search: 'earache',
        age_determination: 'adult',
        finding_site: 'Head structure',
        excluding_structures: ['Ear structure'],
      })
      assert(!results.some((result) => result.name === 'Pain of ear'))
    })

    itParallel('keeps a finding with no predefined site of its own when structures are excluded', async () => {
      const { results } = await snomed_warning_signs.search(db, {
        search: 'headache',
        age_determination: 'adult',
        finding_site: 'Head structure',
        excluding_structures: ['Ear structure', 'Structure of eye proper'],
      })

      const headache = findMatching(results, { name: 'Headache' })
      assertEquals(headache.chosen_finding_site, { name: 'Head structure', category: 'body structure' })
    })

    itParallel('drops a finding sited within a descendant of an excluding_structure', async () => {
      const { results } = await snomed_warning_signs.search(db, {
        search: 'earache',
        age_determination: 'adult',
        finding_site: 'Head structure',
        excluding_structures: ['Ear structure'],
      })

      // Otalgia of left ear is sited in the left ear, which is within the excluded ear
      assert(!results.some((result) => result.name === 'Otalgia of left ear'))
    })

    itParallel('ignores an excluding_structure that names no body structure', async () => {
      const { results } = await snomed_warning_signs.search(db, {
        search: 'earache',
        age_determination: 'adult',
        finding_site: 'Ear structure',
        excluding_structures: ['Not a real body structure'],
      })

      const pain_of_ear = findMatching(results, { name: 'Pain of ear' })
      assertEquals(pain_of_ear.chosen_finding_site, { name: 'Ear structure', category: 'body structure' })
    })

    itParallel('keeps a finding an including_s_expression claims though its site lies outside the chosen site', async () => {
      // Optic neuritis is sited in the optic nerve, which is not within the eye proper, so the eye alone drops it
      const { results: without_inclusion } = await snomed_warning_signs.search(db, {
        search: 'optic neuritis',
        age_determination: 'adult',
        finding_site: 'Structure of eye proper',
      })
      assert(!without_inclusion.some((result) => result.name === 'Optic neuritis'))

      // The optic nerve is part of the visual system, which the eye page claims for itself
      const { results } = await snomed_warning_signs.search(db, {
        search: 'optic neuritis',
        age_determination: 'adult',
        finding_site: 'Structure of eye proper',
        including_s_expressions: ['(finding (finding_site "Structure of visual system"))'],
      })

      // Its own site stands: naming the chosen eye would misplace it, so the s_expression leaves the site implied
      const optic_neuritis = findMatching(results, { name: 'Optic neuritis' })
      assertEquals(optic_neuritis.chosen_finding_site, { name: 'Optic nerve structure', category: 'body structure' })
      assertEquals(
        optic_neuritis.clinical_finding_s_expression,
        '(clinical_finding (snomed_concept "Optic neuritis" "disorder"))',
      )
    })

    itParallel('ranks an included finding alongside those sited within the chosen site', async () => {
      const { results } = await snomed_warning_signs.search(db, {
        search: 'neuritis',
        age_determination: 'adult',
        finding_site: 'Structure of eye proper',
        including_s_expressions: ['(finding (finding_site "Structure of visual system"))'],
      }, { rows_per_page: 20 })

      const names = results.map((r) => r.name)
      const indexOf = (name: string) => {
        const index = names.indexOf(name)
        assert(index !== -1, `${name} not among ${JSON.stringify(names)}`)
        return index
      }

      const included = indexOf('Retrobulbar optic neuritis of bilateral eyes')
      const unsited = indexOf('Infantile poisoning caused by mercury (Structure of eye proper)')
      assert(included < unsited, 'an included finding outranks one with no site')
      // Despite the unsited finding being the closer match by name
      assert(Number(results[unsited].best_similarity) > Number(results[included].best_similarity))
    })

    itParallel('still drops an included finding sited within an excluding_structure', async () => {
      const { results } = await snomed_warning_signs.search(db, {
        search: 'optic neuritis',
        age_determination: 'adult',
        finding_site: 'Structure of eye proper',
        including_s_expressions: ['(finding (finding_site "Structure of visual system"))'],
        excluding_structures: ['Optic nerve structure'],
      })

      assert(!results.some((result) => result.name === 'Optic neuritis'))
      // The optic nerve sheath is not within the optic nerve, so its neuritis stays
      assert(results.some((result) => result.name === 'Optic perineuritis'))
    })

    itParallel('leaves the results alone when no including_s_expression matches', async () => {
      const { results: plain } = await snomed_warning_signs.search(db, {
        search: 'earache',
        age_determination: 'adult',
        finding_site: 'Ear structure',
      })
      const { results } = await snomed_warning_signs.search(db, {
        search: 'earache',
        age_determination: 'adult',
        finding_site: 'Ear structure',
        including_s_expressions: ['(finding (finding_site "Structure of visual system"))'],
      })
      assertEquals(results.map((r) => r.name), plain.map((r) => r.name))
    })

    itParallel('ignores a finding_site that names no body structure', async () => {
      const { results } = await snomed_warning_signs.search(db, {
        search: 'earache',
        age_determination: 'adult',
        finding_site: 'Not a real body structure',
      })

      const pain_of_ear = findMatching(results, { name: 'Pain of ear' })
      assertEquals(pain_of_ear.chosen_finding_site, null)
      assertEquals(
        pain_of_ear.clinical_finding_s_expression,
        '(clinical_finding (snomed_concept "Pain of ear" "finding"))',
      )
    })
  })

  describeParallel('modifiers', () => {
    itParallel('flags onset_required for a concept some rule compares against a duration', async () => {
      const { results } = await snomed_warning_signs.search(db, {
        search: 'constipation',
        age_determination: 'adult',
      })

      const constipation = findMatching(results, { name: 'Constipation' })
      assert(constipation.onset_required)

      // Acute constipation is a descendant, so it inherits the requirement
      const acute = findMatching(results, { name: 'Acute constipation' })
      assert(acute.onset_required)
    })

    itParallel('includes predefined attributes and relevant qualifiers', async () => {
      const { results } = await snomed_warning_signs.search(db, {
        search: 'cardiac arrest',
        age_determination: 'adult',
      })

      const cardiac_arrest = findMatching(results, { name: 'Cardiac arrest' })
      assert(!cardiac_arrest.onset_required)
      assertEquals(cardiac_arrest.predefined_attributes, [{
        s_expression: '(attribute (snomed_concept "Finding site" "attribute") (snomed_concept "Cardiac conducting system structure" "body structure"))',
      }])
      assertEquals(cardiac_arrest.relevant_qualifiers, [])

      const due_to_trauma = findMatching(results, { name: 'Cardiac arrest due to trauma' })
      assertEquals(due_to_trauma.relevant_qualifiers, [{
        s_expression: '(qualifier (snomed_concept "Recent" "qualifier value"))',
      }])
    })
  })

  describeParallel('snomed_concept_id', () => {
    itParallel('finds a single concept without a text search', async () => {
      const cardiac_arrest = await snomed_warning_signs.findOne(db, {
        snomed_concept_id: nameAndCategorySnomedConceptBase(db, {
          atom: 'snomed_concept',
          name: 'Cardiac arrest',
          category: 'disorder',
        }),
        age_determination: 'adult',
      })

      assertEquals(cardiac_arrest.name, 'Cardiac arrest')
      assertEquals(cardiac_arrest.snomed_concept_id, '410429000')
      assertEquals(cardiac_arrest.description, 'disorder')
      assertEquals(cardiac_arrest.category, 'Search Results')
      assertEquals(cardiac_arrest.priority, 'Emergency')
      assertEquals(cardiac_arrest.priority_by_virtue_of_matching_warning_sign, 'Cardiac arrest')
    })
  })
})
